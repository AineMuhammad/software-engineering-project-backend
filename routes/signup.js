const express = require('express');
const router = express.Router();
const { signup } = require('../controllers/signupController');

// POST /api/signup
router.post('/', signup);

module.exports = router;

