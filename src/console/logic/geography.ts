// Geography page (sidebar "Geography"): the district > mandal > village tree with search, the add/edit form (names,
// LGD code, PIN, location from a pasted map link), deactivate/reactivate, CSV export and the villages CSV import.
// Moved out of Console.tsx unchanged (audit WEB-ARCH-001). The tree itself (GET /geo/tree/) is loaded by Console.tsx
// (loadGeo), since every page uses it. Calls /geo/districts/, /geo/mandals/, /geo/villages/ (.claude/api.md).
import { saveFile } from "../api";
import { decodeUtf8, fileLine, planParts, type CsvPart } from "../csv-parts";
import type { GeoImportResult } from "../types";
import { csvCell, isStatus, pickFile, reportErrors, type FieldChange, type GeoErrs, type GeoForm, type GeoKind, type GeoNode } from "../model";
import type { ConsoleHost } from "./host";

// Largest villages CSV the console reads (the server takes at most GEO_IMPORT_MAX_BYTES, 20 MB, per part).
const GEO_CSV_MAX_MB = 20;

// "16.2345, 80.4567" or a Google Maps / OpenStreetMap link -> [lat, lng] (at most 6 decimals, as the server stores), else null.
function parseCoords(text: string): [string, string] | null {
  let t = String(text || '');
  try {
    t = decodeURIComponent(t);
  } catch {
    /* not URL-encoded */
  }
  const n = /(-?\d{1,3}(?:\.\d+)?)/.source;
  const pats = ['!3d' + n + '!4d' + n, '@' + n + ',' + n, /[?&](?:q|query|ll|destination|center)=/.source + n + /\s*,\s*/.source + n, 'mlat=' + n + '&mlon=' + n, /#map=\d+\//.source + n + '/' + n, /^\s*/.source + n + /°?\s*[ ,;]\s*/.source + n + /°?\s*$/.source];
  for (const p of pats) {
    const m = t.match(new RegExp(p));
    if (m) {
      const a = +m[1], b = +m[2];
      if (Math.abs(a) <= 90 && Math.abs(b) <= 180) return [String(+a.toFixed(6)), String(+b.toFixed(6))];
    }
  }
  return null;
}

function onGeoWhere(h: ConsoleHost, text: string) {
  const c = parseCoords(text);
  h.setState((st) => st.geoForm ? {geoForm: {...st.geoForm, where: text, ...(c ? {lat: c[0], lng: c[1]} : {})}} : null);
}

// Search text for Google Maps: village, mandal, district, state.
function geoPlace(h: ConsoleHost, f: GeoForm) {
  const g = h.state.geo;
  const parts: (string | null | undefined)[] = [f.name.trim()];
  if (f.kind === 'village') {
    const d = g.find((x) => x.mandals.some((m) => m.id === f.parentId));
    parts.push(f.parentName || f.parent, d && d.name);
  } else if (f.kind === 'mandal') parts.push(f.parentName || f.parent);
  parts.push(h.state.stateRow ? h.state.stateRow.name_en : 'Andhra Pradesh');
  return parts.filter(Boolean).join(', ');
}

// Same checks as the app's area sheet; the server checks again.
function geoSiblings(h: ConsoleHost, f: GeoForm): {id: number; name: string}[] {
  const g = h.state.geo;
  if (f.kind === 'district') return g;
  if (f.kind === 'mandal') {
    const d = g.find((x) => x.id === f.parentId);
    return d ? d.mandals : [];
  }
  for (const d of g) {
    const m = d.mandals.find((x) => x.id === f.parentId);
    if (m) return m.villages;
  }
  return [];
}

function geoErrs(h: ConsoleHost, f: GeoForm): GeoErrs {
  const nm = f.name.trim();
  const dupe = !!nm && geoSiblings(h, f).some((x) => x.id !== f.id && x.name.toLowerCase() === nm.toLowerCase());
  const e = {name: !nm ? 'Please enter a name' : dupe ? 'That name already exists here' : '', pin: '', coords: ''};
  if (f.isVillage) {
    const pin = String(f.pin || '').trim();
    if (pin && !/^\d{6}$/.test(pin)) e.pin = 'PIN code must be 6 digits';
    const la = String(f.lat || '').trim(), lo = String(f.lng || '').trim(), ok = /^-?\d{1,3}(\.\d{1,6})?$/;
    if (!la && !lo) {
      if (!f.id) e.coords = 'Add the village location: paste a Google Maps link or its numbers.';
    } else if (!(ok.test(la) && ok.test(lo) && Math.abs(+la) <= 90 && Math.abs(+lo) <= 180)) e.coords = 'Enter a valid latitude (−90 to 90) and longitude (−180 to 180)';
  }
  return e;
}

function geoSave(h: ConsoleHost) {
  const f = h.state.geoForm;
  if (!f) return;
  const er = geoErrs(h, f);
  if (er.name || er.pin || er.coords) {
    h.setState({geoForm: {...f, tried: true}});
    return;
  }
  const name = f.name.trim(), te = (f.te || '').trim();
  const base: {name_en: string; name_te: string; lgd_code: string | null; is_active?: boolean} = {name_en: name, name_te: te, lgd_code: (f.lgd || '').trim() || null};
  if (f.id && f.active !== f.wasActive) base.is_active = f.active;
  let req: Promise<unknown>;
  if (f.kind === 'district') req = f.id ? h.api.patch('/geo/districts/' + f.id + '/', base) : h.api.post('/geo/districts/', {...base, state_id: h.state.stateRow && h.state.stateRow.id});
  else if (f.kind === 'mandal') req = f.id ? h.api.patch('/geo/mandals/' + f.id + '/', base) : h.api.post('/geo/mandals/', {...base, district_id: f.parentId});
  else {
    const v: typeof base & {pin_code: string; latitude?: string; longitude?: string} = {...base, pin_code: f.pin || ''};
    if (String(f.lat).trim()) v.latitude = String(f.lat).trim();
    if (String(f.lng).trim()) v.longitude = String(f.lng).trim();
    req = f.id ? h.api.patch('/geo/villages/' + f.id + '/', v) : h.api.post('/geo/villages/', {...v, mandal_id: f.parentId});
  }
  req.then(() => {
    const ex = {...h.state.expanded};
    if (f.parentKey) ex[f.parentKey] = true;
    h.setState({geoForm: null, expanded: ex});
    h.toast((f.id ? 'Updated ' : 'Added ') + f.kind + ' · ' + name);
    h.loadGeo();
  }).catch((e: unknown) => h.fail(e));
}

function geoDeact(h: ConsoleHost, node: {id: number; name: string; active: boolean; kind: GeoKind}) {
  const next = !node.active;
  const path = {district: 'districts', mandal: 'mandals', village: 'villages'}[node.kind];
  h.ask({title: (next ? 'Reactivate ' : 'Deactivate ') + node.kind, body: (next ? 'Reactivate ' : 'Deactivate ') + node.name + '? ' + (next ? 'It becomes selectable again for users and posts.' : 'Existing posts stay visible; no new users or posts can be assigned here' + (node.kind !== 'village' ? ', including all areas under it.' : '.')), confirmLabel: next ? 'Reactivate' : 'Deactivate', bg: next ? '#1F8A3B' : '#b3261e',
    onConfirm: () => h.api.patch('/geo/' + path + '/' + node.id + '/', {is_active: next}).then(() => {
      h.toast(node.name + (next ? ' reactivated' : ' deactivated'), next ? '#6cc04a' : '#E9791E');
      h.loadGeo();
    }).catch((e: unknown) => h.fail(e))});
}

// Villages CSV import. Big files go up in parts of ~4,000 villages (each mandal kept in one part) so no request
// reaches the server's 60 s limit; the importer is safe to repeat. Every part is checked first (dry run), the
// totals are shown, and only then is anything saved. Helpers and rules: src/console/csv-parts.ts.
// Export CSV: every district, mandal and village already loaded on this page, in exactly the columns
// Import CSV takes, so a file can be exported, corrected in Excel and imported back. UTF-8 with a BOM,
// so Excel shows the Telugu names. One row per village (the import needs a village on every row).
function exportGeo(h: ConsoleHost) {
  const st = h.state.stateRow;
  const cols = ['state', 'state_te', 'district', 'district_te', 'mandal', 'mandal_te', 'village', 'village_te', 'latitude', 'longitude', 'pin_code', 'district_lgd_code', 'mandal_lgd_code', 'village_lgd_code'];
  const lines = [cols.join(',')];
  let empty = 0;
  for (const d of h.state.geo) {
    for (const m of d.mandals) {
      if (!m.villages.length) empty++;
      for (const v of m.villages) {
        lines.push([st ? st.name_en : 'Andhra Pradesh', st ? st.name_te : '', d.name, d.te, m.name, m.te, v.name, v.te, v.lat, v.lng, v.pin, d.lgd, m.lgd, v.lgd].map(csvCell).join(','));
      }
    }
  }
  if (lines.length === 1) {
    h.toast('No villages to export yet.', '#E9791E');
    return;
  }
  const stamp = new Date().toISOString().slice(0, 10);
  saveFile(new Blob(['﻿' + lines.join('\r\n') + '\r\n'], {type: 'text/csv;charset=utf-8'}), 'grama-geography-' + stamp + '.csv');
  h.toast('Exported ' + (lines.length - 1).toLocaleString('en-IN') + ' villages' + (empty ? ' · ' + empty + ' mandal' + (empty === 1 ? '' : 's') + ' without villages left out' : ''));
}

function importCsv(h: ConsoleHost) {
  pickFile('.csv,text/csv', (file) => importParts(h, file));
}

async function importParts(h: ConsoleHost, file: File) {
  const info = (title: string, body: string) => h.ask({title, body, confirmLabel: 'Close', bg: '#3b4a5c', noCancel: true, onConfirm: () => {}});
  // A huge file would freeze the tab while it is read; every village of the state fits in a few MB.
  if (file.size > GEO_CSV_MAX_MB * 1024 * 1024) {
    info('This file cannot be imported', 'The file is larger than ' + GEO_CSV_MAX_MB + ' MB. Check that it is the villages list, or split it into smaller files.');
    return;
  }
  const text = decodeUtf8(await file.arrayBuffer());
  if (text === null) {
    info('Save the file as UTF-8', 'This file is not saved as UTF-8, so Telugu names would be lost. In Excel choose File › Save As › "CSV UTF-8 (Comma delimited)" and import that file.');
    return;
  }
  const plan = planParts(text);
  if ('error' in plan) {
    info('This file cannot be imported', plan.error);
    return;
  }
  const n = plan.parts.length;
  const send = (part: CsvPart, dry: boolean) => {
    const fd = new FormData();
    fd.append('file', new Blob([part.text], {type: 'text/csv'}), file.name);
    return h.api.upload<GeoImportResult>('/geo/villages/import/', fd, dry ? {dry_run: 1} : undefined);
  };
  const step = (phase: string, done: number) => h.setState({imp: {phase, done, total: n, name: file.name}});
  // 1. check every part; nothing is saved
  const sum = {created: 0, updated: 0, unchanged: 0, noXY: 0, warn: 0};
  const errors: string[] = [];
  for (let i = 0; i < n; i++) {
    step('Checking', i);
    try {
      const r = await send(plan.parts[i], true);
      const v = (r.counts || {}).village || {};
      sum.created += v.created || 0;
      sum.updated += v.updated || 0;
      sum.unchanged += v.unchanged || 0;
      sum.noXY += r.missing_coordinates_count || 0;
      sum.warn += (r.warnings || []).length;
    } catch (e) {
      const rep = reportErrors(e);
      if (rep.length) {
        errors.push(...rep.map((m) => fileLine(String(m), plan.parts[i])));
      } else {
        h.setState({imp: null});
        h.fail(e);
        return;
      }
    }
  }
  h.setState({imp: null});
  if (errors.length) {
    info('File has errors · nothing imported', errors.slice(0, 6).join(' · ') + (errors.length > 6 ? ' · and ' + (errors.length - 6) + ' more.' : '') + ' Fix them in the file and import it again.');
    return;
  }
  const body = plan.rows.toLocaleString('en-IN') + ' villages in ' + plan.districts + ' district' + (plan.districts === 1 ? '' : 's') + ' and ' + plan.mandals + ' mandal' + (plan.mandals === 1 ? '' : 's') + ' checked. Villages: ' + sum.created.toLocaleString('en-IN') + ' new, ' + sum.updated + ' updated, ' + sum.unchanged.toLocaleString('en-IN') + ' unchanged.' + (sum.noXY ? ' ' + sum.noXY + ' without coordinates.' : '') + (sum.warn ? ' ' + sum.warn + ' warning(s).' : '') + (n > 1 ? ' It is imported in ' + n + ' parts.' : '');
  h.ask({title: 'Import villages', body, confirmLabel: 'Import', bg: '#0D3B7A', onConfirm: async () => {
    // 2. import part by part
    let last: GeoImportResult | null = null;
    for (let i = 0; i < n; i++) {
      step('Importing', i);
      try {
        last = await send(plan.parts[i], false);
      } catch (e) {
        h.setState({imp: null});
        if (isStatus(e, 401)) return h.fail(e);
        h.loadGeo();
        info('Import stopped at part ' + (i + 1) + ' of ' + n, (i ? 'Parts 1' + (i > 1 ? '–' + i : '') + ' are saved. ' : '') + 'Nothing in part ' + (i + 1) + ' was saved (' + ((e instanceof Error && e.message) || 'the server did not answer') + '). Importing the same file again is safe: villages already there stay as they are.');
        return;
      }
    }
    h.setState({imp: null});
    h.loadGeo();
    // Villages without coordinates in the whole database: "Use my location" can never find them.
    const noXY = (last && last.missing_coordinates_total) || 0;
    if (noXY) info('Imported ' + plan.rows.toLocaleString('en-IN') + ' villages', noXY.toLocaleString('en-IN') + ' village' + (noXY === 1 ? '' : 's') + ' in the database still ' + (noXY === 1 ? 'has' : 'have') + ' no latitude and longitude, so "Use my location" can never find ' + (noXY === 1 ? 'it' : 'them') + '. Citizens there must choose their village by hand. Fill in the coordinates and import the file again.');
    else h.toast('Imported ' + plan.rows.toLocaleString('en-IN') + ' villages');
  }});
}

/** The page's and the form's renderVals() values (screens/Geography.tsx). */
export function geographyView(h: ConsoleHost) {
  const s = h.state;
  const tag: Readonly<Record<GeoKind, readonly [string, string]>> = {district: ['#e3f0fb', '#0D3B7A'], mandal: ['#dff3f5', '#07818e'], village: ['#e4f4df', '#1d7a33']};
  const treeRow = (node: GeoNode, kind: GeoKind, depth: number, parentId: number | null, parentName: string | null, parentKey: string | null, meta: string, key: string, open: boolean) => {
    const hasKids = kind !== 'village';
    const sel = s.geoForm && s.geoForm.id === node.id && s.geoForm.kind === kind;
    return {kind, name: node.name, te: node.te && node.te !== node.name ? node.te : '', indent: (8 + depth * 28) + 'px', rowBg: sel ? '#f0f6fd' : 'transparent', opacity: node.active ? 1 : .55, toggleVis: hasKids ? 'visible' : 'hidden', chev: open ? 'M6 9l6 6 6-6' : 'M9 6l6 6-6 6', open: hasKids ? open : undefined, toggleLabel: (open ? 'Collapse ' : 'Expand ') + node.name,
      tagBg: tag[kind][0], tagColor: tag[kind][1], inactive: !node.active, meta, canAdd: hasKids, childKind: kind === 'district' ? 'Mandal' : 'Village',
      toggle: () => h.setState((st) => ({expanded: {...st.expanded, [key]: !st.expanded[key]}})),
      select: () => h.setState({geoForm: {kind, id: node.id, parentId, parentName, parentKey, parent: parentName || (s.stateRow ? s.stateRow.name_en : 'Andhra Pradesh'), name: node.name, te: node.te || '', lgd: node.lgd || '', lat: node.lat || '', lng: node.lng || '', pin: node.pin || '', active: node.active, wasActive: node.active, isVillage: kind === 'village'}}),
      add: () => h.setState({geoForm: {kind: kind === 'district' ? 'mandal' : 'village', id: null, parentId: node.id, parentName: node.name, parentKey: key, parent: node.name, name: '', te: '', lgd: '', lat: '', lng: '', pin: '', active: true, isVillage: kind === 'mandal'}}),
      deact: () => geoDeact(h, {...node, kind}), deactLabel: node.active ? 'Deactivate' : 'Reactivate', deactColor: node.active ? '#b3261e' : '#1d7a33'};
  };
  const tree: ReturnType<typeof treeRow>[] = [];
  const walk = (node: GeoNode, kind: GeoKind, depth: number, parentId: number | null, parentName: string | null, parentKey: string | null, meta: string) => {
    const key = (kind === 'district' ? '' : kind === 'mandal' ? 'm' : 'v') + node.id;
    const open = !!s.expanded[key];
    tree.push(treeRow(node, kind, depth, parentId, parentName, parentKey, meta, key, open));
    if (kind === 'village' || !open) return;
    if (node.mandals) node.mandals.forEach((k) => walk(k, 'mandal', depth + 1, node.id, node.name, key, k.villages.length + ' villages'));
    else if (node.villages) node.villages.forEach((k) => walk(k, 'village', depth + 1, node.id, node.name, key, k.lat ? Number(k.lat).toFixed(4) + ', ' + Number(k.lng).toFixed(4) : ''));
  };
  // Search: every match with the path above it (district > mandal), opened, matches highlighted.
  // English names ignore case, spaces and dots; Telugu names and LGD codes match as typed.
  const gq = s.geoQ.trim();
  const gqEn = gq.toLowerCase().replace(/[^a-z0-9]/g, '');
  const hit = (n: GeoNode) => !!gq && ((gqEn.length > 0 && n.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(gqEn)) || (!!n.te && n.te.includes(gq)) || (/^\d+$/.test(gq) && n.lgd === gq));
  const VILLAGE_CAP = 300;
  let geoFound = {districts: 0, mandals: 0, villages: 0, shown: 0};
  if (!gq) {
    s.geo.forEach((d) => walk(d, 'district', 0, null, null, null, d.mandals.length + ' mandals'));
  } else {
    const vMeta = (k: GeoNode) => (k.lat ? Number(k.lat).toFixed(4) + ', ' + Number(k.lng).toFixed(4) : '');
    const mark = (row: ReturnType<typeof treeRow>, on: boolean) => (on ? {...row, rowBg: row.rowBg === 'transparent' ? '#fff8db' : row.rowBg, match: true} : row);
    for (const d of s.geo) {
      const dHit = hit(d);
      const ms = d.mandals.map((m) => ({m, mHit: hit(m), vs: m.villages.filter(hit)})).filter((x) => x.mHit || x.vs.length);
      if (!dHit && !ms.length) continue;
      if (dHit) geoFound.districts++;
      const dKey = '' + d.id;
      // A matching district without matching places below stays closed until you open it; then it shows everything.
      if (!ms.length) {
        walk(d, 'district', 0, null, null, null, d.mandals.length + ' mandals');
        const at = tree.findIndex((r) => r.kind === 'district' && r.name === d.name);
        if (at >= 0) tree[at] = mark(tree[at], true);
        continue;
      }
      tree.push(mark(treeRow(d, 'district', 0, null, null, null, d.mandals.length + ' mandals', dKey, true), dHit));
      for (const {m, mHit, vs} of ms) {
        if (mHit) geoFound.mandals++;
        geoFound.villages += vs.length;
        const mKey = 'm' + m.id;
        const showAll = !vs.length && !!s.expanded[mKey];
        tree.push(mark(treeRow(m, 'mandal', 1, d.id, d.name, dKey, m.villages.length + ' villages', mKey, vs.length > 0 || showAll), mHit));
        for (const k of showAll ? m.villages : vs) {
          if (geoFound.shown >= VILLAGE_CAP) break;
          geoFound.shown++;
          tree.push(mark(treeRow(k, 'village', 2, m.id, m.name, mKey, vMeta(k), 'v' + k.id, false), !showAll));
        }
      }
    }
  }
  const geoSearch = gq ? {
    on: true,
    summary: geoFound.districts + geoFound.mandals + geoFound.villages === 0 ? '' : [
      geoFound.districts ? geoFound.districts + (geoFound.districts === 1 ? ' district' : ' districts') : '',
      geoFound.mandals ? geoFound.mandals + (geoFound.mandals === 1 ? ' mandal' : ' mandals') : '',
      geoFound.villages ? geoFound.villages + (geoFound.villages === 1 ? ' village' : ' villages') : '',
    ].filter(Boolean).join(' · ') + (geoFound.districts + geoFound.mandals + geoFound.villages === 1 ? ' matches' : ' match'),
    more: geoFound.villages > geoFound.shown ? 'Showing the first ' + geoFound.shown + ' villages. Type more of the name to narrow the list.' : '',
    empty: geoFound.districts + geoFound.mandals + geoFound.villages === 0 ? 'No district, mandal or village matches “' + gq + '”. Check the spelling, or try the Telugu name or the LGD code.' : '',
  } : {on: false, summary: '', more: '', empty: ''};
  const gf = s.geoForm;
  const geoErr: Partial<GeoErrs> = gf && gf.tried ? geoErrs(h, gf) : {};
  const geoActive = gf && gf.id ? {on: gf.active, swBg: gf.active ? '#1F8A3B' : '#cfd8e3', swLeft: gf.active ? '21px' : '3px', bg: gf.active ? '#e4f4df' : '#f3f5f8',
    sub: gf.isVillage ? (gf.active ? 'Citizens can choose this village and see its posts.' : 'Hidden from citizens. Its users and posts are kept.') : (gf.active ? 'New users and posts can be added here.' : 'Hidden with every area below it. Existing posts stay visible.')} : null;
  const geoForm: Partial<GeoForm> = gf || {};
  const geoCoordsOk = !!gf && gf.isVillage && !geoErrs(h, {...gf, id: gf.id || 1}).coords && !!String(gf.lat || '').trim();
  return {
    tree, geoQ: s.geoQ, geoSearch, onGeoQ: (e: FieldChange) => h.setState({geoQ: e.target.value}), clearGeoQ: () => h.setState({geoQ: ''}),
    exportGeo: () => exportGeo(h),
    addDistrict: () => h.setState({geoForm: {kind: 'district', id: null, parentId: null, parentName: null, parent: s.stateRow ? s.stateRow.name_en : 'Andhra Pradesh', name: '', te: '', lgd: '', lat: '', lng: '', pin: '', isVillage: false}}), importCsv: () => importCsv(h),
    geoForm, geoFormShow: !!gf, geoFormEmpty: !gf, geoFormTitle: gf ? ((gf.id ? 'Edit ' : 'Add ') + gf.kind) : 'Details', geoSaveLabel: gf && gf.id ? 'Save changes' : 'Add', geoNamePh: gf ? {district: 'e.g. Bapatla', mandal: 'e.g. Ponnur', village: 'e.g. Kothapalem'}[gf.kind] : '',
    cannotSaveGeo: false, saveGeoOpacity: 1, geoErr, geoCoordsRequired: !!(gf && gf.isVillage && !gf.id), onGeoWhere: (e: FieldChange) => onGeoWhere(h, e.target.value),
    geoWhereNote: gf && gf.where ? (parseCoords(gf.where) ? 'Latitude and longitude filled from what you pasted.' : /goo\.gl|maps\.app/.test(gf.where) ? 'Short links cannot be read here. Open the link, then copy the numbers shown (e.g. 16.2345, 80.4567).' : 'Paste numbers like 16.2345, 80.4567 or a full map link.') : '',
    geoWhereOk: !!(gf && gf.where && parseCoords(gf.where)), geoManual: !!(gf && gf.manual), toggleGeoManual: () => h.setState((st) => st.geoForm ? {geoForm: {...st.geoForm, manual: !st.geoForm.manual}} : null),
    geoFindUrl: gf && gf.name.trim() ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(geoPlace(h, gf)) : '', geoHasCoords: geoCoordsOk, geoCoordsText: gf ? String(gf.lat || '').trim() + ', ' + String(gf.lng || '').trim() : '',
    geoViewUrl: gf && geoCoordsOk ? 'https://www.google.com/maps/search/?api=1&query=' + String(gf.lat).trim() + ',' + String(gf.lng).trim() : '',
    geoActive, toggleGeoActive: () => h.setState((st) => st.geoForm ? {geoForm: {...st.geoForm, active: !st.geoForm.active}} : null),
    onGeoField: (e: FieldChange) => {
      const {name, value} = e.target;
      if (name === 'name') h.suggestTe('geoForm', value);
      h.setState((st) => st.geoForm ? {geoForm: {...st.geoForm, [name]: value}} : null);
    },
    saveGeo: () => geoSave(h), cancelGeo: () => h.setState({geoForm: null}),
  };
}
