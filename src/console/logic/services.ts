// Services list (sidebar "Services", tab "Services list") and Bills & Recharges (sidebar "Bills & Recharges"): what
// citizens see on the app's Home, with the add/edit form. One set of code for both lists; `b` (bills) picks which.
// Moved out of Console.tsx unchanged (audit WEB-ARCH-001). Calls /admin/services/ and /admin/bills/ (.claude/api.md).
import type { CatalogItem, ListOrPage } from "../types";
import { isStatus, one, orEmpty, pickFile, rows, type CatalogSet, type FieldChange, type ServiceForm } from "../model";
import type { ConsoleHost } from "./host";

// ---- services citizens can request (mobile: Super Admin › Services; API: services-catalog-backend-plan.md) ----
// Until the server has GET /admin/services/, the page shows the app's built-in list read-only and says so.
const SVC_SEED: CatalogItem[] = [['aadhaar','Aadhaar Services','ఆధార్ సేవలు','aadhaar','orange'],['pan','PAN Services','పాన్ సేవలు','id_badge','blue'],['voter_id','Voter ID','ఓటర్ ఐడి','eci','green'],['certificates','Certificates','ధ్రువపత్రాలు','certificate','purple'],['loans_insurance','Loans & Insurance','రుణాలు & బీమా','loan','teal'],['govt_schemes','Govt Schemes','ప్రభుత్వ పథకాలు','scheme','orange'],['land_records','Land Records','భూ రికార్డులు','land','purple'],['farmer','Farmer Services','రైతు సేవలు','farmer','green']].map(([key,name_en,name_te,icon,color])=>({key,name_en,name_te,icon,color,is_active:true}));
const SVC_COLORS: Readonly<Record<string, readonly [string, string, string]>> = {orange:['#B35A0E','#FFF0DC','Orange'],blue:['#1A75C4','#E3F0FB','Blue'],green:['#1D7A33','#E4F4DF','Green'],purple:['#8F4BB4','#F1E6F7','Purple'],teal:['#07818E','#DFF3F5','Teal']};
const SVC_ICONS: Readonly<Record<string, string>> = {aadhaar:'img:/assets/logo-aadhaar.svg',eci:'img:/assets/logo-eci.svg',id_badge:'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM9 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5.5 16.5c.6-1.8 2-2.7 3.5-2.7s2.9.9 3.5 2.7M14.5 9.5h4M14.5 13h3',
  card:'M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM2 10h20M6 15h4',certificate:'M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM8.5 13 7 21l5-3 5 3-1.5-8',document:'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4',
  scheme:'M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10M2 10l10-6 10 6z',loan:'M11 14h2a2 2 0 0 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16M7 20l1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.8-2.8L14.6 13M2 15l6 6',land:'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
  farmer:'M7 20h10M10 20c5.5-2.5.8-6.4 3-10M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8zM14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z',house:'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',ration:'M5 11l3-6M19 11l-3-6M2 11h20l-2 9H4zM9 15v2M15 15v2',
  health:'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',education:'M2 9l10-5 10 5-10 5zM6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5M22 9v6',pension:'M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM10 22l1-7 3 3v4M11 15l-1-4 4-1 2 3M17 13v9',women:'M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 15v7M9 19h6',
  job:'M4 7h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18',water:'M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z',power:'M13 2 4 14h7l-1 8 9-12h-7z',police:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9.5 11.5l1.8 1.8 3.4-3.6',
  help:'M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z',services:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-1.7-1L14.8 3H9.2l-.4 2.6a7.5 7.5 0 0 0-1.7 1l-2.4-1-2 3.4L4.7 11a7.4 7.4 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 1.7 1l.4 2.6h5.6l.4-2.6a7.5 7.5 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1z'};
// ---- bills & recharges on Home (mobile: Super Admin › More › Bills & Recharges; API: bills-catalog-backend-plan.md) ----
// A separate list with its own endpoints; same fields, logo upload and screens as services. Until the server has
// GET /admin/bills/, the page shows the app's built-in bills read-only.
const BILL_SEED: CatalogItem[] = [['electricity','Electricity Bill','కరెంట్ బిల్లు','power','orange'],['water_bill','Water Bill','నీటి బిల్లు','water','blue'],['mobile_recharge','Mobile Recharge','మొబైల్ రీఛార్జ్','mobile','purple'],['dth_recharge','DTH Recharge','DTH రీఛార్జ్','dth','teal'],['broadband','Broadband','బ్రాడ్‌బ్యాండ్','broadband','green']].map(([key,name_en,name_te,icon,color])=>({key,name_en,name_te,icon,color,is_active:true}));
const BILL_ICONS: Readonly<Record<string, string>> = {power:'M13 2 4 14h7l-1 8 9-12h-7z',water:'M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z',gas:'M10 2h4v3h-4zM8 5h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM6 11h12',
  mobile:'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM12 18h.01',landline:'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',
  dth:'M4 10a7.3 7.3 0 0 0 10 10zM10.5 13.5l3-3M13 7a4 4 0 0 1 4 4M13 3a8 8 0 0 1 8 8',broadband:'M5 12.55a11 11 0 0 1 14 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.1a6 6 0 0 1 6.95 0M12 20h.01',
  fastag:'M3 7h18v10H3zM7 7v10M17 11h-6M17 14h-4',credit_card:'M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM2 10h20M6 15h4',
  bill:'M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1zM16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11'};

// Where a list lives: state keys, endpoint, built-in fallback, icon set and words.
function catalogSet(b: boolean): CatalogSet {
  return b
    ? {l: 'bills', ld: 'billsLoading', un: 'billsUnavailable', path: '/admin/bills/', seed: BILL_SEED, icon: 'bill', icons: BILL_ICONS, one: 'bill', what: 'bills list'}
    : {l: 'svcs', ld: 'svcsLoading', un: 'svcsUnavailable', path: '/admin/services/', seed: SVC_SEED, icon: 'services', icons: SVC_ICONS, one: 'service', what: 'services list'};
}

export function loadServices(h: ConsoleHost, b = false) {
  const c = catalogSet(b);
  h.setState(one(c.ld, true));
  h.api.get<ListOrPage<CatalogItem>>(c.path)
    .then((d) => h.setState({...one(c.l, rows(d)), ...one(c.ld, false), ...one(c.un, false)}))
    .catch((e: unknown) => {
      const nf = isStatus(e, 404);
      h.setState({...one(c.ld, false), ...one(c.un, nf), ...one(c.l, nf ? c.seed : [])});
      if (!nf) h.fail(e);
    });
}

function openService(h: ConsoleHost, g: CatalogItem | null, b = false) {
  const c = catalogSet(b);
  if (h.state[c.un]) return;
  h.setState({sf: g
    ? {bill: b, key: g.key, en: g.name_en, te: g.name_te || '', icon: g.icon || c.icon, color: g.color || 'blue', image: g.logo || '', had: !!g.logo, file: null, active: g.is_active !== false, tried: false, saving: false, hintEn: g.hint_en || '', hintTe: g.hint_te || ''}
    : {bill: b, key: null, en: '', te: '', icon: c.icon, color: 'blue', image: '', had: false, file: null, active: true, tried: false, saving: false, hintEn: '', hintTe: ''}});
}

// The Super Admin's own logo (contract section 16: `logo`): PNG, JPG or WebP up to 2 MB.
function pickServiceIcon(h: ConsoleHost) {
  pickFile('image/png,image/jpeg,image/webp', (file) => {
    if (file.size > 2 * 1024 * 1024) {
      h.toast('The logo is larger than 2 MB', '#E9791E');
      return;
    }
    h.setState((st) => ({sf: st.sf && {...st.sf, file, image: URL.createObjectURL(file)}}));
  });
}

function svcErr(h: ConsoleHost, f: ServiceForm) {
  const c = catalogSet(f.bill), en = f.en.trim();
  if (en.length < 2) return 'Enter an English name of at least 2 letters';
  if (h.state[c.l].some((g) => g.key !== f.key && g.name_en.toLowerCase() === en.toLowerCase())) return 'A ' + c.one + ' with this name already exists';
  return '';
}

function saveService(h: ConsoleHost) {
  const f = h.state.sf;
  if (!f || f.saving) return;
  if (svcErr(h, f)) {
    h.setState({sf: {...f, tried: true}});
    return;
  }
  const c = catalogSet(f.bill), body = {name_en: f.en.trim(), name_te: f.te.trim(), icon: f.icon, color: f.color, is_active: f.active,
    ...(f.bill ? {} : {hint_en: f.hintEn.trim(), hint_te: f.hintTe.trim()})};
  h.setState({sf: {...f, saving: true}});
  const path = f.key ? c.path + f.key + '/' : c.path;
  let req: Promise<unknown>;
  if (f.file) {
    const fd = new FormData();
    Object.entries(body).forEach(([k, v]) => fd.append(k, String(v)));
    fd.append('logo', f.file);
    req = h.api.upload(path, fd, undefined, f.key ? 'PATCH' : 'POST');
  } else req = f.key ? h.api.patch(path, {...body, ...(f.had && !f.image ? {logo: null} : {})}) : h.api.post(path, body);
  req.then((x) => {
    h.setState({sf: null});
    // A server without the example yet drops it: say so rather than lose it quietly.
    if (!f.bill && (f.hintEn + f.hintTe).trim() && !(x && typeof x === 'object' && 'hint_en' in x)) h.toast('Saved. The request example needs a server update before citizens see it.', '#E9791E');
    else h.toast(f.key ? 'Changes saved' : (f.bill ? 'Bill added · ' : 'Service added · ') + body.name_en);
    loadServices(h, f.bill);
  }).catch((e: unknown) => {
    h.setState((x) => ({sf: x.sf && {...x.sf, saving: false}}));
    if (isStatus(e, 404)) {
      h.setState(one(c.un, true));
      h.toast('The ' + c.what + ' is not on the server yet.', '#E9791E');
      return;
    }
    h.fail(e);
  });
}

function toggleService(h: ConsoleHost, g: CatalogItem, b = false) {
  const c = catalogSet(b);
  if (h.state[c.un]) return;
  h.api.patch(c.path + g.key + '/', {is_active: g.is_active === false}).then(() => {
    h.toast(g.is_active === false ? (b ? 'Bill is on Home' : 'Service is on Home') : (b ? 'Bill hidden' : 'Service hidden'));
    loadServices(h, b);
  }).catch((e: unknown) => h.fail(e));
}

function moveService(h: ConsoleHost, g: CatalogItem, by: number, b = false) {
  const c = catalogSet(b), items = h.state[c.l], i = items.findIndex((x) => x.key === g.key), j = i + by;
  if (h.state[c.un] || i < 0 || j < 0 || j >= items.length) return;
  const next = [...items];
  next[i] = items[j];
  next[j] = g;
  h.setState(one(c.l, next));
  h.api.post(c.path + 'order/', {keys: next.map((x) => x.key)}).catch((e: unknown) => {
    h.setState(one(c.l, items));
    h.fail(e);
  });
}

/** The pages' and the form's renderVals() values (screens/Services.tsx, ServiceTabs.tsx; panels/ServiceForm.tsx). */
export function servicesView(h: ConsoleHost) {
  const s = h.state;
  const sf = s.sf;
  return {
    // Services page
    ...(() => {
      const b = s.page === 'bills', c = catalogSet(b), L = s[c.l];
      return {
        catShow: b || (s.svcView === 'catalog' && h.navOk('services')),
        catSub: b ? "What citizens see under Bills & Recharges on the app's Home. Only the Super Admin adds or changes them." : "The services citizens can choose from on the app's Home. Only the Super Admin adds or changes them.",
        catNew: b ? 'New bill / recharge' : 'New service',
        catUnavailText: b ? "The bills list is not on the server yet. Until it is, citizens see the built-in bills below, and changes can't be saved." : "The services list is not on the server yet. Until it is, citizens see the built-in list below, and changes can't be saved.",
        catHelp: b ? 'Use the arrows to set the order on Home. A hidden bill is not on Home.' : 'Use the arrows to set the order on Home. A hidden service is not on Home; requests already sent stay as they are.',
        svcRows: L.map((g, i) => {
          const [col, tint] = SVC_COLORS[g.color] || SVC_COLORS.blue;
          const icon = g.logo ? 'img:' + g.logo : (c.icons[g.icon] || c.icons[c.icon]);
          const on = g.is_active !== false;
          return {name: g.name_en, sub: on ? (g.name_te && g.name_te !== g.name_en ? g.name_te : 'Shown on Home') : 'Hidden', on, c: col, tint, img: icon.startsWith('img:') ? icon.slice(4) : '', d: icon.startsWith('img:') ? '' : icon,
            up: () => moveService(h, g, -1, b), down: () => moveService(h, g, 1, b), canUp: i > 0 && !s[c.un], canDown: i < L.length - 1 && !s[c.un], toggle: () => toggleService(h, g, b), open: () => openService(h, g, b), locked: s[c.un]};
        }),
        svcsUnavailable: s[c.un], svcsEmpty: !L.length, svcsEmptyText: s[c.ld] ? 'Loading…' : b ? 'No bills yet. Add one and citizens see it under Bills & Recharges.' : 'No services yet. Add one and citizens can request it from Home.',
        svcShownLabel: 'On Home: ' + L.filter((g) => g.is_active !== false).length, newService: () => openService(h, null, b),
      };
    })(),
    sfShow: !!sf, closeSF: () => h.setState({sf: null}), saveSF: () => saveService(h),
    sf: orEmpty(sf ? (() => {
      const f = sf, set = catalogSet(f.bill), [c, tint] = SVC_COLORS[f.color] || SVC_COLORS.blue, icon = f.image ? 'img:' + f.image : (set.icons[f.icon] || set.icons[set.icon]);
      return {...f, err: f.tried ? svcErr(h, f) : '', c, tint, img: icon.startsWith('img:') ? icon.slice(4) : '', d: icon.startsWith('img:') ? '' : icon, preview: f.en.trim() || (f.bill ? 'e.g. Gas Booking' : 'e.g. Ration Card'),
        title: f.bill ? (f.key ? 'Edit bill / recharge' : 'New bill / recharge') : (f.key ? 'Edit service' : 'New service'), saveLabel: f.saving ? 'Saving…' : (f.key ? 'Save' : f.bill ? 'Add bill / recharge' : 'Add service'),
        onField: (e: FieldChange) => {
          const {name, value} = e.target;
          if (name === 'en') h.suggestTe('sf', value);
          h.setState((st) => st.sf ? {sf: {...st.sf, [name]: value}} : null);
        },
        toggle: () => h.setState((st) => st.sf ? {sf: {...st.sf, active: !st.sf.active}} : null),
        icons: Object.entries(set.icons).map(([k, v]) => ({k, on: !f.image && f.icon === k, img: v.startsWith('img:') ? v.slice(4) : '', d: v.startsWith('img:') ? '' : v, pick: () => h.setState((st) => st.sf ? {sf: {...st.sf, icon: k, image: '', file: null}} : null)})),
        ownIcon: f.image, pickIcon: () => pickServiceIcon(h), removeIcon: () => h.setState((st) => st.sf ? {sf: {...st.sf, image: '', file: null}} : null),
        colors: Object.entries(SVC_COLORS).map(([k, [cc, tt, label]]) => ({label, c: cc, tint: tt, on: f.color === k, pick: () => h.setState((st) => st.sf ? {sf: {...st.sf, color: k}} : null)}))};
    })() : null),
    svcView: s.svcView, canCatalog: h.navOk('services'),
    svcTabs: ([['requests', 'Citizen requests'], ['catalog', 'Services list']] as const).map(([k, label]) => ({label, on: s.svcView === k, go: () => h.setState({svcView: k}), bg: s.svcView === k ? '#fff' : 'transparent', color: s.svcView === k ? '#0A2550' : '#6b7a8c', shadow: s.svcView === k ? '0 1px 3px rgba(10,37,80,.12)' : 'none'})),
  };
}
