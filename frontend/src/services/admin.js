import api from './api';

export const adminService = {
  // Employee Management
  getAllEmployees: async (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    
    const response = await api.get(`/employees?${params}`);
    return response.data;
  },

  getEmployeeById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  createEmployee: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  updateEmployee: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  deleteEmployee: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  getEmployeeStats: async () => {
    const response = await api.get('/employees/stats');
    return response.data;
  },

  // Attendance Management
  getAllAttendance: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (filters.employeeId) params.append('employeeId', filters.employeeId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.status) params.append('status', filters.status);
    
    const response = await api.get(`/attendance?${params}`);
    return response.data;
  },

  createManualAttendance: async (attendanceData) => {
    const response = await api.post('/attendance/admin/manual', attendanceData);
    return response.data;
  },

  updateAttendance: async (id, attendanceData) => {
    const response = await api.put(`/attendance/admin/${id}`, attendanceData);
    return response.data;
  },

  deleteAttendance: async (id) => {
    const response = await api.delete(`/attendance/admin/${id}`);
    return response.data;
  },

  getAttendanceStats: async () => {
    const response = await api.get('/attendance/stats/overview');
    return response.data;
  },

  // Dashboard
  getDashboard: async () => {
    const response = await api.get('/attendance/admin/dashboard');
    return response.data;
  }
};
