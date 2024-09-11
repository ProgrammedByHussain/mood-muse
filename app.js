const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
//port on local
const port = 8888;

// init with api specific details
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
  });

// Basic home route
app.get('/', (req, res) => {
    res.send('Welcome to Mood Muse! Click <a href="/login">here</a> to log in.');
  });
  
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

const scopes = ['user-read-private', 'user-read-email', 'user-top-read'];

app.get('/login', (req, res) => {
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authorizeURL);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code || null;
  
    try {
      const data = await spotifyApi.authorizationCodeGrant(code);
      const accessToken = data.body['access_token'];
      const refreshToken = data.body['refresh_token'];
  
      // Save the access token and refresh token
      spotifyApi.setAccessToken(accessToken);
      spotifyApi.setRefreshToken(refreshToken);
  
      res.send('Logged in! You can now use the app.');
    } catch (err) {
      console.error('Error in callback:', err);
      res.send('Something went wrong!');
    }
  });
  
// New route to fetch recently played tracks
app.get('/recent-tracks', async (req, res) => {
    try {
      const data = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 10 });
      const tracks = data.body.items.map(item => ({
        trackName: item.track.name,
        artistName: item.track.artists.map(artist => artist.name).join(', '),
        albumName: item.track.album.name,
        playedAt: item.played_at
      }));
  
      res.json(tracks);
    } catch (err) {
      console.error('Error fetching recently played tracks:', err);
      res.status(500).send('Failed to fetch recently played tracks.');
    }
  });
  
  // Start server
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });