const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
} = require('../controllers/employeeController');
const { authenticate, adminOnly } = require('../middleware/auth');
const {
  validateEmployeeCreate,
  validateEmployeeUpdate,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

// All employee routes require authentication
router.use(authenticate);

// Admin-only routes
router.use(adminOnly);

// GET /api/employees - Get all employees with pagination and search
router.get('/', validatePagination, getAllEmployees);

// GET /api/employees/stats - Get employee statistics
router.get('/stats', getEmployeeStats);

// GET /api/employees/:id - Get employee by ID
router.get('/:id', validateObjectId, getEmployeeById);

// POST /api/employees - Create new employee
router.post('/', validateEmployeeCreate, createEmployee);

// PUT /api/employees/:id - Update employee
router.put('/:id', validateObjectId, validateEmployeeUpdate, updateEmployee);

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', validateObjectId, deleteEmployee);

module.exports = router;