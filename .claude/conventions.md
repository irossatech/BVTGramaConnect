# Conventions: website and console

## Zero visual change

Both apps must look and behave exactly like the approved prototypes. Only these changes are allowed (BackEnd repo, `docs/prototype-inventory.md`, section 5.4, adapted for the Next.js app the owner approved on 22 Oct 2026):

1. The prototypes run as a Next.js static export. The markup is the prototype template converted one to one to JSX; the conversion rules live in `src/shared/dc.tsx`.
2. React, fonts, design-system CSS and images load from this site. The fonts are self-hosted (`public/fonts/`, `public/assets/fonts/`); nothing loads from Google.
3. Data wiring only in the logic class: mock values become `state` filled from the API. Loading and error states reuse what the page already has, such as the toast. No new layout.
4. Hard-coded values in the markup become `renderVals()` values.
5. Demo-only controls are removed or pointed at the real target.
6. Markup, inline styles, CSS files, fonts, images and animations stay as they are.
7. Website speed work the owner approved on 6 Nov 2026: WebP images at the size they are shown (`public/assets/*.webp`; the PNG/JPG originals stay for the console, favicon and share previews), woff2 fonts, phone/wide layouts in CSS through `rsp()` and the `gc-wide`/`gc-phone`/`gc-stick` classes (never `v.mobile` in markup), the hero's CSS entrance, scripts started after the first paint (`scripts/boot.js`), and the ticker label and header tagline colours for contrast.
8. Audit decisions the owner approved on 14 Nov 2026 (`.claude/audit-status.md`): search results in Telugu, like the pages (titles, descriptions and share text from `te.json`, each title ending in "Grama Connect"; WEB-SEO-001). English pages with their own addresses were not chosen. A visitor's language choice is remembered on their device (WEB-I18N-001). The news ticker pauses on a tap or keyboard focus as well as on hover (WEB-A11Y-001); there is no pause button. The website's own 404 page: header, footer, a message and a link home (WEB-SSG-001). A "Skip to main content" link, off screen until Tab reaches it, and focus moved to the new page's heading after a page change (WEB-A11Y-005). The console's category icons and logo as same-size WebP copies (WEB-PERF-002).

The console also has the documented additions listed in `architecture.md` ("Console"). Anything else, including new text or a new section, is a design change and needs the owner's sign-off first.

## Where to make a change

| Change | Edit | Then |
|---|---|---|
| Website behaviour and data | `src/website/Site.tsx` (state, methods, `renderVals()`) | `npm run build` |
| Website texts | `src/website/locales/te.json` and `en.json` (same keys; `legal` holds Privacy and Terms, `seo` the page titles and descriptions) | `npm run build` |
| Website markup | the section in `src/website/sections/` (look: `src/website/ui/`) | `npm run build` |
| Website fetch helper | `src/website/api.ts` | `npm run build` |
| Console behaviour, data, API calls | the screen's module in `src/console/logic/` if it has one (`messages.ts`, `requests.ts`, `ads.ts`), else `src/console/Console.tsx` (state, methods, `renderVals()`); state and form shapes in `src/console/model.ts`; API shapes in `src/console/types.ts` | `npm run build` |
| Console markup | the screen in `src/console/screens/`, panel in `panels/`, frame in `layout/`, shared bits in `ui/parts.tsx` | `npm run build` |
| Console fetch, session login, CSRF | `src/console/api.ts` | `npm run build` |
| Page `<head>`, page CSS, fonts | `src/website/SitePage.tsx` (website: titles, descriptions, structured data), `src/console/ConsolePage.tsx` (console), `src/shared/PageHead.tsx` | `npm run build` |
| Search engines: site address, sitemap, robots | `GC_SITE_URL` (default `https://www.gramaconnect.com`); `scripts/seo-files.mjs` writes sitemap.xml, robots.txt, llms.txt into dist/ | `npm run build` |
| API base URL | nothing; set `GC_API_BASE` in the environment or `.env` | `npm run build` |

`npm run dev` serves both pages with hot reload at http://localhost:3000/ and /console/, but API calls need the backend on the same origin; check the real thing through the backend's runserver.

## Writing markup

- Markup lives in section/screen components that take `v` (the class's `renderVals()` result, type `View`) and read `v.<key>`. Put logic in `renderVals()` or the class, not in the JSX; the class's `render()` only picks which sections, screens and panels show.
- Show text values with `{I(v.key)}`, so they render as the runtime did (`<span class="sc-interp">`).
- Loops: `{list(v.items).map((x, i) => (<React.Fragment key={i}>…</React.Fragment>))}`. Conditions: `{v.flag ? <>…</> : null}`.
- Inputs: `value={val(v.key, "")}` and `checked={val(v.key, false)}`.
- New console UI reuses an existing element's inline style: copy the pill button, input, card or table-row style from the nearest similar element. Add no stylesheet, class or font.

## Files you never edit

- `public/_ds/`: design-system files from the prototype.
- `src/console/ds.tsx` mirrors `_ds_bundle.js`; change it only if the design system changes. One approved difference (14 Nov 2026, WEB-PERF-002): its category icons load as `icon-<category>-120.webp`, same-size WebP copies of the PNGs.

## Text and languages (website)

- Every website text lives in `src/website/locales/te.json` and `en.json` under the same key; TypeScript fails the build if one language misses a key. Never write visible text (labels, aria-labels, alt text, titles, fallback values) in code: add a key to both files and read it (`v.t.<key>` in markup).
- Telugu is the default language (`lang: 'te'`).
- Files are UTF-8. Check Telugu on screen after every change.

## Console rules

- Keep the markup bound to the same keys; map API data into those shapes in the logic instead of changing the markup.
- Every request goes through `src/console/api.ts` (`this.api`). Do not call `fetch` directly. Report errors with `this.fail(e)`.
- Never store a token or password in `localStorage`, `sessionStorage` or a readable cookie. The console's only readable cookie is Django's `csrftoken`.
- The console only hides buttons. The backend enforces every permission.

## API changes

The BackEnd repo's `docs/api-contract.md` is the source of truth. If either app needs a new endpoint or field, the backend team adds it to the contract first; then update `.claude/api.md`.

## Checking a change

1. `npm run build` and open both apps through the backend's runserver.
2. Website: click every page in both languages at 375 px and 1280 px wide.
3. Console: log in as `super.admin` from `seed_sample_data` and click through every screen.
4. Watch the browser console: there must be no errors or React warnings.
5. `npm run typecheck` must print nothing (the build runs it too), and `npm test` must pass.
6. `npm run check-dist` must pass before you commit (see Git below). CI (`.github/workflows/ci.yml`) runs steps 5 and 6 and a fresh build on every push.

## Git

Commit straight to `dev`; this repo uses no feature branches or pull requests (owner decision, 22 Oct 2026). Promote `dev` to `qa` for UAT and `qa` to `main` for release. Never commit `.next/`, `node_modules/` or `.env`. Keep `package-lock.json` committed.

`dist/` is committed: the BackEnd repo's `deploy/deploy.sh` deploys the committed build as it is and does not rebuild (owner decision, 12 Nov 2026). So every commit that changes the source also carries its rebuilt `dist/`:

1. `npm run build`: the defaults are production's, so no `.env` is needed. It writes `dist/BUILD-STAMP.md` (a fingerprint of the source and the settings used; never deployed) and puts the committed APK back if the build dropped it.
2. `npm run check-dist`: fails if `dist/` is older than the source, was built with other than the production settings, or misses a page or the APK.
3. `git add -A dist` (the build renames its chunks, so old files are deleted and new ones added) and commit with the source.
