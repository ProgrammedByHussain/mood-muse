import requests
from bs4 import BeautifulSoup
import os
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

def get_lyrics(genius_url):
    try:
        # Send a GET request to the Genius lyrics page
        response = requests.get(genius_url)
        response.raise_for_status()

        # Parse the page content with BeautifulSoup
        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract lyrics from the div containers
        lyrics = soup.find_all("div", class_="Lyrics__Container")

        # Combine all the lyrics text
        lyrics_text = ""
        for container in lyrics:
            lyrics_text += container.get_text(separator="\n")

        return lyrics_text.strip()

    except Exception as e:
        print(f"Error fetching or parsing lyrics: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) == 5:
        track_id = sys.argv[1]
        track_name = sys.argv[2]
        artist_name = sys.argv[3]
        genius_url = sys.argv[4]
        get_lyrics(genius_url)
    else:
        print("Invalid arguments. Usage: python3 lyrics_scraper.py <track_id> <track_name> <artist_name> <genius_url>")

