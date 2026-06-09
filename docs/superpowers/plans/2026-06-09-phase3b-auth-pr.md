# Phase 3b — Editor Auth + Fork→PR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a contributor sign in with GitHub (via the Phase 2 OAuth proxy) and submit their edits as a pull request — fork the repo, branch off upstream `main`, commit the edited `<lang>.json`, and open a cross-fork PR — replacing the Phase 3a Download button with a "Submit as Pull Request" flow.

**Architecture:** A static SPA can't hold the OAuth secret, so login uses the redirect flow: the editor sends the browser to GitHub's authorize URL, GitHub redirects back with `?code`, and the editor POSTs that code to the Phase 2 proxy, which returns an access token (kept in `sessionStorage`). All GitHub writes happen client-side with that token via `@octokit/rest`. Pure helpers (authorize-URL building, state, branch/PR naming) are unit-tested; the multi-step PR orchestration is tested against a fake Octokit client.

**Tech Stack:** React + Vite (existing editor), `@octokit/rest`, Vitest. Builds on Phase 3a (`editor/`) and Phase 2 (the deployed proxy). Config (Client ID + proxy URL) lives in `editor/src/config.js`.

---

## Conventions for this plan

- **Repo:** all work in `/Users/herald/dev/toonleer/toonleer-translations/editor/`. Commit on a feature branch `editor-auth` (created at execution start); do not push until the finishing step.
- **Tests:** `npm test` inside `editor/` (Vitest). TDD for the pure helpers (Tasks 1–2).
- **Pure vs integration:** URL/state/naming helpers are pure and unit-tested. The PR orchestration takes an injected `octokit` client and is tested with a fake; no real network in tests.
- **Live testing is deploy-gated:** GitHub validates `redirect_uri` against the registered callback (`https://woltemade.github.io/toonleer-translations/`), so the real login round-trip only works on the deployed Pages site, not `localhost`. Unit tests + build cover everything else.
- **Config values:** Client ID is `Ov23liZCXZCt6HCXJFxV` (public). The proxy URL is the Function URL from `sst deploy` (Phase 2) — fill it in Task 1.

## File structure

| File | Responsibility |
| --- | --- |
| `editor/src/config.js` | Real Client ID + proxy URL (replaces Phase 3a sentinels) |
| `editor/src/auth/oauth.js` | Pure: authorize-URL + random state |
| `editor/src/auth/session.js` | Login redirect, code→token exchange via proxy, token storage |
| `editor/src/github/pr.js` | Fork→branch→commit→PR orchestration (injected octokit) + naming helpers |
| `editor/src/auth/*.test.js`, `editor/src/github/pr.test.js` | Vitest unit tests |
| `editor/src/components/AuthBar.jsx` | Sign in / signed-in-as + sign out |
| `editor/src/components/ReviewPanel.jsx` | Add "Submit as Pull Request" + result/error (keep Download) |
| `editor/src/App.jsx` | Complete login on load; pass auth + submit into the tree |
| `editor/package.json` | Add `@octokit/rest` |

---

## Task 1: Config + OAuth helpers + session (TDD for the pure parts)

**Files:** modify `editor/src/config.js`; test `editor/src/auth/oauth.test.js`; create `editor/src/auth/oauth.js`, `editor/src/auth/session.js`.

- [ ] **Step 1: Update `editor/src/config.js` with the real values**

```js
/**
 * Public configuration. The GitHub Client ID is public; the proxy keeps the
 * client secret server-side. OAUTH_PROXY_URL is the Function URL from the
 * Phase 2 `sst deploy`.
 */
export const REPO_OWNER = "woltemade";
export const REPO_NAME = "toonleer-translations";
export const DEFAULT_BASE_BRANCH = "main";

export const GITHUB_CLIENT_ID = "Ov23liZCXZCt6HCXJFxV";
export const OAUTH_PROXY_URL = "REPLACE_WITH_PROXY_FUNCTION_URL";

// Where GitHub redirects back after authorization (must match the OAuth App's
// registered callback). Defaults to the current page origin + base path.
export const REDIRECT_URI =
  typeof window !== "undefined"
    ? `${window.location.origin}${import.meta.env.BASE_URL}`
    : "https://woltemade.github.io/toonleer-translations/";
```

- [ ] **Step 2: Write failing tests `editor/src/auth/oauth.test.js`**

```js
import { describe, it, expect } from "vitest";
import { buildAuthorizeUrl, randomState } from "./oauth.js";

describe("buildAuthorizeUrl", () => {
  it("builds a GitHub authorize URL with the expected params", () => {
    const url = new URL(
      buildAuthorizeUrl({
        clientId: "cid",
        redirectUri: "https://example.com/app/",
        state: "xyz",
      }),
    );
    expect(url.origin + url.pathname).toBe("https://github.com/login/oauth/authorize");
    expect(url.searchParams.get("client_id")).toBe("cid");
    expect(url.searchParams.get("redirect_uri")).toBe("https://example.com/app/");
    expect(url.searchParams.get("scope")).toBe("public_repo");
    expect(url.searchParams.get("state")).toBe("xyz");
  });
});

describe("randomState", () => {
  it("returns a long, unique-ish opaque string", () => {
    const a = randomState();
    const b = randomState();
    expect(a).toMatch(/^[a-z0-9]+$/i);
    expect(a.length).toBeGreaterThanOrEqual(16);
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 3: Run tests, verify they fail**

Run: `cd /Users/herald/dev/toonleer/toonleer-translations/editor && npm test`
Expected: FAIL — cannot resolve `./oauth.js`.

- [ ] **Step 4: Implement `editor/src/auth/oauth.js`**

```js
/** Pure OAuth helpers — no DOM, no storage. */
const AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const SCOPE = "public_repo";

export function buildAuthorizeUrl({ clientId, redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPE,
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export function randomState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
```

- [ ] **Step 5: Run tests, verify they pass**

Run: `cd /Users/herald/dev/toonleer/toonleer-translations/editor && npm test`
Expected: PASS.

- [ ] **Step 6: Implement `editor/src/auth/session.js`** (DOM/storage + proxy exchange; not unit-tested — exercised live)

```js
import { GITHUB_CLIENT_ID, OAUTH_PROXY_URL, REDIRECT_URI } from "../config.js";
import { buildAuthorizeUrl, randomState } from "./oauth.js";

const STATE_KEY = "tl_oauth_state";
const TOKEN_KEY = "tl_gh_token";

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function beginLogin() {
  const state = randomState();
  sessionStorage.setItem(STATE_KEY, state);
  window.location.assign(
    buildAuthorizeUrl({
      clientId: GITHUB_CLIENT_ID,
      redirectUri: REDIRECT_URI,
      state,
    }),
  );
}

/**
 * If the URL carries ?code & ?state from a GitHub redirect, validate state,
 * exchange the code at the proxy for a token, store it, and strip the query.
 * Returns true if a token was obtained, false otherwise. Throws on mismatch
 * or proxy failure.
 */
export async function completeLoginFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");
  if (!code) return false;

  const expected = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);
  // Always strip the query so a refresh can't replay the code.
  window.history.replaceState({}, "", REDIRECT_URI);

  if (!state || state !== expected) throw new Error("OAuth state mismatch — please try signing in again.");

  const res = await fetch(OAUTH_PROXY_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code, redirect_uri: REDIRECT_URI }),
  });
  if (!res.ok) throw new Error(`Sign-in failed (${res.status}).`);
  const data = await res.json();
  if (!data.access_token) throw new Error(data.detail || "Sign-in failed: no token returned.");
  sessionStorage.setItem(TOKEN_KEY, data.access_token);
  return true;
}
```

- [ ] **Step 7: Verify build, then commit**

```bash
cd /Users/herald/dev/toonleer/toonleer-translations/editor && npm run build
cd /Users/herald/dev/toonleer/toonleer-translations
git add editor/src/config.js editor/src/auth/
git commit -m "feat(editor): GitHub OAuth helpers + redirect/session login via proxy"
```
Expected: build succeeds.

---

## Task 2: PR orchestration (TDD with a fake Octokit)

**Files:** add `@octokit/rest` to `editor/package.json`; test `editor/src/github/pr.test.js`; create `editor/src/github/pr.js`.

- [ ] **Step 1: Add the dependency**

Edit `editor/package.json` `dependencies` to add:
```json
    "@octokit/rest": "^21.0.2"
```
Then run: `cd /Users/herald/dev/toonleer/toonleer-translations/editor && npm install`
Expected: installs `@octokit/rest`.

- [ ] **Step 2: Write failing tests `editor/src/github/pr.test.js`**

```js
import { describe, it, expect, vi } from "vitest";
import { branchName, prTitle, prBody, submitTranslationPR } from "./pr.js";

describe("naming helpers", () => {
  it("branchName is translate-<lang>-<digits>", () => {
    expect(branchName("sw", new Date("2026-06-09T00:00:00Z"))).toMatch(/^translate-sw-\d+$/);
  });
  it("prTitle and prBody mention the language and change count", () => {
    expect(prTitle("sw")).toContain("sw");
    expect(prBody("sw", 3)).toContain("3");
  });
});

describe("submitTranslationPR", () => {
  function fakeOctokit(calls) {
    return {
      rest: {
        users: { getAuthenticated: vi.fn(async () => ({ data: { login: "alice" } })) },
        repos: {
          createFork: vi.fn(async () => ({ data: { owner: { login: "alice" } } })),
          get: vi.fn(async () => ({ data: { default_branch: "main" } })),
          getContent: vi.fn(async () => ({ data: { sha: "filesha" } })),
          createOrUpdateFileContents: vi.fn(async () => ({ data: {} })),
        },
        git: {
          getRef: vi.fn(async () => ({ data: { object: { sha: "upstreamsha" } } })),
          createRef: vi.fn(async (args) => {
            calls.push(args);
            return { data: {} };
          }),
        },
        pulls: {
          create: vi.fn(async () => ({ data: { html_url: "https://github.com/x/y/pull/1" } })),
        },
      },
    };
  }

  it("forks, branches off upstream, commits the file, and opens a PR", async () => {
    const calls = [];
    const octokit = fakeOctokit(calls);
    const result = await submitTranslationPR({
      octokit,
      owner: "woltemade",
      repo: "toonleer-translations",
      baseBranch: "main",
      lang: "sw",
      content: '{"practice":"Mazoezi"}\n',
      changeCount: 1,
    });
    expect(result.url).toBe("https://github.com/x/y/pull/1");
    // branch created on the fork, pointing at the upstream sha
    expect(octokit.rest.git.createRef).toHaveBeenCalledWith(
      expect.objectContaining({ owner: "alice", sha: "upstreamsha" }),
    );
    // PR opened against upstream with a cross-fork head
    expect(octokit.rest.pulls.create).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: "woltemade",
        repo: "toonleer-translations",
        base: "main",
        head: expect.stringMatching(/^alice:translate-sw-\d+$/),
      }),
    );
    // committed to translations/sw.json on the fork
    expect(octokit.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith(
      expect.objectContaining({ owner: "alice", path: "translations/sw.json" }),
    );
  });
});
```

- [ ] **Step 3: Run tests, verify they fail**

Run: `cd /Users/herald/dev/toonleer/toonleer-translations/editor && npm test`
Expected: FAIL — cannot resolve `./pr.js`.

- [ ] **Step 4: Implement `editor/src/github/pr.js`**

```js
/**
 * Orchestrates a single-file translation PR using an injected Octokit client.
 * Forks the upstream repo (idempotent), creates a branch on the fork pointing
 * at upstream's current HEAD (forks share git objects), commits the edited
 * <lang>.json on that branch, and opens a cross-fork PR. Returns { url }.
 */
export function branchName(lang, now = new Date()) {
  return `translate-${lang}-${now.getTime()}`;
}

export function prTitle(lang) {
  return `Update ${lang} translations`;
}

export function prBody(lang, changeCount) {
  return `Updates ${changeCount} ${lang} translation key(s) via the Toonleer Translations Editor.`;
}

function toBase64(str) {
  // btoa needs Latin-1; encode UTF-8 first so non-ASCII survives.
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
}

async function waitForFork(octokit, owner, repo, tries = 10) {
  for (let i = 0; i < tries; i++) {
    try {
      await octokit.rest.repos.get({ owner, repo });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw new Error("Fork is taking too long to become available — please retry.");
}

export async function submitTranslationPR({
  octokit,
  owner,
  repo,
  baseBranch,
  lang,
  content,
  changeCount,
}) {
  const { data: user } = await octokit.rest.users.getAuthenticated();
  const login = user.login;

  await octokit.rest.repos.createFork({ owner, repo });
  await waitForFork(octokit, login, repo);

  const { data: ref } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${baseBranch}`,
  });
  const baseSha = ref.object.sha;

  const branch = branchName(lang);
  await octokit.rest.git.createRef({
    owner: login,
    repo,
    ref: `refs/heads/${branch}`,
    sha: baseSha,
  });

  const path = `translations/${lang}.json`;
  const { data: existing } = await octokit.rest.repos.getContent({
    owner: login,
    repo,
    path,
    ref: branch,
  });

  await octokit.rest.repos.createOrUpdateFileContents({
    owner: login,
    repo,
    path,
    message: prTitle(lang),
    content: toBase64(content),
    sha: existing.sha,
    branch,
  });

  const { data: pr } = await octokit.rest.pulls.create({
    owner,
    repo,
    base: baseBranch,
    head: `${login}:${branch}`,
    title: prTitle(lang),
    body: prBody(lang, changeCount),
  });

  return { url: pr.html_url };
}
```

- [ ] **Step 5: Run tests, verify they pass**

Run: `cd /Users/herald/dev/toonleer/toonleer-translations/editor && npm test`
Expected: PASS (oauth + pr suites green).

- [ ] **Step 6: Commit**

```bash
cd /Users/herald/dev/toonleer/toonleer-translations
git add editor/package.json editor/package-lock.json editor/src/github/
git commit -m "feat(editor): fork→branch→commit→PR orchestration with tests"
```

---

## Task 3: UI integration — sign-in bar + submit-as-PR

**Files:** create `editor/src/components/AuthBar.jsx`; update `editor/src/components/ReviewPanel.jsx`, `editor/src/App.jsx`.

- [ ] **Step 1: `editor/src/components/AuthBar.jsx`**

```jsx
import { beginLogin } from "../auth/session.js";

export default function AuthBar({ login, onSignOut }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {login ? (
        <>
          <span className="text-gray-600">Signed in as <strong>{login}</strong></span>
          <button className="underline" onClick={onSignOut}>Sign out</button>
        </>
      ) : (
        <button
          className="bg-black text-white rounded px-3 py-1"
          onClick={beginLogin}
        >
          Sign in with GitHub
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update `editor/src/components/ReviewPanel.jsx`** to add PR submission (keep Download)

Replace the file with:

```jsx
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
```

- [ ] **Step 3: Wire auth + submit into `editor/src/App.jsx`**

Add these imports near the top:
```jsx
import { Octokit } from "@octokit/rest";
import AuthBar from "./components/AuthBar.jsx";
import { completeLoginFromUrl, getToken, isLoggedIn, logout } from "./auth/session.js";
import { submitTranslationPR } from "./github/pr.js";
import { REPO_OWNER, REPO_NAME, DEFAULT_BASE_BRANCH } from "./config.js";
```

Add this auth state + effects inside `App` (alongside the existing state hooks):
```jsx
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
```

Render `AuthBar` in the header row — change the `BrandHeader` block to sit in a flex row with the auth bar:
```jsx
      <div className="flex items-start justify-between gap-4">
        <BrandHeader />
        <AuthBar login={login} onSignOut={onSignOut} />
      </div>
```

And pass the submit props to `ReviewPanel`:
```jsx
          <ReviewPanel
            lang={lang}
            target={target}
            edits={edits}
            canSubmit={Boolean(login)}
            onSubmit={onSubmit}
          />
```

- [ ] **Step 4: Verify tests + build**

Run: `cd /Users/herald/dev/toonleer/toonleer-translations/editor && npm test && npm run build`
Expected: tests PASS; build succeeds.

- [ ] **Step 5: Commit**

```bash
cd /Users/herald/dev/toonleer/toonleer-translations
git add editor/src/App.jsx editor/src/components/AuthBar.jsx editor/src/components/ReviewPanel.jsx
git commit -m "feat(editor): sign-in bar + submit-as-pull-request flow"
```

---

## Task 4: Verification

- [ ] **Step 1: Unit tests + build**

Run: `cd /Users/herald/dev/toonleer/toonleer-translations/editor && npm test && npm run build`
Expected: all unit tests PASS; build succeeds with the Octokit chunk included.

- [ ] **Step 2: Confirm config is filled**

Run: `grep -E "GITHUB_CLIENT_ID|OAUTH_PROXY_URL" editor/src/config.js`
Expected: `GITHUB_CLIENT_ID` is the real id; `OAUTH_PROXY_URL` is the deployed Function URL (NOT the `REPLACE_WITH_…` sentinel). If still a sentinel, STOP — the proxy URL must be filled before this phase is done.

- [ ] **Step 3 (manual, on the deployed site): live round-trip**

After merge + push (Pages redeploys), on `https://woltemade.github.io/toonleer-translations/`:
1. Click **Sign in with GitHub** → authorize → redirected back, header shows "Signed in as <you>".
2. Pick a language, make an edit, open the review, click **Submit as Pull Request**.
3. Confirm a PR appears on `woltemade/toonleer-translations` touching only `translations/<lang>.json`, and the success link resolves.

(Local `npm run dev` can't complete the GitHub round-trip because `redirect_uri` must match the registered callback — verify the flow on the deployed site.)

---

## Self-review notes

- **Spec coverage:** Implements the spec's "Auth + PR flow" — GitHub OAuth via the proxy (`oauth.js`/`session.js`), fork→branch-off-upstream→commit→cross-fork PR (`pr.js`), and the UI (`AuthBar`, `ReviewPanel` submit). Download is retained as a fallback. Completes the editor feature.
- **No placeholders in code:** every step has full contents. `OAUTH_PROXY_URL` is intentionally a sentinel to be filled from the Phase 2 deploy — Task 4 Step 2 gates on it being replaced; this is an input, not a code gap.
- **Type/shape consistency:** `submitTranslationPR({ octokit, owner, repo, baseBranch, lang, content, changeCount })` returns `{ url }`, matched by `pr.test.js`, `ReviewPanel.onSubmit`, and `App.onSubmit`. `branchName`/`prTitle`/`prBody` signatures are consistent across `pr.js` and its tests. Session API (`beginLogin`, `completeLoginFromUrl`, `getToken`, `isLoggedIn`, `logout`) is used consistently in `AuthBar`/`App`.
- **Security:** token lives only in `sessionStorage`; the query string (with `code`) is stripped on return; `state` is validated against the stored value; the client secret never reaches the browser (proxy-only).
- **Deploy-gated live test:** real OAuth requires the registered callback origin, so end-to-end is verified on Pages, not locally — explicitly called out in Task 4 Step 3.
