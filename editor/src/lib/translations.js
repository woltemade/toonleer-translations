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

export function filterRows(rows, { query, onlyMissing }, edits) {
  const q = query.trim().toLowerCase();
  return rows.filter((row) => {
    // "Untranslated only" is judged on the value as loaded (row.target), not the
    // in-progress edit — otherwise a row vanishes the instant you start typing.
    if (onlyMissing && !isMissing(row.target)) return false;
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
