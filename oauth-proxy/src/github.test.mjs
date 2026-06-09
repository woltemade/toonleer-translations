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
