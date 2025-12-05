const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getCurrentStatus,
  getEmployeeAttendance,
  getAllAttendance,
  getAttendanceStats
} = require('../controllers/attendanceController');
const { authenticate, adminOnly, selfOrAdmin } = require('../middleware/auth');
const {
  validateObjectId,
  validateDateRange,
  validatePagination
} = require('../middleware/validation');

// All attendance routes require authentication
router.use(authenticate);

// Employee routes
router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.get('/status', getCurrentStatus);

// Get attendance for specific employee (admin can view any, employees can view their own)
router.get('/:employeeId', validateObjectId, validateDateRange, validatePagination, (req, res, next) => {
  // Allow admins to access any employee's attendance
  if (req.employee.role === 'admin') {
    return getEmployeeAttendance(req, res, next);
  }

  // Allow employees to access their own attendance
  if (req.employee._id.toString() === req.params.employeeId) {
    return getEmployeeAttendance(req, res, next);
  }

  // Deny access to other employees' data
  return res.status(403).json({
    success: false,
    error: 'Access denied. You can only view your own attendance records.'
  });
});

// Admin-only routes
router.get('/', adminOnly, validateDateRange, validatePagination, getAllAttendance);
router.get('/stats/overview', adminOnly, getAttendanceStats);

module.exports = router;