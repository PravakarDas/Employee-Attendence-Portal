const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const Employee = require('../models/Employee');

// Authentication middleware - verifies JWT token
const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Find employee by ID from token payload
    const employee = await Employee.findById(decoded.userId);

    if (!employee) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Attach employee to request object
    req.employee = employee;
    req.user = {
      id: employee._id,
      email: employee.email,
      role: employee.role,
      name: employee.name
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error.message || 'Invalid token'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.employee) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.employee.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Admin-only middleware
const adminOnly = authorize('admin');

// Employee-only middleware (can be both admin and employee)
const employeeOnly = authorize('employee', 'admin');

// Check if user can access their own data or is admin
const selfOrAdmin = (req, res, next) => {
  const targetUserId = req.params.id || req.params.employeeId;

  // If user is admin, allow access to any resource
  if (req.employee.role === 'admin') {
    return next();
  }

  // If user is employee, only allow access to their own resources
  if (req.employee._id.toString() === targetUserId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Access denied. You can only access your own data.'
  });
};

module.exports = {
  authenticate,
  authorize,
  adminOnly,
  employeeOnly,
  selfOrAdmin
};