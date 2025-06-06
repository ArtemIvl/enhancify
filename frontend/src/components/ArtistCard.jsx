import { FaSpotify } from "react-icons/fa";

function stripHTML(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

function getCountryCode(countryName) {
  return countryNameToCodeMap[countryName] ? countryNameToCodeMap[countryName].toLowerCase() : "";
}

function extractImageSrc(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const img = doc.querySelector("img");
  return img ? img.src : null;
}

function getChangeColor(value) {
  return parseInt(value.replace(/,/g, ""), 10) >= 0 ? "text-green-600" : "text-red-600";
}

function formatNumber(value) {
  const num = parseInt(value.replace(/,/g, ""), 10);
  return num.toLocaleString();
}

export default function ArtistCard({ artist }) {
  const artistName = stripHTML(artist["Artist"]);
  const imageUrl = extractImageSrc(artist["Image"]);
  const listeners = parseInt(artist["Monthly listeners (millions)"].replace(/,/g, ""), 10);
  const rank = artist["Rank"];
  const country = artist["Country"];
  const genre = artist["Genre"];
  const language = artist["Language"];
  const groupType = artist["Group type"];
  const change24h = artist["Change vs yesterday"];
  const changeMonthly = artist["Change vs last month"];
  const spotifyID = artist["Spotify ID"];
  const spotifyLink = `https://open.spotify.com/artist/${spotifyID}`;

  return (
  <div className="w-full grid grid-cols-[25%_75%] items-center bg-[#e0e0e0] rounded-lg px-4 py-4 gap-4">
    {/* LEFT COLUMN */}
    <div className="flex items-center gap-8">
      {/* Rank */}
      <div className="text-lg font-semibold w-6 text-center">{rank}</div>

      {/* Image */}
      <div className="w-14 h-14 rounded overflow-hidden">
        <img src={imageUrl} alt={artistName} className="w-full h-full object-cover" />
      </div>

      {/* Name + Flag */}
      <div className="flex items-center max-w-[160px] overflow-hidden gap-2">
        <span className="font-semibold truncate">{artistName}</span>
      </div>
      <span className={`fi fi-${getCountryCode(country)} mt-1 rounded`} />
    </div>

    {/* RIGHT COLUMN */}
    <div className="grid grid-cols-7 items-center gap-2">
      {/* Listeners */}
      <div className="text-sm text-center">{(listeners / 1_000_000).toFixed(1)}M</div>

      {/* Genre */}
      <div className="text-sm text-center">{genre}</div>

      {/* Language */}
      <div className="text-sm text-center">{language}</div>

      {/* 24h Change */}
      <div className={`text-sm text-center ${getChangeColor(change24h)}`}>
        {formatNumber(change24h)}
      </div>

      {/* Monthly Change */}
      <div className={`text-sm text-center ${getChangeColor(changeMonthly)}`}>
        {formatNumber(changeMonthly)}
      </div>

      {/* Group Type */}
      <div className="text-sm text-center">{groupType}</div>

      {/* Spotify */}
      <div className="flex justify-center">
        <a
          href={spotifyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-20 bg-black rounded-md px-2 py-1.5"
        >
          <FaSpotify className="text-green-500 text-2xl" />
        </a>
      </div>
    </div>
  </div>
  );
}

// countryCodeMapping.js

const countryNameToCodeMap = {
  "Afghanistan": "AF",
  "Åland Islands": "AX",
  "Albania": "AL",
  "Algeria": "DZ",
  "American Samoa": "AS",
  "Andorra": "AD",
  "Angola": "AO",
  "Anguilla": "AI",
  "Antarctica": "AQ",
  "Antigua and Barbuda": "AG",
  "Argentina": "AR",
  "Armenia": "AM",
  "Aruba": "AW",
  "Australia": "AU",
  "Austria": "AT",
  "Azerbaijan": "AZ",
  "Bahamas": "BS",
  "Bahrain": "BH",
  "Bangladesh": "BD",
  "Barbados": "BB",
  "Belarus": "BY",
  "Belgium": "BE",
  "Belize": "BZ",
  "Benin": "BJ",
  "Bermuda": "BM",
  "Bhutan": "BT",
  "Bolivia": "BO",
  "Bosnia and Herzegovina": "BA",
  "Botswana": "BW",
  "Brazil": "BR",
  "British Indian Ocean Territory": "IO",
  "Brunei Darussalam": "BN",
  "Bulgaria": "BG",
  "Burkina Faso": "BF",
  "Burundi": "BI",
  "Cabo Verde": "CV",
  "Cambodia": "KH",
  "Cameroon": "CM",
  "Canada": "CA",
  "Cayman Islands": "KY",
  "Central African Republic": "CF",
  "Chad": "TD",
  "Chile": "CL",
  "China": "CN",
  "Colombia": "CO",
  "Comoros": "KM",
  "Congo": "CG",
  "Congo, Democratic Republic of the": "CD",
  "Costa Rica": "CR",
  "Croatia": "HR",
  "Cuba": "CU",
  "Cyprus": "CY",
  "Czechia": "CZ",
  "Denmark": "DK",
  "Djibouti": "DJ",
  "Dominica": "DM",
  "Dominican Republic": "DO",
  "Ecuador": "EC",
  "Egypt": "EG",
  "El Salvador": "SV",
  "Equatorial Guinea": "GQ",
  "Eritrea": "ER",
  "Estonia": "EE",
  "Eswatini": "SZ",
  "Ethiopia": "ET",
  "Fiji": "FJ",
  "Finland": "FI",
  "France": "FR",
  "Gabon": "GA",
  "Gambia": "GM",
  "Georgia": "GE",
  "Germany": "DE",
  "Ghana": "GH",
  "Greece": "GR",
  "Greenland": "GL",
  "Grenada": "GD",
  "Guatemala": "GT",
  "Guinea": "GN",
  "Guinea-Bissau": "GW",
  "Guyana": "GY",
  "Haiti": "HT",
  "Honduras": "HN",
  "Hong Kong": "HK",
  "Hungary": "HU",
  "Iceland": "IS",
  "India": "IN",
  "Indonesia": "ID",
  "Iran": "IR",
  "Iraq": "IQ",
  "Ireland": "IE",
  "Israel": "IL",
  "Italy": "IT",
  "Jamaica": "JM",
  "Japan": "JP",
  "Jordan": "JO",
  "Kazakhstan": "KZ",
  "Kenya": "KE",
  "Kiribati": "KI",
  "Korea, Democratic People's Republic of": "KP",
  "Korea, Republic of": "KR",
  "Kuwait": "KW",
  "Kyrgyzstan": "KG",
  "Lao People's Democratic Republic": "LA",
  "Latvia": "LV",
  "Lebanon": "LB",
  "Lesotho": "LS",
  "Liberia": "LR",
  "Libya": "LY",
  "Liechtenstein": "LI",
  "Lithuania": "LT",
  "Luxembourg": "LU",
  "Madagascar": "MG",
  "Malawi": "MW",
  "Malaysia": "MY",
  "Maldives": "MV",
  "Mali": "ML",
  "Malta": "MT",
  "Marshall Islands": "MH",
  "Mauritania": "MR",
  "Mauritius": "MU",
  "Mexico": "MX",
  "Micronesia": "FM",
  "Moldova": "MD",
  "Monaco": "MC",
  "Mongolia": "MN",
  "Montenegro": "ME",
  "Morocco": "MA",
  "Mozambique": "MZ",
  "Myanmar": "MM",
  "Namibia": "NA",
  "Nauru": "NR",
  "Nepal": "NP",
  "Netherlands": "NL",
  "New Zealand": "NZ",
  "Nicaragua": "NI",
  "Niger": "NE",
  "Nigeria": "NG",
  "North Macedonia": "MK",
  "Norway": "NO",
  "Oman": "OM",
  "Pakistan": "PK",
  "Palau": "PW",
  "Panama": "PA",
  "Papua New Guinea": "PG",
  "Paraguay": "PY",
  "Peru": "PE",
  "Philippines": "PH",
  "Poland": "PL",
  "Portugal": "PT",
  "Puerto Rico": "PR",
  "Qatar": "QA",
  "Romania": "RO",
  "Russian Federation": "RU",
  "Rwanda": "RW",
  "Saint Kitts and Nevis": "KN",
  "Saint Lucia": "LC",
  "Saint Vincent and the Grenadines": "VC",
  "Samoa": "WS",
  "San Marino": "SM",
  "Sao Tome and Principe": "ST",
  "Saudi Arabia": "SA",
  "Senegal": "SN",
  "Serbia": "RS",
  "Seychelles": "SC",
  "Sierra Leone": "SL",
  "Singapore": "SG",
  "Slovakia": "SK",
  "Slovenia": "SI",
  "Solomon Islands": "SB",
  "Somalia": "SO",
  "South Africa": "ZA",
  "South Korea": "KR",
  "South Sudan": "SS",
  "Spain": "ES",
  "Sri Lanka": "LK",
  "Sudan": "SD",
  "Suriname": "SR",
  "Sweden": "SE",
  "Switzerland": "CH",
  "Syrian Arab Republic": "SY",
  "Taiwan": "TW",
  "Tajikistan": "TJ",
  "Tanzania": "TZ",
  "Thailand": "TH",
  "Timor-Leste": "TL",
  "Togo": "TG",
  "Tonga": "TO",
  "Trinidad and Tobago": "TT",
  "Tunisia": "TN",
  "Turkey": "TR",
  "Turkmenistan": "TM",
  "Tuvalu": "TV",
  "Uganda": "UG",
  "Ukraine": "UA",
  "United Arab Emirates": "AE",
  "United Kingdom": "GB",
  "United States of America": "US",
  "Uruguay": "UY",
  "Uzbekistan": "UZ",
  "Vanuatu": "VU",
  "Venezuela": "VE",
  "Viet Nam": "VN",
  "Yemen": "YE",
  "Zambia": "ZM",
  "Zimbabwe": "ZW"
};