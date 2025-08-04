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

function sanitizeValue(value) {
  if (!value || value === "TBD") return "N/A";
  return value;
}

export default function ArtistCard({ artist }) {
  const artistName = stripHTML(artist["Artist"]);
  const imageUrl = extractImageSrc(artist["Image"]);
  const ranksChange = artist["Ranks change"];
  const listenersRaw = artist["Monthly listeners (millions)"];
  const listeners = listenersRaw && listenersRaw !== "TBD"
    ? parseInt(listenersRaw.replace(/,/g, ""), 10)
    : null;
  const rank = artist["Rank"];
  const country = artist["Country"];
  const genre = artist["Genre"];
  const language = artist["Language"];
  const groupType = artist["Group type"];
  const change24h = artist["Change vs yesterday"];
  const changeMonthly = artist["Change vs last month"];
  const spotifyID = artist["Spotify ID"];
  const spotifyLink = `https://open.spotify.com/artist/${spotifyID}`;

  const bgGradient =
    rank === "1" ? "linear-gradient(to bottom, #FFDF00, #E9D293)" :
    rank === "2" ? "linear-gradient(to bottom, #BEC0C2, #EEF2F3)" :
    rank === "3" ? "linear-gradient(to bottom, #D49B57, #CDA575)" :
    "#E5E4E2";

  const rankChangeIcon = 
    ranksChange === 0 ? "maximize" : 
    ranksChange > 0 ? "arrow_drop_up" : 
    ranksChange < 0 ? "arrow_drop_down" :
    "maximize"

  const rankChangeColor = 
    ranksChange === 0 ? "gray" : 
    ranksChange > 0 ? "green" : 
    ranksChange < 0 ? "red" :
    "gray"

  return (
  <div className="w-full leaderboard-grid items-center bg-[#E5E4E2] rounded-xl pl-4 py-4">
    <div className="flex items-center gap-8">
      <div 
        className="text-lg font-semibold w-8 min-w-[25px] text-center rounded-md ml-[0.3vw] py-1"
        style={{ background: bgGradient }}>{rank}</div>
        <div
          className={`flex justify-center ${rank.length >= 5 ? "flex-col w-2 ml-[1vw]" : "flex-row w-1"} items-center`}
          style={{ color: rankChangeColor }}
        >
          <span
            className="material-icons-outlined"
            style={{ marginTop: ranksChange === 0 ? "2vh" : null }}
          >
            {rankChangeIcon}
          </span>
          <div>{ranksChange === 0 ? null : ranksChange}</div>
        </div>
      <div className="w-14 min-w-14 h-14 rounded-md overflow-hidden ml-[1.2vw]">
        <img src={imageUrl} alt={artistName} className="w-full h-full object-cover" />
      </div>

      <div className="flex items-center w-auto overflow-hidden gap-2">
        <span className="font-semibold truncate">{artistName}</span>
      </div>
      <span className={`fi fi-${getCountryCode(country)} hide-item-width-900 rounded min-w-6`} />
    </div>

    <div className="flex items-center">
      <div className="flex flex-1 justify-center">
        <div className="text-sm text-center bg-black rounded-md p-2">{(listeners / 1_000_000).toFixed(2)}M</div>
      </div>

      <div className={`flex flex-1 justify-center ${getChangeColor(changeMonthly)}`}>
        <div className="text-sm text-center rounded-xl bg-[#f5f5f5] py-1 px-3 font-semibold">
        {formatNumber(changeMonthly)}
        </div>
      </div>
      <div className={`flex flex-1 hide-item-width-900 justify-center ${getChangeColor(change24h)}`}>
        <div className="text-sm text-center rounded-xl bg-[#f5f5f5] py-1 px-3">
        {formatNumber(change24h)}
        </div>
      </div>

      <div className="text-sm flex-1 text-center">{sanitizeValue(genre)}</div>

      <div className="text-sm flex-1 text-center hide-item-width-900">{sanitizeValue(language)}</div>


<div className="flex flex-1 justify-center hide-item-width-1200">
  <a
    href={spotifyLink}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative flex items-center w-30 h-12 bg-black rounded-md px-4 overflow-hidden"
  >
    {/* Text (появляется из-под иконки справа) */}
    <span className="absolute ml-8 text-white text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-500 z-0 whitespace-nowrap">
      Spotify
    </span>

    {/* Spotify Icon */}
    <FaSpotify className="relative text-green-500 text-2xl mx-auto transform transition-all duration-500 group-hover:-translate-x-8 group-hover:-rotate-[360deg]" />
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
  "Russian Federation": "UA",
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