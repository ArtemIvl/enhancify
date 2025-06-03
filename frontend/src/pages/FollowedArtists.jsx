import { useEffect, useState } from "react";
import { useAuth } from "../services/AuthContext";
import SpotifyArtistCard from "../components/SpotifyArtistCard";
import SpotifyTrackCard from "../components/SpotifyTrackCard";

export default function TopContent() {
  const [tab, setTab] = useState("tracks");
  const [timeRange, setTimeRange] = useState("medium_term");
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const url =
      tab === "tracks"
        ? `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`
        : `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${timeRange}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (tab === "tracks") setTracks(data.items || []);
        else setArtists(data.items || []);
      })
      .catch(console.error);
  }, [token, tab, timeRange]);

  if (!token) return <div className="p-4">Login to view info please.</div>;

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded cursor-pointer ${tab === "tracks" ? "bg-[#2e2e2e] text-white" : "bg-[#d3cfce]"}`}
          onClick={() => setTab("tracks")}
        >
          Top Songs
        </button>
        <button
          className={`px-4 py-2 rounded cursor-pointer ${tab === "artists" ? "bg-[#2e2e2e] text-white" : "bg-[#d3cfce]"}`}
          onClick={() => setTab("artists")}
        >
          Top Artists
        </button>

        <select
          className="ml-auto bg-gray-700 text-white px-3 py-2 rounded"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="short_term">Last 4 weeks</option>
          <option value="medium_term">Last 6 months</option>
          <option value="long_term">All time</option>
        </select>
      </div>

      {tab === "tracks" && (
        <div className="space-y-4">
          {tracks.map((track, index) => (
            <SpotifyTrackCard key={track.id} track={track} index={index} />
          ))}
        </div>
      )}

      {tab === "artists" && (
        <div className="space-y-4">
          {artists.map((artist, index) => (
            <SpotifyArtistCard key={artist.id} artist={artist} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}