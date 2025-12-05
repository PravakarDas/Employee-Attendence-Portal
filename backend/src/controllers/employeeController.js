const Employee = require('../models/Employee');

// Get all employees (admin only)
const getAllEmployees = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const { search } = req.query;

    // Build query
    let query = {};

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await Employee.countDocuments(query);

    // Get employees with pagination
    const employees = await Employee.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        employees,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: employees.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id).select('-password');

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        employee
      }
    });
  } catch (error) {
    console.error('Get employee by ID error:', error);

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid employee ID'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Create new employee (admin only)
const createEmployee = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ email });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        error: 'Employee with this email already exists'
      });
    }

    // Create new employee
    const employee = new Employee({
      name,
      email,
      password,
      role: role || 'employee',
      department
    });

    await employee.save();

    // Return employee data without password
    const employeeData = employee.toJSON();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        employee: employeeData
      }
    });
  } catch (error) {
    console.error('Create employee error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Update employee (admin only)
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, department } = req.body;

    // Find existing employee
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== employee.email) {
      const existingEmployee = await Employee.findOne({ email });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }

    // Update fields
    if (name) employee.name = name;
    if (email) employee.email = email;
    if (password) employee.password = password; // Will be hashed by pre-save middleware
    if (role) employee.role = role;
    if (department) employee.department = department;

    await employee.save();

    // Return updated employee data without password
    const employeeData = employee.toJSON();

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: {
        employee: employeeData
      }
    });
  } catch (error) {
    console.error('Update employee error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Delete employee (admin only)
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if employee exists
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Prevent deletion of the last admin
    if (employee.role === 'admin') {
      const adminCount = await Employee.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete the last admin user'
        });
      }
    }

    // Check if employee has attendance records
    const Attendance = require('../models/Attendance');
    const attendanceCount = await Attendance.countDocuments({ employee_id: id });

    if (attendanceCount > 0) {
      // Instead of hard delete, consider soft delete or mark as inactive
      // For now, we'll proceed with hard delete but warn about attendance records
      await Employee.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: `Employee deleted successfully. Note: ${attendanceCount} attendance records were also removed.`,
        data: {
          deletedEmployeeId: id,
          attendanceRecordsRemoved: attendanceCount
        }
      });
    }

    // Delete employee
    await Employee.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: {
        deletedEmployeeId: id
      }
    });
  } catch (error) {
    console.error('Delete employee error:', error);

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid employee ID'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get employee statistics (admin only)
const getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalAdmins = await Employee.countDocuments({ role: 'admin' });
    const totalEmployeesOnly = await Employee.countDocuments({ role: 'employee' });

    // Get department-wise counts
    const departmentStats = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          admins: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
          },
          employees: {
            $sum: { $cond: [{ $eq: ['$role', 'employee'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalEmployees,
        admins: totalAdmins,
        employees: totalEmployeesOnly,
        departments: departmentStats
      }
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
};