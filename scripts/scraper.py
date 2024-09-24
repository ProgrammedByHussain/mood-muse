import requests
from bs4 import BeautifulSoup

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://moodmuse:<db_password>@moodmuse.uc9wd.mongodb.net/?retryWrites=true&w=majority&appName=moodmuse"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

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

if __name__ == "__main__":
    if len(sys.argv) == 5:
        track_id = sys.argv[1]
        track_name = sys.argv[2]
        artist_name = sys.argv[3]
        genius_url = sys.argv[4]
        store_lyrics(track_id, track_name, artist_name, genius_url)
    else:
        print("Invalid arguments. Usage: python3 lyrics_scraper.py <track_id> <track_name> <artist_name> <genius_url>")

