// Screenshot every console screen: prototype vs port, 1440x900.
import { chromium } from "playwright";
import fs from "node:fs";

const OUT = process.argv[2];
// Usage: node console/tools/visual-check.mjs <out dir> <username> <password> (an account that already chose its own password)
const [USERNAME, PASSWORD] = process.argv.slice(3, 5);
fs.mkdirSync(OUT, { recursive: true });
const PROTO = "http://127.0.0.1:8198/Super%20Admin%20Console.dc.html";
const PORT = "http://127.0.0.1:8102/console/";
const PAGES = [
  ["dashboard", "Dashboard"],
  ["geography", "Geography"],
  ["users", "Users"],
  ["posts", "Posts & Moderation"],
  ["reports", "Reports"],
  ["audit", "Audit Log"],
  ["settings", "Settings"],
];
const errors = { proto: [], port: [] };

async function settle(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(800);
}

function watch(page, kind) {
  page.on("pageerror", (e) => errors[kind].push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors[kind].push("console: " + m.text()); });
}

async function tour(page, kind) {
  let n = 3;
  for (const [key, label] of PAGES) {
    await page.locator("button", { hasText: new RegExp("^\\s*" + label) }).first().click();
    await settle(page);
    await page.screenshot({ path: `${OUT}/${kind}-${String(n++).padStart(2, "0")}-${key}.png` });
    if (key === "users") {
      await page.getByText("+ Add User").first().click();
      await settle(page);
      await page.screenshot({ path: `${OUT}/${kind}-${String(n++).padStart(2, "0")}-add-user.png` });
      await page.locator("button", { hasText: /^Cancel$/ }).first().click().catch(() => {});
      await settle(page);
    }
    if (key === "posts") {
      await page.locator("tbody tr").first().click();
      await settle(page);
      await page.screenshot({ path: `${OUT}/${kind}-${String(n++).padStart(2, "0")}-post-panel.png` });
      await page.mouse.click(200, 450);
      await settle(page);
    }
  }
}

const browser = await chromium.launch();

// Prototype
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(page, "proto");
  await page.goto(PROTO);
  await settle(page);
  await page.screenshot({ path: `${OUT}/proto-01-login.png` });
  await page.locator("input[type=tel]").first().fill("9848000001");
  await page.getByText("Send OTP").first().click();
  await settle(page);
  await page.screenshot({ path: `${OUT}/proto-02-otp.png` });
  await page.getByText("Fill demo OTP").click();
  await page.getByText("Verify & continue").click();
  await settle(page);
  await tour(page, "proto");
  await page.close();
}

// Port: login and the forced change-password screen (the login answer is faked so no real password is spent)
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(page, "port");
  await page.route("**/api/v1/auth/session/login/", (route) =>
    route.fulfill({ json: { user: { id: "1", name: "Sita Mahalakshmi", username: "sita", must_change_password: true, permissions: ["web_admin.access_web_console"], role_assignments: [] } } }),
  );
  await page.goto(PORT);
  await settle(page);
  await page.screenshot({ path: `${OUT}/port-01-login.png` });
  await page.locator("input[name=username]").fill("sita");
  await page.locator("input[name=password]").fill("secret");
  await page.getByRole("button", { name: "Sign in ›" }).click();
  await settle(page);
  await page.screenshot({ path: `${OUT}/port-02-change-password.png` });
  await page.close();
}

// Port: signed in with a real Django session (login form, then every screen)
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  watch(page, "port");
  await page.goto(PORT);
  await settle(page);
  await page.locator("input[name=username]").fill(USERNAME);
  await page.locator("input[name=password]").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in ›" }).click();
  await settle(page);
  await page.waitForTimeout(1500);
  await tour(page, "port");
  await context.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/errors.json`, JSON.stringify(errors, null, 2));
console.log(JSON.stringify(errors, null, 2));
