import { useEffect, useState } from "react";
import { loadLanguages, loadReference, loadTarget } from "./data/load.js";
import { buildRows, filterRows } from "./lib/translations.js";
import LanguagePicker from "./components/LanguagePicker.jsx";
import KeyRow from "./components/KeyRow.jsx";

export default function App() {
  const [languages, setLanguages] = useState([]);
  const [en, setEn] = useState(null);
  const [lang, setLang] = useState("");
  const [target, setTarget] = useState(null);
  const [edits, setEdits] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([loadLanguages(), loadReference()])
      .then(([langs, enObj]) => {
        setLanguages(langs);
        setEn(enObj);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!lang) return;
    setEdits({});
    setTarget(null);
    loadTarget(lang)
      .then(setTarget)
      .catch((e) => setError(e.message));
  }, [lang]);

  const onEdit = (key, value) => setEdits((prev) => ({ ...prev, [key]: value }));

  const rows = en && target ? buildRows(en, target) : [];
  const visible = filterRows(rows, { query: "", onlyMissing: false }, edits);
  const valueFor = (row) =>
    Object.prototype.hasOwnProperty.call(edits, row.key) ? edits[row.key] : row.target;

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Toonleer Translations Editor</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="mb-4">
        <LanguagePicker languages={languages} value={lang} onChange={setLang} />
      </div>
      {lang && target && (
        <div className="border rounded">
          <div className="grid grid-cols-[12rem_1fr_1fr] gap-3 px-3 py-2 bg-gray-100 text-xs font-semibold uppercase text-gray-600">
            <span>Key</span>
            <span>English</span>
            <span>{lang}</span>
          </div>
          <div className="px-3">
            {visible.map((row) => (
              <KeyRow key={row.key} row={row} value={valueFor(row)} onChange={onEdit} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
