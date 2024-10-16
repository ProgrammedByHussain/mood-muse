import requests
from bs4 import BeautifulSoup
import os
from ibm_watson import NaturalLanguageUnderstandingV1
from ibm_watson.natural_language_understanding_v1 import Features, EmotionOptions
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# IBM Watson NLU setup
api_key = os.getenv('IBM_API_KEY')
url = os.getenv('IBM_URL')

authenticator = IAMAuthenticator(api_key)
nlu = NaturalLanguageUnderstandingV1(
    version='2023-10-03',  # Change to your Watson NLU version
    authenticator=authenticator
)
nlu.set_service_url(url)

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

def analyze_mood(lyrics):
    try:
        # Analyze the lyrics using Watson NLU for emotion
        response = nlu.analyze(
            text=lyrics,
            features=Features(emotion=EmotionOptions())
        ).get_result()

        # Extract the detected emotions from the response
        emotions = response['emotion']['document']['emotion']
        return emotions
    except Exception as e:
        print(f"Error analyzing lyrics: {e}")
        return None

def process_track(track_id, track_name, artist_name, genius_url):
    # Step 1: Fetch lyrics on the fly
    lyrics = get_lyrics(genius_url)
    
    if lyrics:
        # Step 2: Analyze lyrics with Watson NLU
        mood = analyze_mood(lyrics)
        
        if mood:
            print(f"Mood analysis for '{track_name}' by {artist_name}:")
            for emotion, score in mood.items():
                print(f"  {emotion.capitalize()}: {score:.4f}")
        else:
            print(f"Failed to analyze mood for '{track_name}' by {artist_name}.")
    else:
        print(f"Failed to fetch lyrics for '{track_name}' by {artist_name}.")

if __name__ == "__main__":
    if len(sys.argv) == 5:
        track_id = sys.argv[1]
        track_name = sys.argv[2]
        artist_name = sys.argv[3]
        genius_url = sys.argv[4]
        process_track(track_id, track_name, artist_name, genius_url)
    else:
        print("Invalid arguments. Usage: python3 lyrics_scraper.py <track_id> <track_name> <artist_name> <genius_url>")

