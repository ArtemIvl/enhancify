import { FaSpotify } from "react-icons/fa";

export default function SpotifyTrackCard({ track, rank }) {
  const durationMs = track.duration_ms;
  const durationMin = Math.floor(durationMs / 60000);
  const durationSec = ((durationMs % 60000) / 1000).toFixed(0).padStart(2, '0');

  const album = track.album;
  const artists = track.artists.map((a) => a.name).join(", ");
  const imageUrl = album?.images?.[0]?.url;
  const externalUrl = track.external_urls?.spotify;
  
  const bgGradient =
    rank === 1 ? "linear-gradient(to bottom, #FFDF00, #E9D293)" :
    rank === 2 ? "linear-gradient(to bottom, #BEC0C2, #EEF2F3)" :
    rank === 3 ? "linear-gradient(to bottom, #D49B57, #CDA575)" :
    "#E5E4E2";

  return (
    <div className="w-full grid grid-cols-[26%_74%] items-center bg-[#E5E4E2] rounded-xl pl-4 py-4">
      <div className="flex items-center gap-8">
        <div className="text-lg font-semibold w-8 text-center rounded-md py-1"
        style={{ background: bgGradient }}>{rank}</div>

        <div className="w-14 min-w-14 h-14 rounded-md overflow-hidden">
          <img src={imageUrl} alt={track.name} className="w-full h-full object-cover" />
        </div>

        <div className="font-semibold truncate">{track.name}</div>
      </div>

      <div className="grid grid-cols-6 items-center">
        <div className="text-sm text-center">{artists}</div>
        <div className="text-sm text-center">{album?.name}</div>
        <div className="text-sm text-center">{album?.release_date}</div>
        <div className="text-sm text-center">{durationMin}:{durationSec} min</div>
        <div className="text-sm text-center">{track.popularity}/100</div>

        <div className="flex justify-center">
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center w-30 h-12 bg-black rounded-md px-4 overflow-hidden"
          >
            <span className="absolute ml-8 text-white text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-500 z-0 whitespace-nowrap">
              Spotify
            </span>
            <FaSpotify className="relative text-green-500 text-2xl mx-auto transform transition-all duration-500 group-hover:-translate-x-8 group-hover:-rotate-[360deg]" />
          </a>
        </div>
      </div>
    </div>
  );
}