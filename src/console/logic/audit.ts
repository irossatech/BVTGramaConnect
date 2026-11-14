// Audit log page (sidebar "Audit Log"), its CSV export, and how one audit entry is shown, which the Dashboard's
// "Recent activity" uses too. Moved out of Console.tsx unchanged (audit WEB-ARCH-001).
// Calls GET /audit/ and GET /audit/export/ (.claude/api.md).
import type { AuditEntry, Paged } from "../types";
import { pageCount, pager, PAGE_SIZE, RK, ROLE, type FieldChange } from "../model";
import type { ConsoleHost } from "./host";
import { exportReport } from "./reports";

// What each audit action key says in the log ("post.published" -> "published post").
const ACT: Readonly<Record<string, string>> = {'post.created':'created post','post.updated':'edited post','post.deleted':'deleted draft','post.urgent_set':'marked post urgent','post.urgent_cleared':'removed urgent mark','user.updated':'edited user','user.password_changed':'changed password','user.password_reset':'reset password','setting.role_password_changed':'changed a default password','email.failed':'email not delivered','email.skipped':'email skipped','contact.handled':'handled contact message','contact.reopened':'reopened contact message','contact.created':'added important number','contact.updated':'edited important number','contact.removed':'removed important number','contact_type.created':'added contact type','contact_type.updated':'changed contact type','contacts.imported':'imported important numbers','auth.login':'logged in','auth.logout':'logged out','auth.login_failed':'failed login','auth.locked_out':'locked out after failed logins','user.unlocked':'unlocked user','user.password_set':'set a temporary password','user.super_admin_created':'added a Super Admin','user.super_admin_role_added':'gave the Super Admin role','user.super_admin_role_removed':'removed the Super Admin role','group.permissions_changed':'changed group permissions','post.submitted':'submitted post','post.resubmitted':'resubmitted post','post.published':'published post','post.auto_published':'published post','post.recheck':'sent for recheck','post.discarded':'discarded post','post.unpublished':'took down post','post.reversed':'overrode decision','post.overridden':'overrode decision','post.escalated':'escalated post','user.created':'added user','user.blocked':'blocked user','user.unblocked':'unblocked user','user.reassigned':'reassigned user','user.assignment_added':'added role','user.assignment_removed':'removed role','area.created':'added area','area.updated':'edited area','area.deactivated':'deactivated area','area.reactivated':'reactivated area','area.imported':'imported villages','category.created':'added category','category.updated':'changed category','setting.changed':'changed setting','template.updated':'edited template','report.exported':'exported report','push.failed':'push failed'};

export function loadAudit(h: ConsoleHost, page: number) {
  const latest = h.ticket('audit');
  h.setState({auditLoading: true});
  h.api.get<Paged<AuditEntry>>('/audit/', {q: h.state.auditQ, type: h.state.auditType, page, page_size: PAGE_SIZE})
    // Each entry's `data` (the changed fields, with emails and mobiles) is never shown, so it is not kept.
    .then((d) => latest() && h.setState({audit: d.results.map(({data: _, ...a}) => a), auditCount: d.count, auditPage: page, auditPages: pageCount(d.count), auditLoading: false}))
    .catch((e: unknown) => {
      if (!latest()) return;
      h.setState({auditLoading: false});
      h.fail(e);
    });
}

function humanAction(k: string) {
  const p = String(k || '').split('.');
  return (p[1] || p[0]).replace(/_/g, ' ');
}

/** One audit entry as a row: the Audit log page, and the Dashboard's "Recent activity". */
export function auditRow(h: ConsoleHost, a: AuditEntry) {
  const rk = RK[a.actor?.role ?? ''] || (a.actor && a.actor.role === 'SYSTEM' ? 'system' : 'super');
  const name = (a.actor && a.actor.name) || 'System';
  return {time: h.fmt(a.at, false), user: name, role: ROLE[rk].label, action: ACT[a.action] || humanAction(a.action), target: a.target_label || '', area: a.area ? a.area.name : 'State', bg: ROLE[rk].bg, initial: name[0], rbg: ROLE[rk].tbg, rcolor: ROLE[rk].tc};
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
  const auditRows = s.audit.map((a) => auditRow(h, a));
  return {
    exportCsv: () => exportCsv(h),
    auditQ: s.auditQ,
    // Same tabs as the app's Audit screen.
    auditTabs: [['', 'All'], ['posts', 'Posts'], ['users', 'Users'], ['areas', 'Areas'], ['logins', 'Logins'], ['settings', 'Settings'], ['system', 'System']].map(([id, label]) => ({
      label, on: s.auditType === id, color: s.auditType === id ? '#0D3B7A' : '#6b7a8c', line: s.auditType === id ? '#0D3B7A' : 'transparent',
      go: () => h.setState({auditType: id}, () => loadAudit(h, 1)),
    })),
    onAuditQ: (e: FieldChange) => {
      h.setState({auditQ: e.target.value});
      h.later('audit', () => loadAudit(h, 1), 300);
    },
    auditRows, auditCount: s.auditCount, auditEmpty: !auditRows.length, auditEmptyText: s.auditLoading ? 'Loading…' : 'No entries match.', auditPager: pager(s.auditPage, s.auditPages, (p) => loadAudit(h, p)), canExportAudit: h.can('audit.export_audit_log'),
  };
}
