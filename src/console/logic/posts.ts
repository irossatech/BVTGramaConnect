// Posts page (sidebar "Posts"): the list with status tabs, filters and the top bar's search, the post
// panel with its review history, and every moderation action (publish, recheck, discard, take down, override, urgent,
// and the citizen phone's block, unblock and discard-all). postRow() is also how a post shows in the user panel
// (logic/users.ts). Moved out of Console.tsx unchanged (audit WEB-ARCH-001). Calls /posts/ (.claude/api.md).
import { ApiError, type Query } from "../api";
import type { BlockedCitizenRow, CitizenBlock, DiscardCitizenResult, Paged, Post, PostsPage, ReviewAction } from "../types";
import { isActor, isStatus, pageCount, pager, PAGE_SIZE, RK, ROLE, type FieldChange, type BulkAction, type PostRow, type SelId, type Tone } from "../model";
import type { ConsoleHost } from "./host";

// Post status badges, by the console's status key (Pending, Published…, TakenDown for UNPUBLISHED).
const STATUS: Readonly<Record<string, Tone>> = {Pending:{bg:'#fff0dc',color:'#b35a0e',label:'Waiting'},Escalated:{bg:'#fde7e5',color:'#b3261e',label:'Escalated'},Published:{bg:'#e4f4df',color:'#1d7a33',label:'Published'},Recheck:{bg:'#f1e6f7',color:'#8f4bb4',label:'Recheck'},Discarded:{bg:'#eef2f6',color:'#3b4a5c',label:'Discarded'},TakenDown:{bg:'#fde7e5',color:'#b3261e',label:'Taken down'},Blocked:{bg:'#f3e3e1',color:'#7a1f17',label:'Blocked'},Draft:{bg:'#eef2f6',color:'#6b7a8c',label:'Draft'}};
// API status -> the console's status key.
const SK: Readonly<Record<string, string>> = {PENDING:'Pending',PUBLISHED:'Published',RECHECK:'Recheck',DISCARDED:'Discarded',UNPUBLISHED:'TakenDown',BLOCKED:'Blocked',DRAFT:'Draft'};
// The console's status key -> API status.
// "Rejected" is the one tab for discarded and taken-down posts (the server takes several statuses, comma-separated).
// Tabs since 2026-11-21 (owner): All, Waiting (with an "Escalated only" filter), Published, Recheck, Rejected
// (discarded or taken down) and Blocked, which lists citizens: one row per blocked phone, its closed posts inside.
const SAPI: Readonly<Record<string, string>> = {Rejected:'DISCARDED,UNPUBLISHED',Blocked:'BLOCKED',Pending:'PENDING',Escalated:'PENDING',Published:'PUBLISHED',Recheck:'RECHECK',Discarded:'DISCARDED',TakenDown:'UNPUBLISHED'};
// What each review action says in the post panel's history.
const HIST: Readonly<Record<string, string>> = {SUBMIT:'Sent in for review',RESUBMIT:'Sent in again after fixing',PUBLISH:'Published',AUTO_PUBLISH:'Published directly (admin post)',RECHECK:'Sent for recheck',DISCARD:'Discarded',UNPUBLISH:'Taken down',BLOCK:'Blocked: the citizen was blocked',UNBLOCK:'Unblocked: the citizen can post again',BLOCK_ENDED:'Block ended: the time was up',ESCALATE:'Escalated: waited past the time limit, sent up a level'};
// History dots by exact action (a pattern would colour UNPUBLISH like PUBLISH). UNBLOCK and BLOCK_ENDED are written by the
// server once the backend plan of 2026-11-21 (part 6) is live.
const HIST_DOT: Readonly<Record<string, string>> = {PUBLISH:'#1F8A3B',AUTO_PUBLISH:'#1F8A3B',RECHECK:'#8f4bb4',DISCARD:'#3b4a5c',UNPUBLISH:'#b3261e',REVERSE:'#0D3B7A',BLOCK:'#7a1f17',UNBLOCK:'#1d7a33',BLOCK_ENDED:'#6b7a8c'};
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
    urgent: !!p.is_urgent, escalated: !!p.escalated, escalationLevel: p.escalation_level || '', event: p.event || null, allowed: p.allowed_actions || [], citizen: p.citizen || null,
  };
}

function postQuery(h: ConsoleHost, page: number): Query {
  const s = h.state;
  return {status: s.statusTab === 'All' ? '' : SAPI[s.statusTab], escalated: s.statusTab === 'Escalated' ? 'true' : '', source: s.pf.source, district: s.pf.district, category: s.pf.cat, q: s.gsearch, page, page_size: PAGE_SIZE};
}

export function loadPosts(h: ConsoleHost, page: number) {
  const latest = h.ticket('posts');
  h.setState({postsLoading: true});
  // status_counts has no escalated number, so the Escalated tab's count is one more small call with the same filters.
  // On the Escalated tab it is the other way round: the server counts with every filter but `status`, escalated
  // included, so the list's status_counts would cover escalated posts only (All 11, Published 0 …). The tab counts
  // then come from one small call without `escalated`, and the escalated number is the list's own total.
  const onEscalated = h.state.statusTab === 'Escalated';
  // The side call only fills counts: if it fails, the list still shows (as before).
  const side = h.api.get<PostsPage>('/posts/', onEscalated
    ? {...postQuery(h, 1), status: '', escalated: '', page_size: 1}
    : {...postQuery(h, 1), status: 'PENDING', escalated: 'true', page_size: 1}).catch(() => null);
  // Blocked posts with their phone: Posts › Blocked lists one citizen per phone, and its number is theirs. Few, one page.
  loadBlockedCitizens(h);
  Promise.all([h.api.get<PostsPage>('/posts/', postQuery(h, page)), side])
    .then(([d, other]) => {
      if (!latest()) return;
      const counts = (onEscalated ? other?.status_counts ?? d.status_counts : d.status_counts) || {};
      const esc = onEscalated ? d.count : other?.count ?? 0;
      h.setState({posts: d.results.map((p) => adaptPost(h, p)), postCount: d.count, postPage: page, postPages: pageCount(d.count), statusCounts: {...counts, ESCALATED: esc}, pendingCount: counts.PENDING || 0, postsLoading: false});
    })
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
// The next waiting post in the list after this one (then before it), for reviewing a queue without going back.
function nextWaiting(h: ConsoleHost, p: PostRow): PostRow | null {
  const all = h.state.posts;
  const i = all.findIndex((x) => x.id === p.id);
  const waiting = (x: PostRow) => x.id !== p.id && x.status === 'Pending';
  return all.slice(i + 1).find(waiting) || all.slice(0, Math.max(i, 0)).find(waiting) || null;
}

// After Publish, Recheck or Discard (andNext), the panel moves on to the next waiting post, or closes when none is left.
function review(h: ConsoleHost, p: PostRow, body: {action: string; comment?: string; to_status?: string}, done: (note: string) => void, andNext = false) {
  h.api.post('/posts/' + p.id + '/review/', body).then(() => {
    const next = andNext ? nextWaiting(h, p) : null;
    done(!andNext ? '' : next ? ' · next post opened' : ' · no more waiting posts on this page');
    loadPosts(h, h.state.postPage);
    if (!andNext) refreshPost(h, p.id);
    else if (next) openPost(h, next);
    else h.setState({panel: null});
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
  if (kind === 'blockCitizen') h.ask({title: 'Block this citizen', body: 'This phone can’t send new posts until the block ends. You can unblock it any time. You find the phone under Posts › Blocked. Its published posts stay. The citizen sees your reason.', hasSelect: true, selectLabel: 'Block for', options: [{id: '1', label: '1 day'}, {id: '7', label: '7 days'}, {id: '30', label: '30 days'}, {id: '90', label: '90 days'}], sel: '7', needsText: true, textLabel: 'Reason (required)', confirmLabel: 'Block', bg: '#b3261e', onConfirm: (t, sel) => h.api.post('/posts/' + p.id + '/block-citizen/', {comment: t, days: Number(sel || 7)}).then(after('Citizen blocked')).catch((e: unknown) => h.fail(e))});
  if (kind === 'unblockCitizen') h.ask({title: 'Unblock this citizen', body: 'The phone can post again.', confirmLabel: 'Unblock', bg: '#1d7a33', onConfirm: () => h.api.post('/posts/' + p.id + '/unblock-citizen/').then(after('Citizen unblocked')).catch((e: unknown) => h.fail(e))});
  if (kind === 'discardCitizen') h.ask({title: 'Discard all their waiting posts', body: 'Every post from this phone that is waiting for review is discarded (for spam). The phone is not blocked.', needsText: true, textLabel: 'Reason (required)', confirmLabel: 'Discard all', bg: '#3b4a5c', onConfirm: (t) => h.api.post<DiscardCitizenResult | null>('/posts/' + p.id + '/discard-citizen-posts/', {comment: t}).then((d) => after('Discarded ' + ((d && d.discarded) || 0) + ' posts')()).catch((e: unknown) => h.fail(e))});
  if (kind === 'publish') h.ask({title: 'Publish post', body: 'Publish "' + title + '"? Citizens in ' + (p.area || area) + ' will see it straight away.', confirmLabel: 'Publish', bg: '#1F8A3B', onConfirm: () => review(h, p, {action: 'publish'}, (n) => h.toast('Post published' + n), true)});
  if (kind === 'recheck') h.ask({title: 'Send for recheck', body: 'The writer sees your comment, fixes the post and sends it again.', needsText: true, textLabel: 'What should the writer fix? (required)', confirmLabel: 'Send for recheck', bg: '#E9791E', onConfirm: (t) => review(h, p, {action: 'recheck', comment: t}, (n) => h.toast('Sent for recheck' + n, '#E9791E'), true)});
  if (kind === 'discard') h.ask({title: 'Discard post', body: 'The post will not be published. The author is told your reason.', needsText: true, textLabel: 'Reason (required)', confirmLabel: 'Discard', bg: '#3b4a5c', onConfirm: (t) => review(h, p, {action: 'discard', comment: t}, (n) => h.toast('Post discarded' + n, '#cfd8e3'), true)});
  if (kind === 'takedown') h.ask({title: 'Take down post', body: 'Remove "' + title + '" from every citizen\'s feed now.', needsText: true, textLabel: 'Reason (required)', confirmLabel: 'Take down', bg: '#b3261e', onConfirm: (t) => review(h, p, {action: 'unpublish', comment: t}, () => h.toast('Post taken down', '#E9791E'))});
  if (kind === 'override') h.ask({title: 'Change decision', body: 'Now: ' + STATUS[p.status].label + '. Choose the new status and say why you are changing the earlier reviewer\'s decision.', hasSelect: true, selectLabel: 'New status', options: changeOptions(p), sel: changeOptions(p)[0]?.id, needsText: true, textLabel: 'Reason (required)', confirmLabel: 'Change decision', bg: '#0D3B7A', onConfirm: (t, sel) => review(h, p, {action: 'reverse', to_status: SAPI[sel], comment: t}, () => h.toast('Decision changed → ' + STATUS[sel].label))});
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
    ? 'Decision changed: ' + (ST[SK[a.from_status ?? '']] || {label: a.from_status}).label + ' → ' + (ST[SK[a.to_status ?? '']] || {label: a.to_status}).label
    : (HIST[a.action] || a.action);
  // A citizen's own step (sending the post from the app): no account, role CITIZEN and an empty name.
  const citizen = a.actor?.role === 'CITIZEN';
  return {who: citizen ? 'A citizen' : (a.actor && a.actor.name) || 'System', role: citizen ? 'Citizen (app)' : rk === 'system' ? 'Automatic' : R[rk].label, action: label, note: a.comment || '', hasNote: !!a.comment, time: h.fmt(a.at),
    dot: HIST_DOT[a.action] || '#E9791E'};
}

// ---- several posts at once: waiting ones published or discarded, published ones taken down (2026-11-20, tester's
// item 6), decided ones (Recheck, Rejected, Blocked) changed to another status (owner, 2026-11-20). The server
// reviews one post per request, so one by one with progress ----

// One review request per post. A null body skips that post (already in the chosen status), counted apart.
async function runBulk(h: ConsoleHost, items: [SelId, Record<string, string> | null][], doing: string, doneWord: string, color: string) {
  const n = items.length;
  let ok = 0, taken = 0, skipped = 0, why = '';
  for (let i = 0; i < n; i++) {
    const [id, body] = items[i];
    h.setState({bulk: doing + ' ' + (i + 1) + ' of ' + n + '…'});
    if (!body) {
      skipped++;
      continue;
    }
    try {
      await h.api.post('/posts/' + id + '/review/', body);
      ok++;
    } catch (e) {
      if (e instanceof ApiError && e.code === 'already_decided') {
        taken++;
        continue;
      }
      // The session ended or this admin may not review these: the rest would fail too, so stop here.
      if (isStatus(e, 401) || isStatus(e, 403)) {
        h.setState({bulk: '', postSel: []});
        if (isStatus(e, 403)) loadPosts(h, h.state.postPage);
        h.fail(e);
        return;
      }
      why = why || (e instanceof Error && e.message) || 'the server did not answer';
    }
  }
  // A mixed pick keeps the other kinds selected for their own buttons.
  const ids = items.map(([id]) => id);
  h.setState({bulk: '', postSel: h.state.postSel.filter((id) => !ids.includes(id))});
  loadPosts(h, h.state.postPage);
  const done = ok + ' ' + doneWord;
  const notes = [skipped ? skipped + ' skipped: already in that status, or a citizen’s post (it cannot go to Recheck)' : '', taken ? taken + ' already decided by another reviewer' : '', why ? (n - ok - taken - skipped) + ' failed: ' + why : ''].filter(Boolean);
  if (notes.length) h.ask({title: done, body: notes.join('. ') + '.', confirmLabel: 'Close', bg: '#3b4a5c', noCancel: true, onConfirm: () => {}});
  else h.toast(done, color);
}

// Change the decision on several decided posts: one new status and one reason for all, a `reverse` each.
function bulkReverse(h: ConsoleHost, rows: PostRow[]) {
  if (!rows.length || h.state.bulk) return;
  const n = rows.length, what = n + (n === 1 ? ' post' : ' posts');
  h.ask({title: 'Change the decision on ' + what, body: 'Choose the new status and say why. Each author is told. Posts already in that status are skipped.', hasSelect: true, selectLabel: 'New status', options: [{id: 'Published', label: 'Published'}, {id: 'Pending', label: 'Waiting (back to review)'}, {id: 'Recheck', label: 'Recheck'}, {id: 'Discarded', label: 'Discarded'}], sel: 'Published', needsText: true, textLabel: 'Reason for all (required)', confirmLabel: 'Change decision (' + n + ')', bg: '#0D3B7A',
    onConfirm: (t, sel) => { void runBulk(h, rows.map((p) => [p.id, p.status === sel || (sel === 'Recheck' && p.citizen) ? null : {action: 'reverse', to_status: SAPI[sel], comment: t}]), 'Changing', 'changed', '#0D3B7A'); }});
}

function bulkReview(h: ConsoleHost, ids: SelId[], action: 'publish' | 'discard' | 'unpublish') {
  if (!ids.length || h.state.bulk) return;
  const n = ids.length;
  const run = (comment: string) => runBulk(h, ids.map((id): [SelId, Record<string, string>] => [id, action === 'publish' ? {action} : {action, comment}]),
    action === 'publish' ? 'Publishing' : action === 'unpublish' ? 'Taking down' : 'Discarding',
    action === 'publish' ? 'published' : action === 'unpublish' ? 'taken down' : 'discarded', action === 'publish' ? '#1F8A3B' : '#cfd8e3');
  const what = n + (n === 1 ? ' post' : ' posts');
  if (action === 'publish') h.ask({title: 'Publish ' + what, body: "Citizens in each post's areas will see them straight away.", confirmLabel: 'Publish ' + n, bg: '#1F8A3B', onConfirm: () => { void run(''); }});
  else if (action === 'unpublish') h.ask({title: 'Take down ' + what, body: 'Citizens no longer see them. Each author is told your reason.', needsText: true, textLabel: 'Reason for all (required)', confirmLabel: 'Take down ' + n, bg: '#b3261e', onConfirm: (t) => { void run(t); }});
  else h.ask({title: 'Discard ' + what, body: 'They will not be published. Each author is told your reason.', needsText: true, textLabel: 'Reason for all (required)', confirmLabel: 'Discard ' + n, bg: '#3b4a5c', onConfirm: (t) => { void run(t); }});
}

// A published post's website link, to send on WhatsApp. Without clipboard access the link is shown to copy by hand.
function copyLink(h: ConsoleHost, url: string) {
  const show = () => h.ask({title: 'Post link', body: url, confirmLabel: 'Close', bg: '#3b4a5c', noCancel: true, onConfirm: () => {}});
  if (!navigator.clipboard || !window.isSecureContext) return show();
  navigator.clipboard.writeText(url).then(() => h.toast('Link copied')).catch(show);
}

// [label, action, border, background, colour]
type Act = [string, string, string, string, string];

// Change decision: the statuses a decided post can move to, in action words. A citizen post never goes back to
// Recheck (a citizen cannot edit it; the server refuses).
function changeOptions(p: PostRow) {
  return [{id: 'Published', label: 'Publish'}, {id: 'Pending', label: 'Back to waiting'}, {id: 'Recheck', label: 'Recheck'}, {id: 'Discarded', label: 'Discard'}]
    .filter((o) => o.id !== p.status && !(o.id === 'Recheck' && p.citizen));
}

// What each status means, at the top of the post panel (owner, 2026-11-21).
const STATUS_WHY: Readonly<Record<string, string>> = {Pending: 'Not public yet. An admin of its area decides.', Published: 'Citizens of its areas can see it.',
  Recheck: 'Sent back to the writer. They fix it and send it again.', Discarded: 'Not published. The writer sees the reason.',
  TakenDown: 'Was public, now hidden from citizens.', Blocked: 'Closed when the citizen’s phone was blocked.', Draft: 'Not sent for review yet.'};

/** A post as its row and panel show it (the list, the post panel, the user panel's recent posts). */
export function postRow(h: ConsoleHost, p: PostRow, withHistory?: boolean) {
  const s = h.state, ST = STATUS, R = ROLE;
  // A waiting post past the time limit shows as Escalated, naming the level it went up to.
  const esc = p.status === 'Pending' && !!p.escalated;
  const st = esc ? ST.Escalated : ST[p.status] || ST.Pending;
  const lvl = (p.escalationLevel || '').toLowerCase();
  const stTip = esc ? 'Waiting longer than the review time limit' + (lvl ? '; sent up to the ' + (lvl === 'state' ? 'Super Admins' : lvl + ' admins') : '') : '';
  const rr = R[p.role] || R.panchayat;
  const al = p.allowed;
  // What this admin can do in this status (owner, 2026-11-21): the main action filled, the others outlined.
  // Published: Take down only (Change decision on a public post is a take-down by another route).
  const acts: Act[] = [];
  if (p.status === 'Pending') {
    if (al.includes('publish')) acts.push(['Publish', 'publish', '#1F8A3B', '#1F8A3B', '#fff']);
    if (al.includes('recheck')) acts.push(['Recheck', 'recheck', '#E9791E', '#fff', '#b35a0e']);
    if (al.includes('discard')) acts.push(['Discard', 'discard', '#cfd8e3', '#fff', '#3b4a5c']);
  } else if (p.status === 'Published') {
    if (al.includes('unpublish')) acts.push(['Take down', 'takedown', '#b3261e', '#fff', '#b3261e']);
  } else if (al.includes('reverse')) acts.push(['Change decision', 'override', '#0D3B7A', '#0D3B7A', '#fff']);
  // Who decided, when and why; and, with no button, why not (the server's rule in words).
  const dec = p.raw?.decided_by, lr = p.raw?.last_review;
  const byRole = RK[dec?.role ?? ''] || '';
  const decAt = p.raw?.decided_at || lr?.at || '';
  const who = p.status === 'Pending' ? '' : [dec?.name || lr?.actor?.name || '', byRole && R[byRole] ? R[byRole].label : '', decAt ? h.fmt(decAt) : ''].filter(Boolean).join(' · ');
  // A blocked post's reason comes from its citizen's block when the server leaves it out (BLOCK in last_review).
  const reason = p.status === 'Pending' ? '' : lr?.comment || (p.status === 'Blocked' ? blockedCitizens(h).find((c) => c.posts.some((x) => x.id === p.id))?.reason || '' : '');
  const noWhy = p.status === 'Published' ? 'Only a higher level can take this down.' : p.status === 'Pending' || !byRole ? 'No actions available for this post.'
    : byRole === 'super' ? 'A Super Admin decided this. It is final.' : 'Only a level above ' + (R[byRole] ? R[byRole].label : byRole) + ' can change this.';
  const hint = p.status === 'Pending' ? 'Publish it, send it for Recheck (the writer fixes it and sends it again), or discard it.' : p.status === 'Published' ? 'Take it down to hide it from citizens. The writer sees your reason.' : 'Move it to another status. A reason is needed.';
  // Urgent only means something while a post waits or is public.
  const urgentOk = al.includes('set_urgent') && (p.status === 'Pending' || p.status === 'Published');
  const phoneActs: Act[] = [];
  if (al.includes('block_citizen')) phoneActs.push(['Block this phone', 'blockCitizen', '#b3261e', '#fff', '#b3261e']);
  if (al.includes('unblock_citizen')) phoneActs.push(['Unblock this phone', 'unblockCitizen', '#1d7a33', '#fff', '#1d7a33']);
  if (al.includes('discard_citizen_posts')) phoneActs.push(['Discard all their waiting posts', 'discardCitizen', '#cfd8e3', '#fff', '#3b4a5c']);
  const cz = p.citizen;
  const czLine = cz ? [(cz.posts_total || 0) + ' posts from this phone', (cz.posts_discarded || 0) + ' discarded', cz.blocked ? (cz.blocked_until ? 'Blocked until ' + h.fmt(cz.blocked_until, true).slice(0, 11) : 'Blocked') : 'Can post'].filter(Boolean).join(' · ') : '';
  const ev = p.event;
  const evs = ev ? (EVENT[ev.kind] || [ev.kind, '#e3f0fb', '#0D3B7A']) : null;
  const evDates = ev ? (h.fmt(ev.start_date + 'T00:00:00+05:30', true).slice(0, 11) + (ev.end_date ? ' – ' + h.fmt(ev.end_date + 'T00:00:00+05:30', true).slice(0, 11) : '')) : '';
  // The post's own language and its translation's, so screen readers and fonts treat Telugu text as Telugu.
  return {rowKey: p.id, cat: p.cat, catLabel: p.catLabel, titleTe: p.titleTe, titleEn: p.titleEn, bodyTe: p.bodyTe, bodyEn: p.bodyEn, lang: p.raw?.language || undefined, langEn: p.raw?.translation?.language || undefined, area: p.area, date: p.date, author: p.author, authorRole: cz ? 'Citizen (app)' : rr.label, amobile: '', abg: rr.bg, ainitial: (p.author || '?')[0],
    st: {bg: st.bg, color: st.color, label: st.label, tip: stTip}, hasPhoto: p.media.length > 0, photos: p.media.map((m) => ({src: m.thumb_url || m.url, pos: 'center'})), urgent: !!p.urgent,
    hasEvent: !!ev, eventLabel: evs ? evs[0] + ' · ' + evDates : '', eventBg: evs ? evs[1] : '', eventColor: evs ? evs[2] : '',
    hasVideo: (p.videos || []).length > 0, videos: (p.videos || []).map((v) => ({src: v.url, poster: v.poster_url || v.thumb_url || ''})), rowBg: s.panel && s.panel.type === 'post' && s.panel.id === p.id ? '#f0f6fd' : '#fff',
    history: withHistory ? s.panelHistory.map((a) => hist(h, a)) : [], open: () => openPost(h, p), noActions: !acts.length,
    card: {label: st.label, bg: st.bg, color: st.color, reason,
      why: esc ? stTip + '.' : p.status === 'Blocked' ? STATUS_WHY.Blocked + ' ' + (cz?.blocked ? 'The phone is blocked' + (cz.blocked_until ? ' until ' + h.fmt(cz.blocked_until, true).slice(0, 11) : '') + '.' : 'The phone can post again now, but this post stays closed.') : STATUS_WHY[p.status] || '',
      who: p.status === 'Blocked' && who ? 'Blocked by ' + who : who}, actHint: hint, noWhy,
    urgentOk, urgentOn: !!p.urgent, toggleUrgent: () => postAction(h, 'urgent', p),
    phone: cz ? {line: czLine, actions: phoneActs.map(([label, k, border, bg, color]) => ({label, border, bg, color, go: () => postAction(h, k, p)}))} : null,
    shareUrl: p.status === 'Published' ? p.raw?.share_url || '' : '', copyLink: () => { if (p.raw?.share_url) copyLink(h, p.raw.share_url); }, actions: acts.map(([label, k, border, bg, color]) => ({label, border, bg, color, go: () => postAction(h, k, p)}))};
}

/** The page's renderVals() values (screens/Posts.tsx, and the top bar's search). */
export function postsView(h: ConsoleHost) {
  const s = h.state, ST = STATUS;
  const tabs = ['Pending', 'Published', 'Recheck', 'Rejected', 'Blocked'] as const;
  const citizens = blockedCitizens(h);
  // Escalated is Waiting with a filter on, so the Waiting pill stays lit while it is.
  const waiting = s.statusTab === 'Pending' || s.statusTab === 'Escalated';
  const sc = s.statusCounts;
  const tabLabel = (k: typeof tabs[number]) => k === 'Pending' ? 'Waiting for review' : k === 'Rejected' ? 'Rejected' : ST[k].label;
  const statusTabs = [{id: 'All' as const, label: 'All'}, ...tabs.map((k) => ({id: k, label: tabLabel(k)}))].map((t) => {
    const on = t.id === 'Pending' ? waiting : s.statusTab === t.id;
    const n = t.id === 'All' ? (sc.ALL || 0) : t.id === 'Rejected' ? (sc.DISCARDED || 0) + (sc.UNPUBLISHED || 0)
      : t.id === 'Blocked' ? citizens.length : (sc[SAPI[t.id]] || 0);
    return {label: t.label, count: n, on, line: on ? '#0D3B7A' : 'transparent', color: on ? '#0A2550' : '#6b7a8c', cbg: on ? '#0D3B7A' : '#eef2f6', ccolor: on ? '#fff' : '#3b4a5c', go: () => { h.setState({statusTab: t.id}, () => loadPosts(h, 1)); }};
  });
  // Inside Waiting: "Escalated only (n)", the posts waiting past the time limit; they also come first in the list.
  const escFilter = {show: waiting, on: s.statusTab === 'Escalated', count: sc.ESCALATED || 0,
    go: () => { h.setState({statusTab: s.statusTab === 'Escalated' ? 'Pending' : 'Escalated'}, () => loadPosts(h, 1)); }};
  const ordered = waiting ? [...s.posts].sort((a, b) => Number(!!b.escalated) - Number(!!a.escalated)) : s.posts;
  const pf = s.pf;
  // Only posts this admin can act on can be ticked: waiting ones to publish or discard, published ones to take down,
  // decided ones (Recheck, Rejected, Blocked) whose decision the server lets them change. A tick left from another
  // page or tab is ignored.
  const canReverse = (p: PostRow) => ['Recheck', 'Discarded', 'TakenDown', 'Blocked'].includes(p.status) && p.allowed.includes('reverse');
  const canBulk = (p: PostRow) => p.status === 'Pending' ? p.allowed.includes('publish') || p.allowed.includes('discard') : p.status === 'Published' ? p.allowed.includes('unpublish') : canReverse(p);
  // Every row can be ticked on every tab (owner, 2026-11-20); each button acts only on the rows the server allows,
  // and the rest are counted with the reason (a Super Admin's decision is changed only by a higher level).
  const selectable: SelId[] = ordered.map((p) => p.id);
  const picked = s.postSel.filter((id) => selectable.includes(id));
  const pickedRows = s.posts.filter((p) => picked.includes(p.id));
  const actRows = pickedRows.filter(canBulk);
  const waitRows = actRows.filter((p) => p.status === 'Pending'), pubRows = actRows.filter((p) => p.status === 'Published');
  const revRows = actRows.filter(canReverse);
  const noAction = pickedRows.length - actRows.length;
  // The bar over the table, as the app's: how many of the page are ticked, one button per action with its own count
  // (a mixed pick on All: each acts on its own kind only), and why the other ticked posts have no action.
  const canPub = waitRows.length > 0 && waitRows.every((p) => p.allowed.includes('publish')), canDis = waitRows.length > 0 && waitRows.every((p) => p.allowed.includes('discard'));
  const actions: BulkAction[] = [
    ...(canPub ? [{label: 'Publish', count: waitRows.length, bg: '#1F8A3B', fg: '#fff', border: '#1F8A3B', onClick: () => bulkReview(h, waitRows.map((p) => p.id), 'publish')}] : []),
    ...(canDis ? [{label: 'Discard', count: waitRows.length, bg: '#fff', fg: '#3b4a5c', border: '#cfd8e3', onClick: () => bulkReview(h, waitRows.map((p) => p.id), 'discard')}] : []),
    ...(pubRows.length ? [{label: 'Take down', count: pubRows.length, bg: '#b3261e', fg: '#fff', border: '#b3261e', onClick: () => bulkReview(h, pubRows.map((p) => p.id), 'unpublish')}] : []),
    ...(revRows.length ? [{label: 'Change decision', count: revRows.length, bg: '#0D3B7A', fg: '#fff', border: '#0D3B7A', onClick: () => bulkReverse(h, revRows)}] : []),
  ];
  const postSel = {show: selectable.length > 0, count: picked.length, all: picked.length > 0 && picked.length === selectable.length, some: picked.length > 0 && picked.length < selectable.length,
    label: picked.length + ' of ' + selectable.length + ' selected', busy: s.bulk, actions,
    note: noAction ? (noAction === 1 ? '1 selected post has no action for you' : noAction + ' selected posts have no action for you') + ': only a higher level can change a Super Admin’s decision.' : '',
    toggleAll: () => h.setState({postSel: picked.length === selectable.length ? [] : selectable}), clear: () => h.setState({postSel: []})};
  const postRows = ordered.map((p) => ({...postRow(h, p), selectable: true, sel: picked.includes(p.id), toggleSel: () => h.toggleSel('postSel', p.id)}));
  const catOpts = s.categories.map((c) => ({id: c.key, label: c.name_en || c.name || c.key}));
  return {
    gsearch: s.gsearch,
    onGSearch: (e: FieldChange) => {
      const v = e.target.value;
      h.setState({gsearch: v, page: v ? 'posts' : s.page, statusTab: v ? 'All' : s.statusTab});
      h.later('search', () => loadPosts(h, 1), 300);
    },
    statusTabs, escFilter, pf, postSel,
    // Posts › Blocked: the citizens, not posts.
    blockedTab: s.statusTab === 'Blocked', citizenRows: citizens.map((c) => ({key: c.id, title: 'Citizen of ' + c.village, state: c.state, blocked: c.blocked,
      closed: c.fromServer ? c.total + (c.total === 1 ? ' post' : ' posts') : c.posts.length + (c.posts.length === 1 ? ' post closed' : ' posts closed'), reason: c.reason, by: c.by, view: () => openCitizen(h, c.id, c.fromServer)})),
    citizenCount: citizens.filter((c) => c.blocked).length, citizenTotal: citizens.length,
    onPF: (e: FieldChange) => {
      const {name, value} = e.target;
      h.setState((st) => ({pf: {...st.pf, [name]: value}}), () => loadPosts(h, 1));
    },
    // The top bar's search filters this list too, so it counts as a filter here and "Clear filters" empties it.
    filtersOn: !!(pf.source || pf.district || pf.cat || s.gsearch.trim()), searchNote: s.gsearch.trim() ? 'Search: “' + s.gsearch.trim() + '”' : '',
    clearFilters: () => { h.setState({pf: {...pf, source: '', district: '', cat: ''}, gsearch: ''}, () => loadPosts(h, 1)); },
    postRows, postCount: s.postCount, postEmpty: !postRows.length,
    postEmptyText: s.postsLoading ? 'Loading…' : (pf.source || pf.district || pf.cat || s.gsearch.trim()) ? 'No posts match these filters'
      : s.statusTab === 'All' ? 'No posts yet' : 'No posts in ' + (statusTabs.find((t) => t.on)?.label || '').toLowerCase(),
    postEmptyHint: s.postsLoading ? '' : (pf.source || pf.district || pf.cat || s.gsearch.trim()) ? 'Try another filter, or Clear filters.' : '', postsPager: pager(s.postPage, s.postPages, (p) => loadPosts(h, p)), catOpts,
  };
}

/** The block's reason for each citizen's latest blocked post, from its history, once each. The server's last_review
 *  leaves BLOCK out (backend plan of 2026-11-21, part 5); when it is fixed, last_review.comment is used first. */
// Whether the server has the blocked citizens list (backend plan of 2026-11-21, part 2): null not asked yet, false it
// answered 404 (the list is built from the blocked posts instead).
let citizenApi: boolean | null = null;

/** Posts › Blocked: the server's list of blocked phones (blocked now and ended), or, before it exists, the blocked posts
 *  grouped by phone. A failed call keeps what was shown. */
function loadBlockedCitizens(h: ConsoleHost) {
  const district = h.state.pf.district;
  const fallback = () => h.api.get<PostsPage>('/posts/', {...postQuery(h, 1), status: 'BLOCKED', escalated: '', page: 1, page_size: 100})
    .then((bl) => { h.setState({blockedPosts: bl.results.map((p) => adaptPost(h, p)), citizensServer: null}); fillBlockReasons(h); })
    .catch(() => {});
  if (citizenApi === false) { void fallback(); return; }
  Promise.all([1, 0].map((active) => h.api.get<Paged<BlockedCitizenRow>>('/admin/citizens/blocked/', {active, district, page_size: 100})))
    .then((pages) => { citizenApi = true; h.setState({citizensServer: pages.flatMap((pg) => pg.results || [])}); })
    .catch((e: unknown) => { if (isStatus(e, 404)) { citizenApi = false; void fallback(); } });
}

/** The block's reason for each citizen's latest blocked post, from its history, once each. The server's last_review
 *  leaves BLOCK out (backend plan of 2026-11-21, part 5); when it is fixed, last_review.comment is used first. */
function fillBlockReasons(h: ConsoleHost) {
  for (const c of blockedCitizens(h)) {
    const p = c.latest;
    if (!p || p.raw?.last_review?.comment || h.state.blockReasons[p.id] !== undefined) continue;
    h.api.get<ReviewAction[]>('/posts/' + p.id + '/history/').then((hi) => {
      const block = (hi || []).filter((a) => a.action === 'BLOCK').sort((a, b) => b.at.localeCompare(a.at))[0];
      h.setState((s) => ({blockReasons: {...s.blockReasons, [p.id]: block?.comment || ''}}));
    }).catch(() => {});
  }
}

/** A citizen opened from the server's list: every post of the phone, and its blocks (when the server has them). */
function openCitizen(h: ConsoleHost, id: string, fromServer: boolean) {
  h.setState({panel: {type: 'citizen', id}, citizenPosts: [], citizenBlocks: []});
  if (!fromServer) return;
  h.api.get<PostsPage>('/posts/', {citizen: id, page_size: 50})
    .then((d) => h.setState({citizenPosts: d.results.map((p) => adaptPost(h, p))})).catch(() => {});
  h.api.get<CitizenBlock[] | Paged<CitizenBlock>>('/admin/citizens/' + id + '/blocks/')
    .then((d) => h.setState({citizenBlocks: Array.isArray(d) ? d : d.results || []})).catch(() => {});
}

/** The blocked posts grouped by phone, blocked-now first: who, where, until when, why, and the posts closed. */
function blockedCitizens(h: ConsoleHost) {
  const day = (v?: string | null) => v ? h.fmt(v, true).slice(0, 11) : '';
  const byLine = (name: string, role: string, at: string) => {
    const rk = RK[role] || '';
    const who = [name, rk && ROLE[rk] ? ROLE[rk].label : '', at ? h.fmt(at) : ''].filter(Boolean).join(' · ');
    return who ? 'Blocked by ' + who : '';
  };
  const state = (blocked: boolean, until: string) => blocked ? (until ? 'Blocked until ' + until : 'Blocked') : 'Can post again';
  // From the server's list (backend plan, part 2): its own fields; the phone's posts load when it is opened.
  if (h.state.citizensServer) {
    return h.state.citizensServer.map((r) => ({id: r.id, posts: [] as PostRow[], latest: undefined as PostRow | undefined, fromServer: true,
      village: r.village?.name || '', blocked: r.blocked, until: day(r.blocked_until), state: state(r.blocked, day(r.blocked_until)),
      reason: r.reason || '', at: r.blocked_at || '', total: r.posts_total || 0, discarded: r.posts_discarded || 0,
      by: byLine(r.blocked_by?.name || '', r.blocked_by?.role || '', r.blocked_at || '')}))
      .sort((a, b) => a.blocked !== b.blocked ? (a.blocked ? -1 : 1) : b.at.localeCompare(a.at));
  }
  // Before it: the blocked posts grouped by phone, newest first.
  const byPhone = new Map<string, PostRow[]>();
  for (const p of h.state.blockedPosts) {
    const id = p.citizen?.device_id;
    if (id) byPhone.set(id, [...(byPhone.get(id) || []), p]);
  }
  const at = (p: PostRow) => p.raw?.decided_at || p.raw?.last_review?.at || '';
  return [...byPhone.entries()].map(([id, posts]) => {
    posts.sort((a, b) => at(b).localeCompare(at(a)));
    const p = posts[0], cz = p.citizen || {}, until = day(cz.blocked_until);
    return {id, posts, latest: p as PostRow | undefined, fromServer: false, village: p.areaName || p.area, blocked: !!cz.blocked, until,
      state: state(!!cz.blocked, until),
      reason: p.raw?.last_review?.comment || h.state.blockReasons[p.id] || '', at: at(p), total: cz.posts_total || 0, discarded: cz.posts_discarded || 0,
      by: byLine(p.raw?.decided_by?.name || p.raw?.last_review?.actor?.name || '', p.raw?.decided_by?.role || '', at(p))};
  }).sort((a, b) => a.blocked !== b.blocked ? (a.blocked ? -1 : 1) : b.at.localeCompare(a.at));
}

/** The citizen panel (panels/CitizenDetail.tsx): a blocked phone, Unblock, and the posts the block closed. */
function citizenPanelView(h: ConsoleHost) {
  const s = h.state;
  const c = s.panel && s.panel.type === 'citizen' ? blockedCitizens(h).find((x) => x.id === s.panel?.id) : undefined;
  if (!c) return null;
  const day = (v?: string | null) => v ? h.fmt(v, true).slice(0, 11) : '';
  // From the server's list: every post of the phone (any status); before it: the posts the block closed.
  const posts = c.fromServer ? s.citizenPosts : c.posts;
  const closed = posts.filter((p) => p.status === 'Blocked' && p.allowed.includes('reverse'));
  return {title: 'Citizen of ' + c.village, state: c.state, blocked: c.blocked, reason: c.reason, by: c.by,
    why: c.blocked ? 'This phone can’t post until then. The block ends by itself on that day.' : 'The block has ended. This phone can post again.',
    counts: c.total + ' posts from this phone · ' + c.discarded + ' discarded',
    canUnblock: c.blocked && (c.fromServer || !!c.latest?.allowed.includes('unblock_citizen')),
    unblock: () => {
      if (!c.fromServer) { if (c.latest) postAction(h, 'unblockCitizen', c.latest); return; }
      h.ask({title: 'Unblock this citizen', body: 'The phone can post again.', confirmLabel: 'Unblock', bg: '#1d7a33',
        onConfirm: () => h.api.post('/admin/citizens/' + c.id + '/unblock/')
          .then(() => { h.toast('Citizen unblocked'); h.setState({panel: null}); loadPosts(h, h.state.postPage); })
          .catch((e: unknown) => h.fail(e))});
    },
    // Posts a block closed in the past (before blocks stopped closing posts): move them back, once the server lets
    // Super Admins change any decision (backend plan of 2026-11-21, part 1).
    canBringBack: closed.length > 0, bringBack: () => bulkReverse(h, closed),
    // Every block of this phone and how it ended (backend plan, part 6 with part 7).
    periods: s.citizenBlocks.map((b) => [
      'Blocked ' + day(b.blocked_at) + (b.blocked_by?.name ? ' by ' + b.blocked_by.name : ''),
      b.ended_at ? (b.ended_by?.name ? 'unblocked ' + day(b.ended_at) + ' by ' + b.ended_by.name : 'ended ' + day(b.ended_at) + ' (time up)') : b.blocked_until ? 'until ' + day(b.blocked_until) : '',
      b.reason ? '“' + b.reason + '”' : '',
    ].filter(Boolean).join(' · ')),
    postsLabel: (c.fromServer ? 'Posts from this phone (' : 'Posts closed by the block (') + posts.length + ')',
    posts: posts.map((p) => ({key: p.id, title: p.titleTe || p.titleEn, date: p.date, open: () => openPost(h, p),
      status: (STATUS[p.status] || STATUS.Pending).label, sbg: (STATUS[p.status] || STATUS.Pending).bg, scolor: (STATUS[p.status] || STATUS.Pending).color}))};
}

/** The side panel's frame and the post panel's values (panels/DetailPanel.tsx, PostDetail.tsx). */
export function postPanelView(h: ConsoleHost) {
  const s = h.state;
  const panel = s.panel ? {show: true, isPost: s.panel.type === 'post', isUser: s.panel.type === 'user', isCitizen: s.panel.type === 'citizen',
    title: s.panel.type === 'post' ? 'Post review' : s.panel.type === 'citizen' ? 'Citizen’s phone' : 'User details'} : {show: false};
  const empty: PostRow = {id: '', cat: 'updates', catLabel: '', titleTe: '', titleEn: '', bodyTe: '', bodyEn: '', area: '', areaName: '', date: '', author: '', role: 'panchayat', status: 'Pending', media: [], videos: [], urgent: false, event: null, allowed: [], citizen: null};
  const sp = postRow(h, s.panelPost || empty, true);
  // The panel names every area the post goes to (the list shows the first one and "+N").
  const spTargets = (s.panelPost && s.panelPost.raw && s.panelPost.raw.targets) || [];
  if (spTargets.length > 1 && spTargets[0].level !== 'STATE') sp.area = spTargets.map((t) => h.an(t)).join(', ');
  return {panel, sp, cz: citizenPanelView(h), closePanel: () => h.setState({panel: null})};
}
