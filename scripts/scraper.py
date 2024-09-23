import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/") 
db = client['mood_muse']  # Database name
lyrics_collection = db['lyrics']  # Collection name

def get_lyrics(genius_url):
    try:
        # Send a GET request to the Genius lyrics page
        response = requests.get(genius_url)
        response.raise_for_status()

        # Parse the page content with BeautifulSoup
        soup = BeautifulSoup(response.content, 'html.parser')

        lyrics = soup.find_all("div", class_="Lyrics__Container")

        # Extract text from the div elements and combine them
        lyrics_text = ""
        for container in lyrics:
            lyrics_text += container.get_text(separator="\n")

        return lyrics_text.strip()

    except Exception as e:
        print(f"Error fetching or parsing lyrics: {e}")
        return None

def store_lyrics(track_id, track_name, artist_name, genius_url):
    lyrics = get_lyrics(genius_url)
    if lyrics:
        # Store in MongoDB
        lyrics_data = {
            'track_id': track_id,
            'track_name': track_name,
            'artist_name': artist_name,
            'genius_url': genius_url,
            'lyrics': lyrics
        }
        lyrics_collection.insert_one(lyrics_data)
        print(f"Lyrics for '{track_name}' by {artist_name} stored successfully.")
    else:
        print(f"Failed to extract lyrics for '{track_name}' by {artist_name}.")

track_id = "real-track-id-from-spotify"
track_name = "real-track-name-from-spotify"
artist_name = "real-artist-name-from-spotify"
genius_url = "https://genius.com/Song-title-lyrics"

store_lyrics(track_id, track_name, artist_name, genius_url)
