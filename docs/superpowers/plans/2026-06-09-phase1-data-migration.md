# Phase 1 — Translation Data Migration + Build-Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the monolithic `translations.json` into per-language files (`translations/<lang>.json` + `langs.json` manifest) and update the `toonleer` build pipeline (`fetch-translations.js`, `sync-translations.mjs`) to read/write that layout — without breaking the live build or the drift guard.

**Architecture:** A one-shot migration script in `toonleer-translations` splits the current data and emits a `langs.json` manifest, self-verifying via round-trip. `toonleer`'s fetch reads the manifest then each per-language file (from the GitHub raw base URL in CI, or from a local sibling checkout when `TRANSLATIONS_REPO_DIR` is set). Sync writes the same per-language layout with add+update/never-delete semantics. The existing drift guard (`check-translation-drift.mjs`) is unchanged because it reads the generated `community/en.js`.

**Tech Stack:** Node ESM scripts (`.mjs`/`.js`), no new dependencies. This phase is part of the Community Translation Editor (see `docs/superpowers/specs/2026-06-09-translation-editor-design.md`).

---

## Conventions for this plan

- **Two repos.** `toonleer-translations` (data + migration script) and `toonleer` (build pipeline). Every command shows which directory it runs in.
  - App repo: `/Users/herald/dev/toonleer/toonleer`
  - Data repo: `/Users/herald/dev/toonleer/toonleer-translations`
- **Script verification, not vitest.** `toonleer/vitest.config.js` excludes `scripts/**/*.{test,spec}.js`; the repo does not unit-test build scripts. Per "follow established patterns," each script here is verified by running it and asserting console output / exit code / produced files — the same way the drift guard was verified.
- **Local-first verification.** `TRANSLATIONS_REPO_DIR=../toonleer-translations` lets `fetch-translations.js` and `sync-translations.mjs` read/write the sibling checkout directly, so the whole phase is verifiable locally before anything is pushed.
- **Pushes are deferred to the end** (Task 7) and require user confirmation, since they are outward-facing and must be coordinated across both repos.

## File structure

| File | Repo | Responsibility |
| --- | --- | --- |
| `scripts/split-translations.mjs` | data | One-shot migration: `translations.json` → `translations/<lang>.json` + `langs.json`, self-verified |
| `translations/<lang>.json` ×25 | data | Per-language translation data (generated) |
| `translations/langs.json` | data | Manifest: JSON array of language codes |
| `scripts/fetch-translations.js` | app | Read manifest + per-language files (local dir or URL) → `community/<lang>.js` |
| `scripts/sync-translations.mjs` | app | Write index.js values → per-language files + manifest (add/update, no delete) |
| `README.md` | data | Contributor docs updated to per-language layout |
| `CLAUDE.md` | app | Translation-workflow docs updated to per-language layout |
| `translations.json`, `sync.cjs` | data | **Deleted** after the app no longer reads them |

---

## Task 1: Migration script + per-language files (data repo)

**Files:**
- Create: `/Users/herald/dev/toonleer/toonleer-translations/scripts/split-translations.mjs`
- Generates: `/Users/herald/dev/toonleer/toonleer-translations/translations/<lang>.json` (×25) + `translations/langs.json`

- [ ] **Step 1: Write the migration script (with round-trip self-check)**

Create `toonleer-translations/scripts/split-translations.mjs`:

```js
/**
 * One-shot migration: split the monolithic translations.json into one
 * translations/<lang>.json per language, plus a translations/langs.json manifest.
 * Self-verifies by recombining the per-language files and comparing to the source.
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "translations.json");
const OUT_DIR = resolve(ROOT, "translations");

const data = JSON.parse(readFileSync(SRC, "utf8"));
const langs = Object.keys(data);

mkdirSync(OUT_DIR, { recursive: true });
for (const lang of langs) {
  writeFileSync(
    resolve(OUT_DIR, `${lang}.json`),
    JSON.stringify(data[lang], null, 2) + "\n",
    "utf8",
  );
}
writeFileSync(
  resolve(OUT_DIR, "langs.json"),
  JSON.stringify(langs, null, 2) + "\n",
  "utf8",
);

// Self-check: recombine the per-language files and compare to the source.
const recombined = {};
for (const lang of langs) {
  recombined[lang] = JSON.parse(
    readFileSync(resolve(OUT_DIR, `${lang}.json`), "utf8"),
  );
}
if (JSON.stringify(recombined) !== JSON.stringify(data)) {
  console.error("[split] ROUND-TRIP MISMATCH — aborting");
  process.exit(1);
}
console.log(`[split] wrote ${langs.length} languages + langs.json; round-trip OK`);
```

- [ ] **Step 2: Run the migration**

Run (in data repo):
```bash
cd /Users/herald/dev/toonleer/toonleer-translations && node scripts/split-translations.mjs
```
Expected output: `[split] wrote 25 languages + langs.json; round-trip OK`

- [ ] **Step 3: Verify the produced files**

Run:
```bash
cd /Users/herald/dev/toonleer/toonleer-translations
ls translations | wc -l            # expect 26 (25 langs + langs.json)
cat translations/langs.json        # expect ["en","af",...,"zu"] (25 entries)
node -e 'const a=require("./translations/en.json"); console.log(a.heroHeadlineGradient)'  # expect: calculate
```
Expected: 26 files; `langs.json` lists 25 codes; `en.json` has the split hero keys.

- [ ] **Step 4: Commit (data repo)**

```bash
cd /Users/herald/dev/toonleer/toonleer-translations
git add scripts/split-translations.mjs translations/
git commit -m "feat: split translations.json into per-language files + langs.json manifest"
```

---

## Task 2: Update app `fetch-translations.js` to per-language + manifest

**Files:**
- Modify (full rewrite): `/Users/herald/dev/toonleer/toonleer/scripts/fetch-translations.js`

- [ ] **Step 1: Rewrite the fetch script**

Replace the entire contents of `toonleer/scripts/fetch-translations.js` with:

```js
/**
 * Prebuild: fetch per-language community overrides and write one JS module per
 * language to src/data/translations/community/.
 *
 * Source resolution:
 *   - If TRANSLATIONS_REPO_DIR is set and its translations/ dir exists, read the
 *     files from disk (local dev / offline).
 *   - Otherwise fetch from TRANSLATIONS_REPO_URL — a base URL pointing at the
 *     repo's translations/ directory — defaulting to the public GitHub raw path.
 *
 * Reads translations/langs.json (a JSON array of language codes), then
 * translations/<lang>.json for each. Falls back silently to the existing
 * committed baseline on any failure so offline / no-network builds still work.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMMUNITY_DIR = resolve(__dirname, "../src/data/translations/community");
const REPO_URL =
  process.env.TRANSLATIONS_REPO_URL ||
  "https://raw.githubusercontent.com/woltemade/toonleer-translations/main/translations";
const LOCAL_DIR = process.env.TRANSLATIONS_REPO_DIR
  ? resolve(process.env.TRANSLATIONS_REPO_DIR, "translations")
  : null;

const wrap = (data) =>
  `// Generated by scripts/fetch-translations.js — do not edit manually\nexport default ${JSON.stringify(data, null, 2)};\n`;

async function loadJson(name) {
  if (LOCAL_DIR && existsSync(join(LOCAL_DIR, name))) {
    return JSON.parse(readFileSync(join(LOCAL_DIR, name), "utf8"));
  }
  const res = await fetch(`${REPO_URL}/${name}`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`${name} → HTTP ${res.status}`);
  return res.json();
}

async function run() {
  try {
    const source = LOCAL_DIR ? `local dir ${LOCAL_DIR}` : REPO_URL;
    console.log(`[translations] Loading community overrides from ${source}`);
    const langs = await loadJson("langs.json");
    mkdirSync(COMMUNITY_DIR, { recursive: true });
    let written = 0;
    for (const lang of langs) {
      try {
        const data = await loadJson(`${lang}.json`);
        writeFileSync(resolve(COMMUNITY_DIR, `${lang}.js`), wrap(data));
        written++;
      } catch (err) {
        console.warn(`[translations] Skipped ${lang}: ${err.message}`);
      }
    }
    console.log(`[translations] Community overrides written (${written}/${langs.length}).`);
  } catch (err) {
    console.warn(`[translations] Load failed — using existing baseline: ${err.message}`);
  }
}

run();
```

- [ ] **Step 2: Verify it regenerates community files from the local migrated data**

Run (app repo, local-dir mode — no network/push needed):
```bash
cd /Users/herald/dev/toonleer/toonleer
TRANSLATIONS_REPO_DIR=../toonleer-translations node scripts/fetch-translations.js
```
Expected: `Loading community overrides from local dir …/translations` and `Community overrides written (25/25).`

- [ ] **Step 3: Verify the drift guard still passes**

Run:
```bash
cd /Users/herald/dev/toonleer/toonleer && node scripts/check-translation-drift.mjs
```
Expected: `[translations] No English drift — index.js and community overrides agree.` (exit 0). (The migrated `en.json` derives from the already-reconciled `translations.json`, so it matches `index.js`.)

- [ ] **Step 4: Commit (app repo)**

```bash
cd /Users/herald/dev/toonleer/toonleer
git add scripts/fetch-translations.js src/data/translations/community/
git commit -m "feat: fetch per-language translation files + langs manifest"
```

---

## Task 3: Update app `sync-translations.mjs` to per-language files

**Files:**
- Modify (full rewrite): `/Users/herald/dev/toonleer/toonleer/scripts/sync-translations.mjs`

- [ ] **Step 1: Rewrite the sync script**

Replace the entire contents of `toonleer/scripts/sync-translations.mjs` with:

```js
/**
 * Sync: push translations authored in index.js out to the community repo as one
 * translations/<lang>.json file per language, plus translations/langs.json.
 *
 * add + update, NEVER delete — preserves the repo's translation-only keys (e.g.
 * non-English partner-dashboard strings that never live in index.js).
 *
 * Module-import based, so multi-line / concatenated values and unicode escapes
 * are read correctly (unlike the legacy regex-based sync.cjs).
 *
 * Target repo defaults to a sibling checkout; override with TRANSLATIONS_REPO_DIR.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const INDEX_PATH = resolve(REPO_ROOT, "src/data/translations/index.js");
const REPO_DIR =
  process.env.TRANSLATIONS_REPO_DIR ||
  resolve(REPO_ROOT, "../toonleer-translations");
const OUT_DIR = resolve(REPO_DIR, "translations");

async function run() {
  if (!existsSync(REPO_DIR)) {
    console.error(
      `[sync] translations repo not found at ${REPO_DIR}\n` +
        `       Clone woltemade/toonleer-translations next to this repo, or set TRANSLATIONS_REPO_DIR.`,
    );
    process.exit(1);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const { translations } = await import(pathToFileURL(INDEX_PATH).href);
  const langs = Object.keys(translations);

  let added = 0;
  let updated = 0;
  for (const lang of langs) {
    const file = resolve(OUT_DIR, `${lang}.json`);
    const existing = existsSync(file)
      ? JSON.parse(readFileSync(file, "utf8"))
      : {};
    for (const [key, value] of Object.entries(translations[lang])) {
      if (existing[key] === undefined) {
        existing[key] = value;
        added++;
      } else if (existing[key] !== value) {
        existing[key] = value;
        updated++;
      }
    }
    writeFileSync(file, JSON.stringify(existing, null, 2) + "\n", "utf8");
  }
  writeFileSync(
    resolve(OUT_DIR, "langs.json"),
    JSON.stringify(langs, null, 2) + "\n",
    "utf8",
  );

  console.log(
    `[sync] ${OUT_DIR}\n[sync] ${langs.length} language file(s); added ${added}, updated ${updated}.`,
  );
}

run();
```

- [ ] **Step 2: Run the sync against the migrated data**

Run (app repo):
```bash
cd /Users/herald/dev/toonleer/toonleer && npm run sync-translations
```
Expected: `[sync] …/translations` then `25 language file(s); added 0, updated 0.` (0/0 because Task 1 split from the already-synced `translations.json`; non-zero is fine if `index.js` changed since).

- [ ] **Step 3: Verify no unexpected data-repo churn**

Run:
```bash
cd /Users/herald/dev/toonleer/toonleer-translations && git status --short translations/
```
Expected: clean (or only intentional value changes). Spot-check: `grep '"lbCodeFormat"' translations/en.json` → `"3–10 characters, letters and numbers"`.

- [ ] **Step 4: Re-verify fetch + drift end-to-end**

Run:
```bash
cd /Users/herald/dev/toonleer/toonleer
TRANSLATIONS_REPO_DIR=../toonleer-translations node scripts/fetch-translations.js && node scripts/check-translation-drift.mjs
```
Expected: `Community overrides written (25/25).` then `No English drift` (exit 0).

- [ ] **Step 5: Commit (app repo)**

```bash
cd /Users/herald/dev/toonleer/toonleer
git add scripts/sync-translations.mjs
git commit -m "feat: sync writes per-language translation files + manifest"
```

---

## Task 4: Remove the monolith + legacy sync from the data repo

**Files:**
- Delete: `/Users/herald/dev/toonleer/toonleer-translations/translations.json`
- Delete: `/Users/herald/dev/toonleer/toonleer-translations/sync.cjs`
- Modify: `/Users/herald/dev/toonleer/toonleer-translations/README.md`

- [ ] **Step 1: Confirm nothing still reads the monolith**

Run:
```bash
cd /Users/herald/dev/toonleer
grep -rn "translations.json" toonleer/scripts toonleer-translations --include=*.js --include=*.mjs --include=*.cjs 2>/dev/null | grep -v node_modules
```
Expected: no references from app scripts (only possibly README, handled next). If any app code still references it, stop and fix before deleting.

- [ ] **Step 2: Delete the monolith and legacy sync**

```bash
cd /Users/herald/dev/toonleer/toonleer-translations
git rm translations.json sync.cjs
```

- [ ] **Step 3: Update the README "File format" + "How to contribute" sections**

In `toonleer-translations/README.md`, replace the file-format description so it reads:

```markdown
## File format

Translations live in `translations/`, one file per language, named by ISO 639-1
code: `translations/en.json`, `translations/sw.json`, etc. `translations/langs.json`
lists the supported codes. `en.json` is the English reference — English is authored
in the app (`src/data/translations/index.js`) and synced here, so edit the other
languages.

Each `<lang>.json` maps translation keys to strings:

\```json
{
  "heroHeadlineGradient": "calculate",
  "practice": "Practice"
}
\```

You don't need every key — missing keys fall back to the built-in English baseline.
```

And update the command-line contribution example so the edit/commit step targets a
single language file, e.g.:

```markdown
# Edit one language file, then commit
git add translations/sw.json
git commit -m "Fix Swahili practice label"
```

- [ ] **Step 4: Commit (data repo)**

```bash
cd /Users/herald/dev/toonleer/toonleer-translations
git add README.md
git commit -m "chore: drop monolithic translations.json + legacy sync.cjs; document per-language layout"
```

---

## Task 5: Update app `CLAUDE.md` translation docs

**Files:**
- Modify: `/Users/herald/dev/toonleer/toonleer/CLAUDE.md` (the `## Translations` section added earlier)

- [ ] **Step 1: Update the Translations section**

In `toonleer/CLAUDE.md`, in the `## Translations` section, replace the build-time paragraph (the one starting "At build time `prebuild` runs …") with:

```markdown
At build time `prebuild` runs `scripts/fetch-translations.js`, which reads `translations/langs.json` and each `translations/<lang>.json` from the `woltemade/toonleer-translations` repo (or from a local sibling checkout when `TRANSLATIONS_REPO_DIR` is set) and regenerates `src/data/translations/community/*.js`. At runtime `loadCommunityLang()` (`src/hooks/useLanguage.js`) does `Object.assign(translations[lang], community)`, so **community values override `index.js`**.
```

And in the numbered workflow, leave step 2 (`npm run sync-translations`) as-is — it now writes the per-language files automatically.

- [ ] **Step 2: Commit (app repo)**

```bash
cd /Users/herald/dev/toonleer/toonleer
git add CLAUDE.md
git commit -m "docs: per-language translation layout in CLAUDE.md"
```

---

## Task 6: Full local build verification

- [ ] **Step 1: Run the real prebuild against the local data repo**

Run:
```bash
cd /Users/herald/dev/toonleer/toonleer
TRANSLATIONS_REPO_DIR=../toonleer-translations npm run prebuild
```
Expected: fetch writes `(25/25)`, then `No English drift` (exit 0).

- [ ] **Step 2: Confirm a clean production-mode fetch path (URL) is syntactically exercised**

Run (no local dir → forces URL branch; expect graceful behaviour even though the per-language files are not yet pushed):
```bash
cd /Users/herald/dev/toonleer/toonleer && node scripts/fetch-translations.js
```
Expected: either `Community overrides written (25/25).` if the data is already on `main`, or `Load failed — using existing baseline …` (graceful) if not yet pushed. Either is acceptable here; Task 7 makes the URL path authoritative.

---

## Task 7: Coordinated push (requires user confirmation)

Production CI fetches per-language files from the **remote** `main`, so both repos must go live together. **Pause and confirm with the user before pushing** (outward-facing).

- [ ] **Step 1: Push the data repo**

```bash
cd /Users/herald/dev/toonleer/toonleer-translations && git push origin main
```

- [ ] **Step 2: Push the app repo**

```bash
cd /Users/herald/dev/toonleer/toonleer && git push origin main
```

- [ ] **Step 3: Verify the production (URL) fetch path now works**

Run:
```bash
cd /Users/herald/dev/toonleer/toonleer && node scripts/fetch-translations.js && node scripts/check-translation-drift.mjs
```
Expected: `Community overrides written (25/25).` then `No English drift` (exit 0) — now reading from the remote per-language files.

---

## Self-review notes

- **Spec coverage:** This phase implements the spec's "Data: per-language files" and "Build-pipeline updates" components, plus the resolved open detail (manifest = `langs.json` as the language-list source; local-dir support resolves the freshness/testing detail). Editor SPA, OAuth proxy, and PR flow are explicitly out of scope (Phases 2–3).
- **No placeholders:** every code step contains the full file contents or exact replacement text; every run step has an expected output.
- **Type/shape consistency:** `langs.json` is a JSON array of strings everywhere (written by both `split-translations.mjs` and `sync-translations.mjs`, read by `fetch-translations.js`); `wrap()` output matches the existing `community/*.js` "do not edit manually" header; `TRANSLATIONS_REPO_DIR` points at the repo root in both app scripts (each appends `translations/`).
- **Ordering safety:** the monolith is deleted (Task 4) only after the app reads per-language files (Tasks 2–3); pushes are last (Task 7) and gated on confirmation so the two repos go live together.
