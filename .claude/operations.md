# Operations: website and console

## Build

Node 20.9 or newer (Next.js 16).

```
npm ci
npm run build          # next build --webpack, static export to dist/
```

| Variable | Default | Meaning |
|---|---|---|
| `GC_API_BASE` | `/api/v1` | API base URL both apps call, built into the scripts |
| `GC_SITE_URL` | `https://dev.gramaconnect.com` | The website's public address: canonical links, share previews, structured data, robots.txt, sitemap.xml, llms.txt |

Set them in the environment, or copy `.env.example` to `.env`. The environment wins over `.env`. `dist/` is recreated on every build and is not committed.

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

The BackEnd repo's `deploy/deploy.sh` clones this repo to `/srv/gramaconnect/web` (setting `REPO_WEB`), runs `npm ci` and `npm run build` once (with `GC_API_BASE` from its `WEB_API_BASE`), and copies `dist/` (without `console/`) to `/srv/gramaconnect/www/public` and `dist/console/` to `/srv/gramaconnect/www/console`. Nginx serves those at `/` and `/console/`. The server needs Node 20.9 or newer.

- The console page loads its scripts from `/_next/`, which lives in `public`; both folders must come from the same build.
- `index.html` files: `no-cache`. `/_next/static/` file names carry a content hash, so they can be cached for a year; `_ds/` and `assets/` with long cache times.
- Content-Security-Policy: `script-src 'self'` is enough (no inline scripts, no `eval`); inline styles need `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`. Fonts come from Google Fonts.

Nginx templates: BackEnd repo, `deploy/templates/`.
