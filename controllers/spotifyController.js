const axios = require('axios');

// Cache for access token
let accessToken = null;
let tokenExpiry = null;

// Get Spotify access token using client credentials flow
const getAccessToken = async () => {
  try {
    // Check if we have a valid cached token
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
      return accessToken;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Spotify credentials not configured');
    }

    // Get access token using client credentials flow
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
      }
    );

    accessToken = response.data.access_token;
    // Set expiry to 5 minutes before actual expiry for safety
    tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

    return accessToken;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    throw error;
  }
};

// Map mood to Spotify search queries
const getMoodSearchQuery = (mood) => {
  const moodQueries = {
    happy: 'happy upbeat energetic',
    calm: 'calm peaceful relaxing',
    sad: 'sad melancholic emotional',
    angry: 'intense powerful aggressive',
    neutral: 'ambient chill',
  };
  return moodQueries[mood] || 'chill';
};

// Get Spotify playlists based on mood
const getSpotifyPlaylists = async (req, res) => {
  try {
    const { mood } = req.query;

    if (!mood) {
      return res.status(400).json({
        success: false,
        message: 'Mood parameter is required',
      });
    }

    // Get access token
    const token = await getAccessToken();

    // Build search query based on mood
    const searchQuery = getMoodSearchQuery(mood);
    
    // Search for playlists
    const searchResponse = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=playlist&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    // Validate response structure
    if (!searchResponse.data || !searchResponse.data.playlists || !Array.isArray(searchResponse.data.playlists.items)) {
      console.error('Invalid Spotify API response structure:', searchResponse.data);
      return res.status(500).json({
        success: false,
        message: 'Invalid response from Spotify API',
        error: process.env.NODE_ENV === 'development' ? 'Missing or invalid playlists data' : undefined,
      });
    }

    // Filter out null items and map to our format
    const playlists = searchResponse.data.playlists.items
      .filter((playlist) => playlist && playlist.id) // Filter out null/undefined items
      .map((playlist) => ({
        id: playlist.id,
        name: playlist.name || 'Untitled Playlist',
        description: playlist.description || '',
        image: playlist.images && playlist.images.length > 0 ? playlist.images[0].url : null,
        owner: playlist.owner?.display_name || playlist.owner?.id || 'Spotify',
        tracks: playlist.tracks?.total || 0,
        spotifyUrl: playlist.external_urls?.spotify || `https://open.spotify.com/playlist/${playlist.id}`,
      }));

    res.status(200).json({
      success: true,
      data: playlists,
      mood: mood,
      count: playlists.length,
    });
  } catch (error) {
    console.error('Get Spotify playlists error:', error);
    
    if (error.response) {
      return res.status(error.response.status || 500).json({
        success: false,
        message: 'Error fetching Spotify playlists',
        error: process.env.NODE_ENV === 'development' ? error.response.data : undefined,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching Spotify playlists',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get a specific playlist's tracks
const getPlaylistTracks = async (req, res) => {
  try {
    const { playlistId } = req.params;

    if (!playlistId) {
      return res.status(400).json({
        success: false,
        message: 'Playlist ID is required',
      });
    }

    // Get access token
    const token = await getAccessToken();

    // Get playlist tracks
    const tracksResponse = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const tracks = tracksResponse.data.items
      .filter((item) => item.track) // Filter out null tracks
      .map((item) => ({
        id: item.track.id,
        name: item.track.name,
        artists: item.track.artists.map((artist) => artist.name).join(', '),
        album: item.track.album.name,
        image: item.track.album.images && item.track.album.images.length > 0 
          ? item.track.album.images[item.track.album.images.length - 1].url 
          : null,
        duration: item.track.duration_ms,
        spotifyUrl: item.track.external_urls.spotify,
        previewUrl: item.track.preview_url,
      }));

    res.status(200).json({
      success: true,
      data: tracks,
      count: tracks.length,
    });
  } catch (error) {
    console.error('Get playlist tracks error:', error);
    
    if (error.response) {
      return res.status(error.response.status || 500).json({
        success: false,
        message: 'Error fetching playlist tracks',
        error: process.env.NODE_ENV === 'development' ? error.response.data : undefined,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching playlist tracks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getSpotifyPlaylists,
  getPlaylistTracks,
};

