/**
 * AWS Lambda Function-URL handler. Thin wrapper around exchangeCodeForToken:
 * parses the JSON body, reads the GitHub credentials from SST Secrets, and
 * returns the access token. Errors never leak the secret.
 *
 * CORS (including OPTIONS preflight) is handled by the Function URL's own `cors`
 * config in sst.config.ts — the handler must NOT also set Access-Control-* or
 * the response ends up with duplicate headers, which browsers reject.
 */
import { Resource } from "sst";
import { exchangeCodeForToken } from "./github.mjs";

const json = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

export async function handler(event) {
  const method = event?.requestContext?.http?.method;
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
