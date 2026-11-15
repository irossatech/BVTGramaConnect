// Posts & Moderation page (sidebar "Posts"): the list with status tabs, filters and the top bar's search, the post
// panel with its review history, and every moderation action (publish, recheck, discard, take down, override, urgent,
// and the citizen phone's block, unblock and discard-all). postRow() is also how a post shows in the user panel
// (logic/users.ts). Moved out of Console.tsx unchanged (audit WEB-ARCH-001). Calls /posts/ (.claude/api.md).
import { ApiError, type Query } from "../api";
import type { DiscardCitizenResult, Post, PostsPage, ReviewAction } from "../types";
import { isActor, pageCount, pager, PAGE_SIZE, RK, ROLE, type FieldChange, type PostRow, type Tone } from "../model";
import type { ConsoleHost } from "./host";

// Post status badges, by the console's status key (Pending, Published…, TakenDown for UNPUBLISHED).
const STATUS: Readonly<Record<string, Tone>> = {Pending:{bg:'#fff0dc',color:'#b35a0e',label:'Pending'},Published:{bg:'#e4f4df',color:'#1d7a33',label:'Published'},Recheck:{bg:'#f1e6f7',color:'#8f4bb4',label:'Recheck'},Discarded:{bg:'#eef2f6',color:'#3b4a5c',label:'Discarded'},TakenDown:{bg:'#fde7e5',color:'#b3261e',label:'Taken down'},Draft:{bg:'#eef2f6',color:'#6b7a8c',label:'Draft'}};
// API status -> the console's status key.
const SK: Readonly<Record<string, string>> = {PENDING:'Pending',PUBLISHED:'Published',RECHECK:'Recheck',DISCARDED:'Discarded',UNPUBLISHED:'TakenDown',DRAFT:'Draft'};
// The console's status key -> API status.
const SAPI: Readonly<Record<string, string>> = {Pending:'PENDING',Published:'PUBLISHED',Recheck:'RECHECK',Discarded:'DISCARDED',TakenDown:'UNPUBLISHED'};
// What each review action says in the post panel's history.
const HIST: Readonly<Record<string, string>> = {SUBMIT:'Submitted for review',RESUBMIT:'Resubmitted',PUBLISH:'Published',AUTO_PUBLISH:'Published directly (admin post)',RECHECK:'Sent back for recheck',DISCARD:'Discarded',UNPUBLISH:'Taken down',ESCALATE:'Escalated'};
// Event kinds on a post: label, background, colour.
const EVENT: Readonly<Record<string, readonly [string, string, string]>> = {deadline:['Deadline','#fff0dc','#b35a0e'],camp:['Camp','#e4f4df','#1d7a33'],distribution:['Distribution','#e3f0fb','#0D3B7A'],closure:['Closure','#eef2f6','#3b4a5c'],meeting:['Meeting','#f1e6f7','#8f4bb4']};

// Where a post goes: one post can go to Everyone or to several areas (`targets`): "Guntur +2".
function postWhere(h: ConsoleHost, p: Post) {
  const t = p.targets || [];
  if (!t.length) return h.an(p.target_area);
  if (t[0].level === 'STATE') return 'Everyone';
  return h.an(t[0]) + (t.length > 1 ? ' +' + (t.length - 1) : '');
}

/** A post from the API as the console's row (the list, the post panel, the user panel, the bell). */
export function adaptPost(h: ConsoleHost, p: Post): PostRow {
  const a = p.author;
  const role = RK[a?.role ?? ''] || 'panchayat';
  return {
    id: p.id, raw: p, cat: p.category ? p.category.key : 'updates', catLabel: p.category ? p.category.name : '',
    titleTe: p.title, titleEn: p.translation ? p.translation.title : '', bodyTe: p.body, bodyEn: p.translation ? p.translation.body : '',
    area: postWhere(h, p), areaName: p.target_area ? p.target_area.name : '', date: h.fmt(p.submitted_at || p.published_at || p.created_at),
    author: a?.name || (p.citizen ? 'Citizen' : '—'), role, status: SK[p.status] || 'Pending',
    media: (p.media || []).filter((m) => m.kind !== 'video'), videos: (p.media || []).filter((m) => m.kind === 'video'),
    urgent: !!p.is_urgent, event: p.event || null, allowed: p.allowed_actions || [], citizen: p.citizen || null,
  };
}

function postQuery(h: ConsoleHost, page: number): Query {
  const s = h.state;
  return {status: s.statusTab === 'All' ? '' : SAPI[s.statusTab], source: s.pf.source, district: s.pf.district, category: s.pf.cat, q: s.gsearch, page, page_size: PAGE_SIZE};
}

export function loadPosts(h: ConsoleHost, page: number) {
  const latest = h.ticket('posts');
  h.setState({postsLoading: true});
  h.api.get<PostsPage>('/posts/', postQuery(h, page))
    .then((d) => latest() && h.setState({posts: d.results.map((p) => adaptPost(h, p)), postCount: d.count, postPage: page, postPages: pageCount(d.count), statusCounts: d.status_counts || {}, pendingCount: (d.status_counts || {}).PENDING || 0, postsLoading: false}))
    .catch((e: unknown) => {
      if (!latest()) return;
      h.setState({postsLoading: false});
      h.fail(e);
    });
}

/** Opens a post in the side panel, with its review history (the list, and the bell). */
export function openPost(h: ConsoleHost, p: PostRow) {
  h.setState({panel: {type: 'post', id: p.id}, panelPost: p, panelHistory: []});
  const latest = h.ticket('panel');
  h.api.get<ReviewAction[]>('/posts/' + p.id + '/history/').then((hi) => {
    if (latest()) h.setState({panelHistory: hi});
  }).catch((e: unknown) => latest() && h.fail(e));
}

function refreshPost(h: ConsoleHost, id: string) {
  return h.api.get<Post>('/posts/' + id + '/').then((p) => {
    const ap = adaptPost(h, p);
    h.setState((s) => ({panelPost: s.panel && s.panel.id === id ? ap : s.panelPost, posts: s.posts.map((x) => x.id === id ? ap : x)}));
    return h.api.get<ReviewAction[]>('/posts/' + id + '/history/').then((hi) => {
      if (h.state.panel && h.state.panel.id === id) h.setState({panelHistory: hi});
    });
  }).catch((e: unknown) => h.fail(e));
}

// ---- posts actions ----
function review(h: ConsoleHost, p: PostRow, body: {action: string; comment?: string; to_status?: string}, done: () => void) {
  h.api.post('/posts/' + p.id + '/review/', body).then(() => {
    done();
    loadPosts(h, h.state.postPage);
    refreshPost(h, p.id);
  }).catch((e: unknown) => {
    if (e instanceof ApiError && e.code === 'already_decided') {
      const by = e.body.decided_by;
      const who = isActor(by) ? (by.name + ' (' + ((ROLE[RK[by.role]] || {}).label || by.role) + ')') : 'another reviewer';
      h.toast('Already decided by ' + who + '. Showing the latest status.', '#E9791E');
      loadPosts(h, h.state.postPage);
      refreshPost(h, p.id);
      return;
    }
    h.fail(e);
  });
}

function postAction(h: ConsoleHost, kind: string, p: PostRow) {
  if (kind === 'urgent') {
    urgentPost(h, p);
    return;
  }
  const title = p.titleTe;
  const area = p.areaName;
  // Citizens' posts (contract section 15): block the phone for some days, unblock, or discard all its pending posts.
  const after = (msg: string) => () => {
    h.toast(msg);
    h.setState({panel: null});
    loadPosts(h, h.state.postPage);
  };
  if (kind === 'blockCitizen') h.ask({title: 'Block this citizen', body: 'The phone cannot post until the block ends. Its other pending posts in your area are discarded. The citizen sees your reason.', hasSelect: true, selectLabel: 'Block for', options: [{id: '1', label: '1 day'}, {id: '7', label: '7 days'}, {id: '30', label: '30 days'}, {id: '90', label: '90 days'}], sel: '7', needsText: true, textLabel: 'Reason (required)', confirmLabel: 'Block', bg: '#b3261e', onConfirm: (t, sel) => h.api.post('/posts/' + p.id + '/block-citizen/', {comment: t, days: Number(sel || 7)}).then(after('Citizen blocked')).catch((e: unknown) => h.fail(e))});
  if (kind === 'unblockCitizen') h.ask({title: 'Unblock this citizen', body: 'The phone can post again.', confirmLabel: 'Unblock', bg: '#1d7a33', onConfirm: () => h.api.post('/posts/' + p.id + '/unblock-citizen/', {comment: ''}).then(after('Citizen unblocked')).catch((e: unknown) => h.fail(e))});
  if (kind === 'discardCitizen') h.ask({title: 'Discard all their pending posts', body: 'Every pending post from this phone is discarded (for spam). The phone is not blocked.', needsText: true, textLabel: 'Reason (required)', confirmLabel: 'Discard all', bg: '#3b4a5c', onConfirm: (t) => h.api.post<DiscardCitizenResult | null>('/posts/' + p.id + '/discard-citizen-posts/', {comment: t}).then((d) => after('Discarded ' + ((d && d.discarded) || 0) + ' posts')()).catch((e: unknown) => h.fail(e))});
  if (kind === 'publish') h.ask({title: 'Publish post', body: 'Publish "' + title + '" to citizens in ' + area + '? This overrides the local review queue.', confirmLabel: 'Publish', bg: '#1F8A3B', onConfirm: () => review(h, p, {action: 'publish'}, () => h.toast('Post published'))});
  if (kind === 'recheck') h.ask({title: 'Send for recheck', body: 'The author will see your comment and can edit and resubmit.', needsText: true, textLabel: 'Comment to author (required)', confirmLabel: 'Send for recheck', bg: '#E9791E', onConfirm: (t) => review(h, p, {action: 'recheck', comment: t}, () => h.toast('Sent back for recheck', '#E9791E'))});
  if (kind === 'discard') h.ask({title: 'Discard post', body: 'The post will not be published. The author is notified with your reason.', needsText: true, textLabel: 'Reason (required)', confirmLabel: 'Discard', bg: '#3b4a5c', onConfirm: (t) => review(h, p, {action: 'discard', comment: t}, () => h.toast('Post discarded', '#cfd8e3'))});
  if (kind === 'takedown') h.ask({title: 'Take down post', body: 'Remove "' + title + '" from all citizen feeds immediately.', needsText: true, textLabel: 'Reason (required)', confirmLabel: 'Take down', bg: '#b3261e', onConfirm: (t) => review(h, p, {action: 'unpublish', comment: t}, () => h.toast('Post taken down', '#E9791E'))});
  if (kind === 'override') h.ask({title: 'Override previous decision', body: 'Current status: ' + STATUS[p.status].label + '. Choose the new status and record why you are overriding the earlier reviewer.', hasSelect: true, selectLabel: 'New status', options: [{id: 'Published', label: 'Published'}, {id: 'Pending', label: 'Pending (back to queue)'}, {id: 'Recheck', label: 'Recheck'}, {id: 'Discarded', label: 'Discarded'}].filter((o) => o.id !== p.status), needsText: true, textLabel: 'Override reason (required)', confirmLabel: 'Override', bg: '#0D3B7A', onConfirm: (t, sel) => review(h, p, {action: 'reverse', to_status: SAPI[sel], comment: t}, () => h.toast('Decision overridden → ' + STATUS[sel].label))});
}

function urgentPost(h: ConsoleHost, p: PostRow) {
  const on = !p.urgent;
  h.api.post('/posts/' + p.id + '/urgent/', {is_urgent: on}).then(() => {
    h.toast(on ? 'Marked urgent' : 'Urgent mark removed', on ? '#E9791E' : '#6cc04a');
    loadPosts(h, h.state.postPage);
    refreshPost(h, p.id);
  }).catch((e: unknown) => h.fail(e));
}

function hist(h: ConsoleHost, a: ReviewAction) {
  const ST = STATUS, R = ROLE;
  const rk = RK[a.actor?.role ?? ''] || 'system';
  const label = a.action === 'REVERSE'
    ? 'Override: ' + (ST[SK[a.from_status ?? '']] || {label: a.from_status}).label + ' → ' + (ST[SK[a.to_status ?? '']] || {label: a.to_status}).label
    : (HIST[a.action] || a.action);
  return {who: (a.actor && a.actor.name) || 'System', role: R[rk].label, action: label, note: a.comment || '', hasNote: !!a.comment, time: h.fmt(a.at),
    dot: /PUBLISH/.test(a.action) ? '#1F8A3B' : a.action === 'RECHECK' ? '#8f4bb4' : /DISCARD|UNPUBLISH/.test(a.action) ? '#b3261e' : a.action === 'REVERSE' ? '#0D3B7A' : '#E9791E'};
}

// [label, action, border, background, colour]
type Act = [string, string, string, string, string];

/** A post as its row and panel show it (the list, the post panel, the user panel's recent posts). */
export function postRow(h: ConsoleHost, p: PostRow, withHistory?: boolean) {
  const s = h.state, ST = STATUS, R = ROLE;
  const st = ST[p.status] || ST.Pending;
  const rr = R[p.role] || R.panchayat;
  const al = p.allowed;
  const acts: Act[] = [];
  if (p.status === 'Pending') {
    if (al.includes('publish')) acts.push(['Publish', 'publish', '#1F8A3B', '#1F8A3B', '#fff']);
    if (al.includes('recheck')) acts.push(['Recheck (comment)', 'recheck', '#E9791E', '#fff0dc', '#b35a0e']);
    if (al.includes('discard')) acts.push(['Discard (reason)', 'discard', '#cfd8e3', '#fff', '#3b4a5c']);
  } else if (p.status === 'Published') {
    if (al.includes('unpublish')) acts.push(['Take down', 'takedown', '#b3261e', '#fff', '#b3261e']);
    if (al.includes('reverse')) acts.push(['Override previous decision', 'override', '#0D3B7A', '#fff', '#0D3B7A']);
  } else if (al.includes('reverse')) acts.push(['Override previous decision', 'override', '#0D3B7A', '#0D3B7A', '#fff']);
  if (al.includes('set_urgent')) acts.push([p.urgent ? 'Remove urgent' : 'Mark urgent', 'urgent', '#E9791E', '#fff', '#b35a0e']);
  if (al.includes('block_citizen')) acts.push(['Block this citizen', 'blockCitizen', '#b3261e', '#fff', '#b3261e']);
  if (al.includes('unblock_citizen')) acts.push(['Unblock this citizen', 'unblockCitizen', '#1d7a33', '#fff', '#1d7a33']);
  if (al.includes('discard_citizen_posts')) acts.push(['Discard all their pending posts', 'discardCitizen', '#cfd8e3', '#fff', '#3b4a5c']);
  const cz = p.citizen;
  const czLine = cz ? [(cz.posts_total || 0) + ' posts from this phone', (cz.posts_discarded || 0) + ' discarded', cz.blocked ? (cz.blocked_until ? 'Blocked till ' + h.fmt(cz.blocked_until, true).slice(0, 11) : 'Blocked') : ''].filter(Boolean).join(' · ') : '';
  const ev = p.event;
  const evs = ev ? (EVENT[ev.kind] || [ev.kind, '#e3f0fb', '#0D3B7A']) : null;
  const evDates = ev ? (h.fmt(ev.start_date + 'T00:00:00+05:30', true).slice(0, 11) + (ev.end_date ? ' – ' + h.fmt(ev.end_date + 'T00:00:00+05:30', true).slice(0, 11) : '')) : '';
  // The post's own language and its translation's, so screen readers and fonts treat Telugu text as Telugu.
  return {rowKey: p.id, cat: p.cat, catLabel: p.catLabel, titleTe: p.titleTe, titleEn: p.titleEn, bodyTe: p.bodyTe, bodyEn: p.bodyEn, lang: p.raw?.language || undefined, langEn: p.raw?.translation?.language || undefined, area: p.area, date: p.date, author: p.author, authorRole: czLine || rr.label, amobile: '', abg: rr.bg, ainitial: (p.author || '?')[0],
    st: {bg: st.bg, color: st.color, label: st.label}, hasPhoto: p.media.length > 0, photos: p.media.map((m) => ({src: m.thumb_url || m.url, pos: 'center'})), urgent: !!p.urgent,
    hasEvent: !!ev, eventLabel: evs ? evs[0] + ' · ' + evDates : '', eventBg: evs ? evs[1] : '', eventColor: evs ? evs[2] : '',
    hasVideo: (p.videos || []).length > 0, videos: (p.videos || []).map((v) => ({src: v.url, poster: v.poster_url || v.thumb_url || ''})), rowBg: s.panel && s.panel.type === 'post' && s.panel.id === p.id ? '#f0f6fd' : '#fff',
    history: withHistory ? s.panelHistory.map((a) => hist(h, a)) : [], open: () => openPost(h, p), actions: acts.map(([label, k, border, bg, color]) => ({label, border, bg, color, go: () => postAction(h, k, p)}))};
}

/** The page's renderVals() values (screens/Posts.tsx, and the top bar's search). */
export function postsView(h: ConsoleHost) {
  const s = h.state, ST = STATUS;
  const tabs = ['Pending', 'Published', 'Recheck', 'Discarded', 'TakenDown'] as const;
  const sc = s.statusCounts;
  const statusTabs = [{id: 'All' as const, label: 'All'}, ...tabs.map((k) => ({id: k, label: ST[k].label}))].map((t) => {
    const on = s.statusTab === t.id;
    const n = t.id === 'All' ? (sc.ALL || 0) : (sc[SAPI[t.id]] || 0);
    return {label: t.label, count: n, line: on ? '#0D3B7A' : 'transparent', color: on ? '#0A2550' : '#6b7a8c', cbg: on ? '#0D3B7A' : '#eef2f6', ccolor: on ? '#fff' : '#3b4a5c', go: () => { h.setState({statusTab: t.id}, () => loadPosts(h, 1)); }};
  });
  const pf = s.pf;
  const postRows = s.posts.map((p) => postRow(h, p));
  const catOpts = s.categories.map((c) => ({id: c.key, label: c.name_en || c.name || c.key}));
  return {
    gsearch: s.gsearch,
    onGSearch: (e: FieldChange) => {
      const v = e.target.value;
      h.setState({gsearch: v, page: v ? 'posts' : s.page, statusTab: v ? 'All' : s.statusTab});
      h.later('search', () => loadPosts(h, 1), 300);
    },
    statusTabs, pf,
    onPF: (e: FieldChange) => {
      const {name, value} = e.target;
      h.setState((st) => ({pf: {...st.pf, [name]: value}}), () => loadPosts(h, 1));
    },
    postRows, postCount: s.postCount, postEmpty: !postRows.length, postEmptyText: s.postsLoading ? 'Loading…' : 'No posts match these filters.', postsPager: pager(s.postPage, s.postPages, (p) => loadPosts(h, p)), catOpts,
  };
}

/** The side panel's frame and the post panel's values (panels/DetailPanel.tsx, PostDetail.tsx). */
export function postPanelView(h: ConsoleHost) {
  const s = h.state;
  const panel = s.panel ? {show: true, isPost: s.panel.type === 'post', isUser: s.panel.type === 'user', title: s.panel.type === 'post' ? 'Post review' : 'User details'} : {show: false};
  const empty: PostRow = {id: '', cat: 'updates', catLabel: '', titleTe: '', titleEn: '', bodyTe: '', bodyEn: '', area: '', areaName: '', date: '', author: '', role: 'panchayat', status: 'Pending', media: [], videos: [], urgent: false, event: null, allowed: [], citizen: null};
  const sp = postRow(h, s.panelPost || empty, true);
  // The panel names every area the post goes to (the list shows the first one and "+N").
  const spTargets = (s.panelPost && s.panelPost.raw && s.panelPost.raw.targets) || [];
  if (spTargets.length > 1 && spTargets[0].level !== 'STATE') sp.area = spTargets.map((t) => h.an(t)).join(', ');
  return {panel, sp, closePanel: () => h.setState({panel: null})};
}
