const mongoose = require('mongoose');

const LeaveRequestSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee reference is required'],
  },
  leaveType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeavePolicy',
    required: [true, 'Leave type is required'],
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  reason: {
    type: String,
    required: [true, 'Reason for leave is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  comments: {
    type: String,
    trim: true,
    default: '',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  attachment: {
    type: String,
    default: '',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);
