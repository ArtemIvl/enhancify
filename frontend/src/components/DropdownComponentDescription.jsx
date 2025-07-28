import { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const DropdownComponentDescription = ({ title, onChange, isOpen, setOpenDropdown, id, spotifyAccountConnected }) => {
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const [currentSelectedValue, setCurrentSelectedValue] = useState(null)
  const [currentSelectedIcon, setCurrentSelectedIcon] = useState("star")
  let options = [
    {
        main_text: "Trending", icon: "local_fire_department", description: "This artists are climbing the leaderboard fast!", keyword: "trending"
    },
    {
        main_text: "Biggest winners", description: "Artists who gained the most listeners since last month", icon: "arrow_circle_up", keyword: "winners"
    },
    {
        main_text: "Classical", description: "Does anyone still listen to Beethoven in 2025?", icon: "music_note", keyword: "classical"
    },
    {
        main_text: "German Techno", description: "See what's trending before your next Berlin Rave", icon: "music_note", keyword: "german_techno"
    },
    {
        main_text: "French Pop", description: "For those of us with a really sophisticated music taste", icon: "music_note", keyword: "french_rap"
    },
    {
        main_text: "English Rock", description: "See how the founding country of rock is currently doing", icon: "music_note", keyword: "english_rock"
    },
    ]

  useEffect(() => {
    if (spotifyAccountConnected === true) {
    options.push({main_text: "Your favourite", description: "See where your most listened artists stand on the global leaderboard", icon: "star", keyword: "favourite" })
    }
  }, [spotifyAccountConnected])

  const handleToggle = () => {
    setOpenDropdown(isOpen ? null : id);
    setSearch(""); // reset search on open/close
  };

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setOpenDropdown]);

  // Handle keyboard search
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setSearch((prev) => prev + e.key.toLowerCase());
      } else if (e.key === "Backspace" || e.key === "Delete") {
        setSearch("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);


  const filteredOptions = options.filter((option) =>
    option.main_text.toLowerCase().includes(search)
  );

  return (
    <div ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="w-[60%] bg-white rounded-xl px-4 py-2.5 text-left text-sm flex justify-between items-center shadow-md cursor-pointer max-h-[40px]"
      >
        {currentSelectedValue !== null ? (<div className="flex items-center px-4 py-1 rounded-2xl bg-[#2e2e2e] text-white"><span className="material-icons-outlined">{currentSelectedIcon}</span><div className="ml-[0.5vw] mt-[0.2vh]">{currentSelectedValue}</div></div>) : title}
        {isOpen ? <FaChevronUp className="text-gray-600" /> : <FaChevronDown className="text-gray-600" />}
      </button>

      {isOpen && (
        <div className="absolute z-11 mt-2 w-[17%] bg-white rounded-xl shadow-lg overflow-hidden text-sm max-h-70">
          <div className="overflow-y-auto max-h-70">
            {filteredOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option.keyword);
                  setOpenDropdown(null);
                  setCurrentSelectedValue(option.main_text)
                  setCurrentSelectedIcon(option.icon)
                  setSearch("");
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer"
              >
                <div className="flex mt-[1vh] mb-[0.5vh]"><span className="material-icons-outlined">{option.icon}</span><div className="ml-[0.5vw]">{option.main_text}</div></div>
                <div className="text-[0.8vw]">{option.description}</div>
              </button>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-4 py-2 text-gray-500">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownComponentDescription;