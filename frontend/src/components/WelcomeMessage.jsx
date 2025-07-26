import { useEffect, useState } from 'react';
import "../index.css"
import "./WelcomeMessage.css"
export default function WelcomeMessage() {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {    
    const visited = localStorage.getItem("hasVisited");
    if (!visited) {
      setShowMessage(true);
      localStorage.setItem("hasVisited", "true");
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') { // specify key here
        setShowMessage(false);
        document.body.style.overflow = 'auto'; // Restore scrolling on close

      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!showMessage) return null;


  return (
    <div className="fixed top-0 left-0 w-full h-full welcome-message-container bg-opacity-10 flex items-center justify-center z-50">
      <div className="bg-[#f1f1f1] p-6 rounded-lg shadow-2xl text-center ml-[25%] mr-[25%]">
        <div className="welcome-message-header mb-4"><span className="material-icons-outlined dates-icon-large mt-[1vh]">waving_hand</span>Welcome to Enhancify!<span className="material-icons-outlined dates-icon-large ml-[0.9vw] mt-[1vh]">waving_hand</span></div>
        <div className='welcome-horizontal-line'></div>
        <div className='welcome-pitch-message mb-[2%]'>Our mission is simple - improve your music listening experience by introducing features you've been missing in Spotify</div>
            <div className='feature-welcome-message mr-[25px]'><span className="material-icons-outlined text-purple-900 ml-[3vw] icons-tweaked-welcome">checkmark</span><div className='ml-[5.4vw]'>Statistics of your most listened artists and tracks</div></div>
            <div className='feature-welcome-message'><span className="material-icons-outlined text-purple-900 ml-[3vw] icons-tweaked-welcome">checkmark</span><div className='ml-[5.4vw]'>Global Spotify artist leaderboard, updated in real time.</div></div>
            <div className='feature-welcome-message mb-[1.5%]'><span className="material-icons-outlined text-purple-900 ml-[3vw] icons-tweaked-welcome">checkmark</span><div className='ml-[5.4vw]'>Concert search, infused with your Spotify listening preferences.</div></div>
            <div className='welcome-horizontal-line'></div>
        <div className="italic text-[clamp(12px,_1vw,_30px)]">Please note that to access all features you need to connect your Spotify account.</div>

        <button 
          className="mt-4 bg-black text-white px-4 py-2 rounded-xl  text-[clamp(12px,_1vw,_30px)]"
          onClick={() => {
            setShowMessage(false);
            document.body.style.overflow = 'auto'; // Restore scrolling on close
          }}
        >
        Great! Let's try it!
        </button>
      </div>
    </div>
  );
}