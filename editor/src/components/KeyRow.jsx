import { validateValue, isMissing } from "../lib/translations.js";

export default function KeyRow({ row, value, onChange }) {
  const { missingTokens, extraTokens } = validateValue(row.en, value);
  const hasIssue = missingTokens.length > 0 || extraTokens.length > 0;
  return (
    <div className="grid grid-cols-[12rem_1fr_1fr] gap-3 py-2 border-b items-start">
      <code className="text-xs text-gray-500 break-all pt-2">{row.key}</code>
      <div className="text-sm bg-gray-50 rounded px-2 py-2 whitespace-pre-wrap">
        {row.en}
      </div>
      <div>
        <textarea
          className={`w-full border rounded px-2 py-2 text-sm ${
            isMissing(value) ? "border-amber-400 bg-amber-50" : "border-gray-300"
          }`}
          rows={Math.max(1, Math.ceil((value?.length || 0) / 60))}
          value={value}
          onChange={(e) => onChange(row.key, e.target.value)}
        />
        {hasIssue && (
          <p className="text-xs text-red-600 mt-1">
            {missingTokens.length > 0 && `Missing ${missingTokens.map((t) => `{${t}}`).join(", ")}. `}
            {extraTokens.length > 0 && `Unexpected ${extraTokens.map((t) => `{${t}}`).join(", ")}.`}
          </p>
        )}
      </div>
    </div>
  );
}
