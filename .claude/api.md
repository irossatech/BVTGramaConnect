# API used by the website and the console

The source of truth is the BackEnd repo's `docs/api-contract.md`. If this file and the contract disagree, the contract wins; tell the backend team. Both apps call relative URLs under `GC_CONFIG.apiBase` (default `/api/v1`) on the same domain.

## Website (`src/`)

Contract section 9. All calls go through `window.GCApi` (`src/gc-api.js`) with relative URLs under `GC_CONFIG.apiBase` (default `/api/v1`). No login is involved.

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

## Console (`console/`)

This section lists what the console calls today, read from `console/tools/logic.js` and `console/src/gc-api.js`. All paths are under `/api/v1/`. Every call sends `Accept-Language: en` and the bearer token.

### By screen

| Screen | Calls |
|---|---|
| Page load | `POST /auth/refresh/` (cookie), then `GET /me/` |
| Login | `POST /auth/login/` `{username, password, client: "web_admin"}` |
| Change password | `POST /auth/password/change/` `{current_password, new_password}`; then `GET /me/` |
| Sign out | `POST /auth/logout/` |
| Shell, Posts badge | the pending count comes from the dashboard's `kpis.pending` and from `status_counts.PENDING` on the posts list |
| Dashboard | `GET /admin/dashboard/` |
| Geography | `GET /geo/tree/?villages=1`; `POST /geo/districts/`, `/geo/mandals/`, `/geo/villages/`; `PATCH /geo/{districts,mandals,villages}/{id}/` for edits and `{is_active}`; CSV import: `POST /geo/villages/import/?dry_run=1` (multipart `file`), then the same without `dry_run` |
| Users | `GET /users/?role=&district=&status=&q=&page=&page_size=20`; `POST /users/` `{name, name_te, email, username?, mobile?, role, area: {level, id}}`; `POST /users/{id}/block/` or `/unblock/`; `PATCH /users/{id}/role-assignments/{ra_id}/` `{area}` to reassign |
| User panel | `GET /posts/?author={id}&page_size=5` for recent posts; `GET /users/{id}/` after a change; `POST /users/{id}/reset-password/`; `POST /users/{id}/role-assignments/` `{role, area: {level, id}}` to add a role; `DELETE /users/{id}/role-assignments/{ra_id}/` to remove one |
| Posts | `GET /posts/?status=&district=&category=&q=&page=&page_size=20` (uses `status_counts` for the tabs); `GET /categories/` for the filter |
| Post panel | `GET /posts/{id}/`, `GET /posts/{id}/history/`; `POST /posts/{id}/review/` with `{action: publish}`, `{action: recheck, comment}`, `{action: discard, comment}`, `{action: unpublish, comment}` or `{action: reverse, to_status, comment}`; `POST /posts/{id}/urgent/` `{is_urgent}` when `allowed_actions` has `set_urgent`. Shows `event`, `is_urgent` and video media (`kind: "video"`, `url`, `poster_url`) |
| Reports | `GET /admin/reports/posts-by-area/`, `GET /admin/reports/review-time/`, `GET /admin/reports/admin-activity/?page_size=8`; CSV only, one per report: `GET /admin/reports/{posts-by-area,review-time,admin-activity}/export/?format=csv` |
| Audit log | `GET /audit/?q=&page=&page_size=20`; CSV: `GET /audit/export/?q=` |
| Contact messages | `GET /admin/contact-messages/?status=new\|handled&q=&page=&page_size=20` (no `status` for All); `PATCH /admin/contact-messages/{id}/` `{handled}` |
| Settings | `GET /admin/settings/`, `PATCH /admin/settings/` `{review_escalation_hours}` or `{languages: {en}}`; `GET /admin/categories/`, `POST /admin/categories/` `{key, name_te, name_en}`, `PATCH /admin/categories/{id}/` `{is_active}`; `GET /admin/notification-templates/`, `PATCH /admin/notification-templates/{key}/` `{text_te, text_en}`; `GET /admin/role-passwords/`, `PATCH /admin/role-passwords/{ROLE}/` `{password}` |

CSV downloads go through `GC_API.download`, which fetches with the bearer token and saves the file, because a plain link cannot carry the token.

### Error codes the console handles

| Code | What the console does |
|---|---|
| `token_expired` (401) | `gc-api.js` refreshes once through the cookie and retries |
| other 401 (`session_revoked`, `token_invalid`, `not_authenticated`) | back to the login screen with "Your session has ended" |
| `password_change_required` (403) | shows the change-password screen |
| `not_console_user` (403) | toast with the server's message on the login screen |
| `invalid_credentials` (400) | toast; the password field is cleared |
| `already_decided` (409) | toast "Already decided by <name> (<role>)", then reloads the post list and the post |
| `validation_error` (400) | toast with the message and the first field error |
| `throttled` (429) | toast with the server's message |
| CSV import errors | a dialog with the first five errors from the dry-run report |

Any other error shows the server's message in the toast.
