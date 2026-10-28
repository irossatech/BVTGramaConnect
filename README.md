# BVTGramaConnect

The web side of BVT Grama Connect, in one repo:

| App | Folder | Served at | Prototype |
|---|---|---|---|
| Public website, no login | `src/components/Site.jsx` | `/` | `Public Website.dc.html` |
| Super Admin console | `src/components/Console.jsx` | `/console/` | `Super Admin Console.dc.html` |

Both are the approved prototypes, ported as is. Since 22 Oct 2026 (owner approved) they are one Next.js app exported as static files; before that they were Design Canvas pages compiled in the browser. The conversion changed no pixel: every page of both apps matched the old build exactly in a screenshot comparison. Only data and actions differ from the prototypes: mock data comes from the REST API in BVTGramaConnect_BackEnd.

## Layout

```
src/pages/                index.jsx (website at /), console/index.jsx (console at /console/)
src/components/           Site.jsx, Console.jsx (logic class + markup), ds.jsx (design-system badges), PageHead.jsx
src/lib/                  dc.jsx (rendering helpers), config.js, site-api.js, console-api.js (session, CSRF)
src/proxy.dev.js          `npm run dev` only: forwards /api/ and /media/ to the server in GC_DEV_API
public/                   _ds/ (design-system CSS), assets/ (logo, village photo, icons)
next.config.mjs           static export to dist/, build settings
console/tools/            console visual-check scripts
console/docs/visual-check/  console screenshots and difference report
tools/visual-check/       website screenshot and compare scripts
docs/visual-check/        website screenshots and results
.env.example              settings; copy to .env (git-ignored)
```

## Tech stack

Next.js 16 (Pages Router, static export, webpack) on React 18.3.1, plain JavaScript. Each app is one class component: the prototype's logic class plus its template as JSX. Styles are inline plus the design-system CSS; fonts come from Google Fonts. Both apps call the Django REST API under `/api/v1/`. There is no Node server in production: Nginx serves the built files.

## Requirements

- **Node 20.9 or newer**, for Next.js.
- **Python 3.12 or 3.13** and the **BVTGramaConnect_BackEnd** repo, to run the API and serve the pages.
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

Open http://localhost:3000/ (website) and http://localhost:3000/console/ (console). Both use the live server's data: `src/proxy.dev.js` forwards `/api/` and `/media/` to `GC_DEV_API` in `.env` (today `http://147.93.102.247:8509`), so the pages stay same-origin and the console's session login works as in production. Pages reload as you edit.

- Log in to the console with your live Super Admin account. **Everything you save changes live data.**
- The live API docs (Swagger) are at http://147.93.102.247:8509/api/docs/.
- To use another server (staging, or a local backend on `http://127.0.0.1:8000`), change `GC_DEV_API` in `.env` and restart `npm run dev`.

## Run with a local backend (Windows, PowerShell)

Use this to try changes without touching live data. Put this repo and the BackEnd repo in the same parent folder, for example:

```
C:\Mohit\BVT\
  BVTGramaConnect\            this repo
  BVTGramaConnect_BackEnd\    the API
```

### 1. Build the website and console (this repo)

```
cd C:\Mohit\BVT\BVTGramaConnect
git checkout dev
git pull
npm ci
npm run build
```

This writes `dist/` (website) and `dist/console/` (console). Run `npm run build` again after every change. (Or set `GC_DEV_API=http://127.0.0.1:8000` in `.env` and use `npm run dev` for hot reload against the local backend.)

### 2. Start the backend (first time)

```
cd C:\Mohit\BVT\BVTGramaConnect_BackEnd
git checkout dev
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python manage.py migrate
.venv\Scripts\python manage.py seed_sample_data
.venv\Scripts\python manage.py runserver
```

`seed_sample_data` prints a username and a temporary password for each role. Copy the line for `super.admin`.

On later days only `runserver` is needed:

```
cd C:\Mohit\BVT\BVTGramaConnect_BackEnd
.venv\Scripts\python manage.py runserver
```

### 3. Open the apps

| App | URL | Login |
|---|---|---|
| Public website | http://127.0.0.1:8000/ | none |
| Super Admin console | http://127.0.0.1:8000/console/ | `super.admin` and the printed password; set a new password when asked |
| API docs (Swagger) | http://127.0.0.1:8000/api/docs/ | none |

While DEBUG is on, Django serves `dist/` at `/` and `dist/console/` at `/console/`. It looks for them at `../BVTGramaConnect/dist` and `../BVTGramaConnect/dist/console` by default. If placed elsewhere, you can explicitly set the full paths before `runserver`:

```
$env:WEB_PUBLIC_DIR = "C:\Mohit\BVT\BVTGramaConnect\dist"
$env:WEB_ADMIN_DIR  = "C:\Mohit\BVT\BVTGramaConnect\dist\console"
.venv\Scripts\python manage.py runserver
```

### Quick look without the backend

To see the pages only:

```
npm run build
python -m http.server 8080 --directory dist
```

Open http://localhost:8080/ (website) or http://localhost:8080/console/ (console login). Without the API the website shows its built-in sample office details and picture, the Contact form shows "Could not send", and you cannot log in to the console. Press Ctrl+C to stop.

### Troubleshooting

| Problem | Fix |
|---|---|
| http://127.0.0.1:8000/ shows "Not found" or an old page | Run `npm run build` here, and check `WEB_PUBLIC_DIR` / `WEB_ADMIN_DIR` above |
| Console says "Your session has ended" | Normal after 30 idle minutes or a password change; log in again |
| Console says "This console is for Super Admins only" | Log in as `super.admin`; other roles use the mobile app |
| Lost the `super.admin` password | Ask the backend team to reset it |
| `npm run dev`: every API call says "Set GC_DEV_API in .env" | Copy `.env.example` to `.env`, then restart `npm run dev` |
| `npm run dev`: login works but a save says "CSRF Failed" | Restart `npm run dev` so it reloads `src/proxy.dev.js` |

## Settings

Set them in the environment, or copy `.env.example` to `.env`. `dist/` and `.env` are git-ignored, so never commit them. No secrets are needed: the console logs in with a session cookie, and the apps hold no API keys.

| Variable | Default | Used by | Meaning |
|---|---|---|---|
| `GC_API_BASE` | `/api/v1` | both apps (built in) | Base URL of the API both apps call |
| `GC_CONSOLE_URL` | `/console/` | website (built in) | Where the website's "Admin Login" leads |
| `GC_DEV_API` | none, required | `npm run dev` only | Server that `/api/` and `/media/` are forwarded to. Not part of the build: on the server both apps call the API on their own domain |

## What changed from the prototypes

**Website**, only the changes allowed by the inventory, section 5.4:
1. The page runs as a Next.js page; React, the design-system CSS and images load from this site.
2. Design-system icons load from `/assets/`.
3. Contact details come from `GET /api/v1/public/site-config/`; the prototype's values are the defaults.
4. Store buttons open `play_store_url` and `app_store_url`; while a URL is empty they show the prototype's "coming soon" toast.
5. The contact form posts to `POST /api/v1/public/contact-messages/`, with an invisible honeypot input. Two toast texts were added in Telugu and English.
6. "Admin Login" sends officials to `/console/`.
7. Each page has its own URL: `#how`, `#officials`, `#faq`, `#contact`, `#admin`, `#privacy` and `#terms`; home has none. The Privacy policy and Terms text lives in `src/components/legal.js` (Telugu and English); update its date when the wording changes. Back and Forward move between pages (owner decision Q16).
8. The phone in the hero shows the newest posts from `GET /api/v1/public/showcase/` in the chosen language. Without data it keeps the prototype's static picture (owner decision Q16).

**Console:** every mock dataset now comes from the API. Additions, in the prototype's own inline styles: username and password login, a change-password screen (forced at first login, and from the profile menu), server-side paging, loading and empty rows, Add User with username, optional email and mobile and a temporary password (typed or generated), Reset password and Unlock in the user panel, a dialog that shows a temporary password once with Copy, menus and buttons that follow the signed-in user's permissions, CSV import for villages, and an "Already decided by …" toast for review conflicts. From the owner's decisions: a Contact messages page, second roles and Reset password in the user panel, Urgent and event chips, video and Mark urgent in the post panel, one CSV export per report with no PDF, and readable audit labels. Full list: `.claude/architecture.md`.

Added on 26 Oct 2026:
- **Important numbers** page (contacts API): "For you" and helpline numbers with add/edit drawer, verify, remove and CSV import; a Types tab to add and switch off contact types.
- **Reports:** summary cards (posts, published, pending, rejected, last 30 days); admin "Avg time" from the server.
- **Users:** "Edit details" in the user panel (name, Telugu name, email, mobile). **My profile** changes your own name.
- **Geography:** LGD code; the same checks and help text as the mobile app (required name, no duplicate under one parent, 6-digit PIN, valid coordinates); a "Visible to citizens" switch in the edit form. A village's location is set by pasting a Google Maps link or `lat, lng` numbers, with "Find on Google Maps" and "View on map"; the number boxes open on request.
- **Login:** an eye button shows or hides each password; on reload a short loading screen replaces the login form until the session is checked.
- **Layout:** the sidebar and top bar stay fixed; only the page area scrolls.
- **Geography › Import CSV takes files of any size:** the console checks the file in the browser (UTF-8, required columns), splits it into parts of about 4,000 villages without splitting a mandal, checks every part, then imports part by part with a progress bar. Each part stays well under the 60 s request limit even on a server without the faster importer; with it (backend PR #23) a whole state takes about 10 s. Code: `src/lib/csv-parts.js`. Backend follow-up (optional): `../geography-import-backend-plan.md`.
- **Services** page (same as the app's Super Admin › Services): the services citizens can request from Home. Add or edit a service (English and Telugu name, icon, colour, with a live tile preview), show or hide it, and set the Home order. Uses `/admin/services/` from `services-catalog-backend-plan.md`; until the server has it, the page shows the app's built-in 8 services read-only with a notice.

Added on 28 Oct 2026: the **website** was redesigned in a simpler, cleaner style in the app's own colours and fonts (navy, blue, green, orange; Rubik and Nunito Sans): ruled lists and full-width bands instead of card grids, and smaller text. Telugu uses the app's own "Telugu UI" face (self-hosted in `public/assets/fonts/`, see the README there), and a "New in the app" section lists the newer mobile features (services and requests, help numbers, videos, listen, deadlines, save and share). Content, API calls, the contact form, page URLs and the language toggle are unchanged; `docs/visual-check/` still shows the old prototype look.

## When the designer changes a prototype

The components are now the source; a new prototype export is not copied in. Apply the designer's changes to the markup in `src/components/Site.jsx` or `src/components/Console.jsx` by hand, then rerun the visual check against the new prototype (`.claude/operations.md`).

## Console sign-in and session

- Username and password. The console uses a Django session: `POST /api/v1/auth/session/login/` sets the HttpOnly `sessionid` cookie, so page scripts never see a token. Only users with the `web_admin.access_web_console` permission get in (today the Super Admin).
- CSRF: `src/lib/console-api.js` gets the `csrftoken` cookie from `GET /api/v1/auth/csrf/` and sends it as `X-CSRFToken` on every write.
- The session ends after 30 idle minutes, at logout, when the user is blocked, or when their password is changed or reset. The next call answers 401 and the console shows the login screen.
- No email is sent. Add User and Reset password take a temporary password, or generate one, and show it once for the admin to hand over in person. The person must choose their own password at first login.
- Each console page has its own address (`/console/#users`, `#reports`…), so Back and the swipe-back gesture move between console pages and a reload stays on the page. Going back past the first page while signed in keeps the console open and asks "Leave the console?" (Cancel, or Log out and leave), so no one leaves signed in by accident.
- The mobile app keeps its JWT login; nothing here changes it.

## Visual checks

`docs/visual-check/` (website, 375 px and 1280 px) and `console/docs/visual-check/` (console, 1440x900) hold prototype-versus-port screenshots and difference reports. How to re-run them: `.claude/operations.md`.

## Deploy

The BackEnd repo's `deploy/deploy.sh` clones this repo on the server, builds it once and publishes `dist/` at `/` and `dist/console/` at `/console/` through Nginx. The server needs Node 20.9 or newer to build. The pages need a Content-Security-Policy with `script-src 'self'` and `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`.
