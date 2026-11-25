// The bell (top bar): this official's notifications, newest first, with "Show older", mark all read, and opening what
// a notification is about (its post or service request). The once-a-minute refresh stays in Console.tsx (it goes with
// the idle sign-out). Moved out of Console.tsx unchanged (audit WEB-ARCH-001). Calls /notifications/ (.claude/api.md).
import type { ConsoleNotification, NotificationPage, Post, ServiceRequest } from "../types";
import { sessionEnded } from "../model";
import type { ConsoleHost } from "./host";
import { adaptPost, openPost } from "./posts";
import { openRequest } from "./requests";

// ---- notifications (the bell) ----
/** background: the once-a-minute refresh (Console.tsx), sent as an automatic check (BVTGC-72). */
export function loadNotifs(h: ConsoleHost, more?: boolean, background = false) {
  const cursor = more ? h.state.notifNext : null;
  if (more && !cursor) return;
  h.setState({notifLoading: true, notifError: false});
  (background ? h.api.getBackground : h.api.get)<NotificationPage>('/notifications/', cursor ? {cursor} : undefined).then((d) => {
    let next: string | null = null;
    try {
      next = d.next ? new URL(d.next, window.location.href).searchParams.get('cursor') : null;
    } catch {
      next = null;
    }
    h.setState((s) => ({notifs: more ? [...s.notifs, ...(d.results || [])] : (d.results || []), notifUnread: d.unread_count ?? 0, notifNext: next, notifLoading: false}));
  }).catch((e: unknown) => {
    h.setState({notifLoading: false, notifError: true});
    // The minute check is the console's only call while nobody clicks: an ended session (blocked, password reset,
    // signed out elsewhere) goes back to the login screen now, not at the next click (Jira BVTGC-102).
    if (sessionEnded(e)) h.fail(e);
  });
}

function toggleNotifs(h: ConsoleHost) {
  const open = !h.state.notifOpen;
  h.setState({notifOpen: open, menuOpen: false});
  if (open) loadNotifs(h);
}

// Open what the notification is about (its post or service request) and mark it read.
function openNotif(h: ConsoleHost, n: ConsoleNotification) {
  if (!n.read_at) {
    const now = new Date().toISOString();
    h.setState((s) => ({notifs: s.notifs.map((x) => x.id === n.id ? {...x, read_at: now} : x), notifUnread: Math.max(0, s.notifUnread - 1)}));
    h.api.post('/notifications/' + n.id + '/read/').catch(() => {});
  }
  h.setState({notifOpen: false});
  if (n.post_id) {
    h.api.get<Post>('/posts/' + n.post_id + '/').then((p) => openPost(h, adaptPost(h, p))).catch((e: unknown) => h.fail(e));
  } else if (n.service_request_id) {
    h.api.get<ServiceRequest>('/service-requests/' + n.service_request_id + '/').then((r) => openRequest(h, r)).catch((e: unknown) => h.fail(e));
  }
}

function readAllNotifs(h: ConsoleHost) {
  const now = new Date().toISOString();
  h.setState((s) => ({notifs: s.notifs.map((x) => x.read_at ? x : {...x, read_at: now}), notifUnread: 0}));
  h.api.post('/notifications/read-all/').catch((e: unknown) => {
    h.fail(e);
    loadNotifs(h);
  });
}

/** "Just now", "5 min ago", "3 h ago", "2 d ago", then the date. Also the Dashboard and the Audit log. */
export function ago(h: ConsoleHost, iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (isNaN(min)) return '';
  if (min < 1) return 'Just now';
  if (min < 60) return min + ' min ago';
  if (min < 24 * 60) return Math.floor(min / 60) + ' h ago';
  if (min < 7 * 24 * 60) return Math.floor(min / (24 * 60)) + ' d ago';
  return h.fmt(iso, false);
}

/** The bell's renderVals() values (layout/TopBar.tsx, layout/Notifications.tsx). */
export function notificationsView(h: ConsoleHost) {
  const s = h.state;
  // The bell: one row per notification, coloured by what it is about.
  const NK: Record<string, {label: string; color: string; bg: string; d: string}> = {POST_PUBLISHED: {label: 'Published', color: '#1F8A3B', bg: '#e4f4df', d: 'M20 6L9 17l-5-5'},
    POST_RECHECK: {label: 'Recheck', color: '#8f4bb4', bg: '#f1e6f7', d: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'},
    POST_DISCARDED: {label: 'Discarded', color: '#b3261e', bg: '#fde8e6', d: 'M18 6L6 18M6 6l12 12'},
    POST_UNPUBLISHED: {label: 'Taken down', color: '#b3261e', bg: '#fde8e6', d: 'M12 5v14M5 12l7 7 7-7'},
    REVIEW_PENDING: {label: 'Waiting for review', color: '#b35a0e', bg: '#fff0dc', d: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'},
    ESCALATION: {label: 'Escalated', color: '#b3261e', bg: '#fde8e6', d: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z'},
    ACCOUNT: {label: 'Account', color: '#0D3B7A', bg: '#e3f0fb', d: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0'},
    SERVICE_REQUEST: {label: 'Service request', color: '#07818e', bg: '#dff3f4', d: 'M9 12h6M9 16h4M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z'}};
  const bell = {label: '', color: '#3b4a5c', bg: '#eef2f6', d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0'};
  const notifRows = s.notifs.map((n) => {
    const k = NK[n.kind] || bell;
    return {id: n.id, title: n.title, body: n.body, time: ago(h, n.created_at), unread: !n.read_at, label: k.label, color: k.color, bg: k.bg, d: k.d, linked: !!(n.post_id || n.service_request_id), open: () => openNotif(h, n)};
  });
  return {
    notifOpen: s.notifOpen, notifRows, notifUnread: s.notifUnread, notifBadge: s.notifUnread > 99 ? '99+' : String(s.notifUnread), notifLoading: s.notifLoading, notifError: s.notifError, notifEmpty: !s.notifs.length && !s.notifLoading && !s.notifError, notifHasMore: !!s.notifNext, notifMore: () => loadNotifs(h, true), notifRetry: () => loadNotifs(h), toggleNotifs: () => toggleNotifs(h), closeNotifs: () => h.setState({notifOpen: false}), readAllNotifs: () => readAllNotifs(h),
  };
}
