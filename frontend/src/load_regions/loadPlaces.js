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
    icon: "flag_circle",
    input_type: "country"
  })
);

const usStates = [
  { code: "AL", label: "Alabama", description: "State", icon: "cottage", input_type: "state" },
  { code: "AK", label: "Alaska", description: "State", icon: "cottage", input_type: "state" },
  { code: "AZ", label: "Arizona", description: "State", icon: "cottage", input_type: "state" },
  { code: "AR", label: "Arkansas", description: "State", icon: "cottage", input_type: "state" },
  { code: "CA", label: "California", description: "State", icon: "cottage", input_type: "state" },
  { code: "CO", label: "Colorado", description: "State", icon: "cottage", input_type: "state" },
  { code: "CT", label: "Connecticut", description: "State", icon: "cottage", input_type: "state" },
  { code: "DE", label: "Delaware", description: "State", icon: "cottage", input_type: "state" },
  { code: "FL", label: "Florida", description: "State", icon: "cottage", input_type: "state" },
  { code: "GA", label: "Georgia", description: "State", icon: "cottage", input_type: "state" },
  { code: "HI", label: "Hawaii", description: "State", icon: "cottage", input_type: "state" },
  { code: "ID", label: "Idaho", description: "State", icon: "cottage", input_type: "state" },
  { code: "IL", label: "Illinois", description: "State", icon: "cottage", input_type: "state" },
  { code: "IN", label: "Indiana", description: "State", icon: "cottage", input_type: "state" },
  { code: "IA", label: "Iowa", description: "State", icon: "cottage", input_type: "state" },
  { code: "KS", label: "Kansas", description: "State", icon: "cottage", input_type: "state" },
  { code: "KY", label: "Kentucky", description: "State", icon: "cottage", input_type: "state" },
  { code: "LA", label: "Louisiana", description: "State", icon: "cottage", input_type: "state" },
  { code: "ME", label: "Maine", description: "State", icon: "cottage", input_type: "state" },
  { code: "MD", label: "Maryland", description: "State", icon: "cottage", input_type: "state" },
  { code: "MA", label: "Massachusetts", description: "State", icon: "cottage", input_type: "state" },
  { code: "MI", label: "Michigan", description: "State", icon: "cottage", input_type: "state" },
  { code: "MN", label: "Minnesota", description: "State", icon: "cottage", input_type: "state" },
  { code: "MS", label: "Mississippi", description: "State", icon: "cottage", input_type: "state" },
  { code: "MO", label: "Missouri", description: "State", icon: "cottage", input_type: "state" },
  { code: "MT", label: "Montana", description: "State", icon: "cottage", input_type: "state" },
  { code: "NE", label: "Nebraska", description: "State", icon: "cottage", input_type: "state" },
  { code: "NV", label: "Nevada", description: "State", icon: "cottage", input_type: "state" },
  { code: "NH", label: "New Hampshire", description: "State", icon: "cottage", input_type: "state" },
  { code: "NJ", label: "New Jersey", description: "State", icon: "cottage", input_type: "state" },
  { code: "NM", label: "New Mexico", description: "State", icon: "cottage", input_type: "state" },
  { code: "NY", label: "New York", description: "State", icon: "cottage", input_type: "state" },
  { code: "NC", label: "North Carolina", description: "State", icon: "cottage", input_type: "state" },
  { code: "ND", label: "North Dakota", description: "State", icon: "cottage", input_type: "state" },
  { code: "OH", label: "Ohio", description: "State", icon: "cottage", input_type: "state" },
  { code: "OK", label: "Oklahoma", description: "State", icon: "cottage", input_type: "state" },
  { code: "OR", label: "Oregon", description: "State", icon: "cottage", input_type: "state" },
  { code: "PA", label: "Pennsylvania", description: "State", icon: "cottage", input_type: "state" },
  { code: "RI", label: "Rhode Island", description: "State", icon: "cottage", input_type: "state" },
  { code: "SC", label: "South Carolina", description: "State", icon: "cottage", input_type: "state" },
  { code: "SD", label: "South Dakota", description: "State", icon: "cottage", input_type: "state" },
  { code: "TN", label: "Tennessee", description: "State", icon: "cottage", input_type: "state" },
  { code: "TX", label: "Texas", description: "State", icon: "cottage", input_type: "state" },
  { code: "UT", label: "Utah", description: "State", icon: "cottage", input_type: "state" },
  { code: "VT", label: "Vermont", description: "State", icon: "cottage", input_type: "state" },
  { code: "VA", label: "Virginia", description: "State", icon: "cottage", input_type: "state" },
  { code: "WA", label: "Washington", description: "State", icon: "cottage", input_type: "state" },
  { code: "WV", label: "West Virginia", description: "State", icon: "cottage", input_type: "state" },
  { code: "WI", label: "Wisconsin", description: "State", icon: "cottage", input_type: "state" },
  { code: "WY", label: "Wyoming", description: "State", icon: "cottage", input_type: "state" }
];



const allRegions = [
  ...countriesArr,    // from your i18n-iso-countries logic
  ...usStates,
  ...cities
    .filter(city => city.pop > 45000)
    .map(city => ({
      code: `(${city.lat}, ${city.lon})`,
      label: city.name,
      description: "City",
      icon: "location_city",
      input_type: "city"
    }))
];

export default allRegions;