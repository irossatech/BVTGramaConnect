# Architecture: website and console

One repo, one Next.js app, two pages, one build.

| App | Page | Component | Built to | Served at |
|---|---|---|---|---|
| Public website | `src/pages/index.tsx`, `src/pages/[page].tsx` (via `src/website/SitePage.tsx`) | `src/website/Site.tsx` | `dist/index.html`, `dist/<page>/index.html` | `/`, `/howitworks/`, `/officials/`, `/faq/`, `/contact/`, `/privacy/`, `/terms/` |
| Super Admin console | `src/pages/console/index.tsx` (via `src/console/ConsolePage.tsx`) | `src/console/Console.tsx` | `dist/console/index.html` | `/console/` |

## Folder map

```
src/
  pages/                    routes only (Next.js Pages Router); each file just renders a page shell
    index.tsx               /              website home
    [page].tsx              /howitworks/, /officials/, /faq/, /contact/, /privacy/, /terms/
    console/index.tsx       /console/      Super Admin console
    _document.tsx           <html lang>, no machine translation on the website

  website/                  public website
    Site.tsx                state and logic; render() only picks the sections
    SitePage.tsx            page <head>: titles, descriptions, structured data, page CSS
    sections/               what you see, one file per part
      Header.tsx  Footer.tsx
      Home.tsx              → home/Hero, Services, DayInVillage, Steps, Audiences, Download
      HowItWorks.tsx  Officials.tsx  Faq.tsx  Contact.tsx  Legal.tsx
    content/                the words
      strings.ts            every text, Telugu and English (TypeScript checks both have the same keys)
      legal.ts              Privacy policy and Terms
    ui/
      theme.ts              colours and text styles
      parts.tsx             pieces several sections use (store buttons, steps, ticks, tricolour)
    routes.ts               the pages and their addresses
    api.ts                  server calls (GCApi.get/post)

  console/                  Super Admin console
    Console.tsx             state and logic; render() only picks the screen and panels
    ConsolePage.tsx         page <head> (noindex), page CSS; loads Console client-only
    layout/                 AuthLayout (sign-in frame), Sidebar, TopBar
    screens/                one file per screen: Login, ChangePassword, Dashboard, Geography, Users, Posts,
                            Reports, Audit, Messages, Requests, Services (and bills), ServiceTabs, Ads,
                            Numbers, Settings, Checking
    panels/                 side panels, forms and dialogs: DetailPanel (PostDetail, UserDetail), UserDrawer,
                            RequestPanel, ServiceForm, AdForm, NumberForm, TypeForm, ConfirmModal,
                            ImportProgress, Toasts
    ui/parts.tsx            pieces several screens use (TickBox, SelBar, Pager, DistrictOptions)
    types.ts                the API data the console reads and sends
    api.ts                  server calls (session login, CSRF header, downloads)
    csv-parts.ts            CSV import: checks the file and splits it into parts
    ds.tsx                  Badge and IconBadge from the design system

  shared/                   used by both apps
    PageHead.tsx            <head>: viewport, design-system stylesheets, Google Fonts, SEO tags
    dc.tsx                  I(), css(), list(), val(): the rendering rules of the old runtime
    config.ts               { apiBase, siteUrl } from GC_API_BASE / GC_SITE_URL at build time
  types/react-css.d.ts      lets inline styles set CSS custom properties ("--d")
  proxy.dev.ts              `npm run dev` only: forwards /api/ and /media/ to GC_DEV_API
public/
  _ds/grama-connect/        design-system CSS and tokens from the prototype (never edit)
  assets/                   logo, photos, icons, share image (og-image.jpg), fonts/
scripts/seo-files.mjs       after the build: dist/robots.txt, sitemap.xml, llms.txt for GC_SITE_URL
next.config.ts              static export to dist/, build settings
tsconfig.json               TypeScript, strict
```

## How the components are built

Both apps were Design Canvas pages (an HTML template plus a logic class, compiled in the browser by a runtime). On 22 Oct 2026, with the owner's approval, they were converted to a Next.js app with no visual change: every page of both apps was compared pixel by pixel against the runtime version at 375, 1280 and 1440 px, in both languages, and matched exactly.

Each component is one React class component, in the prototype's shape:

| Part | What it does |
|---|---|
| Logic class | `state`, `setState`, `componentDidMount` and `renderVals()`, which returns every value the markup uses. Kept exactly as it was in the prototype logic (`extends React.Component` instead of `DCLogic`). |
| `render()` | `const v = this.renderVals(); return (…JSX…)`. The prototype template converted one to one: same elements, same inline styles, same order. |
| `src/shared/dc.tsx` | Keeps the runtime's output identical. `I(x)` renders a value as `<span class="sc-interp">` (null for `undefined`, `null` and booleans). `css(s)` turns an inline style string into a style object. `list(x)` makes a loop over a missing list render nothing. `val(x, d)` gives `value`/`checked` the runtime's default for `undefined`. |
| Design-system components | `<ds.Badge>` and `<ds.IconBadge>` sit inside `<div class="sc-host-x">`, as the runtime placed them. |

Data enters only through the logic class (`state`, `renderVals()`). Markup reads `v.<key>`. Do not compute in the JSX what belongs in `renderVals()`.

The console renders client-only (`next/dynamic` with `ssr: false`), as the prototype did. The website is rendered at build time (for search engines): its HTML holds the page's text at the desktop width, kept hidden (`html:not(.gc-ready) .gc-site`) until `Site.tsx` has measured the real width on mount, so phones never see the desktop layout. Code in `Site.tsx` that runs while rendering must not touch `window` or `document`. Each page's global CSS (`:root`, `body`, links, inputs) sits in its own `<style>`, and each page is its own HTML document, so the two never meet. Animation names differ (`mk-` for the website, `sa-` for the console).

## Website

- `src/website/Site.tsx` is the approved prototype `Public Website.dc.html` with the allowed port changes.
- Pages switch in component state (`state.page`): `home`, `how`, `officials`, `faq`, `contact`, `admin`. `go()` pushes `#<page>` (home: no hash) onto the history, and `hashchange` and `popstate` set the page from the hash, so links like `/#faq` open that page and Back and Forward work. Below 820 px a ResizeObserver switches to the mobile layout.
- The Telugu and English texts are in `src/website/strings.ts`. Telugu is the default.
- Data: on mount `GET /public/site-config/` fills the office details and store links; the Contact form posts to `POST /public/contact-messages/`. `GET /public/showcase/` fills the hero's phone picture through the `phone` and `miniCards` render values, cached per language; the prototype's static values are the fallback.

## Console

- `src/console/Console.tsx` holds all behaviour. Loaders per page call the API through `this.api` (`src/console/api.ts`). Adapters turn API objects into the exact view-model shapes the markup binds to. Static maps translate API enums such as `UNPUBLISHED` into prototype keys such as `TakenDown`. `fail(e)` is the single error handler.
- **Sign-in:** username and password through a Django session. `src/console/api.ts` first calls `GET /auth/csrf/` for the readable `csrftoken` cookie, then `POST /auth/session/login/`; the server sets the HttpOnly `sessionid` cookie, so page scripts never see a token. Every call is same-origin with cookies, and every write sends `X-CSRFToken` (read from the cookie on each request, because Django rotates it at login). On page load the console calls `GET /me/`; a 401 keeps the login screen. Only users with `web_admin.access_web_console` get in. When `must_change_password` is set, the change-password card comes first; the same card opens from "Change password" in the profile menu, with "‹ Back" instead of "‹ Sign out". A 401 from any call (idle timeout, logout elsewhere, block, password reset) returns to the login screen with "Your session has ended".
- **Permissions:** `GET /me/` returns `permissions` as `app_label.codename` strings. The console hides sidebar pages (`NAV_PERM`), Add User and its role choices (`accounts.manage_*`), Settings in the menu, Audit Export CSV and the user panel's buttons (the user's `allowed_actions`). A missing list means no permissions. The server still enforces every action.
- **Additions to the prototype**, all in the prototype's own inline styles: username and password fields; the change-password card; a pager under Users, Posts and Audit (server-side, 20 per page); empty and loading rows; "Reset password" in the user panel; a Roles list with Remove and "+ Add role" in the user panel; a Contact messages page after Audit Log, built like the Audit Log page; Urgent and event chips, a video player and Mark urgent in the post panel; one Export CSV handler per report and no Export PDF; labels for every audit action key; Username, optional Email and Mobile, and "Temporary password (optional)" with Generate in Add User; "Import CSV"; "Change password" in the profile menu; Reset password (a dialog with Generate) and Unlock in the user panel; a dialog that shows a temporary password once, with Copy and no Cancel; bindings for the signed-in name, state name, category filter and real photos. A `409 already_decided` review answer shows in the existing toast.
- The console is a fixed 1440 px canvas, as designed. The login screen fills the window (`frameW`/`frameH`).

## Build and serving

- `npm run build` runs `next build --webpack` with `output: "export"`: it writes `dist/index.html`, `dist/console/index.html`, `dist/_next/` (scripts and chunks) and copies `public/` into `dist/`. `GC_API_BASE` and `GC_SITE_URL` (environment first, then `.env`) are built into the scripts. `dist/` is git-ignored.
- **Webpack and the Pages Router on purpose:** their pages carry only external `<script src="/_next/…">` tags plus a JSON data block, so the production Content-Security-Policy works without `'unsafe-inline'`. The App Router and Turbopack add inline scripts that the CSP would block.
- All paths are absolute (`/_next/`, `/_ds/`, `/assets/`): the console page loads its scripts from the site root, so `/` and `/console/` must be served from the same `dist/` build.
- **Development:** the BackEnd repo serves `dist/` at `/` (`web_public` app, `WEB_PUBLIC_DIR`, default `../BVTGramaConnect/dist`) and `dist/console/` at `/console/` (`web_admin` app, `WEB_ADMIN_DIR`, default `../BVTGramaConnect/dist/console`) while DEBUG is on.
- **Production:** the BackEnd repo's `deploy/deploy.sh` clones this repo to `/srv/gramaconnect/web` (setting `REPO_WEB`), builds it once, and copies `dist/` (without `console/`) to the web root's `public` folder and `dist/console/` to its `console` folder. Nginx serves `/` and `/console/` from those two folders and proxies `/api/` to Gunicorn. Everything is on one domain, so both apps call the API with relative URLs and need no CORS.
