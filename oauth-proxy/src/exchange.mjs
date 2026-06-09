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
