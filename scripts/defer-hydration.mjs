// `npm run build` runs this after `next build`: on the website's pages (not the console), Next.js's <script defer>
// tags become one <script src="/_next/static/boot-<hash>.js" defer> that loads them after the first paint
// (scripts/boot.js explains why). It goes under /_next/static/ with its content hash in the name: every server setup
// serves that folder (a root-level /boot.js was not served on dev.gramaconnect.com) and caches it for good.
// plus <link rel=preload fetchpriority=low> so they still download at once without holding up the fonts and the hero photo. Same-site scripts only, so the production CSP still holds.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

// Every exported website page: each .html file in dist/ except the console's (a new page is picked up by itself).
const PAGES = readdirSync("dist", { recursive: true })
  .map((f) => String(f).replace(/\\/g, "/"))
  .filter((f) => f.endsWith(".html") && !f.startsWith("console/"))
  .map((f) => f.slice(0, -".html".length))
  .sort();
if (!PAGES.includes("index")) throw new Error("dist/index.html not found: run next build first");
const code = readFileSync("scripts/boot.js");
const BOOT = `/_next/static/boot-${createHash("sha256").update(code).digest("hex").slice(0, 12)}.js`;
writeFileSync("dist" + BOOT, code);

const TAG = /<script\b(?=[^>]*\bdefer\b)[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g;

for (const page of PAGES) {
  const file = `dist/${page}.html`;
  let html = readFileSync(file, "utf8");
  if (html.includes('src="/_next/static/boot-')) continue;
  const load = [];
  let legacy = "";
  html = html.replace(TAG, (tag, src) => {
    if (/\bnoModule\b/i.test(tag)) legacy = src;
    else load.push(src);
    return "";
  });
  if (!load.length) throw new Error(`${file}: no Next.js scripts found`);
  const preload = load.map((src) => `<link rel="preload" as="script" href="${src}" fetchpriority="low"/>`).join("");
  const boot = `<script src="${BOOT}" defer="" data-load="${load.join(" ")}"${legacy ? ` data-nomodule="${legacy}"` : ""}></script>`;
  html = html.replace("</head>", preload + boot + "</head>");
  writeFileSync(file, html);
}
console.log(`Scripts start after the first paint on ${PAGES.length} website pages (${BOOT})`);
