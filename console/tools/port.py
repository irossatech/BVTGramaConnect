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
    FIELD % {"label": "Username", "name": "username", "type": "text", "value": "username", "change": "onLogin", "key": "onLoginKey", "auto": "username"},
    FIELD % {"label": "Password", "name": "password", "type": "password", "value": "password", "change": "onLogin", "key": "onLoginKey", "auto": "current-password"},
    PRIMARY % {"go": "signIn", "off": "cannotSignIn", "op": "signInOpacity", "label": "Sign in"},
])
CHANGE_CARD = "\n".join([
    '            <div><div style="font-family:\'Rubik\',sans-serif;font-size:26px;font-weight:700;color:#0A2550">Change password</div>'
    '<div style="color:#6b7a8c;margin-top:4px">{{ cpSub }}</div></div>',
    FIELD % {"label": "Current password", "name": "current", "type": "password", "value": "cpCurrent", "change": "onCp", "key": "onCpKey", "auto": "current-password"},
    FIELD % {"label": "New password", "name": "next", "type": "password", "value": "cpNext", "change": "onCp", "key": "onCpKey", "auto": "new-password"},
    PRIMARY % {"go": "changePassword", "off": "cannotChange", "op": "changeOpacity", "label": "Save & continue"},
    '            <div style="display:flex;justify-content:space-between"><button onClick="{{ cpBack }}" style="background:none;border:0;color:#6b7a8c;font-weight:700;cursor:pointer">{{ cpBackLabel }}</button></div>',
])
PANEL_BTN = (
    '<sc-if value="{{ su.canReset }}" hint-placeholder-val="{{ true }}">'
    '<button onClick="{{ su.reset }}" style="height:42px;padding:0 18px;border-radius:999px;font-weight:700;cursor:pointer;'
    'font-size:13px;border:1.5px solid #cfd8e3;background:#fff;color:#3b4a5c">Reset password</button></sc-if>'
    '<sc-if value="{{ su.canUnlock }}" hint-placeholder-val="{{ false }}">'
    '<button onClick="{{ su.unlock }}" style="height:42px;padding:0 18px;border-radius:999px;font-weight:700;cursor:pointer;'
    'font-size:13px;border:1.5px solid #cfd8e3;background:#fff;color:#3b4a5c">Unlock</button></sc-if>'
)
DRAWER_FIELD = (
    '          <label style="display:flex;flex-direction:column;gap:6px"><span style="font-size:12px;font-weight:700;color:#0A2550">%(label)s</span>'
    '<input name="%(name)s" type="%(type)s" value="{{ nu.%(name)s }}" onChange="{{ onNU }}" placeholder="%(ph)s" '
    'style="height:44px;padding:0 12px;border:1px solid #cfd8e3;border-radius:10px;font-size:14px;outline-color:#0D3B7A"></label>'
)
PASSWORD_FIELD = (
    '          <label style="display:flex;flex-direction:column;gap:6px"><span style="font-size:12px;font-weight:700;color:#0A2550">Temporary password (optional)</span>'
    '<span style="display:flex;gap:10px"><input name="password" type="text" value="{{ nu.password }}" onChange="{{ onNU }}" placeholder="Leave empty to generate one" autocomplete="off" '
    'style="flex:1;height:44px;padding:0 12px;border:1px solid #cfd8e3;border-radius:10px;font-size:14px;outline-color:#0D3B7A">'
    '<button onClick="{{ genNU }}" style="height:44px;padding:0 18px;border:1.5px solid #cfd8e3;border-radius:999px;background:#fff;color:#3b4a5c;font-weight:700;cursor:pointer">Generate</button></span></label>'
)
# Modal: a one-line input with Generate, and a value shown once with Copy.
MODAL_INPUT = (
    '<sc-if value="{{ modal.hasInput }}" hint-placeholder-val="{{ false }}"><label style="display:flex;flex-direction:column;gap:6px">'
    '<span style="font-size:12px;font-weight:700;color:#0A2550">{{ modal.inputLabel }}</span><span style="display:flex;gap:10px">'
    '<input type="text" value="{{ modalText }}" onChange="{{ onModalText }}" placeholder="{{ modal.inputPh }}" autocomplete="off" '
    'style="flex:1;height:44px;padding:0 12px;border:1px solid #cfd8e3;border-radius:10px;font-size:14px;outline-color:#0D3B7A">'
    '<button onClick="{{ genModal }}" style="height:44px;padding:0 18px;border:1.5px solid #cfd8e3;border-radius:999px;background:#fff;color:#3b4a5c;font-weight:700;cursor:pointer">Generate</button>'
    '</span></label></sc-if>'
    '<sc-if value="{{ modal.hasSecret }}" hint-placeholder-val="{{ false }}"><span style="display:flex;gap:10px">'
    '<input type="text" value="{{ modal.secret }}" onChange="{{ noop }}" autocomplete="off" '
    'style="flex:1;height:44px;padding:0 12px;border:1px solid #cfd8e3;border-radius:10px;font-size:14px;outline-color:#0D3B7A;letter-spacing:.08em">'
    '<button onClick="{{ copySecret }}" style="height:44px;padding:0 18px;border:1.5px solid #cfd8e3;border-radius:999px;background:#fff;color:#3b4a5c;font-weight:700;cursor:pointer">Copy</button>'
    '</span></sc-if>'
)
MENU_CHANGE = (
    '\n              <button onClick="{{ menuChangePassword }}" style="display:block;width:100%;text-align:left;padding:10px 12px;border:0;background:none;'
    'border-radius:8px;cursor:pointer;font-size:14px;color:#17212e">Change password</button>'
)


def shown_if(flag: str, html: str, hint: str = "true") -> str:
    """Wrap an element so it shows only when the signed-in user may use it."""
    return '<sc-if value="{{ %s }}" hint-placeholder-val="{{ %s }}">%s</sc-if>' % (flag, hint, html)


# Contact messages page: same layout, table and paging as the Audit Log page.
CONTACT_PAGE = "\n".join([
    "        <!-- CONTACT MESSAGES -->",
    '        <sc-if value="{{ pg.contact }}" hint-placeholder-val="{{ false }}">',
    '          <div style="display:flex;gap:12px;align-items:center">',
    '            <div style="display:flex;align-items:center;gap:8px;height:40px;padding:0 12px;border:1px solid #cfd8e3;border-radius:10px;background:#fff;width:360px;color:#6b7a8c">'
    + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>'
    + '<input value="{{ contactQ }}" onChange="{{ onContactQ }}" placeholder="Search name, mobile, village, message…" style="flex:1;border:0;outline:none;font-size:13px;background:transparent"></div>',
    '            <select value="{{ contactFilter }}" onChange="{{ onContactFilter }}" style="height:40px;padding:0 12px;border:1px solid #cfd8e3;border-radius:10px;background:#fff;font-size:13px;min-width:170px"><sc-for list="{{ contactFilters }}" as="o" hint-placeholder-count="3"><option value="{{ o.id }}">{{ o.label }}</option></sc-for></select>',
    '            <span style="font-size:13px;color:#6b7a8c">{{ contactCount }}</span>',
    "          </div>",
    '          <div style="background:#fff;border:1px solid #eef2f6;border-radius:14px;overflow:hidden">',
    '            <table style="width:100%;font-size:13px"><thead><tr style="background:#f7f9fb;color:#6b7a8c;text-align:left;font-size:12px"><th style="padding:12px 16px;font-weight:600">Received</th><th style="padding:12px 16px;font-weight:600">Name</th><th style="padding:12px 16px;font-weight:600">Mobile</th><th style="padding:12px 16px;font-weight:600">Village / Mandal</th><th style="padding:12px 16px;font-weight:600">Message</th><th style="padding:12px 16px;font-weight:600">Status</th><th style="padding:12px 16px"></th></tr></thead>',
    '            <tbody><sc-for list="{{ contactRows }}" as="c" hint-placeholder-count="6"><tr style="border-top:1px solid #f3f5f8"><td style="padding:10px 16px;color:#6b7a8c;white-space:nowrap;font-variant-numeric:tabular-nums">{{ c.time }}</td><td style="padding:10px 16px;font-weight:700;color:#0A2550">{{ c.name }}</td><td style="padding:10px 16px;color:#3b4a5c;white-space:nowrap">{{ c.mobile }}</td><td style="padding:10px 16px;color:#3b4a5c">{{ c.village }}</td><td style="padding:10px 16px;color:#17212e;line-height:1.5">{{ c.message }}</td><td style="padding:10px 16px"><span style="padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;background: {{ c.sbg }};color: {{ c.scolor }}">{{ c.status }}</span></td><td style="padding:10px 16px;text-align:right;white-space:nowrap"><button onClick="{{ c.toggle }}" style="height:30px;padding:0 10px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;color:#3b4a5c;font-weight:700;cursor:pointer;font-size:12px">{{ c.toggleLabel }}</button></td></tr></sc-for>'
    + EMPTY_ROW % {"flag": "contactEmpty", "cols": 7, "text": "contactEmptyText"} + "</tbody></table>",
    PAGER % {"p": "contactPager"},
    "          </div>",
    "        </sc-if>",
    "",
])

# User panel: every role assignment, with Add role and Remove.
ROLES_BLOCK = (
    '<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:700;color:#0A2550">Roles</span>'
    '<sc-if value="{{ su.canAddRole }}" hint-placeholder-val="{{ true }}"><button onClick="{{ su.addRole }}" style="height:30px;padding:0 12px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;color:#0D3B7A;font-weight:700;cursor:pointer;font-size:12px">+ Add role</button></sc-if></div>\n'
    '            <sc-for list="{{ su.roles }}" as="r" hint-placeholder-count="1"><div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #eef2f6;border-radius:10px;background:#fff">'
    '<span style="padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;background: {{ r.rbg }};color: {{ r.rcolor }}">{{ r.label }}</span>'
    '<span style="flex:1;font-size:13px;color:#3b4a5c">{{ r.area }}</span>'
    '<sc-if value="{{ r.canRemove }}" hint-placeholder-val="{{ true }}"><button onClick="{{ r.remove }}" style="height:28px;padding:0 10px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;color:#b3261e;font-weight:700;cursor:pointer;font-size:12px">Remove</button></sc-if></div></sc-for>\n'
    "            "
)

# Post panel: urgent and event chips next to the category, and the post's video.
POST_CHIPS = (
    '<sc-if value="{{ sp.urgent }}" hint-placeholder-val="{{ false }}"><span style="padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background:#fde7e5;color:#b3261e">Urgent</span></sc-if>'
    '<sc-if value="{{ sp.hasEvent }}" hint-placeholder-val="{{ false }}"><span style="padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background: {{ sp.eventBg }};color: {{ sp.eventColor }}">{{ sp.eventLabel }}</span></sc-if>'
)
VIDEO_BLOCK = (
    '<sc-if value="{{ sp.hasVideo }}" hint-placeholder-val="{{ false }}"><sc-for list="{{ sp.videos }}" as="v" hint-placeholder-count="1">'
    '<video src="{{ v.src }}" poster="{{ v.poster }}" controls="{{ true }}" preload="none" style="width:100%;aspect-ratio:16/9;border-radius:10px;background:#0A2550;object-fit:contain"></video>'
    "</sc-for></sc-if>\n            "
)

EXPORT_PDF = (
    '<button onClick="{{ exportPdf }}" style="height:32px;padding:0 12px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;'
    'color:#0D3B7A;font-weight:700;cursor:pointer;font-size:12px">Export PDF</button>'
)


def line_edits(lines: list[str]) -> None:
    """Edits made by position, because the same text appears more than once."""
    expect = {
        47: "Mobile number",              # L48 login field label
        51: "Demo login as Super Admin",  # L52
        56: "Enter OTP",                  # L57
        59: "Fill demo OTP",              # L60
        236: "Posts by area",              # L237 report card
        241: "Average review time by level",  # L242 report card
        252: "Admin activity",             # L253 report card
    }
    for index, text in expect.items():
        if text not in lines[index]:
            raise SystemExit(f"Line {index + 1} changed in the prototype: {lines[index][:80]!r}")
    # Reports: one export per report card (CSV only).
    for index, handler in ((236, "exportByArea"), (241, "exportReviewTime"), (252, "exportActivity")):
        if lines[index].count("{{ exportCsv }}") != 1:
            raise SystemExit(f"Line {index + 1}: expected one Export CSV button")
        lines[index] = lines[index].replace("{{ exportCsv }}", "{{ %s }}" % handler)
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
    page = "\n".join(lines)
    audit_export = re.search(r'<button onClick="\{\{ exportCsv \}\}".*?</button>', lines[263]).group(0)  # L264
    mobile = re.search(r'<label[^\n]*?Mobile</span><input name="mobile".*?</label>', page).group(0)
    role_select = re.search(r'<select name="role" value="\{\{ nu\.role \}\}"[^>]*>.*?</select>', page).group(0)
    role_options = role_select[role_select.index(">") + 1:-len("</select>")]
    button = lambda handler: re.search(r'<button onClick="\{\{ %s \}\}".*?</button>' % re.escape(handler), page).group(0)
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
        # Panel buttons by permission: Reassign, Reset password, Unlock, Block.
        (button("su.reassign"), shown_if("su.canReassign", button("su.reassign"))),
        (button("su.toggle"), PANEL_BTN + shown_if("su.canToggle", button("su.toggle"))),
        # Users table row buttons by permission.
        (button("u.reassign"), shown_if("u.canReassign", button("u.reassign"))),
        (button("u.toggle"), shown_if("u.canToggle", button("u.toggle"))),
        (button("openAddUser"), shown_if("canAddUser", button("openAddUser"))),
        (audit_export, shown_if("canExportAudit", audit_export)),
        # Profile menu: Settings by permission, then Change password.
        (button("goSettingsM"), shown_if("canSettings", button("goSettingsM")) + MENU_CHANGE),
        # Screen name: the OTP card is now the change-password card.
        ("{{ is.otp }}", "{{ is.changePassword }}"),
        ("<!-- LOGIN / OTP -->", "<!-- LOGIN / CHANGE PASSWORD -->"),
        # Modal: password input with Generate, a value shown once, and no Cancel on that last one.
        ("</textarea></label></sc-if>", "</textarea></label></sc-if>" + MODAL_INPUT),
        (button("closeModal"), shown_if("modal.hasCancel", button("closeModal"))),
        # Add User: username (required), email and mobile optional, temporary password; no email invite.
        (
            '<input name="te" value="{{ nu.te }}" onChange="{{ onNU }}" style="height:44px;padding:0 12px;border:1px solid #cfd8e3;border-radius:10px;font-size:14px;outline-color:#0D3B7A"></label>',
            '<input name="te" value="{{ nu.te }}" onChange="{{ onNU }}" style="height:44px;padding:0 12px;border:1px solid #cfd8e3;border-radius:10px;font-size:14px;outline-color:#0D3B7A"></label>\n'
            + DRAWER_FIELD % {"label": "Username", "name": "username", "type": "text", "ph": "e.g. ravi.kumar"} + "\n"
            + DRAWER_FIELD % {"label": "Email (optional)", "name": "email", "type": "email", "ph": "name@example.com"},
        ),
        (mobile, mobile.replace('>Mobile</span>', '>Mobile (optional)</span>') + "\n" + PASSWORD_FIELD),
        (role_select, role_select.replace(role_options, '<sc-for list="{{ nuRoles }}" as="o" hint-placeholder-count="4"><option value="{{ o.id }}">{{ o.label }}</option></sc-for>')),
        (
            "The user receives an SMS with an OTP login link.",
            "Leave the password empty to generate one. It is shown once after you save: give it to the person yourself. They choose their own password at first login.",
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
        # CSV only: no PDF export.
        (EXPORT_PDF, ""),
        # Contact messages page before Settings.
        ("        <!-- SETTINGS -->", CONTACT_PAGE + "        <!-- SETTINGS -->"),
        # User panel: roles with Add role and Remove.
        ('<div style="font-weight:700;color:#0A2550">Recent posts by this user</div>',
         ROLES_BLOCK + '<div style="font-weight:700;color:#0A2550">Recent posts by this user</div>'),
        # Post panel: urgent and event chips, video.
        ('<span style="font-size:12px;color:#6b7a8c">{{ sp.area }} · {{ sp.date }}</span>',
         POST_CHIPS + '<span style="font-size:12px;color:#6b7a8c">{{ sp.area }} · {{ sp.date }}</span>'),
        ('<sc-if value="{{ sp.hasPhoto }}"', VIDEO_BLOCK + '<sc-if value="{{ sp.hasPhoto }}"'),
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
