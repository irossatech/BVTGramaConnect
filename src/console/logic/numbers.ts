// Important numbers page (sidebar "Important numbers"): numbers for villages, government helplines and the contact
// types, with the number and type forms, verify, remove (also several at once) and CSV import.
// Moved out of Console.tsx unchanged (audit WEB-ARCH-001). Calls /admin/contacts/, /contact-types/ and
// /admin/contact-types/ (.claude/api.md, contract section 14).
import type { AdminContact, AdminContactType, ContactImportResult, ContactTypeRef, ListOrPage, Paged } from "../types";
import { isRowError, isStatus, orEmpty, pageCount, pager, PAGE_SIZE, pickFile, reportErrors, rows, type FieldChange, type NumTab, type TypeForm } from "../model";
import type { ConsoleHost } from "./host";

// The role key whose areas a number at this level can be given (for the area picker).
const LVROLE: Readonly<Record<string, string>> = {DISTRICT:'district',MANDAL:'mandal',VILLAGE:'village'};

export function loadNumbers(h: ConsoleHost, page: number) {
  const s = h.state;
  const latest = h.ticket('nums');
  h.setState({numLoading: true});
  h.api.get<Paged<AdminContact>>('/admin/contacts/', {section: s.numTab, type: s.numType, q: s.numQ, ...(s.numTab === 'AREA' && s.numDistrict ? {level: 'DISTRICT', area_id: s.numDistrict} : {}), page, page_size: PAGE_SIZE})
    .then((d) => latest() && h.setState({nums: d.results || [], numCount: d.count || 0, numPage: page, numPages: pageCount(d.count), numLoading: false}))
    .catch((e: unknown) => {
      if (!latest()) return;
      h.setState({numLoading: false, nums: [], numCount: 0});
      h.fail(e);
    });
}

// adminOnly: after adding a type, the public list may still be the cached one, so only the admin list reloads.
export function loadTypes(h: ConsoleHost, adminOnly?: boolean) {
  // The number form's type list: without it no number can be added, so a failure is said.
  if (!adminOnly) h.api.get<ListOrPage<ContactTypeRef>>('/contact-types/').then((d) => h.setState({ctypes: rows(d)})).catch((e: unknown) => h.fail(e));
  if (h.can('contacts.manage_contact_types')) h.api.get<ListOrPage<AdminContactType>>('/admin/contact-types/').then((d) => h.setState({ctypesAdmin: rows(d)})).catch((e: unknown) => h.fail(e));
}

// The server's phone grammar: drop spaces, dashes, brackets and a leading +91 (or 91 before 10 digits).
function phoneDigits(p: string) {
  const d = String(p || '').replace(/[\s\-()]/g, '');
  return d.startsWith('+91') ? d.slice(3) : /^91\d{10}$/.test(d) ? d.slice(2) : d;
}

function openNumber(h: ConsoleHost, c: AdminContact | null) {
  const a = c && c.area && c.area.level !== 'STATE' ? c.area : null;
  h.setState({nf: c
    ? {id: c.id, section: c.type.section, type: c.type.key, typeObj: {...c.type, is_other: !!c.custom_type}, custom: c.custom_type || '', name: c.name, te: c.name_te || '', phone: c.phone, email: c.email || '', level: a ? a.level : 'VILLAGE', area: a ? String(a.id) : '', sort: String(c.sort_order == null ? 100 : c.sort_order), consent: !!c.consent_recorded}
    : {id: null, section: h.state.numTab === 'HELPLINE' ? 'HELPLINE' : 'AREA', type: '', custom: '', name: '', te: '', phone: '', email: '', level: 'VILLAGE', area: '', sort: '100', consent: false}});
}

function nfView(h: ConsoleHost) {
  const f = h.state.nf;
  if (!f) return null;
  // "Other" is not a type: new kinds come from Add type; a number already "Other" keeps it (typeObj below)
  const types = h.state.ctypes.filter((x) => x.section === f.section && !x.is_other);
  const own = f.typeObj;
  if (own && !types.some((x) => x.key === own.key)) types.unshift(own);
  const type = types.find((x) => x.key === f.type) || types[0] || null;
  const areas = f.section === 'AREA' ? h.areaOptions(LVROLE[f.level]) : [];
  const area = areas.find((x) => x.id === f.area) || areas[0] || null;
  const mobile = /^[6-9]\d{9}$/.test(phoneDigits(f.phone));
  const ok = !!(f.name.trim() && phoneDigits(f.phone) && type && (!type.is_other || f.custom.trim()) && (f.section !== 'AREA' || area) && (!mobile || f.consent) && (!f.email.trim() || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())));
  return {f, types, type, areas, area, mobile, ok};
}

function saveNumber(h: ConsoleHost) {
  const n = nfView(h);
  // ok implies a type (and an area for AREA numbers); the checks below only tell TypeScript so.
  if (!n || !n.ok || !n.type) return;
  const f = n.f;
  const body = {type: n.type.key, name: f.name.trim(), name_te: f.te.trim(), phone: f.phone.trim(), email: f.email.trim(), sort_order: f.sort === '' ? 100 : Number(f.sort), consent_recorded: n.mobile && f.consent,
    area: f.section === 'AREA' && n.area ? {level: n.area.level, id: Number(n.area.id)} : {level: 'STATE', id: h.state.stateRow && h.state.stateRow.id},
    ...(n.type.is_other ? {custom_type: f.custom.trim()} : {})};
  (f.id ? h.api.patch('/admin/contacts/' + f.id + '/', body) : h.api.post('/admin/contacts/', body)).then(() => {
    h.setState({nf: null});
    h.toast((f.id ? 'Number updated · ' : 'Number added · ') + body.name);
    loadNumbers(h, f.id ? h.state.numPage : 1);
  }).catch((e: unknown) => h.fail(e));
}

function verifyNumber(h: ConsoleHost, c: AdminContact) {
  h.api.patch('/admin/contacts/' + c.id + '/', {verified: true}).then(() => {
    h.toast('Marked verified · ' + c.name);
    loadNumbers(h, h.state.numPage);
  }).catch((e: unknown) => h.fail(e));
}

function removeNumber(h: ConsoleHost, c: AdminContact) {
  h.ask({title: 'Remove number', body: 'Remove ' + c.name + ' (' + c.phone + ')? Citizens stop seeing it at once. The audit log keeps a record.', confirmLabel: 'Remove', bg: '#b3261e', onConfirm: () => h.api.del('/admin/contacts/' + c.id + '/').then(() => {
    h.toast('Number removed', '#E9791E');
    loadNumbers(h, h.state.numPage);
  }).catch((e: unknown) => h.fail(e))});
}

function importNumbers(h: ConsoleHost) {
  pickFile('.csv,text/csv', (file) => {
    const form = () => {
      const fd = new FormData();
      fd.append('file', file);
      return fd;
    };
    h.api.upload<ContactImportResult>('/admin/contacts/import/', form(), {dry_run: 1}).then((r) => h.ask({title: 'Import important numbers', body: 'File checked: ' + r.created + ' new, ' + r.updated + ' updated, ' + r.skipped + ' unchanged.', confirmLabel: 'Import', bg: '#0D3B7A',
      onConfirm: () => h.api.upload<ContactImportResult>('/admin/contacts/import/', form()).then((d) => {
        h.toast('Imported · ' + d.created + ' new, ' + d.updated + ' updated');
        loadNumbers(h, 1);
      }).catch((e: unknown) => h.fail(e))})).catch((e: unknown) => {
      const errors = reportErrors(e).filter(isRowError);
      if (errors.length) {
        h.ask({title: 'File has errors', body: errors.slice(0, 5).map((x) => 'Row ' + x.row + (x.field ? ' · ' + x.field : '') + ': ' + x.message).join(' · ') + (errors.length > 5 ? ' · and ' + (errors.length - 5) + ' more.' : ''), confirmLabel: 'Close', bg: '#3b4a5c', onConfirm: () => {}});
      } else h.fail(e);
    });
  });
}

// Add a contact type: one form (section, English and Telugu names); the key is made from the English name.
function addType(h: ConsoleHost, section?: string, forNumber?: boolean) {
  h.setState({tf: {section: section || (h.state.numTab === 'HELPLINE' ? 'HELPLINE' : 'AREA'), forNumber: !!forNumber, en: '', te: '', tried: false, saving: false}});
}

// Edit a type: the same form; the names change, the section and key stay (the server keeps them).
function editType(h: ConsoleHost, t: AdminContactType) {
  h.setState({tf: {id: t.id, section: t.section, en: t.name_en || '', te: t.name_te && t.name_te !== t.name_en ? t.name_te : '', tried: false, saving: false}});
}

// Delete a type nobody uses. One with numbers cannot go: move or remove them first, or switch it off.
function deleteType(h: ConsoleHost, t: AdminContactType) {
  const n = t.contact_count || 0;
  if (n) {
    h.ask({title: 'This type is in use', body: n + ' number' + (n === 1 ? ' uses' : 's use') + ' "' + t.name_en + '". Change ' + (n === 1 ? 'its' : 'their') + ' type, or remove ' + (n === 1 ? 'it' : 'them') + ', then delete the type. Or switch the type off: it is hidden from citizens and its numbers stay.', confirmLabel: 'OK', bg: '#3b4a5c', noCancel: true, onConfirm: () => {}});
    return;
  }
  h.ask({title: 'Delete "' + t.name_en + '"?', body: 'No number uses this type. It is removed from the list for good.', confirmLabel: 'Delete', bg: '#b3261e', onConfirm: () => h.api.del('/admin/contact-types/' + t.id + '/').then(() => {
    h.setState((st) => ({ctypesAdmin: st.ctypesAdmin.filter((x) => x.id !== t.id), ctypes: st.ctypes.filter((x) => x.key !== t.key)}));
    h.toast('Type deleted · ' + t.name_en, '#E9791E');
  }).catch((e: unknown) => {
    // Until the server can delete types (backend plan: contact-type-delete), it answers 405.
    if (isStatus(e, 405)) h.ask({title: 'Not available yet', body: 'Deleting a type needs a server update, which is planned. For now, switch the type off: citizens stop seeing it.', confirmLabel: 'OK', bg: '#3b4a5c', noCancel: true, onConfirm: () => {}});
    else h.fail(e);
  })});
}

function tfErrs(f: TypeForm) {
  return {en: !f.en.trim() ? 'Enter the English name.' : '', te: ''};
}

function saveType(h: ConsoleHost) {
  const f = h.state.tf;
  if (!f || f.saving) return;
  const e = tfErrs(f);
  if (e.en || e.te) {
    h.setState({tf: {...f, tried: true}});
    return;
  }
  const en = f.en.trim(), key = (en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'type').slice(0, 40);
  h.setState({tf: {...f, saving: true}});
  if (f.id) {
    h.api.patch<AdminContactType | null>('/admin/contact-types/' + f.id + '/', {name_en: en, name_te: f.te.trim() || en}).then((x) => {
      h.setState((st) => ({tf: null, ctypesAdmin: st.ctypesAdmin.map((c) => c.id === f.id ? {...c, ...(x || {}), name_en: en, name_te: f.te.trim() || en} : c), ctypes: st.ctypes.map((c) => x && c.key === x.key ? {...c, name: en} : c)}));
      h.toast('Type saved · ' + en);
    }).catch((err: unknown) => {
      h.setState((st) => ({tf: st.tf && {...st.tf, saving: false}}));
      h.fail(err);
    });
    return;
  }
  h.api.post<AdminContactType | null>('/admin/contact-types/', {key, section: f.section, name_en: en, name_te: f.te.trim() || en}).then((x) => {
    const k = (x && x.key) || key;
    // the public types list can come back cached for a moment: add the new type here
    h.setState((st) => ({tf: null, ctypes: st.ctypes.some((c) => c.key === k) ? st.ctypes : [...st.ctypes, {key: k, section: f.section, name: en, is_other: false}], nf: f.forNumber && st.nf ? {...st.nf, type: k, custom: ''} : st.nf}));
    h.toast('Type added · ' + en);
    loadTypes(h, true);
  }).catch((err: unknown) => {
    h.setState((x) => ({tf: x.tf && {...x.tf, saving: false}}));
    h.fail(err);
  });
}

function toggleType(h: ConsoleHost, t: AdminContactType) {
  h.api.patch('/admin/contact-types/' + t.id + '/', {is_active: !t.is_active}).then(() => {
    h.toast(t.name_en + (t.is_active ? ' switched off' : ' switched on'), t.is_active ? '#E9791E' : '#6cc04a');
    loadTypes(h);
  }).catch((e: unknown) => h.fail(e));
}

/** The page's and the two forms' renderVals() values (screens/Numbers.tsx; panels/NumberForm.tsx, TypeForm.tsx). */
export function numbersView(h: ConsoleHost) {
  const s = h.state;
  const districtOpts = s.geo.map((d) => ({id: String(d.id), label: d.name}));
  const sw = (on: boolean) => ({swBg: on ? '#1F8A3B' : '#cfd8e3', swLeft: on ? '21px' : '3px'});
  const numTabList: {id: NumTab; label: string}[] = [{id: 'AREA', label: 'For villages'}, {id: 'HELPLINE', label: 'Government helplines'}, ...(h.can('contacts.manage_contact_types') ? [{id: 'TYPES' as const, label: 'Types'}] : [])];
  const numTabs = numTabList.map((t) => {
    const on = s.numTab === t.id;
    return {label: t.label, line: on ? '#0D3B7A' : 'transparent', color: on ? '#0A2550' : '#6b7a8c', go: () => h.setState({numTab: t.id, numType: '', nf: null}, () => { if (t.id === 'TYPES') loadTypes(h); else loadNumbers(h, 1); })};
  });
  const numIds = s.nums.filter((c) => (c.allowed_actions || []).includes('remove')).map((c) => c.id);
  const numRows = s.nums.map((c) => {
    const al = c.allowed_actions || [];
    const rc = c.needs_recheck;
    return {rowKey: String(c.id), canSel: al.includes('remove'), sel: s.numSel.includes(c.id), toggleSel: () => h.toggleSel('numSel', c.id), type: c.custom_type || c.type.name, name: c.name, te: c.name_te && c.name_te !== c.name ? c.name_te : '',
      phone: c.phone_kind === 'MOBILE' ? '+91 ' + c.phone.slice(0, 5) + ' ' + c.phone.slice(5) : c.phone, email: c.email || '', area: c.area ? (c.area.path || c.area.name) : '—', status: rc ? 'Needs check' : 'Verified ' + h.fmt(c.verified_at, true).slice(0, 11),
      sbg: rc ? '#fff0dc' : '#e4f4df', scolor: rc ? '#b35a0e' : '#1d7a33', canEdit: al.includes('edit'), canVerify: al.includes('verify'), canRemove: al.includes('remove'), edit: () => openNumber(h, c), verify: () => verifyNumber(h, c), remove: () => removeNumber(h, c)};
  });
  // "Other" is not a type: not listed
  const typeRows = s.ctypesAdmin.filter((t) => !t.is_other).map((t) => ({key: t.key, section: t.section === 'HELPLINE' ? 'Government helplines' : 'For villages', en: t.name_en, te: t.name_te, count: String(t.contact_count), ...sw(t.is_active), toggle: () => toggleType(h, t), edit: () => editType(h, t), del: () => deleteType(h, t)}));
  const nv = nfView(h);
  const tf: Partial<TypeForm> = s.tf || {};
  const tfErr: Partial<{en: string; te: string}> = s.tf && s.tf.tried ? tfErrs(s.tf) : {};
  return {
    numSel: h.selView('numSel', numIds, (n) => ({title: 'Remove ' + n + ' number' + (n === 1 ? '' : 's') + '?', body: 'Citizens stop seeing them at once. The audit log keeps a record.', confirm: 'Remove ' + n, url: (id) => '/admin/contacts/' + id + '/', done: () => loadNumbers(h, h.state.numPage)})),
    numTabs, numRows, isTypesTab: s.numTab === 'TYPES', typeRows, numQ: s.numQ,
    onNumQ: (e: FieldChange) => {
      h.setState({numQ: e.target.value});
      h.later('numbers', () => loadNumbers(h, 1), 300);
    },
    numType: s.numType, numTypeOpts: [{id: '', label: 'All types'}, ...s.ctypes.filter((x) => x.section === s.numTab).map((x) => ({id: x.key, label: x.name}))], onNumType: (e: FieldChange) => h.setState({numType: e.target.value}, () => loadNumbers(h, 1)),
    numAreaFilter: s.numTab === 'AREA' && s.geo.length > 1, numDistrict: s.numDistrict, numDistrictOpts: [{id: '', label: 'All districts'}, ...districtOpts], onNumDistrict: (e: FieldChange) => h.setState({numDistrict: e.target.value}, () => loadNumbers(h, 1)),
    numCount: s.numCount + (s.numCount === 1 ? ' number' : ' numbers'), numEmpty: !numRows.length, numEmptyText: s.numLoading ? 'Loading…' : (s.numQ || s.numType || s.numDistrict ? 'No numbers match.' : 'No numbers yet. Add one, or import a CSV file.'), numPager: pager(s.numPage, s.numPages, (p) => loadNumbers(h, p)), addNumber: () => openNumber(h, null), importNumbers: () => importNumbers(h), addType: () => addType(h),
    tfShow: !!s.tf, tf, tfErr, tfSaveLabel: s.tf && s.tf.saving ? (s.tf.id ? 'Saving…' : 'Adding…') : (s.tf && s.tf.id ? 'Save' : 'Add type'), tfTitle: s.tf && s.tf.id ? 'Edit contact type' : 'Add contact type', tfEditing: !!(s.tf && s.tf.id), tfSectionLabel: s.tf && s.tf.section === 'HELPLINE' ? 'Government helplines' : 'For villages', closeTF: () => h.setState({tf: null}), saveTF: () => saveType(h),
    onTF: (e: FieldChange) => {
      const {name, value} = e.target;
      if (name === 'en') h.suggestTe('tf', value);
      h.setState((st) => st.tf ? {tf: {...st.tf, [name]: value}} : null);
    },
    tfSections: [{id: 'AREA', label: 'For villages', sub: 'Numbers for a district, mandal or village, such as a VRO or Mee Seva centre.'}, {id: 'HELPLINE', label: 'Government helplines', sub: 'Statewide numbers every citizen sees, such as 108 or 1912.'}].map((o) => ({...o, on: s.tf && s.tf.section === o.id, pick: () => h.setState((st) => st.tf ? {tf: {...st.tf, section: o.id}} : null)})),
    nfShow: !!nv, nf: orEmpty(nv ? {...nv.f, type: nv.type ? nv.type.key : '', area: nv.area ? nv.area.id : ''} : null), nfTitle: nv ? (nv.f.id ? 'Edit number' : nv.f.section === 'HELPLINE' ? 'Add helpline' : 'Add number') : '', nfSaveLabel: nv && nv.f.id ? 'Save changes' : 'Add number',
    nfTypes: nv ? [...nv.types.map((x) => ({id: x.key, label: x.name})), ...(h.can('contacts.manage_contact_types') ? [{id: '__new', label: '+ Add a new type…'}] : [])] : [], nfIsOther: !!(nv && nv.type && nv.type.is_other), nfIsArea: !!(nv && nv.f.section === 'AREA'),
    nfLevels: [{id: 'VILLAGE', label: 'Village'}, {id: 'MANDAL', label: 'Mandal'}, {id: 'DISTRICT', label: 'District'}], nfAreas: nv ? nv.areas : [], nfMobile: !!(nv && nv.mobile),
    onNF: (e: FieldChange) => {
      const t = e.target;
      const {name, value} = t;
      if (name === 'type' && value === '__new') {
        addType(h, h.state.nf?.section, true);
        return;
      }
      if (name === 'name') h.suggestTe('nf', value);
      const next = t instanceof HTMLInputElement && t.type === 'checkbox' ? t.checked : value;
      h.setState((st) => {
        if (!st.nf) return null;
        const n = {...st.nf, [name]: next};
        if (name === 'level') n.area = '';
        if (name === 'type') n.custom = '';
        return {nf: n};
      });
    },
    cannotSaveNF: !(nv && nv.ok), saveNFOpacity: nv && nv.ok ? 1 : .5, saveNF: () => saveNumber(h), closeNF: () => h.setState({nf: null}),
  };
}
