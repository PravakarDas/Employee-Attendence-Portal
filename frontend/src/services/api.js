import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login page (handled by AuthContext)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      error.message = 'Network error. Please check your connection.';
    }

    return Promise.reject(error);
  }
);

// Utility function to handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return {
      message: error.response.data.error || error.response.data.message || 'Server error',
      status: error.response.status,
      details: error.response.data.details || null,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      message: 'No response from server. Please try again.',
      status: 0,
      details: null,
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      message: error.message || 'Request failed',
      status: 0,
      details: null,
    };
  }
};

export default api;