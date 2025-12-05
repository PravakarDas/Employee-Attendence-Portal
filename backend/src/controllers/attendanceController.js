const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

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

    // Create new attendance record
    const attendance = new Attendance({
      employee_id: employeeId,
      check_in: new Date()
    });

    await attendance.save();

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

    // Check out the attendance
    await activeAttendance.checkOut();

    // Calculate duration for response
    const checkInTime = new Date(activeAttendance.check_in);
    const checkOutTime = new Date(activeAttendance.check_out);
    const duration = checkOutTime - checkInTime;
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

module.exports = {
  checkIn,
  checkOut,
  getCurrentStatus,
  getEmployeeAttendance,
  getAllAttendance,
  getAttendanceStats
};