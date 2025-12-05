const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Employee',
    required: true
  },
  check_in: {
    type: Date,
    required: [true, 'Check-in time is required']
  },
  check_out: {
    type: Date,
    default: null
  },
  total_hours: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'absent', 'leave'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Instance method to check out
attendanceSchema.methods.checkOut = async function() {
  if (this.check_out) {
    throw new Error('Already checked out');
  }

  this.check_out = new Date();
  this.status = 'completed';

  // Calculate total hours
  const diffInMs = this.check_out - this.check_in;
  const diffInHours = diffInMs / (1000 * 60 * 60);
  this.total_hours = Math.round(diffInHours * 100) / 100;

  return this.save();
};

// Static method to find active attendance
attendanceSchema.statics.findActiveAttendance = function(employeeId) {
  return this.findOne({
    employee_id: employeeId,
    status: 'active'
  });
};

// Static method to check if already checked in today
attendanceSchema.statics.isAlreadyCheckedInToday = function(employeeId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return this.findOne({
    employee_id: employeeId,
    check_in: {
      $gte: today,
      $lt: tomorrow
    }
  });
};

// Static method to get employee attendance history
attendanceSchema.statics.getEmployeeAttendanceHistory = function(employeeId, options = {}) {
  const { startDate, endDate, page = 1, limit = 10 } = options;

  let query = { employee_id: employeeId };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  return this.find(query)
    .sort({ check_in: -1 })
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Attendance', attendanceSchema);