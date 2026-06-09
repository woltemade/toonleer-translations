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
