// The website's texts: every word a visitor sees lives in locales/te.json and locales/en.json, never in the code.
// Both files have the same keys; TypeScript fails the build if one language misses a key (the two checks below).
//   ui          labels, headings and paragraphs, read in the markup as v.t.<key>
//   categories  showcase category chips; words: the hero's changing word; months: short month names for dates
//   sample      the hero ticker's posts until the showcase API answers; day: "A day in the village"
//   office      fallback office details until the site settings (SITE_* on the server) load
//   seo         page titles (English name | Telugu name), descriptions, share-image alt text, the noscript summary
//   legal       Privacy policy and Terms: a section body string is a paragraph, an array is a bullet list;
//               {email} and {phone} are filled from the site settings. Update `updated` whenever the wording changes.
import te from "./locales/te.json";
import en from "./locales/en.json";

export type Lang = "te" | "en";
export type Locale = typeof te;
export type Strings = Locale["ui"];

const _enHasEveryTeKey: Locale = en;
const _teHasEveryEnKey: typeof en = te;
void _enHasEveryTeKey, _teHasEveryEnKey;

const LOCALES: Record<Lang, Locale> = { te, en };
export default LOCALES;
