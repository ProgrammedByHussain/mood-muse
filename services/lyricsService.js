const axios = require('axios');

// Genius API base URL
const geniusApiBaseUrl = 'https://api.genius.com';
const geniusAccessToken = process.env.GENIUS_ACCESS_TOKEN;

// Function to fetch lyrics for a song using Genius API
const getLyrics = async (trackName, artistName) => {
    try {
        // Search for the song using the track name and artist name
        const searchUrl = `${geniusApiBaseUrl}/search?q=${encodeURIComponent(trackName)} ${encodeURIComponent(artistName)}`;
        const response = await axios.get(searchUrl, {
            headers: {
                Authorization: `Bearer ${geniusAccessToken}`
            }
        });

        const hits = response.data.response.hits;
        if (hits.length > 0) {
            // Find the best match (first hit)
            const songPath = hits[0].result.path;
            const lyricsPageUrl = `https://genius.com${songPath}`;
            return lyricsPageUrl; // Return the lyrics page URL
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error fetching lyrics for ${trackName} by ${artistName}:`, error);
        return null;
    }
};

module.exports = { getLyrics };

const { exec } = require('child_process');

function getLyricsFromPython(trackId, trackName, artistName, geniusUrl) {
    exec(`python3 scraper.py ${trackId} "${trackName}" "${artistName}" ${geniusUrl}`, (error) => {
        if (error) {
            console.error(`Error executing Python script: ${error}`);
        } else {
            console.log(`Lyrics for '${trackName}' by ${artistName} are being processed and stored in MongoDB.`);
        }
    });
}
