const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getCurrentUser } = require('../controllers/userController');

// All user routes require authentication
router.use(authenticate);

// GET /api/user/me - Get current user data
router.get('/me', getCurrentUser);

module.exports = router;

