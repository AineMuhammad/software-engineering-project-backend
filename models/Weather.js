const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  temperature: {
    type: Number,
    required: true,
  },
  feelsLike: {
    type: Number,
  },
  description: {
    type: String,
    required: true,
  },
  main: {
    type: String, // e.g., "Clear", "Clouds", "Rain"
    required: true,
  },
  icon: {
    type: String, // OpenWeatherMap icon code
  },
  humidity: {
    type: Number,
  },
  windSpeed: {
    type: Number,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
weatherSchema.index({ userId: 1, date: -1 });
weatherSchema.index({ userId: 1, city: 1, date: -1 });

module.exports = mongoose.model('Weather', weatherSchema);

