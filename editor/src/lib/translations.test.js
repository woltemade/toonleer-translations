import { describe, it, expect } from "vitest";
import {
  buildRows,
  isMissing,
  isIdenticalToEnglish,
  extractPlaceholders,
  validateValue,
  filterRows,
  computeDiff,
  applyEdits,
} from "./translations.js";

const en = { greet: "Hello {name}", bye: "Bye", count: "{n} left" };
const target = { greet: "Hola {name}", bye: "" };

describe("buildRows", () => {
  it("uses English keys as canonical and pairs target values", () => {
    const rows = buildRows(en, target);
    expect(rows).toEqual([
      { key: "greet", en: "Hello {name}", target: "Hola {name}" },
      { key: "bye", en: "Bye", target: "" },
      { key: "count", en: "{n} left", target: "" },
    ]);
  });
});

describe("isMissing", () => {
  it("is true for empty, whitespace, or absent target", () => {
    expect(isMissing("")).toBe(true);
    expect(isMissing("   ")).toBe(true);
    expect(isMissing(undefined)).toBe(true);
    expect(isMissing("Hola")).toBe(false);
  });
});

describe("isIdenticalToEnglish", () => {
  it("flags target equal to English", () => {
    expect(isIdenticalToEnglish("Bye", "Bye")).toBe(true);
    expect(isIdenticalToEnglish("Bye", "Adiós")).toBe(false);
  });
});

describe("extractPlaceholders", () => {
  it("returns the set of {token} names", () => {
    expect(extractPlaceholders("Hi {name}, {n} left")).toEqual(["name", "n"]);
    expect(extractPlaceholders("none")).toEqual([]);
  });
});

describe("validateValue", () => {
  it("reports missing and extra placeholder tokens", () => {
    expect(validateValue("Hello {name}", "Hola")).toEqual({
      missingTokens: ["name"],
      extraTokens: [],
    });
    expect(validateValue("Hello", "Hola {x}")).toEqual({
      missingTokens: [],
      extraTokens: ["x"],
    });
    expect(validateValue("Hi {name}", "Hola {name}")).toEqual({
      missingTokens: [],
      extraTokens: [],
    });
  });
});

describe("applyEdits", () => {
  it("overlays edits onto the target for a row's effective value", () => {
    const rows = buildRows(en, target);
    const edits = { bye: "Adiós" };
    expect(applyEdits(rows, edits)).toEqual([
      { key: "greet", en: "Hello {name}", target: "Hola {name}" },
      { key: "bye", en: "Bye", target: "Adiós" },
      { key: "count", en: "{n} left", target: "" },
    ]);
  });
});

describe("filterRows", () => {
  const rows = buildRows(en, target);
  it("filters to untranslated only", () => {
    const out = filterRows(rows, { query: "", onlyMissing: true }, {});
    expect(out.map((r) => r.key)).toEqual(["bye", "count"]);
  });
  it("keeps an originally-missing row visible while you edit it", () => {
    // Editing a missing row must NOT filter it out mid-typing — the filter is
    // based on the value as loaded, not the in-progress edit.
    const out = filterRows(rows, { query: "", onlyMissing: true }, { bye: "Adiós" });
    expect(out.map((r) => r.key)).toEqual(["bye", "count"]);
  });
  it("searches key, English, and target text (case-insensitive)", () => {
    expect(filterRows(rows, { query: "hola", onlyMissing: false }, {}).map((r) => r.key)).toEqual(["greet"]);
    expect(filterRows(rows, { query: "COUNT", onlyMissing: false }, {}).map((r) => r.key)).toEqual(["count"]);
  });
  it("search matches in-progress edited text", () => {
    expect(
      filterRows(rows, { query: "adiós", onlyMissing: false }, { bye: "Adiós" }).map((r) => r.key),
    ).toEqual(["bye"]);
  });
});

describe("computeDiff", () => {
  it("lists only changed keys as from→to", () => {
    const edits = { bye: "Adiós", greet: "Hola {name}" };
    expect(computeDiff(target, edits)).toEqual([
      { key: "bye", from: "", to: "Adiós" },
    ]);
  });
});
