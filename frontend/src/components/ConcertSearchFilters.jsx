import * as React from 'react';
import { useState } from "react";
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { fontSize, height } from '@mui/system';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';


export default function ConcertSearchFilters({setSearchByArtist, setDateToSearchFrom,
  setDateToSearchUntil, setSearchRadius}) {

const [active, setActive] = useState("area");
const marks = [
    {
        value: 25,
        label: "25"
    },
    {
        value: 50,
    },
    {
        value: 100,
    },
    {
        value: 150,
    },
        {
        value: 200,
    },
    { value: 250, "label": 250}];
const [searchArea, setSearchArea] = useState(100);
function toggleSearchType(newState) {
if (newState === "area") {
    setActive("artist")
    setSearchByArtist(active);
}
else if (newState === "artist") {
    setActive("area")
    setSearchByArtist(active);
}
}

function valuetext(value) {
  return `${value}°C`;
}


return (
    <div>
    <div className="button-row-filters">
        <button
          className={`filters-button-toggle${active === "area" ? " active" : ""}`}
          onClick={() => toggleSearchType("artist")}
        >
          <span className="material-icons-outlined icon-wrapper">language</span>
          <span className="text-wrapper">
          Search by area
          </span>
        </button>
        <button
          className={`filters-button-toggle${active === "artist" ? " active" : ""}`}
          onClick={() => toggleSearchType("area")}
        >
          <span className="material-icons-outlined icon-wrapper">person</span>
        <span className="text-wrapper">

          Search by artist
          </span>
        </button>
        
    </div>
    <div className="filter-radius-container">
    <div className="event-search-name helper-text-concerts" title='Adjust the search radius (in km) for concerts by city or your location.'>Event search radius (km)</div>
    <Box sx={{ width: 200, mr: 3, ml: 2 }}>
      <Slider
        aria-label="Temperature"
        defaultValue={100}
        getAriaValueText={valuetext}
        valueLabelDisplay="auto"
        step={null}
        marks={marks}
        style={{fontSize: 10}}
        max={250}
        min={25}
      />
    </Box>
    </div>
    <div className='ml-[-4%] mt-[5%]'>Search concerts from</div>     <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DatePicker
    minDate={dayjs()}
    maxDate={dayjs("2027-02-28")}
    yearsOrder="desc"
    renderInput={(params) => (
    <TextField
      {...params}
      inputProps={{
        ...params.inputProps,
        style: { fontSize: 12 }             // ← px number works too
      }}
    />
    )}
    />
    </LocalizationProvider>
    <div className='ml-[-4%] mt-[9%]'>Search concerts until</div>

    </div>
)
};
