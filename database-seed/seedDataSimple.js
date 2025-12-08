const mongoose = require('mongoose');
require('dotenv').config({ path: '../backend/.env' });

// Import models
const Employee = require('../backend/src/models/Employee');
const Attendance = require('../backend/src/models/Attendance');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_portal';

// Helper function to generate realistic face embeddings (512-dimensional vector)
// These are sample embeddings - in production, these would come from actual face images
const generateSampleFaceEmbedding = (seed = 0) => {
  const embedding = [];
  // Generate a deterministic but realistic-looking embedding based on seed
  for (let i = 0; i < 512; i++) {
    // Use seed to make embeddings unique but consistent for each employee
    const value = Math.sin(seed * 1000 + i * 0.1) * 0.5;
    embedding.push(parseFloat(value.toFixed(6)));
  }
  return embedding;
};

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

    // Create admin user directly with face embedding
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
      department: 'IT',
      faceEmbedding: generateSampleFaceEmbedding(0),
      faceRegisteredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    });
    await admin.save();
    console.log('✓ Admin user created with face embedding');

    // Create sample employees with face embeddings
    console.log('Creating sample employees with face embeddings...');
    const employees = [
      {
        name: 'John Doe',
        email: 'john@company.com',
        password: 'password123',
        role: 'employee',
        department: 'Engineering',
        faceEmbedding: generateSampleFaceEmbedding(1),
        faceRegisteredAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Jane Smith',
        email: 'jane@company.com',
        password: 'password123',
        role: 'employee',
        department: 'HR',
        faceEmbedding: generateSampleFaceEmbedding(2),
        faceRegisteredAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Mike Johnson',
        email: 'mike@company.com',
        password: 'password123',
        role: 'employee',
        department: 'Sales',
        faceEmbedding: generateSampleFaceEmbedding(3),
        faceRegisteredAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Sarah Williams',
        email: 'sarah@company.com',
        password: 'password123',
        role: 'employee',
        department: 'Marketing',
        faceEmbedding: generateSampleFaceEmbedding(4),
        faceRegisteredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Robert Brown',
        email: 'robert@company.com',
        password: 'password123',
        role: 'employee',
        department: 'Engineering',
        faceEmbedding: generateSampleFaceEmbedding(5),
        faceRegisteredAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Emily Davis',
        email: 'emily@company.com',
        password: 'password123',
        role: 'employee',
        department: 'Finance',
        faceEmbedding: generateSampleFaceEmbedding(6),
        faceRegisteredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'David Wilson',
        email: 'david@company.com',
        password: 'password123',
        role: 'employee',
        department: 'Operations',
        faceEmbedding: generateSampleFaceEmbedding(7),
        faceRegisteredAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa@company.com',
        password: 'password123',
        role: 'employee',
        department: 'Customer Support',
        faceEmbedding: generateSampleFaceEmbedding(8),
        faceRegisteredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
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
    console.log('========================');
    console.log('\n=== Face Recognition Data ===');
    console.log('✓ All employees have face embeddings registered');
    console.log('✓ Face embeddings are 512-dimensional vectors');
    console.log('✓ Note: These are sample embeddings for testing');
    console.log('✓ In production, use actual face photos for registration');
    console.log('================================\n');

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
