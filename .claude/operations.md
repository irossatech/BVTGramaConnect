# Operations: website and console

## Build

Node 18 or newer. The build needs no npm packages; `package-lock.json` exists so `npm ci` works on the server.

```
npm ci
npm run build
```

| Variable | Default | Meaning |
|---|---|---|
| `GC_API_BASE` | `/api/v1` | API base URL written into `dist/config.js` and `dist/console/config.js` |
| `GC_CONSOLE_URL` | `/console/` | Where the website's "Admin Login" and the admin card's button lead |

Set them in the environment, or copy `.env.example` to `.env`. The environment wins over `.env`. `dist/` is recreated on every build and is not committed.

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

After an edit, build again and reload. There is no watch mode.

## After the designer re-exports the console

```
npm run port:console                      # or: python console/tools/port.py "<prototype folder>"
npm run build
```

Without an argument, `port.py` looks for "BVT Grama Connect mobile prototype" three levels above `console/tools/`, which is the project folder next to `Repo`. It writes `console/src/index.html` and refreshes `shared/support.js`, `shared/_ds/`, `shared/assets/` and `shared/vendor/` from the prototype. If an edit no longer matches the new export, the script stops and names it; update that edit in `port.py`. If a shared file changes, check the website too.

## Visual checks

Install the browser once in this folder: `npm install --no-save playwright`, then `npx playwright install chromium`. Python needs Pillow.

**Website** (375 px and 1280 px), details in `tools/visual-check/README.md`:
1. Serve the prototype folder on port 8199: `python -m http.server 8199` inside "BVT Grama Connect mobile prototype".
2. Run the backend on port 8101: `python manage.py runserver 127.0.0.1:8101`.
3. `node tools/visual-check/capture.mjs <shots>` then `python tools/visual-check/compare.py <shots> docs/visual-check`.

**Console** (1440x900):
1. Run the backend with sample data on port 8102 (`python manage.py runserver 127.0.0.1:8102`), log in once at http://127.0.0.1:8102/console/ as `super.admin` and set a new password.
2. Save a console session cookie:
   ```
   curl -c cookies.txt -H "Content-Type: application/json" -H "Origin: http://127.0.0.1:8102" \
     -d '{"username":"super.admin","password":"<new password>","client":"web_admin"}' \
     http://127.0.0.1:8102/api/v1/auth/login/
   ```
3. Serve the prototype folder: `python -m http.server 8198` inside "BVT Grama Connect mobile prototype".
4. `node console/tools/visual-check.mjs console/docs/visual-check cookies.txt`
5. `python console/tools/visual_diff.py console/docs/visual-check`, then update the table in `console/docs/visual-check/README.md`.

## Deploy

The BackEnd repo's `deploy/deploy.sh` clones this repo to `/srv/gramaconnect/web` (setting `REPO_WEB`), runs `npm ci` and `npm run build` once (with `GC_API_BASE` from its `WEB_API_BASE`), and copies `dist/` (without `console/`) to `/srv/gramaconnect/www/public` and `dist/console/` to `/srv/gramaconnect/www/console`. Nginx serves those at `/` and `/console/`.

- `index.html` and `support.js` are served with `no-cache`; `vendor/`, `_ds/` and `assets/` with long cache times.
- Files go out byte for byte; never enable HTML minification.
- The Content-Security-Policy must allow `'unsafe-eval'` and inline styles, because the runtime builds code with `new Function` and the markup uses inline styles. Fonts come from Google Fonts.

Nginx templates: BackEnd repo, `deploy/templates/`.
