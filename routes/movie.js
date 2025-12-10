const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getMoviesByMood, getMovieDetails } = require('../controllers/movieController');

// All movie routes require authentication
router.use(authenticate);

// GET /api/movie/movies?mood=happy - Get movies based on mood
router.get('/movies', getMoviesByMood);

// GET /api/movie/:movieId - Get movie details by ID
router.get('/:movieId', getMovieDetails);

module.exports = router;

