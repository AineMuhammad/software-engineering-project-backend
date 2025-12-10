const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getCurrentWeather, getWeatherHistory } = require('../controllers/weatherController');

// All weather routes require authentication
router.use(authenticate);

// GET /api/weather/current - Get current weather (fetches from API if needed)
router.get('/current', getCurrentWeather);

// GET /api/weather/history - Get weather history
router.get('/history', getWeatherHistory);

module.exports = router;

