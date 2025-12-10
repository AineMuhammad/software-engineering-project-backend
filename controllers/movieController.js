const axios = require('axios');

// Map mood to TMDB genre IDs
const getMoodGenreId = (mood) => {
  const genreMap = {
    happy: 35,      // Comedy
    calm: 16,      // Animation
    sad: 18,       // Drama
    angry: 28,     // Action (intense/aggressive)
    neutral: 99,   // Documentary (calm/neutral)
  };
  return genreMap[mood] || 35; // Default to comedy
};

// Get movies based on mood
const getMoviesByMood = async (req, res) => {
  try {
    const { mood } = req.query;

    if (!mood) {
      return res.status(400).json({
        success: false,
        message: 'Mood parameter is required',
      });
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'TMDB API key not configured',
      });
    }

    // Get genre ID for the mood
    const genreId = getMoodGenreId(mood);

    // Fetch movies from TMDB
    const response = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=popularity.desc&page=1`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    // Validate response structure
    if (!response.data || !Array.isArray(response.data.results)) {
      console.error('Invalid TMDB API response structure:', response.data);
      return res.status(500).json({
        success: false,
        message: 'Invalid response from TMDB API',
        error: process.env.NODE_ENV === 'development' ? 'Missing or invalid movies data' : undefined,
      });
    }

    // Map TMDB movie data to our format
    const movies = response.data.results
      .filter((movie) => movie && movie.id) // Filter out null/undefined items
      .slice(0, 20) // Limit to 20 movies
      .map((movie) => ({
        id: movie.id,
        title: movie.title || 'Untitled Movie',
        overview: movie.overview || '',
        releaseDate: movie.release_date || '',
        rating: movie.vote_average || 0,
        voteCount: movie.vote_count || 0,
        posterPath: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
          : null,
        backdropPath: movie.backdrop_path 
          ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` 
          : null,
        tmdbUrl: `https://www.themoviedb.org/movie/${movie.id}`,
        genreIds: movie.genre_ids || [],
      }));

    res.status(200).json({
      success: true,
      data: movies,
      mood: mood,
      genreId: genreId,
      count: movies.length,
    });
  } catch (error) {
    console.error('Get movies by mood error:', error);
    
    if (error.response) {
      return res.status(error.response.status || 500).json({
        success: false,
        message: 'Error fetching movies from TMDB',
        error: process.env.NODE_ENV === 'development' ? error.response.data : undefined,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching movies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get movie details by ID
const getMovieDetails = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID is required',
      });
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'TMDB API key not configured',
      });
    }

    // Fetch movie details from TMDB
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    const movie = {
      id: response.data.id,
      title: response.data.title,
      overview: response.data.overview,
      releaseDate: response.data.release_date,
      rating: response.data.vote_average,
      voteCount: response.data.vote_count,
      runtime: response.data.runtime,
      genres: response.data.genres || [],
      posterPath: response.data.poster_path 
        ? `https://image.tmdb.org/t/p/w500${response.data.poster_path}` 
        : null,
      backdropPath: response.data.backdrop_path 
        ? `https://image.tmdb.org/t/p/w1280${response.data.backdrop_path}` 
        : null,
      tmdbUrl: `https://www.themoviedb.org/movie/${response.data.id}`,
      homepage: response.data.homepage,
    };

    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    console.error('Get movie details error:', error);
    
    if (error.response) {
      return res.status(error.response.status || 500).json({
        success: false,
        message: 'Error fetching movie details from TMDB',
        error: process.env.NODE_ENV === 'development' ? error.response.data : undefined,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching movie details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getMoviesByMood,
  getMovieDetails,
};

