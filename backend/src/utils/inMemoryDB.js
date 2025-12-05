// In-memory database for demonstration purposes
let employees = [
  {
    _id: '1',
    name: 'System Administrator',
    email: 'admin@company.com',
    password: 'hashed_admin123',
    role: 'admin',
    department: 'IT',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    name: 'John Doe',
    email: 'john@company.com',
    password: 'hashed_password123',
    role: 'employee',
    department: 'Engineering',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '3',
    name: 'Jane Smith',
    email: 'jane@company.com',
    password: 'hashed_password123',
    role: 'employee',
    department: 'HR',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let attendance = [];

const inMemoryDB = {
  // Employee operations
  employees: {
    findOne: (query) => {
      if (query.email) {
        return Promise.resolve(employees.find(emp => emp.email === query.email));
      }
      if (query._id) {
        return Promise.resolve(employees.find(emp => emp._id === query._id));
      }
      return Promise.resolve(null);
    },
    findById: (id) => {
      return Promise.resolve(employees.find(emp => emp._id === id));
    },
    find: (query = {}) => {
      let result = [...employees];
      if (query.role) {
        result = result.filter(emp => emp.role === query.role);
      }
      if (query.department) {
        result = result.filter(emp => emp.department === query.department);
      }
      return Promise.resolve(result);
    },
    create: (data) => {
      const newEmployee = {
        _id: Date.now().toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      employees.push(newEmployee);
      return Promise.resolve(newEmployee);
    },
    findByIdAndUpdate: (id, data) => {
      const index = employees.findIndex(emp => emp._id === id);
      if (index !== -1) {
        employees[index] = { ...employees[index], ...data, updatedAt: new Date() };
        return Promise.resolve(employees[index]);
      }
      return Promise.resolve(null);
    },
    findByIdAndDelete: (id) => {
      const index = employees.findIndex(emp => emp._id === id);
      if (index !== -1) {
        const deleted = employees.splice(index, 1)[0];
        return Promise.resolve(deleted);
      }
      return Promise.resolve(null);
    },
    countDocuments: (query = {}) => {
      let result = [...employees];
      if (query.role) {
        result = result.filter(emp => emp.role === query.role);
      }
      return Promise.resolve(result.length);
    }
  },

  // Attendance operations
  attendance: {
    findOne: (query) => {
      if (query.employee_id && query.date) {
        return Promise.resolve(attendance.find(att =>
          att.employee_id === query.employee_id &&
          new Date(att.date).toDateString() === new Date(query.date).toDateString()
        ));
      }
      return Promise.resolve(null);
    },
    find: (query = {}) => {
      let result = [...attendance];
      if (query.employee_id) {
        result = result.filter(att => att.employee_id === query.employee_id);
      }
      if (query.status) {
        result = result.filter(att => att.status === query.status);
      }
      return Promise.resolve(result);
    },
    create: (data) => {
      const newAttendance = {
        _id: Date.now().toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      attendance.push(newAttendance);
      return Promise.resolve(newAttendance);
    },
    findByIdAndUpdate: (id, data) => {
      const index = attendance.findIndex(att => att._id === id);
      if (index !== -1) {
        attendance[index] = { ...attendance[index], ...data, updatedAt: new Date() };
        return Promise.resolve(attendance[index]);
      }
      return Promise.resolve(null);
    },
    countDocuments: (query = {}) => {
      let result = [...attendance];
      if (query.employee_id) {
        result = result.filter(att => att.employee_id === query.employee_id);
      }
      return Promise.resolve(result.length);
    }
  }
};

// Hash password function (simple version)
const hashPassword = async (password) => {
  return `hashed_${password}`;
};

// Compare password function
const comparePassword = async (password, hashedPassword) => {
  return hashedPassword === `hashed_${password}`;
};

module.exports = { inMemoryDB, hashPassword, comparePassword };