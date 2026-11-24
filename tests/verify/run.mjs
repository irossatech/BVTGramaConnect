// Stage 6 verification suite (Jira BVTGC-7). Without a browser: build, i18n, links. In Chromium (browser.mjs,
// owner's approval of Playwright and axe, 2026-11-23): csp, smoke, console, a11y, perf, against dist/ served locally
// with the production headers and a fake API (serve.mjs).
// Usage: node tests/verify/run.mjs <category|all>   (npm run test:<category>, test:all)
// Reads tests/config/web-verify.json; checks the built dist/ (run `npm run build` first). Writes
// test-reports/<category>-report-<timestamp>.json and .html, and for `all` a dashboard. Never changes dist/ or src/.
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { PAGES, pathOf } from "../../src/website/routes.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CONFIG_PATH = join(ROOT, "tests", "config", "web-verify.json");

// ---- config ----
function loadConfig() {
  if (!existsSync(CONFIG_PATH)) throw new Error(`Missing config ${relative(ROOT, CONFIG_PATH)}`);
  const raw = readFileSync(CONFIG_PATH, "utf8");
  const c = JSON.parse(raw);
  const missing = ["distDir", "siteUrl", "extraPages", "pageLang", "seoFiles", "budgetsKbGzip", "serverPaths", "securityHeaders", "perf", "a11yFailOn", "fake"].filter((k) => c[k] == null);
  for (const u of ["test.super", "test.limited", "test.district"]) if (!c.fake?.users?.[u]?.password) missing.push(`fake.users.${u}.password`);
  if (missing.length) throw new Error(`Config is missing: ${missing.join(", ")}`);
  if (!/^https:\/\/[^/]+$/.test(c.siteUrl)) throw new Error("Config siteUrl must be https://host with no trailing slash");
  const dist = join(ROOT, c.distDir);
  if (!existsSync(join(dist, "index.html"))) throw new Error(`No build in ${c.distDir}/: run npm run build first`);
  return { ...c, dist, hash: createHash("sha256").update(raw).digest("hex").slice(0, 12) };
}

// ---- helpers ----
const websiteRoutes = () => PAGES.map((p) => pathOf(p));
const htmlFile = (dist, route) => join(dist, route.endsWith("/") ? route + "index.html" : route);
const read = (f) => readFileSync(f, "utf8");
const kb = (n) => Math.round((n / 1024) * 10) / 10;
function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
function makeCheck() {
  const results = [];
  return {
    results,
    check(name, ok, detail = "") {
      results.push({ name, status: ok ? "pass" : "fail", detail });
    },
  };
}

// The scripts a page loads before it shows: its <script src> tags plus the boot script's data-load list.
function firstScripts(html) {
  const out = [];
  for (const m of html.matchAll(/<script\b([^>]*)>/g)) {
    const src = /\bsrc="([^"]+)"/.exec(m[1]);
    if (src) out.push(src[1]);
    const load = /\bdata-load="([^"]+)"/.exec(m[1]);
    if (load) out.push(...load[1].split(/\s+/));
  }
  return [...new Set(out)];
}

// ---- categories ----
function build(c) {
  const { results, check } = makeCheck();
  const site = websiteRoutes();
  const metrics = [];
  for (const r of [...site, ...c.extraPages]) check(`page exists: ${r}`, existsSync(htmlFile(c.dist, r)));
  for (const f of c.seoFiles) check(`${f} exists`, existsSync(join(c.dist, f)));
  if (existsSync(join(c.dist, "sitemap.xml"))) {
    const sm = read(join(c.dist, "sitemap.xml"));
    const missing = site.filter((r) => !sm.includes(`<loc>${c.siteUrl}${r}</loc>`));
    check("sitemap.xml lists every public page", !missing.length, missing.join(" "));
    check("sitemap.xml does not list the console", !sm.includes("/console/"));
  }
  if (existsSync(join(c.dist, "robots.txt")))
    check("robots.txt points at the sitemap", read(join(c.dist, "robots.txt")).includes(`Sitemap: ${c.siteUrl}/sitemap.xml`));
  if (existsSync(join(c.dist, "llms.txt"))) {
    const llms = read(join(c.dist, "llms.txt"));
    const missing = site.filter((r) => !llms.includes(c.siteUrl + r));
    check("llms.txt lists every public page", !missing.length, missing.join(" "));
  }
  const htmls = walk(c.dist).filter((f) => f.endsWith(".html"));
  const inline = [];
  for (const f of htmls) {
    for (const m of read(f).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      const type = /\btype="([^"]+)"/.exec(m[1])?.[1] ?? "";
      const data = type === "application/json" || type === "application/ld+json";
      if (!/\bsrc=/.test(m[1]) && !data && m[2].trim()) inline.push(relative(c.dist, f));
    }
  }
  check("no inline executable <script> in any page (CSP)", !inline.length, [...new Set(inline)].join(" "));
  const maps = walk(c.dist).filter((f) => f.endsWith(".map"));
  check("no source maps in dist/", c.allowSourceMaps || !maps.length, maps.slice(0, 5).map((f) => relative(c.dist, f)).join(" "));
  for (const r of [...site, "/console/"]) {
    const f = htmlFile(c.dist, r);
    if (!existsSync(f)) continue;
    const scripts = firstScripts(read(f)).map((s) => decodeURI(s));
    const missing = scripts.filter((s) => !existsSync(join(c.dist, s.replace(/^\//, ""))));
    const gz = scripts.filter((s) => !missing.includes(s)).reduce((n, s) => n + gzipSync(readFileSync(join(c.dist, s.replace(/^\//, ""))), { level: 9 }).length, 0);
    const budget = c.budgetsKbGzip[r] ?? c.budgetsKbGzip.website;
    metrics.push({ route: r, scriptsKbGzip: kb(gz), budgetKb: budget });
    check(`scripts before first paint within budget: ${r} (${kb(gz)} KB of ${budget} KB gzip)`, !missing.length && kb(gz) <= budget, missing.join(" "));
  }
  return { results, metrics };
}

function i18n(c) {
  const { results, check } = makeCheck();
  const load = (l) => JSON.parse(read(join(ROOT, "src", "website", "locales", `${l}.json`)));
  const keys = (o, p = "") => (o && typeof o === "object" ? Object.entries(o).flatMap(([k, v]) => keys(v, p ? p + "." + k : k)) : [p]);
  const te = new Set(keys(load("te")));
  const en = new Set(keys(load("en")));
  const onlyTe = [...te].filter((k) => !en.has(k));
  const onlyEn = [...en].filter((k) => !te.has(k));
  check("te.json and en.json have the same keys", !onlyTe.length && !onlyEn.length, [...onlyTe.map((k) => "te only: " + k), ...onlyEn.map((k) => "en only: " + k)].join("; "));
  // Empty texts are checked by tests/locales.test.mjs (npm test), with its list of the ones empty on purpose.
  for (const r of [...websiteRoutes(), ...c.extraPages]) {
    const f = htmlFile(c.dist, r);
    if (!existsSync(f)) continue;
    const want = c.pageLang[r] ?? c.pageLang.website;
    const got = /<html[^>]*\blang="([^"]+)"/.exec(read(f))?.[1];
    check(`<html lang="${want}">: ${r}`, got === want, got ? `found ${got}` : "no lang");
  }
  return { results, metrics: [] };
}

function links(c) {
  const { results, check } = makeCheck();
  const external = new Set();
  const server = new Set();
  const broken = [];
  const resolveLocal = (path) => {
    const p = decodeURI(path.split(/[?#]/)[0]);
    if (!p) return true;
    const f = join(c.dist, p.replace(/^\//, ""));
    return existsSync(f) && (statSync(f).isFile() || existsSync(join(f, "index.html")));
  };
  const htmls = walk(c.dist).filter((f) => f.endsWith(".html"));
  for (const f of htmls) {
    const html = read(f);
    const refs = [...html.matchAll(/\b(?:href|src|data-nomodule)="([^"]+)"/g)].map((m) => m[1]);
    for (const m of html.matchAll(/\bsrcset="([^"]+)"/g)) refs.push(...m[1].split(",").map((s) => s.trim().split(/\s+/)[0]));
    for (const m of html.matchAll(/\bdata-load="([^"]+)"/g)) refs.push(...m[1].split(/\s+/));
    for (const ref of refs) {
      if (/^(#|mailto:|tel:|data:|javascript:)/.test(ref)) continue;
      if (/^https?:\/\//.test(ref)) {
        if (ref.startsWith(c.siteUrl + "/")) {
          if (!resolveLocal(ref.slice(c.siteUrl.length))) broken.push(`${relative(c.dist, f)} → ${ref}`);
        } else external.add(ref);
        continue;
      }
      if (c.serverPaths.some((p) => ref.startsWith(p))) {
        server.add(ref);
        continue;
      }
      const abs = ref.startsWith("/") ? ref : "/" + relative(c.dist, join(dirname(f), ref)).replaceAll("\\", "/");
      if (!resolveLocal(abs)) broken.push(`${relative(c.dist, f)} → ${ref}`);
    }
  }
  check(`every internal link resolves (${htmls.length} pages)`, !broken.length, [...new Set(broken)].join("\n"));
  return { results, metrics: [], external: [...external].sort(), server: [...server].sort() };
}

// ---- reports ----
// The browser module loads only when a browser category runs, so build/i18n/links work without Playwright.
const inBrowser = (name) => async (c) => (await import("./browser.mjs"))[name](c);
const CATEGORIES = { build, i18n, links, csp: inBrowser("csp"), smoke: inBrowser("smoke"), console: inBrowser("consoleE2E"), a11y: inBrowser("a11y"), perf: inBrowser("perf") };
const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
const stampNow = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
};
function gitCommit() {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "unknown";
  }
}
const PAGE_CSS = "body{font:14px/1.5 system-ui,sans-serif;margin:24px;max-width:1100px;color:#1a1a1a;background:#fff}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:6px 8px;text-align:left;vertical-align:top}.pass{color:#116b2e}.fail{color:#b00020;font-weight:600}pre{white-space:pre-wrap;margin:0}";

function writeReport(dir, name, stamp, meta, r) {
  const base = `${name}-report-${stamp}`;
  writeFileSync(join(dir, base + ".json"), JSON.stringify({ category: name, ...meta, ...r }, null, 2));
  const rows = r.results.map((x) => `<tr><td class="${x.status}">${x.status.toUpperCase()}</td><td>${esc(x.name)}</td><td><pre>${esc(x.detail)}</pre></td></tr>`).join("");
  const extra = ["external", "server"].filter((k) => r[k]?.length).map((k) => `<h2>${k === "external" ? "External links (not fetched)" : "Links served by the backend (not in dist/)"}</h2><pre>${esc(r[k].join("\n"))}</pre>`).join("");
  writeFileSync(join(dir, base + ".html"), `<!doctype html><meta charset="utf-8"><title>${name} report</title><style>${PAGE_CSS}</style><h1>${name} report</h1><p>Run ${meta.timestamp} · commit ${meta.commit} · config ${meta.configHash}</p><table><tr><th>Result</th><th>Check</th><th>Detail</th></tr>${rows}</table>${extra}`);
  return base + ".html";
}

function writeDashboard(dir, stamp, meta, all) {
  const total = all.flatMap((a) => a.r.results);
  const passed = total.filter((x) => x.status === "pass").length;
  const rate = total.length ? Math.round((passed / total.length) * 1000) / 10 : 0;
  const rows = all.map(({ name, r, file }) => {
    const f = r.results.filter((x) => x.status === "fail").length;
    return `<tr><td>${name}</td><td class="${f ? "fail" : "pass"}">${f ? "FAIL" : "PASS"}</td><td>${r.results.length - f} / ${r.results.length}</td><td><a href="${file}">${file}</a></td></tr>`;
  });
  const budgets = all.flatMap((a) => a.r.metrics).map((m) => `<tr><td>${m.route}</td><td class="${m.scriptsKbGzip <= m.budgetKb ? "pass" : "fail"}">${m.scriptsKbGzip} KB</td><td>${m.budgetKb} KB</td></tr>`).join("");
  const cspR = all.find((a) => a.name === "csp")?.r.results || [];
  const cspFails = cspR.filter((x) => x.status === "fail").length;
  const ax = all.find((a) => a.name === "a11y")?.r.a11yCounts;
  const perfRows = (all.find((a) => a.name === "perf")?.r.perfMetrics || []).map((m) => {
    const cell = (v, b, u = "") => `<td class="${v <= b ? "pass" : "fail"}">${v}${u} / ${b}${u}</td>`;
    return `<tr><td>${m.route}</td>${cell(m.lcpMs, m.budgets.lcpMs, " ms")}${cell(m.cls, m.budgets.cls)}${cell(m.tbtMs, m.budgets.tbtMs, " ms")}</tr>`;
  }).join("");
  const file = `web-verification-dashboard-${stamp}.html`;
  writeFileSync(join(dir, file), `<!doctype html><meta charset="utf-8"><title>Web verification dashboard</title><style>${PAGE_CSS}</style><h1>Web verification dashboard</h1><p>Run ${meta.timestamp} · commit ${meta.commit} · config ${meta.configHash}</p><p><strong>Overall: ${rate}% passed</strong> (${passed} of ${total.length} checks)</p><h2>Categories</h2><table><tr><th>Category</th><th>Result</th><th>Checks passed</th><th>Report</th></tr>${rows.join("")}</table>`
    + `<h2>Script budgets (gzip, before first paint)</h2><table><tr><th>Page</th><th>Actual</th><th>Budget</th></tr>${budgets}</table>`
    + `<h2>CSP</h2><p>${cspR.length ? `${cspFails} page(s) with violations out of ${cspR.length} checked` : "not run"}</p>`
    + `<h2>Accessibility issues (elements)</h2><p>${ax ? Object.entries(ax).map(([k, v]) => `${k}: ${v}`).join(" · ") : "not run"}</p>`
    + `<h2>Performance (slow 3G, 4× slower CPU, phone screen)</h2><table><tr><th>Page</th><th>LCP / budget</th><th>CLS / budget</th><th>TBT / budget</th></tr>${perfRows}</table>`);
  return file;
}

// ---- main ----
const arg = process.argv[2];
const names = arg === "all" ? Object.keys(CATEGORIES) : [arg];
if (!names.every((n) => CATEGORIES[n])) {
  console.error(`Usage: node tests/verify/run.mjs <${Object.keys(CATEGORIES).join("|")}|all>`);
  process.exit(2);
}
let config;
try {
  config = loadConfig();
} catch (e) {
  console.error("Config check failed: " + e.message);
  process.exit(2);
}
const stamp = stampNow();
const meta = { timestamp: stamp, commit: gitCommit(), configHash: config.hash };
const dir = join(ROOT, "test-reports");
mkdirSync(dir, { recursive: true });
const all = [];
for (const name of names) {
  const r = await CATEGORIES[name](config);
  const file = writeReport(dir, name, stamp, meta, r);
  all.push({ name, r, file });
  for (const x of r.results) console.log(`${x.status === "pass" ? "ok  " : "FAIL"} [${name}] ${x.name}${x.status === "fail" && x.detail ? "\n       " + x.detail.replaceAll("\n", "\n       ") : ""}`);
}
if (arg === "all") console.log("Dashboard: test-reports/" + writeDashboard(dir, stamp, meta, all));
const failed = all.some((a) => a.r.results.some((x) => x.status === "fail"));
console.log(failed ? "Some checks failed." : "All checks passed.");
process.exit(failed ? 1 : 0);
