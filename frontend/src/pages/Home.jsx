import ArtistCard from "../components/ArtistCard";
import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import { fetchTopArtists } from "../services/api";
import {LoginButton} from "../components/LoginButton";

export default function Home() {
    const [artists, setArtists] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [token, setToken] = useState(null);

    useEffect(() => {
        // Check if user is logged in via token in localStorage or URL
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get("token");
        if (tokenFromUrl) {
        setToken(tokenFromUrl);
        localStorage.setItem("spotify_token", tokenFromUrl);
        window.history.replaceState({}, document.title, "/");
        } else {
        const tokenFromStorage = localStorage.getItem("spotify_token");
        if (tokenFromStorage) setToken(tokenFromStorage);
        }
  }, []);

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
                const doc = parser.parseFromString(artist["Artist"], "text/html");
                const artistName = doc.body.textContent || "";
                return artistName.toLowerCase().includes(q);
            })
        );
    }, [search, artists]);

if (!token) {
    return (
      <div className="flex justify-center p-4">
        <LoginButton />
      </div>
    );
  }

    return (
        <div className="p-4">
            <div className="flex justify-center mb-6">
                <SearchBar value={search} onChange={setSearch} />
            </div>

            {filtered.length === 0 ? (
                <div>No artists found.</div>
            ) : (
                <div className="flex flex-col gap-4 w-full">
                    {filtered.map((artist, index) => (
                        <ArtistCard key={index} artist={artist} />
                    ))}
                </div>
            )}
        </div>
    );
}