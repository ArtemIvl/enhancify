import { useEffect, useState } from "react";
import ArtistCard from "../components/ArtistCard.jsx";
import { fetchMyArtists, fetchTopArtists } from "../services/api.js";
import Loading from '../components/Loading.jsx';
import DropdownComponent from "../components/DropdownComponent.jsx"
import { FaChevronDown, FaTimes, FaChevronUp } from "react-icons/fa";
import DropdownComponentDescription from "../components/DropdownComponentDescription.jsx";

export default function Home() {
  const [artists, setArtists] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sort24hAsc, setSort24hAsc] = useState(null);
  const [sortMonthlyAsc, setSortMonthlyAsc] = useState(null);
  const [sortByListenersAsc, setSortByListenersAsc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchPresetOption, setSearchPresetOption] = useState(null);
  
  const artistsPerPage = 100;

  function fadeOut() {
  const el = document.getElementById("box");
  el.classList.add("opacity-0", "translate-x-[100%]");
  setTimeout(() => {
    el.style.display = "none";
  }, 700)
  const el2 = document.getElementById("box2");
  el2.classList.add("opacity-0", "translate-x-[100%]");
  setTimeout(() => {
    el2.style.display = "none";
  }, 700)
}

  useEffect(() => {
    fetchTopArtists()
      .then((data) => {
        const top = data["Top 10000"] || [];
        setArtists(top);
        setFiltered(top);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      })
  }, []);

  function filterLeaderboardByUsersMostListened(artists) {
    
  }
  useEffect(() => {
    setGenreFilter(null)
    setCountryFilter(null)
    setSort24hAsc(null);
    setSortByListenersAsc(null);
    setSortMonthlyAsc(null);
    if (searchPresetOption === "trending") {
      //select artists who climbed the most positions
    }
    else if (searchPresetOption === "winners") {
      setSortMonthlyAsc(true);
    }
    else if (searchPresetOption === "favourite") {
      const token = localStorage.getItem("spotify_token");
      const timeRange = "medium_term"
      fetchMyArtists(timeRange, token).then(artists => {

      })

    }
    else if (searchPresetOption === "classical") {
      setGenreFilter("Classical")
    }
    else if (searchPresetOption === "french_rap") {
      setGenreFilter("Pop")
      setCountryFilter("France")
    }
    else if (searchPresetOption === "german_techno") {
      setGenreFilter("Electronic")
      setCountryFilter("Germany")
    }
    else if (searchPresetOption === "english_rock") {
      setGenreFilter("Rock")
      setCountryFilter("United Kingdom")
    }
  }, [searchPresetOption]);

  useEffect(() => {
    const parser = new DOMParser();
    const q = search.toLowerCase();

    let filteredList = artists.filter((artist) => {
      const doc = parser.parseFromString(artist["Artist"], "text/html");
      const artistName = doc.body.textContent || "";

      const matchesSearch = artistName.toLowerCase().includes(q);
      const matchesCountry = countryFilter ? artist.Country === countryFilter : true;
      const matchesGenre = genreFilter ? artist.Genre && artist.Genre.includes(genreFilter) : true;

      return matchesSearch && matchesCountry && matchesGenre;
    });

    if (sort24hAsc !== null) {
      filteredList = filteredList.sort((a, b) =>
        sort24hAsc
          ? parseFloat(b["Change vs yesterday"].replace(/,/g, '')) - parseFloat(a["Change vs yesterday"].replace(/,/g, ''))
          : parseFloat(a["Change vs yesterday"].replace(/,/g, '')) - parseFloat(b["Change vs yesterday"].replace(/,/g, ''))
      );
    } else if (sortMonthlyAsc !== null) {
      filteredList = filteredList.sort((a, b) =>
        sortMonthlyAsc
          ? parseFloat(b["Change vs last month"].replace(/,/g, '')) - parseFloat(a["Change vs last month"].replace(/,/g, ''))
          : parseFloat(a["Change vs last month"].replace(/,/g, '')) - parseFloat(b["Change vs last month"].replace(/,/g, ''))
      );
    } else if (sortByListenersAsc !== null) {
      filteredList = filteredList.sort((a, b) =>
        sortByListenersAsc
          ? parseFloat(a["Monthly listeners (millions)"]?.replace(/,/g, '') || 0) - parseFloat(b["Monthly listeners (millions)"]?.replace(/,/g, '') || 0)
          : parseFloat(b["Monthly listeners (millions)"]?.replace(/,/g, '') || 0) - parseFloat(a["Monthly listeners (millions)"]?.replace(/,/g, '') || 0)
      );
    }

    setFiltered(filteredList);
    setCurrentPage(1);
  }, [search, countryFilter, genreFilter, artists, sort24hAsc, sortMonthlyAsc, sortByListenersAsc]);

  // Extract unique countries and genre for filter dropdowns
  const uniqueCountries = Array.from(new Set(artists.map((a) => a.Country))).filter(Boolean).sort();
  // genre might be array per artist, so flatten all and then unique
  const allGenres = artists.flatMap((a) => a.Genre || []);
  const uniqueGenres = Array.from(new Set(allGenres)).sort();

  // Pagination logic
  const lastIndex = currentPage * artistsPerPage;
  const firstIndex = lastIndex - artistsPerPage;
  const currentArtists = filtered.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filtered.length / artistsPerPage);

  return (
    <div className="px-11">
    <div className="text-xl font-bold py-4">Most listened artists on Spotify</div>
    <div className="flex flex-row mt-[1vh] mb-[2vh] items-stretch">
    <div className="flex-[3.6] flex flex-col gap-6">
      <div>Select search filters yourself</div>
      <div className="flex gap-6">
      <div className="w-[42%]">
        {/* Search bar */}
          <input
          type="text"
          placeholder="Search artists by name..."
          value={search}
          onChange={
            (e) => {
              setSearch(e.target.value)
              fadeOut()
            }
          }
          className="px-4 py-2.5 w-full text-sm rounded-2xl bg-white shadow-md rounded-2xl text-black placeholder-[#868686] focus:outline-none"
        />
        </div>
        {/*
        <button onClick={() => { functionality for resetting the filters
          setCountryFilter("");
          setGenreFilter("");
          setSort24hAsc(null);
          setSortMonthlyAsc(null);
          setSortByListenersAsc(null);
          setSearch("");
        }} */}
        {/* Filters */}
        <div className="gap-5 w-[26%]">
          {/* Country Filter */}
        <DropdownComponent
            title="Filter by country"
            options={uniqueCountries}
            value={countryFilter}
            onChange={setCountryFilter}
            isOpen={openDropdown === "country"}
            setOpenDropdown={setOpenDropdown}
            id="country"
          />
          </div>
          <div className="gap-5 w-[26%]">

          {/* Genre Filter */}
          <DropdownComponent
            title="Filter by genre"
            options={uniqueGenres}
            value={genreFilter}
            onChange={setGenreFilter}
            isOpen={openDropdown === "genre"}
            setOpenDropdown={setOpenDropdown}
            id="genre"
          />
        </div>

      </div>
      </div>
      <div className="flex-[0.4] items-center justify-center h-[100px] transition-all duration-700 opacity-100 translate-x-0" id="box2">
        <div className="relative flex flex-col items-center h-full">
          {/* Vertical line */}
          <div className="w-[2px] bg-black h-full" />
          {/* OR box, absolutely centered */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#d3cfce] rounded text-black font-medium">
            OR
          </div>
        </div>
      </div>
      <div id="box" className="search-presets-container flex-col flex-2">
      <div className="mb-[3vh]">Use search presets</div>

          <DropdownComponentDescription
            title="Select a search preset"
            onChange={setSearchPresetOption}
            isOpen={openDropdown === "preset"}
            spotifyAccountConnected = {true}
            setOpenDropdown={setOpenDropdown}
            id="preset">

          </DropdownComponentDescription>
      </div>
       <div className="flex-[0.4] items-center justify-center h-[100px] transition-all duration-700 opacity-100 translate-x-0" id="box2">
        <div className="relative flex flex-col items-center h-full">
          {/* Vertical line */}
          <div className="w-[2px] bg-black h-full" />
          {/* OR box, absolutely centered */}
        </div>
      </div>
      <div className="flex-col flex-1 mt-[1vw] ml-[2vw]">
      <button className="mb-[3vh] bg-red-700 text-white rounded-2xl h-[8vh] flex cursor-pointer"><span className="absolute flex-1 mt-[2.5vh] material-icons-outlined relative ml-[1vw]"><div>replay</div></span><div className="flex-[2.5] mt-[0.6vh]">Clear filters</div></button>

      </div>
      </div>
      <div className="w-full sticky top-0 z-10 grid grid-cols-[29%_71%] py-4 text-[13px] bg-[#d3cfce] my-2 pl-4">
        {/* Left Column Header */}
        <div className="flex items-center gap-4">
          <div className="w-6 text-center pl-4">#</div>
          <div className="w-24" /> {/* Empty space for image */}
          <div className="ml-[3.6vw]">Name</div>
        </div>

        {/* Right Column Headers */}
        <div className="grid grid-cols-6 items-center text-center">
          <button 
            onClick={() => {
              setSortByListenersAsc((prev) => prev === null ? true: !prev);
              setSort24hAsc(null);
              setSortMonthlyAsc(null);
            }} 
            className="cursor-pointer flex items-center justify-center gap-1 group">
              Listeners
            <div className="flex flex-col ml-1 text-[8px]">
              {(sortByListenersAsc === null || sortByListenersAsc === true) && (
                <FaChevronUp 
                  className={`transition-transform group-hover:scale-140 ${sortByListenersAsc === true ? 'text-black' : 'text-gray-500'}`} 
                />
              )}
              {(sortByListenersAsc === null || sortByListenersAsc === false) && (
                <FaChevronDown 
                  className={`transition-transform group-hover:scale-140 ${sortByListenersAsc === false ? 'text-black' : 'text-gray-500'}`} 
                />
              )}
            </div>
          </button>
            <button
            onClick={() => {
              setSortMonthlyAsc((prev) => prev === null ? true : !prev);
              setSort24hAsc(null);
              setSortByListenersAsc(null);
            }}
            className="cursor-pointer flex items-center justify-center gap-1 group"
          >
            Monthly Change
            <div className="flex flex-col ml-1 text-[8px]">
              {(sortMonthlyAsc === null || sortMonthlyAsc === true) && (
                <FaChevronUp 
                  className={`transition-transform group-hover:scale-140 ${sortMonthlyAsc === true ? 'text-black' : 'text-gray-500'}`} 
                />
              )}
              {(sortMonthlyAsc === null || sortMonthlyAsc === false) && (
                <FaChevronDown 
                  className={`transition-transform group-hover:scale-140 ${sortMonthlyAsc === false ? 'text-black' : 'text-gray-500'}`} 
                />
              )}
            </div>
          </button>
          <button
            onClick={() => {
              setSort24hAsc((prev) => prev === null ? true : !prev);
              setSortMonthlyAsc(null);
              setSortByListenersAsc(null);
            }}
            className="cursor-pointer flex items-center justify-center gap-1 group"
          >
            24h Change
            <div className="flex flex-col ml-1 text-[8px]">
              {(sort24hAsc === null || sort24hAsc === true) && (
                <FaChevronUp 
                  className={`transition-transform group-hover:scale-140 ${sort24hAsc === true ? 'text-black' : 'text-gray-500'}`} 
                />
              )}
              {(sort24hAsc === null || sort24hAsc === false) && (
                <FaChevronDown 
                  className={`transition-transform group-hover:scale-140 ${sort24hAsc === false ? 'text-black' : 'text-gray-500'}`} 
                />
              )}
            </div>
          </button>
          <div>Genre</div>
          <div>Language</div>
          <div>Spotify Page</div>
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">No results found</div>
      ) : (
        <>
          <div className="flex flex-col gap-4 w-full">
            {currentArtists.map((artist, index) => (
              <ArtistCard key={index} artist={artist} />
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-4 mb-2 text-sm">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-1 rounded-md bg-[#E5E4E2] cursor-pointer disabled:opacity-50 disabled:cursor-auto"
            >
              Previous
            </button>

            <span className="px-4 py-1">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-1 not-first-of-type:rounded-md bg-[#E5E4E2] cursor-pointer disabled:opacity-50 disabled:cursor-auto"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}