# Community Translation Editor — Design

**Date:** 2026-06-09
**Status:** Approved (design); implementation plan pending
**Repos affected:** `toonleer-translations` (editor, proxy, data), `toonleer` (build-pipeline updates)

## Context

Today contributors improve translations by manually forking `toonleer-translations`, hand-editing an 862 KB single `translations.json`, and opening a PR (see the repo README). That is painful: the file is huge, raw-JSON editing is error-prone, there is no view of the English reference beside the target language, and no way to see which keys are still untranslated.

We want a browser-based editor, hosted on GitHub Pages, where anyone can: pick a language, see each string side-by-side with English, edit the target, and submit the change as a pull request in one click. This lowers the barrier to community translation while keeping review in the maintainer's hands (PRs, not direct writes).

The app consumes these translations at build time: `toonleer`'s `prebuild` fetches the data and regenerates `src/data/translations/community/*.js`, which override the English-authored baseline in `index.js` at runtime. A drift guard (added earlier) fails the build if English in `index.js` diverges from its community override — so **English is authored in `index.js` and must stay read-only in this editor**.

## Goals

- Static SPA on GitHub Pages: language picker + side-by-side English (read-only) / target (editable) editor.
- One-click submission as a **fork-based pull request** for any GitHub user (no repo write access).
- MVP quality-of-life: missing-key highlighting, search/filter, pre-submit validation, diff preview.
- Keep the client secret off the browser via a tiny stateless OAuth proxy.

## Non-goals (future ideas)

- Machine-translation draft suggestions.
- Editing English (it is authored in `toonleer/src/data/translations/index.js`).
- In-app review/merge, voting, glossaries, translation memory.
- Editing multiple languages in a single PR.

## Decisions

| Axis | Decision |
| --- | --- |
| Contributor model | Public, **fork-based PRs** (user forks, app commits to their fork, opens cross-fork PR) |
| Data structure | **Split per-language files** `translations/<lang>.json` |
| OAuth proxy host | **AWS Lambda via SST** (client secret in an SST Secret) |
| Auth | **GitHub OAuth App**, scope `public_repo` |
| Repo layout | Editor + proxy + data all in `toonleer-translations` (two deploy targets) |
| MVP features | Missing-key highlight + filter, search/filter, placeholder & split-key validation, diff preview |

## Architecture

```
┌─ GitHub Pages (static SPA) ─────────────┐        ┌─ SST Lambda (proxy) ─┐
│  language picker                        │        │  POST /exchange      │
│  side-by-side en | target editor        │ ──code→│  code + secret →     │
│  validation, diff, submit               │ ←token─│  GitHub access_token │
└──────────────┬──────────────────────────┘        └──────────────────────┘
               │ Octokit (contributor's token)
               ▼
   fork → branch off upstream HEAD → commit <lang>.json → open cross-fork PR
```

All GitHub writes happen client-side with the contributor's own token. The Lambda is the only server component and does exactly one thing: exchange the OAuth `code` for an access token using the secret.

## Components

### A. Data: per-language files
- `translations/en.json` … `translations/zu.json` (25 files), pretty-printed (2-space, trailing newline), non-ASCII left literal.
- `en.json` is the canonical key set and the read-only reference.

### B. Editor SPA (`editor/`, React + Vite)
- **Data loading:** fetch `en.json` (reference) + `<lang>.json` (target) from the repo's raw content on `main`. Render one row per `en.json` key: key name, English value (read-only), target value (editable textarea, blank if missing).
- **Missing-key highlight + "untranslated only" toggle:** a key is "missing" if absent in the target file or empty. (Identical-to-English is flagged as a soft warning, not "missing", since some strings are legitimately the same.)
- **Search/filter:** match on key name or on English/target text.
- **Placeholder & split-key validation (pre-submit):** extract `{token}` placeholders from each English value; warn if the target drops or adds tokens. For structured key groups (e.g. `heroHeadlineBefore` / `heroHeadlineGradient` / `heroHeadlineAfter`), warn if some are filled and others left empty.
- **Diff preview:** before submitting, show `key: old → new` for every changed key; contributor confirms.
- **Token handling:** access token kept in `sessionStorage` only; cleared on logout/tab close.

### C. OAuth proxy (`oauth-proxy/`, SST app)
- One `sst.aws.Function` with a function URL: `POST /exchange { code, state }` → calls `github.com/login/oauth/access_token` with `client_id` + `client_secret` → returns `{ access_token }`.
- `client_secret` stored as an SST Secret; `client_id` is public (also embedded in the SPA).
- CORS limited to the Pages origin.

### D. Build-pipeline updates (`toonleer` repo)
- `scripts/fetch-translations.js`: fetch each `translations/<lang>.json` (loop the known langs) instead of one `translations.json`; keep writing `src/data/translations/community/<lang>.js`.
- `scripts/sync-translations.mjs`: write per-language files into `toonleer-translations/translations/` instead of one blob.
- Drift guard (`scripts/check-translation-drift.mjs`): unchanged — it reads the generated `community/en.js`.
- Remove the superseded `toonleer-translations/sync.cjs`; update the repo README to point at the editor.

## PR creation flow (Octokit, contributor's token)

1. `GET /user` — resolve the contributor's login.
2. `POST /repos/woltemade/toonleer-translations/forks` — idempotent; returns the existing fork if present. Poll until the fork is queryable.
3. `GET /repos/woltemade/toonleer-translations/git/ref/heads/main` — upstream's latest `main` SHA.
4. `POST /repos/<user>/toonleer-translations/git/refs` — create `refs/heads/translate-<lang>-<timestamp>` pointing at the upstream SHA. (Forks share git objects, so basing the branch on the upstream SHA avoids any stale-fork sync.)
5. Commit the single edited `translations/<lang>.json` on that branch via the Git Data API (blob → tree → commit → update ref), or the Contents API with the file SHA from the upstream tree.
6. `POST /repos/woltemade/toonleer-translations/pulls` with `head = <user>:<branch>`, `base = main`, generated title/body.
7. Show the contributor the PR URL.

## Error handling

- OAuth denied / `state` mismatch → friendly message + retry.
- Fork not ready → poll with backoff, timeout with a clear message.
- Branch-name collision → timestamped (and/or random-suffixed) unique names.
- GitHub rate-limit / API errors → surface the message; suggest retry/login.
- Validation failure → block submit, list the offending keys.
- Unsaved edits → warn on navigate-away / tab close.

## Testing

- **Pure-logic unit tests (Vitest):** placeholder extraction, missing-key detection, identical-to-English detection, diff computation, branch-name generation.
- **Migration round-trip test:** splitting `translations.json` into per-language files and recombining yields the original (modulo formatting).
- **PR orchestration:** mocked Octokit — happy path (fork→branch→commit→PR) plus key error paths (fork pending, rate limit, existing PR).
- **OAuth proxy:** unit-test the exchange handler against a mocked GitHub token endpoint; verify the secret is never returned and CORS is restricted.
- **Manual end-to-end:** run the SPA against a throwaway fork, submit a real PR, confirm the diff is a single-file change.

## Deployment & layout

`toonleer-translations/` (one repo, two deploy targets):
- `translations/*.json` — data (root-level, fetched by the app).
- `editor/` — Vite React SPA; a GitHub Action builds it and publishes to GitHub Pages.
- `oauth-proxy/` — minimal SST app deployed to AWS separately (`sst deploy`); Pages ignores it.
- Updated `README.md`; `sync.cjs` removed.

## Open implementation details (to resolve in the plan)

- Exact GitHub Action for Pages (build `editor/`, publish `gh-pages` or `/docs`).
- Whether to read target-file freshness via raw CDN (cache lag) vs the Contents API (authenticated, fresh) — likely Contents API once logged in.
- Known-language list source for `fetch-translations.js` (hardcode vs derive from a manifest file in the repo).
