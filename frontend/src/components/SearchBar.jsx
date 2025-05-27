export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      placeholder="Search artists..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full max-w-md px-4 py-2 border rounded-md"
    />
  );
}