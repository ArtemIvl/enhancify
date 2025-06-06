import { useEffect, useState } from "react";
import { useAuth } from "../services/AuthContext";
import SpotifyArtistCard from "../components/SpotifyArtistCard";
import SpotifyTrackCard from "../components/SpotifyTrackCard";
import { fetchMySongs, fetchMyArtists } from "../services/api";

export default function TopContent() {
  const [tab, setTab] = useState("tracks");
  const [timeRange, setTimeRange] = useState("medium_term");
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        if (tab === "tracks") {
          const songs = await fetchMySongs(timeRange, token);
          setTracks(songs);
        } else {
          const artists = await fetchMyArtists(timeRange, token);
          setArtists(artists);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
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