// Citizens & wallet page (sidebar "Citizens & wallet", BVTGC-139/140): citizens' wallet accounts and the Super Admin's
// help (BackEnd docs/features/citizen-wallet/, requirements D11, D16, FR-9, FR-16, FR-33; mockup console.html).
// Calls (BackEnd docs/api-contract.md, section 21, the Super Admin table; .claude/api.md):
//   GET  /admin/citizen-accounts/?q=&status=&village_id=&page=&page_size=20
//   POST /admin/citizen-accounts/find/ {mobile} or {email}  (a POST, so the number never goes in a URL)
//   POST /admin/citizen-accounts/{id}/email/ {email, reason, called_back}, /release-mobile/ {reason, called_back},
//        /block/, /unblock/, /delete/ {reason}  → the account's row
//   GET  /admin/wallets/{id}/?page_size=20  (the account panel's history)
//   GET  /admin/settings/  (the pilot mandals, for the village filter)
// Nothing here shows a full email or number: the server sends the last 4 digits and a masked email only.
import { ApiError } from "../api";
import type { CitizenAccountRow, Paged, Settings, WalletEntryRow, WalletSummary } from "../types";
import { orEmpty, pageCount, pager, PAGE_SIZE, sessionEnded, type FieldChange, type WalletDialog, type WalletDialogKind } from "../model";
import { accountTone, contactLine, entryKind, entryTone, findBody, signed } from "../walletText";
import type { ConsoleHost } from "./host";

const ACCOUNTS = '/admin/citizen-accounts/';
const NAVY = '#0D3B7A', RED = '#b3261e', GREEN = '#1F8A3B';

/** The page opens: the accounts, and the pilot mandals for the village filter. */
export function loadWallet(h: ConsoleHost) {
  if (h.can('accounts.manage_citizen_accounts')) {
    loadAccounts(h, 1);
    loadPilot(h);
  }
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

/** The page's renderVals() values (screens/CitizensWallet.tsx, the Accounts tab). */
export function walletView(h: ConsoleHost) {
  const s = h.state;
  const canAccounts = h.can('accounts.manage_citizen_accounts');
  const villages = villageOptions(h);
  return {
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
