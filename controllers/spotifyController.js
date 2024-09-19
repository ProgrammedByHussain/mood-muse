const spotifyService = require('../services/spotifyService');

exports.login = (req, res) => {
    const authorizeURL = spotifyService.createAuthorizeURL();
    res.redirect(authorizeURL);
};

exports.callback = async (req, res) => {
    const code = req.query.code || null;
    try {
        const { accessToken, refreshToken } = await spotifyService.getAccessToken(code);
        spotifyService.setAccessToken(accessToken);
        spotifyService.setRefreshToken(refreshToken);

        res.send(`
            <h1>Logged in!</h1>
            <p>You can now use the app.</p>
            <p>Check your <a href="/spotify/recent-tracks">Recently Played Tracks</a>.</p>
        `);
    } catch (err) {
        res.send('Something went wrong!');
    }
};

exports.getRecentTracks = async (req, res) => {
    try {
        const tracksWithFeatures = await spotifyService.getRecentTracks();
        res.json(tracksWithFeatures);
    } catch (err) {
        res.status(500).send('Failed to fetch recently played tracks.');
    }
};
