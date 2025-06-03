import { useState, useEffect } from "react";
import "../Concerts.css";
import ConcertsSearch from "../components/ConcertSearchContent";
import statesCitiesCountriesArr from "../load_regions/loadPlaces";
import { fetchTopArtists } from "../services/api";
import axios from "axios";
import ScrollContainer from "../components/ScrollComponent";
import CrispConcertDetails from "../components/CrispConcertDetails";

export default function Concerts() {
const HARDCODED_COUNTRIES = [
  { label: "Spain", flag: "es"},
  { label: "Barcelona", flag: "es" },
  { label: "Madrid", flag: "es" },
  { label: "United States", flag: "us" },
  { label: "Las Vegas", flag: "us" },
  { label: "Australia", flag: "au" },
  { label: "New York", flag: "us" },
  { label: "Amsterdam", flag: "nl" },
  { label: "Netherlands", flag: "nl" },
  { label: "London", flag: "gb" },
  { label: "Brussels", flag: "be" },
  { label: "Berlin", flag: "de" },
  { label: "Geneva", flag: "ch" },
  { label: "Portugal", flag: "pt" },
  { label: "Munich", flag: "de" },
  { label: "Ibiza", flag: "es" },
  { label: "Los Angeles", flag: "us" },
  { label: "Florida", flag: "us" },
  { label: "Washington", flag: "us" },
  { label: "Mexico City", flag: "mx" },
  { label: "Mexico", flag: "mx" },
  { label: "Vancouver", flag: "ca" },
  { label: "Ottawa", flag: "ca" },
  { label: "Prague", flag: "cz" },
  { label: "Vienna", flag: "at" },
  { label: "Dublin", flag: "ie" }
];
  function shuffleCountries() {
    for (let i = HARDCODED_COUNTRIES.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [HARDCODED_COUNTRIES[i], HARDCODED_COUNTRIES[j]] =
        [HARDCODED_COUNTRIES[j], HARDCODED_COUNTRIES[i]];
    }
    return HARDCODED_COUNTRIES;
  }
  shuffleCountries();
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
  const [concertsToDisplayPerPage, setConcertsToDisplayPerPage] = useState(6)
  const [loadMoreItems, setLoadMoreItems] = useState(false)
  const [concerts, setConcerts] = useState(null)
  const [topArtists, setTopArtists] = useState(null)
  const [loading, setLoading] = useState(true)
  const [playLoadingAnimation, setPlayLoadingAnination] = useState(false)
  
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
            <ScrollContainer setLoadMoreItems={setLoadMoreItems}>
            {Object.keys(concerts).length === 0 ? (
              <div>
                <div className="nothing-found-title big-title">Whoops! We didn't find any concerts in this area... Try again with a different location?</div>
                <div className="alternative-search-choice-container">
                <button className="alternative-search-choice"><span className={`fi fi-${HARDCODED_COUNTRIES[0].flag} increase-size brightness-80 contrast-110 ml-[10px] mr-[12px] `}></span>{HARDCODED_COUNTRIES[0].label}</button>
                <button className="alternative-search-choice"><span className={`fi fi-${HARDCODED_COUNTRIES[1].flag} increase-size brightness-80 contrast-110 ml-[10px] mr-[12px] `}></span>{HARDCODED_COUNTRIES[1].label}</button>
                <button className="alternative-search-choice"><span className={`fi fi-${HARDCODED_COUNTRIES[2].flag} increase-size brightness-80 contrast-110 ml-[10px] mr-[12px] `}></span>{HARDCODED_COUNTRIES[2].label}</button>
                <button className="alternative-search-choice"><span className={`fi fi-${HARDCODED_COUNTRIES[3].flag} increase-size brightness-80 contrast-110 ml-[10px] mr-[12px] `}></span>{HARDCODED_COUNTRIES[3].label}</button>
                <button className="alternative-search-choice"><span className={`fi fi-${HARDCODED_COUNTRIES[4].flag} increase-size brightness-80 contrast-110 ml-[10px] mr-[12px] `}></span>{HARDCODED_COUNTRIES[4].label}</button>
                </div>
              </div>
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
                  <div className="genre-button"><div className="genre-text">Pop</div></div>
                  <div className="genre-button"><div className="genre-text">Hiphop</div></div>
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