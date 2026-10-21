// Screenshot every page of the prototype and of the port at 375 and 1280 px.
// Pages are reached by clicking like a user: header nav on desktop, the menu on mobile.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const out = process.argv[2];
mkdirSync(out, { recursive: true });

const SITES = {
  prototype: "http://127.0.0.1:8199/Public%20Website.dc.html",
  port: "http://127.0.0.1:8101/",
};
const PAGES = [
  ["home", "హోమ్"],
  ["how", "ఇది ఎలా పనిచేస్తుంది"],
  ["officials", "అధికారుల కోసం"],
  ["faq", "ప్రశ్నలు"],
  ["contact", "సంప్రదించండి"],
  ["admin", null],
];
const WIDTHS = [375, 1280];

async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
}

async function openPage(page, width, label, key) {
  if (key === "admin") {
    await page.locator("footer button", { hasText: "అడ్మిన్ లాగిన్" }).click();
  } else if (width < 820) {
    await page.locator('header button[aria-label="Menu"]').click();
    await page.waitForTimeout(300);
    await page.locator("header nav button", { hasText: label }).first().click();
  } else {
    await page.locator("header nav button").getByText(label, { exact: true }).click();
  }
  await settle(page);
}

const browser = await chromium.launch();
const report = [];
for (const [site, url] of Object.entries(SITES)) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    for (const [key, label] of PAGES) {
      await page.goto(url);
      await settle(page);
      if (key !== "home") await openPage(page, width, label, key);
      await page.screenshot({ path: `${out}/${site}-${width}-${key}.png`, fullPage: true });
    }
    report.push({ site, width, errors });
    await context.close();
  }
}
await browser.close();
console.log(JSON.stringify(report, null, 1));
