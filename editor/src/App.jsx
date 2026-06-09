import { useEffect, useMemo, useState } from "react";
import { loadLanguages, loadReference, loadTarget } from "./data/load.js";
import { buildRows, filterRows, isMissing, computeDiff } from "./lib/translations.js";
import LanguagePicker from "./components/LanguagePicker.jsx";
import KeyRow from "./components/KeyRow.jsx";
import Toolbar from "./components/Toolbar.jsx";
import ReviewPanel from "./components/ReviewPanel.jsx";
import BrandHeader from "./components/BrandHeader.jsx";
import { Octokit } from "@octokit/rest";
import AuthBar from "./components/AuthBar.jsx";
import GitHubIcon from "./components/GitHubIcon.jsx";
import { completeLoginFromUrl, getToken, isLoggedIn, logout } from "./auth/session.js";
import { submitTranslationPR } from "./github/pr.js";
import { REPO_OWNER, REPO_NAME, DEFAULT_BASE_BRANCH } from "./config.js";

export default function App() {
  const [languages, setLanguages] = useState([]);
  const [en, setEn] = useState(null);
  const [lang, setLang] = useState("");
  const [target, setTarget] = useState(null);
  const [edits, setEdits] = useState({});
  const [committed, setCommitted] = useState({});
  const [query, setQuery] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [error, setError] = useState(null);
  const [login, setLogin] = useState(null);

  useEffect(() => {
    completeLoginFromUrl()
      .then(() => {
        if (isLoggedIn()) refreshLogin();
      })
      .catch((e) => setError(e.message));
    if (isLoggedIn()) refreshLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshLogin = async () => {
    try {
      const octokit = new Octokit({ auth: getToken() });
      const { data } = await octokit.rest.users.getAuthenticated();
      setLogin(data.login);
    } catch {
      logout();
      setLogin(null);
    }
  };

  const onSignOut = () => {
    logout();
    setLogin(null);
  };

  const onSubmit = ({ lang: l, content, changeCount }) => {
    const octokit = new Octokit({ auth: getToken() });
    return submitTranslationPR({
      octokit,
      owner: REPO_OWNER,
      repo: REPO_NAME,
      baseBranch: DEFAULT_BASE_BRANCH,
      lang: l,
      content,
      changeCount,
    });
  };

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
    setCommitted({});
    setTarget(null);
    setQuery("");
    setOnlyMissing(false);
    loadTarget(lang)
      .then(setTarget)
      .catch((e) => setError(e.message));
  }, [lang]);

  const onEdit = (key, value) => setEdits((prev) => ({ ...prev, [key]: value }));
  // Commit on blur so the "untranslated only" filter re-evaluates the row only
  // after you move off it — never mid-typing.
  const onCommit = (key, value) => setCommitted((prev) => ({ ...prev, [key]: value }));

  const rows = useMemo(() => (en && target ? buildRows(en, target) : []), [en, target]);
  const visible = useMemo(
    () => filterRows(rows, { query, onlyMissing }, edits, committed),
    [rows, query, onlyMissing, edits, committed],
  );
  const valueFor = (row) =>
    Object.prototype.hasOwnProperty.call(edits, row.key) ? edits[row.key] : row.target;

  const missingCount = useMemo(
    () =>
      rows.filter((r) =>
        isMissing(
          Object.prototype.hasOwnProperty.call(edits, r.key) ? edits[r.key] : r.target,
        ),
      ).length,
    [rows, edits],
  );
  const changedCount = useMemo(() => computeDiff(target || {}, edits).length, [target, edits]);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex items-start justify-between gap-4">
        <BrandHeader />
        <AuthBar login={login} onSignOut={onSignOut} />
      </div>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="mb-4">
        <LanguagePicker languages={languages} value={lang} onChange={setLang} />
      </div>

      {lang && target && (
        <>
          <Toolbar
            query={query}
            onQuery={setQuery}
            onlyMissing={onlyMissing}
            onToggleMissing={setOnlyMissing}
            total={rows.length}
            missing={missingCount}
            changed={changedCount}
          />
          <div className="border rounded">
            <div className="grid grid-cols-[12rem_1fr_1fr] gap-3 px-3 py-2 bg-gray-100 text-xs font-semibold uppercase text-gray-600">
              <span>Key</span>
              <span>English</span>
              <span>{lang}</span>
            </div>
            <div className="px-3">
              {visible.map((row) => (
                <KeyRow key={row.key} row={row} value={valueFor(row)} onChange={onEdit} onCommit={onCommit} />
              ))}
            </div>
          </div>
          <ReviewPanel
            lang={lang}
            target={target}
            edits={edits}
            canSubmit={Boolean(login)}
            onSubmit={onSubmit}
          />
        </>
      )}

      <footer className="mt-12 pt-6 border-t flex justify-center">
        <a
          href="https://github.com/woltemade/toonleer-translations"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-gray-700 border rounded px-3 py-1.5 hover:bg-gray-50"
        >
          <GitHubIcon className="w-4 h-4" />
          View in GitHub
        </a>
      </footer>
    </main>
  );
}
