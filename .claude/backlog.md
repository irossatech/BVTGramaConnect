# Backlog: website and console

Open work as of 2026-10-21, most urgent first. Items marked "sign-off" change what people see and need the owner's approval first. Remove an item when it is done.

## Both apps

1. **Finish the click-through against the real backend.** On 21 Oct 2026 the console's login and permission flows passed in a browser against the real backend: session login errors (wrong password, lockout, blocked, not a console user), forced and voluntary password change, reset password with a generated password, unlock, Add User, logout and idle expiry. Still to click: the 409 "already decided" toast (decide one post from two sessions), CSV import with a real file (dry run and import), every CSV download, and every website page.

## Website (`src/website/Site.tsx`)

3. **"For officials" login text (sign-off).** The page says an admin adds officials with their email and sends the username and temporary password by email. Since 21 Oct 2026 there is no email: the admin sets or generates a temporary password and hands it over in person. New Telugu and English text for that point (`o3c` in `src/website/strings.ts`) must be agreed with the owner.
4. **Office details.** Confirm the address, phone, email and hours with the owner and set them through the backend's `SITE_*` settings on the server.
5. **Store links.** When the app is published, set `PLAY_STORE_URL` and `APP_STORE_URL` on the server. No release of this repo is needed.
6. **Showcase photos.** The seed data has no photos, so the live phone picture was only checked with the default village image. Check it once real posts with photos exist.
7. **Search engines.** Done for `https://dev.gramaconnect.com` (`GC_SITE_URL`): a real address per page, the text rendered into the HTML, per-page titles and descriptions, canonical links, share previews, structured data (Organization, WebSite, MobileApplication, FAQPage, breadcrumbs), `sitemap.xml`, `robots.txt`, `llms.txt`, `<html lang>`, favicon; the console is `noindex` and not linked from the website. After launch: add the site to Google Search Console and Bing Webmaster Tools and submit the sitemap; replace the share image with a 1200×630 one.
9. **Privacy policy and terms.** The pages exist (`src/website/legal.ts`, `/privacy/` and `/terms/`); have the wording reviewed before launch.

## Console (`src/console/Console.tsx`)

12. **Video playback.** The post panel's video player was checked with a poster only. Play a real MP4 once uploads work end to end.

Inherited from the console prototype, change only with the owner's sign-off:
- Fixed 1440 px canvas; narrower windows clip it.
- The bell opens the audit log; there is no notifications list in the console.
- The post panel shows no author mobile number; the API does not return it.
