import { useState } from "react";
import { computeDiff } from "../lib/translations.js";

export default function ReviewPanel({ lang, target, edits, canSubmit, onSubmit }) {
  const diff = computeDiff(target, edits);
  const [status, setStatus] = useState({ state: "idle" });
  if (diff.length === 0) return null;

  const merged = { ...target, ...edits };

  const download = () => {
    const blob = new Blob([JSON.stringify(merged, null, 2) + "\n"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lang}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const submit = async () => {
    setStatus({ state: "working" });
    try {
      const { url } = await onSubmit({
        lang,
        content: JSON.stringify(merged, null, 2) + "\n",
        changeCount: diff.length,
      });
      setStatus({ state: "done", url });
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  };

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">{diff.length} change(s)</h2>
        <div className="flex items-center gap-2">
          <button className="border rounded px-3 py-1 text-sm" onClick={download}>
            Download {lang}.json
          </button>
          <button
            className="bg-black text-white rounded px-3 py-1 text-sm disabled:opacity-50"
            disabled={!canSubmit || status.state === "working"}
            title={canSubmit ? "" : "Sign in with GitHub to submit a pull request"}
            onClick={submit}
          >
            {status.state === "working" ? "Submitting…" : "Submit as Pull Request"}
          </button>
        </div>
      </div>

      {status.state === "done" && (
        <p className="text-green-700 text-sm mb-2">
          PR opened: <a className="underline" href={status.url} target="_blank" rel="noopener noreferrer">{status.url}</a>
        </p>
      )}
      {status.state === "error" && (
        <p className="text-red-600 text-sm mb-2">{status.message}</p>
      )}

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
