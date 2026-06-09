# Toonleer Translations — OAuth Proxy

Stateless AWS Lambda (SST) that exchanges a GitHub OAuth `code` for an access token, so the translation editor (a static GitHub Pages site) can open PRs as the signed-in contributor without ever exposing the client secret in the browser.

> **Requires Node.js ≥ 22.** SST 4.15+ misbehaves on Node 20 — the CLI hits an ESM load error (so `sst secret set`/`list` silently fail) and `sst deploy` can spin with runaway memory instead of deploying. Use Node 22+ (`node -v`).

## One-time setup

### 1. Create a GitHub OAuth App

GitHub → Settings → Developer settings → OAuth Apps → New OAuth App:

- Application name: Toonleer Translations Editor
- Homepage URL: `https://woltemade.github.io/toonleer-translations/`
- Authorization callback URL: `https://woltemade.github.io/toonleer-translations/`

Copy the Client ID and generate a Client secret. (The Client ID is public and goes in the editor SPA in Phase 3; the secret stays server-side.)

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
curl -i -X OPTIONS <url>   # CORS preflight → 204
```

```bash
curl -i -X POST <url> -H 'content-type: application/json' -d '{"code":"bogus"}'   # → 502 exchange_failed
```

## Local unit tests

```bash
node --test
```
