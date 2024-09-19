const express = require('express');
const dotenv = require('dotenv');
const spotifyRoutes = require('./routes/spotifyRoutes'); // Reference the routes

dotenv.config();
const app = express();
const port = 8888;

app.use('/spotify', spotifyRoutes); // Define route base path

app.get('/', (req, res) => {
    res.send('Welcome to Mood Muse! Click <a href="/spotify/login">here</a> to log in.');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
