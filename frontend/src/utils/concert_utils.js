
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
