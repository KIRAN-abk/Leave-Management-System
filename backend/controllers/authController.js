const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_local_dev_123', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user and select password explicitly
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      if (user.status === 'Inactive') {
        return res.status(403).json({ message: 'Your account has been deactivated. Please contact your administrator.' });
      }

      // Populate user info for frontend initial store state
      const populatedUser = await User.findById(user._id)
        .populate('department', 'name')
        .populate('manager', 'name email')
        .populate('leaveBalances.leaveType', 'name days');

      res.json({
        token: generateToken(user._id),
        user: {
          _id: populatedUser._id,
          name: populatedUser.name,
          email: populatedUser.email,
          role: populatedUser.role,
          department: populatedUser.department,
          manager: populatedUser.manager,
          leaveBalances: populatedUser.leaveBalances,
          profileImage: populatedUser.profileImage,
          joinedDate: populatedUser.joinedDate,
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('department', 'name')
      .populate('manager', 'name email')
      .populate('leaveBalances.leaveType', 'name days');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please specify current and new passwords' });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password changed successfully' });
    } else {
      res.status(400).json({ message: 'Incorrect current password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user (self-signup)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Fetch all active leave policies to assign default balances
    const LeavePolicy = require('../models/LeavePolicy');
    const policies = await LeavePolicy.find({});
    const leaveBalances = policies.map((policy) => ({
      leaveType: policy._id,
      allocated: policy.days,
      used: 0,
    }));

    const user = new User({
      name,
      email,
      password,
      role: 'Employee', // Default role for self-signup
      department: null,
      manager: null,
      leaveBalances,
      status: 'Active',
      joinedDate: new Date(),
    });

    await user.save();

    // Populate user info for response
    const populatedUser = await User.findById(user._id)
      .populate('department', 'name')
      .populate('manager', 'name email')
      .populate('leaveBalances.leaveType', 'name days');

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        department: populatedUser.department,
        manager: populatedUser.manager,
        leaveBalances: populatedUser.leaveBalances,
        profileImage: populatedUser.profileImage,
        joinedDate: populatedUser.joinedDate,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
  getMe,
  changePassword,
  register,
};
