import { useEffect, useState } from 'react';
import "../index.css"
export default function WelcomeMessage() {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {    
    const visited = localStorage.getItem("hasVisited");
    if (!visited) {
      setShowMessage(true);
      // localStorage.setItem("hasVisited", "true");
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') { // specify key here
        handleClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!showMessage) return null;


  return (
    <div className="fixed top-0 left-0 w-full h-full welcome-message-container bg-opacity-10 flex items-center justify-center z-50">
      <div className="bg-silver p-6 rounded-lg shadow-2xl text-center ml-[25%] mr-[25%]">
        <h1 className="text-3xl mb-4"><span className="material-icons-outlined dates-icon-large mt-[1vh]">waving_hand</span>Welcome to Enhancify!<span className="material-icons-outlined dates-icon-large ml-[0.9vw] mt-[1vh]">waving_hand</span></h1>
        <div className='text-xl'>The mission of our web-app is extremely simple. It adds the features that you've been missing when using Spotify. This includes:
            <li>Global leaderboard updated in real time</li>
            <li>Your top listened Spotify artists and songs</li>
            <li>Convenient Concert searching tool</li>
        I hope that after reading this, you are as excited to try our application as we were excited to make it. 

        </div>
        <button 
          className="mt-4 bg-black text-white px-4 py-2 rounded-xl"
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