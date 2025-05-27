import { useEffect, useState } from "react";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const token = localStorage.getItem("spotify_token");

  useEffect(() => {
    if (!token) return;
    fetch(`http://localhost:8000/profile?token=${token}`)
      .then((res) => res.json())
      .then(setProfile)
      .catch(console.error);
  }, [token]);

  if (!profile) return <div className="p-4">Loading profile...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Spotify Profile</h2>
      <div className="bg-gray-800 p-4 rounded flex gap-4 items-center">
        {profile.images?.[0]?.url && (
          <img src={profile.images[0].url} alt="Profile" className="w-20 h-20 rounded-full" />
        )}
        <div>
          <div className="text-lg">{profile.display_name}</div>
          <div className="text-sm text-gray-400">{profile.email}</div>
          <div className="text-sm">Followers: {profile.followers.total}</div>
        </div>
      </div>
    </div>
  );
}