import { computeDiff } from "../lib/translations.js";

export default function ReviewPanel({ lang, target, edits }) {
  const diff = computeDiff(target, edits);
  if (diff.length === 0) return null;

  const download = () => {
    const merged = { ...target, ...edits };
    const blob = new Blob([JSON.stringify(merged, null, 2) + "\n"], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lang}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">{diff.length} change(s)</h2>
        <button className="bg-black text-white rounded px-3 py-1 text-sm" onClick={download}>
          Download {lang}.json
        </button>
      </div>
      <ul className="space-y-2">
        {diff.map((d) => (
          <li key={d.key} className="text-sm">
            <code className="text-xs text-gray-500">{d.key}</code>
            <div className="text-red-600 line-through whitespace-pre-wrap">{d.from || "(empty)"}</div>
            <div className="text-green-700 whitespace-pre-wrap">{d.to || "(empty)"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
