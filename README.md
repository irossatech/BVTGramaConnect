# BVTGramaConnect

The web side of BVT Grama Connect, in one repo:

| App | Folder | Served at | Prototype |
|---|---|---|---|
| Public website, no login | `src/website/Site.tsx` | `/` | `Public Website.dc.html` |
| Super Admin console | `src/console/Console.tsx` | `/console/` | `Super Admin Console.dc.html` |

Both are the approved prototypes, ported as is. Since 22 Oct 2026 (owner approved) they are one Next.js app exported as static files; before that they were Design Canvas pages compiled in the browser. The conversion changed no pixel: every page of both apps matched the old build exactly in a screenshot comparison. Only data and actions differ from the prototypes: mock data now comes from the REST API.

## Layout

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
    locales/                the words: every text a visitor sees, and nothing else
      te.json               Telugu
      en.json               English (same keys; i18n.ts makes TypeScript fail the build if one misses a key)
    i18n.ts                 loads the two locale files (and documents their sections)
    ui/
      theme.ts              colours and text styles
      parts.tsx             pieces several sections use (store buttons, APK link, steps, tricolour)
    routes.ts               the pages and their addresses
    api.ts                  server calls (GCApi.get/post)

  console/                  Super Admin console
    Console.tsx             state and logic; render() only picks the screen and panels
    ConsolePage.tsx         page <head> (noindex), page CSS; loads Console client-only
    layout/                 AuthLayout (sign-in frame), Sidebar (grouped pages), TopBar, Notifications (the bell's list)
    screens/                one file per screen: Login, ChangePassword, Dashboard, Geography, Users, Posts,
                            Reports, Audit, Messages, Requests, Services (and bills), ServiceTabs, Ads,
                            Numbers, Settings, Checking
    panels/                 side panels, forms and dialogs: DetailPanel (PostDetail, UserDetail), UserDrawer,
                            RequestPanel, ServiceForm, AdForm, ComposeForm (New post), NumberForm, TypeForm, ConfirmModal,
                            ImportProgress, Toasts
    ui/parts.tsx            pieces several screens use (TickBox, SelBar, Pager, DistrictOptions)
    types.ts                the API data the console reads and sends
    api.ts                  server calls (session login, CSRF header, downloads)
    csv-parts.ts            CSV import: checks the file and splits it into parts
    ds.tsx                  Badge and IconBadge from the design system

  shared/                   used by both apps
    PageHead.tsx            <head>: viewport, design-system stylesheets, fonts, SEO tags
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
.env.example                settings; copy to .env (git-ignored)
```

## Tech stack

Next.js 16 (Pages Router, static export, webpack) on React 19.2, in TypeScript (strict mode). Each app is one class component: the prototype's logic class plus its template as JSX. Styles are inline plus the design-system CSS; fonts are served from this site (`public/fonts/`), not Google. Both apps call the REST API under `/api/v1/` on their own domain. There is no Node server in production: the built files are served as static files.

## Requirements

- **Node 20.9 or newer**, for Next.js.
- **Git.**

## Run against the live server (everyday work)

```
cd C:\Mohit\BVT\BVTGramaConnect
git checkout dev
git pull
npm ci
copy .env.example .env
npm run dev
```

Open http://localhost:3000/ (website) and http://localhost:3000/console/ (console). Both use the live server's data: `src/proxy.dev.ts` forwards `/api/` and `/media/` to `GC_DEV_API` in `.env` (`https://www.gramaconnect.com`, production), so the pages stay same-origin and the console's session login works as in production. Pages reload as you edit.

- Log in to the console with your live Super Admin account. **Everything you save changes live data.**
- To use another server (staging, or a local API on `http://127.0.0.1:8000`), change `GC_DEV_API` in `.env` and restart `npm run dev`.

## Build

```
npm run build
```

This writes `dist/` (website) and `dist/console/` (console) as static files. To work against a local API instead of the live server, set `GC_DEV_API=http://127.0.0.1:8000` in `.env` and restart `npm run dev`.

### Quick look without an API

To see the pages only:

```
npm run build
python -m http.server 8080 --directory dist
```

Open http://localhost:8080/ (website) or http://localhost:8080/console/ (console login). Without the API the website shows its built-in sample office details and picture, the Contact form shows "Could not send", and you cannot log in to the console. Press Ctrl+C to stop.

### Troubleshooting

| Problem | Fix |
|---|---|
| Console says "Your session has ended" | Normal after 30 idle minutes or a password change; log in again |
| Console says "This console is for Super Admins only" | The account lacks console access; sign in with a Super Admin account |
| `npm run dev`: every API call says "Set GC_DEV_API in .env" | Copy `.env.example` to `.env`, then restart `npm run dev` |
| `npm run dev`: login works but a save says "CSRF Failed" | Restart `npm run dev` so it reloads `src/proxy.dev.ts` |

## Settings

Set them in the environment, or copy `.env.example` to `.env`. `dist/` and `.env` are git-ignored, so never commit them. No secrets are needed: the console logs in with a session cookie, and the apps hold no API keys.

| Variable | Default | Used by | Meaning |
|---|---|---|---|
| `GC_API_BASE` | `/api/v1` | both apps (built in) | Base URL of the API both apps call |
| `GC_SITE_URL` | `https://www.gramaconnect.com` (production) | website (built in) | Public address for canonical links, share previews, structured data, robots.txt, sitemap.xml, llms.txt |
| `GC_DEV_API` | none, required | `npm run dev` only | Server that `/api/` and `/media/` are forwarded to. Not part of the build: on the server both apps call the API on their own domain |
| `GC_PLAY_STORE_URL`, `GC_APP_STORE_URL` | empty | website (built in) | The Google Play and App Store buttons. Empty shows "Coming soon" |
| `GC_ANDROID_APK_URL` | empty | website (built in) | The "Direct download" link under the hero's store buttons, `/downloads/bvt-grama-connect.apk` (committed in `dist/downloads/`). Empty hides the link. See *Android APK download* below |

## What changed from the prototypes

**Website**, only the changes allowed by the inventory, section 5.4:
1. The page runs as a Next.js page; React, the design-system CSS and images load from this site.
2. Design-system icons load from `/assets/`.
3. Contact details (office address, phone, email, hours) are in `src/website/locales/te.json` and `en.json`; the website does not fetch them.
4. Store buttons open `play_store_url` and `app_store_url`; while a URL is empty they show the prototype's "coming soon" toast.
5. The contact form posts to `POST /api/v1/public/contact-messages/`, with an invisible honeypot input. Two toast texts were added in Telugu and English.
6. The website has no admin login and no link to the console: officials open `/console/` directly. The console is `noindex`, so it never shows in search results.
7. Each page has its own address, for search engines: `/howitworks/`, `/officials/`, `/faq/`, `/contact/`, `/privacy/` and `/terms/` (`src/website/routes.ts`); old `#faq`-style links still open the right page. The Privacy policy and Terms text lives in `src/website/legal.ts` (Telugu and English); update its date when the wording changes. Back and Forward move between pages (owner decision Q16).
8. The hero's news ticker ("Latest news" / "చాటింపులు") shows the newest posts from `GET /api/v1/public/showcase/`. On the English page a post shows its English title when the server has a translation, otherwise its Telugu title (marked `lang="te"`). Without data it shows three sample notices.

**Console:** every mock dataset now comes from the API. Additions, in the prototype's own inline styles: username and password login, a change-password screen (forced at first login, and from the profile menu), server-side paging, loading and empty rows, Add User with username, optional email and mobile and a temporary password (typed or generated), Reset password and Unlock in the user panel, a dialog that shows a temporary password once with Copy, menus and buttons that follow the signed-in user's permissions, CSV import for villages, and an "Already decided by …" toast for review conflicts. From the owner's decisions: a Contact messages page, second roles and Reset password in the user panel, Urgent and event chips, video and Mark urgent in the post panel, one CSV export per report with no PDF, and readable audit labels. Full list: `.claude/architecture.md`.

Added on 26 Oct 2026:
- **Important numbers** page (contacts API): "For you" and helpline numbers with add/edit drawer, verify, remove and CSV import; a Types tab to add and switch off contact types.
- **Reports:** summary cards (posts, published, pending, rejected, last 30 days); admin "Avg time" from the server.
- **Users:** "Edit details" in the user panel (name, Telugu name, email, mobile). **My profile** changes your own name.
- **Geography:** LGD code; the same checks and help text as the mobile app (required name, no duplicate under one parent, 6-digit PIN, valid coordinates); a "Visible to citizens" switch in the edit form. A village's location is set by pasting a Google Maps link or `lat, lng` numbers, with "Find on Google Maps" and "View on map"; the number boxes open on request.
- **Login:** an eye button shows or hides each password; on reload a short loading screen replaces the login form until the session is checked.
- **Layout:** the sidebar and top bar stay fixed; only the page area scrolls.
- **Geography › Import CSV takes files of any size:** the console checks the file in the browser (UTF-8, required columns), splits it into parts of about 4,000 villages without splitting a mandal, checks every part, then imports part by part with a progress bar. Each part stays well under the 60 s request limit. Code: `src/console/csv-parts.ts`.
- **Services** page (same as the app's Super Admin › Services): the services citizens can request from Home. Add or edit a service (English and Telugu name, icon, colour, with a live tile preview), show or hide it, and set the Home order. Uses `/admin/services/`; until the server has it, the page shows the 8 built-in services read-only with a notice.

Added on 28 Oct 2026: the **website** was redesigned in a simpler, cleaner style in the app's own colours and fonts (navy, blue, green, orange; Rubik and Nunito Sans): ruled lists and full-width bands instead of card grids, and smaller text. Telugu uses the app's own "Telugu UI" face (self-hosted in `public/assets/fonts/`, see the README there), and a "New in the app" section lists the newer mobile features (services and requests, help numbers, videos, listen, deadlines, save and share). Content, API calls, the contact form, page URLs and the language toggle are unchanged.

Added on 3 Nov 2026 (owner requests; the design and content changes below replace parts of the 28 Oct layout):

**Website**
- **Layout and phones:** UX pass (tap targets of 44 px or more, grouping, hierarchy); every page fits from 360 px wide with no sideways scroll. The hero fits short laptop screens (headline and photo ring are capped by screen height) and has less space at the top.
- **Copy:** template phrasing, dash constructions and repeated claims removed in English and Telugu; the small labels above headings and the hero's tick row are gone.
- **Download:** Google Play and App Store buttons as before, with "Direct download" (`GC_ANDROID_APK_URL`) under them in the hero only. The bottom download panel stacks its buttons on phones.
- **A day in the village** (Home): a timeline read top to bottom, the heading pinned on desktop; each moment's rail fills as it scrolls in.
- **How it works:** the four levels are a staircase (State → District → Mandal → Village) whose connectors draw in; the three steps' cards no longer show as a grey block while they fade in.
- **Listen removed:** the hero's read-aloud button and its code are gone.
- **Contact form:** all four fields required, each with its own error under it (`errName`, `errMobile` (Indian 10-digit, starts 6–9), `errVillage`, `errMessage` in `locales/*.json`); the first wrong field gets focus.
- **Header:** turns into the floating bar in one step (same height, nothing below moves) with a transform-only settle animation; no more animating padding, width or height.

**Console**
- **Phones and tablets:** the sidebar is a drawer behind a menu button; splits stack; filters sit two per row. Tables stay tables: pills, headers, dates and numbers stay on one line and a table wider than its card scrolls sideways inside it (scrollbars stay hidden).
- **Sidebar:** the 12 pages in four groups (Dashboard and Reports; Content; Citizens; Admin), filtered by permission. "Posts" carries the pending count.
- **Notifications:** the bell opens the signed-in official's inbox (`GET /notifications/`, read one, read all, "Show older" by cursor), with an unread count that refreshes every minute. A row opens its post or service request. It no longer jumps to the audit log.
- **New post** (Posts page, needs `posts.create_post`): category, Telugu or English, title, message, any number of photos and videos (lead's decision of 2026-11-11: photos JPG, PNG or WebP up to 10 MB; videos MP4 or MOV up to 50 MB and 60 seconds, length and first frame read in the browser), who sees it (everyone, a district, mandal or village) and Urgent; `POST /posts/`, then each file in the order picked (`/posts/{id}/media/`, one per request; a video also sends `duration_s` and a `poster`) and `/submit/`. A retry after a failed upload continues the same post. The post panel shows every photo and video.
- **Same as the app:** audit log type tabs (`/audit/?type=`, also used by Export), a district filter on Important numbers (`level`/`area_id`), and the Telugu name in My profile.
- **Dashboard:** "Pending by district" lists every district, most pending first, with a search box, and is as tall as the chart beside it. **Reports:** "Posts by area" scrolls inside its card, busiest districts first, zeros in grey.
- **Smaller fixes:** CSV exports say "Exporting…" and ignore repeat clicks; the account menu and the bell list close on an outside click or Escape; the user list shows the Telugu name or username under each name; keyboard focus is visible; drawn icons replace typed ›, + and ‹; Prev/Next are disabled at the ends.

## Android APK download

While the app is not in the stores, the website's "Direct download" link downloads the Android APK straight from this site: `GC_ANDROID_APK_URL=/downloads/bvt-grama-connect.apk`. The server deploys only the committed `dist/`, so the APK (about 27 MB) is **committed** at `dist/downloads/bvt-grama-connect.apk`.

**Publishing a new APK:**

1. Build it in the app repo: `flutter build apk --release --split-per-abi`, and take `build/app/outputs/flutter-apk/app-arm64-v8a-release.apk`.
2. Copy it to `public/downloads/bvt-grama-connect.apk` here (same name; it replaces the old one).
3. `npm run build` copies it into `dist/downloads/`. Commit `dist/` and push; the next deploy serves it.

`public/downloads/` is git-ignored (only the copy in `dist/` is committed, so the file is in git once per version). Each new APK adds about 27 MB to the repository's history: fine until the app is on Google Play. Then set `GC_PLAY_STORE_URL` in `.env`, empty `GC_ANDROID_APK_URL`, rebuild, and remove `dist/downloads/`.

## When the designer changes a prototype

The components are now the source; a new prototype export is not copied in. Apply the designer's changes to the markup in `src/website/Site.tsx` or `src/console/Console.tsx` by hand, then check the pages in a browser (`.claude/operations.md`).

## Console sign-in and session

- Username and password. The console uses a cookie session: `POST /api/v1/auth/session/login/` sets the HttpOnly `sessionid` cookie, so page scripts never see a token. Only users with the `web_admin.access_web_console` permission get in (today the Super Admin).
- CSRF: `src/console/api.ts` gets the `csrftoken` cookie from `GET /api/v1/auth/csrf/` and sends it as `X-CSRFToken` on every write.
- The session ends after 30 idle minutes, at logout, when the user is blocked, or when their password is changed or reset. The next call answers 401 and the console shows the login screen.
- No email is sent. Add User and Reset password take a temporary password, or generate one, and show it once for the admin to hand over in person. The person must choose their own password at first login.
- Each console page has its own address (`/console/#users`, `#reports`…), so Back and the swipe-back gesture move between console pages and a reload stays on the page. Going back past the first page while signed in keeps the console open and asks "Leave the console?" (Cancel, or Log out and leave), so no one leaves signed in by accident.

## Deploy

Run `npm run build` and publish `dist/` at `/` and `dist/console/` at `/console/` as static files. The APK is not part of the deploy (see *Android APK download*). The server needs Node 20.9 or newer to build. The pages need a Content-Security-Policy with `script-src 'self'`, `style-src 'self' 'unsafe-inline'` and `font-src 'self'`. They load nothing from Google.
