import React, { useState, useEffect, useMemo } from 'react';
import "../CrispConcertDetails.css";
import "../Concerts.css";
import { formatDate, format_date_2, truncate_text } from '../utils/concert_utils';
import axios from 'axios';
// Use Vite’s import.meta.glob to load images
const concertImages = import.meta.glob('../images/concert/*.{png,jpg,jpeg,svg}', { eager: true, import: 'default' });
const festivalImages = import.meta.glob('../images/festival/*.{png,jpg,jpeg,svg}', { eager: true, import: 'default' });

const howMuchConcertsToDisplayPerTour = 5;
let previousSelectedConcertImage = null;
let previousSelectedFestivalImage = null;

export const format_date_with_helper = (isoString) => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    // handle invalid input however you like:
    return (
      <div title='The exact dates for this event are yet to be decided' className='helper-text-concerts'>TBD</div>
    )
    // or throw new Error(`Bad date: ${isoString}`);
  }

  const day     = date.getDate();
  const month   = date.toLocaleString('en-GB', { month: 'short' });
  const hours   = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day} ${month}, ${hours}:${minutes}`;
};

const get_random_image = (type) => {
  const images = type === 'concert'
    ? Object.values(concertImages)
    : Object.values(festivalImages);

  if (images.length === 0) return '';

  // If there's only one image, just return it
  if (images.length === 1) {
    const onlyImage = images[0];
    if (type === 'concert') previousSelectedConcertImage = onlyImage;
    else previousSelectedFestivalImage = onlyImage;
    return onlyImage;
  }

  const prev = type === 'concert'
    ? previousSelectedConcertImage
    : previousSelectedFestivalImage;

  let candidate;
  do {
    candidate = images[Math.floor(Math.random() * images.length)];
  } while (candidate === prev);

  if (type === 'concert') previousSelectedConcertImage = candidate;
  else previousSelectedFestivalImage = candidate;

  return candidate;
};

const CrispConcertDetails = React.memo(({ concerts }) => {
  const [filteredCrispData, setFilteredCrispData] = useState([]);

  useEffect(() => {
    const groups = {};
    concerts.forEach((item) => {
      const name = item.name;
      if (!groups[name]) groups[name] = [];
      groups[name].push(item);
    });

    const result = Object.entries(groups).map(([name, items]) => {
      if (items.length === 1) {
        const elem = items[0];
        return {
          type: 'concert',
          name,
          startDate: elem.dates.start.dateTime,
          endDate: null,
          elements: [elem],
          locations: 1,
          countries: 1,
          cities: 1,
        };
      } else {
        const dates = items.map((e) => e.dates.start.dateTime);
        const startDate = dates.reduce((a, b) => (a < b ? a : b));
        const endDate = dates.reduce((a, b) => (a > b ? a : b));
        const countrySet = new Set();
        const citySet = new Set();
        items.forEach((e) => {
          const venue = e._embedded.venues[0];
          countrySet.add(venue.country.countryCode);
          citySet.add(venue.city.name);
        });
        return {
          type: 'festival',
          name,
          startDate,
          endDate,
          elements: items,
          locations: items.length,
          countries: countrySet.size,
          cities: citySet.size,
        };
      }
    });

    result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    setFilteredCrispData(result);
  }, [concerts]);

  const [images, setImages] = useState([]);
  const [seeAllStates, setSeeAllStates] = useState({});
  const [priceInfo, setPriceInfo] = useState({})
  
  // to update:
  const updateEntry = (k, v) => {
    setSeeAllStates(prev => ({ 
      ...prev,      // copy existing entries
      [k]: v        // overwrite or add the key
    }));
  };

  const updateEntryPrice = (k, v) => {
    setPriceInfo(prev => ({ 
      ...prev,      // copy existing entries
      [k]: v        // overwrite or add the key
    }));
  };

  function getEventPrices(event_id_str) {
    axios.post('http://localhost:8000/get_event_ticket_price', {
        event_id: event_id_str
    }).then(({ data }) => {
      updateEntryPrice(event_id_str, data)
      console.log(data)
      })
    .catch(error => {
      console.error(error);
    });
    
  }

  function activateSeeAll(idx) {
    updateEntry(idx, true);
  }
  function handleArenaName(e) {
    if (e._embedded.venues[0].name != null) {
    return (
      <div className = 'font-semibold'>
      {truncate_text(e._embedded.venues[0].name, 45)}
      </div>
    )
    }
    else {
      return (
      <span className = 'font-semibold helper-text-concerts' title='The concert venue is yet to be announced'>
      TBA
      </span>
      )
    }
  }
  function slicingHandler(idx) {
    if (seeAllStates !== null) {
      if (idx in seeAllStates) {
      return 10000;
      }
    }
    return howMuchConcertsToDisplayPerTour;
  }
  useEffect(() => {
    setImages(filteredCrispData.map(item => get_random_image(item.type)));
    // run only once on mount (or whenever filteredCrispData changes)
  }, [filteredCrispData]);

  return (
    <div className='font-size-crisp-main'>
    
      {filteredCrispData.map((item, idx) => {
        const imageUrl = images[idx];
        const height = item.type === 'festival' ? '65px' : '60px';

        // Only compute date and location strings for festivals
        let dateText = '';
        let locationText = '';
        if (item.type === 'festival') {
          dateText = `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`;
          const { countries, cities, locations } = item;
          if (countries > 1) {
            locationText = `${countries} countries, ${locations} concerts`;
          } else if (cities > 1) {
            locationText = `${cities} cities, ${locations} concerts`;
          } else {
            locationText = `${locations} concerts`;
          }
        }

        return (
          <div>
          <div
            key={idx}
            className={`crisp-card brightness-90 ${item.type}-card`}
            style={{ height, backgroundImage: `url(${imageUrl})` }}
          >
            {console.log(idx)}
            {item.type === 'festival' && (
              <>
              <div className='festival-name-container'>
              <div className='text-festival'>{truncate_text(item.name, 90)}</div>
              </div>
                <div className='crisp-horizontal-line'>|</div>
                <div className='dates-container'>
                  <div className='dates-crisp'>
                    <span className="material-icons-outlined dates-icon-large">event</span>
                  </div>
                  {dateText}
                </div>
                <div className='crisp-horizontal-line'>|</div>
                <div className='locations-container'>
                  <div className='locations-crisp'>
                    <span className="material-icons-outlined dates-icon-large">pin_drop</span>
                  </div>
                  {locationText}
                </div>
              </>
            ) }
            {item.type === 'concert' && (
              <>
                <div className='concert-name-container'>
                <div className='text-concert'>{truncate_text(item.name, 65)}</div>
                </div>
                <div className='crisp-horizontal-line-2'>|</div>
                <div className='location-container-concert'>
                  <div className='concert-crisp'>
                    <span className={`fi fi-${item.elements[0]._embedded.venues[0].country.countryCode.toLowerCase()} increase-size brightness-90 contrast-110 ml-[0.6vw] mr-[0.8vw] rounded-lg mt-[0.6vh]`}></span>
                    {item.elements[0]._embedded.venues[0].city.name}
                  </div>
                  {dateText}
                </div>
                <div className='crisp-horizontal-line-2'>|</div>
                <div className='dates-container-concert'>
                  <div className='concert-dates-crisp'>
                    <span className='material-icons-outlined contrast-110 ml-[0.6vw] mr-[0.8vw] rounded-lg mt-[0.4vh]'>calendar_month</span>
                     <span className='mt-[1vh]'>{format_date_with_helper(item.startDate)}</span>
                  </div>
                  {dateText}
                </div>
                <div className='crisp-horizontal-line-2'>|</div>
                <div className='get-prices-container-concert'>
                  {
                   item.elements[0].id in priceInfo ? <div>{priceInfo[item.elements[0].id]["min_price"]}</div> : 
                  <button className='get-prices-crisp' style={{cursor: 'pointer'}} onClick={() => getEventPrices(item.elements[0].id)}>
                    <span className='material-icons-outlined contrast-110 ml-[0.6vw] mr-[0.8vw] rounded-lg mt-[0.4vh]'>info</span>
                     <span className='mt-[1vh]'>Get prices</span>
                  </button>
                  }
                  {dateText}
                </div>
                <div className='crisp-horizontal-line-2'>|</div>
                <div className='universal-subconcert-container w-[20%]'>
                <div className='get-tickets-concert-fade get-tickets-concert'  onClick={() => window.open(item.elements[0].url, '_blank')}>
                  <a href={item.elements[0].url} target="_blank" rel="noopener noreferrer">
                  <div className='font-semibold center-buy-tickets-concert mt-[1vh] '>Buy tickets</div>
                  </a>
                </div>
               </div>
              </>
            )}
          </div>
        {item.type === 'festival' && (
          <div>
            
            {item.elements.slice(0, slicingHandler(idx)).map((e, i) => {
              const city = e._embedded.venues[0].city.name;
              return (
                <div className = "tour-concert-info-container" key={i} style={{ fontSize: '12px' }}>
                  <div className='universal-subconcert-container w-[25%]'>
                    <span className={`fi fi-${e._embedded.venues[0].country.countryCode.toLowerCase()} increase-size brightness-85 contrast-110 ml-[30px] mr-[12px] rounded-lg`}></span>
                    <div className = 'font-semibold'>
                  {city}
                  </div>
                  </div>
                <div className="mini-horizontal-line"></div>
                 <div className='universal-subconcert-container w-[17%]'>
                   <span className="material-icons-outlined dates-icon-large">schedule</span>
                  <div className = 'font-semibold'>
                  {format_date_with_helper(e.dates.start.dateTime)}
                  </div>
                </div>
                <div className="mini-horizontal-line"></div>

                <div className='universal-subconcert-container w-[17%]'>
                  {handleArenaName(e)}
                </div>
                <div className="mini-horizontal-line"></div>
                
                <button className='universal-subconcert-container w-[13%]'>
                   <span className="material-icons-outlined dates-icon-large">info</span>
                   {e.id in priceInfo ? <div>{priceInfo[e.id]}</div> : <div className='get-prices'>Get prices</div>}
                </button>
                <div className='get-tickets-concert-fade get-tickets-tour-size'  onClick={() => window.open(e.url, '_blank')}>
                  <a href={e.url} target="_blank" rel="noopener noreferrer">
                  <div className='font-semibold center-buy-tickets-text mt-[10px] '> Buy tickets <span className="material-icons-outlined dates-icon-large ml-[5px] pt-[5px]">arrow_outward</span></div>
                  </a>
                </div>

                </div>
              );
            })}
            { (idx in seeAllStates || item.elements.length <= howMuchConcertsToDisplayPerTour) ? null : 
            <button onClick={() => activateSeeAll(idx)} className='see-all-button'>{"...and ".concat((item.elements.length - howMuchConcertsToDisplayPerTour).toString()).concat(" more shows")}</button>
      }
          </div>
        )}
          </div>
        );
      })}
    </div>
  );
});

export default CrispConcertDetails;
