import { FaSpotify } from "react-icons/fa";
import { truncate_text, parseDateTracks } from "../utils/concert_utils";

export default function SpotifyTrackCard({ track, rank }) {
  const durationMs = track.duration_ms;
  const durationMin = Math.floor(durationMs / 60000);
  const durationSec = ((durationMs % 60000) / 1000).toFixed(0).padStart(2, '0');

  const album = track.album;
  const artists = track.artists.map((a) => a.name).join(", ");
  const imageUrl = album?.images?.[0]?.url;
  const externalUrl = track.external_urls?.spotify;
  
  function getTrackIcon() {
    if (track.popularity >= 85) { //HIT
      return "local_fire_department"
    }
    else if (track.popularity < 85 && track.popularity >= 65) { //VERY POPULAR
      return "hotel_class"
    }
    else if (track.popularity < 65 && track.popularity >= 50) { //POPULAR
      return "star"
    }
    else if (track.popularity < 50 && track.popularity >= 38) { //Average
      return "star_half"
    }
    else if (track.popularity >= 20 && track.popularity < 38) { //Niche
      return "diamond"
    }
    else {
      return "tour"
    }
  }

    function getTrackPopularityClassification() {
 if (track.popularity >= 85) { //HIT
      return "Top-hit"
    }
    else if (track.popularity < 85 && track.popularity >= 65) { //VERY POPULAR
      return "Banger"
    }
    else if (track.popularity < 65 && track.popularity >= 50) { //POPULAR
      return "Popular"
    }
    else if (track.popularity < 50 && track.popularity >= 38) { //Average
      return "Average"
    }
    else if (track.popularity >= 20 && track.popularity < 38) { //Niche
      return "Niché"
    }
    else {
      return "Undiscovered"
    }
  }
  const bgGradient =
    rank === 1 ? "linear-gradient(to bottom, #FFDF00, #E9D293)" :
    rank === 2 ? "linear-gradient(to bottom, #BEC0C2, #EEF2F3)" :
    rank === 3 ? "linear-gradient(to bottom, #D49B57, #CDA575)" :
    "#E5E4E2";

  return (
    <div className="w-full custom-grid items-center bg-[#E5E4E2] rounded-xl pl-4 py-5">
      <div className="flex items-center gap-8">
        <div className="ml-[0.5vw] text-lg font-semibold w-8 text-center rounded-md py-1"
        style={{ background: bgGradient }}>{rank}</div>

        <div className="w-14 min-w-14 h-14 rounded-md overflow-hidden">
          <img src={imageUrl} alt={track.name} className="w-full h-full object-cover" />
        </div>

        <div><div className="font-semibold truncate mb-[0.1vh]">{truncate_text(track.name, 30)}</div>{artists}</div>
      </div>

      <div className="flex items-center ml-[1vw] min-w-0 overflow-x-hidden">
        <div className="flex-1 flex justify-center"><div className="px-2 py-1 text-sm rounded-xl bg-[#2e2e2e] text-white"><span className="material-icons-outlined icons-tweaked">{getTrackIcon()}</span>{getTrackPopularityClassification()}<span className="text-xs hide-item-width-900"> ({(track.popularity / 10).toString()}/10)</span></div></div>
        <div className="flex-1 text-sm text-center justify-center">{parseDateTracks(album?.release_date)}</div>
        <div className="flex-1 text-sm text-center hide-item-width-900">{truncate_text(album?.name, 45)}</div>
        <div className="flex-1 justify-center flex mt-[0.5vh] hide-item-width-1100"><span className="material-icons-outlined icons-tweaked">timer</span><div className="text-sm">{durationMin}:{durationSec}</div></div>

        <div className="flex-1 flex justify-center hide-item-width-1200">
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center w-[8.5vw] oigin-left h-13 bg-black rounded-md px-4 overflow-hidden"
          >
            <span className="absolute ml-10 text-white text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-500 z-0 whitespace-nowrap">
              Spotify
            </span>
            <FaSpotify className="relative text-green-500 text-2xl mx-auto transform transition-all duration-500 group-hover:-translate-x-8 group-hover:-rotate-[360deg]" />
          </a>
        </div>
      </div>
    </div>
  );
}