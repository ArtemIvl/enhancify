import { FaArrowRightToBracket } from "react-icons/fa6";

export function LoginButton() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div
      onClick={handleLogin}
      className="py-3 px-6 rounded-md font-light cursor-pointer select-none transition-transform duration-150 ease-in-out hover:scale-95 hover:bg-[#2e2e2e] hover:text-white active:scale-95"
      style={{ userSelect: "none" }}
    >
      <div className="flex items-center gap-3">
        Login with Spotify
        <FaArrowRightToBracket className="w-4 h-4" />
      </div>
    </div>
  );
}