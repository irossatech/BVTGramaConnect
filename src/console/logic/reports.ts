// Reports page (sidebar "Reports"): the summary cards, posts by area, review time and admin activity, and their
// CSV exports. Moved out of Console.tsx unchanged (audit WEB-ARCH-001).
// Calls GET /admin/reports/... and their /export/ (.claude/api.md).
import type { Paged, ReportActivity, ReportDistrict, ReportReviewTime, ReportSummary } from "../types";
import { RK, ROLE } from "../model";
import type { ConsoleHost } from "./host";

export function loadReports(h: ConsoleHost) {
  Promise.all([
    h.api.get<ReportSummary>('/admin/reports/summary/'),
    h.api.get<ReportDistrict[]>('/admin/reports/posts-by-area/'),
    h.api.get<ReportReviewTime[]>('/admin/reports/review-time/'),
    h.api.get<Paged<ReportActivity>>('/admin/reports/admin-activity/', {page_size: 8}),
  ]).then(([summary, byArea, reviewTime, activity]) => h.setState({reports: {summary, byArea, reviewTime, activity: activity.results}})).catch((e: unknown) => h.fail(e));
}

/** One report as CSV (also the Audit log's Export CSV on any other page). One export at a time. */
export function exportReport(h: ConsoleHost, name: string) {
  const stamp = new Date().toISOString().slice(0, 10);
  if (h.state.exporting) return;
  h.setState({exporting: name});
  h.api.download('/admin/reports/' + name + '/export/', {format: 'csv'}, 'grama-' + name + '-' + stamp + '.csv').then(() => h.toast('Report exported')).catch((e: unknown) => h.fail(e)).finally(() => h.setState({exporting: null}));
}

/** The page's renderVals() values (screens/Reports.tsx). */
export function reportsView(h: ConsoleHost) {
  const s = h.state;
  const RP = s.reports;
  const byArea: {name: string; indent: string; weight: number; total: number; pub: number; pend: number; rej: number}[] = [];
  // Busiest districts first (ties keep the server's A-Z order); each district's mandals stay under it.
  [...RP.byArea].sort((a, b) => b.total - a.total).forEach((d) => {
    byArea.push({name: d.district.name, indent: '0px', weight: 700, total: d.total, pub: d.published, pend: d.pending, rej: d.rejected});
    d.mandals.forEach((m) => byArea.push({name: m.mandal.name, indent: '20px', weight: 500, total: m.total, pub: m.published, pend: m.pending, rej: m.rejected}));
  });
  const SM = RP.summary;
  const repSummary = ([['Posts', 'total', '#0A2550'], ['Published', 'published', '#1F8A3B'], ['Pending', 'pending', '#b35a0e'], ['Rejected', 'rejected', '#6b7a8c']] as const).map(([label, k, color]) => ({label, value: SM ? SM[k] : '…', color, sub: 'Last ' + (SM ? SM.days : 30) + ' days' + (k === 'rejected' ? ' · discarded or taken down' : '')}));
  const LV: Readonly<Partial<Record<string, readonly [string, string]>>> = {VILLAGE: ['Village Admin', '#1F8A3B'], MANDAL: ['Mandal Admin', '#07818e'], DISTRICT: ['District Admin', '#E9791E']};
  const reviewTime = RP.reviewTime.flatMap((r) => {
    const lv = LV[r.level];
    if (!lv) return [];
    const hours = r.avg_hours || 0;
    return [{level: lv[0], hours, n: r.reviews, sla: r.escalation_hours, color: lv[1], w: Math.min(100, Math.round(hours / (r.escalation_hours || 24) * 100)) + '%'}];
  });
  const adminActivity = RP.activity.map((a) => ({name: a.user.name, role: (ROLE[RK[a.user.role]] || ROLE.village).label, area: a.area ? a.area.name : '—', reviewed: a.reviewed, pub: a.published, re: a.recheck, dis: a.discarded, avg: a.avg_review_hours == null ? '—' : a.avg_review_hours, last: h.fmtLast(a.last_active_at)}));
  return {
    repSummary, byArea, reviewTime, adminActivity, exporting: s.exporting,
    exportByArea: () => exportReport(h, 'posts-by-area'), exportReviewTime: () => exportReport(h, 'review-time'), exportActivity: () => exportReport(h, 'admin-activity'),
  };
}
