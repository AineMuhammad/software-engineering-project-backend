const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  mood: {
    type: String,
    required: true,
    enum: ['happy', 'calm', 'sad', 'angry', 'neutral'],
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
moodSchema.index({ userId: 1, date: -1 });

// Helper method to get start of current hour (static)
moodSchema.statics.getCurrentHourStart = function () {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  return now;
};

// Helper method to get end of current hour (static)
moodSchema.statics.getCurrentHourEnd = function () {
  const now = new Date();
  now.setMinutes(59, 59, 999);
  return now;
};

// Helper method to get start of day (static)
moodSchema.statics.getTodayStart = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Helper method to get end of day (static)
moodSchema.statics.getTodayEnd = function () {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
};

module.exports = mongoose.model('Mood', moodSchema);

