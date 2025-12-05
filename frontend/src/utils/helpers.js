import { format } from 'date-fns';

// Date formatting utilities
export const formatDate = (date, formatStr = 'MM/dd/yyyy') => {
  if (!date) return 'N/A';
  return format(new Date(date), formatStr);
};

export const formatDateTime = (date, formatStr = 'MM/dd/yyyy HH:mm') => {
  if (!date) return 'N/A';
  return format(new Date(date), formatStr);
};

export const formatTime = (date, formatStr = 'HH:mm') => {
  if (!date) return 'N/A';
  return format(new Date(date), formatStr);
};

// Time calculations
export const calculateDuration = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 'N/A';

  const startTime = new Date(checkIn);
  const endTime = new Date(checkOut);
  const duration = endTime - startTime;

  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
};

export const calculateHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;

  const startTime = new Date(checkIn);
  const endTime = new Date(checkOut);
  const duration = endTime - startTime;

  return parseFloat((duration / (1000 * 60 * 60)).toFixed(2));
};

// Get current status message
export const getAttendanceStatusMessage = (isActive, activeAttendance) => {
  if (isActive && activeAttendance) {
    const duration = calculateDuration(activeAttendance.check_in, new Date());
    return `Checked in since ${formatTime(activeAttendance.check_in)} (${duration})`;
  }
  return 'Not checked in';
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Generate CSV download
export const downloadFile = (data, filename, type = 'text/csv') => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Validate email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone number
export const isValidPhone = (phone) => {
  const re = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
  return re.test(phone);
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return 'N/A';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Sort array by key
export const sortByKey = (array, key, direction = 'asc') => {
  return array.sort((a, b) => {
    if (direction === 'asc') {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
    } else {
      if (a[key] > b[key]) return -1;
      if (a[key] < b[key]) return 1;
    }
    return 0;
  });
};

// Generate random color
export const generateRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

// Check if user is on mobile
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
};

// Get greeting based on time
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    active: 'text-green-600 bg-green-100',
    completed: 'text-blue-600 bg-blue-100',
    pending: 'text-yellow-600 bg-yellow-100',
    cancelled: 'text-red-600 bg-red-100',
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
};

// Get role color
export const getRoleColor = (role) => {
  const colors = {
    admin: 'text-purple-600 bg-purple-100',
    employee: 'text-blue-600 bg-blue-100',
  };
  return colors[role] || 'text-gray-600 bg-gray-100';
};