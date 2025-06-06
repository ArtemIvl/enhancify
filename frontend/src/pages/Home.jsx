import { useEffect, useState } from "react";
import ArtistCard from "../components/ArtistCard";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { fetchTopArtists } from "../services/api";

export default function Home() {
  const [artists, setArtists] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const artistsPerPage = 100;

  useEffect(() => {
    fetchTopArtists()
      .then((data) => {
        const top = data["Top 500"] || [];
        setArtists(top);
        setFiltered(top);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const parser = new DOMParser();
    const q = search.toLowerCase();

    setFiltered(
      artists.filter((artist) => {
        // Extract artist name text (assuming artist["Artist"] is HTML string)
        const doc = parser.parseFromString(artist["Artist"], "text/html");
        const artistName = doc.body.textContent || "";

        const matchesSearch = artistName.toLowerCase().includes(q);
        const matchesCountry = countryFilter
          ? artist.Country === countryFilter
          : true;
        const matchesGenre = genreFilter
          ? artist.Genre && artist.Genre.includes(genreFilter)
          : true;

        return matchesSearch && matchesCountry && matchesGenre;
      })
    );
    setCurrentPage(1); // reset page on filters change
  }, [search, countryFilter, genreFilter, artists]);

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
    <>
    <div className="w-full flex justify-between items-center mb-6 gap-4 flex-wrap">
        {/* Search bar */}
      <div className="flex items-center w-full md:w-1/2 relative">
        <input
          type="text"
          placeholder="Search artists..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 pr-12 rounded-md bg-white text-black placeholder-gray-500 focus:outline-none"
        />
        <div className="absolute right-0 top-0 h-full w-16 bg-black rounded-r-md flex items-center justify-center cursor-pointer">
          <FiSearch className="text-white text-sm" />
        </div>
      </div>

        {/* Filters */}
        <div className="flex gap-3 w-full md:w-auto">
          {/* Country Filter */}
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-3 pr-8 text-black text-sm focus:outline-none"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
            >
              <option value="">All Countries</option>
              {uniqueCountries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
          </div>

          {/* Genre Filter */}
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-3 pr-8 text-black text-sm focus:outline-none"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
            >
              <option value="">All Genres</option>
              {uniqueGenres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="w-full sticky top-0 z-10 grid grid-cols-[26%_74%] px-4 py-3 text-[12px] bg-[#d3cfce]">
        {/* Left Column Header */}
        <div className="flex items-center gap-4">
          <div className="w-6 text-center">#</div>
          <div className="w-22" /> {/* Empty space for image */}
          <div>Name</div>
        </div>

        {/* Right Column Headers */}
        <div className="grid grid-cols-7 items-center gap-2 text-center">
          <div>Listeners</div>
          <div>Genre</div>
          <div>Language</div>
          <div>24h Change</div>
          <div>Monthly Change</div>
          <div>Type</div>
          <div>Spotify Page</div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div>No artists found.</div>
      ) : (
        <>
          <div className="flex flex-col gap-4 w-full">
            {currentArtists.map((artist, index) => (
              <ArtistCard key={index} artist={artist} />
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>

            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </>
  );
}