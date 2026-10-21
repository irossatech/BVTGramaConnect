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
