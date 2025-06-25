import { useState, useRef, useEffect } from "react";
import "../Concerts.css"
import axios from "axios";

const HARDCODED = [
  { label: "My Location", code: "LOC", icon: "pin_drop", description: "Within 100km radius", input_type: "location" },
  { label: "European Union", code: "EU", icon: "language", description: "Region", input_type: "region"},
  { label: "United States", code: "US", icon: "flag_circle", description: "Country", input_type: "country"},
  { label: "California", code: "CA", icon: "house", description: "State", input_type: "state"},
  { label: "New York", code: "NY", icon: "location_city", description: "City", input_type: "city"}

];

var SEARCH_HISTORY = [

];

export default function ConcertsSearch({ countries = [], setConcerts, setGlobalConcerts, 
  setMostListenedConcerts, setGlobalLoading, setFollowedLoading, toggleMode, followedArtistsToQuery}) {
  const [inputValue, setInputValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null)
  const [isSearching, setIsSearching] = useState(false);
  const [inputCodeType, setInputCodeType] = useState(null)
  const [currentSelectedIcon, setCurrentSelectedIcon] = useState(null);
  const menuRef = useRef();

  const [myLocationLat, setMyLocationLat] = useState(null)
  const [myLocationLng, setMyLocationLng] = useState(null)
function handleClick() {
  setGlobalLoading(true)
  setFollowedLoading(true)
  const params = {
      get_top_artist_info: 1,
      countries: []
  }
  if (selectedItem !== null) {
    let canPush = true;
    for (var item of HARDCODED) {
    if (item.code === selectedItem.code && item.label === selectedItem.label) {
      canPush = false;
    }
  }
    for (var item of SEARCH_HISTORY) {
    if (item.code === selectedItem.code && item.label === selectedItem.label) {
      canPush = false;
    }
    }
    if (canPush) {
    if (HARDCODED.length > 1) {
    HARDCODED.pop();
    }
    SEARCH_HISTORY.push(selectedItem);
    }
  }
  if (inputCodeType === "country") {
    params["countries"] = [selectedCode]
  }
  else if (inputCodeType === "state") {
    params["stateCode"] = selectedCode 
  }
  else if (inputCodeType === "city") {
    console.log(selectedCode)
    let lat = 0;
    let lng = 0;

    const parts = selectedCode.slice(1, -1).split(",");
    if (parts.length === 2) {
      const parsedLat = parseFloat(parts[0].trim());
      const parsedLng = parseFloat(parts[1].trim());
      lat = isNaN(parsedLat) ? 0 : parsedLat;
      lng = isNaN(parsedLng) ? 0 : parsedLng;
    }
    params["geo_latitude"] = lat;
    params["geo_longitude"] = lng;
  }
    else if (inputCodeType === "location") {
    if (myLocationLat && myLocationLng) {
    params["geo_latitude"] = myLocationLat;
    params["geo_longitude"] = myLocationLng;
    }
  }
  console.log(params)
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
  // If you want to log the just-saved value, do it in useEffect after update
}

  // Detect click outside to close dropdown
  // (optional: you can add a useEffect here if needed)

  // Filtered options based on input
  const filtered =
      isSearching && inputValue.length > 0
        ? countries
            .filter(c =>
              c.label.toLowerCase().includes(inputValue.toLowerCase())
            )
            .slice(0, 15)
        : HARDCODED;

  const history =
      isSearching && inputValue.length > 0
        ? countries
            .filter(c =>
              c.label.toLowerCase().includes(inputValue.toLowerCase())
            )
            .slice(0, 15)
        : SEARCH_HISTORY;

  const handleInputFocus = () => {
    setDropdownOpen(true);
    setIsSearching(false);
  };
  const clearInput = () => {
    setInputValue("");
    setInputCodeType(null);
    setCurrentSelectedIcon(null);
    setSelectedCode(null);
  };
  const handleInputChange = e => {
    if (inputCodeType === null) {
    const val = e.target.value;
    setInputValue(val);
    setIsSearching(val.length > 0);
    setDropdownOpen(true);
    }
  };

  const handleOptionClick = option => {
    if (option.label === "My Location") {
      navigator.geolocation.getCurrentPosition((position) => {
      setMyLocationLat(position.coords.latitude);
      setMyLocationLng(position.coords.longitude);
    });
    }
    const selectedItemToAcknowledge = {...option};
    selectedItemToAcknowledge.icon = "history";
    setSelectedItem(selectedItemToAcknowledge);
    setInputValue(option.label === "My location" ? "" : option.label);
    setCurrentSelectedIcon(option.icon)
    setSelectedCode(option.code);
    setInputCodeType(option.input_type)
    setDropdownOpen(false);
    // If needed, trigger any further logic here
  };

  const handleBlur = e => {
    // Allow a short delay so clicks on dropdown options register
    setTimeout(() => setDropdownOpen(false), 120);
  };

  return (
    <div className="search-bar-container">
      <div className="search-wrapper">
      {/* 1️⃣ background rectangle sized by the text */}
      {inputValue !== "" && selectedCode !== null ? (  <span
        aria-hidden="true"
        className="bg-[whitesmoke] rounded-xl absolute text-[1.1vw] pl-[45px] pr-[18px] ml-[30px] mb-[6px] mt-[9px]"
        style={{back: (inputValue !== "" && selectedCode !== null) ? 2000 : 0}}
      >
        <span className="material-icons-outlined search-icon">{currentSelectedIcon}</span>

        {inputValue || null}      {/* keep width when empty */}
      </span>) : null}
      <input
        type="text"
        value={inputValue}
        onFocus={handleInputFocus}
        onBlur={handleBlur}
        onChange={handleInputChange}
        placeholder="Search by region, country or city..."
        className="search-bar"
        style={{ paddingLeft: currentSelectedIcon !== null ? '3.8vw' : '2.6vw' }}
        autoComplete="off"
      />
      {inputValue !== "" ? (<button onClick={clearInput}><span className="material-icons-outlined clear-search-bar">close</span></button>) : null}

      </div>
      {dropdownOpen && (
        <div
          className="search-contents-container"
          ref={menuRef}
        >
          {filtered.length === 0 ? (
            <div>
              No results
            </div>
          ) : (
            filtered.map(option => (
              <div
                key={option.code}
                onMouseDown={() => handleOptionClick(option)}
                className="concerts-search-option"
              >
                <div className="margin-left-search">
                {option.label}
                </div>
                <span className="material-icons-outlined icons-tweaked-search">{option.icon}</span>
                <div className="concerts-search-secondary-text margin-left-search">{option.description}</div>
              </div>
            ))
          )}
          {(history.length === 0 || (inputValue !== "" && selectedCode === null))? (
            null
          ) : (
            <>  <div className="horizontal-line-search-bar"></div>
          {
             history.map(option => (
              <div
                key={option.code}
                onMouseDown={() => handleOptionClick(option)}
                className="concerts-search-option"
              >
                <div className="margin-left-search">
                {option.label}
                </div>
                <span className="material-icons-outlined icons-tweaked-search">{option.icon}</span>
                <div className="concerts-search-secondary-text margin-left-search">{option.description}</div>
              </div>
            ))
          }
          </>
          )}
        </div>
      )}
    <button onClick={() => handleClick()}
    className="search-bar-button">
    <span className="material-icons-outlined icons-tweaked mt-[5px]">search</span>
    </button>
    </div>
  );
}
