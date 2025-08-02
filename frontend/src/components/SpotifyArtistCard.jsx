import { FaSpotify } from "react-icons/fa";

export default function SpotifyArtistCard({ artist, rank }) {
  const imageUrl = artist.images?.[0]?.url;
  const followers = artist.followers.total;
  const externalUrl = artist.external_urls?.spotify;
  function getPopularityLabel() {
    if (artist.popularity >= 90) { //HIT
      return "Legend"
    }
    else if (artist.popularity < 90 && artist.popularity >= 75) { //VERY POPULAR
      return "Superstar"
    }
    else if (artist.popularity < 75 && artist.popularity >= 60) { //POPULAR
      return "Popular"
    }
    else if (artist.popularity < 60 && artist.popularity >= 40) { //Average
      return "Known"
    }
    else if (artist.popularity >= 20 && artist.popularity < 40) { //Niche
      return "Niché"
    }
    else {
      return "Undiscovered"
    }
  }
  function getPopularityIcon() {
    if (artist.popularity >= 90) { //HIT
      return "local_fire_department"
    }
    else if (artist.popularity < 90 && artist.popularity >= 75) { //VERY POPULAR
      return "hotel_class"
    }
    else if (artist.popularity < 75 && artist.popularity >= 60) { //POPULAR
      return "star"
    }
    else if (artist.popularity < 60 && artist.popularity >= 40) { //Average
      return "star_half"
    }
    else if (artist.popularity >= 20 && artist.popularity < 40) { //Niche
      return "diamond"
    }
    else {
      return "tour"
    }
  }
  const bgGradient =
    rank === 1 ? "linear-gradient(to bottom, #FFDF00, #E9D293)" :
    rank === 2 ? "linear-gradient(to bottom, #BEC0C2, #EEF2F3)" :
    rank === 3 ? "linear-gradient(to bottom, #D49B57, #CDA575)" :
    "#E5E4E2";

  return (
    <div className="w-full items-center bg-[#E5E4E2] rounded-2xl pl-4 py-5">
      <div className="flex items-center gap-8">
        <div className="text-lg font-semibold w-8 text-center rounded-md py-1"
        style={{ background: bgGradient }}>{rank}</div>
        <div className="w-14 min-w-14 h-14 rounded-md overflow-hidden">
          <img src={imageUrl} alt={artist.name} className="w-full h-full object-cover" />
        </div> 
        <div className="truncate mt-[0.5vh]"><div className="font-semibold">{artist.name}</div><div className="flex text-white text-[13px] mt-[1.2vh] gap-3 "><div className="px-2 py-1 rounded-xl bg-[#2e2e2e]">{artist.genres.length ? artist.genres[0].charAt(0).toUpperCase() + artist.genres[0].slice(1) : (followers >= 1_000_000
            ? `${(followers / 1_000_000).toFixed(1)}M fans`
            : followers >= 1_000
            ? `${(followers / 1_000).toFixed(1)}K fans`
            : followers.toString())}</div><div className="px-2 py-1 rounded-xl bg-[#2e2e2e]"><span className="material-icons-outlined icons-tweaked">{getPopularityIcon()}</span>{getPopularityLabel()}</div></div></div>
      </div>
    </div>
  );
}