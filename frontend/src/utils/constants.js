// Configuration constants for the application

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  EMPLOYEE_LIST_LIMIT: 10,
  ATTENDANCE_EMPLOYEE_LIMIT: 10, // Max employees to load attendance for when viewing 'all'
};

// Employee roles
export const ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  ADMIN: 'admin',
};

// Attendance status
export const ATTENDANCE_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ABSENT: 'absent',
  LEAVE: 'leave',
};

export default {
  PAGINATION,
  ROLES,
  ATTENDANCE_STATUS,
};
