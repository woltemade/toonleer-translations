/**
 * Public configuration. The GitHub Client ID is public; the proxy keeps the
 * client secret server-side. OAUTH_PROXY_URL is the Function URL from the
 * Phase 2 `sst deploy`.
 */
export const REPO_OWNER = "woltemade";
export const REPO_NAME = "toonleer-translations";
export const DEFAULT_BASE_BRANCH = "main";

export const GITHUB_CLIENT_ID = "Ov23liZCXZCt6HCXJFxV";
export const OAUTH_PROXY_URL = "https://tro2aaezjbbmvdkddgk4762ooe0aqwtk.lambda-url.us-east-1.on.aws/";

// Where GitHub redirects back after authorization (must match the OAuth App's
// registered callback). Defaults to the current page origin + base path.
export const REDIRECT_URI =
  typeof window !== "undefined"
    ? `${window.location.origin}${import.meta.env.BASE_URL}`
    : "https://woltemade.github.io/toonleer-translations/";
