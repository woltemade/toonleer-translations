# Phase 3a — Translation Editor UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A static React+Vite+Tailwind editor (deployed to GitHub Pages) that loads the per-language translation files, shows each key side-by-side with English (read-only), lets the contributor edit the target language, and provides the four MVP aids — missing-key filtering, search, placeholder/split-key validation, and a diff review. No GitHub auth yet (Phase 3b adds fork→PR); this phase ends with a contributor able to edit and **download** their corrected `<lang>.json`.

**Architecture:** A standalone Vite SPA in `toonleer-translations/editor/`, served from project Pages at base path `/toonleer-translations/`. Translation data is fetched at runtime from the editor's own origin — a GitHub Action copies the repo's `translations/` directory into the published artifact, so the SPA reads `${BASE_URL}translations/langs.json` and `${BASE_URL}translations/<lang>.json` (no CORS, no API rate limit, always matching the deployed commit). All editor logic that matters (key view, missing detection, validation, diff) lives in a pure, unit-tested module; React components are thin views over it.

**Tech Stack:** Vite, React 18, Tailwind CSS, Vitest (the editor's own dev dependency). Config (GitHub Client ID + proxy URL) lives in a committed `src/config.js` for Phase 3b. Part of the Community Translation Editor (see `docs/superpowers/specs/2026-06-09-translation-editor-design.md`).

---

## Conventions for this plan

- **Repo:** all work in `/Users/herald/dev/toonleer/toonleer-translations/`. The SPA lives under `editor/`; the Pages workflow lives at `.github/workflows/`. Commit on a feature branch `editor-ui` (created at execution start); do not push until the finishing step.
- **Tests:** the editor has its own Vitest (it is a separate npm project from the app). Run with `npm test` inside `editor/`. Follow TDD for the pure logic (Task 2).
- **Pure logic isolation:** `src/lib/translations.js` has no React/DOM imports, so it is unit-tested directly. Components import from it.
- **Data at runtime:** never hardcode language data; always fetch from `${import.meta.env.BASE_URL}translations/...`. The Action (Task 6) makes those paths resolve on Pages.

## File structure

| File | Responsibility |
| --- | --- |
| `editor/package.json` | SPA project: scripts, React/Vite/Tailwind/Vitest deps |
| `editor/vite.config.js` | Vite config: React plugin, `base`, Vitest block |
| `editor/tailwind.config.js`, `editor/postcss.config.js` | Tailwind setup |
| `editor/index.html`, `editor/src/main.jsx`, `editor/src/index.css` | App entry + Tailwind directives |
| `editor/src/config.js` | Public config: GitHub Client ID + proxy URL (for 3b) |
| `editor/src/lib/translations.js` | Pure logic: key view, missing/identical, validation, diff |
| `editor/src/lib/translations.test.js` | Vitest unit tests for the pure logic |
| `editor/src/data/load.js` | Fetch `langs.json` / `en.json` / `<lang>.json` |
| `editor/src/components/LanguagePicker.jsx` | Language `<select>` |
| `editor/src/components/Toolbar.jsx` | Search box, "untranslated only" toggle, counts |
| `editor/src/components/KeyRow.jsx` | One row: key, English (read-only), editable target, inline validation |
| `editor/src/components/ReviewPanel.jsx` | Diff list + Download `<lang>.json` |
| `editor/src/App.jsx` | Orchestration + state |
| `.github/workflows/deploy-pages.yml` | Build `editor/`, copy `translations/`, publish to Pages |
| `editor/.gitignore` | ignore `dist/`, `node_modules/` |

---

## Task 1: Scaffold the Vite + React + Tailwind app

**Files:** create `editor/package.json`, `editor/.gitignore`, `editor/vite.config.js`, `editor/postcss.config.js`, `editor/tailwind.config.js`, `editor/index.html`, `editor/src/main.jsx`, `editor/src/index.css`, `editor/src/App.jsx` (stub).

- [ ] **Step 1: `editor/package.json`**

```json
{
  "name": "toonleer-translations-editor",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "vite": "^5.4.8",
    "vitest": "^2.1.2",
    "jsdom": "^25.0.1"
  }
}
```

- [ ] **Step 2: `editor/.gitignore`**

```gitignore
dist/
node_modules/
```

- [ ] **Step 3: `editor/vite.config.js`** (base path matches the project Pages URL)

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/toonleer-translations/",
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

- [ ] **Step 4: `editor/postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: `editor/tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

- [ ] **Step 6: `editor/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Toonleer Translations Editor</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 7: `editor/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 8: `editor/src/main.jsx`**

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 9: `editor/src/App.jsx`** (stub for now)

```jsx
export default function App() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Toonleer Translations Editor</h1>
    </main>
  );
}
```

- [ ] **Step 10: Install and verify the build**

Run:
```bash
cd /Users/herald/dev/toonleer/toonleer-translations/editor && npm install && npm run build
```
Expected: install succeeds; `vite build` writes `dist/` with `index.html` referencing assets under `/toonleer-translations/`. No errors.

- [ ] **Step 11: Commit**

```bash
cd /Users/herald/dev/toonleer/toonleer-translations
git add editor/ ":!editor/node_modules" ":!editor/dist"
git commit -m "chore(editor): scaffold Vite + React + Tailwind app"
```

---

## Task 2: Pure editor logic (TDD)

**Files:** Test `editor/src/lib/translations.test.js`, create `editor/src/lib/translations.js`.

- [ ] **Step 1: Write the failing tests**

Create `editor/src/lib/translations.test.js`:

```js
import { describe, it, expect } from "vitest";
import {
  buildRows,
  isMissing,
  isIdenticalToEnglish,
  extractPlaceholders,
  validateValue,
  filterRows,
  computeDiff,
  applyEdits,
} from "./translations.js";

const en = { greet: "Hello {name}", bye: "Bye", count: "{n} left" };
const target = { greet: "Hola {name}", bye: "" };

describe("buildRows", () => {
  it("uses English keys as canonical and pairs target values", () => {
    const rows = buildRows(en, target);
    expect(rows).toEqual([
      { key: "greet", en: "Hello {name}", target: "Hola {name}" },
      { key: "bye", en: "Bye", target: "" },
      { key: "count", en: "{n} left", target: "" },
    ]);
  });
});

describe("isMissing", () => {
  it("is true for empty, whitespace, or absent target", () => {
    expect(isMissing("")).toBe(true);
    expect(isMissing("   ")).toBe(true);
    expect(isMissing(undefined)).toBe(true);
    expect(isMissing("Hola")).toBe(false);
  });
});

describe("isIdenticalToEnglish", () => {
  it("flags target equal to English", () => {
    expect(isIdenticalToEnglish("Bye", "Bye")).toBe(true);
    expect(isIdenticalToEnglish("Bye", "Adiós")).toBe(false);
  });
});

describe("extractPlaceholders", () => {
  it("returns the set of {token} names", () => {
    expect(extractPlaceholders("Hi {name}, {n} left")).toEqual(["name", "n"]);
    expect(extractPlaceholders("none")).toEqual([]);
  });
});

describe("validateValue", () => {
  it("reports missing and extra placeholder tokens", () => {
    expect(validateValue("Hello {name}", "Hola")).toEqual({
      missingTokens: ["name"],
      extraTokens: [],
    });
    expect(validateValue("Hello", "Hola {x}")).toEqual({
      missingTokens: [],
      extraTokens: ["x"],
    });
    expect(validateValue("Hi {name}", "Hola {name}")).toEqual({
      missingTokens: [],
      extraTokens: [],
    });
  });
});

describe("applyEdits", () => {
  it("overlays edits onto the target for a row's effective value", () => {
    const rows = buildRows(en, target);
    const edits = { bye: "Adiós" };
    expect(applyEdits(rows, edits)).toEqual([
      { key: "greet", en: "Hello {name}", target: "Hola {name}" },
      { key: "bye", en: "Bye", target: "Adiós" },
      { key: "count", en: "{n} left", target: "" },
    ]);
  });
});

describe("filterRows", () => {
  const rows = buildRows(en, target);
  it("filters to untranslated only", () => {
    const out = filterRows(rows, { query: "", onlyMissing: true }, {});
    expect(out.map((r) => r.key)).toEqual(["bye", "count"]);
  });
  it("respects edits when computing untranslated", () => {
    const out = filterRows(rows, { query: "", onlyMissing: true }, { bye: "Adiós" });
    expect(out.map((r) => r.key)).toEqual(["count"]);
  });
  it("searches key, English, and target text (case-insensitive)", () => {
    expect(filterRows(rows, { query: "hola", onlyMissing: false }, {}).map((r) => r.key)).toEqual(["greet"]);
    expect(filterRows(rows, { query: "COUNT", onlyMissing: false }, {}).map((r) => r.key)).toEqual(["count"]);
  });
});

describe("computeDiff", () => {
  it("lists only changed keys as from→to", () => {
    const edits = { bye: "Adiós", greet: "Hola {name}" };
    expect(computeDiff(target, edits)).toEqual([
      { key: "bye", from: "", to: "Adiós" },
    ]);
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

Run:
```bash
cd /Users/herald/dev/toonleer/toonleer-translations/editor && npm test
```
Expected: FAIL — cannot resolve `./translations.js` / functions undefined.

- [ ] **Step 3: Implement `editor/src/lib/translations.js`**

```js
/**
 * Pure editor logic — no React/DOM. The English object is canonical: its keys
 * define the rows and order. Everything here is unit-tested directly.
 */

const PLACEHOLDER_RE = /\{(\w+)\}/g;

export function buildRows(enObj, targetObj) {
  return Object.keys(enObj).map((key) => ({
    key,
    en: enObj[key],
    target: targetObj?.[key] ?? "",
  }));
}

export function isMissing(value) {
  return value == null || value.trim() === "";
}

export function isIdenticalToEnglish(enValue, targetValue) {
  return !isMissing(targetValue) && targetValue === enValue;
}

export function extractPlaceholders(str) {
  if (!str) return [];
  const out = [];
  for (const m of str.matchAll(PLACEHOLDER_RE)) {
    if (!out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

export function validateValue(enValue, targetValue) {
  if (isMissing(targetValue)) return { missingTokens: [], extraTokens: [] };
  const enTokens = extractPlaceholders(enValue);
  const targetTokens = extractPlaceholders(targetValue);
  return {
    missingTokens: enTokens.filter((t) => !targetTokens.includes(t)),
    extraTokens: targetTokens.filter((t) => !enTokens.includes(t)),
  };
}

export function applyEdits(rows, edits) {
  return rows.map((row) =>
    Object.prototype.hasOwnProperty.call(edits, row.key)
      ? { ...row, target: edits[row.key] }
      : row,
  );
}

export function filterRows(rows, { query, onlyMissing }, edits) {
  const effective = applyEdits(rows, edits);
  const q = query.trim().toLowerCase();
  return effective.filter((row) => {
    if (onlyMissing && !isMissing(row.target)) return false;
    if (!q) return true;
    return (
      row.key.toLowerCase().includes(q) ||
      (row.en ?? "").toLowerCase().includes(q) ||
      (row.target ?? "").toLowerCase().includes(q)
    );
  });
}

export function computeDiff(targetObj, edits) {
  const diff = [];
  for (const key of Object.keys(edits)) {
    const from = targetObj?.[key] ?? "";
    const to = edits[key];
    if (from !== to) diff.push({ key, from, to });
  }
  return diff;
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run:
```bash
cd /Users/herald/dev/toonleer/toonleer-translations/editor && npm test
```
Expected: PASS — all suites green.

- [ ] **Step 5: Commit**

```bash
cd /Users/herald/dev/toonleer/toonleer-translations
git add editor/src/lib/
git commit -m "feat(editor): pure key-view, validation, filter, and diff logic"
```

---

## Task 3: Config + data loader

**Files:** create `editor/src/config.js`, `editor/src/data/load.js`.

- [ ] **Step 1: `editor/src/config.js`** (public values; the proxy URL is filled in after Phase 2 deploy)

```js
/**
 * Public configuration. The GitHub Client ID and the OAuth proxy URL are NOT
 * secrets — the Client ID is public and the proxy keeps the secret server-side.
 * Fill OAUTH_PROXY_URL with the Function URL printed by `sst deploy` (Phase 2).
 */
export const REPO_OWNER = "woltemade";
export const REPO_NAME = "toonleer-translations";

// Phase 3b (auth + PR). Safe to leave as-is until then.
export const GITHUB_CLIENT_ID = "REPLACE_WITH_CLIENT_ID";
export const OAUTH_PROXY_URL = "REPLACE_WITH_PROXY_FUNCTION_URL";
```

- [ ] **Step 2: `editor/src/data/load.js`** (fetch from the editor's own origin)

```js
/**
 * Loads translation data from the editor's own origin. The Pages build copies
 * the repo's translations/ directory into the site, so these paths resolve to
 * the deployed commit (no CORS, no API rate limit).
 */
const base = import.meta.env.BASE_URL; // e.g. "/toonleer-translations/"

async function getJson(path) {
  const res = await fetch(`${base}translations/${path}`);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

export function loadLanguages() {
  return getJson("langs.json");
}

export function loadReference() {
  return getJson("en.json");
}

export function loadTarget(lang) {
  return getJson(`${lang}.json`);
}
```

- [ ] **Step 3: Verify both modules parse (build)**

Run:
```bash
cd /Users/herald/dev/toonleer/toonleer-translations/editor && npm run build
```
Expected: build succeeds (modules are imported in later tasks; this confirms no syntax errors).

- [ ] **Step 4: Commit**

```bash
cd /Users/herald/dev/toonleer/toonleer-translations
git add editor/src/config.js editor/src/data/
git commit -m "feat(editor): public config + data loader"
```

---

## Task 4: Language picker + side-by-side editor

**Files:** create `editor/src/components/LanguagePicker.jsx`, `editor/src/components/KeyRow.jsx`; rewrite `editor/src/App.jsx`.

- [ ] **Step 1: `editor/src/components/LanguagePicker.jsx`**

```jsx
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
```

- [ ] **Step 2: `editor/src/components/KeyRow.jsx`**

```jsx
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
```

- [ ] **Step 3: Rewrite `editor/src/App.jsx`** (loads data, holds edits, renders rows)

```jsx
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
```

- [ ] **Step 4: Verify build**

Run:
```bash
cd /Users/herald/dev/toonleer/toonleer-translations/editor && npm run build
```
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
cd /Users/herald/dev/toonleer/toonleer-translations
git add editor/src/App.jsx editor/src/components/
git commit -m "feat(editor): language picker + side-by-side editing"
```

---

## Task 5: MVP features — toolbar (search + filter + counts) and review/download

**Files:** create `editor/src/components/Toolbar.jsx`, `editor/src/components/ReviewPanel.jsx`; update `editor/src/App.jsx`.

- [ ] **Step 1: `editor/src/components/Toolbar.jsx`**

```jsx
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
```

- [ ] **Step 2: `editor/src/components/ReviewPanel.jsx`** (diff + download the merged file)

```jsx
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
```

- [ ] **Step 3: Wire search/filter/counts/review into `editor/src/App.jsx`**

Replace the body of `App.jsx` from Task 4 with this version (adds `query`, `onlyMissing` state, `Toolbar`, `ReviewPanel`, and live counts):

```jsx
import { useEffect, useMemo, useState } from "react";
import { loadLanguages, loadReference, loadTarget } from "./data/load.js";
import { buildRows, filterRows, isMissing, computeDiff } from "./lib/translations.js";
import LanguagePicker from "./components/LanguagePicker.jsx";
import KeyRow from "./components/KeyRow.jsx";
import Toolbar from "./components/Toolbar.jsx";
import ReviewPanel from "./components/ReviewPanel.jsx";

export default function App() {
  const [languages, setLanguages] = useState([]);
  const [en, setEn] = useState(null);
  const [lang, setLang] = useState("");
  const [target, setTarget] = useState(null);
  const [edits, setEdits] = useState({});
  const [query, setQuery] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
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
    setQuery("");
    setOnlyMissing(false);
    loadTarget(lang)
      .then(setTarget)
      .catch((e) => setError(e.message));
  }, [lang]);

  const onEdit = (key, value) => setEdits((prev) => ({ ...prev, [key]: value }));

  const rows = useMemo(() => (en && target ? buildRows(en, target) : []), [en, target]);
  const visible = useMemo(
    () => filterRows(rows, { query, onlyMissing }, edits),
    [rows, query, onlyMissing, edits],
  );
  const valueFor = (row) =>
    Object.prototype.hasOwnProperty.call(edits, row.key) ? edits[row.key] : row.target;

  const missingCount = useMemo(
    () => filterRows(rows, { query: "", onlyMissing: true }, edits).length,
    [rows, edits],
  );
  const changedCount = useMemo(() => computeDiff(target || {}, edits).length, [target, edits]);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Toonleer Translations Editor</h1>
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
                <KeyRow key={row.key} row={row} value={valueFor(row)} onChange={onEdit} />
              ))}
            </div>
          </div>
          <ReviewPanel lang={lang} target={target} edits={edits} />
        </>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Verify tests still pass and the build is clean**

Run:
```bash
cd /Users/herald/dev/toonleer/toonleer-translations/editor && npm test && npm run build
```
Expected: tests PASS; build succeeds.

- [ ] **Step 5: Commit**

```bash
cd /Users/herald/dev/toonleer/toonleer-translations
git add editor/src/App.jsx editor/src/components/Toolbar.jsx editor/src/components/ReviewPanel.jsx
git commit -m "feat(editor): search, untranslated filter, counts, diff review + download"
```

---

## Task 6: GitHub Pages deployment workflow

**Files:** create `.github/workflows/deploy-pages.yml` (repo root).

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy editor to Pages

on:
  push:
    branches: [main]
    paths:
      - "editor/**"
      - "translations/**"
      - ".github/workflows/deploy-pages.yml"
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Build editor
        working-directory: editor
        run: |
          npm ci
          npm run build
      - name: Copy translation data into the site
        run: cp -R translations editor/dist/translations
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: editor/dist
      - id: deploy
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Verify the copy step locally (simulate what the Action does)**

Run:
```bash
cd /Users/herald/dev/toonleer/toonleer-translations
( cd editor && npm run build )
cp -R translations editor/dist/translations
ls editor/dist/translations/langs.json && echo "data present in build ✓"
```
Expected: `editor/dist/translations/langs.json` exists → `data present in build ✓`. (Then remove the local copy: `rm -rf editor/dist` — it is gitignored anyway.)

- [ ] **Step 3: Commit**

```bash
cd /Users/herald/dev/toonleer/toonleer-translations
git add .github/workflows/deploy-pages.yml
git commit -m "ci(editor): build + deploy editor to GitHub Pages with translation data"
```

---

## Task 7: End-to-end local verification

- [ ] **Step 1: Serve the built site with data and confirm it loads**

Run (builds, stages data like the Action, serves the preview):
```bash
cd /Users/herald/dev/toonleer/toonleer-translations/editor
npm run build
cp -R ../translations dist/translations
npm run preview &
PREVIEW_PID=$!
sleep 2
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4173/toonleer-translations/translations/langs.json
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4173/toonleer-translations/
kill $PREVIEW_PID
rm -rf dist
```
Expected: both curls print `200` — the manifest is served under the base path and the SPA HTML loads.

- [ ] **Step 2: Final test run**

Run:
```bash
cd /Users/herald/dev/toonleer/toonleer-translations/editor && npm test
```
Expected: all unit tests PASS.

(Manual, post-merge/deploy: once `.github/workflows/deploy-pages.yml` is on `main` and Pages is enabled for the repo with "GitHub Actions" as the source, the site is live at `https://woltemade.github.io/toonleer-translations/`. Enabling Pages + source is a one-time repo setting in GitHub.)

---

## Self-review notes

- **Spec coverage:** Implements the spec's "Editor SPA" component for the read/edit experience and all four MVP features — missing-key highlight + "untranslated only" filter (`KeyRow` amber styling + `filterRows`), search (`Toolbar` + `filterRows`), placeholder/split-key validation (`validateValue` + inline `KeyRow` warnings), and diff preview (`computeDiff` + `ReviewPanel`). Submission via PR is deferred to Phase 3b; 3a ships a working editor with Download as the interim output. Data is served from the editor origin via the Pages workflow copying `translations/`.
- **No placeholders in code:** every file has complete contents; `config.js` intentionally carries `REPLACE_WITH_*` sentinels for the Client ID / proxy URL, which are Phase 3b inputs (documented as such), not code gaps.
- **Type/shape consistency:** `buildRows` returns `{ key, en, target }`; consumed identically by `KeyRow`, `filterRows`, `applyEdits`. `validateValue` returns `{ missingTokens, extraTokens }` used by `KeyRow`. `computeDiff` returns `{ key, from, to }` used by `ReviewPanel`. Edits are a `{ key: value }` map throughout. Loader functions `loadLanguages/loadReference/loadTarget` match `App`'s usage.
- **Deferred to 3b:** GitHub OAuth (using `config.js` values + the Phase 2 proxy) and fork→branch→commit→PR replacing the Download button.
- **One-time manual:** enabling GitHub Pages with "GitHub Actions" as the source is a repo setting the user toggles once (noted in Task 7).
