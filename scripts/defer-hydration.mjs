// `npm run build` runs this after `next build`: on the website's pages (not the console), Next.js's <script defer>
// tags become one <script src="/boot.js" defer> that loads them after the first paint (public/boot.js explains why),
// plus <link rel=preload fetchpriority=low> so they still download at once without holding up the fonts and the hero photo. Same-site scripts only, so the production CSP still holds.
import { readFileSync, writeFileSync } from "node:fs";

const PAGES = ["index", "404", "howitworks/index", "officials/index", "faq/index", "contact/index", "privacy/index", "terms/index"];
const TAG = /<script\b(?=[^>]*\bdefer\b)[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g;

for (const page of PAGES) {
  const file = `dist/${page}.html`;
  let html = readFileSync(file, "utf8");
  if (html.includes('src="/boot.js"')) continue;
  const load = [];
  let legacy = "";
  html = html.replace(TAG, (tag, src) => {
    if (/\bnoModule\b/i.test(tag)) legacy = src;
    else load.push(src);
    return "";
  });
  if (!load.length) throw new Error(`${file}: no Next.js scripts found`);
  const preload = load.map((src) => `<link rel="preload" as="script" href="${src}" fetchpriority="low"/>`).join("");
  const boot = `<script src="/boot.js" defer="" data-load="${load.join(" ")}"${legacy ? ` data-nomodule="${legacy}"` : ""}></script>`;
  html = html.replace("</head>", preload + boot + "</head>");
  writeFileSync(file, html);
}
console.log(`Scripts start after the first paint on ${PAGES.length} website pages (public/boot.js)`);
