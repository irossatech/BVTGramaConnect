// Dashboard (sidebar "Dashboard"): the five cards (each opens Posts or Users with a filter), posts per day, pending
// posts by district (with a search box) and recent activity. Moved out of Console.tsx unchanged (audit WEB-ARCH-001).
// Calls GET /admin/dashboard/ (.claude/api.md).
import type { Dashboard } from "../types";
import type { FieldChange } from "../model";
import type { ConsoleHost } from "./host";
import { auditRow } from "./audit";
import { loadPosts } from "./posts";
import { loadUsers } from "./users";

export function loadDash(h: ConsoleHost) {
  h.api.get<Dashboard>('/admin/dashboard/').then((dash) => h.setState({dash, pendingCount: dash.kpis.pending})).catch((e: unknown) => h.fail(e));
}

/** The page's renderVals() values (screens/Dashboard.tsx). */
export function dashboardView(h: ConsoleHost) {
  const s = h.state;
  const D = s.dash;
  const dayLabel = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    return d.getDate() + ' ' + d.toLocaleString('en-GB', {month: 'short'});
  };
  const todayLabel = new Intl.DateTimeFormat('en-GB', {day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata'}).format(new Date());
  const kpis = [
    {label: 'Total posts', value: D ? D.kpis.total_posts : '…', sub: 'All statuses · ' + (D ? D.geo.districts : '…') + ' districts', color: '#0A2550', go: () => { h.setState({page: 'posts', statusTab: 'All'}, () => loadPosts(h, 1)); }},
    {label: 'Pending review', value: D ? D.kpis.pending : '…', sub: D ? (D.kpis.pending ? 'Oldest ' + Math.round(D.kpis.oldest_pending_hours || 0) + ' h · ' + D.kpis.escalated + ' escalated' : 'Nothing waiting') : '', color: '#b35a0e', go: () => { h.setState({page: 'posts', statusTab: 'Pending'}, () => loadPosts(h, 1)); }},
    {label: 'Published today', value: D ? D.kpis.published_today : '…', sub: todayLabel, color: '#1F8A3B', go: () => { h.setState({page: 'posts', statusTab: 'Published'}, () => loadPosts(h, 1)); }},
    {label: 'Active admins', value: D ? D.kpis.active_admins : '…', sub: 'District · Mandal · Village', color: '#0D3B7A', go: () => { h.setState({page: 'users', uf: {...s.uf, status: 'active'}}, () => loadUsers(h, 1)); }},
    {label: 'Blocked users', value: D ? D.kpis.blocked_users : '…', sub: 'Across all roles', color: '#b3261e', go: () => { h.setState({page: 'users', uf: {...s.uf, status: 'blocked'}}, () => loadUsers(h, 1)); }},
  ];
  const ppd = D ? D.posts_per_day : [];
  const max = Math.max(1, ...ppd.map((c) => c.submitted));
  const chart = ppd.map((c) => ({h1: Math.round(c.submitted / max * 100) + '%', h2: Math.round(c.published / max * 100) + '%', day: dayLabel(c.date), tip: dayLabel(c.date) + ': ' + c.submitted + ' submitted, ' + c.published + ' published'}));
  // Every district, most pending first; the search box filters by English or Telugu name.
  const dq = s.distQ.trim().toLowerCase();
  const pendingByDistrict = (D ? D.pending_by_district : []).filter((r) => !dq || r.district.name.toLowerCase().includes(dq) || (r.name_te || '').includes(s.distQ.trim())).sort((a, b) => b.pending - a.pending).map((r) => ({name: r.district.name, te: r.name_te || '', count: r.pending, oldest: r.pending && r.oldest_pending_hours !== null ? Math.round(r.oldest_pending_hours) + ' h' : '—',
    go: () => { h.setState({page: 'posts', statusTab: 'Pending', pf: {...s.pf, district: String(r.district.id)}}, () => loadPosts(h, 1)); }}));
  const recent = (D ? D.recent_activity : []).map((a) => auditRow(h, a));
  return {
    kpis, chart, chartEmpty: !ppd.some((c) => c.submitted || c.published), pendingByDistrict, distQ: s.distQ, onDistQ: (e: FieldChange) => h.setState({distQ: e.target.value}), distEmptyText: s.distQ.trim() ? 'No district matches “' + s.distQ.trim() + '”.' : 'Nothing waiting for review.', recent, noDistricts: !s.geo.length,
  };
}
