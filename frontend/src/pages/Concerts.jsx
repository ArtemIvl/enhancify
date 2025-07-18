import { useState, useEffect, useRef } from "react";
import "../Concerts.css";
import ConcertsSearch from "../components/ConcertSearchContent";
import statesCitiesCountriesArr from "../utils/loadPlaces";
import { fetchTopArtists, getNumericalRankings, fetchMyArtists } from "../services/api";
import axios from "axios";
import ScrollContainer from "../components/ScrollComponent";
import CrispConcertDetails from "../components/CrispConcertDetails";
import NothingFoundCardConcerts from "../components/NothingFoundCardConcerts";
import {calculateShowsAvailable, extractImageSrc, sort_concerts_descending, sort_num_rankings, preprocessFavouriteArtistsArray, getFiltersFromStorage} from "../utils/concert_utils.js";
import GetArtistTags from "../components/GetArtistTags.jsx";
import { useAuth } from "../services/AuthContext.jsx";
import ConcertSearchFilters from "../components/ConcertSearchFilters.jsx";
import dayjs from "dayjs";

export default function Concerts() {

  const token = localStorage.getItem("spotify_token");
  const [concertsToDisplayPerPage, setConcertsToDisplayPerPage] = useState(6)
  const [loadMoreItems, setLoadMoreItems] = useState(false)
  const [searchToggle, setSearchToggle] = useState(getFiltersFromStorage("filters_search_mode", "area"));
  const [searchRadius, setSearchRadius] = useState(getFiltersFromStorage("search_area_concerts", 100))
  const [dateToSearchFrom, setDateToSearchFrom] = useState(dayjs(getFiltersFromStorage("search_start_date", dayjs().add(3, "day"))))
  const [dateToSearchUntil, setDateToSearchUntil] = useState(dayjs(getFiltersFromStorage("search_end_date", dayjs().add(1, "year"))))
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

  //search toggle mode
  const [artistsGlobalTopPreprocessedForSearch, setArtistsGlobalTopPreprocessedForSearch] = useState([]);
  const [followedArtistsPreprocessedForSearch, setFollowedArtistsPreprocessedForSearch] = useState([]);
  const [mainSearchContentsArtist, setMainSearchContentsArtist] = useState([]);

  //managing click states
  const [active, setActive] = useState("global");
  const [filters, setFilters] = useState("unclicked")
  const [activeCards, setActiveCards] = useState(new Set());

  useEffect(() => {
    setConcertsToDisplayPerPage(5)
    fetchTopArtists()
          .then((data) => {
              const top = data["Top 10000"] || [];
              setArtistsToSearchFriendlyMode(top, setArtistsGlobalTopPreprocessedForSearch);
              setArtistsToSearchFriendlyMode(top, setMainSearchContentsArtist)
              setGlobalTop100ArtistList(top)
          })
    // Your code here (e.g., read from localStorage, fetch data)
  }, []);

  const timeRange = "medium_term";


const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);


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
      setFollowedArtistsToSearchFriendlyMode(mostListenedArtistList);
      //console.log(mostListenedArtistList)
    }
  }, mostListenedArtistList);

  // for the followed artists: 1) On load fetch followed artists using the spotify API. using Spotify API.
  // 

  /*
  useEffect (() => {
    if (concerts) {
      console.log(concerts);
    }
  }, [concerts])
  */

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
    start_date: dateToSearchFrom.toISOString(),
    end_date: dateToSearchUntil.toISOString(),
    search_area: searchRadius,
    countries: []
  })
    .then(response => {
      if (activeRef.current === "global") {
      setConcerts(response.data);
      }
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
        start_date: dateToSearchFrom.toISOString(),
        end_date: dateToSearchUntil.toISOString(),
        search_area: searchRadius,
        countries: []
      });
    })
    .then(({ data }) => {
      setMostListenedArtistConcerts(data);
      if (activeRef.current === "followed") {
        setConcerts(data);
      }})
    .then(() => {
       setFollowedLoading(false);
    })
    .catch(error => {
      console.error(error);
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
  function toggleConcertViewMode(clickTarget) {
    if (active === "global" && clickTarget != "global") {
      setActive("followed")
      if (followedLoading === false) {
      setConcerts(mostListenedArtistConcerts);
      }
      setMainSearchContentsArtist(followedArtistsPreprocessedForSearch)
    }
    else if (active === "followed" && clickTarget != "followed") {
      setActive("global")
      if (globalLoading === false) {
      setConcerts(globalTop100Concerts);
      }
      setMainSearchContentsArtist(artistsGlobalTopPreprocessedForSearch)

    }
  }
  ///////
  function setArtistsToSearchFriendlyMode(top_artists, setter) {
    var preprocessed_artists = [];
    for (const item of top_artists) {
      preprocessed_artists.push({ label: item["Artist"], code: item["Spotify ID"], icon: "person", description: item["Genre"], input_type: "artist"})
    }
    setter(preprocessed_artists);
  }

  function setFollowedArtistsToSearchFriendlyMode(followed_artists) {
    var preprocessed_artists = [];
    for (const item of followed_artists) {
      let icon_of_choice = "artist";
      let description = "Your favourite";
      if (item["popularity"] > 60 && item["popularity"] < 85) {
        icon_of_choice = "star";
        description = "Popular"
      }
      else if (item["popularity"] >= 85) {
        icon_of_choice = "hotel_class";
        description = "Superstar"
      }
      else {
        icon_of_choice = "diamond";
        description = "Niché"
      }
      preprocessed_artists.push({ label: item["name"], code: item["id"], icon: icon_of_choice, description: description, input_type: "artist"})
    }
    setFollowedArtistsPreprocessedForSearch(preprocessed_artists);
  }

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
          onClick={() => toggleConcertViewMode("global")}
        >
          <span className="material-icons-outlined icons-tweaked">leaderboard</span>
          Spotify Top-100
        </button>
        <button
          className={`button-concerts-search${active === "followed" ? " active" : ""}`}
          onClick={() => toggleConcertViewMode("followed")}
        >
          <span className="material-icons-outlined icons-tweaked">star</span>
          My Artists
        </button>
        <div><ConcertsSearch toggleMode = {active} searchToggleMode = {searchToggle} artists={mainSearchContentsArtist} searchRadius = {searchRadius} start_date = {dateToSearchFrom} end_date = {dateToSearchUntil} countries={statesCitiesCountriesArr} setConcerts={setConcerts} followedArtistsToQuery={preprocessFavouriteArtistsArray(mostListenedArtistList)} 
        setGlobalConcerts = {setGlobalTop100Concerts} setMostListenedConcerts = {setMostListenedArtistConcerts} setGlobalLoading={setGlobalLoading} setFollowedLoading = {setFollowedLoading}
        searchResultFromNothingFound={forciblyOverrideSearchResult} setSearchResultFromNothingFound={setForciblyOverrideSearchResult}>\
        
        </ConcertsSearch></div>
        <div className="filters_container">  
            <button className={`filters-button${filters === "clicked" ? " active" : ""}`} 
            onClick={() => filters === "clicked" ? setFilters("unclicked") : setFilters("clicked")}>
                <span className="material-icons-outlined icons-tweaked">tune</span>Filters</button>
            <div
            className={`filters-detailed-container ${
              filters !== "clicked" ? "hidden" : ""
            }`}
          >
            <ConcertSearchFilters setSearchByArtist={setSearchToggle} setSearchRadius={setSearchRadius} setDateToSearchFrom={setDateToSearchFrom} setDateToSearchUntil={setDateToSearchUntil} />
          </div>
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
              <NothingFoundCardConcerts toggleMode = {active} searchToggle={searchToggle} setConcerts={setConcerts} followedArtistsToQuery={preprocessFavouriteArtistsArray(mostListenedArtistList)} setItemToPassBack={setForciblyOverrideSearchResult}
        setGlobalConcerts = {setGlobalTop100Concerts} setMostListenedConcerts = {setMostListenedArtistConcerts} setGlobalLoading={setGlobalLoading} setFollowedLoading = {setFollowedLoading}></NothingFoundCardConcerts>
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