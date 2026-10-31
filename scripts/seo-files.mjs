// `npm run build` runs this after `next build`: writes dist/robots.txt, dist/sitemap.xml and dist/llms.txt for
// GC_SITE_URL (the environment, then .env; default as in next.config.ts), so they always name the address the
// site is built for. Written into dist/ only: the deploy refuses to pull when tracked files have changed.
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

try {
  process.loadEnvFile(".env"); // never overrides real environment variables
} catch {}
const site = (process.env.GC_SITE_URL || "https://dev.gramaconnect.com").replace(/\/+$/, "");

// The website's pages (src/website/routes.ts): path, llms.txt label.
const PAGES = [
  ["/", "Home: what the app does and how to get it"],
  ["/howitworks/", "How it works"],
  ["/officials/", "For officials"],
  ["/faq/", "FAQ"],
  ["/contact/", "Contact"],
  ["/privacy/", "Privacy policy"],
  ["/terms/", "Terms"],
];

let lastmod;
try {
  lastmod = execSync("git log -1 --format=%cs", { encoding: "utf8" }).trim(); // date of the last change
} catch {}
lastmod ||= new Date().toISOString().slice(0, 10);

writeFileSync("dist/robots.txt", `# Grama Connect: the public website is open to every crawler, AI search included, so villagers
# can find it. The console (/console/) is not linked from the website and is marked noindex in its own
# page (not blocked here, so crawlers can read that mark): it never shows in search results.
User-agent: *
Allow: /
Disallow: /api/
Disallow: /django-admin/

Sitemap: ${site}/sitemap.xml
`);

writeFileSync("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(([p]) => `  <url><loc>${site}${p}</loc><lastmod>${lastmod}</lastmod></url>`).join("\n")}
</urlset>
`);

writeFileSync("dist/llms.txt", `# Grama Connect

> A free mobile app that brings verified village news to the people of Andhra Pradesh: Panchayat notices, scheme deadlines, water and power updates, checked by local officials and sent straight to the phone. In Telugu and English, with no sign-up.

- Citizens read news for their own village, save posts, and request services such as Aadhaar and PAN help.
- Panchayat members and Village, Mandal and District admins post updates; admins review them before they reach citizens.
- The website explains the app, how it works, the officials' role, FAQs and how to contact the team.

## Pages

${PAGES.map(([p, label]) => `- [${label.split(":")[0]}](${site}${p})${label.includes(":") ? ":" + label.split(":")[1] : ""}`).join("\n")}
`);

console.log(`SEO files for ${site}: dist/robots.txt, dist/sitemap.xml, dist/llms.txt`);
