
import axios from "axios";
import { useState, useEffect, useMemo } from "react";

export default function NothingFoundCardConcerts({ setConcerts, setGlobalConcerts, 
  setMostListenedConcerts, setGlobalLoading, setFollowedLoading, toggleMode, searchToggle, followedArtistsToQuery, clearInput, setItemToPassBack}) {

const HARDCODED_COUNTRIES = [
  { label: "Spain",         flag: "es", input_type: "country", code: "ES",                 icon: "flag_circle"   },
  { label: "Barcelona",     flag: "es", input_type: "city",    code: "(41.3851, 2.1734)",   icon: "location_city" },
  { label: "Madrid",        flag: "es", input_type: "city",    code: "(40.4168, -3.7038)",  icon: "location_city" },
  { label: "United States", flag: "us", input_type: "country", code: "US",                 icon: "flag_circle"   },
  { label: "Las Vegas",     flag: "us", input_type: "city",    code: "(36.1699, -115.1398)",icon: "location_city" },
  { label: "Australia",     flag: "au", input_type: "country", code: "AU",                 icon: "flag_circle"   },
  { label: "New York",      flag: "us", input_type: "state",   code: "NY",                 icon: "house"         },
  { label: "Amsterdam",     flag: "nl", input_type: "city",    code: "(52.3676, 4.9041)",   icon: "location_city" },
  { label: "Netherlands",   flag: "nl", input_type: "country", code: "NL",                 icon: "flag_circle"   },
  { label: "London",        flag: "gb", input_type: "city",    code: "(51.5074, -0.1278)",  icon: "location_city" },
  { label: "Brussels",      flag: "be", input_type: "city",    code: "(50.8503, 4.3517)",   icon: "location_city" },
  { label: "Berlin",        flag: "de", input_type: "city",    code: "(52.5200, 13.4050)",  icon: "location_city" },
  { label: "Geneva",        flag: "ch", input_type: "city",    code: "(46.2044, 6.1432)",   icon: "location_city" },
  { label: "Portugal",      flag: "pt", input_type: "country", code: "PT",                 icon: "flag_circle"   },
  { label: "Munich",        flag: "de", input_type: "city",    code: "(48.1351, 11.5820)",  icon: "location_city" },
  { label: "Ibiza",         flag: "es", input_type: "city",    code: "(38.9067, 1.4206)",   icon: "location_city" },
  { label: "Los Angeles",   flag: "us", input_type: "city",    code: "(34.0522, -118.2437)",icon: "location_city" },
  { label: "Florida",       flag: "us", input_type: "state",   code: "FL",                 icon: "house"         },
  { label: "Washington",    flag: "us", input_type: "state",   code: "WA",                 icon: "house"         },
  { label: "Mexico City",   flag: "mx", input_type: "city",    code: "(19.4326, -99.1332)", icon: "location_city" },
  { label: "Mexico",        flag: "mx", input_type: "country", code: "MX",                 icon: "flag_circle"   },
  { label: "Vancouver",     flag: "ca", input_type: "city",    code: "(49.2827, -123.1207)",icon: "location_city" },
  { label: "Ottawa",        flag: "ca", input_type: "city",    code: "(45.4215, -75.6972)", icon: "location_city" },
  { label: "Prague",        flag: "cz", input_type: "city",    code: "(50.0755, 14.4378)",  icon: "location_city" },
  { label: "Vienna",        flag: "at", input_type: "city",    code: "(48.2082, 16.3738)",  icon: "location_city" },
  { label: "Dublin",        flag: "ie", input_type: "city",    code: "(53.3498, -6.2603)",  icon: "location_city" },
  { label: "California",    flag: "us", input_type: "state",   code: "CA",                 icon: "house"         },
  { label: "France",        flag: "fr", input_type: "country", code: "FR",                 icon: "flag_circle"   },
  { label: "Paris",         flag: "fr", input_type: "city",    code: "(48.8566, 2.3522)",   icon: "location_city" }
];

function handleClick(selectedItem) {
  setItemToPassBack(selectedItem)
  setGlobalLoading(true)
  setFollowedLoading(true)
  const params = {
      get_top_artist_info: 1,
      countries: []
  }

  if (selectedItem.input_type === "country") {
    params["countries"] = [selectedItem.code]
  }
  else if (selectedItem.input_type === "state") {
    params["stateCode"] = selectedItem.code 
  }
  else if (selectedItem.input_type === "city") {
    let lat = 0;
    let lng = 0;

    const parts = selectedItem.code.slice(1, -1).split(",");
    if (parts.length === 2) {
      const parsedLat = parseFloat(parts[0].trim());
      const parsedLng = parseFloat(parts[1].trim());
      lat = isNaN(parsedLat) ? 0 : parsedLat;
      lng = isNaN(parsedLng) ? 0 : parsedLng;
    }
    params["geo_latitude"] = lat;
    params["geo_longitude"] = lng;
  }
  //GLOBAL
  axios.post('http://localhost:8000/get_concerts', params)
    .then(response => {
      if (toggleMode === "global") {
        setConcerts(response.data);
      }
      setGlobalConcerts(response.data)
      setGlobalLoading(false);
    })
    .catch(error => {
      console.error(error);
    });
  
// input example for artist lists [{"artist_id": "a1b2c3", "artist_name": "21 savage"}]
  //FOR FOLLOWERS
  params["get_top_artist_info"] = 0;
  params["artists"] = followedArtistsToQuery;
  axios.post('http://localhost:8000/get_concerts', params)
    .then(response => {
      if (toggleMode === "followed") {
        setConcerts(response.data)
      }
      setMostListenedConcerts(response.data);
      setFollowedLoading(false);
    })
    .catch(error => {
      console.error(error);
    });
}

function shuffleCountries() {
    for (let i = HARDCODED_COUNTRIES.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [HARDCODED_COUNTRIES[i], HARDCODED_COUNTRIES[j]] =
        [HARDCODED_COUNTRIES[j], HARDCODED_COUNTRIES[i]];
    }
    return HARDCODED_COUNTRIES;
}

const randomCountries = useMemo(() => {
  return shuffleCountries();
}, [])

return (
    <div>
      {searchToggle === "area" ? (
        <div className="background-rectangle-nothing">
    <div className="nothing-found-title">Whoops! We didn't find any concerts in this area... Try again with a different location?</div>
    <div className="alternative-search-choice-container">
    <button className="alternative-search-choice" onClick={() => handleClick(randomCountries[0])}><span className={`fi fi-${randomCountries[0].flag} increase-size brightness-90 contrast-110 ml-[10px] mr-[12px] `}></span>{randomCountries[0].label}</button>
    <button className="alternative-search-choice" onClick={() => handleClick(randomCountries[1])}><span className={`fi fi-${randomCountries[1].flag} increase-size brightness-90 contrast-110 ml-[10px] mr-[12px] `}></span>{randomCountries[1].label}</button>
    <button className="alternative-search-choice" onClick={() => handleClick(randomCountries[2])}><span className={`fi fi-${randomCountries[2].flag} increase-size brightness-90 contrast-110 ml-[10px] mr-[12px] `}></span>{randomCountries[2].label}</button>
    <button className="alternative-search-choice" onClick={() => handleClick(randomCountries[3])}><span className={`fi fi-${randomCountries[3].flag} increase-size brightness-90 contrast-110 ml-[10px] mr-[12px] `}></span>{randomCountries[3].label}</button>
    <button className="alternative-search-choice" onClick={() => handleClick(randomCountries[4])}><span className={`fi fi-${randomCountries[4].flag} increase-size brightness-90 contrast-110 ml-[10px] mr-[12px] `}></span>{randomCountries[4].label}</button>
    </div>
    </div>
      ) : (<div className="background-rectangle-nothing">
    <div className="nothing-found-title">Whoops! We didn't find any concerts for this singer... Try adjusting search filters or searching for someone else?</div>
    </div>
      )
      }
    </div>
)
}

