import * as React from 'react';
import { useState } from "react";
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { fontSize, height, width } from '@mui/system';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { getFiltersFromStorage } from '../utils/concert_utils';
import "../index.css"
export default function ConcertSearchFilters({setSearchByArtist, setDateToSearchFrom,
  setDateToSearchUntil, setSearchRadius}) {


const [active, setActive] = useState(getFiltersFromStorage("filters_search_mode", "area"));
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

const handleAreaChange = (event, newValue) => {
    setSearchRadius(newValue)
    localStorage.setItem('search_area_concerts', JSON.stringify(newValue));
  }
function toggleSearchType(newState) {
if (newState === "area") {
    setActive("artist")
    setSearchByArtist("artist");
    localStorage.setItem('filters_search_mode', JSON.stringify("artist"));

}
else if (newState === "artist") {
    setActive("area")
    setSearchByArtist("area");
    localStorage.setItem('filters_search_mode', JSON.stringify("area"));
}
}

function valuetext(value) {
  return `${value}°C`;
}

const getAllowedDate = (type) => {
  let start_date_allowed = dayjs(getFiltersFromStorage("search_start_date", dayjs().add(3, "day")))
  let end_date_allowed = dayjs(getFiltersFromStorage("search_end_date", dayjs().add(3, "year")))
  if (type === "start") {
    return end_date_allowed.add(-1, "day")
  }
  else if (type === "end") {
    return start_date_allowed.add(1, "day")
  }
}
return (
    <div className='items-extra-margin-filters'>
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
        defaultValue={getFiltersFromStorage("search_area_concerts", 100)}
        onChange={handleAreaChange}
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
    <div className='mt-[3%] mb-[2%] dates-filters-text'>Search concerts from</div>     <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DatePicker
    minDate={dayjs()}
    maxDate={getAllowedDate("start")}
    onChange={(newDate) => {
      if (newDate) {
        setDateToSearchFrom(newDate)
        localStorage.setItem('search_start_date', JSON.stringify(newDate));
      }
    }}
    defaultValue={dayjs(getFiltersFromStorage("search_start_date", dayjs().add(3, "day")))}
    yearsOrder="asc"
    slotProps={{ textField: { size: 'small'} }}
    sx={{width: "14vw", minWidth: "135px"}}
    />
    </LocalizationProvider>
    <div className='mt-[5%] mb-[2%] dates-filters-text'>Search concerts until</div>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DatePicker
    minDate={getAllowedDate("end")}
    maxDate={dayjs().add(3, "year")}
    onChange={(newDate) => {
      if (newDate) {
        setDateToSearchUntil(newDate)
        localStorage.setItem('search_end_date', JSON.stringify(newDate));
      }
    }}
    yearsOrder="asc"
    defaultValue={dayjs(getFiltersFromStorage("search_end_date", dayjs().add(1, "year")))}
    slotProps={{ textField: { size: 'small'} }}
    sx={{width: "14vw", minWidth: "135px"}}
    />
    </LocalizationProvider>

    </div>
)
};
