import Home from './pages/Home.jsx'
import FollowedArtists from './pages/FollowedArtists.jsx';
import Profile from './pages/Profile.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Concerts from "./pages/Concerts.jsx"
import NavMenu from "./components/NavMenu"

function App() {
  return (
    <BrowserRouter>
      <NavMenu />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/followed_artists" element={<FollowedArtists />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/concerts" element={<Concerts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
