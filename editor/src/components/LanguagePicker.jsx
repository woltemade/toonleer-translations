import { LANGUAGE_NAMES } from "../lib/languageNames.js";

export default function LanguagePicker({ languages, value, onChange }) {
  const options = languages
    .filter((l) => l !== "en")
    .slice()
    .sort((a, b) => a.localeCompare(b));
  return (
    <label className="flex items-center gap-2">
      <span className="font-medium">Language</span>
      <select
        className="border rounded px-2 py-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select…</option>
        {options.map((l) => (
          <option key={l} value={l}>
            {l} — {LANGUAGE_NAMES[l] ?? l}
          </option>
        ))}
      </select>
    </label>
  );
}
