const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

exports.createAuthorizeURL = () => {
    const scopes = ['user-read-private', 'user-read-email', 'user-read-recently-played'];
    return spotifyApi.createAuthorizeURL(scopes);
};

exports.getAccessToken = async (code) => {
    const data = await spotifyApi.authorizationCodeGrant(code);
    return {
        accessToken: data.body['access_token'],
        refreshToken: data.body['refresh_token']
    };
};

exports.setAccessToken = (token) => spotifyApi.setAccessToken(token);
exports.setRefreshToken = (token) => spotifyApi.setRefreshToken(token);

exports.getRecentTracks = async () => {
    const uniqueTracks = new Map(); 
    const limit = 50;
    let offset = 0;
    const requiredUniqueCount = 30;
    let fetchMore = true;

    while (uniqueTracks.size < requiredUniqueCount && fetchMore) {
        const data = await spotifyApi.getMyRecentlyPlayedTracks({ limit, offset });
        const tracks = data.body.items;

        // Add only unique tracks to the map
        tracks.forEach(item => {
            const trackId = item.track.id;
            if (!uniqueTracks.has(trackId)) {
                uniqueTracks.set(trackId, {
                    trackId: item.track.id,
                    trackName: item.track.name,
                    artistName: item.track.artists.map(artist => artist.name).join(', '),
                    albumName: item.track.album.name,
                    playedAt: item.played_at
                });
            }
        });
        offset += limit;
        fetchMore = tracks.length === limit; // Fetch more if full set was returned
    }

    // Extract track IDs to fetch audio features
    const trackIds = Array.from(uniqueTracks.values()).map(track => track.trackId);

    // Fetch audio features for the unique tracks
    const audioFeaturesData = await spotifyApi.getAudioFeaturesForTracks(trackIds);

    const trackFeatures = audioFeaturesData.body.audio_features.map(feature => ({
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
    }));

    // Attach audio features to the tracks
    const tracksWithFeatures = Array.from(uniqueTracks.values()).map(track => {
        const features = trackFeatures.find(f => f.id === track.trackId);
        return {
            ...track,
            audioFeatures: features
        };
    });

    return tracksWithFeatures; // Return the enriched tracks
};
