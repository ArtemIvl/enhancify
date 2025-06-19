

export default function NothingFoundCardConcerts() {
    const HARDCODED_COUNTRIES = [
  { label: "Spain", flag: "es"},
  { label: "Barcelona", flag: "es" },
  { label: "Madrid", flag: "es" },
  { label: "United States", flag: "us" },
  { label: "Las Vegas", flag: "us" },
  { label: "Australia", flag: "au" },
  { label: "New York", flag: "us" },
  { label: "Amsterdam", flag: "nl" },
  { label: "Netherlands", flag: "nl" },
  { label: "London", flag: "gb" },
  { label: "Brussels", flag: "be" },
  { label: "Berlin", flag: "de" },
  { label: "Geneva", flag: "ch" },
  { label: "Portugal", flag: "pt" },
  { label: "Munich", flag: "de" },
  { label: "Ibiza", flag: "es" },
  { label: "Los Angeles", flag: "us" },
  { label: "Florida", flag: "us" },
  { label: "Washington", flag: "us" },
  { label: "Mexico City", flag: "mx" },
  { label: "Mexico", flag: "mx" },
  { label: "Vancouver", flag: "ca" },
  { label: "Ottawa", flag: "ca" },
  { label: "Prague", flag: "cz" },
  { label: "Vienna", flag: "at" },
  { label: "Dublin", flag: "ie" }
];

function shuffleCountries() {
    for (let i = HARDCODED_COUNTRIES.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [HARDCODED_COUNTRIES[i], HARDCODED_COUNTRIES[j]] =
        [HARDCODED_COUNTRIES[j], HARDCODED_COUNTRIES[i]];
    }
    return HARDCODED_COUNTRIES;
}
shuffleCountries();

return (
    <div>
        <div className="background-rectangle-nothing">
    <div className="nothing-found-title">Whoops! We didn't find any concerts in this area... Try again with a different location?</div>
    <div className="alternative-search-choice-container">
    <button className="alternative-search-choice"><span className={`fi fi-${HARDCODED_COUNTRIES[0].flag} increase-size brightness-90 contrast-110 ml-[10px] mr-[12px] `}></span>{HARDCODED_COUNTRIES[0].label}</button>
    <button className="alternative-search-choice"><span className={`fi fi-${HARDCODED_COUNTRIES[1].flag} increase-size brightness-90 contrast-110 ml-[10px] mr-[12px] `}></span>{HARDCODED_COUNTRIES[1].label}</button>
    <button className="alternative-search-choice"><span className={`fi fi-${HARDCODED_COUNTRIES[2].flag} increase-size brightness-90 contrast-110 ml-[10px] mr-[12px] `}></span>{HARDCODED_COUNTRIES[2].label}</button>
    <button className="alternative-search-choice"><span className={`fi fi-${HARDCODED_COUNTRIES[3].flag} increase-size brightness-90 contrast-110 ml-[10px] mr-[12px] `}></span>{HARDCODED_COUNTRIES[3].label}</button>
    <button className="alternative-search-choice"><span className={`fi fi-${HARDCODED_COUNTRIES[4].flag} increase-size brightness-90 contrast-110 ml-[10px] mr-[12px] `}></span>{HARDCODED_COUNTRIES[4].label}</button>
    </div>
    </div>
    </div>
)
}

