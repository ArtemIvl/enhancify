import React, { useState, useEffect } from 'react';
import "../CrispConcertDetails.css";
import "../Concerts.css";
import { formatDate, format_date_2 } from '../utils/concert_utils';

// Use Vite’s import.meta.glob to load images
const concertImages = import.meta.glob('../images/concert/*.{png,jpg,jpeg,svg}', { eager: true, import: 'default' });
const festivalImages = import.meta.glob('../images/festival/*.{png,jpg,jpeg,svg}', { eager: true, import: 'default' });

const get_random_image = (type) => {
  const images = type === 'concert' ? Object.values(concertImages) : Object.values(festivalImages);
  if (images.length === 0) return '';
  return images[Math.floor(Math.random() * images.length)];
};

const CrispConcertDetails = ({ concerts }) => {
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

  return (
    <div>
      {filteredCrispData.map((item, idx) => {
        const imageUrl = get_random_image(item.type);
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
            className={`crisp-card brightness-100 ${item.type}-card`}
            style={{ height, backgroundImage: `url(${imageUrl})` }}
          >
            <div className='festival-name-container'>
              <div className='text-festival'>{item.name}</div>
            </div>

            {item.type === 'festival' && (
              <>
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
            )}
            {item.type === 'concert' && (
              <>
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
            )}
          </div>
        {item.type === 'festival' && (
          <div>
            {item.elements.map((e, i) => {
              const city = e._embedded.venues[0].city.name;
              return (
                <div className = "tour-concert-info-container" key={i} style={{ fontSize: '12px' }}>
                  <div className='universal-subconcert-container w-[25%]'>
                    <span className={`fi fi-${e._embedded.venues[0].country.countryCode.toLowerCase()} increase-size brightness-80 contrast-110 ml-[30px] mr-[12px] rounded-lg`}></span>
                    <div className = 'font-semibold'>
                  {city}
                  </div>
                  </div>
                <div className="mini-horizontal-line"></div>
                 <div className='universal-subconcert-container w-[17%]'>
                   <span className="material-icons-outlined dates-icon-large">schedule</span>
                  <div className = 'font-semibold'>
                  {format_date_2(e.dates.start.dateTime)}
                  </div>
                </div>
                <div className="mini-horizontal-line"></div>

                <div className='universal-subconcert-container w-[17%]'>
                  <div className = 'font-semibold'>
                  {e._embedded.venues[0].name == null ? "----" : e._embedded.venues[0].name}
                  </div>
                </div>
                <div className="mini-horizontal-line"></div>
                
                <div className='universal-subconcert-container w-[13%]'>
                   <span className="material-icons-outlined dates-icon-large">info</span>
                   <div className='get-prices'>Get prices</div>
                </div>
                <div className='get-tickets-fade get-tickets-tour-size'  onClick={() => window.open(e.url, '_blank')}>
                  <a href={e.url} target="_blank" rel="noopener noreferrer">
                  <div className='font-semibold center-buy-tickets-text mt-[10px] '> Buy tickets <span className="material-icons-outlined dates-icon-large ml-[5px] pt-[5px]">arrow_outward</span></div>
                  </a>
                </div>

                </div>
              );
            })}
          </div>
        )}
          </div>
        );
      })}
    </div>
  );
};

export default CrispConcertDetails;
