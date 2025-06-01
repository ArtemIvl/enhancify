import { useState, useEffect } from "react";
import "../Concerts.css";
import ConcertsSearch from "../components/ConcertSearchContent";
import countriesArr from "../components/countryList";
import { fetchTopArtists } from "../services/api";
import axios from "axios";
import SearchBar from "../components/SearchBar"

export default function Concerts() {

  function extractImageSrc(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const img = doc.querySelector('img');
  return img ? img.src : null;
}
  function calculateShowsAvailable(concertList) {
    var concerts = concertList.length;
    if (concerts > 1) {
      return `${concertList.length} shows available`;    }
    else {
      return "1 show available"
    }
  }
  const concertsToDisplayPerPage = 4
  var amountOfConcertsAlreadyShown = 0
  const [concerts, setConcerts] = useState(null)
  const [topArtists, setTopArtists] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchTopArtists()
          .then((data) => {
              const top = data["Top 500"] || [];
              const first_hundred = top.slice(0, 100)
              setTopArtists(first_hundred)
          })
          .catch(console.error);
    // Your code here (e.g., read from localStorage, fetch data)
  }, []);

  useEffect(() => {
    if (topArtists !== null) {
      console.log(topArtists)
    }
  }, [topArtists]);

  useEffect(() => {
    setLoading(true)
    axios.post('http://localhost:8000/get_concerts', {
    get_top_artist_info: 1,
    countries: []
  })
    .then(response => {
      setConcerts(response.data);
      setLoading(false)
    })
    .catch(error => {
      console.error(error);
    });
  }, []);

  const [active, setActive] = useState("global");
  const [filters, setFilters] = useState("unclicked")
  const [activeCards, setActiveCards] = useState(new Set());

    function toggleCard(key) {
    setActiveCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  }

  function getArtistsNameBySpotifyId(artistSpotifyId) {
    for (const item of topArtists) { // use 'of' for arrays
      if (item["Spotify ID"] === artistSpotifyId) {
        return item;
      }
    }
    return null;
  }

  return (
    <div className="move-down">
    <div className="big-title">Find concerts in your area</div>

      <div className="button-row">
        <button
          className={`button-concerts-search${active === "global" ? " active" : ""}`}
          onClick={() => setActive("global")}
        >
          <span className="material-icons-outlined icons-tweaked">leaderboard</span>
          Spotify Top-100
        </button>
        <button
          className={`button-concerts-search${active === "followed" ? " active" : ""}`}
          onClick={() => setActive("followed")}
        >
          <span className="material-icons-outlined icons-tweaked">star</span>
          My Artists
        </button>
        <div><ConcertsSearch countries={countriesArr}></ConcertsSearch></div>
        <div className="filters_container">  
            <button className={`filters-button${filters === "clicked" ? " active" : ""}`} 
            onClick={() => filters === "clicked" ? setFilters("unclicked") : setFilters("clicked")}>
                <span className="material-icons-outlined icons-tweaked">tune</span></button>
             {filters === "clicked" && (
                <div className="filters-detailed-container">
                <div className="filters-setting">Menu Item 1</div>
                <div className="filters-setting">Menu Item 1</div>
                <div className="filters-setting">Menu Item 1</div>

                </div>
            )}
        </div>
      </div>
        <div>
          {loading ? (
            <div className="concerts-content-container p-6 flex flex-col justify-center mx-auto space-y-8">
              <div className="w-3/4 h-1/4 animate-skeleton rounded-xl ml-[60px]" />
              <div className="w-3/4 h-1/4 animate-skeleton rounded-xl ml-[60px]" />
              <div className="w-3/4 h-1/4 animate-skeleton rounded-xl ml-[60px]" />
            </div>
          ) : (
            <div className="concerts-content-container slight-margin-top">
            {concerts.length === 0 ? (
              <div>
                No results
              </div>
            ) : (
              Object.entries(concerts).slice(0, 4).map(([key, concert]) => (
                <div
                 key={key}
                >
                  <div className={activeCards.has(key) ? "main-concert-card active" : "main-concert-card"}>
                  <img src={extractImageSrc(getArtistsNameBySpotifyId(key)["Image"])} className="artists-image constrast-70 brightness-80"></img>
                  <div className="artists-name-main">{getArtistsNameBySpotifyId(key)["Artist"]}</div>
                  <div className="small-horizontal-divisive-line">│</div>
                  <div className="shows-available-text">{calculateShowsAvailable(concert)}</div>
                  <div className="small-horizontal-divisive-line">│</div>
                  <div className="genre-container">
                  <div className="genre-button"><div className="genre-text">Pop</div></div>
                  <div className="genre-button"><div className="genre-text">Hiphop</div></div>
                  <div className="genre-button"><div className="genre-text">#1 in the world</div></div>
                  </div>
                  <div className="small-horizontal-divisive-line">│</div>
                  <button className="concert-details-button" onClick={() => toggleCard(key)}>
                  <span className="material-icons-outlined icons-tweaked">expand_circle_down</span>
                    {activeCards.has(key) ? "Hide details" : "View details"}</button>
                  </div>
                </div>
              ))
            )}
            </div>
          )}
        </div>

    </div>
  );
}