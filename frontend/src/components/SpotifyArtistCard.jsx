// SpotifyArtistCard.jsx
import React from "react";

export default function SpotifyArtistCard({ artist, index }) {
  return (
    <div className="flex gap-4 p-4 border border-gray-800 rounded items-center">
      <div className="text-2xl w-8 text-center text-indigo-400">{index + 1}</div>
      <img
        src={artist.images?.[0]?.url}
        alt={artist.name}
        className="w-16 h-16 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="font-bold text-lg">{artist.name}</div>
        {artist.genres.length > 0 && (
          <div className="text-sm text-gray-400 mb-1">
            <strong>Genres:</strong> {artist.genres.join(", ")}
          </div>
        )}
        <div className="text-sm text-gray-400">
          <strong>Popularity:</strong> {artist.popularity}
        </div>
        <div className="text-sm text-gray-400">
          <strong>Followers:</strong> {artist.followers.total.toLocaleString()}
        </div>
        <div className="text-sm text-gray-400">
          <strong>Spotify URL:</strong>{" "}
          <a
            href={artist.external_urls.spotify}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:underline"
          >
            Open in Spotify
          </a>
        </div>
      </div>
    </div>
  );
}