import { useEffect, useState } from 'react';
import "../index.css"
import "./WelcomeMessage.css"

export default function Unauthorized() {
  const handleLogin = () => {
    window.location.href = "http://localhost:8000/login";
  };

  return (
    <div className="unauthorized-container mt-[0px] flex flex-col justify-center space-y-6">
        <div className="spotify-container">
        <div className="unauthorized-rectangle-background"><div className="unauthorized-text">To access this content please connect your Spotify account</div></div>
        <button onClick={handleLogin} class="spotify-button">
        <img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
            alt="Spotify Logo" class="spotify-logo"></img>
        Sign in with Spotify
        </button>
    </div>
    </div>
  );
}