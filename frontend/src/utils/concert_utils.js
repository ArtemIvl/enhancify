
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
  
export const sort_concerts_descending = (concerts, ranks = {}) => {
  if (!concerts) return {};
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
