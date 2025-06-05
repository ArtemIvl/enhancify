import { useState, useEffect } from "react";
import "../Concerts.css";
import ConcertsSearch from "../components/ConcertSearchContent";
import statesCitiesCountriesArr from "../utils/loadPlaces";
import { fetchMostListenedArtists, fetchTopArtists } from "../services/api";
import axios from "axios";
import ScrollContainer from "../components/ScrollComponent";
import CrispConcertDetails from "../components/CrispConcertDetails";
import NothingFoundCardConcerts from "../components/NothingFoundCardConcerts";
import {calculateShowsAvailable, extractImageSrc} from "../utils/concert_utils.js";


export default function Concerts() {

  const [concertsToDisplayPerPage, setConcertsToDisplayPerPage] = useState(6)
  const [loadMoreItems, setLoadMoreItems] = useState(false)
  const [concerts, setConcerts] = useState(null)
  const [topArtists, setTopArtists] = useState(null)
  const [favouriteArtists, setFavoriteArtists] = useState(null)
  const [loading, setLoading] = useState(true)
  const [playLoadingAnimation, setPlayLoadingAnination] = useState(false)
  const [favoriteConcerts, setFavoriteConcerts] = useState(null)

  useEffect(() => {
    setConcertsToDisplayPerPage(5)
    fetchTopArtists()
          .then((data) => {
              const top = data["Top 500"] || [];
              const first_hundred = top.slice(0, 100)
              setTopArtists(first_hundred)
          })
          .catch(console.error);
    // Your code here (e.g., read from localStorage, fetch data)
  }, []);

  // for the followed artists: 1) On load fetch followed artists using the spotify API. using Spotify API.
  // 
  useEffect (() => {
    if (topArtists !== null) {
      console.log(topArtists);
    }
  }, [topArtists])
  useEffect(() => {
    if (loadMoreItems === true) {
      if (Object.keys(concerts).length > concertsToDisplayPerPage) {
      setPlayLoadingAnination(true)
      //wait for a second
      const timer = setTimeout(() => {
      setPlayLoadingAnination(false)
      setLoadMoreItems(false)
      setConcertsToDisplayPerPage(prev => prev + 8)

    }, 1000);
    return () => clearTimeout(timer);
    }
  }
  }, [loadMoreItems]);


  const token = localStorage.getItem("spotify_token");

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


  /* Uncomment after merge
  useEffect(() => {
    setLoading(true)
    fetchMostListenedArtists(token)
    .then(response => {
      setFavoriteArtists(response.data)
    })
    .catch(error => {
      console.error(error);
    });
  }, []);
*/

  const [active, setActive] = useState("global");
  const [filters, setFilters] = useState("unclicked")
  const [activeCards, setActiveCards] = useState(new Set());
    function toggleCard(key, concerts) {
    setActiveCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        //create new key in myDict (setMyDict[key] = concerts)
        newSet.delete(key);}
      else {
        //delete the key in mydict (delete myDict[key])
        newSet.add(key);
      }
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
        <div><ConcertsSearch countries={statesCitiesCountriesArr} setConcerts={setConcerts} setLoading={setLoading} ></ConcertsSearch></div>
        <div className="filters_container">  
            <button className={`filters-button${filters === "clicked" ? " active" : ""}`} 
            onClick={() => filters === "clicked" ? setFilters("unclicked") : setFilters("clicked")}>
                <span className="material-icons-outlined icons-tweaked">tune</span>Filters</button>
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
          <div className="cool-concert-line"></div>
          {loading ? (
            <div className="concerts-content-container p-6 flex flex-col justify-center mx-auto space-y-8">
              <div className="w-3/4 h-1/4 animate-skeleton rounded-xl ml-[60px]" />
              <div className="w-3/4 h-1/4 animate-skeleton rounded-xl ml-[60px]" />
              <div className="w-3/4 h-1/4 animate-skeleton rounded-xl ml-[60px]" />
            </div>
          ) : (
            <ScrollContainer setLoadMoreItems={setLoadMoreItems}>
            {Object.keys(concerts).length === 0 ? (
              <NothingFoundCardConcerts></NothingFoundCardConcerts>
            ) : (
              Object.entries(concerts).slice(0, concertsToDisplayPerPage).map(([key, concert]) => (
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
                  <div className="genre-button"><div className="genre-text">English</div></div>
                  <div className="genre-button"><div className="genre-text">Afrobeats</div></div>

                  <div className="genre-button"><div className="genre-text">#1 in the world</div></div>
                  </div>
                  <div className="small-horizontal-divisive-line">│</div>
                  <button className="concert-details-button" onClick={() => toggleCard(key, concert)}>
                  <span className="material-icons-outlined icons-tweaked">expand_circle_down</span>
                    {activeCards.has(key) ? "Hide details" : "View details"}</button>
                  </div>
                 <div>
                  {activeCards.has(key)
                    ? (<CrispConcertDetails concerts={concert}></CrispConcertDetails>)
                    : null}
                </div>
                </div>
              ))
            )}
            {playLoadingAnimation && (
              <div className="loading-bottom"><div className="w-5/6 h-3/4 animate-skeleton rounded-xl ml-[100px]"></div></div>
            )}
            </ScrollContainer>
          )}
        </div>

    </div>
  );
}