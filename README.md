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
public/                   _ds/ (design-system CSS), assets/ (logo, village photo, icons)
next.config.mjs           static export to dist/, build settings
console/tools/            console visual-check scripts
console/docs/visual-check/  console screenshots and difference report
tools/visual-check/       website screenshot and compare scripts
docs/visual-check/        website screenshots and results
.env.example              build settings
```

## Tech stack

Next.js 16 (Pages Router, static export, webpack) on React 18.3.1, plain JavaScript. Each app is one class component: the prototype's logic class plus its template as JSX. Styles are inline plus the design-system CSS; fonts come from Google Fonts. Both apps call the Django REST API under `/api/v1/`. There is no Node server in production: Nginx serves the built files.

## Requirements

- **Node 20.9 or newer**, for Next.js.
- **Python 3.12 or 3.13** and the **BVTGramaConnect_BackEnd** repo, to run the API and serve the pages.
- **Git.**

## Run locally (Windows, PowerShell)

Put this repo and the BackEnd repo in the same parent folder, for example:

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

This writes `dist/` (website) and `dist/console/` (console). Run `npm run build` again after every change. For quick markup work without data, `npm run dev` serves both pages with hot reload at http://localhost:3000/.

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

## Build settings

`npm run build` exports both pages to `dist/` and `dist/console/`, with these settings built into the scripts:

| Variable | Default | Meaning |
|---|---|---|
| `GC_API_BASE` | `/api/v1` | Base URL of the API both apps call |
| `GC_CONSOLE_URL` | `/console/` | Where the website's "Admin Login" leads |

Set them in the environment, or copy `.env.example` to `.env`. `dist/` and `.env` are git-ignored, so never commit them.

## What changed from the prototypes

**Website**, only the changes allowed by the inventory, section 5.4:
1. The page runs as a Next.js page; React, the design-system CSS and images load from this site.
2. Design-system icons load from `/assets/`.
3. Contact details come from `GET /api/v1/public/site-config/`; the prototype's values are the defaults.
4. Store buttons open `play_store_url` and `app_store_url`; while a URL is empty they show the prototype's "coming soon" toast.
5. The contact form posts to `POST /api/v1/public/contact-messages/`, with an invisible honeypot input. Two toast texts were added in Telugu and English.
6. "Admin Login" sends officials to `/console/`.
7. Each page has its own URL: `#how`, `#officials`, `#faq`, `#contact` and `#admin`; home has none. Back and Forward move between pages (owner decision Q16).
8. The phone in the hero shows the newest posts from `GET /api/v1/public/showcase/` in the chosen language. Without data it keeps the prototype's static picture (owner decision Q16).

**Console:** every mock dataset now comes from the API. Additions, in the prototype's own inline styles: username and password login, a change-password screen (forced at first login, and from the profile menu), server-side paging, loading and empty rows, Add User with username, optional email and mobile and a temporary password (typed or generated), Reset password and Unlock in the user panel, a dialog that shows a temporary password once with Copy, menus and buttons that follow the signed-in user's permissions, CSV import for villages, and an "Already decided by …" toast for review conflicts. From the owner's decisions: a Contact messages page, second roles and Reset password in the user panel, Urgent and event chips, video and Mark urgent in the post panel, one CSV export per report with no PDF, and readable audit labels. Full list: `.claude/architecture.md`.

## When the designer changes a prototype

The components are now the source; a new prototype export is not copied in. Apply the designer's changes to the markup in `src/components/Site.jsx` or `src/components/Console.jsx` by hand, then rerun the visual check against the new prototype (`.claude/operations.md`).

## Console sign-in and session

- Username and password. The console uses a Django session: `POST /api/v1/auth/session/login/` sets the HttpOnly `sessionid` cookie, so page scripts never see a token. Only users with the `web_admin.access_web_console` permission get in (today the Super Admin).
- CSRF: `gc-api.js` gets the `csrftoken` cookie from `GET /api/v1/auth/csrf/` and sends it as `X-CSRFToken` on every write.
- The session ends after 30 idle minutes, at logout, when the user is blocked, or when their password is changed or reset. The next call answers 401 and the console shows the login screen.
- No email is sent. Add User and Reset password take a temporary password, or generate one, and show it once for the admin to hand over in person. The person must choose their own password at first login.
- The mobile app keeps its JWT login; nothing here changes it.

## Visual checks

`docs/visual-check/` (website, 375 px and 1280 px) and `console/docs/visual-check/` (console, 1440x900) hold prototype-versus-port screenshots and difference reports. How to re-run them: `.claude/operations.md`.

## Deploy

The BackEnd repo's `deploy/deploy.sh` clones this repo on the server, builds it once and publishes `dist/` at `/` and `dist/console/` at `/console/` through Nginx. The server needs Node 20.9 or newer to build. The pages need a Content-Security-Policy with `script-src 'self'` and `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`.
