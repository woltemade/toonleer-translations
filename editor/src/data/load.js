/**
 * Loads translation data from the editor's own origin. The Pages build copies
 * the repo's translations/ directory into the site, so these paths resolve to
 * the deployed commit (no CORS, no API rate limit).
 */
const base = import.meta.env.BASE_URL; // e.g. "/toonleer-translations/"

async function getJson(path) {
  const res = await fetch(`${base}translations/${path}`);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

export function loadLanguages() {
  return getJson("langs.json");
}

export function loadReference() {
  return getJson("en.json");
}

export function loadTarget(lang) {
  return getJson(`${lang}.json`);
}
