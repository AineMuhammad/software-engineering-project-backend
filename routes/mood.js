const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getTodayMood, addTodayMood, getMoodsRange } = require('../controllers/moodController');

// All mood routes require authentication
router.use(authenticate);

// GET /api/mood/today - Get most recent mood
router.get('/today', getTodayMood);

// POST /api/mood/today - Add a new mood entry (allows hourly logging)
router.post('/today', addTodayMood);

// GET /api/mood/range - Get moods for a date range (for charts)
router.get('/range', getMoodsRange);

module.exports = router;

