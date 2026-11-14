# Backlog: website and console

Open work as of 2026-11-13, most urgent first. Items marked "sign-off" change what people see and need the owner's approval first. Remove an item when it is done.

## Both apps

1. **Finish the click-through against the real backend.** On 21 Oct 2026 the console's login and permission flows passed in a browser against the real backend: session login errors (wrong password, lockout, blocked, not a console user), forced and voluntary password change, reset password with a generated password, unlock, Add User, logout and idle expiry. Still to click: the 409 "already decided" toast (decide one post from two sessions), CSV import with a real file (dry run and import), every CSV download, and every website page.
14. **Check both apps under the stricter CSP.** The backend removed `'unsafe-eval'` on 12 Nov 2026 (audit WEB-SEC-001, BackEnd PR #86). After the next deploy, click through the website and the console with the browser console open: there must be no "Refused to…" Content-Security-Policy errors.

## Website (`src/website/Site.tsx`)

20. **Check the new Telugu home title (lead).** Since 14 Nov 2026 search results are Telugu (audit WEB-SEO-001); the home title's phrase `seo.home` in `src/website/locales/te.json`, "ఆంధ్రప్రదేశ్ గ్రామ వార్తల యాప్", is new text (the English one translated). Have the lead confirm the wording.
21. **Check the 404 page's texts (lead).** New since 14 Nov 2026 (audit WEB-SSG-001): `ui.nfTitle`, `ui.nfBody` and `ui.nfHome` in `src/website/locales/te.json` and `en.json`.
22. **Serve the 404 page on the servers.** BackEnd branch `fix/website-404-page` adds `error_page 404 /404.html` to the Nginx template; after it is merged, run `sudo bash deploy/setup.sh` once (templates are installed by `setup.sh`, not `deploy.sh`). Production and qa run on the hosting panel's own Nginx: set its 404 page to `/404.html` there. Check: `/anything/` shows the site's 404 page with status 404.
23. **Click through the 14 Nov changes in a browser:** switch to English and reload (stays English; with site data blocked it opens in Telugu); tap the ticker on a phone (stops; tap elsewhere and it moves again); Tab to it (stops); open `/anything/` (the 404 page; its header, footer and home links work, and Back returns to it); the hero word still changes every 3.2 s.

3. **"For officials" login text (sign-off).** The page says an admin adds officials with their email and sends the username and temporary password by email. Since 21 Oct 2026 there is no email: the admin sets or generates a temporary password and hands it over in person. New Telugu and English text for that point (`ui.o3c` in `src/website/locales/*.json`) must be agreed with the owner.
4. **Office details.** Done: the BVT Kandukur address, phone, email and hours are in `src/website/locales/*.json` (the website no longer reads the server's `SITE_*` settings; the mobile app still does).
5. **Store links.** When the app is published, set `GC_PLAY_STORE_URL` (and `GC_APP_STORE_URL`) in `.env`, rebuild, commit `dist/` and push.
6. **Showcase photos.** The seed data has no photos, so the live phone picture was only checked with the default village image. Check it once real posts with photos exist.
7. **Search engines.** Done for `https://www.gramaconnect.com` (`GC_SITE_URL`): a real address per page, the text rendered into the HTML, per-page titles and descriptions, canonical links, share previews, structured data (Organization, WebSite, MobileApplication with the APK download link, FAQPage, breadcrumbs; Telugu brand name and Andhra Pradesh service area), Telugu page names in the titles, `sitemap.xml`, `robots.txt`, `llms.txt`, `<html lang>`, favicon; the console is `noindex` and not linked from the website. After launch: add the site to Google Search Console and Bing Webmaster Tools and submit the sitemap; replace the share image with a 1200×630 one.
9. **Privacy policy and terms.** The pages exist (`legal` in `src/website/locales/*.json`, `/privacy/` and `/terms/`); have the wording reviewed before launch.

24. **Check the skip link's text (lead).** New since 14 Nov 2026 (audit WEB-A11Y-005): `ui.skipLink` in `src/website/locales/te.json` ("ప్రధాన భాగానికి వెళ్లండి") and `en.json`. In a browser: press Tab on any page (the link shows at the top left; Enter skips past the header); open FAQ from the menu with the keyboard (focus lands on its heading; a screen reader reads it).

## Console (`src/console/Console.tsx`)

25. **Load the console's login screen first (owner's choice of 14 Nov 2026, audit WEB-PERF-003).** Today the whole console (about 175 KB compressed) downloads before the login form. Show the login and change-password screens from a small first download and load the signed-in screens after login. Build it once the `Console.tsx` split (item 18, WEB-ARCH-001) is finished, since both change how the console starts.

12. **Video playback.** The post panel's video player was checked with a poster only. Play a real MP4 once uploads work end to end.
16. **Console sign-in code (sign-off; BackEnd `feature/console-totp`, not merged as of 13 Nov 2026).** Build only after it reaches BackEnd `dev`. With `CONSOLE_OTP_REQUIRED`, `POST /auth/session/login/` answers `{otp_required, otp_enrolled}` and no session; the console needs a set-up screen (`POST /auth/session/otp/setup/`: `secret`, `otpauth_url` for a QR code) and a code screen (`POST /auth/session/otp/verify/` `{code}`; `invalid_otp` with `tries_left`, `otp_expired` back to the password step). New UI, and a QR code needs a library or a drawing routine: owner's sign-off first.
19. **Audit log dates (sign-off).** Since 12 Nov 2026 `GET /audit/` shows the last 90 days unless `from`/`to` are sent (at most 180 days back) and returns `window`. The Audit page sends no dates, so it shows 90 days and does not say so; a date filter or a "last 90 days" note would be new UI.
18. **Split `Console.tsx`, screen by screen (audit WEB-ARCH-001; started 14 Nov 2026).** Done: the shared shapes moved to `model.ts`, and Contact messages, Service requests and Ads to `src/console/logic/` (`Console.tsx` 3,395 → 2,480 lines). Still in `Console.tsx`: Dashboard, Geography, Users, Posts (and New post), Reports, Audit, Services and bills, Important numbers, Settings, notifications, sign-in. Move a screen when it next needs a change, in its own PR, the same way (`architecture.md`, "Console"); check that it behaves exactly as before.

Inherited from the console prototype, change only with the owner's sign-off:
- Fixed 1440 px canvas; narrower windows clip it.
- The post panel shows no author mobile number; the API does not return it.
