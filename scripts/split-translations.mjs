/**
 * One-shot migration: split the monolithic translations.json into one
 * translations/<lang>.json per language, plus a translations/langs.json manifest.
 * Self-verifies by recombining the per-language files and comparing to the source.
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "translations.json");
const OUT_DIR = resolve(ROOT, "translations");

const data = JSON.parse(readFileSync(SRC, "utf8"));
const langs = Object.keys(data);

mkdirSync(OUT_DIR, { recursive: true });
for (const lang of langs) {
  writeFileSync(
    resolve(OUT_DIR, `${lang}.json`),
    JSON.stringify(data[lang], null, 2) + "\n",
    "utf8",
  );
}
writeFileSync(
  resolve(OUT_DIR, "langs.json"),
  JSON.stringify(langs, null, 2) + "\n",
  "utf8",
);

// Self-check: recombine the per-language files and compare to the source.
const recombined = {};
for (const lang of langs) {
  recombined[lang] = JSON.parse(
    readFileSync(resolve(OUT_DIR, `${lang}.json`), "utf8"),
  );
}
if (JSON.stringify(recombined) !== JSON.stringify(data)) {
  console.error("[split] ROUND-TRIP MISMATCH — aborting");
  process.exit(1);
}
console.log(`[split] wrote ${langs.length} languages + langs.json; round-trip OK`);
