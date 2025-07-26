import { useEffect, useState } from "react";
import { useAuth } from "../services/AuthContext";
import SpotifyArtistCard from "../components/SpotifyArtistCard";
import SpotifyTrackCard from "../components/SpotifyTrackCard";
import { fetchMySongs, fetchMyArtists } from "../services/api";
import Loading from "../components/Loading";
import DropdownComponent from "../components/DropdownComponent.jsx"
import { FaMusic, FaSearch, FaMicrophone } from "react-icons/fa";
import "../Concerts.css"
import Unauthorized from "../components/Unauthorized.jsx";

export default function TopContent() {
  const [tab, setTab] = useState("tracks");
  const [timeRange, setTimeRange] = useState("medium_term");
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const { token, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let data;
        if (tab === "tracks") {
          data = await fetchMySongs(timeRange, token);
          if (!data || data.status === 401 || data.status === 400) {
            logout();
            return;
          }
          setTracks(data.map((track, index) => ({ ...track, rank: index + 1 })));
        } else {
          data = await fetchMyArtists(timeRange, token);
          if (!data || data.status === 401 || data.status === 400) {
            logout();
            return;
          }
          setArtists(data.map((artist, index) => ({ ...artist, rank: index + 1 })));
        }
      } catch (err) {
        console.error(err);
        setUnauthorized(true)
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, tab, timeRange]);

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTracks = tracks.filter((track) =>
    track.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
    <div className="px-8">
      <div className="text-2xl font-bold py-4">Your personal TOP 50</div>
      <div className="flex w-full justify-between items-center gap-4">
        <div className="flex gap-4 w-1/3">
          <button
            className={`rounded-md py-3 px-6 flex cursor-pointer font-light text-sm items-center gap-3 ${tab === "tracks" ? "bg-[#2e2e2e] text-white" : "bg-[#d3cfce]"}`}
            onClick={() => setTab("tracks")}
            onMouseDown={e => (e.currentTarget.style.transform = "scale(0.95)")}
            onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <FaMicrophone className="w-4 h-4"/>
            Top Songs
          </button>
          <button
            className={`px-6 py-3 rounded-md flex text-sm cursor-pointer font-light items-center gap-3 ${tab === "artists" ? "bg-[#2e2e2e] text-white" : "bg-[#d3cfce]"}`}
            onClick={() => setTab("artists")}
            onMouseDown={e => (e.currentTarget.style.transform = "scale(0.95)")}
            onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <FaMusic className="w-4 h-4"/>
            Top Artists
          </button>
        </div>

        <div className="flex gap-8 w-2/3">
          <div className="flex items-center w-3/4 relative rounded-2xl shadow-md">
            <input
              type="text"
              placeholder={tab === "artists" ? "Search artists by name..." : "Search tracks by name..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-2xl bg-white text-black placeholder-[#868686] focus:outline-none"
            />
            <button
            className="absolute right-0 top-0 h-full w-16 bg-black rounded-r-2xl flex items-center justify-center cursor-pointer">
              <FaSearch className="text-white" />
            </button>
          </div>

          <DropdownComponent
            title="Select time range"
            options={["short_term", "medium_term", "long_term"]}
            value={timeRange}
            onChange={(val) => setTimeRange(val)}
            isOpen={openDropdown === "time-range"}
            setOpenDropdown={setOpenDropdown}
            id="time-range"
          />
        </div>
      </div>
      {(!token || unauthorized) ? <Unauthorized></Unauthorized> : (<>
      {isLoading && (
        <Loading />
      )}

      {!isLoading && tab === "tracks" && (
        <div>
          <div className="w-full sticky top-0 z-10 grid grid-cols-[26%_74%] py-4 text-[12px] bg-[#d3cfce] my-2 pl-4">
            {/* Left Column Header */}
            <div className="flex items-center gap-4">
              <div className="w-6 pl-4">#</div>
              <div className="w-24" /> {/* Empty space for image */}
              <div>Name</div>
            </div>

            {/* Right Column Headers */}
            <div className="grid grid-cols-6 items-center text-center">
              <div>Artist</div>
              <div>Album</div>
              <div>Release Date</div>
              <div>Duration</div>
              <div>Popularity Index</div>
              <div>Spotify Page</div>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full">
            {filteredTracks.map((track, index) => (
              <SpotifyTrackCard key={track.id} track={track} rank={track.rank} />
            ))}
          </div>
        </div>
      )}

      {!isLoading && tab === "artists" && (
        <div>
          <div className="w-full sticky top-0 z-10 grid grid-cols-[26%_74%] py-4 text-[12px] bg-[#d3cfce] my-2 pl-4">
            {/* Left Column Header */}
            <div className="flex items-center gap-4">
              <div className="w-6 pl-4">#</div>
              <div className="w-24" /> {/* Empty space for image */}
              <div>Name</div>
            </div>

            {/* Right Column Headers */}
            <div className="grid grid-cols-4 items-center text-center">
              <div>Genres</div>
              <div>Popularity Index</div>
              <div>Followers on Spotify</div>
              <div>Spotify Profile link</div>
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full">
            {filteredArtists.map((artist, index) => (
              <SpotifyArtistCard key={artist.id} artist={artist} rank={artist.rank} />
            ))}
          </div>
        </div>
      )}
      <div className="mb-2"></div></>)}
    </div>
    </>
  );
}