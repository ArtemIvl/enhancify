import { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const DropdownComponent = ({ title, options, value, onChange, isOpen, setOpenDropdown, id }) => {
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

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

  const formatLabel = (option) => {
    if (option === "TBD") return "No genre";
    if (option === "?land") return "No country";
    if (option === "short_term") return "Last 4 weeks";
    if (option === "medium_term") return "Last 6 months";
    if (option === "long_term") return "All time";
    return option;
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search)
  );

  return (
    <div ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="w-full bg-white rounded-xl px-4 py-2.5 text-left text-sm flex justify-between items-center shadow-md cursor-pointer"
      >
        {formatLabel(value) || title}
        {isOpen ? <FaChevronUp className="text-gray-600" /> : <FaChevronDown className="text-gray-600" />}
      </button>

      {isOpen && (
        <div className="absolute z-11 mt-2 w-[14%] bg-white rounded-xl shadow-lg overflow-hidden text-sm max-h-60">
          <div className="overflow-y-auto max-h-60">
            {filteredOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setOpenDropdown(null);
                  setSearch("");
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer"
              >
                {formatLabel(option)}
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

export default DropdownComponent;