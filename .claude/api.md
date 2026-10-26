# API used by the website and the console

The source of truth is the BackEnd repo's `docs/api-contract.md`. If this file and the contract disagree, the contract wins; tell the backend team. Both apps call relative URLs under `GC_API_BASE` (default `/api/v1`, set at build time) on the same domain.

## Website (`src/components/Site.jsx`)

Contract section 9. All calls go through `GCApi` (`src/lib/site-api.js`) with relative URLs under `GC_API_BASE` (default `/api/v1`). No login is involved.

### GET /public/site-config/

Called once on page load.

```json
{
  "office_address_te": "…", "office_address_en": "…",
  "phone": "+91 863 223 4567", "email": "help@bvtgramaconnect.in",
  "hours_te": "సోమ–శని 10:00–18:00", "hours_en": "Mon–Sat 10:00–18:00",
  "play_store_url": "", "app_store_url": ""
}
```

- Addresses use `\n` between the two lines the page shows.
- An empty store URL keeps the prototype's "coming soon" toast for that button.
- Values come from backend settings `SITE_OFFICE_ADDRESS_TE`, `SITE_OFFICE_ADDRESS_EN`, `SITE_PHONE`, `SITE_EMAIL`, `SITE_HOURS_TE`, `SITE_HOURS_EN`, `PLAY_STORE_URL` and `APP_STORE_URL`. The defaults are the prototype's values. Changing them needs no website release.
- If the call fails, the page keeps showing the prototype's values.

### POST /public/contact-messages/

Called by the Contact form.

Request: `{"name", "mobile", "village_text", "message", "language", "website"}`. Response: `201 {"id", "created_at"}`.

- Validation matches the page: name and message required after trimming, mobile 10 digits.
- `website` is a hidden honeypot field. When a bot fills it, the server answers `201` with `id` 0 and stores nothing.
- At most 5 messages per IP per hour (`CONTACT_MESSAGES_PER_IP_PER_HOUR`), then `429` with `Retry-After`. The page shows the `toastBusy` text.
- Other failures show the `toastFail` text.
- Messages are read and marked handled in the console's Contact messages page.

### Errors

Every error has the same shape:

```json
{"error": {"code": "validation_error", "message": "…", "fields": {"mobile": ["…"]}}}
```

`GCApi` rejects with that `error` object plus `status` (`0` for a network failure).

### GET /public/showcase/

Called on page load and again the first time the language is switched, with `Accept-Language` set to the page language. It fills the phone picture in the hero.

```json
{"location": {"level": "VILLAGE", "id": 1, "name": "…", "path": "Kolakaluru · Tenali · Guntur"},
 "featured": {"id": "…", "category": "news", "title": "…", "area": {"level", "id", "name"}, "published_at": "…", "thumbnail_url": null, "event": null, "is_urgent": false, "video": null},
 "items": [ /* two more posts, same shape */ ]}
```

- The page uses `location.path` (or `name`), and from each post `category`, `title`, `published_at`, `area.name` and `thumbnail_url`.
- The backend's `SITE_SHOWCASE_VILLAGE_ID` picks the village; without it the backend chooses.
- When `featured` is null or the call fails, the prototype's static picture stays.

## Console (`src/components/Console.jsx`)

This section lists what the console calls today, read from `src/components/Console.jsx` and `src/lib/console-api.js`. All paths are under `/api/v1/`. Every call sends `Accept-Language: en` and the session cookie (same-origin); every POST, PATCH and DELETE also sends `X-CSRFToken` from the `csrftoken` cookie.

### By screen

| Screen | Calls |
|---|---|
| Page load | `GET /auth/csrf/` (sets `csrftoken`), then `GET /me/`; 401 keeps the login screen. Uses `permissions`, `groups`, `must_change_password` |
| Login | `GET /auth/csrf/`, then `POST /auth/session/login/` `{username, password}` → `{user}` and the `sessionid` cookie |
| Change password (forced, or from the profile menu) | `POST /auth/password/change/` `{current_password, new_password}`; keeps this session and ends the others; then `GET /me/` |
| Sign out | `POST /auth/session/logout/` → 204 |
| Shell, Posts badge | the pending count comes from the dashboard's `kpis.pending` and from `status_counts.PENDING` on the posts list |
| Dashboard | `GET /admin/dashboard/` |
| Geography | `GET /geo/tree/?villages=1`; `POST /geo/districts/`, `/geo/mandals/`, `/geo/villages/`; `PATCH /geo/{districts,mandals,villages}/{id}/` for edits and `{is_active}`; CSV import: `POST /geo/villages/import/?dry_run=1` (multipart `file`), then the same without `dry_run` |
| Users | `GET /users/?role=&district=&status=&is_active=&q=&page=&page_size=20`; `POST /users/` `{username, name, name_te, email?, mobile?, password?, role, area: {level, id}}` (`role` is a group key such as `VILLAGE_ADMIN`; without `password` the answer carries `temporary_password`, shown once); `POST /users/{id}/block/` or `/unblock/`; `PATCH /users/{id}/role-assignments/{ra_id}/` `{area}` to reassign |
| User panel | `GET /posts/?author={id}&page_size=5` for recent posts; `GET /users/{id}/` after a change; `POST /users/{id}/reset-password/` `{password?}` (without `password` the answer carries `temporary_password`, shown once); `POST /users/{id}/unlock/` when `locked_out` is true; buttons follow the user's `allowed_actions` (`reassign`, `reset_password`, `unlock`, `block` / `unblock`, `add_assignment`, `remove_assignment`); `POST /users/{id}/role-assignments/` `{role, area: {level, id}}` to add a role; `DELETE /users/{id}/role-assignments/{ra_id}/` to remove one |
| Posts | `GET /posts/?status=&district=&category=&q=&page=&page_size=20` (uses `status_counts` for the tabs); `GET /categories/` for the filter |
| Post panel | `GET /posts/{id}/`, `GET /posts/{id}/history/`; `POST /posts/{id}/review/` with `{action: publish}`, `{action: recheck, comment}`, `{action: discard, comment}`, `{action: unpublish, comment}` or `{action: reverse, to_status, comment}`; `POST /posts/{id}/urgent/` `{is_urgent}` when `allowed_actions` has `set_urgent`. Shows `event`, `is_urgent` and video media (`kind: "video"`, `url`, `poster_url`) |
| Profile menu "My profile" | `PATCH /me/` `{name}` |
| User panel "Edit details" (when `allowed_actions` has `edit`) | `PATCH /users/{id}/` `{name, name_te, email, mobile}` (empty email or mobile sent as `null`) |
| Reports | `GET /admin/reports/summary/` (the four cards at the top), `GET /admin/reports/posts-by-area/`, `GET /admin/reports/review-time/`, `GET /admin/reports/admin-activity/?page_size=8`; CSV only, one per report: `GET /admin/reports/{posts-by-area,review-time,admin-activity}/export/?format=csv` |
| Audit log | `GET /audit/?q=&page=&page_size=20`; CSV: `GET /audit/export/?q=` |
| Contact messages | `GET /admin/contact-messages/?status=new\|handled&q=&page=&page_size=20` (no `status` for All); `PATCH /admin/contact-messages/{id}/` `{handled}` |
| Important numbers | `GET /contact-types/` for the type choices; `GET /admin/contacts/?section=AREA\|HELPLINE&type=&q=&page=&page_size=20` (tabs "For you" and "Government helplines"); `POST /admin/contacts/` `{type, custom_type?, name, name_te, phone, email, area: {level, id}, sort_order, consent_recorded}` (helplines use `area: {level: STATE}`); `PATCH /admin/contacts/{id}/` (same fields, or `{verified: true}`); `DELETE /admin/contacts/{id}/`; buttons follow `allowed_actions` (`edit`, `verify`, `remove`); CSV: `POST /admin/contacts/import/?dry_run=1` (multipart `file`), then without `dry_run`. Types tab: `GET /admin/contact-types/`, `POST /admin/contact-types/` `{key, section, name_en, name_te}`, `PATCH /admin/contact-types/{id}/` `{is_active}`. The area list comes from the geography tree (the console is Super Admin only), not `/admin/contacts/targets/` |
| Settings | `GET /admin/settings/`, `PATCH /admin/settings/` `{review_escalation_hours}` or `{languages: {en}}`; `GET /admin/categories/`, `POST /admin/categories/` `{key, name_te, name_en}`, `PATCH /admin/categories/{id}/` `{is_active}`; `GET /admin/notification-templates/`, `PATCH /admin/notification-templates/{key}/` `{text_te, text_en}` |

CSV downloads go through `GC_API.download` (`src/lib/console-api.js`), which fetches with the session cookie and saves the file under a dated name.

### Permissions the console reads from `GET /me/`

| Shown when the user has | What |
|---|---|
| `web_admin.access_web_console` | the console at all; otherwise back to login with "This console is for Super Admins only" |
| `web_admin.view_dashboard` | Dashboard |
| `geography.manage_master_data` | Geography |
| any `accounts.manage_district_admin`, `manage_mandal_admin`, `manage_village_admin`, `manage_panchayat_member` | Users; Add User and Add role offer only those roles |
| `posts.view_review_queue` | Posts & Moderation (post buttons follow each post's `allowed_actions`) |
| `web_admin.view_reports` | Reports |
| `audit.view_audit_log` / `audit.export_audit_log` | Audit Log / its Export CSV |
| `web_public.manage_contact_messages` | Contact messages |
| `contacts.manage_contact` / `contacts.manage_contact_types` | Important numbers / its Types tab |
| any `posts.manage_settings`, `posts.manage_categories`, `notifications.manage_templates` | Settings (sidebar and profile menu) |

The first page after login is the first one the user may open. The source of these names is the BackEnd repo's `apps/accounts/role_matrix.py`.

### Error codes the console handles

| Code | What the console does |
|---|---|
| any 401 (`session_revoked`, `not_authenticated`: idle timeout, logout elsewhere, block, reset) | back to the login screen with "Your session has ended" |
| `password_change_required` (403) | shows the change-password screen |
| `not_console_user` (403) | toast "This console is for Super Admins only. Use the mobile app." |
| `account_blocked` (403) | toast "This account is blocked. Contact your administrator." |
| `locked_out` (429) | toast "Too many failed attempts. Try again in N minutes." from `retry_after_s` |
| `invalid_credentials` (400) | toast "Wrong username or password."; the password field is cleared |
| `duplicate` (409) | toast with the server's message (important number or contact type already listed) |
| `already_decided` (409) | toast "Already decided by <name> (<role>)", then reloads the post list and the post |
| `validation_error` (400) | toast with the message and the first field error |
| `throttled` (429) | toast with the server's message |
| CSV import errors | a dialog with the first five errors from the dry-run report |

Any other error shows the server's message in the toast.
