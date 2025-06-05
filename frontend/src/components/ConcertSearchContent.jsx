import { useState, useRef, useEffect } from "react";
import "../Concerts.css"
import axios from "axios";

const HARDCODED = [
  { label: "My location", code: "LOC", icon: "pin_drop", description: "Within 100km radius", input_type: "location" },
  { label: "European Union", code: "EU", icon: "language", description: "Region", input_type: "region"},
  { label: "United States", code: "US", icon: "flag_circle", description: "Country", input_type: "country"},
  { label: "New York", code: "NY", icon: "location_city", description: "City", input_type: "city"}
];

export default function ConcertsSearch({ countries = [], setConcerts, setGlobalConcerts, 
  setMostListenedConcerts, setGlobalLoading, setFollowedLoading, toggleMode, followedArtistsToQuery}) {
  const [inputValue, setInputValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [inputCodeType, setInputCodeType] = useState(null)
  const menuRef = useRef();


function handleClick() {
  setGlobalLoading(true)
  setFollowedLoading(true)
  const params = {
      get_top_artist_info: 1,
      countries: []
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
  params["artists"] = [{"artist_id": "1URnnhqYAYcrqrcwql10ft", "artist_name": "21 Savage"}, {"artist_id": "0epOFNiUfyON9EYx7Tpr6V", "artist_name": "The Strokes"}]
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

  const handleInputFocus = () => {
    setDropdownOpen(true);
    setIsSearching(false);
  };

  const handleInputChange = e => {
    const val = e.target.value;
    setInputValue(val);
    setIsSearching(val.length > 0);
    setDropdownOpen(true);
  };

  const handleOptionClick = option => {
    setInputValue(option.label === "My Location" ? "" : option.label);
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
      <input
        type="text"
        value={inputValue}
        onFocus={handleInputFocus}
        onBlur={handleBlur}
        onChange={handleInputChange}
        placeholder="Search by region, country or city..."
        className="search-bar"
        autoComplete="off"
      />
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
        </div>
      )}
    <button onClick={() => handleClick()}
    className="search-bar-button">
    <span className="material-icons-outlined icons-tweaked">search</span>
    </button>
    </div>
  );
}
