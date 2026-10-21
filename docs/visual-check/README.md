# Visual check: prototype vs port

Run on 2026-10-21 with Playwright (Chromium 131, headless) and Pillow.

- **Prototype:** `Public Website.dc.html` served from the prototype folder by a local static server.
- **Port:** `dist/` built by `npm run build`, served by Django `runserver`.
- **Method:** each page was reached by clicking like a user (header nav at 1280 px, the menu at 375 px; Admin Login from the footer). Full-page screenshots at 1x, after fonts loaded and animations finished. A pixel counts as different when any channel differs by more than 24.

Each image shows the prototype, the port, and the differences in red, scaled down.

## Result

| Page | 375 px | 1280 px |
|---|---|---|
| Home | identical | identical |
| How it works | identical | identical |
| For officials | identical | identical |
| FAQ | identical | identical |
| Contact | identical | identical |
| Admin login | identical | identical |

Page heights match exactly in every pair.

## Notes

- **One flaky first run:** the first run showed "How it works" at 1280 px in the mobile layout on the port only. Two repeat runs were identical. The page picks its layout from a ResizeObserver, and the capture caught it mid-switch. This is the prototype's own behaviour, not a port change.
- **Same console messages on both:** two 404s for `{{ c.icon }}` and `{{ f.icon }}`, and an SVG warning for `{{ menuIcon }}`. The browser reads the hidden raw template before the runtime renders it. The prototype does exactly the same.
- **Contact form end to end:** filled in Telugu and sent through the port; the thank-you panel appeared and the message was stored with its Telugu text intact.

## Change check: owner decisions, 2026-10-21

Two changes, checked against a seeded local backend at 375 px and 1280 px. The before set is the merged site as committed; the after set is this build.

| Page | 375 px | 1280 px |
|---|---|---|
| Home | 0.18%: phone picture only | 0.12%: phone picture only |
| How it works, For officials, FAQ, Contact, Admin login | identical | identical |

- **A URL per page.** Pages open at `#how`, `#officials`, `#faq`, `#contact` and `#admin`; home has no hash. Opening `/#faq` shows FAQ, the header nav sets the hash, and Back and Forward move between pages.
- **Live phone picture.** The phone on the home page shows the newest posts from `GET /api/v1/public/showcase/` in the chosen language: the place line, the featured post's photo, category chip, title and date, and the two small cards below it. When the API has no featured post or cannot be reached, the prototype's static picture stays, so the page looks exactly as before.

Screenshots: `change-1280-home-live-te.png`, `change-1280-home-live-en.png` and `change-375-home-live-te.png`. In these the seed has no photos, so the featured card keeps the default village picture.

No page errors at either width. The OTP and SMS wording on the site is unchanged; new text is waiting for the owner's approval.
