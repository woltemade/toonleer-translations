/**
 * Pure editor logic — no React/DOM. The English object is canonical: its keys
 * define the rows and order. Everything here is unit-tested directly.
 */

const PLACEHOLDER_RE = /\{(\w+)\}/g;

export function buildRows(enObj, targetObj) {
  return Object.keys(enObj).map((key) => ({
    key,
    en: enObj[key],
    target: targetObj?.[key] ?? "",
  }));
}

export function isMissing(value) {
  return value == null || value.trim() === "";
}

export function isIdenticalToEnglish(enValue, targetValue) {
  return !isMissing(targetValue) && targetValue === enValue;
}

export function extractPlaceholders(str) {
  if (!str) return [];
  const out = [];
  for (const m of str.matchAll(PLACEHOLDER_RE)) {
    if (!out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

export function validateValue(enValue, targetValue) {
  if (isMissing(targetValue)) return { missingTokens: [], extraTokens: [] };
  const enTokens = extractPlaceholders(enValue);
  const targetTokens = extractPlaceholders(targetValue);
  return {
    missingTokens: enTokens.filter((t) => !targetTokens.includes(t)),
    extraTokens: targetTokens.filter((t) => !enTokens.includes(t)),
  };
}

export function applyEdits(rows, edits) {
  return rows.map((row) =>
    Object.prototype.hasOwnProperty.call(edits, row.key)
      ? { ...row, target: edits[row.key] }
      : row,
  );
}

export function filterRows(rows, { query, onlyMissing }, edits, committed = {}) {
  const q = query.trim().toLowerCase();
  return rows.filter((row) => {
    // "Untranslated only" is judged on the committed value (updated on blur),
    // falling back to the value as loaded — never the live keystroke — so a row
    // doesn't vanish the instant you type, only once you move off it.
    const committedTarget = Object.prototype.hasOwnProperty.call(committed, row.key)
      ? committed[row.key]
      : row.target;
    if (onlyMissing && !isMissing(committedTarget)) return false;
    if (!q) return true;
    const effectiveTarget = Object.prototype.hasOwnProperty.call(edits, row.key)
      ? edits[row.key]
      : row.target;
    return (
      row.key.toLowerCase().includes(q) ||
      (row.en ?? "").toLowerCase().includes(q) ||
      (effectiveTarget ?? "").toLowerCase().includes(q)
    );
  });
}

export function computeDiff(targetObj, edits) {
  const diff = [];
  for (const key of Object.keys(edits)) {
    const from = targetObj?.[key] ?? "";
    const to = edits[key];
    if (from !== to) diff.push({ key, from, to });
  }
  return diff;
}
