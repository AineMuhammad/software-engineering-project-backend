const Weather = require('../models/Weather');
const axios = require('axios');

// Get current weather for a user (fetch from NWS API and store)
const getCurrentWeather = async (req, res) => {
  try {
    const userId = req.userId;
    const { lat, lon } = req.query;

    // Check if we have recent weather data (within last hour)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    let recentWeather = await Weather.findOne({
      userId,
      date: { $gte: oneHourAgo },
    }).sort({ date: -1 });

    // If we have recent data, return it
    if (recentWeather) {
      return res.status(200).json({
        success: true,
        data: recentWeather,
        cached: true,
      });
    }

    // NWS API requires coordinates - default to New York if not provided
    const latitude = lat || '40.7128';
    const longitude = lon || '-74.0060';

    // NWS API requires User-Agent header
    const userAgent = process.env.NWS_USER_AGENT || 'Vibelytics (vibelytics.app, contact@vibelytics.app)';
    const axiosConfig = {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'application/geo+json',
      },
    };

    // Step 1: Get grid point information from coordinates
    const pointsUrl = `https://api.weather.gov/points/${latitude},${longitude}`;
    const pointsResponse = await axios.get(pointsUrl, axiosConfig);
    const pointsData = pointsResponse.data;

    if (!pointsData || !pointsData.properties) {
      throw new Error('Invalid response from NWS points endpoint');
    }

    const { gridId, gridX, gridY } = pointsData.properties;
    const city = pointsData.properties.relativeLocation?.properties?.city || 'Unknown';
    const state = pointsData.properties.relativeLocation?.properties?.state || 'US';

    // Step 2: Get current forecast
    const forecastUrl = `https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/forecast`;
    const forecastResponse = await axios.get(forecastUrl, axiosConfig);
    const forecastData = forecastResponse.data;

    if (!forecastData || !forecastData.properties || !forecastData.properties.periods || forecastData.properties.periods.length === 0) {
      throw new Error('Invalid forecast data from NWS API');
    }

    // Get the current period (first period in the forecast)
    const currentPeriod = forecastData.properties.periods[0];

    // Map NWS data to our weather model
    // NWS temperature is in Fahrenheit, convert to Celsius
    const tempF = currentPeriod.temperature;
    const tempC = Math.round((tempF - 32) * 5 / 9);

    // Map NWS shortForecast to our main condition
    const shortForecast = currentPeriod.shortForecast || '';
    let mainCondition = 'Unknown';
    let icon = '01d';
    
    if (shortForecast.toLowerCase().includes('sunny') || shortForecast.toLowerCase().includes('clear')) {
      mainCondition = 'Clear';
      icon = '01d';
    } else if (shortForecast.toLowerCase().includes('cloud')) {
      mainCondition = 'Clouds';
      icon = '03d';
    } else if (shortForecast.toLowerCase().includes('rain') || shortForecast.toLowerCase().includes('shower')) {
      mainCondition = 'Rain';
      icon = '10d';
    } else if (shortForecast.toLowerCase().includes('snow')) {
      mainCondition = 'Snow';
      icon = '13d';
    } else if (shortForecast.toLowerCase().includes('thunder')) {
      mainCondition = 'Thunderstorm';
      icon = '11d';
    }

    // Extract wind speed if available
    const windSpeed = currentPeriod.windSpeed ? parseFloat(currentPeriod.windSpeed.split(' ')[0]) * 0.44704 : 0; // Convert mph to m/s

    const weatherEntry = {
      userId,
      city: city,
      country: 'US', // NWS is US-only
      temperature: tempC,
      feelsLike: tempC, // NWS doesn't provide feels-like, use same as temp
      description: currentPeriod.detailedForecast || currentPeriod.shortForecast || 'Unknown',
      main: mainCondition,
      icon: icon,
      humidity: null, // NWS forecast doesn't include humidity in forecast endpoint
      windSpeed: windSpeed,
      date: new Date(),
    };

    // Save to database
    const savedWeather = await Weather.create(weatherEntry);

    res.status(200).json({
      success: true,
      data: savedWeather,
      cached: false,
    });
  } catch (error) {
    console.error('Get current weather error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    
    if (error.response) {
      // NWS API error
      const statusCode = error.response.status || 500;
      const errorMessage = error.response.data?.detail || error.response.data?.title || 'Error fetching weather data from NWS';
      
      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? {
          status: error.response.status,
          data: error.response.data,
        } : undefined,
      });
    }

    // Check if it's a database error
    if (error.name === 'ValidationError' || error.name === 'MongoError') {
      return res.status(500).json({
        success: false,
        message: 'Database error while saving weather data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching weather',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get weather history for a user
const getWeatherHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 10 } = req.query;

    const weatherHistory = await Weather.find({ userId })
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: weatherHistory,
      count: weatherHistory.length,
    });
  } catch (error) {
    console.error('Get weather history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching weather history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getCurrentWeather,
  getWeatherHistory,
};

