const Employee = require('../models/Employee');
const { generateToken, createTokenPayload } = require('../utils/jwt');

// Login employee
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find employee by email with password selected
    const employee = await Employee.findOne({ email }).select('+password');

    if (!employee) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isPasswordValid = await employee.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Create token payload
    const tokenPayload = createTokenPayload(employee);

    // Generate JWT token
    const token = generateToken(tokenPayload);

    // Return user data without password
    const employeeData = employee.toJSON();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: employeeData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee._id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: employee.toJSON()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Update current user profile
const updateProfile = async (req, res) => {
  try {
    const { name, department, password } = req.body;
    const employeeId = req.employee._id;

    // Find the employee
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update fields
    if (name) employee.name = name;
    if (department) employee.department = department;
    if (password) employee.password = password; // Will be hashed by pre-save middleware

    // Save updated employee
    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: employee.toJSON()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);

    // Handle duplicate key error (email)
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

// Logout (client-side responsibility - just for completeness)
const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // by removing the token from storage
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Refresh token (optional - for longer sessions)
const refreshToken = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee._id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Create new token payload
    const tokenPayload = createTokenPayload(employee);

    // Generate new JWT token
    const token = generateToken(tokenPayload);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Seed database with demo data (development only)
const seedDatabase = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Seeding is not allowed in production'
      });
    }

    const Attendance = require('../models/Attendance');

    // Clear existing data
    console.log('Clearing existing data...');
    await Employee.deleteMany({});
    await Attendance.deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    const admin = new Employee({
      name: 'System Administrator',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'admin',
      department: 'IT'
    });
    await admin.save();

    // Create sample employees
    const employees = [
      { name: 'John Doe', email: 'john@company.com', password: 'password123', role: 'employee', department: 'Engineering' },
      { name: 'Jane Smith', email: 'jane@company.com', password: 'password123', role: 'employee', department: 'HR' },
      { name: 'Mike Johnson', email: 'mike@company.com', password: 'password123', role: 'employee', department: 'Sales' },
      { name: 'Sarah Williams', email: 'sarah@company.com', password: 'password123', role: 'employee', department: 'Marketing' },
      { name: 'Robert Brown', email: 'robert@company.com', password: 'password123', role: 'employee', department: 'Engineering' },
      { name: 'Emily Davis', email: 'emily@company.com', password: 'password123', role: 'employee', department: 'Finance' },
      { name: 'David Wilson', email: 'david@company.com', password: 'password123', role: 'employee', department: 'Operations' },
      { name: 'Lisa Anderson', email: 'lisa@company.com', password: 'password123', role: 'employee', department: 'Customer Support' }
    ];

    const createdEmployees = [];
    for (const empData of employees) {
      const emp = new Employee(empData);
      await emp.save();
      createdEmployees.push(emp);
    }

    // Create sample attendance records
    const today = new Date();
    let attendanceCount = 0;

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const employee of createdEmployees) {
        if (Math.random() > 0.3) {
          const checkInTime = new Date(date);
          checkInTime.setHours(8 + Math.floor(Math.random() * 2));
          checkInTime.setMinutes(Math.floor(Math.random() * 60));

          const shouldCheckOut = Math.random() > 0.2;
          let checkOutTime = null;
          let totalHours = 0;

          if (shouldCheckOut) {
            checkOutTime = new Date(date);
            checkOutTime.setHours(16 + Math.floor(Math.random() * 3));
            checkOutTime.setMinutes(Math.floor(Math.random() * 60));
            totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
          }

          const attendance = new Attendance({
            employee_id: employee._id,
            check_in: checkInTime,
            check_out: checkOutTime,
            total_hours: Math.round(totalHours * 100) / 100,
            date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            status: shouldCheckOut ? 'completed' : 'active'
          });
          await attendance.save();
          attendanceCount++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Database seeded successfully!',
      data: { admin: 1, employees: createdEmployees.length, attendance: attendanceCount }
    });
  } catch (error) {
    console.error('Seed database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed database: ' + error.message
    });
  }
};

module.exports = {
  login,
  getProfile,
  updateProfile,
  logout,
  refreshToken,
  seedDatabase
};;