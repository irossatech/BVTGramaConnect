"""Port "Super Admin Console.dc.html" from the prototype folder into console/src/ (shared runtime files go to shared/).

Run again whenever the designer re-exports the console:

    python tools/port.py "<prototype folder>"

Every change to the page is listed below as an exact text replacement and
must match exactly once, so a re-export that moves things fails loudly
instead of silently drifting. Markup, styles and assets are otherwise copied
byte for byte. The logic class is replaced by tools/logic.js.
"""

from __future__ import annotations

import re
import shutil
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
SHARED = ROOT.parent / "shared"  # runtime, React, design system and images used by both apps
DEFAULT_PROTOTYPE = ROOT.parent.parent.parent / "BVT Grama Connect mobile prototype"
PAGE = "Super Admin Console.dc.html"
DS = "_ds/bvt-grama-connect-design-system-3ef6e40d-8ee6-48d5-96b2-aa4e7390341d"
ASSETS = ["village-landscape.jpg", "logo-mark.png", "icon-announce.png", "icon-schemes.png", "icon-news.png", "icon-updates.png"]
VENDOR = {
    "react.production.min.js": "https://unpkg.com/react@18.3.1/umd/react.production.min.js",
    "react-dom.production.min.js": "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js",
}

PAGER = (
    '<sc-if value="{{ %(p)s.show }}" hint-placeholder-val="{{ false }}"><div style="display:flex;justify-content:flex-end;'
    'align-items:center;gap:10px;font-size:13px;color:#6b7a8c">'
    '<button onClick="{{ %(p)s.prev }}" style="height:30px;padding:0 12px;border:1px solid #cfd8e3;border-radius:999px;'
    'background:#fff;color:#0D3B7A;font-weight:700;cursor:pointer;font-size:12px;opacity: {{ %(p)s.prevOpacity }}">‹ Prev</button>'
    '<span>Page {{ %(p)s.page }} of {{ %(p)s.pages }}</span>'
    '<button onClick="{{ %(p)s.next }}" style="height:30px;padding:0 12px;border:1px solid #cfd8e3;border-radius:999px;'
    'background:#fff;color:#0D3B7A;font-weight:700;cursor:pointer;font-size:12px;opacity: {{ %(p)s.nextOpacity }}">Next ›</button>'
    "</div></sc-if>"
)

EMPTY_ROW = (
    '<sc-if value="{{ %(flag)s }}" hint-placeholder-val="{{ false }}"><tr><td colspan="%(cols)d" '
    'style="padding:40px;text-align:center;color:#6b7a8c">{{ %(text)s }}</td></tr></sc-if>'
)

IMPORT_BUTTON = (
    '<button onClick="{{ importCsv }}" style="height:36px;padding:0 14px;border:1px solid #cfd8e3;border-radius:999px;'
    'background:#fff;color:#0D3B7A;font-weight:700;cursor:pointer;font-size:13px">Import CSV</button>'
)


TABLE_END = "            </sc-for></tbody></table>"

# Login is username + password (no SMS/OTP). Same card, labels and input styles as the prototype's mobile field.
FIELD = (
    '            <label style="display:flex;flex-direction:column;gap:6px"><span style="font-size:13px;font-weight:700;color:#0A2550">%(label)s</span>'
    '<input name="%(name)s" type="%(type)s" value="{{ %(value)s }}" onChange="{{ %(change)s }}" onKeyDown="{{ %(key)s }}" autocomplete="%(auto)s" '
    'style="height:48px;padding:0 14px;border:1px solid #cfd8e3;border-radius:10px;font-size:15px;outline-color:#0D3B7A"></label>'
)
PRIMARY = (
    '            <button onClick="{{ %(go)s }}" disabled="{{ %(off)s }}" style="height:48px;border:0;border-radius:999px;background:#0D3B7A;'
    'color:#fff;font-size:15px;font-weight:700;cursor:pointer;opacity: {{ %(op)s }}">%(label)s ›</button>'
)
LOGIN_FIELDS = "\n".join([
    FIELD % {"label": "Username or email", "name": "username", "type": "text", "value": "username", "change": "onLogin", "key": "onLoginKey", "auto": "username"},
    FIELD % {"label": "Password", "name": "password", "type": "password", "value": "password", "change": "onLogin", "key": "onLoginKey", "auto": "current-password"},
    PRIMARY % {"go": "signIn", "off": "cannotSignIn", "op": "signInOpacity", "label": "Sign in"},
])
CHANGE_CARD = "\n".join([
    '            <div><div style="font-family:\'Rubik\',sans-serif;font-size:26px;font-weight:700;color:#0A2550">Change password</div>'
    '<div style="color:#6b7a8c;margin-top:4px">Choose your own password before you continue.</div></div>',
    FIELD % {"label": "Current password", "name": "current", "type": "password", "value": "cpCurrent", "change": "onCp", "key": "onCpKey", "auto": "current-password"},
    FIELD % {"label": "New password", "name": "next", "type": "password", "value": "cpNext", "change": "onCp", "key": "onCpKey", "auto": "new-password"},
    PRIMARY % {"go": "changePassword", "off": "cannotChange", "op": "changeOpacity", "label": "Save & continue"},
    '            <div style="display:flex;justify-content:space-between"><button onClick="{{ toLogin }}" style="background:none;border:0;color:#6b7a8c;font-weight:700;cursor:pointer">‹ Sign out</button></div>',
])
SMALL_BTN = (
    '<button onClick="{{ %(go)s }}" style="height:30px;padding:0 10px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;'
    'color:#3b4a5c;font-weight:700;cursor:pointer;font-size:12px;margin-left:6px">Reset</button>'
)
PANEL_BTN = (
    '<button onClick="{{ su.reset }}" style="height:42px;padding:0 18px;border-radius:999px;font-weight:700;cursor:pointer;'
    'font-size:13px;border:1.5px solid #cfd8e3;background:#fff;color:#3b4a5c">Reset password</button>'
)
DRAWER_FIELD = (
    '          <label style="display:flex;flex-direction:column;gap:6px"><span style="font-size:12px;font-weight:700;color:#0A2550">%(label)s</span>'
    '<input name="%(name)s" type="%(type)s" value="{{ nu.%(name)s }}" onChange="{{ onNU }}" placeholder="%(ph)s" '
    'style="height:44px;padding:0 12px;border:1px solid #cfd8e3;border-radius:10px;font-size:14px;outline-color:#0D3B7A"></label>'
)
ROLE_PASSWORDS_CARD = "\n".join([
    '          <div style="background:#fff;border:1px solid #eef2f6;border-radius:14px;padding:20px 22px;display:flex;flex-direction:column;gap:12px">',
    '            <span style="font-family:\'Rubik\',sans-serif;font-size:16px;font-weight:700;color:#0A2550">Default passwords by role</span>',
    '            <div style="font-size:13px;color:#3b4a5c;line-height:1.5">New users and password resets get the default password of their role and must change it at first login. A change here affects only future invites and resets.</div>',
    '            <sc-for list="{{ rolePasswords }}" as="rp" hint-placeholder-count="4">',
    '              <div style="display:grid;grid-template-columns:200px 1fr 1fr auto;gap:16px;align-items:center;padding:12px 0;border-bottom:1px solid #f3f5f8">',
    '                <span><span style="display:block;font-weight:700;color:#0A2550">{{ rp.role }}</span></span>',
    '                <span style="font-size:13px;color:#3b4a5c;line-height:1.5;letter-spacing:.08em">{{ rp.masked }}</span>',
    '                <span style="font-size:12px;color:#6b7a8c;line-height:1.5">{{ rp.updated }}</span>',
    '                <button onClick="{{ rp.edit }}" style="height:32px;padding:0 14px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;color:#0D3B7A;font-weight:700;cursor:pointer;font-size:12px">Edit</button>',
    '              </div>',
    '            </sc-for>',
    '          </div>',
])


def line_edits(lines: list[str]) -> None:
    """Edits made by position, because the same text appears more than once."""
    expect = {
        47: "Mobile number",              # L48 login field label
        51: "Demo login as Super Admin",  # L52
        56: "Enter OTP",                  # L57
        59: "Fill demo OTP",              # L60
        309: "          </div>",          # L310 end of the templates card
        310: "        </sc-if>",          # L311 end of the settings page
    }
    for index, text in expect.items():
        if text not in lines[index]:
            raise SystemExit(f"Line {index + 1} changed in the prototype: {lines[index][:80]!r}")
    # Settings: role passwords card after the notification templates card.
    lines[309] = lines[309] + "\n" + ROLE_PASSWORDS_CARD
    # Change-password card replaces the OTP card's contents (L57-L60).
    lines[56:60] = [CHANGE_CARD]
    # Login: username + password + Sign in replace mobile, Send OTP, "or" and demo login (L48-L52).
    lines[47:52] = [LOGIN_FIELDS]
    # Users and posts tables end with identical lines; positions shift by the edits above.
    users = next(i for i, line in enumerate(lines) if line == TABLE_END)
    posts = next(i for i, line in enumerate(lines) if line == TABLE_END and i > users)
    for index in (users, posts):
        if lines[index] != TABLE_END:
            raise SystemExit(f"Line {index + 1} is not the end of a table any more: {lines[index][:80]!r}")
    lines[users] = (
        "            </sc-for>" + EMPTY_ROW % {"flag": "userEmpty", "cols": 7, "text": "userEmptyText"}
        + "</tbody></table>"
    )
    lines[users + 1] = lines[users + 1] + "\n" + PAGER % {"p": "usersPager"}
    lines[posts + 1] = lines[posts + 1] + "\n" + PAGER % {"p": "postsPager"}


def edits(lines: list[str]) -> list[tuple[str, str]]:
    """(old, new) pairs. Each old string must occur exactly once in the page."""
    audit_body = lines[267]    # L268: audit table body
    add_district = re.search(r'<button onClick="\{\{ addDistrict \}\}".*?</button>', lines[144]).group(0)
    return [
        # Head: local React before the runtime, then config and the API client.
        ("<html>", '<html data-ds-base="assets">'),
        (
            '<script src="./support.js"></script>',
            '<script src="vendor/react.production.min.js"></script>\n'
            '<script src="vendor/react-dom.production.min.js"></script>\n'
            '<script src="config.js"></script>\n<script src="gc-api.js"></script>\n'
            '<script src="./support.js"></script>',
        ),
        # Reset password next to Reassign and Block (row and side panel).
        ('<button onClick="{{ u.toggle }}"', SMALL_BTN % {"go": "u.reset"} + '<button onClick="{{ u.toggle }}"'),
        ('<button onClick="{{ su.toggle }}"', PANEL_BTN + '<button onClick="{{ su.toggle }}"'),
        # Add User: email (required) and username; mobile optional; no SMS.
        (
            '<input name="te" value="{{ nu.te }}" onChange="{{ onNU }}" style="height:44px;padding:0 12px;border:1px solid #cfd8e3;border-radius:10px;font-size:14px;outline-color:#0D3B7A"></label>',
            '<input name="te" value="{{ nu.te }}" onChange="{{ onNU }}" style="height:44px;padding:0 12px;border:1px solid #cfd8e3;border-radius:10px;font-size:14px;outline-color:#0D3B7A"></label>\n'
            + DRAWER_FIELD % {"label": "Email", "name": "email", "type": "email", "ph": "name@example.com"} + "\n"
            + DRAWER_FIELD % {"label": "Username (optional)", "name": "username", "type": "text", "ph": "Defaults to the email"},
        ),
        (
            '<span style="font-size:12px;font-weight:700;color:#0A2550">Mobile</span><input name="mobile"',
            '<span style="font-size:12px;font-weight:700;color:#0A2550">Mobile (optional)</span><input name="mobile"',
        ),
        (
            "The user receives an SMS with an OTP login link.",
            "They get an email with their username and a temporary password.",
        ),
        # Signed-in official instead of the mock identity.
        (">S</span><span style=\"text-align:left;line-height:1.2\">", ">{{ meInitial }}</span><span style=\"text-align:left;line-height:1.2\">"),
        (">Sita Mahalakshmi</span>", ">{{ meName }}</span>"),
        # State root of the geography tree from master data.
        (
            'Andhra Pradesh <span style="font-weight:500;color:#6b7a8c">ఆంధ్రప్రదేశ్</span>',
            '{{ stateName }} <span style="font-weight:500;color:#6b7a8c">{{ stateTe }}</span>',
        ),
        # CSV import next to "+ Add district".
        (add_district, '<span style="display:flex;gap:8px">' + IMPORT_BUTTON + add_district + "</span>"),
        # Category filter from the categories API.
        (
            '<option value="announce">Announcements</option><option value="schemes">Govt Schemes</option>'
            '<option value="news">News &amp; Notices</option><option value="updates">Public Updates</option>',
            '<sc-for list="{{ catOpts }}" as="c" hint-placeholder-count="4"><option value="{{ c.id }}">{{ c.label }}</option></sc-for>',
        ),
        # Real post photos.
        (
            '<img src="assets/village-landscape.jpg" alt="" style="width:100%;aspect-ratio:4/3',
            '<img src="{{ ph.src }}" alt="" style="width:100%;aspect-ratio:4/3',
        ),
        # Loading and empty text, paging.
        ("No posts match these filters.", "{{ postEmptyText }}"),
        (
            audit_body,
            audit_body.replace(
                "</sc-for></tbody></table>",
                "</sc-for>" + EMPTY_ROW % {"flag": "auditEmpty", "cols": 6, "text": "auditEmptyText"} + "</tbody></table>",
            )
            + "\n" + PAGER % {"p": "auditPager"},
        ),
    ]


def port(prototype: Path) -> None:
    page = (prototype / PAGE).read_text(encoding="utf-8")
    lines = page.split("\n")
    pairs = edits(lines)
    line_edits(lines)
    page = "\n".join(lines)
    for old, new in pairs:
        count = page.count(old)
        if count != 1:
            raise SystemExit(f"Expected one match, found {count}: {old[:90]!r}")
        page = page.replace(old, new)

    start = page.index("class Component extends DCLogic {")
    end = page.index("</script>", start)
    logic = (ROOT / "tools" / "logic.js").read_text(encoding="utf-8")
    page = page[:start] + logic.rstrip() + "\n" + page[end:]

    SRC.mkdir(exist_ok=True)
    (SRC / "index.html").write_text(page, encoding="utf-8", newline="\n")
    shutil.copy2(prototype / "support.js", SHARED / "support.js")
    shutil.copytree(prototype / DS, SHARED / DS, dirs_exist_ok=True)
    (SHARED / "assets").mkdir(parents=True, exist_ok=True)
    for name in ASSETS:
        shutil.copy2(prototype / "assets" / name, SHARED / "assets" / name)
    vendor = SHARED / "vendor"
    vendor.mkdir(exist_ok=True)
    for name, url in VENDOR.items():
        target = vendor / name
        if not target.exists():
            with urllib.request.urlopen(url) as response:
                target.write_bytes(response.read())
    print(f"Ported {PAGE} into {SRC}")


if __name__ == "__main__":
    port(Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PROTOTYPE)
