import { useEffect, useState } from "react";
import ArtistCard from "../components/ArtistCard";
import SearchBar from "../components/SearchBar";
import { fetchTopArtists } from "../services/api";

export default function Home() {
  const [artists, setArtists] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [token, setToken] = useState(null);
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
      <div className="flex justify-center mb-6 gap-4 flex-wrap">
        <SearchBar value={search} onChange={setSearch} />

        <select
          className="border rounded p-2"
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
        >
          <option value="">All Countries</option>
          {uniqueCountries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        <select
          className="border rounded p-2"
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
        >
          <option value="">All Genres</option>
          {uniqueGenres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
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