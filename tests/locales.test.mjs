// `npm test`: the website's words (src/website/locales/te.json and en.json). TypeScript already fails the build
// when a key is missing in one language; this catches a key that is there but left empty by mistake.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const load = (lang) => JSON.parse(readFileSync(new URL(`../src/website/locales/${lang}.json`, import.meta.url), "utf8"));

// Empty on purpose:
// - en ui.wordPost: the Telugu hero adds words after the rotating one; English needs none (Hero.tsx).
// - en legal.note: the Telugu note says the English text wins where the two differ; the English page needs none.
const EMPTY_ON_PURPOSE = { te: [], en: ["ui.wordPost", "legal.note"] };

function emptyKeys(value, path = "") {
  if (typeof value === "string") return value.trim() ? [] : [path];
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => emptyKeys(v, path ? path + "." + k : k));
  return [];
}

for (const lang of ["te", "en"]) {
  test(`${lang}.json has no empty text except the known ones`, () => {
    assert.deepEqual(emptyKeys(load(lang)).sort(), [...EMPTY_ON_PURPOSE[lang]].sort());
  });
}
