const User = require('../models/User');
const LeavePolicy = require('../models/LeavePolicy');
const LeaveRequest = require('../models/LeaveRequest');

// @desc    Get all employees/users with filtering
// @route   GET /api/employees
// @access  Private (Admin, Manager)
const getEmployees = async (req, res) => {
  const { department, role, status, manager } = req.query;
  const filter = {};

  if (department) filter.department = department;
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (manager) filter.manager = manager;

  try {
    // If the requesting user is a Manager, they should only see employees where they are the manager
    // unless they specify another query, but to be secure, let's let Managers view their reports.
    // Admin can see everything.
    if (req.user.role === 'Manager') {
      filter.manager = req.user._id;
    }

    const employees = await User.find(filter)
      .populate('department', 'name')
      .populate('manager', 'name email')
      .populate('leaveBalances.leaveType', 'name days');

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin)
const createEmployee = async (req, res) => {
  const { name, email, password, role, department, manager, status, joinedDate, profileImage } = req.body;

  try {
    const employeeExists = await User.findOne({ email });
    if (employeeExists) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    // Fetch all active leave policies to assign default balances
    const policies = await LeavePolicy.find({});
    const leaveBalances = policies.map((policy) => ({
      leaveType: policy._id,
      allocated: policy.days,
      used: 0,
    }));

    const employee = new User({
      name,
      email,
      password,
      role: role || 'Employee',
      department: department || null,
      manager: manager || null,
      leaveBalances,
      status: status || 'Active',
      joinedDate: joinedDate || Date.now(),
      profileImage: profileImage || '',
    });

    await employee.save();

    // Populate saved employee for response
    const populatedEmp = await User.findById(employee._id)
      .populate('department', 'name')
      .populate('manager', 'name email')
      .populate('leaveBalances.leaveType', 'name days');

    res.status(201).json({
      _id: populatedEmp._id,
      name: populatedEmp.name,
      email: populatedEmp.email,
      role: populatedEmp.role,
      department: populatedEmp.department,
      manager: populatedEmp.manager,
      leaveBalances: populatedEmp.leaveBalances,
      status: populatedEmp.status,
      joinedDate: populatedEmp.joinedDate,
      profileImage: populatedEmp.profileImage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin)
const updateEmployee = async (req, res) => {
  const { name, email, password, role, department, manager, status, joinedDate, profileImage } = req.body;

  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check email uniqueness if email changed
    if (email && email.toLowerCase() !== employee.email.toLowerCase()) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email address is already in use' });
      }
      employee.email = email;
    }

    employee.name = name || employee.name;
    employee.role = role || employee.role;
    employee.department = department !== undefined ? (department || null) : employee.department;
    employee.manager = manager !== undefined ? (manager || null) : employee.manager;
    employee.status = status || employee.status;
    employee.joinedDate = joinedDate || employee.joinedDate;
    employee.profileImage = profileImage !== undefined ? profileImage : employee.profileImage;

    // Only update password if provided
    if (password && password.trim() !== '') {
      employee.password = password;
    }

    // If leave balances are missing (e.g. employee created before policies), fix it
    const policies = await LeavePolicy.find({});
    policies.forEach((policy) => {
      const balanceExists = employee.leaveBalances.find(
        (b) => b.leaveType.toString() === policy._id.toString()
      );
      if (!balanceExists) {
        employee.leaveBalances.push({
          leaveType: policy._id,
          allocated: policy.days,
          used: 0
        });
      }
    });

    await employee.save();

    const populatedEmp = await User.findById(employee._id)
      .populate('department', 'name')
      .populate('manager', 'name email')
      .populate('leaveBalances.leaveType', 'name days');

    res.json({
      _id: populatedEmp._id,
      name: populatedEmp.name,
      email: populatedEmp.email,
      role: populatedEmp.role,
      department: populatedEmp.department,
      manager: populatedEmp.manager,
      leaveBalances: populatedEmp.leaveBalances,
      status: populatedEmp.status,
      joinedDate: populatedEmp.joinedDate,
      profileImage: populatedEmp.profileImage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Prevent deleting the last Admin (optional but good practice)
    if (employee.role === 'Admin') {
      const adminCount = await User.countDocuments({ role: 'Admin', status: 'Active' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last active Admin user' });
      }
    }

    // Delete associated leave requests
    await LeaveRequest.deleteMany({ employee: req.params.id });

    // Remove from other users' manager field
    await User.updateMany({ manager: req.params.id }, { manager: null });

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
