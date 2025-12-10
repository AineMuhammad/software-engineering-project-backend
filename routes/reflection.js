const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getReflectionRecommendation } = require('../controllers/reflectionController');

// All reflection routes require authentication
router.use(authenticate);

// POST /api/reflection/recommendation - Get AI-powered reflection recommendation
router.post('/recommendation', getReflectionRecommendation);

module.exports = router;

