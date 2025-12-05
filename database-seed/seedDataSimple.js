const mongoose = require('mongoose');
require('dotenv').config({ path: '../backend/.env' });

// Import models
const Employee = require('../backend/src/models/Employee');
const Attendance = require('../backend/src/models/Attendance');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_portal';

const seedData = async () => {
  let conn;
  try {
    // Connect to database with extended timeouts
    console.log('Connecting to MongoDB...');
    conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 90000,
      connectTimeoutMS: 90000,
      maxPoolSize: 10,
    });
    console.log('✓ Connected to MongoDB');

    // Set longer timeout for operations
    mongoose.connection.setMaxListeners(100);

    // Create admin user directly
    console.log('Creating admin user...');
    try {
      await Employee.deleteMany({});
      await Attendance.deleteMany({});
    } catch (e) {
      console.log('Collections may not exist yet, continuing...');
    }

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

    // Create sample attendance records
    console.log('Creating sample attendance records...');
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }

      // Create attendance for 70% of employees
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
        }
      }
    }
    console.log('✓ Created attendance records');

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
    if (conn) {
      await mongoose.disconnect();
      console.log('✓ Disconnected from MongoDB');
    }
    process.exit(0);
  }
};

// Run the seed function
seedData();
