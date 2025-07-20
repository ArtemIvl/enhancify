
//extracts image url from <img> html element
export function extractImageSrc(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const img = doc.querySelector('img');
  return img ? img.src : null;
}

//calculates how many shows are available as a string
export function calculateShowsAvailable(concertList) {
    var concerts = concertList.length;
    if (concerts > 1) {
      return `${concertList.length} shows available`;    }
    else {
      return "1 show available"
    }
  }

// Format a single ISO date string to "DD MMM YYYY"
//takes iso date in string format
export const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const preprocessFavouriteArtistsArray = (favouriteArtists) => {
  const extracted = favouriteArtists.map(({ id, name }) => ({
    artist_id: id,  
    artist_name: name, 
  }));
  return extracted;
};

export function dummyCalculatePriceInfo(startDateIso) {
  let diffDays = 1; // Default if parsing fails

  // Try parsing the date
  const eventDate = new Date(startDateIso);
  const now = new Date();
  if (!isNaN(eventDate.getTime())) {
    diffDays = Math.max(1, Math.floor((eventDate - now) / (1000 * 60 * 60 * 24)));
  }

  // Sooner event = higher price, between $50 and $200
  // Decrease base as diffDays increases, linear scaling
  let base = 200 - Math.min(diffDays, 100) * 1.5; // At 0 days: 200, at 100+ days: 50
  base = Math.round(Math.max(50, Math.min(base, 200)));

  // Calculate min_price
  let min_price = base + Math.floor(Math.random() * 20); // adds a bit of randomness
  min_price = Math.min(min_price, 200);

  // 60% chance to end with 0 or 9
  if (Math.random() < 0.6) {
    min_price = Math.floor(min_price / 10) * 10 + (Math.random() < 0.5 ? 0 : 9);
    min_price = Math.max(50, Math.min(min_price, 200));
  }

  // Calculate max_price (at least 10% more), up to 300
  let max_price = Math.ceil(min_price * (1.1 + Math.random() * 0.6));
  max_price = Math.max(max_price, min_price + 1);
  max_price = Math.min(max_price, 300);

  // 60% chance to end with 0 or 9 for max_price
  if (Math.random() < 0.6) {
    max_price = Math.floor(max_price / 10) * 10 + (Math.random() < 0.5 ? 0 : 9);
    max_price = Math.max(max_price, min_price + 1);
    max_price = Math.min(max_price, 300);
  }

  // 80% chance to return range, 20% "from"
  if (Math.random() < 0.8) {
    return `$${min_price}-${max_price}`;
  } else {
    return `from ${min_price}$`;
  }
}


// same to previous function, but the formatting is a bit different
// Output example: 21 May, 05:00
export const format_date_2 = (isoString) => {
  const date = new Date(isoString);
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month}, ${hours}:${minutes}`;
};


//preprocessing the rankings array for further sorting
export const sort_num_rankings = rankings =>
  Object.fromEntries(
    Object.entries(rankings)
      // parse "3,917" → 3917
      .map(([id, val]) => [id, parseInt(val.replace(/,/g, ''), 10)])
      // sort ascending (smallest first)
      .sort(([, a], [, b]) => a - b)
      // keep only the first 500
      .slice(0, 500)
  );

export function truncate_text(text, limit) {
  if (text.length <= limit) return text;
  const ell = '...';
  // if limit is very small, just slice and append
  const sliceLen = limit > ell.length ? limit - ell.length : limit;
  return text.slice(0, sliceLen) + ell;
}

export function getFiltersFromStorage(key, defaultValue) {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
}

export const sort_concerts_descending = (concerts, ranks = {}) => {
  if (!concerts || !ranks) return {};
  return Object.fromEntries(
    Object.entries(concerts)
      .sort(([idA], [idB]) => {

        // use +Infinity for missing ranks so they sort to the end
        const rankA = ranks[idA] ?? Number.POSITIVE_INFINITY;
        const rankB = ranks[idB] ?? Number.POSITIVE_INFINITY;
        // ascending: smaller ranks first
        return rankA - rankB;
      })
  );
};