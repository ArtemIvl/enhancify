import { useState } from "react";
import "../Concerts.css";

export default function Concerts() {
  const [active, setActive] = useState("global");
  const [filters, setFilters] = useState("unclicked")
  return (
    <div>
      <div className="button-row move-down">
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
        <div className="search-bar-container">
          <input className="search-bar" placeholder="Search by region, country or city..." />
          <button
          className="search-bar-button"
        >
          <span className="material-icons-outlined icons-tweaked">search</span>
        </button>
        </div>
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