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

const scopes = ['user-read-private', 'user-read-email', 'user-read-recently-played'];

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
      console.log('Access Token:', accessToken);
      spotifyApi.setRefreshToken(refreshToken);
  
      res.send(`
      <h1>Logged in!</h1>
      <p>You can now use the app.</p>
      <p>Check your <a href="/recent-tracks">Recently Played Tracks</a>.</p>
      `);
    } catch (err) {
      console.error('Error in callback:', err);
      res.send('Something went wrong!');
    }
  });
  
// New route to fetch recently played tracks that are all different
app.get('/recent-tracks', async (req, res) => {
    const uniqueTracks = new Map(); // map to store unique ID
    const limit = 50;
    let offset = 0;
    const requiredUniqueCount = 30; //min number of unique tracks
    let fetchMore = true;
  
    try {
      while (uniqueTracks.size < requiredUniqueCount && fetchMore) {
        const data = await spotifyApi.getMyRecentlyPlayedTracks({
          limit: limit,
          offset: offset,
        });
  
        const tracks = data.body.items;
  
        // Add only unique tracks (based on track ID) to the Map
        tracks.forEach(item => {
          const trackId = item.track.id;
          if (!uniqueTracks.has(trackId)) {
            uniqueTracks.set(trackId, {
              trackName: item.track.name,
              artistName: item.track.artists.map(artist => artist.name).join(', '),
              albumName: item.track.album.name,
              playedAt: item.played_at
            });
          }
        });
  
        offset += limit;
  
        fetchMore = tracks.length === limit;
      }
  
      // Extract the track IDs to fetch audio features
      const trackIds = Array.from(uniqueTracks.values()).map(track => track.trackId);

      // Fetch audio features for the unique tracks
      const audioFeaturesData = await spotifyApi.getAudioFeaturesForTracks(trackIds);
      const trackFeatures = audioFeaturesData.body.audio_features.map(feature => {
          return {
              id: feature.id,
              danceability: feature.danceability,
              energy: feature.energy,
              valence: feature.valence,
              tempo: feature.tempo,
              acousticness: feature.acousticness,
              instrumentalness: feature.instrumentalness,
              liveness: feature.liveness,
              loudness: feature.loudness,
              speechiness: feature.speechiness,
          };
      });

      // Attach the audio features to the tracks
      const tracksWithFeatures = Array.from(uniqueTracks.values()).map(track => {
          const features = trackFeatures.find(f => f.id === track.trackId);
          return {
              ...track,
              audioFeatures: features
          };
      });
    } catch (err) {
      console.error('Error fetching recently played tracks:', err);
      res.status(500).send('Failed to fetch recently played tracks.');
    }
  });


