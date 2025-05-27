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