import os
import sys
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer

# Connect to MongoDB
uri = os.environ.get("MONGODB_URI")
client = MongoClient(uri)
db = client['moodmuse']
lyrics_collection = db['lyrics']

def fetch_lyrics():
    # Fetch all songs from the MongoDB collection
    songs = lyrics_collection.find({})
    return [(song['track_name'], song['artist_name'], song['lyrics']) for song in songs]

def compute_tfidf(lyrics_list):
    # Initialize the TF-IDF Vectorizer
    vectorizer = TfidfVectorizer()
    
    # Fit and transform the lyrics into TF-IDF features
    tfidf_matrix = vectorizer.fit_transform(lyrics_list)
    
    return tfidf_matrix, vectorizer

def main():
    # Step 1: Fetch the lyrics
    songs = fetch_lyrics()
    
    # Check if there are any songs
    if not songs:
        print("No songs found in the database.")
        return

    # Step 2: Extract only lyrics for TF-IDF processing
    lyrics_list = [lyrics for _, _, lyrics in songs]
    
    # Step 3: Compute TF-IDF
    tfidf_matrix, vectorizer = compute_tfidf(lyrics_list)

    # Output the TF-IDF results
    feature_names = vectorizer.get_feature_names_out()
    for i, song in enumerate(songs):
        track_name, artist_name, _ = song
        print(f"TF-IDF for '{track_name}' by {artist_name}:")
        
        # Get the TF-IDF scores for the current song
        tfidf_scores = tfidf_matrix[i].toarray()[0]
        for j, score in enumerate(tfidf_scores):
            if score > 0:  # Only display non-zero scores
                print(f"  {feature_names[j]}: {score:.4f}")
        print()

if __name__ == "__main__":
    main()
