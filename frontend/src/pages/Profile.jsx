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
    <div className="p-4 w-full">
      <h2 className="text-xl font-semibold mb-6">Your Spotify Profile</h2>

      <div className="flex flex-col gap-6 text-black select-none">
        <div className="flex items-center gap-5">
          {profile.images?.[0]?.url && (
            <img
              src={profile.images[0].url}
              alt="Profile"
              className="w-24 h-24 rounded-full border-2 border-[#d3cfce]"
            />
          )}
          <div className="flex flex-col gap-1">
            <div className="font-light">{profile.display_name}</div>
            <div className="text-gray-700">{profile.email}</div>
            <div className="">Followers: {profile.followers.total}</div>
            <a
              href={profile.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#2e2e2e] font-light p-2 rounded-md text-white hover:cursor-pointer"
            >
              Open Spotify Profile
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 font-light text-gray-800">
          <div>
            <strong>Country:</strong> {profile.country}
          </div>
          <div>
            <strong>Product:</strong> {profile.product}
          </div>
          <div>
            <strong>Spotify ID:</strong> {profile.id}
          </div>

          <div className="col-span-2">
            <strong>Explicit Content Filter Enabled:</strong>{" "}
            {profile.explicit_content.filter_enabled ? "Yes" : "No"}
          </div>
          <div className="col-span-2">
            <strong>Explicit Content Filter Locked:</strong>{" "}
            {profile.explicit_content.filter_locked ? "Yes" : "No"}
          </div>
        </div>
      </div>
    </div>
  );
}