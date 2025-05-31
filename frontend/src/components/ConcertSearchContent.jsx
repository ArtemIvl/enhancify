import { useState, useRef } from "react";
import "../Concerts.css"
const HARDCODED = [
  { label: "My location", code: "LOC", icon: "pin_drop", description: "Within 100km radius" },
  { label: "European Union", code: "EU", icon: "language", description: "Region" },
  { label: "United States", code: "US", icon: "flag_circle", description: "Country"},
  { label: "New York", code: "NY", icon: "location_city", description: "City"}
];

export default function ConcertsSearch({ countries = [] }) {
  const [concerts, setConcerts] = useState(null)
  const [inputValue, setInputValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const menuRef = useRef();

  function handleClick() {
    axios.get('https://localhost:8000/get_concerts')
      .then(response => {
        setPosts(response.data);
      })
      .catch(error => {
        console.error(error);
      });
    console.log();
  };
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
