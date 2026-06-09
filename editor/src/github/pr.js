/**
 * Orchestrates a single-file translation PR using an injected Octokit client.
 * Forks the upstream repo (idempotent), creates a branch on the fork pointing
 * at upstream's current HEAD (forks share git objects), commits the edited
 * <lang>.json on that branch, and opens a cross-fork PR. Returns { url }.
 */
export function branchName(lang, now = new Date()) {
  return `translate-${lang}-${now.getTime()}`;
}

export function prTitle(lang) {
  return `Update ${lang} translations`;
}

export function prBody(lang, changeCount) {
  return `Updates ${changeCount} ${lang} translation key(s) via the Toonleer Translations Editor.`;
}

function toBase64(str) {
  // btoa needs Latin-1; encode UTF-8 first so non-ASCII survives.
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
}

async function waitForFork(octokit, owner, repo, tries = 10) {
  for (let i = 0; i < tries; i++) {
    try {
      await octokit.rest.repos.get({ owner, repo });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw new Error("Fork is taking too long to become available — please retry.");
}

export async function submitTranslationPR({
  octokit,
  owner,
  repo,
  baseBranch,
  lang,
  content,
  changeCount,
}) {
  const { data: user } = await octokit.rest.users.getAuthenticated();
  const login = user.login;

  await octokit.rest.repos.createFork({ owner, repo });
  await waitForFork(octokit, login, repo);

  const { data: ref } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${baseBranch}`,
  });
  const baseSha = ref.object.sha;

  const branch = branchName(lang);
  await octokit.rest.git.createRef({
    owner: login,
    repo,
    ref: `refs/heads/${branch}`,
    sha: baseSha,
  });

  const path = `translations/${lang}.json`;
  const { data: existing } = await octokit.rest.repos.getContent({
    owner: login,
    repo,
    path,
    ref: branch,
  });

  await octokit.rest.repos.createOrUpdateFileContents({
    owner: login,
    repo,
    path,
    message: prTitle(lang),
    content: toBase64(content),
    sha: existing.sha,
    branch,
  });

  const { data: pr } = await octokit.rest.pulls.create({
    owner,
    repo,
    base: baseBranch,
    head: `${login}:${branch}`,
    title: prTitle(lang),
    body: prBody(lang, changeCount),
  });

  return { url: pr.html_url };
}
