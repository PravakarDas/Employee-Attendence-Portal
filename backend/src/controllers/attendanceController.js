const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { getReliableTime, calculateDuration } = require('../utils/time');

// Check-in employee
const checkIn = async (req, res) => {
  try {
    const employeeId = req.employee._id;

    // Check if employee already checked in today
    const existingAttendance = await Attendance.isAlreadyCheckedInToday(employeeId);

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        error: 'Already checked in today'
      });
    }

    // Check if employee has active attendance (checked in but not out)
    const activeAttendance = await Attendance.findActiveAttendance(employeeId);

    if (activeAttendance) {
      return res.status(400).json({
        success: false,
        error: 'Already checked in. Please check out first.'
      });
    }

    // Get reliable timestamp from external source
    const checkInTime = await getReliableTime();

    // Create new attendance record with reliable timestamp
    const attendance = new Attendance({
      employee_id: employeeId,
      check_in: checkInTime,
      date: checkInTime // Store the date for the attendance record
    });

    await attendance.save();

    console.log(`Check-in recorded for employee ${employeeId} at ${checkInTime.toISOString()}`);

    // Populate employee data
    await attendance.populate('employee_id', 'name email department');

    res.status(201).json({
      success: true,
      message: 'Check-in successful',
      data: {
        attendance: {
          id: attendance._id,
          check_in: attendance.check_in,
          date: attendance.date,
          employee: attendance.employee_id
        }
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);

    // Handle duplicate key error (already checked in today)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Already checked in today'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Check-out employee
const checkOut = async (req, res) => {
  try {
    const employeeId = req.employee._id;

    // Find active attendance record
    const activeAttendance = await Attendance.findActiveAttendance(employeeId);

    if (!activeAttendance) {
      return res.status(400).json({
        success: false,
        error: 'No active check-in found. Please check in first.'
      });
    }

    // Get reliable timestamp from external source
    const checkOutTime = await getReliableTime();

    // Check out the attendance with reliable timestamp
    await activeAttendance.checkOut(checkOutTime);

    console.log(`Check-out recorded for employee ${employeeId} at ${checkOutTime.toISOString()}`);

    // Calculate duration for response
    const checkInTime = new Date(activeAttendance.check_in);
    const checkOutTimeStored = new Date(activeAttendance.check_out);
    const duration = checkOutTimeStored - checkInTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    res.status(200).json({
      success: true,
      message: 'Check-out successful',
      data: {
        attendance: {
          id: activeAttendance._id,
          check_in: activeAttendance.check_in,
          check_out: activeAttendance.check_out,
          total_hours: activeAttendance.total_hours,
          date: activeAttendance.date,
          duration: `${hours}h ${minutes}m`
        }
      }
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

// Get current attendance status
const getCurrentStatus = async (req, res) => {
  try {
    const employeeId = req.employee._id;

    // Find active attendance
    const activeAttendance = await Attendance.findActiveAttendance(employeeId);

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.findOne({
      employee_id: employeeId,
      check_in: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('employee_id', 'name email department');

    res.status(200).json({
      success: true,
      data: {
        isActive: !!activeAttendance,
        activeAttendance: activeAttendance ? {
          id: activeAttendance._id,
          check_in: activeAttendance.check_in,
          duration: Math.round((Date.now() - activeAttendance.check_in) / (1000 * 60 * 60) * 100) / 100
        } : null,
        todayAttendance
      }
    });
  } catch (error) {
    console.error('Get current status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get attendance history for specific employee
const getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { page, limit } = req.pagination;
    const { startDate, endDate } = req.query;

    // Build query options
    const options = {
      page,
      limit
    };

    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;

    // Get attendance history
    const attendance = await Attendance.getEmployeeAttendanceHistory(employeeId, options);

    // Get total count
    let query = { employee_id: employeeId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await Attendance.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        attendance,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: attendance.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get all attendance records (admin only)
const getAllAttendance = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const { employeeId, startDate, endDate, status } = req.query;

    // Build query
    let query = {};

    if (employeeId) {
      query.employee_id = employeeId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (status) {
      query.status = status;
    }

    // Get total count
    const total = await Attendance.countDocuments(query);

    // Get attendance records with pagination
    const attendance = await Attendance.find(query)
      .populate('employee_id', 'name email department role')
      .sort({ check_in: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        attendance,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: attendance.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get attendance statistics (admin only)
const getAttendanceStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Today's stats
    const todayStats = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: today,
            $lt: tomorrow
          }
        }
      },
      {
        $group: {
          _id: null,
          totalCheckIns: { $sum: 1 },
          totalCheckOuts: { $sum: { $cond: [{ $ne: ['$check_out', null] }, 1, 0] } },
          totalHours: { $sum: '$total_hours' },
          uniqueEmployees: { $addToSet: '$employee_id' }
        }
      },
      {
        $project: {
          totalCheckIns: 1,
          totalCheckOuts: 1,
          totalHours: { $round: ['$totalHours', 2] },
          uniqueEmployeeCount: { $size: '$uniqueEmployees' }
        }
      }
    ]);

    // This week's stats
    const weekStats = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: thisWeekStart,
            $lte: thisWeekEnd
          }
        }
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$total_hours' },
          totalCheckIns: { $sum: 1 }
        }
      },
      {
        $project: {
          totalHours: { $round: ['$totalHours', 2] },
          totalCheckIns: 1
        }
      }
    ]);

    // This month's stats
    const monthStats = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: thisMonthStart,
            $lte: thisMonthEnd
          }
        }
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$total_hours' },
          totalCheckIns: { $sum: 1 }
        }
      },
      {
        $project: {
          totalHours: { $round: ['$totalHours', 2] },
          totalCheckIns: 1
        }
      }
    ]);

    // Department-wise stats for today
    const departmentStats = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: today,
            $lt: tomorrow
          }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $unwind: '$employee'
      },
      {
        $group: {
          _id: '$employee.department',
          totalCheckIns: { $sum: 1 },
          totalCheckOuts: { $sum: { $cond: [{ $ne: ['$check_out', null] }, 1, 0] } },
          totalHours: { $sum: '$total_hours' },
          uniqueEmployees: { $addToSet: '$employee_id' }
        }
      },
      {
        $project: {
          department: '$_id',
          totalCheckIns: 1,
          totalCheckOuts: 1,
          totalHours: { $round: ['$totalHours', 2] },
          uniqueEmployeeCount: { $size: '$uniqueEmployees' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        today: todayStats[0] || {
          totalCheckIns: 0,
          totalCheckOuts: 0,
          totalHours: 0,
          uniqueEmployeeCount: 0
        },
        thisWeek: weekStats[0] || {
          totalHours: 0,
          totalCheckIns: 0
        },
        thisMonth: monthStats[0] || {
          totalHours: 0,
          totalCheckIns: 0
        },
        departments: departmentStats
      }
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Create manual attendance entry (admin only)
const createManualAttendance = async (req, res) => {
  try {
    const { employee_id, check_in, check_out, date, notes } = req.body;

    // Validate employee exists
    const employee = await Employee.findById(employee_id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Check if attendance already exists for this date
    const existingDate = new Date(date || check_in);
    existingDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(existingDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const existingAttendance = await Attendance.findOne({
      employee_id,
      date: {
        $gte: existingDate,
        $lt: nextDate
      }
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        error: 'Attendance record already exists for this date'
      });
    }

    // Create attendance record
    const checkInTime = new Date(check_in);
    const checkOutTime = check_out ? new Date(check_out) : null;

    const attendance = new Attendance({
      employee_id,
      check_in: checkInTime,
      check_out: checkOutTime,
      date: date || checkInTime,
      notes: notes || `Manually created by admin ${req.employee.name}`,
      created_by: req.employee._id
    });

    // Calculate total hours if check_out is provided
    if (checkOutTime) {
      const duration = (checkOutTime - checkInTime) / (1000 * 60 * 60);
      attendance.total_hours = parseFloat(duration.toFixed(2));
      attendance.status = 'completed';
    } else {
      attendance.status = 'active';
    }

    await attendance.save();
    await attendance.populate('employee_id', 'name email department');

    console.log(`Manual attendance created by admin ${req.employee.email} for employee ${employee.email}`);

    res.status(201).json({
      success: true,
      message: 'Attendance record created successfully',
      data: {
        attendance
      }
    });
  } catch (error) {
    console.error('Create manual attendance error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Update attendance record (admin only)
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { check_in, check_out, notes, status } = req.body;

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      });
    }

    // Update fields
    if (check_in) {
      attendance.check_in = new Date(check_in);
      attendance.date = new Date(check_in);
    }

    if (check_out) {
      attendance.check_out = new Date(check_out);
    }

    if (notes) {
      attendance.notes = notes;
    }

    if (status) {
      attendance.status = status;
    }

    // Recalculate total hours if both check_in and check_out exist
    if (attendance.check_in && attendance.check_out) {
      const checkInTime = new Date(attendance.check_in);
      const checkOutTime = new Date(attendance.check_out);
      const duration = (checkOutTime - checkInTime) / (1000 * 60 * 60);
      attendance.total_hours = parseFloat(duration.toFixed(2));
      attendance.status = 'completed';
    }

    // Add update audit trail
    attendance.notes = (attendance.notes || '') + ` | Updated by admin ${req.employee.name} on ${new Date().toLocaleString()}`;

    await attendance.save();
    await attendance.populate('employee_id', 'name email department');

    console.log(`Attendance ${id} updated by admin ${req.employee.email}`);

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      data: {
        attendance
      }
    });
  } catch (error) {
    console.error('Update attendance error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Delete attendance record (admin only)
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      });
    }

    await Attendance.findByIdAndDelete(id);

    console.log(`Attendance ${id} deleted by admin ${req.employee.email}`);

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully',
      data: {
        deletedAttendanceId: id
      }
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get admin dashboard statistics
const getAdminDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total employees
    const totalEmployees = await Employee.countDocuments();
    const totalAdmins = await Employee.countDocuments({ role: 'admin' });
    
    // Today's attendance
    const todayCheckIns = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow }
    });
    
    const todayCheckOuts = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      check_out: { $ne: null }
    });

    const activeNow = await Attendance.countDocuments({
      check_out: null,
      check_in: { $gte: today, $lt: tomorrow }
    });

    const absentToday = totalEmployees - todayCheckIns;

    // Recent activity - last 10 check-ins/check-outs
    const recentActivity = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    })
      .populate('employee_id', 'name email department')
      .sort({ check_in: -1 })
      .limit(10);

    // Department-wise attendance today
    const departmentStats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $unwind: '$employee'
      },
      {
        $group: {
          _id: '$employee.department',
          present: { $sum: 1 },
          checkedOut: {
            $sum: { $cond: [{ $ne: ['$check_out', null] }, 1, 0] }
          },
          totalHours: { $sum: '$total_hours' }
        }
      },
      {
        $sort: { present: -1 }
      }
    ]);

    // Get total employees per department for absent calculation
    const departmentTotals = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 }
        }
      }
    ]);

    // Merge department stats
    const departmentMap = departmentTotals.reduce((acc, dept) => {
      acc[dept._id] = dept.total;
      return acc;
    }, {});

    const enrichedDepartmentStats = departmentStats.map(dept => ({
      department: dept._id,
      present: dept.present,
      checkedOut: dept.checkedOut,
      totalHours: Math.round(dept.totalHours * 100) / 100,
      total: departmentMap[dept._id] || 0,
      absent: (departmentMap[dept._id] || 0) - dept.present
    }));

    // Add departments with no attendance today
    Object.keys(departmentMap).forEach(deptName => {
      if (!enrichedDepartmentStats.find(d => d.department === deptName)) {
        enrichedDepartmentStats.push({
          department: deptName,
          present: 0,
          checkedOut: 0,
          totalHours: 0,
          total: departmentMap[deptName],
          absent: departmentMap[deptName]
        });
      }
    });

    // Weekly trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(today.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const count = await Attendance.countDocuments({
        date: { $gte: dayStart, $lt: dayEnd }
      });

      weeklyTrend.push({
        date: dayStart.toISOString().split('T')[0],
        checkIns: count
      });
    }

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalEmployees,
          totalAdmins,
          presentToday: todayCheckIns,
          absentToday,
          activeNow,
          checkedOutToday: todayCheckOuts
        },
        recentActivity,
        departmentStats: enrichedDepartmentStats,
        weeklyTrend
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getCurrentStatus,
  getEmployeeAttendance,
  getAllAttendance,
  getAttendanceStats,
  createManualAttendance,
  updateAttendance,
  deleteAttendance,
  getAdminDashboard
};