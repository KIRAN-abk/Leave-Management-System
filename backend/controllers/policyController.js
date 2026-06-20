const LeavePolicy = require('../models/LeavePolicy');
const User = require('../models/User');

// @desc    Get all leave policies
// @route   GET /api/policies
// @access  Private
const getPolicies = async (req, res) => {
  try {
    const policies = await LeavePolicy.find({});
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a leave policy
// @route   POST /api/policies
// @access  Private (Admin)
const createPolicy = async (req, res) => {
  const { name, days, description } = req.body;

  try {
    const policyExists = await LeavePolicy.findOne({ name });
    if (policyExists) {
      return res.status(400).json({ message: 'Leave policy already exists' });
    }

    const policy = await LeavePolicy.create({
      name,
      days,
      description,
    });

    // Update all existing users with the new leave policy balance
    await User.updateMany(
      { "leaveBalances.leaveType": { $ne: policy._id } },
      {
        $push: {
          leaveBalances: {
            leaveType: policy._id,
            allocated: policy.days,
            used: 0
          }
        }
      }
    );

    res.status(201).json(policy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a leave policy
// @route   PUT /api/policies/:id
// @access  Private (Admin)
const updatePolicy = async (req, res) => {
  const { name, days, description } = req.body;

  try {
    const policy = await LeavePolicy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({ message: 'Leave policy not found' });
    }

    policy.name = name || policy.name;
    const oldDays = policy.days;
    policy.days = days !== undefined ? days : policy.days;
    policy.description = description !== undefined ? description : policy.description;

    const updatedPolicy = await policy.save();

    // If allocated days changed, we might want to update the allocated balance for users.
    // Let's update the allocated days for users who haven't exceeded the new count, or just update all.
    // We update the allocated days in all user balances matching this policy ID.
    if (days !== undefined && oldDays !== days) {
      await User.updateMany(
        { "leaveBalances.leaveType": policy._id },
        { $set: { "leaveBalances.$[elem].allocated": days } },
        { arrayFilters: [{ "elem.leaveType": policy._id }] }
      );
    }

    res.json(updatedPolicy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a leave policy
// @route   DELETE /api/policies/:id
// @access  Private (Admin)
const deletePolicy = async (req, res) => {
  try {
    const policy = await LeavePolicy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({ message: 'Leave policy not found' });
    }

    // Pull this policy from all users' leave balances
    await User.updateMany(
      {},
      { $pull: { leaveBalances: { leaveType: req.params.id } } }
    );

    await LeavePolicy.findByIdAndDelete(req.params.id);

    res.json({ message: 'Leave policy deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
};
