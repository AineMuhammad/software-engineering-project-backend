const { OpenAI } = require('openai');

const getReflectionRecommendation = async (req, res) => {
  try {
    const { mood, weather, preferences } = req.body;
    const userId = req.userId;

    // Check for API key (check multiple possible env var names)
    const apiKey = process.env.HF_TOKEN || process.env.HUGGING_FACE_API_KEY || process.env.HUGGING_FACE_API || process.env.VITE_HUGGING_FACE_API;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Hugging Face API key not configured',
      });
    }

    // Initialize OpenAI client with Hugging Face router endpoint
    const client = new OpenAI({
      baseURL: 'https://router.huggingface.co/v1',
      apiKey: apiKey,
    });

    // Build a prompt based on mood, weather, and preferences
    const moodDescriptions = {
      happy: 'feeling happy and positive',
      calm: 'feeling calm and relaxed',
      sad: 'feeling sad or down',
      angry: 'feeling angry or frustrated',
      neutral: 'feeling neutral',
    };

    const moodText = moodDescriptions[mood] || 'feeling neutral';
    const weatherText = weather ? `The weather is ${weather.description} with a temperature of ${weather.temperature}°C.` : '';
    
    // Make API call to Hugging Face using OpenAI-compatible format
    let recommendation = null;
    
    try {
      const chatCompletion = await client.chat.completions.create({
        model: 'deepseek-ai/DeepSeek-V3.2:novita', // or another model available on router
        messages: [
          {
            role: 'user',
            content: `You are a thoughtful wellness assistant. The user is ${moodText}. ${weatherText} Provide a brief, personalized recommendation for a small, actionable activity they can do today to improve their well-being. Keep it to 2-3 sentences, warm and encouraging.`,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });
      
      // Extract recommendation from response
      if (chatCompletion.choices && chatCompletion.choices.length > 0) {
        recommendation = chatCompletion.choices[0].message?.content || null;
        
        // Clean up the recommendation
        if (recommendation) {
          recommendation = recommendation.trim();
          // Limit length if too long
          if (recommendation.length > 300) {
            recommendation = recommendation.substring(0, 300).trim() + '...';
          }
        }
      }
    } catch (error) {
      console.log('Hugging Face API call failed:', error.message || error);
      // Will use fallback below
    }
    
    // Use fallback if API call failed or didn't return valid data
    if (!recommendation || recommendation.length < 10) {
      recommendation = getFallbackRecommendation(mood, weather);
    }
    
    res.status(200).json({
      success: true,
      data: {
        recommendation: recommendation,
        mood: mood,
        weather: weather || null,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Get reflection recommendation error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    res.status(500).json({
      success: false,
      message: 'Server error while fetching reflection recommendation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Fallback recommendations if API fails
const getFallbackRecommendation = (mood, weather) => {
  const baseRecommendations = {
    happy: "Take a moment to share your positive energy with someone else. A simple message or act of kindness can multiply your joy and brighten someone else's day.",
    calm: "Maintain this peaceful state by spending a few minutes in nature or practicing deep breathing. This calm energy is valuable—protect it.",
    sad: "Be gentle with yourself today. Consider doing something small that brings you comfort, like listening to your favorite music or taking a warm bath.",
    angry: "Channel this energy into something physical like a walk or exercise. Sometimes movement helps process difficult emotions and brings clarity.",
    neutral: "This is a good moment for reflection. Try journaling or doing something creative—it can help you understand what you need right now.",
  };

  let recommendation = baseRecommendations[mood] || baseRecommendations.neutral;

  // Add weather context if available
  if (weather) {
    if (weather.description?.toLowerCase().includes('sunny') || weather.description?.toLowerCase().includes('clear')) {
      recommendation += " The beautiful weather today is perfect for spending time outdoors.";
    } else if (weather.description?.toLowerCase().includes('rain') || weather.description?.toLowerCase().includes('cloud')) {
      recommendation += " The cozy weather makes it a great day for indoor activities.";
    }
  }

  return recommendation;
};

module.exports = {
  getReflectionRecommendation,
};

