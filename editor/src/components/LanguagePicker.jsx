export default function LanguagePicker({ languages, value, onChange }) {
  return (
    <label className="flex items-center gap-2">
      <span className="font-medium">Language</span>
      <select
        className="border rounded px-2 py-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select…</option>
        {languages
          .filter((l) => l !== "en")
          .map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
      </select>
    </label>
  );
}
