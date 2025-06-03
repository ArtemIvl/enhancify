import React from "react";

export default function SpotifyTrackCard({ track, index }) {
  const durationMs = track.duration_ms;
  const durationMin = Math.floor(durationMs / 60000);
  const durationSec = ((durationMs % 60000) / 1000).toFixed(0).padStart(2, '0');

  const album = track.album;
  const artists = track.artists.map((a) => a.name).join(", ");
  const imageUrl = album?.images?.[0]?.url;
  const externalUrl = track.external_urls?.spotify;

  return (
    <div className="w-full border border-gray-900 rounded-md shadow-sm hover:shadow-md transition flex items-center gap-4 p-4">
      <div className="text-xl font-bold text-indigo-600 w-10 text-center">{index + 1}</div>

      {imageUrl && (
        <img
          src={imageUrl}
          alt={track.name}
          className="w-16 h-16 rounded object-cover border-2 border-gray-900"
        />
      )}

      <div className="flex-1">
        <h2 className="font-semibold text-lg text-gray-900">{track.name}</h2>
        <p className="text-indigo-600 font-medium text-base">{artists}</p>

        <div className="mt-1 text-sm text-gray-600 space-y-0.5">
          <div><span className="font-semibold">Album:</span> {album?.name}</div>
          <div><span className="font-semibold">Release Date:</span> {album?.release_date}</div>
          <div><span className="font-semibold">Duration:</span> {durationMin}:{durationSec} min</div>
          <div><span className="font-semibold">Track Popularity:</span> {track.popularity}/100</div>
          <div><span className="font-semibold">Spotify Link:</span>{" "}
            <a href={externalUrl} className="text-blue-600 underline" target="_blank" rel="noreferrer">Open</a>
          </div>
        </div>
      </div>
    </div>
  );
}