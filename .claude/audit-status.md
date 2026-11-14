# Audit status: website and console

Where every finding of the web audits stands, so a later audit starts from here instead of finding the same things again. Update a row in the same pull request that changes its status. The reports themselves are not in git (`audit-reports/`, kept by the web developer):

- WEB_01 Discovery and inventory, 2026-11-09 (commit `e8fe663`)
- WEB_02 Technical audit, 2026-11-09 (commit `e8fe663`)
- WEB_03 Console security, performance and personal data, 2026-11-09 (commit `e8fe663`)

**Statuses.** *Fixed*: changed in this repo (or the backend), with the commit or PR. *Decided*: the owner or lead chose an option; what was chosen and what was deliberately left out. *By design*: kept on purpose; the reason is the answer to a repeat finding. *Waiting*: needs the owner's or lead's decision first (do not build without it). *Backend*: lives in BVTGramaConnect_BackEnd; the web repo has nothing to change.

WEB_01 used its own numbers for some findings; they are the same findings as WEB_02's: WEB_01 SEC-002 = WEB-SEC-004, SEC-003 = WEB-SEC-006, I18N-001 = WEB-I18N-002, I18N-002 = WEB-I18N-005, OPS-003 = WEB-SEO-002, REPO-001 is listed below. WEB_03 carried several WEB_02 findings under the same numbers.

## Fixed

| Finding | What was done | Where |
|---|---|---|
| WEB-OPS-001 Build committed by hand | `dist/` stays committed (owner decision, 2026-11-12); `npm run check-dist` checks it matches the source and production settings, and CI runs it on every push | `996c81e`; `conventions.md` "Git" |
| WEB-QA-001 No tests or CI | `npm test` (node:test) for csv-parts, routes, locales and masking; `.github/workflows/ci.yml` runs typecheck, tests, check-dist and a fresh build | `996c81e` |
| WEB-SEC-001 CSP allowed `'unsafe-eval'` | Removed in the backend's Nginx template; production's hosting-panel Nginx must send the same header (BackEnd `docs/security-review.md`) | BackEnd PR #86 |
| WEB-SEC-002 Static files lost security headers | Every nested Nginx location re-includes the security headers | BackEnd PR #86 |
| WEB-SEC-006 JSON-LD not escaped | `<` escaped as `<` | `996c81e` |
| WEB-SEC-007 Geography CSV formulas | Cells starting `= + - @` are neutralised, as the server's `csvsafe.py` does | `c74dd61` |
| WEB-SEC-008 Data kept after logout | Logout, 401 and idle sign-out put the whole state back to its initial values | `c74dd61` |
| WEB-SEC-010 Ad links accepted `http://` | `https://` only, in the console and on the server | PR #9; BackEnd PR #95 |
| WEB-SEC-013 Polling kept the session alive | The console signs itself out after 30 minutes without input (`IDLE_MS`) | `c74dd61` |
| WEB-SEC-015 Bulk delete continued after 401 | Stops on 401/403 | `c74dd61` |
| WEB-SEC-017 Villages CSV size | The console refuses files over 20 MB before reading them (server side: Backend) | `c74dd61` |
| WEB-SEC-018 Pages shown for permissions the server refuses | `NAV_PERM` matches the backend's permissions | `c74dd61` |
| WEB-CQ-001 No stale-response guard | Each list and panel load takes a `ticket()`; only the latest may write | `c74dd61` |
| WEB-CQ-002 Silent catches | Failed loads show the existing toast | `c74dd61` |
| WEB-CQ-003 Object URLs not revoked | Previews are revoked when replaced or closed | `c74dd61` |
| WEB-CQ-004 Index keys | Data rows keyed by id: users, posts, toasts, contact messages, service requests, ads, important numbers, contact types. Audit entries have no id; fixed lists (tabs, website sections) never reorder, so index keys are right there | `c74dd61`, branch `fix/web02-no-decision` |
| WEB-CQ-005 Buttons shown without `allowed_actions` | No user buttons when the list is missing | `c74dd61` |
| WEB-ERR-001 Contact form ignored server field errors | The fields the server refuses are marked | `c74dd61` |
| WEB-ERR-002 Raw "Failed to fetch" | Network loss gives a plain message (status 0) | `c74dd61` |
| WEB-A11Y-002 Toasts not announced | Live region | `c74dd61` |
| WEB-A11Y-003 Confirm dialog semantics | `role="dialog"`, `aria-modal`, label | `c74dd61` |
| WEB-A11Y-004 Filters without labels | `aria-label` on every filter and search | `c74dd61` |
| WEB-A11Y-006 Icons, login semantics | Decorative icons `aria-hidden`, labels added | `c74dd61` |
| WEB-I18N-002 Empty locale values | A test fails on empty texts, with an allow-list of the intended ones | `c74dd61` |
| WEB-I18N-004 Console Telugu text without `lang` | Post text carries its language | `c74dd61` |
| WEB-DP-001 Personal data in console lists | Users: last 4 digits of the mobile; Service requests: name only; Contact messages: masked mobile, no message, View panel. Important numbers: shown in full on purpose, see Decided | PRs #6, #7, #8; BackEnd PRs #93, #94 |
| WEB-DP-004 Audit `data` with personal fields | The console does not keep `data`; the server masks personal data in audit entries | `c74dd61`; BackEnd `34e4b80` |
| WEB-DOC-001 Docs contradicted the code | `.claude/*.md`, README and comments reconciled | `996c81e`, `c74dd61`, branch `fix/web02-no-decision` |
| WEB-REACT-001 Whole site re-rendered every 3.2 s | The hero word's timer is its own small component (`RotatingWord`, words from `renderVals()`) | branch `fix/web02-no-decision` |
| WEB-SEO-002 Hand-kept page lists; one `lastmod` | Lists come from `routes.ts` and the exported files; the sitemap has no `lastmod` | `996c81e`, branch `fix/web02-no-decision` |
| WEB-ARCH-003 Two fetch wrappers | Shared `src/shared/http.ts` (API address, error object); each client keeps its own policy | branch `fix/web02-no-decision` |
| WEB-DEP-001 Node not pinned, caret ranges | `.nvmrc` (Node 24, as CI); dev dependencies pinned | `996c81e`, `c74dd61` |
| WEB-PERF-005 `404/index.html` not post-processed | `defer-hydration.mjs` processes every exported page | `996c81e` |
| WEB-PERF-001 Buttons inert until scripts load | `scripts/boot.js`: a button tapped before React starts is tapped again once it is ready (15 s at most); Contact form text typed before then is kept; a script that fails to download is fetched again (2 s, 6 s). Checked in Chrome at about 35 KB/s. Native fallbacks (`<details>`, a link list for the phone menu) were not needed | PR #10 |
| WEB-I18N-003 (clipping) Telugu hero word cut off | Measured in headless Chrome on 2026-11-14 at 375 and 1280 px: no Telugu hero word is clipped; the lowest stroke keeps 4.3 px (phone) and 8.3 px (desktop) to spare. No change needed. The small sizes: see Decided | measurement |
| WEB_01 REPO-001 `.DS_Store`, no `.gitattributes` | Untracked; `.gitattributes` added | `996c81e` |

## Decided

| Finding | Decision | Left out on purpose |
|---|---|---|
| WEB-SEO-001 English content has no URL; mixed language signals | 2026-11-14, option B: search results are Telugu like the pages (titles, descriptions, share-image text, structured data); every title ends in the English brand name "Grama Connect" | No English pages (`/en/…`) and no `hreflang`: English is reached only through the language switch. Revisit if English search traffic matters |
| WEB-I18N-001 Language forgotten on reload | 2026-11-14, option A: a switch to English is remembered on the visitor's own device (`localStorage` `gc-lang`, try/catch) and applied when the page starts. A language tap made before the scripts start (replayed by `boot.js`, PR #10) always means English, so it never undoes the saved choice | The exported HTML stays Telugu, so an English reader sees Telugu for a moment while the scripts load. No language in the URL, no cookie |
| WEB-A11Y-001 Moving content can't be paused | 2026-11-14, option B: the ticker pauses on a tap or keyboard focus (focusable, `role="region"`, labelled), as it did on mouse hover | No pause button (it would be visible and need new text). The hero word and the ring text keep moving; "reduce motion" stops all three. So WCAG 2.2.2 is met only in part, knowingly; a pause button needs the owner's sign-off |
| WEB-A11Y-005 No skip link; page changes not announced | 2026-11-14, option A: a "Skip to main content" link (`.gc-skip`, off screen until Tab reaches it; texts `ui.skipLink`) focuses `<main>`; after every page change (a link, Back or Forward) focus moves to the new page's `h1`, so screen readers read it out | Not on the first load (the browser starts at the top). No focus ring around `main` or the heading when they take focus |
| WEB-PERF-002 Console loads heavy images | 2026-11-14, option A: the console's category icons and logo load as same-size WebP copies (`icon-<category>-120.webp`, 2-4 KB instead of 16-28 KB, mean difference about 2/255; `logo-mark-192.webp`, lossless, pixel-identical, 37 KB instead of 48 KB) | The login photo stays `village-landscape.jpg`: as WebP at the same size and quality it is larger (167 KB against 151 KB). `logo-aadhaar.svg` (68 KB) stays as it is. The favicon and the structured-data logo stay PNG |
| WEB-ARCH-001 `Console.tsx` is one 3,130-line class | 2026-11-14: split screen by screen into `src/console/logic/` behind `ConsoleHost`, keeping the "logic class + `renderVals()`" rule; in progress (first step PR #14: Contact messages, Service requests, Ads; `Console.tsx` 3,395 to 2,480 lines). Backlog 18 lists what is left | The rendered HTML and server calls stay identical; nothing visible changes |
| WEB-PERF-003 Console ships every screen before the login form | 2026-11-14, option A: load the login and change-password screens first and the signed-in screens after login. Not built yet: it changes how `Console.tsx` starts, so it follows the split (WEB-ARCH-001; backlog 25) | Until then the whole console (about 175 KB compressed) loads before the login form |
| WEB-SEC-004 `npm run dev` points at production | 2026-11-14, option C: `.env.example` keeps the live server, and `npm run dev` prints a red "LIVE DATA" warning when it starts against it (`next.config.ts`, `warnIfLiveData`); the `.env.example` comment says so. `npm run dev` already refuses to run without `GC_DEV_API` | No test server as the default (options A and B). Developers decide per session; the warning is the safeguard |
| WEB-I18N-003 Small Telugu sizes | 2026-11-14, owner approved: the website's two smallest Telugu sizes go from 11.5 px (`xs`: kickers, small labels) and 12 px (`sm`: the ticker label, chips, tags) to 13 px (`ui()` in `src/website/ui/theme.ts`). Checked in headless Chrome on every page at 375 and 1280 px: nothing overflows or is cut off; phone pages grow by 20 to 40 px | English sizes stay the prototype's (12 and 13 px). Telugu body text (14 px) and headings are unchanged. The console is unchanged |
| WEB-SSG-001 Bare 404 page | 2026-11-14, option A: the site's own 404 page (`src/pages/404.tsx`, `sections/NotFound.tsx`): header, footer, a Telugu/English message and a link home; `noindex`. Nginx serves it through `error_page 404 /404.html` | Only for website addresses: `/api/`, `/console/` and `/media/` keep their own 404 answers. Production and qa use the hosting panel's Nginx, which must be set to the same 404 page (backlog 22) |
| WEB-DP-002 Names sent to Google Input Tools | 2026-11-14, lead: Telugu name suggestions stay on Google (`TRANSLITERATION_PROVIDER`) for every name field, people's names included; names are not treated as sensitive like mobile numbers (`.claude/project.md`) | Mobile numbers, emails and addresses are never sent there |
| WEB-DP-003 No retention limit | 2026-11-14, lead: data is kept permanently (contact messages, service requests, citizen phone records, posts, audit log); screens show only recent ones: contact messages 90 days, finished service requests 180 days, audit log 90 to 180 days (`.claude/project.md`) | No scheduled purge of these; only expired sessions and tokens, failed jobs, old failed-login records and read notifications are cleaned up |
| WEB-FUNC-001 New post to one area only | 2026-11-14, owner: keep the single "Who sees it" picker. All districts sends the post to everyone (every district and village); one district sends it to every mandal and village in that district; a mandal or village narrows it further. That covers how the Super Admin posts | No multi-area picker in the console (backlog 17 closed). Posts to several separate areas in one go are made from the mobile app, which already sends several `targets`; the server allows 1 to 200 |
| WEB-OPS-002 27 MB APK in git | 2026-11-14, option A: the APK stays committed in `dist/downloads/` (the server deploys only the committed `dist/`), until the app is on Google Play; then the APK and the "Direct download" link go and the store link takes over | No Git LFS and no separate server folder: each new APK adds about 27 MB to history, accepted while new APKs are rare |
| WEB-DP-001 (Important numbers) | 2026-11-14, owner: phones and emails in the Important numbers table stay in full. They are published to citizens on purpose so people can call them; masking them protects nothing and could hide a wrong number from the Super Admin (BackEnd `docs/security-review.md`, "Important numbers: public by design") | No masking in that table. Users, Service requests and Contact messages stay masked (see Fixed) |
| WEB-DP-005 Searches put names and mobiles in URLs | 2026-11-14, lead: accepted exception, the same as the backend. Searches stay `GET ?q=`; the server's Nginx log drops query strings (`gc_noquery` log format) | No move of person searches to POST |

## By design

| Finding | Why it stays |
|---|---|
| WEB-SEC-005 `style-src 'unsafe-inline'` | The prototype's inline styles are kept as they are (zero visual change); scripts stay `'self'` only |
| WEB-REACT-002 React Strict Mode off | The logic classes mount once, as the prototype runtime did; cleanup was checked by reading |
| WEB-I18N-005 / WEB_01 I18N-002 Console in English, text in code | The console is English only, as designed; only the website is bilingual |
| WEB-ARCH-002, WEB-SSG-002, WEB-SEC-009, WEB-SEC-012, WEB-SEC-020, WEB-DEP-002, WEB-DP-006, WEB_01 SEC-004, PERF-001, TYPE-001 | Found as done well; keep |
| WEB-PERF-004 Console pulls the Noto Telugu subset | One-time, cached; acceptable for desktop admins |

## Waiting for a decision

Do not build these without the owner's or lead's answer. Backlog numbers are in `.claude/backlog.md`.

| Finding | Question |
|---|---|
| WEB-DP-007 Temporary password left on the clipboard | A "clear the clipboard" note in the dialog (new text)? |

## Backend

Tracked by the backend team in BVTGramaConnect_BackEnd; nothing to change in this repo.

| Finding | What |
|---|---|
| WEB-SEC-003 / WEB-HDR-001 | Permissions-Policy and COOP headers; the CSP still allows `data:` fonts and images the build never uses (`deploy/templates/nginx-security.conf`) |
| WEB-HDR-002 | Caching headers on API answers with personal data |
| WEB-SEC-011 | Citizen block/discard checks only the post's first area |
| WEB-SEC-014 | Admin endpoints also accept the mobile app's JWT |
| WEB-SEC-016 | Removing a role assignment needs no specific permission |
| WEB-SEC-019 | Lockout per username and IP, so guessing from many IPs is not capped |
| WEB-SEC-017 (server side) | A size limit on the villages CSV import on the server |
