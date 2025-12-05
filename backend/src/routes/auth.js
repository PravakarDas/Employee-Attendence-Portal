const express = require('express');
const router = express.Router();
const {
  login,
  getProfile,
  updateProfile,
  logout,
  refreshToken,
  seedDatabase
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateLogin, validateEmployeeUpdate } = require('../middleware/validation');

// Public routes
router.post('/login', validateLogin, login);
router.post('/seed', seedDatabase); // Development only - seed database

// Protected routes (require authentication)
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', validateEmployeeUpdate, updateProfile);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

module.exports = router;