// Dashboard (sidebar "Dashboard"): the five cards (each opens Posts or Users with a filter), posts per day, posts
// waiting for review by district (with a search box) and recent activity (audit WEB-ARCH-001 moved it here).
// Calls GET /admin/dashboard/ (.claude/api.md).
import type { Dashboard, Paged, User } from "../types";
import type { FieldChange } from "../model";
import type { ConsoleHost } from "./host";
import { auditRow } from "./audit";
import { loadPosts } from "./posts";
import { loadUsers } from "./users";

export function loadDash(h: ConsoleHost) {
  h.api.get<Dashboard>('/admin/dashboard/').then((dash) => h.setState({dash, pendingCount: dash.kpis.pending})).catch((e: unknown) => h.fail(e));
  // The dashboard's own user counts include Super Admins, whom the Users list never shows; its `counts` match the list.
  h.api.get<Paged<User> & {counts?: {active: number; blocked: number}}>('/users/', {page_size: 1})
    .then((d) => d.counts && h.setState({dashPeople: {active: d.counts.active, blocked: d.counts.blocked}})).catch(() => { /* cards fall back to the dashboard's numbers */ });
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
  const limitH = D?.escalation_hours ?? 24;
  const pendingSub = () => {
    if (!D) return '';
    if (!D.kpis.pending) return 'Nothing waiting';
    const oldest = 'Oldest ' + Math.round(D.kpis.oldest_pending_hours || 0) + ' h';
    return D.kpis.escalated ? oldest + ' · ' + D.kpis.escalated + ' escalated' : oldest;
  };
  // Officials cards use the Users list's own counts (s.dashPeople): the list never shows Super Admins.
  const P = s.dashPeople;
  const people = (n: 'active' | 'blocked', fallback: number | undefined) => P ? P[n] : D ? (fallback ?? 0) : '…';
  // Open Users with only this status, so the list shows exactly what the card counted.
  const openUsers = (status: string) => () => { h.setState({page: 'users', uf: {role: '', district: '', q: '', status}}, () => loadUsers(h, 1)); };
  const kpis = [
    {label: 'All posts', value: D ? D.kpis.total_posts : '…', sub: 'Every status', color: '#0A2550', go: () => { h.setState({page: 'posts', statusTab: 'All'}, () => loadPosts(h, 1)); }},
    {label: 'Pending', value: D ? D.kpis.pending : '…', sub: pendingSub(), color: '#b35a0e', go: () => { h.setState({page: 'posts', statusTab: 'Pending'}, () => loadPosts(h, 1)); }},
    {label: 'Published today', value: D ? D.kpis.published_today : '…', sub: todayLabel, color: '#1F8A3B', go: () => { h.setState({page: 'posts', statusTab: 'Published'}, () => loadPosts(h, 1)); }},
    {label: 'Active officials', value: people('active', D?.kpis.active_users), sub: 'Can sign in', color: '#0D3B7A', go: openUsers('active')},
    {label: 'Blocked officials', value: people('blocked', D?.kpis.blocked_users), sub: 'Cannot sign in', color: '#b3261e', go: openUsers('blocked')},
  ].map((k) => ({...k, aria: k.label + ': ' + k.value + '. ' + k.sub + '. Open the list.'}));
  const ppd = D ? D.posts_per_day : [];
  const max = Math.max(1, ...ppd.map((c) => Math.max(c.submitted, c.published)));
  const chart = ppd.map((c) => ({h1: Math.round(c.submitted / max * 100) + '%', h2: Math.round(c.published / max * 100) + '%', day: dayLabel(c.date), tip: dayLabel(c.date) + ': ' + c.submitted + ' sent in, ' + c.published + ' published'}));
  const sum = (k: 'submitted' | 'published') => ppd.reduce((n, c) => n + c[k], 0);
  // Every district, most waiting first; the search box filters by English or Telugu name.
  const dq = s.distQ.trim().toLowerCase();
  const pendingByDistrict = (D ? D.pending_by_district : []).filter((r) => !dq || r.district.name.toLowerCase().includes(dq) || (r.name_te || '').includes(s.distQ.trim())).sort((a, b) => b.pending - a.pending).map((r) => {
    const hrs = r.pending && r.oldest_pending_hours !== null ? Math.round(r.oldest_pending_hours) : null;
    return {name: r.district.name, te: r.name_te || '', count: r.pending, oldest: hrs === null ? '—' : hrs + ' h', overdue: hrs !== null && hrs >= limitH,
      go: () => { h.setState({page: 'posts', statusTab: 'Pending', pf: {...s.pf, district: String(r.district.id)}}, () => loadPosts(h, 1)); }};
  });
  // "2 h ago" reads faster than a timestamp; the exact time is in the tooltip.
  const recent = (D ? D.recent_activity : []).map((a) => ({...auditRow(h, a), where: a.area ? 'in ' + a.area.name : ''}));
  return {
    kpis, chart, chartEmpty: !!D && !ppd.some((c) => c.submitted || c.published), chartLoading: !D,
    chartTotals: D ? 'Last 14 days: ' + sum('submitted') + ' sent in · ' + sum('published') + ' published' : 'Last 14 days',
    pendingByDistrict, distQ: s.distQ, onDistQ: (e: FieldChange) => h.setState({distQ: e.target.value}), limitH,
    distEmptyText: !D ? 'Loading…' : s.distQ.trim() ? 'No district matches “' + s.distQ.trim() + '”.' : 'Nothing waiting for review.',
    recent, recentEmptyText: !D ? 'Loading…' : recent.length ? '' : 'No activity yet.', noDistricts: !s.geo.length,
  };
}
