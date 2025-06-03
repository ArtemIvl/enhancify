import React, { useState, useEffect } from 'react';
import "../CrispConcertDetails.css";
import "../Concerts.css";
// Use Vite’s import.meta.glob to load images
const concertImages = import.meta.glob('../images/concert/*.{png,jpg,jpeg,svg}', { eager: true, import: 'default' });
const festivalImages = import.meta.glob('../images/festival/*.{png,jpg,jpeg,svg}', { eager: true, import: 'default' });

const get_random_image = (type) => {
  const images = type === 'concert' ? Object.values(concertImages) : Object.values(festivalImages);
  if (images.length === 0) return '';
  return images[Math.floor(Math.random() * images.length)];
};

// Format a single ISO date string to "DD MMM YYYY"
const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
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
        const height = item.type === 'festival' ? '76px' : '70px';

        // Only compute date and location strings for festivals
        let dateText = '';
        let locationText = '';
        if (item.type === 'festival') {
          dateText = `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`;
          const { countries, cities, locations } = item;
          if (countries > 1) {
            locationText = `${countries} countries, ${locations} locations`;
          } else if (cities > 1) {
            locationText = `${cities} cities, ${locations} locations`;
          } else {
            locationText = `${locations} locations`;
          }
        }

        return (
          <div
            key={idx}
            className={`crisp-card brightness-90 ${item.type}-card`}
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
          </div>
        );
      })}
    </div>
  );
};

export default CrispConcertDetails;
