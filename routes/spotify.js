const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getSpotifyPlaylists, getPlaylistTracks } = require('../controllers/spotifyController');

// All Spotify routes require authentication
router.use(authenticate);

// GET /api/spotify/playlists?mood=happy - Get playlists based on mood
router.get('/playlists', getSpotifyPlaylists);

// GET /api/spotify/playlists/:playlistId/tracks - Get tracks from a specific playlist
router.get('/playlists/:playlistId/tracks', getPlaylistTracks);

module.exports = router;

