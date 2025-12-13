require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
// CORS configuration - allow requests from frontend
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://personal-mood-tracker-800c5.web.app',
    'https://personal-mood-tracker-800c5.firebaseapp.com',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
};
app.use(cors(corsOptions)); // Enable CORS for frontend
app.use(express.json()); // Allows us to parse JSON in request bodies

// 1. Connect to MongoDB with connection options
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 30000, // 30 seconds
      // Keep buffering enabled so queries wait for connection
      bufferCommands: true,
      bufferMaxEntries: 0, // Unlimited buffering
    });
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    // Don't exit - let the server start and retry
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
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

// 3. Start Server - Wait for MongoDB connection first
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    // Still start server even if MongoDB connection fails
    // This allows the app to run and retry connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (MongoDB connection pending)`);
    });
  });