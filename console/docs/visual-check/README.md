# Console visual check, 2026-10-21

Every console screen, prototype (`proto-*.png`) next to the port (`port-*.png`), at 1440x900 in Chromium. Produced by `console/tools/visual-check.mjs`; differences measured by `console/tools/visual_diff.py`.

The port ran against a local database seeded with the prototype's villages and officials, so names, counts and dates differ from the prototype's mock data by design.

| Screen | Pixels that differ | What differs |
|---|---|---|
| Login | 3.6% | Mobile number, Send OTP, "or" and the demo login button are replaced by username, password and Sign in, in the same card and styles (owner's change: no SMS or OTP). |
| Change password (was Enter OTP) | 3.9% | The OTP boxes are replaced by current and new password fields and "Save & continue", in the same card. "Fill demo OTP" is gone. |
| Dashboard | 5.1% | Data only. |
| Geography | 0.4% | An "Import CSV" button next to "+ Add district". |
| Users | 7.3% | A "Reset" button next to Reassign and Block. The wider actions column makes long names, mobile numbers and "Panchayat Member" chips wrap. Rows are sorted by name. |
| Add User | 6.5% | New Email and "Username (optional)" fields; Mobile is marked optional; the help line says the login details are emailed. |
| Posts | 1.6% | Data only. A pager appears under the table when there is more than one page. |
| Post review panel | 5.2% | Data only. Real photos replace the sample photo. No English subtitle when a post has no translation. The author's mobile is not shown (the API does not return it). |
| Reports | 2.5% | Data only. The "Avg h" column of Admin activity shows "—" (the report does not compute it yet). |
| Audit log | 3.8% | Data only. A pager appears under the table when there is more than one page. |
| Settings | 1.4% | Below the fold: a new "Default passwords by role" card in the style of the other settings cards. |

Browser console: the same `<path> attribute d: "{{ n.d }}"` warnings appear on the prototype and the port; the runtime briefly parses the raw template before rendering. The port also logged 404s for endpoints that were still being built during the check (`/admin/role-passwords/`).

Not checked here: the login and change-password calls against the real endpoints (they were faked in the browser for this run, because the password login was still being built), the 409 "already decided" toast, and CSV import with a real file. Backend tests cover the endpoints.

## Change check: owner decisions, 2026-10-21

Every screen at 1440x900 against a seeded local backend, compared with the console as committed before this change. Every difference is one of the changes below or seed data (names, dates, counts).

| Change | Where it shows | Screenshot |
|---|---|---|
| New "Contact messages" page, after Audit Log in the sidebar, in the Audit Log style: search, New / Handled / All filter, count, table, pager, and Mark handled / Mark new. | The sidebar item moves Settings down one row on every screen. | `change-01-sidebar.png`, `change-10-contact-new.png`, `change-11-contact-handled.png` |
| Reset password moved from the users table to the user panel. | Users table actions are now View, Reassign, Block. | `change-02-users-no-reset.png`, `change-03-user-panel-roles.png` |
| Second roles in the user panel: a Roles list with Remove, and "+ Add role" (role, then area). | User panel. | `change-03` to `change-05` |
| Reports are CSV only. Export PDF is gone, and each Export CSV now downloads its own report (before, all three downloaded Posts by area). | Reports. | `change-06-reports-csv-only.png` |
| Post review panel: Urgent chip, event chip (kind and dates), video player, and a Mark urgent / Remove urgent button when the API allows it. | Post review panel. | `change-07-post-urgent-event.png`, `change-08-post-video.png` |
| Readable labels for every audit action key, for example "marked post urgent", "handled contact message", "changed password". | Audit log. | `change-09-audit-labels.png` |

Checked end to end against the API, with zero page errors:

- Add role returned 201 and Remove returned 204.
- Mark handled and Mark new each returned 200.
- Remove urgent and Mark urgent each returned 200.
- The three Export CSV buttons called the posts-by-area, review-time and admin-activity exports.

The video check used a stored poster with no real MP4 file. The player, its poster and its controls render, but playback was not tested.

## Change check: session login, permissions and temporary passwords, 2026-10-21

Every console screen at 1440x900, compared with the console as committed before this change (`17b9b53`). The new backend was still being built, so this run used a small test adapter that speaks the new session interface in front of the previous backend. Repeat the run against the new backend before release (`.claude/backlog.md`, item 1).

| Screen | Pixels that differ | What differs |
|---|---|---|
| Login | 0.02% | The field label is "Username" instead of "Username or email". Email is contact only now. |
| Change password, dashboard, geography, users, posts, post panel, reports, audit, settings | 0% to 6.3% | Data only: seed dates, counts and audit rows. Settings no longer has the "Default passwords by role" card, which sat below the fold. |

New, in the existing styles:

| Change | Screenshot |
|---|---|
| Login errors in the existing toast: wrong password, locked out (with minutes left), blocked, not a console user. | `auth-01-wrong-password.png` |
| Forced change at first login; "Change password" in the profile menu opens the same card with "‹ Back". | `auth-02-forced-change.png`, `auth-03-profile-menu.png`, `auth-04-change-password.png` |
| User panel: Reset password, and Unlock while the user is locked out; the Status line says "locked after failed logins". | `auth-05-user-panel-unlock.png` |
| Reset password dialog: a temporary password field with Generate; empty means the server generates one. | `auth-06-reset-dialog.png` |
| A generated password is shown once, with Copy and Done and no Cancel. | `auth-07-password-shown-once.png` |
| Add User: Username (required), Email and Mobile optional, "Temporary password (optional)" with Generate, and a help line about handing the password over in person. | `auth-08-add-user.png` |
| Menus follow permissions: without `geography.manage_master_data` and `audit.view_audit_log` those pages are gone, and Add User offers only the roles the user may manage. | `auth-09-limited-permissions.png` |

Checked in the browser, all passing: wrong password, refusal of a District Admin, forced change, reload keeps the session, Generate, the password shown once, Copy to the clipboard, Unlock, the voluntary change, logout, and a reload after logout. There were zero page errors. No request carried an Authorization header, and every write sent `X-CSRFToken`.

Not checked yet, because they need the new backend: creating a user without an email, the server-generated password, the lockout and blocked messages from real responses, and the 30-minute idle timeout.
