import axios from "axios";

export async function fetchTopArtists() {
  const res = await fetch("http://localhost:8000/get_top_artists");
  if (!res.ok) throw new Error("Failed to fetch artists");
  return res.json();
}

export async function fetchMySongs(timeRange, token) {
  const res = await fetch(`http://localhost:8000/top-content?type=tracks&time_range=${timeRange}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch top tracks");
  const data = await res.json();
  return data.items || [];
}

export async function fetchMyArtists(timeRange, token) {
  const res = await fetch(`http://localhost:8000/top-content?type=artists&time_range=${timeRange}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch top artists");
  const data = await res.json();
  return data.items || [];
}

export async function getNumericalRankings() {
  const res = await fetch(`http://localhost:8000/get_rankings`);

  if (!res.ok) throw new Error("Failed to fetch top artists");
  return res.json() || {};
}

