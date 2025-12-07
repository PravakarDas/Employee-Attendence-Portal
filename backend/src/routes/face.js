const express = require('express');
const router = express.Router();
const {
  registerFace,
  verifyFace,
  deleteFaceRegistration,
  getFaceStatus
} = require('../controllers/faceController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/verify', verifyFace); // Used for check-in verification (no auth needed initially)

// Protected routes (require authentication)
router.post('/register', authenticate, registerFace);
router.delete('/register', authenticate, deleteFaceRegistration);
router.get('/status', authenticate, getFaceStatus);

module.exports = router;
