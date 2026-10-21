# Backlog: website and console

Open work as of 2026-10-21, most urgent first. Items marked "sign-off" change what people see and need the owner's approval first. Remove an item when it is done.

## Both apps

1. **Click through against the real backend.** Run `seed_sample_data`, then walk every website page and every console screen in a real browser, including the console's forced password change, reset password, the 409 "already decided" toast (decide one post from two sessions), CSV import with a real file (dry run and import) and every CSV download.
2. **Re-run both visual checks** after any change near the markup (`.claude/operations.md`).

## Website (`src/`)

3. **Remove OTP and SMS wording (sign-off).** The owner dropped SMS and OTP login, but the page text still promises them in both languages: the "For officials" page says logins come as "an OTP login link by SMS", FAQ 3 says officials log in "with an OTP", and the Admin login card has a mobile field and a "Send OTP" button (the button now opens the console). New Telugu and English text must be agreed with the owner.
4. **Office details.** Confirm the address, phone, email and hours with the owner and set them through the backend's `SITE_*` settings on the server.
5. **Store links.** When the app is published, set `PLAY_STORE_URL` and `APP_STORE_URL` on the server. No release of this repo is needed.
6. **Phone mockup with live posts (open question Q16).** The hero mockup is the prototype's static illustration. Showing real posts needs a decision and an endpoint.
7. **A URL per page (open question Q16).** Pages switch in state, so Back leaves the site and pages cannot be linked. Mirroring the page in `location.hash` is a logic-only change but needs agreement.
8. **Search engines.** Crawlers see the raw template with `{{ }}` placeholders until JavaScript runs. Any fix, such as a `<noscript>` summary or a meta description, needs sign-off.
9. **Image weight (sign-off).** `shared/assets/logo-mark.png` is 107 KB but shown at 44 px, and `village-landscape.jpg` is 184 KB. Smaller files mean new file names in the markup of both apps.
10. **Privacy policy and terms.** The footer shows them as plain text with no pages behind them.

## Console (`console/`)

11. **Use the real login in `console/tools/visual-check.mjs`.** Remove the `page.route` fakes for `/auth/login/` and `/auth/refresh/` now that the endpoints exist.
12. **Reports: three CSV buttons export the same file.** All four "Export CSV" buttons call one `exportCsv` handler. On Reports, the review-time and admin-activity buttons download the posts-by-area CSV. Give each button its own handler (a binding change in `port.py`) and call `/admin/reports/review-time/export/` and `/admin/reports/admin-activity/export/`.
13. **Admin activity "Avg h" shows "—".** The backend's admin-activity report does not return an average review time, and `logic.js` hard-codes "—". Needs a backend field first, then the mapping.
14. **Recent activity shows a raw key.** The dashboard's Recent activity and the audit log show `user.password_changed` as is, because `logic.js` has no label for that audit action. Add a label.
15. **Users table: "Reset" makes cells wrap (sign-off).** The extra button widens the actions column, so long names, mobile numbers and role chips wrap. Consider keeping "Reset password" only in the user panel.
16. **PDF export.** The PDF button shows "PDF export is not available yet. Use CSV." Open question Q14: CSV only is the default.
17. **Vendored React download has no hash check.** `port.py` fetches React from unpkg into `shared/vendor/` when it is missing, without checking the SRI hashes that `support.js` lists. Add the check.

Inherited from the console prototype, change only with the owner's sign-off:
- Fixed 1440 px canvas; narrower windows clip it.
- The header search only searches posts, although its placeholder mentions users and villages.
- The bell opens the audit log; there is no notifications list in the console.
- The post panel shows no author mobile number; the API does not return it.
