import { useEffect, useState } from "react";
import { useAuth } from "../services/AuthContext";
import Loading from "../components/Loading";
import { FaSpotify, FaArrowRightFromBracket } from "react-icons/fa6";
import countries from "i18n-iso-countries";
import "../components/WelcomeMessage.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const { token, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetch(`http://localhost:8000/profile?token=${token}`)
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
    <div className="w-full h-full">
    {isLoading ? (
      <Loading />
    ) : !token ? (
      <div className="text-center py-10">To view profile info you need to login first.</div>
    ) : (
    <div className="flex flex-col">
    <div className="px-8 mt-[5vh] ml-[6vw] flex-2 flex-row">
      <div className="flex gap-4">
        <div className="flex gap-8">
        {profile.images?.[0]?.url && (
          <img
            src={profile.images[0].url}
            alt="Profile"
            className="w-60 h-60 rounded-full object-cover "
          />
        )}
          <div className="flex text-sm flex-col gap-4 mt-[3vh] ml-[1.5vw]">
            <div className="text-4xl">{profile.display_name}</div>
            <div><span className={`fi fi-${profile.country.toLowerCase()} brightness-90 contrast-110 text-lg rounded mr-[8px]`}></span><span className="text-base">{countries.getName(profile.country.toLowerCase(), "en")}</span>
        </div>
        <div className="text-lg mt-[0.5vh]"><span className="material-icons-outlined icons-tweaked">person</span>{profile.followers.total} followers</div>
        {profile.product === "premium" ? (<div className="flex justify-center py-2 px-3 bg-[#2e2e2e] rounded-2xl text-white"><span className="material-icons-outlined icons-tweaked">diamond</span>Premium</div>) : 
        <div className="flex justify-center py-2 px-3 bg-[#2e2e2e] rounded-2xl text-white text-sm"><span className="material-icons-outlined icons-tweaked">money_off</span>Free</div>}
          </div>
        </div>

        <div className="flex flex-col items-center gap-8 text-white text-sm ml-[40vw] mt-[2vw]">
          <a
            href={profile.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 h-[60px] w-[200px] justify-center bg-black rounded-md cursor-pointer hover:bg-[#2e2e2e] hover:scale-95 active:scale-95 transition-transform duration-150 ease-in-out"
          >
            <span>Open in Spotify</span>
            <FaSpotify className="text-green-500 text-4xl" />
          </a>

          <button
            onClick={logout}
            className="bg-black h-[60px] justify-center w-[200px] rounded-md flex items-center gap-3 cursor-pointer hover:bg-[#2e2e2e] hover:scale-95 active:scale-95 transition-transform duration-150 ease-in-out"
          >
            <span>Log out</span>
            <FaArrowRightFromBracket className="text-xl"/>
          </button>
        </div>
      </div>
    </div>
    <div className="flex w-full h-[1px] bg-black mt-[6vh]"></div>
    <div className="text-center">
          <div className="text-xl items-center justify-center mt-[4vh]">Thank you for trying out our website!</div>
          <div className="text-base italic mt-[2vh]">Developed with passion by:</div>
          <div className="w-[58%] ml-[21vw] mr-[21vw] h-[13vw] min-h-[170px] rounded-4xl mt-[4vh] bg-[rgb(223,223,223)] flex flex-row">
            <div className="flex-1 mt-[3.5vh]">
            <div className="font-bold text-[clamp(16px,1.3vw,30px)]"><span className="material-icons-outlined icons-tweaked">person</span>Tymofii Katyshev</div>
            <div className="mt-[2.2vh] text-[clamp(14px,1.05vw,20px)]"><span className="material-icons-outlined icons-tweaked">alternate_email</span>tymofii.katyshev@gmail.com</div>
            <div className="flex justify-center mt-[1vh] text-[clamp(14px,1.05vw,20px)]"><a  href="https://www.linkedin.com/in/tymofii-katyshev/"
            target="_blank"
            rel="noopener noreferrer" className="flex items-center gap-x-2"><img src="https://i.imghippo.com/files/GTD3587uIY.png" className="h-[2rem] w-[2rem]"></img>linkedin.com/in/tymofii-katyshev</a>
            </div>
            <div className="flex justify-center mt-[1vh] text-[clamp(14px,1.05vw,20px)]"><a  href="https://github.com/tymakat"
            target="_blank"
            rel="noopener noreferrer" className="flex items-center gap-x-2"><img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" className="h-[1.5rem] w-[1.5rem] mr-[0.5vw]"></img>github.com/in/tymakat</a>
            </div>
            </div>
            <div className="flex-1 mt-[3.5vh]">
            <div className="font-bold font-bold text-[clamp(16px,1.3vw,30px)]"><span className="material-icons-outlined icons-tweaked">person</span>Artemii Ivliev</div>
            <div className="mt-[2.2vh] text-[clamp(14px,1.05vw,20px)]"><span className="material-icons-outlined icons-tweaked">alternate_email</span>artemivliev7@gmail.com</div>
            <div className="flex justify-center mt-[1vh] text-[clamp(14px,1.05vw,20px)]"><a  href="https://www.linkedin.com/in/artemii-ivliev/"
            target="_blank"
            rel="noopener noreferrer" className="flex items-center gap-x-2"><img src="https://i.imghippo.com/files/GTD3587uIY.png" className="h-[2rem] w-[2rem]"></img>linkedin.com/in/artemii-ivliev</a>
            </div>
            <div className="flex justify-center mt-[1vh] text-[clamp(14px,1.05vw,20px)]"><a  href="https://github.com/ArtemIvl"
            target="_blank"
            rel="noopener noreferrer" className="flex items-center gap-x-2"><img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" className="h-[1.5rem] w-[1.5rem] mr-[0.5vw]"></img>github.com/in/ArtemIvl</a>
            </div>
            </div>
          </div>
    </div>
    </div>
    )}
  </div>
  );
}