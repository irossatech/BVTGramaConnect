// Users page (sidebar "Users"): the officials' list with filters, Add User and Edit user (the drawer, with its area
// steps and Generate), and what can be done to a user: block/unblock, reassign, add and remove a role, reset password
// and unlock. Moved out of Console.tsx unchanged (audit WEB-ARCH-001). The user side panel (and its recent posts) is
// still built in Console.tsx, which calls the actions exported here. Calls /users/ (.claude/api.md).
import type React from "react";
import type { Area, AreaLevel, Paged, Post, RoleAssignment, TemporaryPassword, User, UserResponse } from "../types";
import { EMPTY_NU, LEVEL_OF_ROLE, pageCount, pager, PAGE_SIZE, RK, ROLE, type AdminUser, type BulkAction, type FieldChange, type NewUserForm, type Option } from "../model";
import { mobileDigits } from "../mask";
import type { ConsoleHost } from "./host";
import { adaptPost, postRow } from "./posts";

// Role key (super, district…) to the API's group key (SUPER_ADMIN…).
const RAPI: Readonly<Partial<Record<string, string>>> = {super:'SUPER_ADMIN',district:'DISTRICT_ADMIN',mandal:'MANDAL_ADMIN',village:'VILLAGE_ADMIN',panchayat:'PANCHAYAT_MEMBER'};
// The permission needed to create or manage each role (BackEnd apps/accounts/role_matrix.py).
const MANAGE: Readonly<Partial<Record<string, string>>> = {super:'accounts.manage_super_admin',district:'accounts.manage_district_admin',mandal:'accounts.manage_mandal_admin',village:'accounts.manage_village_admin',panchayat:'accounts.manage_panchayat_member'};

function pathParts(area: Area | null | undefined) {
  const parts = area && area.path ? area.path.split(' · ') : [];
  const lv = area && area.level;
  const r: {district: string | null; mandal: string | null; village: string | null} = {district: null, mandal: null, village: null};
  if (lv === 'VILLAGE') {
    r.village = parts[0];
    r.mandal = parts[1];
    r.district = parts[2];
  } else if (lv === 'MANDAL') {
    r.mandal = parts[0];
    r.district = parts[1];
  } else if (lv === 'DISTRICT') {
    r.district = parts[0];
  }
  return r;
}

function adaptUser(h: ConsoleHost, u: User): AdminUser {
  const ras = (u.role_assignments || []).filter((r) => r.is_active !== false);
  const ra = ras[0] || null;
  const role = ra ? (RK[ra.role] || 'panchayat') : 'panchayat';
  const parts = pathParts(ra && ra.area);
  // A list row asked with contact=0 has no mobile or email keys, only the masked values (BVTGC-75); a server
  // without that change still sends the full ones, so the masked values are made from them then.
  const full = 'mobile' in u || 'email' in u;
  return {
    id: u.id, name: u.name, te: u.name_te || u.name, nameTe: u.name_te || '', mobile: u.mobile || '', email: u.email || '',
    mobileLast4: u.mobile_last4 ?? mobileDigits(u.mobile).slice(-4), emailMasked: u.email_masked ?? '', full, username: u.username || '', role,
    district: parts.district, mandal: parts.mandal, village: parts.village, area: ra ? ra.area : null, raId: ra ? ra.id : null, ras,
    active: u.is_active !== undefined ? !!u.is_active : u.status === 'ACTIVE', locked: !!u.locked_out,
    allowed: Array.isArray(u.allowed_actions) ? u.allowed_actions : null, last: h.fmtLast(u.last_login_at),
    noRole: !ras.length, mustChange: !!u.must_change_password, added: u.created_at ? h.fmt(u.created_at, true) : '',
    addedBy: (u.created_by && u.created_by.name) || '', lang: u.preferred_language || '',
  };
}

export function loadUsers(h: ConsoleHost, page: number) {
  const uf = h.state.uf;
  const latest = h.ticket('users');
  h.setState({usersLoading: true});
  h.api.get<Paged<User> & {counts?: {active: number; blocked: number}}>('/users/', {role: uf.role ? RAPI[uf.role] : '', district: uf.district, status: uf.status ? uf.status.toUpperCase() : '', q: uf.q, contact: '0', page, page_size: PAGE_SIZE})
    .then((d) => latest() && h.setState({users: d.results.map((u) => adaptUser(h, u)), userCount: d.count, userCounts: d.counts ? {active: d.counts.active, blocked: d.counts.blocked} : null, userPage: page, userPages: pageCount(d.count), usersLoading: false}))
    .catch((e: unknown) => {
      if (!latest()) return;
      h.setState({usersLoading: false});
      h.fail(e);
    });
}

// The server lists what this admin may do to the user (allowed_actions); no list means no buttons.
export function userCan(u: AdminUser, a: string) {
  return !!u.allowed && u.allowed.includes(a);
}

export function roleChoices(h: ConsoleHost): Option[] {
  return ['super', 'district', 'mandal', 'village', 'panchayat'].filter((k) => h.can(MANAGE[k] || '')).map((k) => ({id: k, label: ROLE[k].label}));
}

function showSecret(h: ConsoleHost, name: string, secret: string) {
  h.ask({title: 'Temporary password · ' + name, body: 'Shown only this once. Give it to ' + name + ' in person. They choose their own password when they first log in.', secret, confirmLabel: 'Done', noCancel: true, bg: '#0D3B7A', onConfirm: () => {}});
}

// Add User area picker, same as the mobile app: district -> mandal -> village, each list only inside the step above.
function areaSteps(h: ConsoleHost, f: NewUserForm) {
  const g = h.state.geo.filter((d) => d.active);
  const lv = LEVEL_OF_ROLE[f.role];
  if (lv === 'STATE') return []; // Super Admin: the whole state, nothing to pick
  const d = g.find((x) => String(x.id) === String(f.nuD));
  const m = d && d.mandals.find((x) => String(x.id) === String(f.nuM));
  const steps: {key: 'nuD' | 'nuM' | 'area'; label: string; ph: string; value: string; options: Option[]}[] = [{key: 'nuD', label: 'District', ph: 'Choose a district', value: f.nuD || '', options: g.map((x) => ({id: String(x.id), label: h.nl(x)}))}];
  if (lv !== 'DISTRICT' && d) steps.push({key: 'nuM', label: 'Mandal', ph: 'Choose a mandal', value: f.nuM || '', options: d.mandals.filter((x) => x.active).map((x) => ({id: String(x.id), label: h.nl(x)}))});
  if (lv === 'VILLAGE' && m) steps.push({key: 'area', label: 'Village', ph: 'Choose a village', value: f.area || '', options: m.villages.filter((x) => x.active).map((x) => ({id: String(x.id), label: h.nl(x)}))});
  return steps;
}

function areaPick(h: ConsoleHost, prev: NewUserForm, name: 'role' | 'nuD' | 'nuM', value: string) {
  const n = {...prev, [name]: value};
  const lv = LEVEL_OF_ROLE[n.role];
  if (name === 'role') {
    n.nuD = '';
    n.nuM = '';
    n.area = lv === 'STATE' && h.state.stateRow ? String(h.state.stateRow.id) : '';
  }
  if (name === 'nuD') {
    n.nuM = '';
    n.area = lv === 'DISTRICT' ? value : '';
  }
  if (name === 'nuM') {
    n.area = lv === 'MANDAL' ? value : '';
  }
  return n;
}

function areaSummary(h: ConsoleHost, f: NewUserForm) {
  if (!f.area) return '';
  const lv = LEVEL_OF_ROLE[f.role];
  if (lv === 'STATE') return (h.state.stateRow ? h.state.stateRow.name_en : 'The state') + ' (whole state)';
  const d = h.state.geo.find((x) => String(x.id) === String(f.nuD));
  const m = d && d.mandals.find((x) => String(x.id) === String(f.nuM));
  const v = m && m.villages.find((x) => String(x.id) === String(f.area));
  return [lv === 'VILLAGE' && v ? v.name : null, lv !== 'DISTRICT' && m ? m.name : null, d ? d.name : null].filter(Boolean).join(' · ');
}

export function toggleUser(h: ConsoleHost, u: AdminUser) {
  const R = ROLE;
  h.ask({title: u.active ? 'Block user' : 'Unblock user', body: (u.active ? 'Block ' : 'Unblock ') + u.name + ' (' + R[u.role].label + ', ' + (u.area ? u.area.name : '—') + ')? ' + (u.active ? 'They will be signed out and cannot post or review.' : 'They regain access immediately.'), confirmLabel: u.active ? 'Block' : 'Unblock', bg: u.active ? '#b3261e' : '#1F8A3B',
    onConfirm: () => h.api.post<UserResponse>('/users/' + u.id + '/' + (u.active ? 'block' : 'unblock') + '/', {}).then((d) => {
      const nu = adaptUser(h, d && d.user ? d.user : d);
      h.setState((s) => ({users: s.users.map((x) => x.id === u.id ? nu : x), panelUser: s.panelUser && s.panelUser.id === u.id ? nu : s.panelUser}));
      h.toast(u.name + (u.active ? ' blocked' : ' unblocked'), u.active ? '#E9791E' : '#6cc04a');
    }).catch((e: unknown) => h.fail(e))});
}

// Block or unblock the ticked users at once (owner, 2026-11-20): one request each, with progress; the ones the
// server refuses (a higher role, yourself) are counted with its reason.
function bulkBlock(h: ConsoleHost, list: AdminUser[], block: boolean) {
  if (!list.length || h.state.bulk) return;
  const n = list.length, what = n + (n === 1 ? ' user' : ' users');
  h.ask({title: (block ? 'Block ' : 'Unblock ') + what, body: block ? 'They are signed out at once and cannot post or review until unblocked.' : 'They can sign in again straight away.', confirmLabel: (block ? 'Block ' : 'Unblock ') + n, bg: block ? '#b3261e' : '#1d7a33',
    onConfirm: () => { void (async () => {
      let ok = 0, why = '';
      for (let i = 0; i < n; i++) {
        h.setState({bulk: (block ? 'Blocking ' : 'Unblocking ') + (i + 1) + ' of ' + n + '…'});
        try {
          await h.api.post('/users/' + list[i].id + '/' + (block ? 'block' : 'unblock') + '/', {});
          ok++;
        } catch (e) {
          why = why || (e instanceof Error && e.message) || 'the server did not answer';
        }
      }
      const done = list.map((u) => u.id);
      h.setState({bulk: '', userSel: h.state.userSel.filter((id) => !done.includes(id as string))});
      loadUsers(h, h.state.userPage);
      const msg = ok + (block ? ' blocked' : ' unblocked');
      if (why) h.ask({title: msg, body: (n - ok) + ' failed: ' + why + '.', confirmLabel: 'Close', bg: '#3b4a5c', noCancel: true, onConfirm: () => {}});
      else h.toast(msg, block ? '#E9791E' : '#6cc04a');
    })(); }});
}

// A village role's dialog lists every village: load them all first (once), then open it.
function withAllVillagesFor(h: ConsoleHost, role: string, open: () => void) {
  if (LEVEL_OF_ROLE[role] === 'VILLAGE' && !h.state.geoAll) {
    void h.loadAllVillages().then(() => { if (h.state.geoAll) open(); });
    return;
  }
  open();
}

export function reassignUser(h: ConsoleHost, u: AdminUser) {
  if (!u.raId) {
    h.toast('This user has no role to move.', '#E9791E');
    return;
  }
  withAllVillagesFor(h, u.role, () => reassignDialog(h, u));
}

function reassignDialog(h: ConsoleHost, u: AdminUser) {
  const R = ROLE;
  const opts = h.areaOptions(u.role);
  if (!u.raId) return;
  const raId = u.raId;
  h.ask({title: 'Reassign area', body: 'Move ' + u.name + ' (' + R[u.role].label + ') to a different ' + (u.role === 'district' ? 'district' : u.role === 'mandal' ? 'mandal' : 'village') + '. Posts already waiting for their review stay with the old area.', hasSelect: true, selectLabel: 'New area', options: opts, confirmLabel: 'Reassign', bg: '#0D3B7A', onConfirm: (_t, sel) => {
    const o = opts.find((x) => x.id === sel) || opts[0];
    if (!o) return;
    h.api.patch('/users/' + u.id + '/role-assignments/' + raId + '/', {area: {level: o.level, id: Number(o.id)}}).then(() => {
      h.toast(u.name + ' reassigned to ' + o.label.split(' · ')[0]);
      loadUsers(h, h.state.userPage);
      if (h.state.panel && h.state.panel.type === 'user') h.setState({panel: null});
    }).catch((e: unknown) => h.fail(e));
  }});
}

function refreshUser(h: ConsoleHost, id: string) {
  return h.api.get<User>('/users/' + id + '/').then((x) => {
    const u = adaptUser(h, x);
    h.setState((s) => ({panelUser: s.panel && s.panel.id === id ? u : s.panelUser}));
    loadUsers(h, h.state.userPage);
  }).catch((e: unknown) => h.fail(e));
}

export function addRole(h: ConsoleHost, u: AdminUser) {
  const R = ROLE;
  const roles = roleChoices(h);
  if (!roles.length) {
    h.toast('You cannot add roles.', '#E9791E');
    return;
  }
  h.ask({title: 'Add role', body: 'Give ' + u.name + ' another role. They choose which role to use after login.', hasSelect: true, selectLabel: 'Role', options: roles, confirmLabel: 'Next', bg: '#0D3B7A', onConfirm: (_t, role) => withAllVillagesFor(h, role, () => {
    const opts = h.areaOptions(role);
    if (!opts.length) {
      h.toast('Add areas in Geography first.', '#E9791E');
      return;
    }
    setTimeout(() => h.ask({title: 'Add role · ' + R[role].label, body: 'Choose the area for this role.', hasSelect: true, selectLabel: 'Area', options: opts, confirmLabel: 'Add role', bg: '#0D3B7A', onConfirm: (_t2, areaId) => {
      const o = opts.find((x) => x.id === areaId) || opts[0];
      const send = (currentPassword?: string) => h.api.post('/users/' + u.id + '/role-assignments/', {role: RAPI[role], area: {level: o.level, id: Number(o.id)}, ...(currentPassword ? {current_password: currentPassword} : {})}).then(() => {
        h.toast('Role added · ' + R[role].label + ' · ' + o.label);
        refreshUser(h, u.id);
      }).catch((e: unknown) => h.fail(e));
      if (role !== 'super') {
        send();
        return;
      }
      // Making someone a Super Admin needs the actor's own password, as in Add User (backend check_giving_peer_role).
      setTimeout(() => h.ask({title: 'Make ' + u.name + ' a Super Admin', body: u.name + ' will be able to see and change everything, including other Super Admins. Enter your own password to confirm.', hasInput: true, noGen: true, password: true, inputLabel: 'Your password', inputPh: 'Your password', confirmLabel: 'Add Super Admin', bg: '#b3261e', onConfirm: (t) => {
        if (t) send(t);
      }}), 0);
    }}), 0);
  })});
}

export function removeRole(h: ConsoleHost, u: AdminUser, ra: RoleAssignment) {
  const R = ROLE;
  const label = (R[RK[ra.role]] || {label: ra.role}).label;
  h.ask({title: 'Remove role', body: 'Remove ' + label + ' · ' + (ra.area ? ra.area.name : '') + ' from ' + u.name + '?' + ((u.ras || []).length <= 1 ? ' This is their only role: they will not be able to log in.' : ''), confirmLabel: 'Remove', bg: '#b3261e', onConfirm: () => h.api.del('/users/' + u.id + '/role-assignments/' + ra.id + '/').then(() => {
    h.toast('Role removed', '#E9791E');
    refreshUser(h, u.id);
  }).catch((e: unknown) => h.fail(e))});
}

export function resetPassword(h: ConsoleHost, u: AdminUser) {
  h.ask({title: 'Reset password', body: 'Give ' + u.name + ' a new temporary password. They are signed out everywhere and must choose their own password at their next login.', hasInput: true, inputLabel: 'Temporary password', inputPh: 'Leave empty to generate one', confirmLabel: 'Reset password', bg: '#0D3B7A', onConfirm: (t, _sel, gen) => {
    const pw = (t || '').trim();
    h.api.post<TemporaryPassword | null>('/users/' + u.id + '/reset-password/', pw ? {password: pw} : {}).then((d) => {
      const temp = (d && d.temporary_password) || (pw && pw === gen ? pw : '');
      if (temp) showSecret(h, u.name, temp);
      else h.toast('Password reset · ' + u.name);
      refreshUser(h, u.id);
    }).catch((e: unknown) => h.fail(e));
  }});
}

export function unlockUser(h: ConsoleHost, u: AdminUser) {
  h.ask({title: 'Unlock login', body: u.name + ' is locked out after too many wrong passwords. Unlock now so they can try again?', confirmLabel: 'Unlock', bg: '#1F8A3B', onConfirm: () => h.api.post('/users/' + u.id + '/unlock/', {}).then(() => {
    h.toast(u.name + ' unlocked');
    refreshUser(h, u.id);
  }).catch((e: unknown) => h.fail(e))});
}

function nuValid(f: NewUserForm) {
  return !!(f.name.trim() && f.username.trim() && (!f.email.trim() || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) && (!f.mobile || f.mobile.length === 10));
}

export function editUser(h: ConsoleHost, u: AdminUser) {
  h.setState({drawerOpen: true, nu: {id: u.id, name: u.name, te: u.nameTe, email: u.email, username: u.username, mobile: u.mobile, password: '', role: u.role, area: ''}});
}

function saveUserEdit(h: ConsoleHost, f: NewUserForm) {
  // The username too (owner 2026-11-17): the server trims, lower-cases and collapses spaces, answers 409 when it
  // is taken and audits it only when it really changed (backend contract, PATCH /users/{id}/).
  h.api.patch('/users/' + f.id + '/', {username: f.username.trim(), name: f.name.trim(), name_te: f.te.trim(), email: f.email.trim() || null, mobile: f.mobile || null}).then(() => {
    h.setState({drawerOpen: false, nu: {...EMPTY_NU}});
    h.toast('Details saved · ' + f.name.trim());
    if (f.id) refreshUser(h, f.id);
  }).catch((e: unknown) => h.fail(e));
}

function saveNU(h: ConsoleHost) {
  const f = h.state.nu;
  if (!nuValid(f)) return;
  if (f.id) {
    saveUserEdit(h, f);
    return;
  }
  const opts = h.areaOptions(f.role);
  const o = opts.find((x) => x.id === String(f.area));
  if (!o) {
    h.toast(opts.length ? 'Choose the area.' : 'Add areas in Geography first.', '#E9791E');
    return;
  }
  const body: {username: string; name: string; name_te: string; role?: string; area: {level: AreaLevel; id: number}; email?: string; mobile?: string; password?: string} = {username: f.username.trim(), name: f.name.trim(), name_te: f.te.trim(), role: RAPI[f.role], area: {level: o.level, id: Number(o.id)}};
  if (f.email.trim()) body.email = f.email.trim();
  if (f.mobile) body.mobile = f.mobile;
  const pw = f.password.trim();
  if (pw) body.password = pw;
  const gen = h.nuGen;
  const send = (currentPassword?: string) => h.api.post<TemporaryPassword | null>('/users/', currentPassword ? {...body, current_password: currentPassword} : body).then((d) => {
    h.nuGen = '';
    h.setState({drawerOpen: false, nu: {...EMPTY_NU}});
    const temp = (d && d.temporary_password) || (pw && pw === gen ? pw : '');
    if (temp) showSecret(h, body.name, temp);
    else h.toast('User created · ' + body.username);
    loadUsers(h, 1);
  }).catch((e: unknown) => h.fail(e));
  if (f.role !== 'super') {
    send();
    return;
  }
  h.ask({title: 'Add a Super Admin', body: body.name + ' will be able to see and change everything, including other Super Admins. Enter your own password to confirm.', hasInput: true, noGen: true, password: true, inputLabel: 'Your password', inputPh: 'Your password', confirmLabel: 'Add Super Admin', bg: '#b3261e', onConfirm: (t) => {
    if (t) send(t);
  }});
}

// The user's recent posts: dropped if another user's panel opened meanwhile (no one else's posts under this name).
// The list row has no full mobile or email (contact=0, BVTGC-75): the panel reads them from GET /users/{id}/.
function openUser(h: ConsoleHost, u: AdminUser) {
  h.setState({panel: {type: 'user', id: u.id}, panelUser: u, panelUserPosts: []});
  const current = h.ticket('panelUser');
  h.api.get<User>('/users/' + u.id + '/').then((x) => {
    if (current()) h.setState((s) => ({panelUser: s.panel && s.panel.id === u.id ? adaptUser(h, x) : s.panelUser}));
  }).catch((e: unknown) => current() && h.fail(e));
  const latest = h.ticket('panel');
  h.api.get<Paged<Post>>('/posts/', {author: u.id, page_size: 5}).then((d) => {
    if (latest()) h.setState({panelUserPosts: d.results.map((p) => adaptPost(h, p))});
  }).catch((e: unknown) => latest() && h.fail(e));
}

/** The user side panel's values (panels/UserDetail.tsx): details, roles, recent posts and the actions above. */
export function userPanelView(h: ConsoleHost) {
  const s = h.state, R = ROLE;
  const pu = s.panelUser;
  // Header: name, role and status; Contact: how to reach them and when they last signed in; areas are in Roles.
  const su = pu ? {name: pu.name, te: pu.te !== pu.name ? pu.te : '', initial: pu.name[0], bg: R[pu.role].bg, roleLabel: R[pu.role].label, rbg: R[pu.role].tbg, rcolor: R[pu.role].tc,
    active: pu.active, locked: pu.locked,
    // Every row always shows: an empty one says "Not given" (greyed), so nothing seems to be missing.
    // Until GET /users/{id}/ answers, the row's masked mobile and email show, without links (BVTGC-75).
    contact: pu.full
      ? [{k: 'Username', v: pu.username || 'Not given', href: '', none: !pu.username}, {k: 'Mobile', v: pu.mobile ? '+91 ' + pu.mobile : 'Not given', href: pu.mobile ? 'tel:+91' + pu.mobile : '', none: !pu.mobile}, {k: 'Email', v: pu.email || 'Not given', href: pu.email ? 'mailto:' + pu.email : '', none: !pu.email}]
      : [{k: 'Username', v: pu.username || 'Not given', href: '', none: !pu.username}, {k: 'Mobile', v: pu.mobileLast4 ? '+91 ******' + pu.mobileLast4 : 'Not given', href: '', none: !pu.mobileLast4}, {k: 'Email', v: pu.emailMasked || 'Not given', href: '', none: !pu.emailMasked}],
    // The account: password state, sign-ins, when and by whom it was added, the app language.
    account: [
      {k: 'Password', v: pu.mustChange ? 'Temporary: must choose their own at the next sign-in' : 'Their own', warn: pu.mustChange},
      {k: 'Last sign-in', v: pu.last || 'Never signed in', warn: false},
      {k: 'Added', v: pu.added ? pu.added + (pu.addedBy ? ' · by ' + pu.addedBy : '') : '—', warn: false},
      {k: 'App language', v: pu.lang === 'en' ? 'English' : pu.lang === 'te' ? 'Telugu' : '—', warn: false},
    ],
    note: !pu.active ? 'Blocked: they cannot sign in or post until unblocked.' : pu.noRole ? 'No role: they can sign in but cannot do anything until a role is added.' : '',
    noteBad: !pu.active, noRoles: !(pu.ras || []).length,
    posts: s.panelUserPosts.map((p) => postRow(h, p)), noPosts: !s.panelUserPosts.length,
    roles: (pu.ras || []).map((ra) => {
      const k = RK[ra.role] || 'panchayat';
      // Reassign area moves the main role's area, so it sits on that role's row.
      return {label: R[k].label, rbg: R[k].tbg, rcolor: R[k].tc, area: ra.area ? (ra.area.path || ra.area.name) : '—', canRemove: userCan(pu, 'remove_assignment'), remove: () => removeRole(h, pu, ra),
        canReassign: !!pu.raId && ra.id === pu.raId && userCan(pu, 'reassign'), reassign: () => reassignUser(h, pu)};
    }),
    // Edit details waits for the full mobile and email: the form sends them back, so masked values would erase them.
    canEdit: pu.full && userCan(pu, 'edit'), edit: () => editUser(h, pu), canAddRole: userCan(pu, 'add_assignment') && roleChoices(h).length > 0, canReassign: !!pu.raId && userCan(pu, 'reassign'), canReset: userCan(pu, 'reset_password'), canUnlock: pu.locked && userCan(pu, 'unlock'), canToggle: userCan(pu, pu.active ? 'block' : 'unblock'),
    addRole: () => addRole(h, pu), reassign: () => reassignUser(h, pu), reset: () => resetPassword(h, pu), unlock: () => unlockUser(h, pu), toggle: () => toggleUser(h, pu), toggleLabel: pu.active ? 'Block user' : 'Unblock user', tbg: pu.active ? '#b3261e' : '#1d7a33'} : {fields: [], posts: [], roles: []};
  return {su};
}

/** The page's and the Add/Edit user drawer's renderVals() values (screens/Users.tsx; panels/UserDrawer.tsx). */
export function usersView(h: ConsoleHost) {
  const s = h.state, R = ROLE;
  const uf = s.uf;
  // Users this admin may block or unblock can be ticked, on every status (owner, 2026-11-20).
  const selIds: string[] = s.users.filter((u) => userCan(u, 'block') || userCan(u, 'unblock')).map((u) => u.id);
  const picked = s.userSel.filter((id): id is string => selIds.includes(id as string));
  // Second line under the name: the Telugu name, else the login username (never the English name twice).
  // Mobile column: the last 4 digits only (audit WEB-DP-001; the server sends no more since BVTGC-75); the user panel
  // ("View") shows it, or the email, in full.
  const userRows = s.users.map((u) => ({rowKey: String(u.id), name: u.name, te: u.nameTe || u.username, mobile: u.mobileLast4 ? '+91 ******' + u.mobileLast4 : '—', roleLabel: u.noRole ? 'No role' : R[u.role].label, rbg: u.noRole ? R.system.tbg : R[u.role].tbg, rcolor: u.noRole ? R.system.tc : R[u.role].tc, bg: R[u.role].bg, initial: u.name[0], area: h.an(u.area),
    blocked: !u.active, lastLogin: u.last, toggleLabel: u.active ? 'Block' : 'Unblock', tcolor: u.active ? '#b3261e' : '#1d7a33',
    // Reassign area is in the user panel (View); the table keeps View and Block / Unblock.
    canToggle: userCan(u, u.active ? 'block' : 'unblock'), view: () => openUser(h, u), toggle: () => toggleUser(h, u),
    selectable: selIds.includes(u.id), sel: picked.includes(u.id), toggleSel: () => h.toggleSel('userSel', u.id)}));
  // Ticked users: Block acts on the active ones, Unblock on the blocked ones, each only where the server allows.
  const pickedUsers = s.users.filter((u) => picked.includes(u.id));
  const toBlock = pickedUsers.filter((u) => u.active && userCan(u, 'block')), toUnblock = pickedUsers.filter((u) => !u.active && userCan(u, 'unblock'));
  const actions: BulkAction[] = [
    ...(toBlock.length ? [{label: 'Block', count: toBlock.length, bg: '#b3261e', fg: '#fff', border: '#b3261e', onClick: () => bulkBlock(h, toBlock, true)}] : []),
    ...(toUnblock.length ? [{label: 'Unblock', count: toUnblock.length, bg: '#1F8A3B', fg: '#fff', border: '#1F8A3B', onClick: () => bulkBlock(h, toUnblock, false)}] : []),
  ];
  const userSel = {show: selIds.length > 0, count: picked.length, all: picked.length > 0 && picked.length === selIds.length, some: picked.length > 0 && picked.length < selIds.length,
    label: picked.length + ' of ' + selIds.length + ' selected', busy: s.bulk, actions, note: '',
    toggleAll: () => h.setState({userSel: picked.length === selIds.length ? [] : selIds}), clear: () => h.setState({userSel: []})};
  const nu = s.nu;
  const canNU = nuValid(nu);
  const nuRoles = roleChoices(h);
  const nuSteps = areaSteps(h, nu);
  const nuPlace = areaSummary(h, nu);
  return {
    uf,
    onUF: (e: FieldChange) => {
      const {name, value} = e.target;
      h.setState((st) => ({uf: {...st.uf, [name]: value}}), () => {
        h.later('users', () => loadUsers(h, 1), name === 'q' ? 300 : 0);
      });
    },
    // Status pills; counts come with the list (role, district and search applied), the server's own numbers.
    userTabs: ([['', 'All'], ['active', 'Active'], ['blocked', 'Blocked']] as const).map(([id, label]) => {
      const c = s.userCounts;
      return {label, on: uf.status === id, count: c ? (id === 'active' ? c.active : id === 'blocked' ? c.blocked : c.active + c.blocked) : undefined,
        go: () => h.setState((st) => ({uf: {...st.uf, status: id}}), () => loadUsers(h, 1))};
    }),
    userRows, userSel, userCount: s.userCount, userEmpty: !userRows.length,
    userEmptyText: s.usersLoading ? 'Loading…' : uf.q.trim() || uf.role || uf.district ? 'No users match these filters' : uf.status === 'blocked' ? 'No blocked users' : 'No users yet',
    userEmptyHint: s.usersLoading ? '' : uf.q.trim() || uf.role || uf.district ? 'Try another search or filter.' : uf.status === 'blocked' ? '' : 'Add District, Mandal and Village Admins and Panchayat members with Add user.', usersPager: pager(s.userPage, s.userPages, (p) => loadUsers(h, p)),
    nuEdit: !!nu.id, nuTitle: nu.id ? 'Edit user' : 'Add User', nuSaveLabel: nu.id ? 'Save changes' : 'Create user',
    openAddUser: () => h.setState((st) => ({drawerOpen: true, nu: {...(st.nu.id ? {id: null, name: '', te: '', email: '', username: '', mobile: '', password: '', area: '', nuD: '', nuM: ''} : st.nu), role: nuRoles.some((r) => r.id === st.nu.role) ? st.nu.role : (nuRoles[0] ? nuRoles[0].id : st.nu.role)}})),
    canAddUser: nuRoles.length > 0, nuRoles,
    // The role filter offers Super Admin to those who manage them (GET /users/?role=SUPER_ADMIN), as the app does.
    ufSuper: h.can('accounts.manage_super_admin'),
    genNU: (e?: React.MouseEvent) => {
      e?.preventDefault();
      const p = h.newPassword();
      h.nuGen = p;
      h.setState((st) => ({nu: {...st.nu, password: p}}));
    },
    closeDrawer: () => h.setState({drawerOpen: false}), drawerOpen: s.drawerOpen, nu,
    onNU: (e: FieldChange) => {
      const {name, value} = e.target;
      if (name === 'name') h.suggestTe('nu', value);
      if (name === 'nuM' && value) void h.loadVillages(value); // the Village step lists this mandal's villages
      h.setState((st) => {
        const n = {...st.nu, [name]: name === 'mobile' ? value.replace(/\D/g, '').slice(0, 10) : value};
        if (name === 'role' || name === 'nuD' || name === 'nuM') return {nu: areaPick(h, st.nu, name, value)};
        return {nu: n};
      });
    },
    cannotSaveNU: !(canNU && (nu.id || nu.area)), saveNUOpacity: canNU && (nu.id || nu.area) ? 1 : .5, nuSteps, nuPlace, nuSuper: !nu.id && nu.role === 'super', nuRoleLabel: (ROLE[nu.role] || {label: ''}).label, saveNU: () => saveNU(h),
  };
}
