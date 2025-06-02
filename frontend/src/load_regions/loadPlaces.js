import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import worldCities from "worldcities";
import cities from "../load_regions/cities500.json"

countries.registerLocale(enLocale);

const countryObj = countries.getNames("en");
const countriesArr = Object.entries(countryObj).map(
  ([code, label]) => ({
    code,
    label,
    description: "Country",
    icon: "flag_circle"
  })
);

const usStates = [
  { code: "AL", label: "Alabama", description: "State", icon: "cottage" },
  { code: "AK", label: "Alaska", description: "State", icon: "cottage" },
  { code: "AZ", label: "Arizona", description: "State", icon: "cottage" },
  { code: "AR", label: "Arkansas", description: "State", icon: "cottage" },
  { code: "CA", label: "California", description: "State", icon: "cottage" },
  { code: "CO", label: "Colorado", description: "State", icon: "cottage" },
  { code: "CT", label: "Connecticut", description: "State", icon: "cottage" },
  { code: "DE", label: "Delaware", description: "State", icon: "cottage" },
  { code: "FL", label: "Florida", description: "State", icon: "cottage" },
  { code: "GA", label: "Georgia", description: "State", icon: "cottage" },
  { code: "HI", label: "Hawaii", description: "State", icon: "cottage" },
  { code: "ID", label: "Idaho", description: "State", icon: "cottage" },
  { code: "IL", label: "Illinois", description: "State", icon: "cottage" },
  { code: "IN", label: "Indiana", description: "State", icon: "cottage" },
  { code: "IA", label: "Iowa", description: "State", icon: "cottage" },
  { code: "KS", label: "Kansas", description: "State", icon: "cottage" },
  { code: "KY", label: "Kentucky", description: "State", icon: "cottage" },
  { code: "LA", label: "Louisiana", description: "State", icon: "cottage" },
  { code: "ME", label: "Maine", description: "State", icon: "cottage" },
  { code: "MD", label: "Maryland", description: "State", icon: "cottage" },
  { code: "MA", label: "Massachusetts", description: "State", icon: "cottage" },
  { code: "MI", label: "Michigan", description: "State", icon: "cottage" },
  { code: "MN", label: "Minnesota", description: "State", icon: "cottage" },
  { code: "MS", label: "Mississippi", description: "State", icon: "cottage" },
  { code: "MO", label: "Missouri", description: "State", icon: "cottage" },
  { code: "MT", label: "Montana", description: "State", icon: "cottage" },
  { code: "NE", label: "Nebraska", description: "State", icon: "cottage" },
  { code: "NV", label: "Nevada", description: "State", icon: "cottage" },
  { code: "NH", label: "New Hampshire", description: "State", icon: "cottage" },
  { code: "NJ", label: "New Jersey", description: "State", icon: "cottage" },
  { code: "NM", label: "New Mexico", description: "State", icon: "cottage" },
  { code: "NY", label: "New York", description: "State", icon: "cottage" },
  { code: "NC", label: "North Carolina", description: "State", icon: "cottage" },
  { code: "ND", label: "North Dakota", description: "State", icon: "cottage" },
  { code: "OH", label: "Ohio", description: "State", icon: "cottage" },
  { code: "OK", label: "Oklahoma", description: "State", icon: "cottage" },
  { code: "OR", label: "Oregon", description: "State", icon: "cottage" },
  { code: "PA", label: "Pennsylvania", description: "State", icon: "cottage" },
  { code: "RI", label: "Rhode Island", description: "State", icon: "cottage" },
  { code: "SC", label: "South Carolina", description: "State", icon: "cottage" },
  { code: "SD", label: "South Dakota", description: "State", icon: "cottage" },
  { code: "TN", label: "Tennessee", description: "State", icon: "cottage" },
  { code: "TX", label: "Texas", description: "State", icon: "cottage" },
  { code: "UT", label: "Utah", description: "State", icon: "cottage" },
  { code: "VT", label: "Vermont", description: "State", icon: "cottage" },
  { code: "VA", label: "Virginia", description: "State", icon: "cottage" },
  { code: "WA", label: "Washington", description: "State", icon: "cottage" },
  { code: "WV", label: "West Virginia", description: "State", icon: "cottage" },
  { code: "WI", label: "Wisconsin", description: "State", icon: "cottage" },
  { code: "WY", label: "Wyoming", description: "State", icon: "cottage" }
];


const allRegions = [
  ...countriesArr,    // from your i18n-iso-countries logic
  ...usStates,
  ...cities
    .filter(city => city.pop > 15000)
    .map(city => ({
      code: `(${city.lat}, ${city.lng})`,
      label: city.name,
      description: "City",
      icon: "location_city"
    }))
];

export default allRegions;