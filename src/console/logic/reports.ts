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
  const byArea: {name: string; indent: string; weight: number; total: number; pub: number; pend: number; rej: number}[] = [];  // Busiest districts first (ties keep the server's A-Z order); each district's mandals stay under it.
  [...RP.byArea].sort((a, b) => b.total - a.total).forEach((d) => {
    byArea.push({name: d.district.name, indent: '0px', weight: 700, total: d.total, pub: d.published, pend: d.pending, rej: d.rejected});
    d.mandals.forEach((m) => byArea.push({name: m.mandal.name, indent: '20px', weight: 500, total: m.total, pub: m.published, pend: m.pending, rej: m.rejected}));
  });
  const SM = RP.summary;
  const loaded = !!SM; // summary arrives with the other three (one Promise.all)
  const days = SM ? SM.days : 30;
  const repSummary = ([['Posts sent in', 'total', '#0A2550', 'Any status'], ['Published', 'published', '#1F8A3B', 'Now live'], ['Pending', 'pending', '#b35a0e', 'Not reviewed yet'], ['Rejected', 'rejected', '#647182', 'Discarded, taken down or blocked']] as const)
    .map(([label, k, color, sub]) => ({label, value: SM ? SM[k] : '…', color, sub}));
  const LV: Readonly<Partial<Record<string, readonly [string, string]>>> = {VILLAGE: ['Village Admins', '#1F8A3B'], MANDAL: ['Mandal Admins', '#07818e'], DISTRICT: ['District Admins', '#E9791E'], STATE: ['Super Admins', '#0D3B7A']};
  const limitH = RP.reviewTime[0]?.escalation_hours || 24;
  const reviewTime = RP.reviewTime.flatMap((r) => {
    const lv = LV[r.level];
    if (!lv) return [];
    const none = r.avg_hours == null || !r.reviews;
    const hours = r.avg_hours || 0;
    const slow = !none && hours > limitH;
    return [{level: lv[0], text: none ? 'No reviews yet' : hours + ' h average · ' + r.reviews + (r.reviews === 1 ? ' review' : ' reviews'), slow, color: slow ? '#b3261e' : lv[1], w: none ? '0%' : Math.min(100, Math.round(hours / limitH * 100)) + '%'}];
  });
  const adminActivity = RP.activity.map((a) => ({name: a.user.name, role: (ROLE[RK[a.user.role]] || ROLE.village).label, area: a.area ? a.area.name : '—', reviewed: a.reviewed, pub: a.published, re: a.recheck, dis: a.discarded, avg: a.avg_review_hours == null ? '—' : a.avg_review_hours + ' h', last: h.fmtLast(a.last_active_at)}));
  return {
    repSummary, byArea, reviewTime, adminActivity, exporting: s.exporting, repDays: days, repLimitH: limitH,
    byAreaEmpty: !loaded ? 'Loading…' : byArea.some((r) => r.total) ? '' : 'No posts in the last ' + days + ' days.',
    activityEmpty: !loaded ? 'Loading…' : adminActivity.length ? '' : 'No District, Mandal or Village Admins yet.',
    reviewLoading: !loaded,
    exportByArea: () => exportReport(h, 'posts-by-area'), exportReviewTime: () => exportReport(h, 'review-time'), exportActivity: () => exportReport(h, 'admin-activity'),
  };
}
