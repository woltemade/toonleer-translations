const fs = require("fs");

const appFile = "/Users/herald/dev/toonleer/toonleer/src/data/translations/index.js";
const communityFile = "/Users/herald/dev/toonleer/toonleer-translations/translations.json";

const src = fs.readFileSync(appFile, "utf8");
const langs = ["en","af","ar","bn","da","de","es","fr","hi","id","it","ja","ko","nl","no","pl","pt","sv","sw","tr","uk","ur","xh","zh","zu"];

// Extract all key-value pairs for each language from the JS source
const appTrans = {};
for (const lang of langs) {
  const marker = `\n  ${lang}:`;
  const langIdx = src.indexOf(marker);
  if (langIdx === -1) { console.warn(`Lang ${lang} not found`); continue; }
  const blockEnd = src.indexOf("\n  },", langIdx);
  const block = src.slice(langIdx, blockEnd);
  appTrans[lang] = {};
  // Match single-line:   key: "value",
  // AND multi-line:      key:\n      "value",
  const re = /^    (\w+): "((?:[^"\\]|\\.)*)",?$|^    (\w+):\s*\n\s+"((?:[^"\\]|\\.)*)",?$/gm;
  let m;
  while ((m = re.exec(block)) !== null) {
    const key = m[1] || m[3];
    const raw = m[2] !== undefined ? m[2] : m[4];
    // Unescape JS string escapes
    const val = raw
      .replace(/\\"/g, '"')
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\\\/g, "\\");
    appTrans[lang][key] = val;
  }
}

// Print key counts per language to verify
for (const lang of langs) {
  console.log(`${lang}: ${Object.keys(appTrans[lang]).length} keys`);
}

// Load community JSON
const community = JSON.parse(fs.readFileSync(communityFile, "utf8"));

// Full sync: overwrite all values in community JSON with current app values
// This ensures changed translations are always picked up
let updated = 0;
let added = 0;
for (const lang of langs) {
  if (!community[lang]) community[lang] = {};
  for (const key of Object.keys(appTrans[lang])) {
    const newVal = appTrans[lang][key];
    if (community[lang][key] === undefined) {
      community[lang][key] = newVal;
      added++;
    } else if (community[lang][key] !== newVal) {
      community[lang][key] = newVal;
      updated++;
    }
  }
}
console.log(`\nAdded ${added} new entries, updated ${updated} changed entries`);

// Write back
fs.writeFileSync(communityFile, JSON.stringify(community, null, 2) + "\n", "utf8");
console.log("Done — translations.json updated");
