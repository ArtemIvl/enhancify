export async function fetchTopArtists() {
  const res = await fetch("http://localhost:8000/get_top_artists");
  if (!res.ok) throw new Error("Failed to fetch artists");
  return res.json();
}