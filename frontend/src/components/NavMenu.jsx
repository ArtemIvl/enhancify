import { NavLink } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { LoginButton } from "./LoginButton";
import { FaAward, FaRegStar, FaTicket, FaRegUser } from "react-icons/fa6";

export default function NavigationMenu() {
  const { token } = useAuth()

  const baseClass =
    "py-3 px-6 rounded-md font-light cursor-pointer select-none transition-transform duration-150 ease-in-out";
  const activeClass = "bg-[#2e2e2e] text-white";

  return (
    <nav className="flex items-center bg-[#d3cfce] p-4">
      <div className="flex gap-4 flex-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            baseClass + (isActive ? ` ${activeClass}` : "")
          }
          style={{ userSelect: "none" }}
          onMouseDown={e => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
        <div className="flex items-center gap-3">
          <FaAward className="w-4 h-4" />
          Leaderboard
        </div>
        </NavLink>

        <NavLink
          to="/my-artists"
          className={({ isActive }) =>
            baseClass + (isActive ? ` ${activeClass}` : "")
          }
          onMouseDown={e => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
        <div className="flex items-center gap-3">
          <FaRegStar className="w-4 h-4" />
          My artists
        </div>
        </NavLink>

        <NavLink
          to="/concerts"
          className={({ isActive }) =>
            baseClass + (isActive ? ` ${activeClass}` : "")
          }
          onMouseDown={e => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
        <div className="flex items-center gap-3">
          <FaTicket className="w-4 h-4" />
          Concerts
        </div>
        </NavLink>
      </div>

      {!token ? (
        <LoginButton />
      ) : 
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          baseClass + (isActive ? ` ${activeClass}` : "")
        }
        onMouseDown={e => (e.currentTarget.style.transform = "scale(0.95)")}
        onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
      <div className="flex items-center gap-3">
        <FaRegUser className="w-4 h-4" />
          Profile
      </div>
      </NavLink>
      }
    </nav>
  );
}