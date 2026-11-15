// Users page (sidebar "Users"): the officials' list with filters, Add User and Edit user (the drawer, with its area
// steps and Generate), and what can be done to a user: block/unblock, reassign, add and remove a role, reset password
// and unlock. Moved out of Console.tsx unchanged (audit WEB-ARCH-001). The user side panel (and its recent posts) is
// still built in Console.tsx, which calls the actions exported here. Calls /users/ (.claude/api.md).
import type React from "react";
import type { Area, AreaLevel, Paged, Post, RoleAssignment, TemporaryPassword, User, UserResponse } from "../types";
import { EMPTY_NU, LEVEL_OF_ROLE, pageCount, pager, PAGE_SIZE, RK, ROLE, type AdminUser, type FieldChange, type NewUserForm, type Option } from "../model";
import { maskMobile } from "../mask";
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
  return {
    id: u.id, name: u.name, te: u.name_te || u.name, nameTe: u.name_te || '', mobile: u.mobile || '', email: u.email || '', username: u.username || '', role,
    district: parts.district, mandal: parts.mandal, village: parts.village, area: ra ? ra.area : null, raId: ra ? ra.id : null, ras,
    active: u.is_active !== undefined ? !!u.is_active : u.status === 'ACTIVE', locked: !!u.locked_out,
    allowed: Array.isArray(u.allowed_actions) ? u.allowed_actions : null, last: h.fmtLast(u.last_login_at),
  };
}

export function loadUsers(h: ConsoleHost, page: number) {
  const uf = h.state.uf;
  const latest = h.ticket('users');
  h.setState({usersLoading: true});
  h.api.get<Paged<User>>('/users/', {role: uf.role ? RAPI[uf.role] : '', district: uf.district, status: uf.status ? uf.status.toUpperCase() : '', is_active: uf.status ? String(uf.status === 'active') : '', q: uf.q, page, page_size: PAGE_SIZE})
    .then((d) => latest() && h.setState({users: d.results.map((u) => adaptUser(h, u)), userCount: d.count, userPage: page, userPages: pageCount(d.count), usersLoading: false}))
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

export function reassignUser(h: ConsoleHost, u: AdminUser) {
  const R = ROLE;
  const opts = h.areaOptions(u.role);
  if (!u.raId) {
    h.toast('This user has no role to move.', '#E9791E');
    return;
  }
  const raId = u.raId;
  h.ask({title: 'Reassign area', body: 'Move ' + u.name + ' (' + R[u.role].label + ') to a different ' + (u.role === 'district' ? 'district' : u.role === 'mandal' ? 'mandal' : 'village') + '. Their pending reviews stay with the old area.', hasSelect: true, selectLabel: 'New area', options: opts, confirmLabel: 'Reassign', bg: '#0D3B7A', onConfirm: (_t, sel) => {
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
  h.ask({title: 'Add role', body: 'Give ' + u.name + ' another role. They choose which role to use after login.', hasSelect: true, selectLabel: 'Role', options: roles, confirmLabel: 'Next', bg: '#0D3B7A', onConfirm: (_t, role) => {
    const opts = h.areaOptions(role);
    if (!opts.length) {
      h.toast('Add areas in Geography first.', '#E9791E');
      return;
    }
    setTimeout(() => h.ask({title: 'Add role · ' + R[role].label, body: 'Choose the area for this role.', hasSelect: true, selectLabel: 'Area', options: opts, confirmLabel: 'Add role', bg: '#0D3B7A', onConfirm: (_t2, areaId) => {
      const o = opts.find((x) => x.id === areaId) || opts[0];
      h.api.post('/users/' + u.id + '/role-assignments/', {role: RAPI[role], area: {level: o.level, id: Number(o.id)}}).then(() => {
        h.toast('Role added · ' + R[role].label + ' · ' + o.label);
        refreshUser(h, u.id);
      }).catch((e: unknown) => h.fail(e));
    }}), 0);
  }});
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
  h.api.patch('/users/' + f.id + '/', {name: f.name.trim(), name_te: f.te.trim(), email: f.email.trim() || null, mobile: f.mobile || null}).then(() => {
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
function openUser(h: ConsoleHost, u: AdminUser) {
  h.setState({panel: {type: 'user', id: u.id}, panelUser: u, panelUserPosts: []});
  const latest = h.ticket('panel');
  h.api.get<Paged<Post>>('/posts/', {author: u.id, page_size: 5}).then((d) => {
    if (latest()) h.setState({panelUserPosts: d.results.map((p) => adaptPost(h, p))});
  }).catch((e: unknown) => latest() && h.fail(e));
}

/** The user side panel's values (panels/UserDetail.tsx): details, roles, recent posts and the actions above. */
export function userPanelView(h: ConsoleHost) {
  const s = h.state, R = ROLE;
  const pu = s.panelUser;
  const su = pu ? {name: pu.name, te: pu.te, initial: pu.name[0], bg: R[pu.role].bg,
    fields: [{k: 'Role', v: R[pu.role].label}, {k: 'Mobile', v: pu.mobile ? '+91 ' + pu.mobile : (pu.email || '—')}, {k: 'District', v: pu.district || '—'}, {k: 'Mandal', v: pu.mandal || '—'}, {k: 'Village', v: pu.village || '—'}, {k: 'Status', v: (pu.active ? 'Active · last login ' + pu.last : 'Blocked') + (pu.locked ? ' · locked after failed logins' : '')}],
    posts: s.panelUserPosts.map((p) => postRow(h, p)),
    roles: (pu.ras || []).map((ra) => {
      const k = RK[ra.role] || 'panchayat';
      return {label: R[k].label, rbg: R[k].tbg, rcolor: R[k].tc, area: ra.area ? (ra.area.path || ra.area.name) : '—', canRemove: userCan(pu, 'remove_assignment'), remove: () => removeRole(h, pu, ra)};
    }),
    canEdit: userCan(pu, 'edit'), edit: () => editUser(h, pu), canAddRole: userCan(pu, 'add_assignment') && roleChoices(h).length > 0, canReassign: !!pu.raId && userCan(pu, 'reassign'), canReset: userCan(pu, 'reset_password'), canUnlock: pu.locked && userCan(pu, 'unlock'), canToggle: userCan(pu, pu.active ? 'block' : 'unblock'),
    addRole: () => addRole(h, pu), reassign: () => reassignUser(h, pu), reset: () => resetPassword(h, pu), unlock: () => unlockUser(h, pu), toggle: () => toggleUser(h, pu), toggleLabel: pu.active ? 'Block user' : 'Unblock user', tbg: pu.active ? '#b3261e' : '#1F8A3B'} : {fields: [], posts: [], roles: []};
  return {su};
}

/** The page's and the Add/Edit user drawer's renderVals() values (screens/Users.tsx; panels/UserDrawer.tsx). */
export function usersView(h: ConsoleHost) {
  const s = h.state, R = ROLE;
  const uf = s.uf;
  // Second line under the name: the Telugu name, else the login username (never the English name twice).
  // Mobile column: the mobile only, masked (audit WEB-DP-001); the user panel ("View") shows it, or the email, in full.
  const userRows = s.users.map((u) => ({rowKey: String(u.id), name: u.name, te: u.nameTe || u.username, mobile: maskMobile(u.mobile) || '—', roleLabel: R[u.role].label, rbg: R[u.role].tbg, rcolor: R[u.role].tc, bg: R[u.role].bg, initial: u.name[0], area: h.an(u.area),
    statusLabel: u.active ? 'Active' : 'Blocked', scolor: u.active ? '#1d7a33' : '#b3261e', lastLogin: u.last, toggleLabel: u.active ? 'Block' : 'Unblock', tcolor: u.active ? '#b3261e' : '#1d7a33',
    canReassign: !!u.raId && userCan(u, 'reassign'), canToggle: userCan(u, u.active ? 'block' : 'unblock'), view: () => openUser(h, u), reassign: () => reassignUser(h, u), toggle: () => toggleUser(h, u)}));
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
    userRows, userCount: s.userCount, userEmpty: !userRows.length, userEmptyText: s.usersLoading ? 'Loading…' : 'No users match these filters.', usersPager: pager(s.userPage, s.userPages, (p) => loadUsers(h, p)),
    nuEdit: !!nu.id, nuTitle: nu.id ? 'Edit user' : 'Add User', nuSaveLabel: nu.id ? 'Save changes' : 'Create user',
    openAddUser: () => h.setState((st) => ({drawerOpen: true, nu: {...(st.nu.id ? {id: null, name: '', te: '', email: '', username: '', mobile: '', password: '', area: '', nuD: '', nuM: ''} : st.nu), role: nuRoles.some((r) => r.id === st.nu.role) ? st.nu.role : (nuRoles[0] ? nuRoles[0].id : st.nu.role)}})),
    canAddUser: nuRoles.length > 0, nuRoles,
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
      h.setState((st) => {
        const n = {...st.nu, [name]: name === 'mobile' ? value.replace(/\D/g, '').slice(0, 10) : value};
        if (name === 'role' || name === 'nuD' || name === 'nuM') return {nu: areaPick(h, st.nu, name, value)};
        return {nu: n};
      });
    },
    cannotSaveNU: !(canNU && (nu.id || nu.area)), saveNUOpacity: canNU && (nu.id || nu.area) ? 1 : .5, nuSteps, nuPlace, nuSuper: !nu.id && nu.role === 'super', nuRoleLabel: (ROLE[nu.role] || {label: ''}).label, saveNU: () => saveNU(h),
  };
}
