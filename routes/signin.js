const express = require('express');
const router = express.Router();
const { signin } = require('../controllers/signinController');

// POST /api/signin
router.post('/', signin);

module.exports = router;

