const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../backend/.env' });

// Import models
const Employee = require('../backend/src/models/Employee');
const Attendance = require('../backend/src/models/Attendance');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_portal';

const seedData = async () => {
  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    console.log('✓ Cleared existing data');

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
    console.log('✓ Admin user created');

    // Create sample employees
    console.log('Creating sample employees...');
    const employees = [
      {
        name: 'John Doe',
        email: 'john@company.com',
        password: 'password123',
        role: 'employee',
        department: 'Engineering'
      },
      {
        name: 'Jane Smith',
        email: 'jane@company.com',
        password: 'password123',
        role: 'employee',
        department: 'HR'
      },
      {
        name: 'Mike Johnson',
        email: 'mike@company.com',
        password: 'password123',
        role: 'employee',
        department: 'Sales'
      },
      {
        name: 'Sarah Williams',
        email: 'sarah@company.com',
        password: 'password123',
        role: 'employee',
        department: 'Marketing'
      },
      {
        name: 'Robert Brown',
        email: 'robert@company.com',
        password: 'password123',
        role: 'employee',
        department: 'Engineering'
      },
      {
        name: 'Emily Davis',
        email: 'emily@company.com',
        password: 'password123',
        role: 'employee',
        department: 'Finance'
      },
      {
        name: 'David Wilson',
        email: 'david@company.com',
        password: 'password123',
        role: 'employee',
        department: 'Operations'
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa@company.com',
        password: 'password123',
        role: 'employee',
        department: 'Customer Support'
      }
    ];

    const createdEmployees = [];
    for (const empData of employees) {
      const emp = new Employee(empData);
      await emp.save();
      createdEmployees.push(emp);
    }
    console.log(`✓ Created ${createdEmployees.length} employees`);

    // Create sample attendance records for the past 30 days
    console.log('Creating sample attendance records...');
    const attendanceRecords = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }

      // Create attendance for 70% of employees
      const employeesToCheckIn = createdEmployees.filter(() => Math.random() > 0.3);

      for (const employee of employeesToCheckIn) {
        // Random check-in time between 8:00 AM and 10:00 AM
        const checkInTime = new Date(date);
        checkInTime.setHours(8 + Math.floor(Math.random() * 2));
        checkInTime.setMinutes(Math.floor(Math.random() * 60));
        checkInTime.setSeconds(0);

        // Random check-out time between 4:00 PM and 7:00 PM (80% of the time)
        const shouldCheckOut = Math.random() > 0.2;
        let checkOutTime = null;
        let totalHours = 0;

        if (shouldCheckOut) {
          checkOutTime = new Date(date);
          checkOutTime.setHours(16 + Math.floor(Math.random() * 3));
          checkOutTime.setMinutes(Math.floor(Math.random() * 60));
          checkOutTime.setSeconds(0);

          // Calculate total hours
          totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
        }

        const attendance = new Attendance({
          employee_id: employee._id,
          check_in: checkInTime,
          check_out: checkOutTime,
          total_hours: totalHours,
          date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          status: shouldCheckOut ? 'completed' : 'active'
        });
        attendanceRecords.push(attendance);
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`✓ Created ${attendanceRecords.length} attendance records`);

    // Create today's attendance for some employees
    console.log('Creating today\'s attendance...');
    const todayEmployees = createdEmployees.slice(0, 4);

    for (const employee of todayEmployees) {
      const checkInTime = new Date();
      checkInTime.setHours(9);
      checkInTime.setMinutes(Math.floor(Math.random() * 30));

      const attendance = new Attendance({
        employee_id: employee._id,
        check_in: checkInTime,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        status: 'active'
      });

      // Check out some employees
      if (Math.random() > 0.5) {
        const checkOutTime = new Date();
        checkOutTime.setHours(17);
        checkOutTime.setMinutes(Math.floor(Math.random() * 30));

        attendance.check_out = checkOutTime;
        attendance.status = 'completed';
        attendance.total_hours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
      }

      await attendance.save();
    }
    console.log('✓ Created today\'s attendance');

    console.log('\n========================================');
    console.log('✓ Database seeded successfully!');
    console.log('========================================');
    console.log('\n=== Login Credentials ===');
    console.log('Admin: admin@company.com / admin123');
    console.log('Employees: [name]@company.com / password123');
    console.log('Names: John, Jane, Mike, Sarah, Robert, Emily, David, Lisa');
    console.log('========================\n');

  } catch (error) {
    console.error('✗ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seed function
seedData();