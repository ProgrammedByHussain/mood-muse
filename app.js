const express = require('express');
const dotenv = require('dotenv');
const spotifyRoutes = require('./routes/spotifyRoutes');
const mongoose = require('mongoose');

dotenv.config();
const app = express();
const port = 8888;

// Middleware for parsing JSON
app.use(express.json());

// MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB Atlas successfully');
})
.catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
});

app.use('/spotify', spotifyRoutes); // Define route base path

app.get('/', (req, res) => {
    res.send('Welcome to Mood Muse! Click <a href="/spotify/login">here</a> to log in.');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
