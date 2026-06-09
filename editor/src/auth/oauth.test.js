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
