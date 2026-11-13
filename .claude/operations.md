# Operations: website and console

## Build

Node 20.9 or newer (Next.js 16).

```
npm ci
npm run build          # next build --webpack, static export to dist/, then SEO files, deferred scripts, build stamp
npm run check-dist     # the committed dist/ is ready to deploy
npm test               # unit tests (Node 22.18+)
```

| Variable | Default | Meaning |
|---|---|---|
| `GC_API_BASE` | `/api/v1` | API base URL both apps call, built into the scripts |
| `GC_SITE_URL` | `https://www.gramaconnect.com` | The website's public address: canonical links, share previews, structured data, robots.txt, sitemap.xml, llms.txt |
| `GC_ANDROID_APK_URL` | `/downloads/bvt-grama-connect.apk` | The website's "Direct download" link; set it empty to hide the link |
| `GC_PLAY_STORE_URL`, `GC_APP_STORE_URL` | empty | Store buttons; empty shows "Coming soon" |
| `GC_DEV_API` | none | `npm run dev` only: where `/api/` and `/media/` are forwarded (`.env.example`: the live server) |

The defaults are production's, so a build needs no `.env`. Set them in the environment or in `.env`; the environment wins. `dist/` is recreated on every build and **is committed**: the server deploys it as it is (`conventions.md`, "Git"). `npm run check-dist` fails when `dist/` is older than the source or was built with other than the production `GC_API_BASE`, `GC_SITE_URL` and `GC_ANDROID_APK_URL`.

Output: `dist/index.html` (website), `dist/console/index.html` (console), `dist/_next/` (scripts, shared by both pages), and `dist/_ds/` and `dist/assets/` copied from `public/`.

## Run locally

1. Clone BVTGramaConnect_BackEnd next to this repo and start it as its README says:
   ```
   python manage.py migrate
   python manage.py seed_sample_data      # prints usernames and temporary passwords
   python manage.py runserver
   ```
2. `npm run build` here.
3. Website: http://127.0.0.1:8000/. Console: http://127.0.0.1:8000/console/; log in as `super.admin` with the password the seed command printed, then set a new one.
4. Django serves `dist/` at `/` (`WEB_PUBLIC_DIR`, default `../BVTGramaConnect/dist`) and `dist/console/` at `/console/` (`WEB_ADMIN_DIR`, default `../BVTGramaConnect/dist/console`) while DEBUG is on. Until `dist/` exists, each URL shows a "not ported yet" page naming the folder Django looked in.

After an edit, build again and reload. For quick markup work, `npm run dev` serves both pages with hot reload at http://localhost:3000/ and /console/ (its files go to `.next/`, never `dist/`); API calls only work through the backend's runserver.

## Checking the look

There is no screenshot tooling any more (the prototype comparison was finished and removed on 29 Oct 2026). After a change near the markup, open the built pages in a browser at 375 px and 1280 px (website) and 1440 px (console), in both languages, and compare with the page before the change.

## Deploy

The BackEnd repo's `deploy/deploy.sh` clones this repo to `/srv/gramaconnect/web` (setting `REPO_WEB`) and uses the **committed** `dist/` as it is (its `WEB_API_BASE` is then ignored, with a warning). It copies `dist/` (without `console/` and `*.md`) to `/srv/gramaconnect/www/public` and `dist/console/` to `/srv/gramaconnect/www/console`. Nginx serves those at `/` and `/console/`. Only if `dist/` were not committed would it run `npm ci` and `npm run build` on the server (Node 20.9 or newer).

So a release is: build, `npm run check-dist`, commit `dist/` with the source, push, then deploy.

- The console page loads its scripts from `/_next/`, which lives in `public`; both folders must come from the same build.
- `index.html` files: `no-cache`. `/_next/static/` file names carry a content hash, so they can be cached for a year; `_ds/` and `assets/` with long cache times.
- Content-Security-Policy: these pages need only `script-src 'self'` (no inline scripts, no `eval`), `style-src 'self' 'unsafe-inline'` (inline styles) and `font-src 'self'` (fonts are self-hosted; nothing loads from Google). The server's template (`deploy/templates/nginx-security.conf`) still adds `'unsafe-eval'`, left over from the old Design Canvas runtime; removing it is with the backend team (`backlog.md`).

Nginx templates: BackEnd repo, `deploy/templates/`.
