import { useEffect, useState } from "react";
import { useAuth } from "../services/AuthContext";
import Loading from "../components/Loading";
import { FaSpotify, FaArrowRightFromBracket } from "react-icons/fa6";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const { token, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetch(`/api/profile?token=${token}`)
      .then((res) => {
        if (res.status === 401 || res.status === 400) {
          logout();
          setIsLoading(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setProfile(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Profile fetch error:", err);
        setIsLoading(false);
      });
  }, [token]);

  return (
    <>
    {isLoading ? (
      <Loading />
    ) : !token ? (
      <div className="text-center py-10">To view profile info you need to login first.</div>
    ) : (
    <div className="px-8">
      <div className="text-2xl font-bold py-4">Profile</div>
      <div className="flex flex-col gap-4">
        <div className="text-2xl">{profile.display_name} {profile.product == 'premium' ? "👑" : ""}</div>
        <div className="flex gap-8">
        {profile.images?.[0]?.url && (
          <img
            src={profile.images[0].url}
            alt="Profile"
            className="w-46 h-46 rounded-2xl object-cover"
          />
        )}
          <div className="flex text-sm flex-col gap-3">
            <div>Followers: {profile.followers.total}</div>
            <div>Country: <span className={`fi fi-${profile.country.toLowerCase()} rounded`} />
        </div>
          </div>
        </div>

        <div className="flex items-center gap-8 text-white text-sm">
          <a
            href={profile.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-4 bg-black w-46 h-14 rounded-md cursor-pointer hover:bg-[#2e2e2e] hover:scale-95 active:scale-95 transition-transform duration-150 ease-in-out"
          >
            <span>Open in Spotify</span>
            <FaSpotify className="text-green-500 text-4xl" />
          </a>

          <button
            onClick={logout}
            className="bg-black p-4 h-14 rounded-md flex items-center gap-3 cursor-pointer hover:bg-[#2e2e2e] hover:scale-95 active:scale-95 transition-transform duration-150 ease-in-out"
          >
            <span>Log out</span>
            <FaArrowRightFromBracket className="text-xl"/>
          </button>
        </div>
      </div>
    </div>
    )}
  </>
  );
}