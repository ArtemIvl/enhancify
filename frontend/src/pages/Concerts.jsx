import { useState, useEffect } from "react";
import "../Concerts.css";
import ConcertsSearch from "../components/ConcertSearchContent";
import statesCitiesCountriesArr from "../utils/loadPlaces";
import { fetchTopArtists, getNumericalRankings, fetchMyArtists } from "../services/api";
import axios from "axios";
import ScrollContainer from "../components/ScrollComponent";
import CrispConcertDetails from "../components/CrispConcertDetails";
import NothingFoundCardConcerts from "../components/NothingFoundCardConcerts";
import {calculateShowsAvailable, extractImageSrc, sort_concerts_descending, sort_num_rankings, preprocessFavouriteArtistsArray} from "../utils/concert_utils.js";
import GetArtistTags from "../components/GetArtistTags.jsx";
import { useAuth } from "../services/AuthContext.jsx";

export default function Concerts() {

  const token = localStorage.getItem("spotify_token");
  const [concertsToDisplayPerPage, setConcertsToDisplayPerPage] = useState(6)
  const [loadMoreItems, setLoadMoreItems] = useState(false)

  //main array with concerts - the contents of this array are currently displayed on the page
  const [concerts, setConcerts] = useState(null)
  //what we get as a result of webscraping
  const [globalTop100ArtistList, setGlobalTop100ArtistList] = useState([])
  //what we get from get_top_items Spotify API
  const [mostListenedArtistList, setMostListenedArtistList] = useState([])
  const [numericalRankingsDict, setNumericalRankingsDict] = useState(null)
  //when global top 100 concerts are loading
  //loading animation plays when this two variables are true or false
  const [globalLoading, setGlobalLoading] = useState(true)
  //when concerts from followed artists are loading
  const [followedLoading, setFollowedLoading] = useState(true)
  const [forciblyOverrideSearchResult, setForciblyOverrideSearchResult] = useState(null)
  //results (what is displayed in the browser, actual concerts)
  const [globalTop100Concerts, setGlobalTop100Concerts] = useState([])
  const [mostListenedArtistConcerts, setMostListenedArtistConcerts] = useState([])

  //when we scroll to bottom and need to load more concerts
  const [playLoadingAnimation, setPlayLoadingAnination] = useState(false)

  useEffect(() => {
    setConcertsToDisplayPerPage(5)
    fetchTopArtists()
          .then((data) => {
              const top = data["Top 500"] || [];
              const first_hundred = top.slice(0, 1000)
              setGlobalTop100ArtistList(first_hundred)
          })
          .catch(console.error);
    // Your code here (e.g., read from localStorage, fetch data)
  }, []);

  const timeRange = "medium_term";
  
  useEffect(() => {
    getNumericalRankings()
          .then((data) => {
              setNumericalRankingsDict(sort_num_rankings(data));
          })
          .catch(console.error);
    // Your code here (e.g., read from localStorage, fetch data)
  }, []);

  useEffect(() => {
    if (mostListenedArtistList) {
      console.log(mostListenedArtistList)
      console.log("aaaaa")
    }
  }, mostListenedArtistList);

  // for the followed artists: 1) On load fetch followed artists using the spotify API. using Spotify API.
  // 
  useEffect (() => {
    if (globalTop100ArtistList !== null) {
      console.log(globalTop100ArtistList);
    }
  }, [globalTop100ArtistList])
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
    setGlobalLoading(true)
    axios.post('http://localhost:8000/get_concerts', {
    get_top_artist_info: 1,
    countries: []
  })
    .then(response => {
      setConcerts(response.data);
      setGlobalTop100Concerts(response.data)
      setGlobalLoading(false)
    })
    .catch(error => {
      console.error(error);
    });
  }, []);


  //followed artists
useEffect(() => {
  setFollowedLoading(true);
  fetchMyArtists(timeRange, token)
    .then(artists => {
      setMostListenedArtistList(artists);
      // return the axios promise so the next .then waits on it
      return axios.post('http://localhost:8000/get_concerts', {
        get_top_artist_info: 0,
        artists: preprocessFavouriteArtistsArray(artists),
        countries: []
      });
    })
    .then(({ data }) => {
      setMostListenedArtistConcerts(data);
      setFollowedLoading(false);
    })
    .catch(error => {
      console.error(error);
      setFollowedLoading(false);
    });
}, [timeRange, token]);


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


////////
  function toggleConcertViewMode() {
    if (active === "global") {
      setActive("followed")
      setConcerts(mostListenedArtistConcerts);
    }
    else if (active === "followed") {
      setActive("global")
      setConcerts(globalTop100Concerts);
    }
  }
  ///////


  const [active, setActive] = useState("global");
  const [filters, setFilters] = useState("unclicked")
  const [activeCards, setActiveCards] = useState(new Set());

    function toggleCard(key) {
    setActiveCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);}
      else {
        newSet.add(key);
      }
      return newSet;
    });
  }

  //for global artists
  function getArtistsObject(artistSpotifyId) {
    if (globalTop100ArtistList) {
    for (const item of globalTop100ArtistList) {
      if (item["Spotify ID"] === artistSpotifyId) {
        return item;
      }
    }
    }

    return null;
  }

  function getArtistsObjectFollowed(artistSpotifyId) {
    if (mostListenedArtistList) {
    for (const item of mostListenedArtistList) {
      if (item["id"] === artistSpotifyId) {
        return item;
      }
    }
  }
    return null;
  }

function checkIfArtistIsFavorite(artistId) {
  if (!Array.isArray(mostListenedArtistList)) return null;

  const first50 = mostListenedArtistList
  const idx = first50.findIndex(item => item.id === artistId);
  return idx !== -1 ? idx : null;
}
// on load - get initial versions of concerts both for followed artists and for global artists
// two separate loading states for followed and global concerts
// when the user switches between pages, check the loading
// pass two loading states to the search component
// if user searches for something but then decides to switch tabs? Ideally - user can come back to their stuff later. Update two separate concert arrays
  return (
    <div>
      <div className="gradient-div">
    <div className="move-down">
    <div className="big-title"><span className="material-icons-outlined pr-4">celebration</span>Find concerts in your area<span className="material-icons-outlined pl-4">celebration</span>
</div>
      <div className="button-row">
        <button
          className={`button-concerts-search${active === "global" ? " active" : ""}`}
          onClick={() => toggleConcertViewMode()}
        >
          <span className="material-icons-outlined icons-tweaked">leaderboard</span>
          Spotify Top-100
        </button>
        <button
          className={`button-concerts-search${active === "followed" ? " active" : ""}`}
          onClick={() => toggleConcertViewMode()}
        >
          <span className="material-icons-outlined icons-tweaked">star</span>
          My Artists
        </button>
        <div><ConcertsSearch countries={statesCitiesCountriesArr} setConcerts={setConcerts} followedArtistsToQuery={preprocessFavouriteArtistsArray(mostListenedArtistList)} 
        setGlobalConcerts = {setGlobalTop100Concerts} setMostListenedConcerts = {setMostListenedArtistConcerts} setGlobalLoading={setGlobalLoading} setFollowedLoading = {setFollowedLoading} toggleMode={active}
        searchResultFromNothingFound={forciblyOverrideSearchResult} setSearchResultFromNothingFound={setForciblyOverrideSearchResult}>\
        
        </ConcertsSearch></div>
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
      </div>
        <div>
          <div className="cool-concert-line"></div>
          {(active === "global" & globalLoading) | (active === "followed" & followedLoading) ? (
            <div className="concerts-content-container mt-[0px] flex flex-col justify-center space-y-6">
              <div className="w-4/5 h-15/80 animate-skeleton rounded-xl ml-[7.5vw]" />
              <div className="w-4/5 h-15/80 animate-skeleton rounded-xl ml-[7.5vw]" />
              <div className="w-4/5 h-15/80 animate-skeleton rounded-xl ml-[7.5vw]" />
              <div className="w-4/5 h-15/80 animate-skeleton rounded-xl ml-[7.5vw]" />
            </div>
          ) : (
            <ScrollContainer setLoadMoreItems={setLoadMoreItems}>
            {Object.keys(concerts).length === 0 || concerts === null ? (
              <NothingFoundCardConcerts setConcerts={setConcerts} followedArtistsToQuery={preprocessFavouriteArtistsArray(mostListenedArtistList)} setItemToPassBack={setForciblyOverrideSearchResult}
        setGlobalConcerts = {setGlobalTop100Concerts} setMostListenedConcerts = {setMostListenedArtistConcerts} setGlobalLoading={setGlobalLoading} setFollowedLoading = {setFollowedLoading} toggleMode={active}></NothingFoundCardConcerts>
            ) : (
              Object.entries(sort_concerts_descending(concerts, numericalRankingsDict)).slice(0, concertsToDisplayPerPage).map(([key, concert], index) => (
                <div
                 key={key}
                >
                  {(active === "global" && getArtistsObject(key) !== null) || (active === "followed" && getArtistsObjectFollowed(key) !== null) ?
                  (
                  <>
                  <div className={activeCards.has(key) ? "main-concert-card active" : "main-concert-card"}>
                  {active === "global" ?
                  (<><img src={extractImageSrc(getArtistsObject(key)["Image"])} className="artists-image constrast-70 brightness-80"></img>
                  <div className="artists-name-main">{getArtistsObject(key)["Artist"]}</div></>) : 

                  (<><img src={getArtistsObjectFollowed(key) !== null ? getArtistsObjectFollowed(key)["images"][0]["url"] : "https://www.imghippo.com/i/KVJq2555GU.png"} className="artists-image constrast-70 brightness-80"></img>
                  <div className="artists-name-main">{getArtistsObjectFollowed(key) !== null ? getArtistsObjectFollowed(key)["name"] : "No name"}</div></>)}

                  <div className="small-horizontal-divisive-line">│</div>
                  <div className="shows-available-text">{calculateShowsAvailable(concert)}</div>
                  <div className="small-horizontal-divisive-line">│</div>
                  <GetArtistTags topArtist={active === "global" ? null : getArtistsObject(key)} artistInfo={active === "global" ? getArtistsObject(key) : getArtistsObjectFollowed(key)} 
                  tagsToCalculate={["genre", "favorite", "rising", "popular", "fans", "main_language", "world_rank", "your_most_listened"]} is_webscraped={active === "global" ? true : false} favoriteRank = {active === "global" ? checkIfArtistIsFavorite(getArtistsObject(key)["Spotify ID"]) : checkIfArtistIsFavorite(getArtistsObjectFollowed(key)["id"])}></GetArtistTags>
                  <div className="small-horizontal-divisive-line">│</div>
                  <button className="concert-details-button" onClick={() => toggleCard(key, concert)}>
                  <span className="material-icons-outlined icons-tweaked">expand_circle_down</span>
                    {activeCards.has(key) ? "Hide details" : "View details"}</button>
                  </div>
                  <div
                    className={ activeCards.has(key) ? "" : "hidden" }
                    /* or: style={{ display: activeCards.has(key) ? "block" : "none" }} */
                  >
                    <CrispConcertDetails concerts={concert} />
                  </div>
                  </>
                  ) : null };
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
    </div>
  );
}