// Audit log page (sidebar "Audit Log"), its CSV export, and how one audit entry is shown, which the Dashboard's
// "Recent activity" uses too. Moved out of Console.tsx unchanged (audit WEB-ARCH-001).
// Calls GET /audit/ and GET /audit/export/ (.claude/api.md).
import type { AuditEntry, Paged } from "../types";
import { pageCount, pager, PAGE_SIZE, RK, ROLE, type FieldChange } from "../model";
import type { ConsoleHost } from "./host";
import { exportReport } from "./reports";
import { ago } from "./notifications";

// What each audit action key says, as a phrase after the person's name ("Ravi Kumar published a post").
// Every key the server records (BackEnd apps/**, record(...)); an unknown key falls back to its own words.
const ACT: Readonly<Record<string, string>> = {'post.created':'wrote a post','post.updated':'edited a post','post.deleted':'deleted a draft post','post.submitted':'sent a post for review','post.resubmitted':'sent a post again after fixing it','post.published':'published a post','post.auto_published':'published a post','post.recheck':'sent a post for recheck','post.rechecked':'sent a post for recheck','post.discarded':'discarded a post','post.unpublished':'took down a post','post.reversed':'changed a review decision','post.overridden':'changed a review decision','post.escalated':'escalated a post (waited past the time limit)','post.urgent_set':'marked a post urgent','post.urgent_cleared':'removed the urgent mark from a post','user.created':'added a user','user.updated':'edited a user’s details','user.username_changed':'changed a user’s username','user.blocked':'blocked a user','user.unblocked':'unblocked a user','user.reassigned':'moved a user to another area','user.assignment_added':'gave a user a role','user.assignment_removed':'removed a role from a user','user.assignment_changed':'changed the area of a user’s role','user.password_reset':'reset a user’s password','user.password_set':'set a temporary password','user.password_changed':'changed their password','user.unlocked':'unlocked a user','user.super_admin_created':'added a Super Admin','user.super_admin_role_added':'gave the Super Admin role','user.super_admin_role_removed':'removed the Super Admin role','group.permissions_changed':'changed a role’s permissions','auth.login':'signed in','auth.logout':'signed out','auth.login_failed':'failed to sign in (wrong password)','auth.login_refused':'was refused sign-in','auth.locked_out':'was locked out after failed sign-ins','auth.ip_locked_out':'was locked out (too many failed sign-ins from one network)','auth.password_change_failed':'entered a wrong current password','auth.password_change_locked':'was locked out of changing the password','auth.password_too_short':'chose a password that was too short','area.created':'added an area','area.updated':'edited an area','area.deactivated':'switched off an area','area.reactivated':'switched an area back on','area.imported':'imported villages from a CSV file','setting.changed':'changed a setting','setting.role_password_changed':'changed a default password','category.created':'added a post category','category.updated':'changed a post category','template.updated':'edited a notification text','service.created':'added a service','service.updated':'edited a service','service.shown':'showed a service on Home','service.hidden':'hid a service from Home','service.reordered':'changed the order of services','bill.created':'added a bill / recharge','bill.updated':'edited a bill / recharge','bill.shown':'showed a bill on Home','bill.hidden':'hid a bill from Home','bill.reordered':'changed the order of bills','service_request.created':'sent a service request','service_request.assigned':'assigned a service request','service_request.status_changed':'changed a service request’s status','ad.created':'added a sponsored banner','ad.updated':'edited a sponsored banner','ad.deleted':'deleted a sponsored banner','contact.created':'added an important number','contact.updated':'edited an important number','contact.removed':'removed an important number','contacts.imported':'imported important numbers','contact_type.created':'added a number type','contact_type.updated':'changed a number type','contact_type.deleted':'deleted a number type','contact.handled':'marked a contact message handled','contact.reopened':'marked a contact message as new','citizen.registered':'registered a citizen phone','citizen.blocked':'blocked a citizen’s phone','citizen.unblocked':'unblocked a citizen’s phone','citizen.posts_discarded':'discarded a citizen’s waiting posts','report.exported':'exported a report','email.failed':'email not delivered','email.skipped':'email skipped','push.failed':'notification not delivered'};

// Which part of the app an action is about: the small tag in the Audit log's Action column.
const KIND: Readonly<Record<string, readonly [string, string, string]>> = {post: ['Post', '#e3f0fb', '#0D3B7A'], user: ['User', '#f1e6f7', '#8f4bb4'], group: ['User', '#f1e6f7', '#8f4bb4'],
  auth: ['Sign-in', '#eef2f6', '#3b4a5c'], area: ['Area', '#e4f4df', '#1d7a33'], setting: ['Setting', '#fff0dc', '#b35a0e'], category: ['Setting', '#fff0dc', '#b35a0e'], template: ['Setting', '#fff0dc', '#b35a0e'],
  service: ['Service', '#dff3f5', '#07818e'], bill: ['Bill', '#dff3f5', '#07818e'], service_request: ['Request', '#dff3f5', '#07818e'], ad: ['Banner', '#fde7e5', '#b3261e'],
  contact: ['Number', '#e4f4df', '#1d7a33'], contacts: ['Number', '#e4f4df', '#1d7a33'], contact_type: ['Number', '#e4f4df', '#1d7a33'], citizen: ['Citizen', '#fff0dc', '#b35a0e'],
  report: ['Report', '#eef2f6', '#3b4a5c'], email: ['System', '#eef2f6', '#6b7a8c'], push: ['System', '#eef2f6', '#6b7a8c']};

export function loadAudit(h: ConsoleHost, page: number) {
  const latest = h.ticket('audit');
  h.setState({auditLoading: true});
  h.api.get<Paged<AuditEntry> & {window?: {from: string; to: string}}>('/audit/', {q: h.state.auditQ, type: h.state.auditType, page, page_size: PAGE_SIZE})
    // Each entry's `data` (the changed fields, with emails and mobiles) is never shown, so it is not kept.
    .then((d) => latest() && h.setState({audit: d.results.map(({data, ...a}) => ({...a, summary: summaryOf(a.action, data)})), auditCount: d.count, auditWindow: windowLabel(d.window), auditPage: page, auditPages: pageCount(d.count), auditLoading: false}))
    .catch((e: unknown) => {
      if (!latest()) return;
      h.setState({auditLoading: false});
      h.fail(e);
    });
}

// The server lists a recent period only (90 to 180 days): "19 Aug – 17 Nov 2026".
function windowLabel(w?: {from: string; to: string}) {
  if (!w || !w.from || !w.to) return '';
  const day = (iso: string, year: boolean) => new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {day: 'numeric', month: 'short', ...(year ? {year: 'numeric'} : {})});
  return day(w.from, w.from.slice(0, 4) !== w.to.slice(0, 4)) + ' – ' + day(w.to, true);
}

function humanAction(k: string) {
  const p = String(k || '').split('.');
  return (p[1] || p[0]).replace(/_/g, ' ');
}

// "On what" for the actions that record no target_label, from the few fields of `data` that hold no personal
// data (settings, report names, import counts). Everything else in `data` is dropped on load (audit WEB-DP-001).
const SETTING: Readonly<Record<string, string>> = {review_escalation_hours: 'Review time limit', citizen_posts_per_day: 'Citizen posts per day'};
const REPORT: Readonly<Record<string, string>> = {audit: 'Audit log', 'posts-by-area': 'Posts by area', 'review-time': 'How fast posts are reviewed', 'admin-activity': 'Admin activity', summary: 'Report summary'};
function summaryOf(action: string, data: unknown): string {
  const d = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const num = (x: unknown) => (typeof x === 'number' ? x : Number(x) || 0);
  if (action === 'setting.changed') {
    const b = (d.before || {}) as Record<string, unknown>, a = (d.after || {}) as Record<string, unknown>;
    const out: string[] = [];
    for (const k of Object.keys(SETTING)) {
      if (b[k] !== a[k]) out.push(SETTING[k] + ': ' + (k === 'citizen_posts_per_day' && !num(b[k]) ? 'no limit' : String(b[k])) + ' → ' + (k === 'citizen_posts_per_day' && !num(a[k]) ? 'no limit' : String(a[k])) + (k === 'review_escalation_hours' ? ' h' : ''));
    }
    const en = (x: unknown) => !!(x && typeof x === 'object' && (x as Record<string, unknown>).en);
    if (en(b.languages) !== en(a.languages)) out.push('English: ' + (en(a.languages) ? 'switched on' : 'switched off'));
    return out.join('; ') || 'Saved with no change';
  }
  if (action === 'report.exported') {
    const r = String(d.report || '');
    return r ? (REPORT[r] || r) + (d.days ? ' (' + num(d.days) + ' days)' : '') : '';
  }
  if ((action === 'service.reordered' || action === 'bill.reordered') && Array.isArray(d.keys)) {
    const word = (k: unknown) => String(k).replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
    return 'New order: ' + d.keys.map(word).join(', ');
  }
  if (action === 'contacts.imported') return num(d.created) + ' added, ' + num(d.updated) + ' updated, ' + num(d.skipped) + ' skipped';
  return '';
}

// "On what" for every kind of activity: the item's name (post title, person, service…), or a safe summary when the
// server records none, and nothing when the action is about the person themselves (signing in, own password).
const FAILED_SIGN_IN = new Set(['auth.login_failed', 'auth.login_refused', 'auth.locked_out', 'auth.ip_locked_out']);
function onWhat(a: AuditEntry) {
  // Failed or refused sign-ins: the username that was tried (the server masks one that is not an account).
  if (FAILED_SIGN_IN.has(a.action)) return a.target_label ? 'Username: ' + a.target_label : '';
  if (a.action === 'auth.login' || a.action === 'auth.logout') return a.via === 'console' ? 'Web console' : a.via === 'app' ? 'Mobile app' : '';
  if (a.action.startsWith('auth.') || a.action === 'user.password_changed') return '';
  if ((a.action === 'contact.handled' || a.action === 'contact.reopened') && a.target_label) return 'Contact message ' + a.target_label;
  if (a.action === 'report.exported' || a.action === 'setting.changed' || a.action === 'contacts.imported' || a.action === 'service.reordered' || a.action === 'bill.reordered') return a.summary || summaryOf(a.action, a.data) || a.target_label || '';
  return a.target_label || a.summary || '';
}

// Where it happened, with the level so it is clear what kind of place it is: "Kolakaluru village", "Guntur district",
// "Whole state"; empty when the action has no place (signing in, a setting).
function placeOf(area: AuditEntry['area']) {
  if (!area) return '';
  if (area.level === 'STATE') return 'Whole state';
  return area.name + ' ' + String(area.level).toLowerCase();
}

/** One audit entry as a row: the Audit log page, and the Dashboard's "Recent activity". */
export function auditRow(h: ConsoleHost, a: AuditEntry) {
  const rk = RK[a.actor?.role ?? ''] || (a.actor && a.actor.role === 'SYSTEM' ? 'system' : 'super');
  const citizen = !a.actor && a.via === 'citizen';
  // A failed sign-in has no actor: someone who is not signed in, not the system.
  const stranger = !a.actor && FAILED_SIGN_IN.has(a.action);
  const name = (a.actor && a.actor.name) || (citizen ? 'A citizen' : stranger ? 'Someone' : 'System');
  const prefix = String(a.action || '').split('.')[0];
  const kind = a.action === 'contact.handled' || a.action === 'contact.reopened' ? (['Message', '#e3f0fb', '#0D3B7A'] as const) : KIND[prefix] || (['System', '#eef2f6', '#6b7a8c'] as const);
  const action = ACT[a.action] || humanAction(a.action);
  return {time: h.fmt(a.at, false), ago: ago(h, a.at), at: h.fmt(a.at, true), user: name, role: citizen ? 'Citizen (app)' : stranger ? 'Not signed in' : ROLE[rk].label, action, actionCap: action.charAt(0).toUpperCase() + action.slice(1), kind: kind[0], kbg: kind[1], kcolor: kind[2], target: onWhat(a), area: placeOf(a.area), bg: ROLE[rk].bg, initial: name[0], rbg: ROLE[rk].tbg, rcolor: ROLE[rk].tc};
}

// The Audit log's "Export CSV" (the page's filters); elsewhere the posts-by-area report.
function exportCsv(h: ConsoleHost) {
  const s = h.state;
  const stamp = new Date().toISOString().slice(0, 10);
  if (s.page !== 'audit') return exportReport(h, 'posts-by-area');
  if (s.exporting) return;
  h.setState({exporting: 'audit'});
  h.api.download('/audit/export/', {q: s.auditQ, type: s.auditType, format: 'csv'}, 'grama-audit-' + stamp + '.csv').then(() => h.toast('Audit log exported')).catch((e: unknown) => h.fail(e)).finally(() => h.setState({exporting: null}));
}

/** The page's renderVals() values (screens/Audit.tsx). */
export function auditView(h: ConsoleHost) {
  const s = h.state;
  const auditRows = s.audit.map((a) => ({...auditRow(h, a), open: () => h.setState({auditOpen: a})}));
  return {
    exportCsv: () => exportCsv(h),
    auditQ: s.auditQ,
    // Same tabs as the app's Audit screen.
    // The same types as the app's Audit screen, as one dropdown.
    auditType: s.auditType,
    auditTypes: [['', 'All activity'], ['posts', 'Posts'], ['users', 'Users'], ['areas', 'Areas'], ['logins', 'Sign-ins'], ['settings', 'Settings'], ['system', 'System']].map(([id, label]) => ({id, label})),
    onAuditType: (e: FieldChange) => h.setState({auditType: e.target.value}, () => loadAudit(h, 1)),
    // The third column's header names the item when one type is chosen; All activity mixes kinds, so "On what".
    auditOnWhat: ({posts: 'Post', users: 'User', areas: 'Area', settings: 'Change', logins: 'On what', system: 'On what'} as Readonly<Record<string, string>>)[s.auditType] || 'On what',
    onAuditQ: (e: FieldChange) => {
      h.setState({auditQ: e.target.value});
      h.later('audit', () => loadAudit(h, 1), 300);
    },
    auditRows, auditCount: s.auditCount, auditEmpty: !auditRows.length,
    // The details panel: every field in full (the table cuts long text short).
    aeShow: !!s.auditOpen, closeAE: () => h.setState({auditOpen: null}), ae: s.auditOpen ? auditRow(h, s.auditOpen) : null,
    auditInfo: (s.auditCount === 1 ? '1 entry' : s.auditCount + ' entries') + (s.auditWindow ? ' · ' + s.auditWindow : ''),
    auditEmptyText: s.auditLoading ? 'Loading…' : s.auditQ.trim() ? 'No entries match “' + s.auditQ.trim() + '”' : 'No entries in this period',
    auditEmptyHint: s.auditLoading ? '' : s.auditQ.trim() ? 'Try another search or type.' : 'Only recent entries are listed here; older ones stay saved.', auditPager: pager(s.auditPage, s.auditPages, (p) => loadAudit(h, p)), canExportAudit: h.can('audit.export_audit_log'),
  };
}
