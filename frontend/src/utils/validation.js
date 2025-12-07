// Form validation utilities

// Email regex pattern
export const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

// Validate email format
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  if (!EMAIL_REGEX.test(email)) {
    return 'Invalid email format';
  }
  return null;
};

// Validate password
export const validatePassword = (password, isRequired = true) => {
  if (!password) {
    if (isRequired) {
      return 'Password is required';
    }
    return null;
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
};

// Validate required field
export const validateRequired = (value, fieldName) => {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
};

export default {
  EMAIL_REGEX,
  validateEmail,
  validatePassword,
  validateRequired,
};
