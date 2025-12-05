import api from './api';

export const attendanceService = {
  // Check in
  checkIn: async () => {
    try {
      const response = await api.post('/attendance/checkin');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Check out
  checkOut: async () => {
    try {
      const response = await api.post('/attendance/checkout');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get current attendance status
  getCurrentStatus: async () => {
    try {
      const response = await api.get('/attendance/status');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get employee attendance history
  getEmployeeAttendance: async (employeeId, params = {}) => {
    try {
      const response = await api.get(`/attendance/${employeeId}`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          startDate: params.startDate || '',
          endDate: params.endDate || '',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get all attendance records (admin only)
  getAllAttendance: async (params = {}) => {
    try {
      const response = await api.get('/attendance', {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          employeeId: params.employeeId || '',
          startDate: params.startDate || '',
          endDate: params.endDate || '',
          status: params.status || '',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get attendance statistics (admin only)
  getAttendanceStats: async () => {
    try {
      const response = await api.get('/attendance/stats/overview');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Export attendance data
  exportAttendance: async (params = {}) => {
    try {
      const response = await api.get('/attendance/export', {
        params: {
          format: params.format || 'csv',
          startDate: params.startDate || '',
          endDate: params.endDate || '',
          employeeId: params.employeeId || '',
          department: params.department || '',
        },
        responseType: 'blob', // Important for file downloads
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default attendanceService;