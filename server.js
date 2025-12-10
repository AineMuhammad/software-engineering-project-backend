require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Allows us to parse JSON in request bodies

// 1. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Connection error:', error);
  });

// 2. Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Auth routes
app.use('/api/signup', require('./routes/signup'));
app.use('/api/signin', require('./routes/signin'));

// User routes (protected)
app.use('/api/user', require('./routes/user'));

// Mood routes (protected)
app.use('/api/mood', require('./routes/mood'));

// Weather routes (protected)
app.use('/api/weather', require('./routes/weather'));

// Spotify routes (protected)
app.use('/api/spotify', require('./routes/spotify'));

// Movie routes (protected)
app.use('/api/movie', require('./routes/movie'));

// Reflection routes (protected)
app.use('/api/reflection', require('./routes/reflection'));

// 3. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});