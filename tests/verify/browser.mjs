// Browser categories of the Stage 6 suite (Jira BVTGC-7): CSP, website smoke, console E2E, accessibility and
// performance. Each starts the local test server (serve.mjs: dist/ with the production headers, and a FAKE API;
// never a real backend) and drives Chromium through Playwright. Called by run.mjs.
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { PAGES, pathOf } from "../../src/website/routes.ts";
import { startServer } from "./serve.mjs";

const SITE = () => PAGES.map((p) => pathOf(p));
const IGNORABLE = /Failed to load resource/; // an expected 401/400/404 from the fake API (logged by the browser)

function makeCheck() {
  const results = [];
  return { results, check: (name, ok, detail = "") => results.push({ name, status: ok ? "pass" : "fail", detail: String(detail) }) };
}

/** Runs fn(browser, server, check) with a fresh server and browser, always closing both. */
async function withBrowser(c, fn) {
  const server = await startServer(c);
  const browser = await chromium.launch();
  const out = makeCheck();
  try {
    const extra = await fn(browser, server, out.check);
    return { results: out.results, metrics: [], ...(extra || {}) };
  } catch (e) {
    out.check("category ran to the end", false, e?.stack || e);
    return { results: out.results, metrics: [] };
  } finally {
    await browser.close();
    await server.close();
  }
}

/** A page that records JS errors, console errors and CSP violations. lang: website language to start in. */
async function openPage(browser, lang) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  if (lang) await ctx.addInitScript((l) => { try { localStorage.setItem("gc-lang", l); } catch {} }, lang);
  await ctx.addInitScript(() => {
    window.__csp = [];
    document.addEventListener("securitypolicyviolation", (e) => window.__csp.push(`${e.violatedDirective} blocked ${e.blockedURI || "inline"}`));
  });
  const page = await ctx.newPage();
  const errors = [];
  const csp = [];
  page.on("pageerror", (e) => errors.push("JS error: " + e.message));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    if (/Content.Security.Policy/i.test(m.text())) csp.push(m.text());
    else if (!IGNORABLE.test(m.text())) errors.push("console: " + m.text());
  });
  return { ctx, page, errors, csp, cspEvents: () => page.evaluate(() => window.__csp || []).catch(() => []) };
}

const settle = (page) => page.waitForLoadState("networkidle").catch(() => {});

// ---- console helpers ----
async function signIn(page, url, user, password) {
  await page.goto(url + "/console/");
  await page.locator('input[name="username"]').fill(user);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}
const nav = (page) => page.locator('nav[aria-label="Console"] button.sa-navb');
const navLabels = async (page) => (await nav(page).allInnerTexts()).map((t) => t.replace(/\s+\d+$/, "").trim());
const toastSeen = (page, text) => page.getByText(text, { exact: false }).first().waitFor({ timeout: 5000 }).then(() => true, () => false);

// ---- categories ----
export function csp(c) {
  return withBrowser(c, async (browser, server, check) => {
    for (const r of [...SITE(), "/404.html"]) {
      const p = await openPage(browser, "te");
      await p.page.goto(server.url + r);
      await settle(p.page);
      const v = [...(await p.cspEvents()), ...p.csp];
      check(`no CSP violation: ${r}`, !v.length, v.join("\n"));
      await p.ctx.close();
    }
    // The console: the login screen, then every screen a Super Admin opens (the signed-in part is its own download).
    const p = await openPage(browser);
    const su = c.fake.users["test.super"];
    await signIn(p.page, server.url, "test.super", su.password);
    await nav(p.page).first().waitFor();
    for (const label of await navLabels(p.page)) {
      await nav(p.page).filter({ hasText: label }).first().click();
      await settle(p.page);
    }
    const v = [...(await p.cspEvents()), ...p.csp];
    check("no CSP violation: /console/ (login and every screen)", !v.length, v.join("\n"));
    check("every console screen opens without a JS error", !p.errors.length, p.errors.join("\n"));
    await p.ctx.close();
  });
}

export function smoke(c) {
  return withBrowser(c, async (browser, server, check) => {
    for (const lang of ["te", "en"]) {
      for (const r of SITE()) {
        const p = await openPage(browser, lang);
        const res = await p.page.goto(server.url + r);
        await settle(p.page);
        const title = await p.page.title();
        const h1 = await p.page.locator("h1").count();
        const htmlLang = await p.page.getAttribute("html", "lang");
        const body = await p.page.locator("body").innerText();
        const bad = ["undefined", "[object Object]", "NaN"].filter((w) => new RegExp(`(^|\\s)${w.replace(/[[\]]/g, "\\$&")}(\\s|$)`).test(body));
        check(`${lang} ${r}: status 200, title, h1`, res?.status() === 200 && !!title.trim() && h1 >= 1, `status ${res?.status()}, title "${title}", h1 ×${h1}`);
        check(`${lang} ${r}: <html lang="${lang}"> after the language choice`, htmlLang === lang, `found ${htmlLang}`);
        check(`${lang} ${r}: no missing text (undefined / [object Object] / NaN)`, !bad.length, bad.join(", "));
        check(`${lang} ${r}: no JS or console errors`, !p.errors.length, p.errors.join("\n"));
        await p.ctx.close();
      }
    }
    // The newest posts load only for the home page's ticker: another page does not ask for them, and moving to the home
    // page from it (no new page load) does, and shows them (audit WEB-PERF-102).
    const asked = () => server.log.filter((x) => x.path === "/public/showcase/").length;
    const q = await openPage(browser, "te");
    const before = asked();
    await q.page.goto(server.url + "/contact/");
    await settle(q.page);
    check("contact page: the home ticker's posts are not downloaded", asked() === before, `${asked() - before} request(s)`);
    await q.page.locator('header a[href="/"]').first().click();
    const shown = await q.page.getByText(c.fake.showcase.featured.title).first().waitFor({ timeout: 8000 }).then(() => true, () => false);
    check("home page opened from another page: the newest posts load and show", asked() > before && shown, `requests ${asked() - before}, shown ${shown}`);
    await q.ctx.close();

    const p = await openPage(browser, "te");
    const res = await p.page.goto(server.url + "/no-such-page/");
    check("unknown address: the site's 404 page with status 404", res?.status() === 404 && (await p.page.locator("h1").count()) >= 1, `status ${res?.status()}`);
    await p.ctx.close();
  });
}

export function consoleE2E(c) {
  return withBrowser(c, async (browser, server, check) => {
    const U = c.fake.users;
    const fresh = () => openPage(browser);

    // 1. Login success: the Super Admin sees every screen its permissions allow.
    let p = await fresh();
    await signIn(p.page, server.url, "test.super", U["test.super"].password);
    const ok = await nav(p.page).first().waitFor({ timeout: 8000 }).then(() => true, () => false);
    check("login: a Super Admin signs in and sees the console", ok);
    const got = ok ? await navLabels(p.page) : [];
    check("roles: the Super Admin sees exactly its screens", [...got].sort().join("|") === [...U["test.super"].nav].sort().join("|"), `saw: ${got.join(", ")}`);

    // 1b. BVTGC-75: the Users list asks without full contact details and shows the last 4 digits; View reads the
    // official in full (GET /users/{id}/) and shows the whole mobile and email.
    await nav(p.page).filter({ hasText: "Users" }).first().click();
    const masked = await p.page.getByText("+91 ******3210").first().waitFor({ timeout: 5000 }).then(() => true, () => false);
    const listCall = server.log.filter((x) => x.path === "/users/").at(-1);
    check("Users list: asked with contact=0, the row shows '+91 ******3210'", masked && listCall?.query.contact === "0", `query: ${JSON.stringify(listCall?.query)}`);
    await p.page.getByRole("button", { name: "View Ravi Kumar" }).click();
    const fullShown = await p.page.getByText("+91 9876543210").first().waitFor({ timeout: 5000 }).then(() => true, () => false);
    check("user panel: the full mobile and email from GET /users/55/", fullShown && (await p.page.getByText("ravi@example.org").count()) > 0 && server.log.some((x) => x.path === "/users/55/"));
    await p.page.keyboard.press("Escape");

    // 2. Logout ends the session: back to the login form, and a reload stays there.
    await p.page.getByRole("button", { name: /Test Super Admin/ }).click();
    await p.page.getByRole("button", { name: "Logout", exact: true }).click();
    const back = await p.page.locator('input[name="username"]').waitFor({ timeout: 5000 }).then(() => true, () => false);
    await p.page.reload();
    await settle(p.page);
    const stays = (await p.page.locator('input[name="username"]').count()) === 1 && (await nav(p.page).count()) === 0;
    check("logout: back to the login form, and a reload does not sign in again", back && stays);
    check("no JS errors (Super Admin session)", !p.errors.length, p.errors.join("\n"));
    await p.ctx.close();

    // 3. Wrong password: the message, and the password field is cleared.
    p = await fresh();
    await signIn(p.page, server.url, "test.super", "wrong-" + U["test.super"].password);
    check("wrong password: 'Wrong username or password.'", await toastSeen(p.page, "Wrong username or password."));
    check("wrong password: the password field is cleared", (await p.page.locator('input[name="password"]').inputValue()) === "");
    await p.ctx.close();

    // 4. Not a console user (a District Admin): refused with the console's own message.
    p = await fresh();
    await signIn(p.page, server.url, "test.district", U["test.district"].password);
    check("not a console user: 'This console is for Super Admins only'", await toastSeen(p.page, "This console is for Super Admins only"));
    check("not a console user: no console shown", (await nav(p.page).count()) === 0);
    await p.ctx.close();

    // 5. Lockout after the configured failures: the next try says how long to wait.
    p = await fresh();
    for (let i = 0; i < c.fake.lockoutAfter; i++) {
      await signIn(p.page, server.url, "test.district", "wrong-" + i);
      await toastSeen(p.page, "Wrong username or password.");
    }
    await signIn(p.page, server.url, "test.district", "wrong-again");
    check(`lockout: after ${c.fake.lockoutAfter} failures, 'Too many failed attempts. Try again in 15 minutes.'`, await toastSeen(p.page, "Too many failed attempts. Try again in 15 minutes."));
    await p.ctx.close();

    // 6. Limited admin: only its screens; a forbidden page asked for by address is not opened.
    p = await fresh();
    await p.page.goto(server.url + "/console/#" + U["test.limited"].forbiddenPage);
    await p.page.locator('input[name="username"]').fill("test.limited");
    await p.page.locator('input[name="password"]').fill(U["test.limited"].password);
    await p.page.getByRole("button", { name: "Sign in", exact: true }).click();
    await nav(p.page).first().waitFor({ timeout: 8000 }).catch(() => {});
    const lim = await navLabels(p.page);
    check("roles: a limited admin sees only its screens", [...lim].sort().join("|") === [...U["test.limited"].nav].sort().join("|"), `saw: ${lim.join(", ")}`);
    const current = await p.page.locator('nav[aria-label="Console"] [aria-current="page"]').innerText().catch(() => "");
    check(`forbidden page by address (#${U["test.limited"].forbiddenPage}): not opened, first allowed page instead`, current.trim().startsWith(U["test.limited"].nav[0]), `current: ${current}`);
    await p.page.evaluate((h) => (window.location.hash = h), U["test.limited"].forbiddenPage);
    await p.page.waitForTimeout(500);
    const after = await p.page.locator('nav[aria-label="Console"] [aria-current="page"]').innerText().catch(() => "");
    check("forbidden page typed while signed in: stays on the allowed page", after.trim() === current.trim(), `now: ${after}`);

    // 7. Session ended on the server (idle timeout, logout elsewhere): the next call returns to the login form.
    server.expireSessions();
    await nav(p.page).filter({ hasText: U["test.limited"].nav[1] }).first().click();
    check("session ended on the server: 'Your session has ended. Log in again.'", await toastSeen(p.page, "Your session has ended"));
    check("session ended on the server: back to the login form", await p.page.locator('input[name="username"]').waitFor({ timeout: 5000 }).then(() => true, () => false));
    await p.ctx.close();

    // 7b. BVTGC-102: an ended session is noticed by the bell's minute check alone, with nobody clicking.
    p = await fresh();
    await p.page.clock.install();
    await signIn(p.page, server.url, "test.super", U["test.super"].password);
    await nav(p.page).first().waitFor({ timeout: 8000 });
    server.expireSessions();
    await p.page.clock.fastForward(61000);
    const alone = await p.page.locator('input[name="username"]').waitFor({ timeout: 5000 }).then(() => true, () => false);
    check("session ended: the minute check alone returns to the login form, no click (BVTGC-102)", alone);
    await p.ctx.close();

    // 8. CSRF: every unsafe request carried the csrftoken cookie's value as X-CSRFToken.
    const unsafe = server.log.filter((x) => x.unsafe);
    const missing = unsafe.filter((x) => !x.csrfOk).map((x) => `${x.method} ${x.path}`);
    check(`CSRF token sent on every unsafe request (${unsafe.length} requests)`, unsafe.length > 0 && !missing.length, missing.join("\n"));
  });
}

export function a11y(c) {
  return withBrowser(c, async (browser, server, check) => {
    const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
    const scan = async (name, page) => {
      // Sections fade in as they come into view: scan the colours they end with, not half-way through a fade
      // (the turning ring never ends and is skipped).
      await page.evaluate(() => Promise.race([
        Promise.all(document.getAnimations().filter((a) => a.effect?.getComputedTiming().endTime !== Infinity).map((a) => a.finished.catch(() => {}))),
        new Promise((r) => setTimeout(r, 5000)),
      ]));
      const r = await new AxeBuilder({ page }).analyze();
      for (const v of r.violations) counts[v.impact] = (counts[v.impact] || 0) + v.nodes.length;
      const failing = r.violations.filter((v) => c.a11yFailOn.includes(v.impact));
      const others = r.violations.filter((v) => !c.a11yFailOn.includes(v.impact));
      const fmt = (v) => `${v.impact} ${v.id} (${v.nodes.length}×): ${v.help} — ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`;
      check(`no ${c.a11yFailOn.join("/")} accessibility issues: ${name}`, !failing.length, [...failing.map(fmt), ...others.map((v) => "(not failing) " + fmt(v))].join("\n"));
    };
    for (const lang of ["te", "en"]) {
      for (const r of SITE()) {
        const p = await openPage(browser, lang);
        await p.page.goto(server.url + r);
        await settle(p.page);
        await scan(`${lang} ${r}`, p.page);
        await p.ctx.close();
      }
    }
    const p = await openPage(browser);
    await p.page.goto(server.url + "/console/");
    await p.page.locator('input[name="username"]').waitFor();
    await scan("console login", p.page);
    await signIn(p.page, server.url, "test.super", c.fake.users["test.super"].password);
    await nav(p.page).first().waitFor();
    await settle(p.page);
    await scan("console dashboard (signed in)", p.page);
    await p.ctx.close();
    return { a11yCounts: counts };
  });
}

export function perf(c) {
  return withBrowser(c, async (browser, server, check) => {
    const metrics = [];
    const { network: n, cpuSlowdown, budgets: b } = c.perf;
    // One load is noisy on a shared machine (blocking time varied by 300 ms between runs): each page loads `runs` times
    // and the median of each measure is checked, as Lighthouse CI does.
    const runs = Math.max(1, c.perf.runs || 1);
    const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
    for (const r of c.perf.pages) {
      const samples = [];
      for (let i = 0; i < runs; i++) samples.push(await loadOnce(r));
      const row = { route: r, lcpMs: median(samples.map((x) => x.lcpMs)), cls: median(samples.map((x) => x.cls)), tbtMs: median(samples.map((x) => x.tbtMs)) };
      metrics.push({ ...row, budgets: b, samples });
      const all = (k) => `runs: ${samples.map((x) => x[k]).join(", ")}`;
      check(`${r}: LCP ${row.lcpMs} ms ≤ ${b.lcpMs} (median of ${runs})`, row.lcpMs > 0 && row.lcpMs <= b.lcpMs, all("lcpMs"));
      check(`${r}: CLS ${row.cls} ≤ ${b.cls} (median of ${runs})`, row.cls <= b.cls, all("cls"));
      check(`${r}: TBT ${row.tbtMs} ms ≤ ${b.tbtMs} (median of ${runs})`, row.tbtMs <= b.tbtMs, all("tbtMs"));
    }
    return { perfMetrics: metrics };

    async function loadOnce(r) {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
      await ctx.addInitScript(() => {
        window.__perf = { lcp: 0, cls: 0, tbt: 0 };
        new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__perf.lcp = e.startTime))).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__perf.cls += e.value; })).observe({ type: "layout-shift", buffered: true });
        new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__perf.tbt += Math.max(0, e.duration - 50)))).observe({ type: "longtask", buffered: true });
      });
      const page = await ctx.newPage();
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: n.latencyMs, downloadThroughput: (n.downloadKbps * 1024) / 8, uploadThroughput: (n.uploadKbps * 1024) / 8 });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpuSlowdown });
      await page.goto(server.url + r, { waitUntil: "load", timeout: 120000 });
      await page.waitForTimeout(3000);
      const m = await page.evaluate(() => window.__perf);
      await ctx.close();
      return { lcpMs: Math.round(m.lcp), cls: Math.round(m.cls * 1000) / 1000, tbtMs: Math.round(m.tbt) };
    }
  });
}
