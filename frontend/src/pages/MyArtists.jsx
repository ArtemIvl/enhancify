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
  const [descAscFilter, setDescAscFilter] = useState("desc");
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
    <div className="px-14">
      <div className="text-2xl font-semibold font-bold py-3">Your most listened artists and tracks</div>
      <div className="mb-[2vw] italic">No need to wait for Wrapped.</div>
      <div className="flex w-full justify-between items-center gap-4">
        <div className="flex gap-4 w-[25%]">
          <button
            className={`rounded-xl py-3 px-7 flex cursor-pointer font-base text-sm items-center gap-3 ${tab === "tracks" ? "bg-[#2e2e2e] text-white" : "bg-[#d3cfce]"}`}
            onClick={() => setTab("tracks")}
            onMouseDown={e => (e.currentTarget.style.transform = "scale(0.95)")}
            onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <FaMicrophone className="w-4 h-4"/>
            Top Songs
          </button>
          <button
            className={`px-7 py-3 rounded-xl flex text-sm cursor-pointer font-base items-center gap-3 ${tab === "artists" ? "bg-[#2e2e2e] text-white" : "bg-[#d3cfce]"}`}
            onClick={() => setTab("artists")}
            onMouseDown={e => (e.currentTarget.style.transform = "scale(0.95)")}
            onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <FaMusic className="w-4 h-4"/>
            Top Artists
          </button>
          </div>
          <div className="h-[2.5vw] w-[2%]"><div className="w-[2px] h-full color-[#2e2e2e] bg-[#2e2e2e]"></div></div>

        <div className="flex gap-8 w-[67%]">
          <div className="flex h-[2.75vw] text-[14px]">
          <button onClick={() => setTimeRange("short_term")} className={`cursor-pointer rounded-tl-3xl rounded-bl-3xl w-[9vw] py-3 ${
            timeRange === "short_term"
              ? "bg-[#2e2e2e] text-white"
              : "bg-[#f5f5f5] text-black"
          }`}>Last 4 weeks</button>
          <div className=" h-[100%] bg-black w-[1px]"></div>
          <button onClick={()=>setTimeRange("medium_term")} className={`cursor-pointer w-[9vw] py-3 ${
            timeRange === "medium_term"
              ? "bg-[#2e2e2e] text-white"
              : "bg-[#f5f5f5] text-black"
          }`}>Last 6 months</button>
          <div className="h-[100%] bg-black w-[1px]"></div>
          <button onClick={()=>setTimeRange("long_term")} className={`w-[9vw] rounded-br-3xl rounded-tr-3xl py-3 cursor-pointer ${
            timeRange === "long_term"
              ? "bg-[#2e2e2e] text-white"
              : "bg-[#f5f5f5] text-black"
          }`}>All time</button>
          </div>
          <div className="ml-[3.5vw] flex items-center w-[35%] relative rounded-3xl">
            <input
              type="text"
              placeholder={tab === "artists" ? "Search artists by name..." : "Search tracks by name..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 text-sm h-[2.6vw] rounded-2xl bg-[#f5f5f5] text-black placeholder-[#868686] focus:outline-none shadow-md"
            />
            
            <button
            className="absolute right-0 top-[4px] w-[18%] h-[2.3vw] w-16 text-black bg-[#f5f5f5] border-l rounded-r-2xl flex items-center justify-center ">
              <FaSearch className="text-black cursor-pointer" />
            </button>
          </div>
        </div>
      </div>
      {(!token || unauthorized) ? <Unauthorized></Unauthorized> : (<>
      {isLoading && (
        <Loading />
      )}

      {!isLoading && tab === "tracks" && (
        <div>
          <div className="w-full sticky top-0 z-10 grid grid-cols-[26%_74%] mt-[2.5vh] py-4 text-[13px] bg-[#d3cfce] my-2 pl-4">
            {/* Left Column Header */}
            <div className="ml-[0.5vw] flex items-center gap-4">
              <div className="w-6 pl-4">#</div>
              <div className="w-24" /> {/* Empty space for image */}
              <div>Track</div>
            </div>

            {/* Right Column Headers */}
            <div className="ml-[1vw] grid grid-cols-5 items-center text-center">
              <div>Global popularity</div>
              <div>Release Date</div>
              <div>Album</div>
              <div>Duration (min)</div>
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
          <div className="flex flex-col gap-x-6 gap-y-5 w-full grid grid-cols grid-cols-[repeat(auto-fill,_minmax(34ch,1fr))] mt-[6.5vh]">
            {filteredArtists.map((artist, index) => (
              <SpotifyArtistCard key={artist.id} artist={artist} rank={artist.rank} />
            ))}
          </div>
      )}
      <div className="mb-2"></div></>)}
    </div>
    </>
  );
}