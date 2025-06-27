import { useEffect, useState } from "react";
import ArtistCard from "../components/ArtistCard.jsx";
import { fetchTopArtists } from "../services/api.js";
import Loading from '../components/Loading.jsx';
import DropdownComponent from "../components/DropdownComponent.jsx"
import { FaChevronDown, FaTimes, FaChevronUp } from "react-icons/fa";

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

  const artistsPerPage = 100;

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
    <div className="px-8">
    <div className="text-2xl font-bold py-4">Most listened artists on Spotify</div>
    <div className="w-full flex justify-between items-center gap-4">
        {/* Search bar */}
      <div className="flex items-center w-full md:w-1/2 relative shadow-md rounded-2xl">
        <input
          type="text"
          placeholder="Search artists by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 text-sm rounded-2xl bg-white text-black placeholder-[#868686] focus:outline-none"
        />
        <button onClick={() => {
          setCountryFilter("");
          setGenreFilter("");
          setSort24hAsc(null);
          setSortMonthlyAsc(null);
          setSortByListenersAsc(null);
          setSearch("");
        }}
        className="absolute right-0 top-0 h-full w-16 bg-black rounded-r-2xl flex items-center justify-center cursor-pointer">
          <FaTimes className="text-white" />
        </button>
      </div>

        {/* Filters */}
        <div className="flex gap-4 w-full md:w-auto">
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

      <div className="w-full sticky top-0 z-10 grid grid-cols-[26%_74%] py-4 text-[12px] bg-[#d3cfce] my-2 pl-4">
        {/* Left Column Header */}
        <div className="flex items-center gap-4">
          <div className="w-6 text-center pl-4">#</div>
          <div className="w-24" /> {/* Empty space for image */}
          <div>Name</div>
        </div>

        {/* Right Column Headers */}
        <div className="grid grid-cols-7 items-center text-center">
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
          <div>Genre</div>
          <div>Language</div>
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
          <div>Type</div>
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