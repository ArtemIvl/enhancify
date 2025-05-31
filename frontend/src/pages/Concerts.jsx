import { useState } from "react";
import "../Concerts.css";
import ConcertsSearch from "../components/ConcertSearchContent";
import countriesArr from "../components/countryList";

export default function Concerts() {
  const [active, setActive] = useState("global");
  const [filters, setFilters] = useState("unclicked")
  const [focused, setFocused] = useState(false);
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
    </div>
  );
}