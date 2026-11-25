// Citizens & wallet page (sidebar "Citizens & wallet", BVTGC-139/140): citizens' wallet accounts and the Super Admin's
// help (BackEnd docs/features/citizen-wallet/, requirements D11, D16, FR-9, FR-16, FR-33; mockup console.html).
// Calls (BackEnd docs/api-contract.md, section 21, the Super Admin table; .claude/api.md):
//   GET  /admin/citizen-accounts/?q=&status=&village_id=&page=&page_size=20
//   POST /admin/citizen-accounts/find/ {mobile} or {email}  (a POST, so the number never goes in a URL)
//   POST /admin/citizen-accounts/{id}/email/ {email, reason, called_back}, /release-mobile/ {reason, called_back},
//        /block/, /unblock/, /delete/ {reason}  → the account's row
//   GET  /admin/wallets/{id}/?page_size=20  (the account panel's history)
//   GET  /admin/settings/  (the pilot mandals, for the village filter)
//   POST /admin/wallets/{id}/adjust/ {points, reason}  → the wallet summary; 409 not_enough_points  (BVTGC-140)
//   GET  /admin/referrals/?status=&q=&page=&page_size=20 (status_counts); POST /admin/referrals/{id}/confirm/ and
//        /reject/ {comment}; 409 already_decided carries the row as it is now  (BVTGC-140)
//   GET  /admin/wallet/entries/?account_id=&kind=&status=&from=&to=&page=&page_size=20  (BVTGC-140, BVTGC-151)
//   GET  /admin/wallet/export/?type=referrals|entries&format=csv with the tab's filters  (BVTGC-140)
// Nothing here shows a full email or number: the server sends the last 4 digits and a masked email only.
import { ApiError } from "../api";
import type { CitizenAccountRow, Paged, ReferralRow, Settings, WalletEntryRow, WalletSummary } from "../types";
import { orEmpty, pageCount, pager, PAGE_SIZE, sessionEnded, type FieldChange, type State, type WalletDialog, type WalletDialogKind } from "../model";
import { accountTone, contactLine, entryKind, entryTone, findBody, parsePoints, reasonWords, referralTone, signed } from "../walletText";
import type { ConsoleHost } from "./host";

const ACCOUNTS = '/admin/citizen-accounts/';
const NAVY = '#0D3B7A', RED = '#b3261e', GREEN = '#1F8A3B';

type Tab = State['waTab'];

/** The tabs this Super Admin may open, in order: Accounts, Referrals, Wallet entries. */
function tabs(h: ConsoleHost): Tab[] {
  return [
    ...(h.can('accounts.manage_citizen_accounts') ? ['accounts' as const] : []),
    ...(h.can('wallet.review_referrals') ? ['referrals' as const] : []),
    ...(h.can('wallet.view_wallets') ? ['entries' as const] : []),
  ];
}

/** The page opens on its tab (the first one this user may open): its list, plus the pilot mandals for the filter. */
export function loadWallet(h: ConsoleHost) {
  const open = tabs(h);
  const tab = open.includes(h.state.waTab) ? h.state.waTab : open[0];
  if (!tab) return;
  if (tab !== h.state.waTab) h.setState({waTab: tab});
  loadTab(h, tab);
  if (tab === 'accounts') loadPilot(h);
  // The Referrals pill's number, whatever tab opens first.
  if (tab !== 'referrals' && open.includes('referrals')) loadReferrals(h, 1);
}

function loadTab(h: ConsoleHost, tab: Tab) {
  if (tab === 'accounts') loadAccounts(h, 1);
  if (tab === 'referrals') loadReferrals(h, 1);
  if (tab === 'entries') loadEntries(h, 1);
}

// ---- Referrals tab (BVTGC-140) ----

export function loadReferrals(h: ConsoleHost, page: number) {
  const s = h.state;
  const latest = h.ticket('waRefs');
  h.setState({waRefLoading: true});
  h.api.get<Paged<ReferralRow> & {status_counts?: Record<string, number>}>('/admin/referrals/', {status: s.waRefStatus, q: s.waRefQ.trim(), page, page_size: PAGE_SIZE})
    .then((d) => latest() && h.setState({waRefs: d.results || [], waRefCount: d.count || 0, waRefCounts: d.status_counts || {}, waRefPage: page, waRefPages: pageCount(d.count), waRefLoading: false}))
    .catch((e: unknown) => {
      if (!latest()) return;
      h.setState({waRefLoading: false, waRefs: [], waRefCount: 0});
      h.fail(e);
    });
}

/** Confirm or reject: the row as the server answers it; a referral the hourly job or another Super Admin decided
 *  first (409 already_decided) shows as it is now, with a toast. Either way the counts reload. */
function decideReferral(h: ConsoleHost, d: WalletDialog) {
  const r = d.referral;
  if (!r) return;
  const how = d.kind === 'confirm' ? 'confirm' : 'reject';
  patchDialog(h, {busy: true, err: {}});
  h.api.post<ReferralRow>('/admin/referrals/' + r.id + '/' + how + '/', {comment: d.reason.trim()}).then((row) => {
    h.setState((s) => ({waRefs: s.waRefs.map((x) => (x.id === row.id ? row : x)), waDlg: null}));
    h.toast(how === 'confirm' ? 'Referral confirmed · both points confirmed' : 'Referral not confirmed · both citizens see your comment', how === 'confirm' ? undefined : '#E9791E');
    loadReferrals(h, h.state.waRefPage);
  }).catch((e: unknown) => {
    const now = e instanceof ApiError && e.code === 'already_decided' ? e.body.referral : undefined;
    if (now && typeof now === 'object') {
      const row = now as ReferralRow;
      h.setState((s) => ({waRefs: s.waRefs.map((x) => (x.id === row.id ? row : x)), waDlg: null}));
      h.toast('Already decided: ' + referralTone(row.status).label.toLowerCase() + (row.decided_by ? ' by ' + row.decided_by.name : ' by the hourly job'), '#E9791E');
      loadReferrals(h, h.state.waRefPage);
      return;
    }
    dialogError(h, e);
  });
}

// ---- Wallet entries tab (BVTGC-140, the endpoint of BVTGC-151) ----

export function loadEntries(h: ConsoleHost, page: number) {
  const s = h.state;
  const latest = h.ticket('waEntries');
  h.setState({waEntLoading: true});
  h.api.get<Paged<WalletEntryRow>>('/admin/wallet/entries/', {kind: s.waEntKind, status: s.waEntStatus, from: s.waEntFrom, to: s.waEntTo, page, page_size: PAGE_SIZE})
    .then((d) => latest() && h.setState({waEntries: d.results || [], waEntCount: d.count || 0, waEntPage: page, waEntPages: pageCount(d.count), waEntLoading: false}))
    .catch((e: unknown) => {
      if (!latest()) return;
      h.setState({waEntLoading: false, waEntries: [], waEntCount: 0});
      h.fail(e);
    });
}

/** The tab's CSV (BVTGC-140): the same filters as the list on screen; masked emails and the last 4 digits only. */
function exportWallet(h: ConsoleHost, type: 'referrals' | 'entries') {
  const s = h.state;
  if (s.exporting) return;
  const stamp = new Date().toISOString().slice(0, 10);
  const query = type === 'referrals'
    ? {type, format: 'csv', status: s.waRefStatus, q: s.waRefQ.trim()}
    : {type, format: 'csv', kind: s.waEntKind, status: s.waEntStatus, from: s.waEntFrom, to: s.waEntTo};
  h.setState({exporting: 'wallet-' + type});
  h.api.download('/admin/wallet/export/', query, 'grama-wallet-' + type + '-' + stamp + '.csv')
    .then(() => h.toast('Exported'))
    .catch((e: unknown) => h.fail(e))
    .finally(() => h.setState({exporting: null}));
}

// ---- Adjust points (BVTGC-140): the reason shows in the citizen's wallet ----

function adjustPoints(h: ConsoleHost, d: WalletDialog) {
  const a = d.account, n = parsePoints(d.points);
  if (!a || n === null) return;
  const points = d.sign === '-' ? -n : n;
  patchDialog(h, {busy: true, err: {}});
  h.api.post<WalletSummary>('/admin/wallets/' + a.id + '/adjust/', {points, reason: d.reason.trim()}).then((sum) => {
    const row = {...a, confirmed_points: sum.confirmed_points, held_points: sum.held_points};
    putAccount(h, row);
    h.setState({waDlg: null, waBalance: sum});
    h.toast((points > 0 ? 'Added ' : 'Took away ') + Math.abs(points) + (Math.abs(points) === 1 ? ' point' : ' points'));
    loadHistory(h, a.id);
  }).catch((e: unknown) => {
    // Below zero (409 not_enough_points): the server's words under the points, with what is there now.
    if (e instanceof ApiError && e.code === 'not_enough_points') {
      patchDialog(h, {busy: false, err: {points: e.message}});
      return;
    }
    dialogError(h, e);
  });
}

export function loadAccounts(h: ConsoleHost, page: number) {
  const s = h.state;
  const latest = h.ticket('waAccounts');
  h.setState({waLoading: true});
  h.api.get<Paged<CitizenAccountRow>>(ACCOUNTS, {q: s.waQ.trim(), status: s.waStatus, village_id: s.waVillage, page, page_size: PAGE_SIZE})
    .then((d) => latest() && h.setState({waAccounts: d.results || [], waCount: d.count || 0, waPage: page, waPages: pageCount(d.count), waLoading: false}))
    .catch((e: unknown) => {
      if (!latest()) return;
      h.setState({waLoading: false, waAccounts: [], waCount: 0});
      h.fail(e);
    });
}

// The wallet runs as a pilot in a few mandals (D13): their villages make the Accounts tab's village filter, loaded
// once each. Quiet when Settings cannot be read: the filter just does not show.
function loadPilot(h: ConsoleHost) {
  if (!h.can('posts.manage_settings')) return;
  h.api.get<Settings>('/admin/settings/').then((st) => {
    const pilot = st.wallet_pilot_mandals || [];
    h.setState({waPilot: pilot});
    for (const m of pilot) void h.loadVillages(m);
  }).catch((e: unknown) => {
    if (sessionEnded(e)) h.fail(e);
  });
}

/** The account panel: the row as listed, and its wallet history (newest first). */
export function openAccount(h: ConsoleHost, a: CitizenAccountRow) {
  h.setState({waOpen: a, waHistory: [], waHistoryCount: 0, waBalance: null, waHistoryLoading: h.can('wallet.view_wallets')});
  loadHistory(h, a.id);
}

export function loadHistory(h: ConsoleHost, id: string) {
  if (!h.can('wallet.view_wallets')) return;
  const latest = h.ticket('waHistory');
  h.api.get<Paged<WalletEntryRow> & WalletSummary>('/admin/wallets/' + id + '/', {page_size: PAGE_SIZE})
    .then((d) => latest() && h.setState({waHistory: d.results || [], waHistoryCount: d.count || 0, waBalance: {confirmed_points: d.confirmed_points, held_points: d.held_points, next_release_at: d.next_release_at}, waHistoryLoading: false}))
    .catch((e: unknown) => {
      if (!latest()) return;
      h.setState({waHistoryLoading: false});
      h.fail(e);
    });
}

/** An action answered with the account's row: put it in the list and the open panel. */
export function putAccount(h: ConsoleHost, row: CitizenAccountRow) {
  h.setState((s) => ({waAccounts: s.waAccounts.map((a) => (a.id === row.id ? row : a)), waOpen: s.waOpen && s.waOpen.id === row.id ? row : s.waOpen}));
}

// ---- the dialogs: help after a call-back, block, unblock, delete, find ----

const BLANK: Omit<WalletDialog, "kind"> = {email: '', reason: '', called: false, points: '', sign: '+', find: '', found: null, busy: false, err: {}};

export function openDialog(h: ConsoleHost, kind: WalletDialogKind, extra: Partial<WalletDialog> = {}) {
  h.setState({waDlg: {...BLANK, kind, ...extra}});
}

export function patchDialog(h: ConsoleHost, x: Partial<WalletDialog>) {
  h.setState((s) => (s.waDlg ? {waDlg: {...s.waDlg, ...x}} : null));
}

/** A refused action: the server's words under each field it names (and its message on top); anything else, such as
 *  an ended session or a server error, goes to the console's own handler. */
export function dialogError(h: ConsoleHost, e: unknown) {
  if (e instanceof ApiError && (e.status === 400 || e.status === 409 || e.status === 404)) {
    const err: Record<string, string> = {};
    for (const [k, v] of Object.entries(e.body.fields || {})) err[k] = Array.isArray(v) ? String(v[0] ?? '') : String(v);
    err.form = e.message;
    patchDialog(h, {busy: false, err});
    return;
  }
  patchDialog(h, {busy: false});
  h.fail(e);
}

/** What each account dialog sends, and the toast once done. */
function accountCall(h: ConsoleHost, d: WalletDialog): [Promise<CitizenAccountRow>, string] | null {
  const a = d.account;
  if (!a) return null;
  const url = ACCOUNTS + a.id + '/', reason = d.reason.trim();
  switch (d.kind) {
    case 'email': return [h.api.post<CitizenAccountRow>(url + 'email/', {email: d.email.trim(), reason, called_back: d.called}), 'New email set · the citizen now uses Forgot password'];
    case 'mobile': return [h.api.post<CitizenAccountRow>(url + 'release-mobile/', {reason, called_back: d.called}), 'Mobile number removed from the account'];
    case 'block': return [h.api.post<CitizenAccountRow>(url + 'block/', {reason}), 'Account blocked · every session ended'];
    case 'unblock': return [h.api.post<CitizenAccountRow>(url + 'unblock/', {reason}), 'Account unblocked'];
    case 'delete': return [h.api.post<CitizenAccountRow>(url + 'delete/', {reason}), 'Account deleted'];
    default: return null;
  }
}

function findAccount(h: ConsoleHost) {
  const d = h.state.waDlg;
  const body = d ? findBody(d.find) : null;
  if (!d || !body || d.busy) return;
  patchDialog(h, {busy: true, err: {}, found: null});
  h.api.post<{results: CitizenAccountRow[]}>(ACCOUNTS + 'find/', body)
    .then((r) => patchDialog(h, {busy: false, found: r.results || []}))
    .catch((e: unknown) => dialogError(h, e));
}

/** The dialog's button. */
export function submitDialog(h: ConsoleHost) {
  const d = h.state.waDlg;
  if (!d || d.busy || !dialogReady(d)) return;
  if (d.kind === 'find') {
    findAccount(h);
    return;
  }
  if (d.kind === 'adjust') {
    adjustPoints(h, d);
    return;
  }
  if (d.kind === 'confirm' || d.kind === 'reject') {
    decideReferral(h, d);
    return;
  }
  const call = accountCall(h, d);
  if (!call) return;
  patchDialog(h, {busy: true, err: {}});
  call[0].then((row) => {
    putAccount(h, row);
    h.setState({waDlg: null});
    h.toast(call[1], d.kind === 'delete' || d.kind === 'block' ? '#E9791E' : undefined);
  }).catch((e: unknown) => dialogError(h, e));
}

/** Whether the button may be pressed: the call-back tick and a reason where the server needs them. */
export function dialogReady(d: WalletDialog): boolean {
  const reason = !!d.reason.trim();
  switch (d.kind) {
    case 'email': return d.called && !!d.email.trim() && reason;
    case 'mobile': return d.called && reason;
    case 'find': return !!d.find.trim();
    case 'adjust': return parsePoints(d.points) !== null && reason;
    default: return reason;
  }
}

// The words of each dialog. The citizen's own name is shown, never their number or email in full.
function dialogText(d: WalletDialog): {title: string; warn: string; info: string; reasonLabel: string; confirm: string; bg: string} {
  const name = d.account?.name || '';
  const last4 = d.account?.mobile_last4 ? '••••' + d.account.mobile_last4 : 'the number the caller gives';
  const audit = 'Reason (saved in the audit log)';
  switch (d.kind) {
    case 'email': return {title: 'Set a new email for ' + name, info: '', reasonLabel: audit, confirm: 'Set new email', bg: NAVY,
      warn: 'Only after you have called the account’s mobile number back (' + last4 + ') and spoken to the citizen. The citizen then uses “Forgot password” to set a password; the code to the new email confirms it. The old address gets a notice.'};
    case 'mobile': return {title: 'Remove the mobile number of ' + name, info: '', reasonLabel: audit, confirm: 'Remove number', bg: NAVY,
      warn: 'Only after you have called back the person who now owns ' + last4 + ' and checked the number is theirs. The account keeps its points and must add a new number at its next visit; the number is free for another account.'};
    case 'block': return {title: 'Block ' + name + '?', warn: '', reasonLabel: audit, confirm: 'Block', bg: RED,
      info: 'Every session of this account ends at once and its phones stop getting wallet notifications. Points and referrals stay. You can unblock it later.'};
    case 'unblock': return {title: 'Unblock ' + name + '?', warn: '', reasonLabel: audit, confirm: 'Unblock', bg: GREEN, info: 'The citizen can log in again with their password.'};
    case 'delete': return {title: 'Delete the account of ' + name + '?', info: '', reasonLabel: 'Reason, for example fraud or a legal request (saved in the audit log)', confirm: 'Delete account', bg: RED,
      warn: 'The account closes at once. The name, email and mobile number are removed and points on hold are cancelled. Confirmed points and referrals stay in the records without the person’s details. This cannot be undone.'};
    case 'find': return {title: 'Find a citizen’s account', warn: '', reasonLabel: '', confirm: 'Find', bg: NAVY, info: 'Type the full mobile number or email the caller gives. Only an exact match is shown.'};
    case 'adjust': {
      const n = parsePoints(d.points);
      const sign = d.sign === '-' ? 'Take away ' : 'Add ';
      return {title: 'Adjust points for ' + name, reasonLabel: 'Reason', bg: d.sign === '-' ? RED : GREEN,
        confirm: n === null ? sign.trim() + ' points' : sign + n + (n === 1 ? ' point' : ' points'),
        info: 'Confirmed now: ' + (d.account?.confirmed_points ?? 0) + ' · on hold: ' + (d.account?.held_points ?? 0) + '. Only confirmed points change, at most 100,000 at a time; the balance never goes below zero.',
        warn: 'The citizen sees this reason in their wallet.'};
    }
    case 'confirm':
    case 'reject': {
      const r = d.referral;
      const who = r ? r.referrer.name + ' ••' + r.referrer.mobile_last4 + ' invited ' + r.referee.name + ' ••' + r.referee.mobile_last4 + '.' : '';
      return d.kind === 'confirm'
        ? {title: 'Confirm this referral?', reasonLabel: 'Comment', confirm: 'Confirm', bg: GREEN, warn: '',
          info: who + ' Their points on hold are confirmed now, before the hold ends.'}
        : {title: 'Reject this referral?', reasonLabel: 'Comment', confirm: 'Reject', bg: RED,
          info: who + ' Their points on hold are cancelled.',
          warn: 'Both citizens see this comment in their wallet. Write it for them, without anyone’s number or email.'};
    }
    default: return {title: '', warn: '', info: '', reasonLabel: audit, confirm: 'Save', bg: NAVY};
  }
}

/** The dialog's renderVals() values (panels/WalletDialog.tsx). The same keys whether a dialog is open or not. */
export function walletDialogView(h: ConsoleHost) {
  const d = h.state.waDlg;
  const txt = d ? dialogText(d) : null;
  const ready = !!d && dialogReady(d) && !d.busy;
  const err: Record<string, string> = d ? d.err : {};
  const fieldErr = Object.keys(err).some((k) => k !== 'form');
  return {
    wdShow: !!d,
    wd: orEmpty(d && txt ? {...txt, kind: d.kind, busy: d.busy,
      needsCalled: d.kind === 'email' || d.kind === 'mobile', needsEmail: d.kind === 'email', needsFind: d.kind === 'find', needsReason: d.kind !== 'find',
      needsPoints: d.kind === 'adjust', sign: d.sign, points: d.points,
      called: d.called, email: d.email, reason: d.reason, find: d.find, cannot: !ready, opacity: ready ? 1 : .5,
      errEmail: err.email || '', errReason: err.reason || err.comment || '', errCalled: err.called_back || '', errFind: err.mobile || err.email || '', errPoints: err.points || '',
      errForm: err.form && !fieldErr ? err.form : '', foundNone: !!d.found && !d.found.length} : null),
    wdFound: (d?.found || []).map((a) => ({rowKey: a.id, name: a.name, village: a.village?.name || '—', mobile: a.mobile_missing ? 'No number' : '••' + a.mobile_last4, status: accountTone(a.status).label,
      open: () => {
        h.setState({waDlg: null});
        openAccount(h, a);
      }})),
    closeWd: () => h.setState({waDlg: null}),
    submitWd: () => submitDialog(h),
    onWdEmail: (e: FieldChange) => patchDialog(h, {email: e.target.value}),
    onWdReason: (e: FieldChange) => patchDialog(h, {reason: e.target.value}),
    onWdFind: (e: FieldChange) => patchDialog(h, {find: e.target.value, found: null}),
    onWdFindKey: (e: {key: string}) => {
      if (e.key === 'Enter') findAccount(h);
    },
    toggleWdCalled: () => {
      const cur = h.state.waDlg;
      if (cur) patchDialog(h, {called: !cur.called});
    },
    // Adjust points (BVTGC-140): add or take away, then whole points.
    wdSigns: (['+', '-'] as const).map((sign) => ({label: sign === '+' ? '+ Add' : '− Take away', on: !!d && d.sign === sign, go: () => patchDialog(h, {sign})})),
    onWdPoints: (e: FieldChange) => patchDialog(h, {points: e.target.value.replace(/[^0-9]/g, '').slice(0, 6)}),
  };
}

// ---- the page and the panel ----

const STATUS_OPTS = [{id: '', label: 'All statuses'}, {id: 'active', label: 'Active'}, {id: 'blocked', label: 'Blocked'}, {id: 'deleted', label: 'Deleted'}] as const;

/** The pilot mandals' villages, for the village filter (each mandal's villages load once, when the page opens). */
function villageOptions(h: ConsoleHost) {
  const pilot = h.state.waPilot;
  const out: {id: string; label: string}[] = [];
  for (const d of h.state.geo) for (const m of d.mandals) {
    if (!pilot.includes(m.id)) continue;
    for (const v of m.villages) out.push({id: String(v.id), label: h.nl({name: v.name, te: v.te}) + ' · ' + m.name});
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

const TAB_LABEL: Readonly<Record<Tab, string>> = {accounts: 'Accounts', referrals: 'Referrals', entries: 'Wallet entries'};
const REF_TABS = [{id: 'PENDING', label: 'Pending'}, {id: 'CONFIRMED', label: 'Confirmed'}, {id: 'REJECTED', label: 'Not confirmed'}] as const;
const KIND_OPTS = [{id: '', label: 'All kinds'}, {id: 'REFERRAL_REWARD', label: 'Referral reward'}, {id: 'WELCOME_BONUS', label: 'Welcome bonus'}, {id: 'ADJUSTMENT', label: 'Adjustment'}] as const;
const ENTRY_STATUS_OPTS = [{id: '', label: 'All statuses'}, {id: 'HELD', label: 'On hold'}, {id: 'CONFIRMED', label: 'Confirmed'}, {id: 'CANCELLED', label: 'Cancelled'}] as const;

/** The Referrals and Wallet entries tabs' renderVals() values. */
function referralsAndEntries(h: ConsoleHost) {
  const s = h.state;
  const canDecide = h.can('wallet.review_referrals');
  return {
    waIsReferrals: s.waTab === 'referrals',
    waRefTabs: REF_TABS.map((t) => ({label: t.label, count: s.waRefCounts[t.id], on: s.waRefStatus === t.id, go: () => h.setState({waRefStatus: t.id}, () => loadReferrals(h, 1))})),
    waRefQ: s.waRefQ,
    onWaRefQ: (e: FieldChange) => {
      h.setState({waRefQ: e.target.value});
      h.later('waRefs', () => loadReferrals(h, 1), 300);
    },
    waRefRows: s.waRefs.map((r) => {
      const tone = referralTone(r.status), why = reasonWords(r.reason_key);
      const can = (x: string) => canDecide && (r.allowed_actions || []).includes(x);
      return {rowKey: r.id, referrer: r.referrer.name, referrerLast4: r.referrer.mobile_last4 ? '••' + r.referrer.mobile_last4 : 'No number', referrerCode: r.referrer.referral_code,
        referee: r.referee.name, refereeLast4: r.referee.mobile_last4 ? '••' + r.referee.mobile_last4 : 'No number',
        joined: h.fmt(r.pending_at, false), decideAfter: h.fmt(r.confirm_after, false),
        statusLabel: tone.label + (r.status === 'REJECTED' && why ? ': ' + why : ''), sbg: tone.bg, scolor: tone.color,
        decidedBy: r.decided_at ? (r.decided_by ? 'by ' + r.decided_by.name : 'by the hourly job') + ' · ' + h.fmt(r.decided_at, false) : '',
        comment: r.comment || '',
        canConfirm: can('confirm'), canReject: can('reject'),
        confirm: () => openDialog(h, 'confirm', {referral: r}), reject: () => openDialog(h, 'reject', {referral: r})};
    }),
    waRefEmpty: !s.waRefs.length,
    waRefEmptyText: s.waRefLoading ? 'Loading…' : s.waRefQ.trim() ? 'No referrals match “' + s.waRefQ.trim() + '”' : s.waRefStatus === 'PENDING' ? 'No referrals waiting' : 'No referrals here yet',
    waRefEmptyHint: s.waRefLoading || s.waRefQ.trim() ? '' : 'Waiting referrals are decided by the hourly job when their hold ends. You may confirm or reject one earlier, with a comment.',
    waRefPager: pager(s.waRefPage, s.waRefPages, (p) => loadReferrals(h, p)),
    exportRefs: () => exportWallet(h, 'referrals'), exportingRefs: s.exporting === 'wallet-referrals',
    waIsEntries: s.waTab === 'entries',
    waEntKind: s.waEntKind, waKindOpts: KIND_OPTS, onWaEntKind: (e: FieldChange) => h.setState({waEntKind: e.target.value}, () => loadEntries(h, 1)),
    waEntStatus: s.waEntStatus, waEntStatusOpts: ENTRY_STATUS_OPTS, onWaEntStatus: (e: FieldChange) => h.setState({waEntStatus: e.target.value}, () => loadEntries(h, 1)),
    waEntFrom: s.waEntFrom, onWaEntFrom: (e: FieldChange) => h.setState({waEntFrom: e.target.value}, () => loadEntries(h, 1)),
    waEntTo: s.waEntTo, onWaEntTo: (e: FieldChange) => h.setState({waEntTo: e.target.value}, () => loadEntries(h, 1)),
    waEntRows: s.waEntries.map((e) => {
      const tone = entryTone(e.status);
      return {rowKey: e.id, when: h.fmt(e.created_at, false), citizen: e.citizen ? e.citizen.name : '—', last4: e.citizen?.mobile_last4 ? '••' + e.citizen.mobile_last4 : '',
        kind: entryKind(e.kind), points: signed(e.points), pointsColor: e.status === 'CANCELLED' ? '#9aa6b2' : e.points < 0 ? RED : '#0A2550',
        statusLabel: tone.label, sbg: tone.bg, scolor: tone.color, reason: e.reason || reasonWords(e.reason_key), by: e.kind === 'ADJUSTMENT' && e.created_by ? e.created_by.name : ''};
    }),
    waEntEmpty: !s.waEntries.length,
    waEntEmptyText: s.waEntLoading ? 'Loading…' : s.waEntKind || s.waEntStatus || s.waEntFrom || s.waEntTo ? 'No entries with these filters' : 'No wallet entries yet',
    waEntPager: pager(s.waEntPage, s.waEntPages, (p) => loadEntries(h, p)),
    exportEntries: () => exportWallet(h, 'entries'), exportingEntries: s.exporting === 'wallet-entries',
  };
}

/** The page's renderVals() values (screens/CitizensWallet.tsx). */
export function walletView(h: ConsoleHost) {
  const s = h.state;
  const canAccounts = h.can('accounts.manage_citizen_accounts');
  const villages = villageOptions(h);
  const open = tabs(h);
  return {
    ...referralsAndEntries(h),
    waTabs: open.map((t) => ({label: TAB_LABEL[t], count: t === 'referrals' ? s.waRefCounts.PENDING : undefined, on: s.waTab === t,
      go: () => h.setState({waTab: t, waOpen: null}, () => {
        loadTab(h, t);
        if (t === 'accounts' && !s.waPilot.length) loadPilot(h);
      })})),
    waCanAccounts: canAccounts,
    waIsAccounts: s.waTab === 'accounts' && canAccounts,
    waQ: s.waQ,
    onWaQ: (e: FieldChange) => {
      h.setState({waQ: e.target.value});
      h.later('waAccounts', () => loadAccounts(h, 1), 300);
    },
    waStatus: s.waStatus, waStatusOpts: STATUS_OPTS,
    onWaStatus: (e: FieldChange) => h.setState({waStatus: e.target.value}, () => loadAccounts(h, 1)),
    waShowVillage: villages.length > 0, waVillage: s.waVillage, waVillageOpts: [{id: '', label: 'All villages'}, ...villages],
    onWaVillage: (e: FieldChange) => h.setState({waVillage: e.target.value}, () => loadAccounts(h, 1)),
    waPilotNote: s.waPilot.length ? 'Pilot: ' + s.waPilot.length + (s.waPilot.length === 1 ? ' mandal' : ' mandals') : '',
    openFind: () => openDialog(h, 'find'),
    waRows: s.waAccounts.map((a) => {
      const tone = accountTone(a.status);
      return {rowKey: a.id, name: a.name, village: a.village?.name || '—', mobile: a.status === 'deleted' ? '—' : a.mobile_missing ? '' : '••' + a.mobile_last4, noNumber: a.status !== 'deleted' && a.mobile_missing,
        email: a.email_hint || '—', points: a.status === 'deleted' ? '—' : String(a.confirmed_points), held: a.held_points > 0 ? '+' + a.held_points : '',
        statusLabel: tone.label, sbg: tone.bg, scolor: tone.color, on: !!s.waOpen && s.waOpen.id === a.id, open: () => openAccount(h, a)};
    }),
    waEmpty: !s.waAccounts.length,
    waEmptyText: s.waLoading ? 'Loading…' : s.waQ.trim() ? 'No accounts match “' + s.waQ.trim() + '”' : s.waStatus || s.waVillage ? 'No accounts with these filters' : 'No wallet accounts yet',
    waEmptyHint: s.waLoading || s.waQ.trim() ? '' : 'Citizens who open a wallet account in the app are listed here. Use “Find by mobile or email” for a caller.',
    waPager: pager(s.waPage, s.waPages, (p) => loadAccounts(h, p)),
  };
}

/** The account panel's renderVals() values (panels/CitizenAccountPanel.tsx). The same keys whether it is open or not. */
export function walletPanelView(h: ConsoleHost) {
  const s = h.state, a = s.waOpen;
  const act = (label: string, kind: WalletDialogKind, style: 'sec' | 'red' | 'green') => ({label,
    bg: style === 'sec' ? '#fff' : style === 'red' ? RED : GREEN, color: style === 'sec' ? NAVY : '#fff', border: style === 'sec' ? '1px solid #cfd8e3' : '0',
    go: () => {
      if (a) openDialog(h, kind, {account: a});
    }});
  const allowed = new Set(a ? a.allowed_actions || [] : []);
  const acts = [
    ...(allowed.has('adjust') && h.can('wallet.adjust_points') ? [act('Adjust points', 'adjust', 'green')] : []),
    ...(allowed.has('set_email') ? [act('Set new email', 'email', 'sec')] : []),
    ...(allowed.has('release_mobile') ? [act('Remove mobile number', 'mobile', 'sec')] : []),
    ...(allowed.has('block') ? [act('Block', 'block', 'red')] : []),
    ...(allowed.has('unblock') ? [act('Unblock', 'unblock', 'green')] : []),
    ...(allowed.has('delete') ? [act('Delete', 'delete', 'red')] : []),
  ];
  const bal = s.waBalance;
  const tone = accountTone(a ? a.status : 'active');
  return {
    waShow: !!a,
    closeWa: () => h.setState({waOpen: null, waDlg: null}),
    wa: orEmpty(a ? {name: a.name, statusLabel: tone.label, sbg: tone.bg, scolor: tone.color, deleted: a.status === 'deleted',
      confirmed: String(bal ? bal.confirmed_points : a.confirmed_points), held: String(bal ? bal.held_points : a.held_points),
      releaseNote: bal?.next_release_at ? 'Next points decided ' + h.fmt(bal.next_release_at, false) : '',
      village: a.village?.name || '—', contact: contactLine(a.email_hint, a.mobile_last4, a.mobile_missing),
      mobile: a.status === 'deleted' ? '—' : a.mobile_missing ? 'No number: the citizen adds one at their next visit' : '••••' + a.mobile_last4,
      mobileVerified: a.mobile_verified ? 'confirmed' : 'not confirmed yet', mobileOk: a.mobile_verified, email: a.email_hint || '—', emailVerified: a.email_verified ? 'confirmed' : 'not confirmed yet', emailOk: a.email_verified,
      code: a.referral_code, joined: h.fmt(a.created_at, true), lastActive: h.fmtLast(a.last_active_at), deletedOn: a.deleted_at ? h.fmt(a.deleted_at, true) : ''} : null),
    waActs: acts,
    waCanHistory: h.can('wallet.view_wallets'),
    waHist: s.waHistory.map((e) => {
      const et = entryTone(e.status);
      const who = e.kind === 'ADJUSTMENT' && e.created_by ? ' · by ' + e.created_by.name : '';
      return {rowKey: e.id, label: entryKind(e.kind) + who, sub: [et.label, h.fmt(e.created_at, false), e.reason || ''].filter(Boolean).join(' · '),
        points: signed(e.points), color: e.status === 'CANCELLED' ? '#9aa6b2' : e.status === 'HELD' ? '#b35a0e' : e.points < 0 ? RED : GREEN};
    }),
    waHistEmpty: !s.waHistory.length,
    waHistText: s.waHistoryLoading ? 'Loading…' : 'No points yet',
    waHistMore: s.waHistoryCount > s.waHistory.length ? 'The newest ' + s.waHistory.length + ' of ' + s.waHistoryCount + ' entries. Every entry is in Export CSV (Wallet entries).' : '',
  };
}
