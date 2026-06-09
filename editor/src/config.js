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
