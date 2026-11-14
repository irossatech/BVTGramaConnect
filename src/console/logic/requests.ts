// Service requests page (sidebar "Services", tab "Citizen requests") and its side panel: requests citizens send
// from Services in the app. Moved out of Console.tsx unchanged (audit WEB-ARCH-001).
// Calls GET/PATCH /service-requests/ and GET /users/ for the assignee list (.claude/api.md).
import type { Paged, ServiceRequest, ServiceRequestsPage, User } from "../types";
import { isStatus, orEmpty, pageCount, pager, PAGE_SIZE, RK, ROLE, type FieldChange, type Tone } from "../model";
import type { ConsoleHost } from "./host";

// Service request: what the citizen is told when it moves to each status.
const SVC_MOVE: Readonly<Record<string, string>> = {NEW:'The request goes back to New.',APPROVED:'The citizen sees that it is approved.',IN_PROGRESS:'The citizen sees that work has started.',COMPLETED:'The citizen sees that it is done. Write what they should do next.',REJECTED:'Write why. The citizen sees your reason.'};
// Service requests from citizens (backend plan: service-requests). Status keys as the server sends them.
const SVC_STATUS: Readonly<Record<string, Tone & {dot: string}>> = {NEW:{label:'New',bg:'#e3f0fb',color:'#0D3B7A',dot:'#0D3B7A'},APPROVED:{label:'Approved',bg:'#dff3f5',color:'#07818e',dot:'#07818e'},IN_PROGRESS:{label:'In progress',bg:'#fff0dc',color:'#b35a0e',dot:'#b35a0e'},COMPLETED:{label:'Completed',bg:'#e4f4df',color:'#1d7a33',dot:'#1d7a33'},REJECTED:{label:'Rejected',bg:'#fde7e5',color:'#b3261e',dot:'#b3261e'}};
const SERVICES: Readonly<Record<string, string>> = {aadhaar:'Aadhaar Services',pan:'PAN Services',voter_id:'Voter ID',certificates:'Certificates',loans_insurance:'Loans & Insurance',govt_schemes:'Govt Schemes',land_records:'Land Records',farmer:'Farmer Services'};

export function loadRequests(h: ConsoleHost, page: number) {
  const s = h.state;
  const latest = h.ticket('reqs');
  h.setState({reqLoading: true});
  // contact=0: the rows come without the citizen's phone, email and address (audit WEB-DP-001); openRequestRow reads them.
  h.api.get<ServiceRequestsPage>('/service-requests/', {status: s.reqFilter === 'ALL' ? '' : s.reqFilter, q: s.reqQ, contact: '0', page, page_size: PAGE_SIZE})
    .then((d) => latest() && h.setState({reqs: d.results || [], reqCount: d.count || 0, reqCounts: d.status_counts || {}, reqPage: page, reqPages: pageCount(d.count), reqLoading: false, reqUnavailable: false}))
    .catch((e: unknown) => {
      if (!latest()) return;
      h.setState({reqLoading: false, reqs: [], reqCount: 0, reqCounts: {}, reqUnavailable: isStatus(e, 404)});
      if (!isStatus(e, 404)) h.fail(e);
    });
}

// "Open" in the table: the row has no contact details, so the panel shows the request as the server sends it alone.
function openRequestRow(h: ConsoleHost, r: ServiceRequest) {
  const latest = h.ticket('rqOpen');
  h.api.get<ServiceRequest>('/service-requests/' + r.id + '/').then((full) => latest() && openRequest(h, full)).catch((e: unknown) => latest() && h.fail(e));
}

// One request in the side panel; the people it can be assigned to are the active officials this admin sees.
// Also opened from the bell (Console.tsx, openNotif).
export function openRequest(h: ConsoleHost, r: ServiceRequest) {
  h.setState({rq: {r}, rqAssignees: []});
  if ((r.allowed_actions || []).includes('assign')) {
    const latest = h.ticket('rqAssignees');
    h.api.get<Paged<User>>('/users/', {is_active: 'true', page: 1, page_size: 100}).then((d) => latest() && h.state.rq?.r.id === r.id && h.setState({rqAssignees: (d.results || []).map((u) => {
      const ra = (u.role_assignments || [])[0];
      const role = (ROLE[RK[ra?.role ?? '']] || {label: ''}).label;
      return {id: String(u.id), label: !role || u.name.toLowerCase() === role.toLowerCase() ? u.name : u.name + ' · ' + role};
    })})).catch((e: unknown) => latest() && h.fail(e));
  }
}

// Only the person a request is assigned to changes it (the server sends that as allowed_actions); everyone else reads.
function svcAllowed(r: ServiceRequest) {
  return (r.allowed_actions || []).includes('set_status') ? Object.keys(SVC_STATUS) : [];
}

function patchRequest(h: ConsoleHost, r: ServiceRequest, body: {status?: string; assigned_to?: string | null; note?: string}, msg: string) {
  return h.api.patch<ServiceRequest | null>('/service-requests/' + r.id + '/', body).then((n) => {
    h.setState((x) => ({rq: x.rq && {...x.rq, r: n || x.rq.r}}));
    h.toast(msg);
    loadRequests(h, h.state.reqPage);
  }).catch((e: unknown) => h.fail(e));
}

// A note only when the request is closed: why it was rejected, or what to do now it is done.
function moveRequest(h: ConsoleHost, r: ServiceRequest, to: string) {
  const label = SVC_STATUS[to].label;
  const reject = to === 'REJECTED', closing = reject || to === 'COMPLETED';
  h.ask({title: 'Change status to ' + label + '?', body: SVC_MOVE[to], needsText: closing, textLabel: reject ? 'Reason (required; the citizen sees it)' : 'Note for the citizen (required)', confirmLabel: reject ? 'Reject' : 'Change status', bg: reject ? '#b3261e' : '#0D3B7A',
    onConfirm: (t) => patchRequest(h, r, {status: to, ...(t.trim() ? {note: t.trim()} : {})}, 'Status: ' + label)});
}

function assignRequest(h: ConsoleHost, r: ServiceRequest, id: string) {
  const was = r.assigned_to ? String(r.assigned_to.id) : '';
  if (id === was) return;
  const who = h.state.rqAssignees.find((a) => a.id === id);
  patchRequest(h, r, {assigned_to: id || null}, id ? 'Assigned to ' + (who ? who.label.split(' · ')[0] : 'them') : 'Not assigned now');
}

/** The page's renderVals() values (screens/Requests.tsx). */
export function requestsView(h: ConsoleHost) {
  const s = h.state;
  return {
    reqTabs: [...Object.keys(SVC_STATUS), 'ALL'].map((k) => {
      const on = s.reqFilter === k;
      const c = s.reqCounts || {};
      const n = k === 'ALL' ? Object.values(c).reduce((a, b) => a + (b || 0), 0) : (c[k] || 0);
      return {label: k === 'ALL' ? 'All' : SVC_STATUS[k].label, count: n, line: on ? '#0D3B7A' : 'transparent', color: on ? '#0A2550' : '#6b7a8c', cbg: on ? '#0D3B7A' : '#eef2f6', ccolor: on ? '#fff' : '#3b4a5c', go: () => h.setState({reqFilter: k}, () => loadRequests(h, 1))};
    }),
    reqQ: s.reqQ,
    onReqQ: (e: FieldChange) => {
      h.setState({reqQ: e.target.value});
      h.later('requests', () => loadRequests(h, 1), 300);
    },
    reqRows: s.reqs.map((r) => {
      const st = SVC_STATUS[r.status] || SVC_STATUS.NEW;
      // Citizen column: the name only; phone and address are in the panel ("Open").
      return {rowKey: String(r.id), address: '', time: h.fmt(r.created_at, false), service: r.service_name || SERVICES[r.service] || r.service, ref: String(r.id).slice(-6).toUpperCase(), name: r.name, mobile: '',
        place: [r.village && r.village.name, r.mandal && r.mandal.name].filter(Boolean).join(', ') || '—', status: st.label, sbg: st.bg, scolor: st.color, assignee: r.assigned_to ? r.assigned_to.name : '—', open: () => openRequestRow(h, r)};
    }),
    reqCountLabel: s.reqCount + (s.reqCount === 1 ? ' request' : ' requests'), reqEmpty: !s.reqs.length, reqEmptyText: s.reqLoading ? 'Loading…' : s.reqUnavailable ? 'Service requests will show here once the server is updated.' : 'No requests here. Citizens send them from Services in the app.', reqPager: pager(s.reqPage, s.reqPages, (p) => loadRequests(h, p)),
  };
}

/** The side panel's renderVals() values (panels/RequestPanel.tsx). */
export function requestPanelView(h: ConsoleHost) {
  const s = h.state;
  const rq = s.rq;
  return {
    rqShow: !!rq, closeRQ: () => h.setState({rq: null}),
    rq: orEmpty(rq ? (() => {
      const r = rq.r, st = SVC_STATUS[r.status] || SVC_STATUS.NEW, al = r.allowed_actions || [];
      return {service: r.service_name || SERVICES[r.service] || r.service, ref: String(r.id).slice(-6).toUpperCase(), time: h.fmt(r.created_at, true), statusLabel: st.label, sbg: st.bg, scolor: st.color, name: r.name, mobile: '+91 ' + (r.phone || ''), tel: 'tel:+91' + (r.phone || ''), email: r.email || '', mailto: 'mailto:' + (r.email || ''),
        place: [r.village && r.village.name, r.mandal && r.mandal.name, r.district && r.district.name].filter(Boolean).join(', '), details: r.details || '', address: r.address || '', canAssign: al.includes('assign'), assigned: r.assigned_to ? String(r.assigned_to.id) : ''};
    })() : null),
    rqView: orEmpty(rq ? (() => {
      const r = rq.r, steps = ['NEW', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'], rej = r.status === 'REJECTED', at = rej ? 1 : steps.indexOf(r.status);
      const allowed = svcAllowed(r), cur = SVC_STATUS[r.status] || SVC_STATUS.NEW;
      // Every step reached (the current one too) is a filled green tick; Rejected: a red cross after New.
      const tone = (i: number) => rej && i === 1 ? '#b3261e' : i <= at ? '#1F8A3B' : '#cfd8e3';
      return {steps: steps.map((k, i) => {
          const red = rej && i === 1, on = i <= at;
          return {label: red ? 'Rejected' : SVC_STATUS[k].label, bg: on ? tone(i) : '#fff', border: tone(i), bw: 2, mark: on ? (red ? '✕' : '✓') : '', weight: i === at ? 800 : 600, color: red ? '#b3261e' : i === at ? '#0A2550' : '#6b7a8c', line: i === 0 ? '' : (on ? tone(i) : '#cfd8e3')};
        }),
        curLabel: cur.label, curBg: cur.bg, curColor: cur.color, note: r.note || '',
        viewOnly: !allowed.length ? ((r.allowed_actions || []).includes('assign') ? 'Nobody handles this request yet. Assign it to someone below.' : 'View only. ' + (r.assigned_to ? r.assigned_to.name : 'Nobody') + ' handles this request; only they can change it.') : '',
        moves: allowed.filter((k) => k !== r.status).map((k) => ({label: SVC_STATUS[k].label, go: () => moveRequest(h, r, k), color: k === 'REJECTED' ? '#b3261e' : '#0D3B7A'})),
        assignedName: r.assigned_to ? r.assigned_to.name : 'Not assigned', onAssign: (e: FieldChange) => assignRequest(h, r, e.target.value)};
    })() : null),
    rqAssigneeOpts: rq ? [{id: '', label: 'Not assigned'}, ...(rq.r.assigned_to && !s.rqAssignees.some((a) => rq.r.assigned_to && a.id === String(rq.r.assigned_to.id)) ? [{id: String(rq.r.assigned_to.id), label: rq.r.assigned_to.name}] : []), ...s.rqAssignees] : [],
    rqHistory: rq ? [...(rq.r.history || []).slice().reverse().map((ev) => ({dot: (SVC_STATUS[ev.status ?? ''] || {dot: '#9aa6b4'}).dot, what: [ev.status ? (SVC_STATUS[ev.status] || {label: ev.status}).label : '', ev.assigned_to !== undefined ? ('Assigned to ' + (ev.assigned_to ? ev.assigned_to.name : 'nobody')) : ''].filter(Boolean).join(' · '), note: ev.note || '', meta: h.fmt(ev.at, true) + (ev.by ? ' · by ' + ev.by.name : '')})), {dot: '#9aa6b4', what: 'Request received', note: '', meta: h.fmt(rq.r.created_at, true) + ' · from ' + rq.r.name}] : [],
  };
}
