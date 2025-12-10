const Mood = require('../models/Mood');

// Get current hour's mood for the authenticated user (most recent mood)
const getTodayMood = async (req, res) => {
  try {
    const userId = req.userId;

    // Get the most recent mood entry
    const mood = await Mood.findOne({
      userId,
    })
      .sort({ date: -1 })
      .limit(1);

    if (!mood) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No mood logged yet',
      });
    }

    res.status(200).json({
      success: true,
      data: mood,
    });
  } catch (error) {
    console.error('Get today mood error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching mood',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Add a new mood entry (allows logging every hour)
const addTodayMood = async (req, res) => {
  try {
    const userId = req.userId;
    const { mood, notes } = req.body;

    // Validation
    if (!mood) {
      return res.status(400).json({
        success: false,
        message: 'Mood is required',
      });
    }

    const validMoods = ['happy', 'calm', 'sad', 'angry', 'neutral'];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({
        success: false,
        message: `Mood must be one of: ${validMoods.join(', ')}`,
      });
    }

    // Always create a new mood entry (allows logging every hour)
    const savedMood = await Mood.create({
      userId,
      mood,
      notes: notes || '',
      date: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Mood logged successfully',
      data: savedMood,
    });
  } catch (error) {
    console.error('Add today mood error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error while logging mood',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get moods for a date range (for charts)
const getMoodsRange = async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate, limit = 168 } = req.query; // Default: last 168 hours (7 days)

    const query = { userId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      // Default: last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const moods = await Mood.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: moods,
      count: moods.length,
    });
  } catch (error) {
    console.error('Get moods range error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching moods',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getTodayMood,
  addTodayMood,
  getMoodsRange,
};

