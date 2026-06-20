const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const LeavePolicy = require('../models/LeavePolicy');
const { sendEmail } = require('../config/mailer');

// Helper to calculate business/calendar days between two dates (inclusive)
const calculateLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set times to midnight to avoid time zone offsets messing up calculations
  start.setHours(0,0,0,0);
  end.setHours(0,0,0,0);
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
  return diffDays;
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Employee, Manager, Admin)
const applyLeave = async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;

  try {
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    // 1. Verify policy exists
    const policy = await LeavePolicy.findById(leaveType);
    if (!policy) {
      return res.status(404).json({ message: 'Leave type policy not found' });
    }

    // 2. Fetch employee with full details
    const employee = await User.findById(req.user._id);
    const balanceEntry = employee.leaveBalances.find(
      (b) => b.leaveType.toString() === leaveType.toString()
    );

    if (!balanceEntry) {
      return res.status(400).json({ message: 'Leave balance not initialized for this type' });
    }

    const duration = calculateLeaveDays(startDate, endDate);
    const remaining = balanceEntry.allocated - balanceEntry.used;

    // 3. Check balance
    if (duration > remaining) {
      return res.status(400).json({ 
        message: `Insufficient leave balance. You requested ${duration} days, but only have ${remaining} days left for ${policy.name}.` 
      });
    }

    // 4. Check for overlapping requests
    const overlappingRequest = await LeaveRequest.findOne({
      employee: req.user._id,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingRequest) {
      return res.status(400).json({ 
        message: 'You already have an active (pending/approved) leave request for these dates.' 
      });
    }

    // Handle attachment
    let attachmentPath = '';
    if (req.file) {
      // Store relative path for serving
      attachmentPath = `/uploads/${req.file.filename}`;
    }

    // 5. Create Request
    const leaveRequest = await LeaveRequest.create({
      employee: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      attachment: attachmentPath,
      status: 'Pending'
    });

    // Populate employee details for response
    const populatedRequest = await LeaveRequest.findById(leaveRequest._id)
      .populate('employee', 'name email manager role')
      .populate('leaveType', 'name');

    // 6. Notify Manager via email
    if (employee.manager) {
      const managerUser = await User.findById(employee.manager);
      if (managerUser) {
        const formattedStart = start.toLocaleDateString();
        const formattedEnd = end.toLocaleDateString();
        await sendEmail({
          to: managerUser.email,
          subject: `New Leave Request from ${employee.name}`,
          text: `${employee.name} has applied for ${policy.name} from ${formattedStart} to ${formattedEnd} (${duration} days). Reason: ${reason}. Please log into the portal to review.`,
          html: `
            <h3>New Leave Request Received</h3>
            <p><strong>Employee:</strong> ${employee.name}</p>
            <p><strong>Leave Type:</strong> ${policy.name}</p>
            <p><strong>Duration:</strong> ${formattedStart} to ${formattedEnd} (${duration} days)</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <br/>
            <p>Please log into the Leave Management Portal to Approve or Reject this request.</p>
          `
        });
      }
    }

    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leave requests
// @route   GET /api/leaves
// @access  Private
const getLeaves = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'Employee') {
      // Employees only see their own requests
      filter.employee = req.user._id;
    } else if (req.user.role === 'Manager') {
      // Managers see their own requests and requests from employees they manage
      const teamEmployees = await User.find({ manager: req.user._id }).select('_id');
      const teamIds = teamEmployees.map((emp) => emp._id);
      filter = {
        $or: [
          { employee: req.user._id },
          { employee: { $in: teamIds } }
        ]
      };
    } else if (req.user.role === 'Admin') {
      // Admins see all requests
      filter = {};
    }

    const requests = await LeaveRequest.find(filter)
      .populate({
        path: 'employee',
        select: 'name email role status',
        populate: { path: 'department', select: 'name' }
      })
      .populate('leaveType', 'name')
      .populate('approvedBy', 'name')
      .sort({ appliedAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or Reject leave request
// @route   PUT /api/leaves/:id/action
// @access  Private (Manager, Admin)
const actionLeave = async (req, res) => {
  const { action, comments } = req.body; // action: Approved or Rejected

  try {
    if (!['Approved', 'Rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be "Approved" or "Rejected"' });
    }

    const leaveRequest = await LeaveRequest.findById(req.params.id)
      .populate('employee')
      .populate('leaveType');

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({ message: 'Leave request has already been actioned' });
    }

    // Authorization check: User must be Admin OR the direct manager of the employee
    const isManager = leaveRequest.employee.manager?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isManager && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to approve/reject this leave request' });
    }

    const duration = calculateLeaveDays(leaveRequest.startDate, leaveRequest.endDate);

    if (action === 'Approved') {
      // Double check balance
      const employee = await User.findById(leaveRequest.employee._id);
      const balanceIdx = employee.leaveBalances.findIndex(
        (b) => b.leaveType.toString() === leaveRequest.leaveType._id.toString()
      );

      if (balanceIdx === -1) {
        return res.status(400).json({ message: 'Leave balance not initialized for employee' });
      }

      const balance = employee.leaveBalances[balanceIdx];
      const remaining = balance.allocated - balance.used;

      if (duration > remaining) {
        return res.status(400).json({ 
          message: `Cannot approve request: employee only has ${remaining} days remaining, but request requires ${duration} days.` 
        });
      }

      // Deduct/Use the leave days
      employee.leaveBalances[balanceIdx].used += duration;
      await employee.save();
    }

    // Update request status
    leaveRequest.status = action;
    leaveRequest.comments = comments || '';
    leaveRequest.approvedBy = req.user._id;

    await leaveRequest.save();

    // Notify employee via email
    const formattedStart = new Date(leaveRequest.startDate).toLocaleDateString();
    const formattedEnd = new Date(leaveRequest.endDate).toLocaleDateString();
    
    await sendEmail({
      to: leaveRequest.employee.email,
      subject: `Leave Request Update: ${action}`,
      text: `Your request for ${leaveRequest.leaveType.name} from ${formattedStart} to ${formattedEnd} has been ${action} by ${req.user.name}. Comments: ${comments || 'None'}.`,
      html: `
        <h3>Leave Request Status Update</h3>
        <p>Hello ${leaveRequest.employee.name},</p>
        <p>Your request for <strong>${leaveRequest.leaveType.name}</strong> has been updated.</p>
        <p><strong>Duration:</strong> ${formattedStart} to ${formattedEnd} (${duration} days)</p>
        <p><strong>Status:</strong> <span style="font-weight: bold; color: ${action === 'Approved' ? 'green' : 'red'};">${action}</span></p>
        <p><strong>Reviewer:</strong> ${req.user.name}</p>
        <p><strong>Reviewer Comments:</strong> ${comments || 'No comments provided'}</p>
        <br/>
        <p>Thank you,</p>
        <p>HR Department</p>
      `
    });

    const populatedResponse = await LeaveRequest.findById(leaveRequest._id)
      .populate({
        path: 'employee',
        select: 'name email role status',
        populate: { path: 'department', select: 'name' }
      })
      .populate('leaveType', 'name')
      .populate('approvedBy', 'name');

    res.json(populatedResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leave statistics/dashboard analytics
// @route   GET /api/leaves/stats
// @access  Private
const getLeaveStats = async (req, res) => {
  try {
    const role = req.user.role;

    if (role === 'Employee') {
      const requests = await LeaveRequest.find({ employee: req.user._id });
      const user = await User.findById(req.user._id).populate('leaveBalances.leaveType');

      const totalApplied = requests.length;
      const approvedCount = requests.filter(r => r.status === 'Approved').length;
      const pendingCount = requests.filter(r => r.status === 'Pending').length;
      const rejectedCount = requests.filter(r => r.status === 'Rejected').length;

      const balances = user.leaveBalances.map(b => ({
        leaveType: b.leaveType?.name || 'Unknown',
        allocated: b.allocated,
        used: b.used,
        remaining: b.allocated - b.used,
      }));

      return res.json({
        role,
        stats: {
          totalApplied,
          approved: approvedCount,
          pending: pendingCount,
          rejected: rejectedCount,
        },
        balances,
      });
    }

    if (role === 'Manager') {
      // Find all employees managed by this user
      const employees = await User.find({ manager: req.user._id }).select('_id');
      const employeeIds = employees.map(emp => emp._id);

      // Include manager's own requests in total analytics, but focus count on managed team
      const teamRequests = await LeaveRequest.find({ employee: { $in: employeeIds } });
      const pendingCount = teamRequests.filter(r => r.status === 'Pending').length;
      const approvedCount = teamRequests.filter(r => r.status === 'Approved').length;
      const rejectedCount = teamRequests.filter(r => r.status === 'Rejected').length;

      // Find who is on leave today
      const today = new Date();
      today.setHours(0,0,0,0);
      const onLeaveToday = await LeaveRequest.find({
        employee: { $in: employeeIds },
        status: 'Approved',
        startDate: { $lte: today },
        endDate: { $gte: today }
      }).populate('employee', 'name email');

      return res.json({
        role,
        stats: {
          teamSize: employees.length,
          pendingApprovals: pendingCount,
          approvedThisYear: approvedCount,
          rejectedThisYear: rejectedCount,
        },
        onLeaveToday,
      });
    }

    if (role === 'Admin') {
      const totalEmployees = await User.countDocuments({});
      const totalDepartments = await User.distinct('department').then(depts => depts.filter(d => d != null).length);
      const allRequests = await LeaveRequest.find({});

      const pendingCount = allRequests.filter(r => r.status === 'Pending').length;
      const approvedCount = allRequests.filter(r => r.status === 'Approved').length;
      const rejectedCount = allRequests.filter(r => r.status === 'Rejected').length;

      // Department-wise leave distribution (for approved leaves)
      const deptLeaves = await LeaveRequest.find({ status: 'Approved' })
        .populate({
          path: 'employee',
          populate: { path: 'department' }
        });

      const departmentBreakdown = {};
      deptLeaves.forEach(req => {
        if (req.employee && req.employee.department) {
          const deptName = req.employee.department.name;
          const days = calculateLeaveDays(req.startDate, req.endDate);
          departmentBreakdown[deptName] = (departmentBreakdown[deptName] || 0) + days;
        }
      });

      const departmentChartData = Object.keys(departmentBreakdown).map(name => ({
        name,
        days: departmentBreakdown[name],
      }));

      // Monthly request trends (this year)
      const currentYear = new Date().getFullYear();
      const monthlyData = Array(12).fill(0).map((_, i) => ({
        month: new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' }),
        leaves: 0
      }));

      allRequests.forEach(req => {
        const date = new Date(req.appliedAt);
        if (date.getFullYear() === currentYear && req.status === 'Approved') {
          const monthIdx = date.getMonth();
          monthlyData[monthIdx].leaves += calculateLeaveDays(req.startDate, req.endDate);
        }
      });

      return res.json({
        role,
        stats: {
          totalEmployees,
          totalDepartments,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
        },
        departmentChartData,
        monthlyChartData: monthlyData,
      });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  actionLeave,
  getLeaveStats,
};
