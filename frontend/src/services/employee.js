import api from './api';

export const employeeService = {
  // Get all employees with pagination and search
  getAllEmployees: async (params = {}) => {
    try {
      const { page = 1, limit = 10, search = '' } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      
      const response = await api.get(`/employees?${queryParams}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get employee by ID
  getEmployeeById: async (id) => {
    try {
      const response = await api.get(`/employees/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new employee
  createEmployee: async (employeeData) => {
    try {
      const response = await api.post('/employees', employeeData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    try {
      const response = await api.put(`/employees/${id}`, employeeData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete employee
  deleteEmployee: async (id) => {
    try {
      const response = await api.delete(`/employees/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get employee statistics
  getEmployeeStats: async () => {
    try {
      const response = await api.get('/employees/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default employeeService;
