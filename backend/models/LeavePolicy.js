const mongoose = require('mongoose');

const LeavePolicySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Policy name is required'],
    unique: true,
    trim: true,
  },
  days: {
    type: Number,
    required: [true, 'Allocated days are required'],
    min: [0, 'Allocated days cannot be negative'],
  },
  description: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LeavePolicy', LeavePolicySchema);
