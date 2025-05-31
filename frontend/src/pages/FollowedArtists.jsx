import { useEffect, useState } from "react";

export default function FollowedArtists() {
  const [artists, setArtists] = useState([]);
  const token = localStorage.getItem("spotify_token");

  useEffect(() => {
    if (!token) return;
    fetch(`http://localhost:8000/followed_artists?token=${token}`)
      .then((res) => res.json())
      .then((data) => setArtists(data))
      .catch(console.error);
  }, [token]);

  return (
    <body>
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Followed Artists</h2>
      {artists.length === 0 ? (
        <div>No followed artists found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {artists.map((artist) => (
            <div key={artist.id} className="bg-gray-800 p-4 rounded">
              <img src={artist.images?.[0]?.url} alt={artist.name} className="w-full h-auto rounded" />
              <div className="mt-2 text-center">{artist.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
    </body>
  );
}