import React from 'react';
import "../Concerts.css";

//input: tagsToCalculate - tags that need to be returned. 
// artistInfo - all information on the artist
// is_webscraped - if yes, then this is a global artist, we have access to more info
// if not this is the followed artist, we have access to kinda different info
export default function GetArtistTags({artistInfo = null, is_webscraped, tagsToCalculate, topArtist = null, favoriteRank}) {
  
  // for any artist - it is possible to get this info
  //possible options so far: artists main genre, artists main language, if the artist is "rising", position on worlds leaderboard
  // amount of monthly listeners truncated to 3 digits (3.12M, 331K, etc.)
  // your most listened (#1 most listened, #2 most listened, etc.)
  const thresholdToCountAsRisingPercent = 5;
  const thresholdToCountAsRisingMillions = 1_000_000;
  //for global we can calculate:
  // artists main genre
  // if the artist is "rising" (or potentially also fading)
  // amount of monthly listeners truncated to 3 digits
  // main language 
  // rank in the world
  // 

  // for listened: 
  // your #most listened (check the output from get_top_artists array)
  // genre(s) (take it direcly from spotify get_artists)
  // # in the world? (if the artist is in the webscraped lists, up to top 500)
  // if we pass the list, we can also calculate rising/fading if the artist is in top 10k 
  function titleCase(str) {
    if (str && str !== "") {
  return str.replace(/\b\w/g, char => char.toUpperCase());
    }
    return null;
  }

  //return format: dictionary
  // {"genre": "pop", "rising": true, "has_top_1_track": true}
  function formatCompact(num) {
    const unit = num >= 1e6
      ? { div: 1e6, suffix: 'M' }
      : { div: 1e3, suffix: 'k' };

    let value = num / unit.div;
    // decide decimals: 0 if ≥100, 1 if ≥10, else 2
    const decimals = value >= 100 ? 0 : value >= 10 ? 1 : 2;
    const factor = 10 ** decimals;
    // truncate, don’t round
    value = Math.floor(value * factor) / factor;
    return `${value}${unit.suffix}`;
  }
  var dict_with_tags_to_return = {};
  
  // prioritization rules:
  // what you supply to the list first is more prioritized (if genre is the first item, it will be displayed)
  // the list order matters!!!

    for (var item of tagsToCalculate) {
        if (Object.keys(dict_with_tags_to_return).length >= 3) {
          break;
        }
        if (is_webscraped) {
        if (item == "genre") {
            dict_with_tags_to_return["music_note"] = artistInfo['Genre']
        }
        if (item == "favorite") {
            if (favoriteRank !== null) {
            dict_with_tags_to_return["star"] = "Your favorite";
            }
        }
        if (item == "amount_listeners") {
            dict_with_tags_to_return["person"] = formatMillions(artistInfo["Monthly listeners (millions)"]).toString().concat("M");
        }
        if (item == "rising") {
            const artists_monthly_listeners = artistInfo["Monthly listeners (millions)"].replace(/,/g, '');
            const artists_monthly_listeners_to_num = parseFloat(artists_monthly_listeners);

            const artists_monthly_change = artistInfo["Change vs last month"].replace(/,/g, '');
            const artists_monthly_change_to_num = parseFloat(artists_monthly_change);  
            
            const artists_daily_change = artistInfo["Change vs yesterday"].replace(/,/g, '');
            const artists_daily_change_to_num = parseFloat(artists_daily_change);  

            if ((artists_daily_change_to_num > (artists_monthly_listeners_to_num * 0.008 * thresholdToCountAsRisingPercent / 10) && artists_daily_change_to_num > (thresholdToCountAsRisingMillions / 10)) ||
             (artists_monthly_change_to_num > (artists_monthly_listeners_to_num * 0.008 * thresholdToCountAsRisingPercent) && (artists_monthly_change_to_num > thresholdToCountAsRisingMillions) * 0.8)) {
                dict_with_tags_to_return["local_fire_department"] = "Rising";
             }
            else if ((artists_daily_change_to_num < -(artists_monthly_listeners_to_num * 0.01 * thresholdToCountAsRisingPercent / 8) && artists_daily_change_to_num < -(thresholdToCountAsRisingMillions / 8)) ||
             (artists_monthly_change_to_num < -(artists_monthly_listeners_to_num * 0.01 * thresholdToCountAsRisingPercent) && artists_monthly_change_to_num < -(thresholdToCountAsRisingMillions))){
                dict_with_tags_to_return["arrow_downward"] = "Falling";
            }
        }
        if (item == "main_language") {
            dict_with_tags_to_return["language"] = artistInfo["Language"];
        } 
        if (item == "world_rank") {
            dict_with_tags_to_return["workspace_premium"] = "World's #".concat(artistInfo["Rank"]);
        }


    }
//followed artist, retreived using get_artists endpoint
  else {
    if (item == "most_listened") {
      if (artistInfo["index"] >= 20) {
      dict_with_tags_to_return["personal_rank"] = "Your personal #".concat(artistInfo["index"]);
      }
    }
    if (item == "genre") {
      if (artistInfo["genres"] !== null && artistInfo["genres"].length > 0) {
      dict_with_tags_to_return["music_note"] = titleCase(artistInfo["genres"][0])
      }
    }
    if (item == "your_most_listened") {
      if (favoriteRank !== null) {
      dict_with_tags_to_return["leaderboard"] = "Your #".concat((favoriteRank + 1).toString());
      }
    }
    if (item == "rising") {
      if (topArtist !== null) {
        if (artistInfo["id"] === topArtist["Spotify ID"]) {
          const artists_monthly_listeners = topArtist["Monthly listeners (millions)"].replace(/,/g, '');
            const artists_monthly_listeners_to_num = parseFloat(artists_monthly_listeners);

            const artists_monthly_change = topArtist["Change vs last month"].replace(/,/g, '');
            const artists_monthly_change_to_num = parseFloat(artists_monthly_change);  
            
            const artists_daily_change = topArtist["Change vs yesterday"].replace(/,/g, '');
            const artists_daily_change_to_num = parseFloat(artists_daily_change);  

            if ((artists_daily_change_to_num > (artists_monthly_listeners_to_num * 0.008 * thresholdToCountAsRisingPercent / 10) && artists_daily_change_to_num > (thresholdToCountAsRisingMillions / 10)) ||
             (artists_monthly_change_to_num > (artists_monthly_listeners_to_num * 0.008 * thresholdToCountAsRisingPercent) && (artists_monthly_change_to_num > thresholdToCountAsRisingMillions) * 0.8)) {
                dict_with_tags_to_return["local_fire_department"] = "Rising";
             }
            else if ((artists_daily_change_to_num < -(artists_monthly_listeners_to_num * 0.01 * thresholdToCountAsRisingPercent / 8) && artists_daily_change_to_num < -(thresholdToCountAsRisingMillions / 8)) ||
             (artists_monthly_change_to_num < -(artists_monthly_listeners_to_num * 0.01 * thresholdToCountAsRisingPercent) && artists_monthly_change_to_num < -(thresholdToCountAsRisingMillions))){
                dict_with_tags_to_return["arrow_downward"] = "Falling";
            }
        }
    }
  }
    if (item == "popular") {
      if (artistInfo["popularity"] > 60 && artistInfo["popularity"] < 85) {
        dict_with_tags_to_return["star"] = "Popular";
      }
      else if (artistInfo["popularity"] >= 85) {
        dict_with_tags_to_return["hotel_class"] = "Superstar"
      }
      else {
        dict_with_tags_to_return["diamond"] = "Nichè";
      }
    }
    if (item == "fans") {
      if (artistInfo["followers"]["total"]) {
        dict_with_tags_to_return["groups"] = formatCompact(artistInfo["followers"]["total"]).toString().concat(" fans");
      }
    }
    }
  }
  return (
    <div className="genre-container">
      {Object.entries(dict_with_tags_to_return).map(([key, value]) => (
        <div className="genre-button" key={key}><div className="genre-text"><span 
        className={
    value === "Rising"
      ? "material-icons-outlined icons-tweaked rising"
      : value === "Falling"
      ? "material-icons-outlined icons-tweaked falling"
      : value === "Your favorite" 
      ? "material-icons-outlined icons-tweaked favorite"
      : "material-icons-outlined icons-tweaked"
  }>{key}</span>{value}</div></div>
      ))}
      </div> 
          );
}

