# Web Stage 6: verification and regression suite

| | |
|---|---|
| Report | WEB_06_TEST_SUITE_REPORT, V1 (completed 2026-11-23 20:57 IST) |
| Date (IST) | 2026-11-23 20:15:45, first part; 20:57:01, full run |
| Repo | BVTGramaConnect, branch `dev`, commit `8a8f18f` plus uncommitted work |
| Auditor | Claude (AI-assisted audit), stage 6 |
| Jira | BVTGC-7 |

## 1. Summary

Eight categories are built and run:

- build
- i18n
- links
- CSP
- website smoke
- console E2E
- accessibility
- performance

**First full run: 135 of 144 checks pass. After the fixes the same evening (section 8): 146 of 146.**

The 9 failing checks are real findings in the site, not faults in the tests: colour contrast on 3 website and console screens, and layout shift and main-thread blocking on a slow phone (section 5).

- The browser checks run against `dist/`, served locally with the production security headers and a **fake API**. The owner chose this on 2026-11-23 instead of staging accounts. No test ever reaches a real server.
- No application code changed: nothing in `src/`, `scripts/`, `public/`, `next.config` or `tsconfig`.
- Visual regression (category 9) was not built. It is optional and needs a separate yes.

## 2. Structure created

| File | Purpose |
|---|---|
| `tests/config/web-verify.json` | Every setting the suite uses:<ul><li>pages, SEO files and script budgets;</li><li>the production security headers, copied from BackEnd `deploy/templates/nginx-security.conf` with `CSP_SCRIPT_EXTRA` empty, as in production;</li><li>the network and CPU profile and the performance budgets;</li><li>the accessibility impact levels that fail a check;</li><li>the fake API's answers and its three fake accounts.</li></ul> |
| `tests/verify/run.mjs` | The runner. It checks the config first: it refuses to run if a key or a fake account's password is missing, or if `dist/` is not built. It writes the reports and the dashboard. Build, i18n and links need no browser. |
| `tests/verify/serve.mjs` | The local server. It serves `dist/` the way Nginx does: the security headers, gzip, `/x/` → `x/index.html`, and unknown paths → `404.html` with status 404. Under `/api/v1/` it is a fake backend with a Django-like session:<ul><li>a `csrftoken` cookie, and every unsafe request is refused without a matching `X-CSRFToken` header;</li><li>an HttpOnly `sessionid` cookie;</li><li>lockout after the configured number of failed logins;</li><li>`not_console_user` for an account without the console permission;</li><li>empty answers in the shapes the API contract gives.</li></ul> |
| `tests/verify/browser.mjs` | The 5 browser categories, using Playwright and Chromium. |
| `package.json` | Scripts `test:build`, `test:i18n`, `test:links`, `test:csp`, `test:smoke`, `test:console`, `test:a11y`, `test:perf` and `test:all`, plus the devDependencies below. |
| `.gitignore` | `test-reports/` |

### devDependencies (owner's approval, 2026-11-23)

| Package | Version | Why |
|---|---|---|
| `@playwright/test` | 1.65.1 (exact) | Drives Chromium for the CSP, smoke, console, accessibility and performance checks. |
| `@axe-core/playwright` | 4.14.0 (exact) | The accessibility scan. |

Lighthouse was approved but **not added**. The performance check measures LCP, CLS and blocking time with the browser's own performance API, under Chrome's network and CPU slowdown, so a third package was not needed. `npm audit`: 0 vulnerabilities.

### Reports

Each run writes `test-reports/<category>-report-<YYYY-MM-DD_HH-mm-ss>.json` and `.html`, recording the timestamp, the git commit and the config hash, and never overwrites an earlier run.

`test:all` also writes `web-verification-dashboard-<timestamp>.html`, which shows:

- the overall pass rate;
- pass or fail for each category, with a link to its report;
- script budgets against actual sizes;
- CSP violations;
- accessibility issue counts by impact;
- LCP, CLS and blocking time against their budgets.

## 3. Categories and first full run (2026-11-23 20:57)

| # | Category | What it checks | Result |
|---|---|---|---|
| 1 | build | <ul><li>Every page exists.</li><li>The sitemap and `llms.txt` list every public page.</li><li>`robots.txt` names the sitemap.</li><li>No inline scripts and no source maps.</li><li>Script budgets: website 140.5 KB of 155 KB gzip; console 143.3 KB of 160 KB.</li></ul> | 26 / 26 pass |
| 2 | CSP | <ul><li>Each website page and the 404 page load under the production CSP.</li><li>The console's login, and all 12 screens a Super Admin opens, also load under it.</li><li>The checks listen for CSP violation events and console messages.</li><li>Every console screen opens without a JS error.</li></ul> | 10 / 10 pass: **no CSP violations** |
| 3 | i18n | <ul><li>`te.json` and `en.json` have the same keys.</li><li>`<html lang>` is right in every built page.</li><li>In the browser (category 5), every page in both languages shows no `undefined`, `[object Object]` or `NaN`, and `<html lang>` follows the language chosen.</li></ul> | 10 / 10 pass |
| 4 | links | Every internal link and file reference in the 10 HTML files resolves. | 1 / 1 pass |
| 5 | website smoke | Each of the 7 pages, in Telugu and in English, at 1280 px:<ul><li>status 200, a title and an `h1`;</li><li>the right `lang`;</li><li>no missing text;</li><li>no JS or console errors.</li></ul>An unknown address gets the site's 404 page with status 404. | 57 / 57 pass |
| 6 | console E2E (fake API) | <ul><li>Login success.</li><li>Wrong password: the message, and the password field is cleared.</li><li>A District Admin is refused with "This console is for Super Admins only".</li><li>After 5 failures: "Too many failed attempts. Try again in 15 minutes."</li><li>Logout returns to the login form, and a reload does not sign in again.</li><li>A session ended on the server: "Your session has ended" and the login form.</li><li>The Super Admin sees exactly its 12 screens; a limited admin sees only Dashboard and Reports.</li><li>A forbidden page (`#users`) is not opened, whether asked for at login or typed later.</li><li>The CSRF token is sent on every unsafe request (11 requests).</li></ul> | 15 / 15 pass |
| 7 | accessibility (axe) | Each of the 7 pages in both languages, the console login and the signed-in console. A `serious` or `critical` issue fails the check. | 10 / 16 pass: see WEB-A11Y-101 to 103 |
| 8 | performance | `/`, `/faq/` and `/contact/` on a phone screen (390 px). Slow 3G: 400 ms latency, 400 kbps both ways. CPU 4× slower. Budgets: LCP ≤ 6000 ms, CLS ≤ 0.1, blocking time ≤ 600 ms. | 6 / 9 pass: see WEB-PERF-101 and 102 |
| 9 | visual regression | Optional; not built. | — |

**Total: 135 / 144 (93.8%).**

### Measured performance

| Page | LCP | CLS | Blocking time |
|---|---|---|---|
| `/` | 2424 ms | **0.137** | **633 ms** |
| `/faq/` | 1980 ms | 0.035 | **668 ms** |
| `/contact/` | 2180 ms | 0.075 | 499 ms |

Blocking time varies from run to run, by up to about 350 ms: an earlier run measured 979 ms on `/`.

### Accessibility issue counts (elements)

| Impact | Elements |
|---|---|
| critical | 0 |
| serious | 31 |
| moderate | 10 |
| minor | 0 |

## 4. Coverage

**Routes:**

- All 7 website routes from `routes.ts`, in both languages;
- `/404.html`, and an unknown address;
- `/console/`: the login screen and all 12 signed-in screens.

**Console roles (fake accounts):**

| Account | Permissions | What it proves |
|---|---|---|
| Super Admin | Every screen | Sees all 12 screens |
| Limited admin | Console, plus Dashboard and Reports only | Sees only those 2 screens; forbidden pages stay closed |
| District Admin | No console permission | Refused at login |

The real permission checks run on the server; the console only hides screens, and these tests prove that hiding.

## 5. Findings

| ID | Severity | Finding | Where | Suggested action |
|---|---|---|---|---|
| WEB-A11Y-101 | Medium | Text colour contrast below WCAG AA, 2 elements per page and in both languages. **How it works:** the 3rd and 4th steps' small labels. **Contact:** two small labels in the office details. | `/howitworks/`, `/contact/` | Darken those text colours, the way the ticker label and header tagline were darkened on 6 Nov 2026. It is a visual change, so the owner must sign off. |
| WEB-A11Y-102 | Medium | Console contrast: the sidebar group labels "Content", "Citizens" and "Admin" are drawn at 45% white on the dark sidebar. With other pale grey labels, that makes 22 elements on the dashboard. | Console, signed in | Raise the labels' opacity, for example to 70%. Owner's sign-off, since it is prototype styling. |
| WEB-A11Y-103 | Low | One grey line on the console login fails contrast. | Console login | Same as above. |
| WEB-A11Y-104 | Info (moderate) | Console pages have no `h1` and no `main` landmark on the login screen. The "How it works" heading levels skip from h2 to h3 inside a step. | Console, `/howitworks/` | With the owner's sign-off, change the markup only; nothing changes visually. |
| WEB-PERF-101 | Medium | On a slow phone the home page shifts its layout while loading: CLS 0.137, against the 0.1 that Google counts as "good". | `/` | Find the element that moves (likely the hero or the live phone picture when the showcase loads) and give it a fixed size. |
| WEB-PERF-102 | Low | The main thread is blocked for 633–979 ms on `/` and 668 ms on `/faq/`, with a 4× slower CPU, against a 600 ms budget. `/contact/` is within budget (499 ms). | `/`, `/faq/` | Check what runs at start (React hydration and the hero). Or, if the owner accepts it for budget phones, raise the budget. |
| WEB-TEST-101 | Info | One API answer in an unexpected shape takes down the whole signed-in console with "Application error". The suite found this when its fake answer was not a list; the real server follows the contract, so it is not a live bug. | `src/console` (no error boundary) | Optional: an error boundary around each screen would keep a single screen's failure from blanking the console. |

No functional bugs were found: login, roles, CSRF, CSP, pages, languages and links all behave as the contract and the owner's decisions say.

## 6. How to run, and CI

```
npm ci
npx playwright install chromium     # once per machine (about 150 MB)
npm run build
npm run test:all                    # or any single test:<category>
```

`test:build`, `test:i18n` and `test:links` need no browser. The browser categories take about 3 minutes.

**In CI** (`.github/workflows/ci.yml`), add these steps after the build:

```
npx playwright install --with-deps chromium
npm run test:all
```

Then upload `test-reports/` as an artifact. This needs no secrets and no network beyond the browser download.

The workflow is not changed here, and the performance budgets may need loosening on shared CI machines. Both are the owner's call.

## 8. Fixes, and the run after them (2026-11-23 22:13 IST)

The findings in section 5 were fixed the same evening, at the developer's request. Details are in `.claude/audit-status.md`, under Fixed.

| Finding | Fix |
|---|---|
| WEB-A11Y-101 | Small green labels use the site's existing darker text green, `#1d7a33`. The Mandal level name is `#077c88`. |
| WEB-A11Y-102/103 | The console grey is now `#647182` in all 184 places. Sidebar group labels are at 50% white. The app's `AppColors.muted` got the same shade. |
| WEB-PERF-101 | "Telugu UI" now loads with `font-display: optional`, with the phone's own Noto Sans Telugu at the same metrics until the font is cached. The 124 KB web copy of Noto Sans Telugu was removed from the website's font lists. The hero heading keeps the height of its longest rotating word. |
| WEB-PERF-102 | Several changes:<ul><li>Post dates are worked out by arithmetic instead of a new `Intl.DateTimeFormat` per post.</li><li>The newest posts are downloaded on the home page only.</li><li>The reveal set-up runs in its own task.</li><li>`boot.js` starts the scripts one by one, each in its own task.</li></ul> |
| WEB-TEST-101 | Not changed. It is optional, and the real API follows the contract. |

### Suite changes

- **Accessibility:** the scan waits for fade-ins to finish, so it checks the colours visitors actually end up seeing.
- **Performance:** checks the median of 3 page loads. A single load varied by up to 300 ms on this machine.
- **Smoke:** 2 new checks. The Contact page does not download the home ticker's posts, and opening Home from it loads and shows them.
- **Unit tests:** `tests/dates.test.mjs` checks the new date arithmetic against Intl for about 1,250 times across 2026, including midnight and month ends.

**Result: 146 of 146 checks pass.**

| Category | Result |
|---|---|
| build | 26/26 |
| CSP | 10/10 |
| i18n | 10/10 |
| links | 1/1 |
| smoke | 59/59 |
| console | 15/15 |
| accessibility | 16/16: 0 serious, 0 critical; 10 moderate structure notes remain (WEB-A11Y-104) |
| performance | 9/9 |

`npm test`: 24 of 24 pass.

### Performance after the fixes (median of 3)

| Page | LCP | CLS | Blocking time |
|---|---|---|---|
| `/` | 2664 ms | 0.015 (was 0.137) | 597 ms (was 633–979) |
| `/faq/` | 2100 ms | 0 | 555 ms |
| `/contact/` | 2468 ms | 0.001 | 524 ms |

Across the runs after the fixes, home-page blocking time measured 500–600 ms. That is just inside the 600 ms budget, and what remains is React's own start-up of the page. A further cut would need the page hydrated in parts; that is a larger change with a risk of a visible flash, so it is not done here.
