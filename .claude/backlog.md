# Backlog: website and console

Open work as of 2026-10-21, most urgent first. Items marked "sign-off" change what people see and need the owner's approval first. Remove an item when it is done.

## Both apps

1. **Finish the click-through against the real backend.** On 21 Oct 2026 the console's login and permission flows passed in a browser against the real backend: session login errors (wrong password, lockout, blocked, not a console user), forced and voluntary password change, reset password with a generated password, unlock, Add User, logout and idle expiry. Still to click: the 409 "already decided" toast (decide one post from two sessions), CSV import with a real file (dry run and import), every CSV download, and every website page.
2. **Re-run both visual checks** after any change near the markup (`.claude/operations.md`).

## Website (`src/components/Site.jsx`)

3. **"For officials" login text (sign-off).** The page says an admin adds officials with their email and sends the username and temporary password by email. Since 21 Oct 2026 there is no email: the admin sets or generates a temporary password and hands it over in person. New Telugu and English text for that point (`o3c` in `src/components/Site.jsx`) must be agreed with the owner.
4. **Office details.** Confirm the address, phone, email and hours with the owner and set them through the backend's `SITE_*` settings on the server.
5. **Store links.** When the app is published, set `PLAY_STORE_URL` and `APP_STORE_URL` on the server. No release of this repo is needed.
6. **Showcase photos.** The seed data has no photos, so the live phone picture was only checked with the default village image. Check it once real posts with photos exist.
7. **Search engines.** The page renders client-only, so crawlers without JavaScript see an empty page. Next.js can now pre-render the HTML at build time (drop `ssr: false` in `src/pages/index.jsx` after making the first render match the browser), or add a meta description; either needs sign-off.
8. **Image weight (sign-off).** `public/assets/logo-mark.png` is 107 KB but shown at 44 px, and `village-landscape.jpg` is 184 KB. Smaller files mean new file names in the markup of both apps.
9. **Privacy policy and terms.** The footer shows them as plain text with no pages behind them.

## Console (`src/components/Console.jsx`)

10. **Re-run `console/tools/visual-check.mjs` with the session login.** It now logs in through the form (username and password arguments) and fakes only the forced-change login answer; the screenshots in `console/docs/visual-check/` predate the session login.
11. **Admin activity "Avg h" shows "—".** The backend's admin-activity report does not return an average review time, and `src/components/Console.jsx` hard-codes "—". Needs a backend field first, then the mapping.
12. **Video playback.** The post panel's video player was checked with a poster only. Play a real MP4 once uploads work end to end.
13. **React 19.** Next.js 16 warns that React 18 support will be removed in Next.js 17. The app runs on React 18.3.1, the version the prototypes were approved on. Before moving to Next.js 17, upgrade React to 19 and rerun both visual checks.

Inherited from the console prototype, change only with the owner's sign-off:
- Fixed 1440 px canvas; narrower windows clip it.
- The header search only searches posts, although its placeholder mentions users and villages.
- The bell opens the audit log; there is no notifications list in the console.
- The post panel shows no author mobile number; the API does not return it.
