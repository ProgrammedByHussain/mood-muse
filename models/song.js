const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    trackName: {
        type: String,
        required: true,
    },
    artistName: {
        type: String,
        required: true,
    },
    lyrics: {
        type: String,
        required: true,
    },
    mood: {
        type: String,
        required: true,
    },
});

const Song = mongoose.model('Song', songSchema);

module.exports = Song;
