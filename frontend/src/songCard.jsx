import React from 'react';
import './SongCard.css';

const SongCard = ({ song }) => {
  const { albumArt, trackName, artistName, lyrics } = song;

  return (
    <div className="song-card">
      <img src={albumArt} alt={`${trackName} album cover`} className="album-art" />
      <div className="song-info">
        <h3>{trackName}</h3>
        <p>by {artistName}</p>
        <p className="lyrics">{lyrics}</p>
      </div>
    </div>
  );
};

export default SongCard;