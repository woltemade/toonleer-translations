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
