function stripHTML(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}

function extractImageSrc(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const img = doc.querySelector('img');
  return img ? img.src : null;
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

  return (
    <div className="w-full border border-gray-900 rounded-md shadow-sm hover:shadow-md transition flex items-center gap-4 p-4">
      <div className="text-xl font-bold text-indigo-600 w-10 text-center">{rank}</div>

      {imageUrl && (
        <img
          src={imageUrl}
          alt={artistName}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-900"
        />
      )}

      <div className="flex-1">
        <h2 className="font-semibold text-lg text-gray-900">{artistName}</h2>
        <p className="text-indigo-600 font-medium text-base">
          {(listeners / 1_000_000).toFixed(1)}M listeners
        </p>

        <div className="mt-1 text-sm text-gray-600 space-y-0.5">
          <div><span className="font-semibold">Country:</span> {country}</div>
          <div><span className="font-semibold">Genre:</span> {genre}</div>
          <div><span className="font-semibold">Language:</span> {language}</div>
          <div><span className="font-semibold">Group type:</span> {groupType}</div>
        </div>
      </div>
    </div>
  );
}
function stripHTML(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}

function extractImageSrc(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const img = doc.querySelector('img');
  return img ? img.src : null;
}

export default function ArtistCard({ artist }) {
  const artistName = stripHTML(artist["Artist"]);
  const imageUrl = extractImageSrc(artist["Image"]);
  const listeners = parseInt(artist["Monthly listeners (millions)"].replace(/,/g, ""), 10);

  return (
    <div className="w-full border p-4 rounded-md shadow-sm hover:shadow-md transition flex items-center gap-4">
      {imageUrl && <img src={imageUrl} alt={artistName} className="w-16 h-16 rounded-full object-cover" />}
      <div>
        <div className="font-semibold text-lg">{artistName}</div>
        <div className="text-sm text-gray-600">
          {(listeners / 1_000_000).toFixed(1)}M listeners
        </div>
        <div className="text-sm text-gray-500">{artist["Country"]} · {artist["Genre"]} · {artist["Group type"]}</div>
      </div>
    </div>
  );
}