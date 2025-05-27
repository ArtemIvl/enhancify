export function LoginButton() {
  const handleLogin = () => {
    window.location.href = "http://localhost:8000/login";
  };

  return <button onClick={handleLogin}>Login with Spotify</button>;
}