export default function Toolbar({ query, onQuery, onlyMissing, onToggleMissing, total, missing, changed }) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-3">
      <input
        type="search"
        placeholder="Search key or text…"
        className="border rounded px-2 py-1 flex-1 min-w-48"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={onlyMissing} onChange={(e) => onToggleMissing(e.target.checked)} />
        Untranslated only
      </label>
      <span className="text-sm text-gray-600">
        {total} keys · {missing} untranslated · {changed} edited
      </span>
    </div>
  );
}
