import Home from './pages/Home.jsx'
import MyArtists from './pages/MyArtists.jsx';
import Profile from './pages/Profile.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavMenu from './components/NavMenu.jsx'
import Concerts from "./pages/Concerts.jsx"
import WelcomeMessage from './components/WelcomeMessage.jsx';
import { useState, useEffect } from 'react';

function App() {
  const [isDesktop, setIsDesktop] = useState(
    window.innerWidth > 825 && window.innerHeight < window.innerWidth
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 825 && window.innerHeight < window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {isDesktop ? (
        <>
          <WelcomeMessage />
          <BrowserRouter>
            {/* <Loading /> */}
            <NavMenu />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/my-artists" element={<MyArtists />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/concerts" element={<Concerts />} />
            </Routes>
          </BrowserRouter>
        </>
      ) : (
<div className='ml-[20%] mr-[20%] vertical-align flex items-center justify-center min-h-screen'>
  <div className='bg-[#ececec] p-5 rounded-2xl'>
     We are still working on smartphone-friendly design.
     Please use your PC or laptop to access the website
  </div>
</div>
      )}
    </>
  );
}
export default App;
