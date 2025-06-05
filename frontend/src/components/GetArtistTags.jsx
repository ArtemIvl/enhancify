import React from 'react';
import "../Concerts.css";

//input: tagsToCalculate - tags that need to be returned. 
// artistInfo - all information on the artist
// is_webscraped - if yes, then this is a global artist, we have access to more info
// if not this is the followed artist, we have access to kinda different info
const GetArtistTags = ({artistInfo = null, is_webscraped, tagsToCalculate, topArtist = null}) => {
  
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

  //return format: dictionary
  // {"genre": "pop", "rising": true, "has_top_1_track": true}
    function formatMillions(num) {
    const millions = parseFloat(num.replace(/,/g, '')) / 1_000_000;
    if (millions >= 100) return Math.trunc(millions);
    if (millions >= 10) return +millions.toFixed(1);
    return +millions.toFixed(2);
    }
  var dict_with_tags_to_return = {};
  
  // prioritization rules:
  // what you supply to the list first is more prioritized (if genre is the first item, it will be displayed)
  // the list order matters!!!

    for (var item of tagsToCalculate) {
        if (is_webscraped) {
        if (item == "genre") {
            dict_with_tags_to_return["genre"] = artistInfo['Genre']
        }
        if (item == "amount_listeners") {
            dict_with_tags_to_return["amount_listeners"] = formatMillions(artistInfo["Monthly listeners (millions)"]).toString().concat("M");
        }
        if (item == "rising") {
            const artists_monthly_listeners = artistInfo["Monthly listeners (millions)"].replace(/,/g, '');
            const artists_monthly_listeners_to_num = parseFloat(artists_monthly_listeners);

            const artists_monthly_change = artistInfo["Change vs last month"].replace(/,/g, '');
            const artists_monthly_change_to_num = parseFloat(artists_monthly_change);  
            
            const artists_daily_change = artistInfo["Change vs yesterday"].replace(/,/g, '');
            const artists_daily_change_to_num = parseFloat(artists_daily_change);  

            if ((artists_daily_change_to_num > (artists_monthly_listeners_to_num * 0.01 * thresholdToCountAsRisingPercent / 10) && artists_daily_change_to_num > (thresholdToCountAsRisingMillions / 10)) ||
             (artists_monthly_change_to_num > (artists_monthly_listeners_to_num * 0.01 * thresholdToCountAsRisingPercent) && artists_daily_change_to_num > thresholdToCountAsRisingMillions)) {
                dict_with_tags_to_return["rising"] = true;
             }
            else if ((artists_daily_change_to_num < (artists_monthly_listeners_to_num * 0.01 * thresholdToCountAsRisingPercent / 10) && artists_daily_change_to_num < (thresholdToCountAsRisingMillions / 10)) ||
             (artists_monthly_change_to_num < (artists_monthly_listeners_to_num * 0.01 * thresholdToCountAsRisingPercent) && artists_daily_change_to_num < thresholdToCountAsRisingMillions)){
                dict_with_tags_to_return["rising"] = false;
            }
        }
        if (item == "main_language") {
            dict_with_tags_to_return["main_language"] = artistInfo["Language"];
        } 
        if (item == "world_rank") {
            dict_with_tags_to_return["world_rank"] = artistInfo["Rank"];
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
      dict_with_tags_to_return["primary_genre"] = artistInfo["genres"][0]
    }
    if (item == "rising") {
      if (topArtist !== null) {
        if (artistInfo["id"] === topArtist["Spotify ID"]) {
          const artists_monthly_listeners = artistInfo["Monthly listeners (millions)"].replace(/,/g, '');
            const artists_monthly_listeners_to_num = parseFloat(artists_monthly_listeners);

            const artists_monthly_change = artistInfo["Change vs last month"].replace(/,/g, '');
            const artists_monthly_change_to_num = parseFloat(artists_monthly_change);  
            
            const artists_daily_change = artistInfo["Change vs yesterday"].replace(/,/g, '');
            const artists_daily_change_to_num = parseFloat(artists_daily_change);  

            if ((artists_daily_change_to_num > (artists_monthly_listeners_to_num * 0.01 * thresholdToCountAsRisingPercent / 10) && artists_daily_change_to_num > (thresholdToCountAsRisingMillions / 10)) ||
             (artists_monthly_change_to_num > (artists_monthly_listeners_to_num * 0.01 * thresholdToCountAsRisingPercent) && artists_daily_change_to_num > thresholdToCountAsRisingMillions)) {
                dict_with_tags_to_return["rising"] = true;
             }
            else if ((artists_daily_change_to_num < (artists_monthly_listeners_to_num * 0.01 * thresholdToCountAsRisingPercent / 10) && artists_daily_change_to_num < (thresholdToCountAsRisingMillions / 10)) ||
             (artists_monthly_change_to_num < (artists_monthly_listeners_to_num * 0.01 * thresholdToCountAsRisingPercent) && artists_daily_change_to_num < thresholdToCountAsRisingMillions)){
                dict_with_tags_to_return["rising"] = false;
        }
      }
    }
  }
    }
  return dict_with_tags_to_return;
};
}

export default GetArtistTags;