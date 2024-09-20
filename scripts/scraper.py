import requests
from bs4 import BeautifulSoup

def get_lyrics(genius_url):
    try:
        # Send a GET request to the Genius lyrics page
        response = requests.get(genius_url)

        # Raise an exception if there's an issue with the request
        response.raise_for_status()

        # Parse the page content with BeautifulSoup
        soup = BeautifulSoup(response.content, 'html.parser')

        
        lyrics = soup.find_all("div", class_="Lyrics__Container")

        # Extract text from the div elements and combine them
        lyrics_text = ""
        for container in lyrics:
            # Join all text portions within each <div>
            lyrics_text += container.get_text(separator="\n")

        return lyrics_text.strip()

    except Exception as e:
        print(f"Error fetching or parsing lyrics: {e}")
        return None

genius_url = "https://genius.com/Song-title-lyrics"
lyrics = get_lyrics(genius_url)
if lyrics:
    print("Lyrics extracted successfully:")
    print(lyrics)
else:
    print("Failed to extract lyrics.")
