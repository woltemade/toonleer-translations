# Phase 2 — GitHub OAuth Proxy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A tiny stateless AWS Lambda (via SST) that exchanges a GitHub OAuth `code` for an access token using the client secret, so the static editor (Phase 3) can open PRs as the contributor without ever exposing the secret in the browser.

**Architecture:** A standalone SST app in `toonleer-translations/oauth-proxy/`. One `sst.aws.Function` with a Function URL (CORS limited to the GitHub Pages origin), linked to two SST Secrets (`GithubClientId`, `GithubClientSecret`). The token-exchange logic is a pure, dependency-free function (`exchangeCodeForToken`) unit-tested with a mocked fetch; the Lambda handler is a thin wrapper that reads the secrets, parses the request, and applies CORS.

**Tech Stack:** SST v3 on AWS (us-east-1, matching toonleerauth), Node ESM. Unit tests via the built-in `node --test` runner (no extra test deps). Part of the Community Translation Editor (see `docs/superpowers/specs/2026-06-09-translation-editor-design.md`).

---

## Conventions for this plan

- **Repo:** all work is in `/Users/herald/dev/toonleer/toonleer-translations/oauth-proxy/` (new directory). Commit on a feature branch `oauth-proxy` (created at execution start); do not push until the finishing step.
- **No SST runtime in tests.** The pure logic lives in `src/github.mjs` (imports nothing from `sst`), so `node --test` runs without AWS. The handler `src/exchange.mjs` imports `sst` only at the top level and is exercised by deploy + curl smoke test, not unit tests.
- **Two manual prerequisites** (Task 5) need the user's GitHub account and AWS credentials: creating the GitHub OAuth App and setting the SST secrets + deploying. The implementer builds and unit-tests everything up to that point; deploy/secrets are gated on the user.
- **Pages origin assumption:** the editor (Phase 3) will be served from `https://woltemade.github.io` (project Pages URL `https://woltemade.github.io/toonleer-translations/`). CORS and the OAuth callback use that origin; if a custom domain is adopted later, update `ALLOWED_ORIGIN` and the OAuth App callback.

## File structure

| File | Responsibility |
| --- | --- |
| `oauth-proxy/package.json` | ESM package; `test` = `node --test`; `sst` dependency |
| `oauth-proxy/.gitignore` | ignore `.sst/`, `node_modules/`, `sst-env.d.ts` |
| `oauth-proxy/sst.config.ts` | SST app: one Function + URL/CORS + two Secrets |
| `oauth-proxy/src/github.mjs` | pure `exchangeCodeForToken(...)` — no SST imports |
| `oauth-proxy/src/github.test.mjs` | `node:test` unit tests with mocked fetch |
| `oauth-proxy/src/exchange.mjs` | Lambda Function-URL handler (reads secrets, CORS) |
| `oauth-proxy/README.md` | setup: OAuth App creation, secrets, deploy, smoke test |

---

## Task 1: Scaffold the SST app

**Files:**
- Create: `oauth-proxy/package.json`
- Create: `oauth-proxy/.gitignore`

- [ ] **Step 1: Create `oauth-proxy/package.json`**

```json
{
  "name": "toonleer-translations-oauth",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "test": "node --test",
    "dev": "sst dev",
    "deploy": "sst deploy"
  },
  "dependencies": {
    "sst": "latest"
  }
}
```

- [ ] **Step 2: Create `oauth-proxy/.gitignore`**

```gitignore
.sst/
node_modules/
sst-env.d.ts
```

- [ ] **Step 3: Install dependencies**

Run:
```bash
cd /Users/herald/dev/toonleer/toonleer-translations/oauth-proxy && npm install
```
Expected: installs `sst` and its deps; creates `node_modules/` and `package-lock.json` with no errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/herald/dev/toonleer/toonleer-translations
git add oauth-proxy/package.json oauth-proxy/.gitignore oauth-proxy/package-lock.json
git commit -m "chore(oauth-proxy): scaffold SST app"
```

---

## Task 2: Pure token-exchange function (TDD)

**Files:**
- Test: `oauth-proxy/src/github.test.mjs`
- Create: `oauth-proxy/src/github.mjs`

- [ ] **Step 1: Write the failing tests**

Create `oauth-proxy/src/github.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { exchangeCodeForToken } from "./github.mjs";

const respond = (payload, { ok = true, status = 200 } = {}) => async () => ({
  ok,
  status,
  json: async () => payload,
});

test("returns the token fields on success", async () => {
  const token = await exchangeCodeForToken({
    code: "abc",
    clientId: "id",
    clientSecret: "secret",
    fetchImpl: respond({
      access_token: "tok",
      token_type: "bearer",
      scope: "public_repo",
    }),
  });
  assert.deepEqual(token, {
    access_token: "tok",
    token_type: "bearer",
    scope: "public_repo",
  });
});

test("throws with GitHub's description on an error payload", async () => {
  await assert.rejects(
    exchangeCodeForToken({
      code: "bad",
      clientId: "id",
      clientSecret: "s",
      fetchImpl: respond({
        error: "bad_verification_code",
        error_description: "The code is incorrect or expired.",
      }),
    }),
    /incorrect or expired/,
  );
});

test("throws on a non-OK HTTP response", async () => {
  await assert.rejects(
    exchangeCodeForToken({
      code: "x",
      clientId: "id",
      clientSecret: "s",
      fetchImpl: respond({}, { ok: false, status: 500 }),
    }),
    /github 500/,
  );
});

test("throws when no access_token is present", async () => {
  await assert.rejects(
    exchangeCodeForToken({
      code: "x",
      clientId: "id",
      clientSecret: "s",
      fetchImpl: respond({ token_type: "bearer" }),
    }),
    /no_access_token/,
  );
});

test("posts code, credentials and redirect_uri to GitHub", async () => {
  let captured;
  await exchangeCodeForToken({
    code: "abc",
    redirectUri: "https://woltemade.github.io/toonleer-translations/",
    clientId: "id",
    clientSecret: "secret",
    fetchImpl: async (url, opts) => {
      captured = { url, headers: opts.headers, body: JSON.parse(opts.body) };
      return { ok: true, status: 200, json: async () => ({ access_token: "t" }) };
    },
  });
  assert.equal(captured.url, "https://github.com/login/oauth/access_token");
  assert.equal(captured.headers.accept, "application/json");
  assert.equal(captured.body.code, "abc");
  assert.equal(captured.body.client_id, "id");
  assert.equal(captured.body.client_secret, "secret");
  assert.equal(
    captured.body.redirect_uri,
    "https://woltemade.github.io/toonleer-translations/",
  );
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:
```bash
cd /Users/herald/dev/toonleer/toonleer-translations/oauth-proxy && node --test
```
Expected: FAIL — `Cannot find module './github.mjs'` (or "exchangeCodeForToken is not a function").

- [ ] **Step 3: Implement `oauth-proxy/src/github.mjs`**

```js
/**
 * Exchange a GitHub OAuth authorization code for an access token.
 * Pure and dependency-free (fetch is injectable) so it is unit-testable
 * without the SST/AWS runtime. Never logs or returns the client secret.
 */
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

export async function exchangeCodeForToken({
  code,
  redirectUri,
  clientId,
  clientSecret,
  fetchImpl = fetch,
}) {
  const res = await fetchImpl(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      ...(redirectUri ? { redirect_uri: redirectUri } : {}),
    }),
  });
  if (!res.ok) throw new Error(`github ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);
  if (!data.access_token) throw new Error("no_access_token");
  return {
    access_token: data.access_token,
    token_type: data.token_type,
    scope: data.scope,
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run:
```bash
cd /Users/herald/dev/toonleer/toonleer-translations/oauth-proxy && node --test
```
Expected: PASS — 5 tests passing.

- [ ] **Step 5: Commit**

```bash
cd /Users/herald/dev/toonleer/toonleer-translations
git add oauth-proxy/src/github.mjs oauth-proxy/src/github.test.mjs
git commit -m "feat(oauth-proxy): token-exchange function with tests"
```

---

## Task 3: Lambda handler

**Files:**
- Create: `oauth-proxy/src/exchange.mjs`

- [ ] **Step 1: Implement the handler**

Create `oauth-proxy/src/exchange.mjs`:

```js
/**
 * AWS Lambda Function-URL handler. Thin wrapper around exchangeCodeForToken:
 * handles CORS preflight, parses the JSON body, reads the GitHub credentials
 * from SST Secrets, and returns the access token. Errors never leak the secret.
 */
import { Resource } from "sst";
import { exchangeCodeForToken } from "./github.mjs";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

const json = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json", ...cors },
  body: JSON.stringify(body),
});

export async function handler(event) {
  const method = event?.requestContext?.http?.method;
  if (method === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };
  if (method !== "POST") return json(405, { error: "method_not_allowed" });

  let code;
  let redirectUri;
  try {
    const parsed = JSON.parse(event.body || "{}");
    code = parsed.code;
    redirectUri = parsed.redirect_uri;
  } catch {
    return json(400, { error: "invalid_json" });
  }
  if (!code) return json(400, { error: "missing_code" });

  try {
    const token = await exchangeCodeForToken({
      code,
      redirectUri,
      clientId: Resource.GithubClientId.value,
      clientSecret: Resource.GithubClientSecret.value,
    });
    return json(200, token);
  } catch (err) {
    return json(502, { error: "exchange_failed", detail: err.message });
  }
}
```

- [ ] **Step 2: Verify it parses/loads (syntax + import shape) without AWS**

Run (confirms the module is syntactically valid; it will throw on `Resource` access only when the handler is actually invoked, which we don't do here):
```bash
cd /Users/herald/dev/toonleer/toonleer-translations/oauth-proxy
node --check src/exchange.mjs && echo "syntax OK"
```
Expected: `syntax OK`.

- [ ] **Step 3: Commit**

```bash
cd /Users/herald/dev/toonleer/toonleer-translations
git add oauth-proxy/src/exchange.mjs
git commit -m "feat(oauth-proxy): Lambda function-URL handler"
```

---

## Task 4: SST config

**Files:**
- Create: `oauth-proxy/sst.config.ts`

- [ ] **Step 1: Write the SST config**

Create `oauth-proxy/sst.config.ts`:

```ts
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "toonleerTranslationsOauth",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: { aws: { region: "us-east-1" } },
    };
  },
  async run() {
    const ALLOWED_ORIGIN =
      process.env.ALLOWED_ORIGIN || "https://woltemade.github.io";

    const clientId = new sst.Secret("GithubClientId");
    const clientSecret = new sst.Secret("GithubClientSecret");

    const exchange = new sst.aws.Function("Exchange", {
      url: {
        cors: {
          allowOrigins: [ALLOWED_ORIGIN],
          allowMethods: ["POST"],
          allowHeaders: ["content-type"],
        },
      },
      link: [clientId, clientSecret],
      environment: { ALLOWED_ORIGIN },
      handler: "src/exchange.handler",
    });

    return { url: exchange.url };
  },
});
```

- [ ] **Step 2: Verify SST can load the config (no deploy)**

Run:
```bash
cd /Users/herald/dev/toonleer/toonleer-translations/oauth-proxy && npx sst version
```
Expected: prints an SST version with no config-parse error. (This pulls the SST platform on first run; if it requires AWS credentials to fully init, a clean version print is sufficient — do NOT deploy here.)

- [ ] **Step 3: Commit**

```bash
cd /Users/herald/dev/toonleer/toonleer-translations
git add oauth-proxy/sst.config.ts
git commit -m "feat(oauth-proxy): SST app config with function URL + secrets"
```

---

## Task 5: Setup docs + deploy (manual prerequisites — user-gated)

These steps need the user's GitHub account and AWS credentials. The implementer writes the README (Step 1) and commits it; Steps 2–4 are run by the user (or by the controller with the user's explicit go-ahead and working AWS creds).

**Files:**
- Create: `oauth-proxy/README.md`

- [ ] **Step 1: Write `oauth-proxy/README.md`**

```markdown
# Toonleer Translations — OAuth Proxy

Stateless AWS Lambda (SST) that exchanges a GitHub OAuth `code` for an access
token, so the translation editor (a static GitHub Pages site) can open PRs as the
signed-in contributor without ever exposing the client secret in the browser.

## One-time setup

### 1. Create a GitHub OAuth App

GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**:

- **Application name:** Toonleer Translations Editor
- **Homepage URL:** `https://woltemade.github.io/toonleer-translations/`
- **Authorization callback URL:** `https://woltemade.github.io/toonleer-translations/`

Copy the **Client ID** and generate a **Client secret**. (The Client ID is public
and goes in the editor SPA in Phase 3; the secret stays server-side.)

### 2. Store the credentials as SST secrets

```bash
cd oauth-proxy
npx sst secret set GithubClientId <client-id>
npx sst secret set GithubClientSecret <client-secret>
```

### 3. Deploy

```bash
npx sst deploy --stage production
```

Note the printed `url` output — that is the proxy endpoint the editor calls.

## Smoke test

```bash
# CORS preflight → 204
curl -i -X OPTIONS <url>

# Bogus code → 502 exchange_failed (proves the Lambda runs and reaches GitHub)
curl -i -X POST <url> -H 'content-type: application/json' -d '{"code":"bogus"}'
```

## Local unit tests

```bash
node --test
```
```

- [ ] **Step 2 (user): create the OAuth App and set secrets** — see README §1–2. Acceptance: `npx sst secret list` shows `GithubClientId` and `GithubClientSecret` set.

- [ ] **Step 3 (user): deploy** — `npx sst deploy --stage production`. Acceptance: deploy succeeds and prints a Function URL.

- [ ] **Step 4 (user): smoke test** — run the two curl commands. Acceptance: OPTIONS → `204` with the `Access-Control-Allow-Origin` header; POST with a bogus code → `502 {"error":"exchange_failed",...}` (confirms the function executed, secrets were present, and GitHub was reached). Record the Function URL for Phase 3.

- [ ] **Step 5: Commit the README**

```bash
cd /Users/herald/dev/toonleer/toonleer-translations
git add oauth-proxy/README.md
git commit -m "docs(oauth-proxy): setup, deploy, and smoke-test instructions"
```

---

## Self-review notes

- **Spec coverage:** Implements the spec's "OAuth proxy (`oauth-proxy/`, SST app)" component — one `sst.aws.Function` with a URL, CORS limited to the Pages origin, secret in an SST Secret, `POST /exchange { code } → { access_token }`. The editor SPA and PR flow remain Phases 3.
- **No placeholders:** every code step has full file contents; every run step has expected output. The only deliberately deferred items are the two user-gated manual steps (OAuth App creation, deploy), which require credentials and are explicitly marked as such with acceptance criteria.
- **Type/shape consistency:** `exchangeCodeForToken` takes `{ code, redirectUri, clientId, clientSecret, fetchImpl }` and returns `{ access_token, token_type, scope }` — matched between `github.mjs`, its tests, and the handler. The handler reads `Resource.GithubClientId` / `Resource.GithubClientSecret`, exactly the two `sst.Secret` names declared in `sst.config.ts`. `ALLOWED_ORIGIN` is set as a function `environment` value and read by the handler via `process.env.ALLOWED_ORIGIN`.
- **Testability:** SST-free pure logic in `github.mjs` is unit-tested; the SST-coupled handler is validated by `node --check` + the deploy smoke test, avoiding a brittle mock of the SST `Resource` runtime.
