import { describe, it, expect, vi } from "vitest";
import { branchName, prTitle, prBody, submitTranslationPR } from "./pr.js";

describe("naming helpers", () => {
  it("branchName is translate-<lang>-<digits>", () => {
    expect(branchName("sw", new Date("2026-06-09T00:00:00Z"))).toMatch(/^translate-sw-\d+$/);
  });
  it("prTitle and prBody mention the language and change count", () => {
    expect(prTitle("sw")).toContain("sw");
    expect(prBody("sw", 3)).toContain("3");
  });
});

describe("submitTranslationPR", () => {
  function fakeOctokit(calls) {
    return {
      rest: {
        users: { getAuthenticated: vi.fn(async () => ({ data: { login: "alice" } })) },
        repos: {
          createFork: vi.fn(async () => ({ data: { owner: { login: "alice" } } })),
          get: vi.fn(async () => ({ data: { default_branch: "main" } })),
          getContent: vi.fn(async () => ({ data: { sha: "filesha" } })),
          createOrUpdateFileContents: vi.fn(async () => ({ data: {} })),
        },
        git: {
          getRef: vi.fn(async () => ({ data: { object: { sha: "upstreamsha" } } })),
          createRef: vi.fn(async (args) => {
            calls.push(args);
            return { data: {} };
          }),
        },
        pulls: {
          create: vi.fn(async () => ({ data: { html_url: "https://github.com/x/y/pull/1" } })),
        },
      },
    };
  }

  it("forks, branches off upstream, commits the file, and opens a PR", async () => {
    const calls = [];
    const octokit = fakeOctokit(calls);
    const result = await submitTranslationPR({
      octokit,
      owner: "woltemade",
      repo: "toonleer-translations",
      baseBranch: "main",
      lang: "sw",
      content: '{"practice":"Mazoezi"}\n',
      changeCount: 1,
    });
    expect(result.url).toBe("https://github.com/x/y/pull/1");
    // branch created on the fork, pointing at the upstream sha
    expect(octokit.rest.git.createRef).toHaveBeenCalledWith(
      expect.objectContaining({ owner: "alice", sha: "upstreamsha" }),
    );
    // PR opened against upstream with a cross-fork head
    expect(octokit.rest.pulls.create).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: "woltemade",
        repo: "toonleer-translations",
        base: "main",
        head: expect.stringMatching(/^alice:translate-sw-\d+$/),
      }),
    );
    // committed to translations/sw.json on the fork
    expect(octokit.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith(
      expect.objectContaining({ owner: "alice", path: "translations/sw.json" }),
    );
  });
});
