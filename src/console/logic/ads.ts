// Sponsored banners page (sidebar "Sponsored banners") and its form: the Super Admin's banners at the top of
// citizens' Home. Moved out of Console.tsx unchanged (audit WEB-ARCH-001).
// Calls GET/POST/PATCH/DELETE /admin/ads/ (.claude/api.md).
import { ApiError } from "../api";
import type { Ad, ListOrPage } from "../types";
import { imageWidth, isStatus, pickFile, rows, type AdErrors, type AdForm, type AdStatus, type FieldChange, type Tone } from "../model";
import type { ConsoleHost } from "./host";

// Home banner ads (docs/api-contract.md section 17): status worked out from the dates and the switch.
const AD_STATUS: Readonly<Record<AdStatus, Tone>> = {live:{label:'Running',bg:'#e4f4df',color:'#1d7a33'},scheduled:{label:'Scheduled',bg:'#e6eef8',color:'#0D3B7A'},paused:{label:'Paused',bg:'#fff0dc',color:'#b35a0e'},ended:{label:'Ended',bg:'#f1f3f6',color:'#6b7a8c'}};
// Smallest banner picture the server accepts (ADS_MIN_WIDTH_PX).
const AD_MIN_WIDTH_PX = 800;
// Banner videos: any length, at most this big. The server (ADS_VIDEO_MAX_MB) and the app (kAdVideoMaxMb)
// have the same number: change them together.
const AD_VIDEO_MAX_MB = 60;

export function loadAds(h: ConsoleHost) {
  h.setState({adsLoading: true});
  if (!h.state.geo.length) h.loadGeo();
  h.api.get<ListOrPage<Ad>>('/admin/ads/', {page_size: 100})
    .then((d) => h.setState({ads: rows(d), adsLoading: false, adsUnavailable: false}))
    .catch((e: unknown) => {
      h.setState({adsLoading: false, ads: [], adsUnavailable: isStatus(e, 404)});
      if (!isStatus(e, 404)) h.fail(e);
    });
}

function today() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function adStatus(a: Ad): AdStatus {
  const t = today();
  if (a.ends_on && a.ends_on < t) return 'ended';
  if (!a.is_active) return 'paused';
  if (a.starts_on && a.starts_on > t) return 'scheduled';
  return 'live';
}

function dayLabel(x: string | null) {
  return x ? new Date(x + 'T00:00:00').toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'}) : '';
}

// An ad's area as the form's three picks (ids as strings; '' = all); STATE = every village.
function adArea(h: ConsoleHost, a: Ad['area']) {
  const none = {d: '', m: '', v: ''};
  if (!a || a.level === 'STATE') return none;
  for (const d of h.state.geo) {
    if (a.level === 'DISTRICT' && d.id === a.id) return {d: String(d.id), m: '', v: ''};
    for (const m of d.mandals) {
      if (a.level === 'MANDAL' && m.id === a.id) return {d: String(d.id), m: String(m.id), v: ''};
      for (const v of m.villages) if (a.level === 'VILLAGE' && v.id === a.id) return {d: String(d.id), m: String(m.id), v: String(v.id)};
    }
  }
  return none;
}

function openAd(h: ConsoleHost, a: Ad | null) {
  const media = {vfile: null, vchecking: false, verr: '', file: null};
  // A video ad's image is its poster, not a picture to keep: switching it to a picture asks for one.
  h.setState({af: a
    ? {id: a.id, title: a.title, link: a.link || '', ...media, kind: a.video ? 'video' : 'image', preview: a.video ? '' : a.image, vpreview: a.video || '', poster: a.video ? a.image : '', dur: a.duration_s || 0, ...adArea(h, a.area), start: a.starts_on || '', end: a.ends_on || '', active: !!a.is_active, tried: false, saving: false}
    : {id: null, title: '', link: '', ...media, kind: 'image', preview: '', vpreview: '', poster: '', dur: 0, d: '', m: '', v: '', start: today(), end: '', active: true, tried: false, saving: false}});
  // A village banner: which mandal holds the village is known only once villages are loaded. Load them (once)
  // and fill the District / Mandal / Village menus, if this banner is still open.
  // A mandal banner: its optional Village menu lists that mandal's villages.
  if (a && a.area && a.area.level === 'MANDAL') void h.loadVillages(a.area.id);
  if (a && a.area && a.area.level === 'VILLAGE' && !adArea(h, a.area).v) {
    void h.loadAllVillages().then(() => h.setState((st) => st.af && st.af.id === a.id ? {af: {...st.af, ...adArea(h, a.area)}} : null));
  }
}

export function adErrors(f: AdForm) {
  const e: AdErrors = {};
  if (!f.title.trim()) e.title = 'Give the banner a name.';
  if (f.kind === 'image' ? !f.preview : !f.vpreview) e.image = 'Choose a picture or video for the banner.';
  const l = f.link.trim();
  // https only, as the server (audit WEB-SEC-010): a plain http:// page can be changed on its way to the citizen.
  if (l && !/^https:\/\/[^\s/]+\.[^\s]+$/i.test(l)) e.link = 'Enter a full link starting with https://';
  if (f.start && f.end && f.end < f.start) e.end = 'The end date must be on or after the start date.';
  return e;
}

// One picker for both: a picture is used as it is, a video is checked for size and length first.
function pickAdMedia(h: ConsoleHost) {
  pickFile('image/jpeg,image/png,image/webp,video/mp4,video/quicktime', (file) => {
    const setF = (p: Partial<AdForm>) => h.setState((st) => ({af: st.af && {...st.af, ...p}}));
    if (file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) return setF({verr: 'The picture is larger than 5 MB.'});
      // The server refuses a picture narrower than ADS_MIN_WIDTH_PX: say so before the upload, not after it.
      imageWidth(file).then((w) => {
        if (w && w < AD_MIN_WIDTH_PX) setF({verr: 'The picture must be at least ' + AD_MIN_WIDTH_PX + ' pixels wide.'});
        else setF({kind: 'image', file, preview: URL.createObjectURL(file), verr: ''});
      });
      return;
    }
    if (!file.type.startsWith('video/')) return setF({verr: 'Choose a picture (JPG, PNG) or a video (MP4, MOV).'});
    if (file.size > AD_VIDEO_MAX_MB * 1024 * 1024) return setF({verr: 'The video is larger than ' + AD_VIDEO_MAX_MB + ' MB.'});
    // Read its length from the file before accepting it.
    const url = URL.createObjectURL(file);
    const probe = document.createElement('video');
    probe.preload = 'metadata';
    setF({vchecking: true, verr: ''});
    probe.onloadedmetadata = () => {
      const secs = probe.duration;
      if (!isFinite(secs) || secs <= 0) {
        URL.revokeObjectURL(url);
        setF({vchecking: false, verr: 'This video could not be read. Try an MP4 file.'});
      } else setF({kind: 'video', vchecking: false, vfile: file, vpreview: url, poster: '', dur: Math.round(secs)});
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      setF({vchecking: false, verr: 'This video could not be read. Try an MP4 file.'});
    };
    probe.src = url;
  });
}

function saveAd(h: ConsoleHost) {
  const f = h.state.af;
  if (!f || f.saving) return;
  if (Object.keys(adErrors(f)).length) {
    h.setState({af: {...f, tried: true}});
    return;
  }
  const st = h.state.stateRow;
  const area = f.v ? ['VILLAGE', f.v] : f.m ? ['MANDAL', f.m] : f.d ? ['DISTRICT', f.d] : ['STATE', st && st.id];
  const fields = {title: f.title.trim(), link: f.link.trim(), area_level: String(area[0]), area_id: String(area[1]), starts_on: f.start || '', ends_on: f.end || '', is_active: String(f.active)};
  // A new video replaces the picture (the server cuts its poster); a new picture replaces the video.
  const vfile = f.kind === 'video' ? f.vfile : null, file = f.kind === 'image' ? f.file : null;
  let req: Promise<unknown>;
  if (vfile || file) {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    if (vfile) {
      fd.append('video', vfile);
      fd.append('duration_s', String(Math.min(f.dur, 32767))); // the server's top
    } else if (file) fd.append('image', file);
    req = f.id ? h.api.upload('/admin/ads/' + f.id + '/', fd, undefined, 'PATCH') : h.api.upload('/admin/ads/', fd);
  } else req = h.api.patch('/admin/ads/' + f.id + '/', {...fields, area_id: Number(area[1]), starts_on: f.start || null, ends_on: f.end || null, is_active: f.active});
  const stay = () => h.setState((x) => ({af: x.af && {...x.af, saving: false}}));
  h.setState({af: {...f, saving: true}});
  req.then(() => {
    h.setState({af: null});
    h.toast((f.id ? 'Banner saved · ' : 'Banner published · ') + fields.title);
    loadAds(h);
  }).catch((e: unknown) => {
    stay();
    // Only a video upload gets these messages; a picture's errors come from the server as they are.
    const c = vfile && e instanceof ApiError ? e.code : undefined;
    const msg = c === 'unsupported_media' ? 'Use an MP4 or MOV video.'
      : c === 'file_too_large' || (vfile && e instanceof ApiError && e.status === 413) ? 'The video is larger than ' + AD_VIDEO_MAX_MB + ' MB.' : '';
    if (msg) {
      h.setState((x) => ({af: x.af && {...x.af, verr: msg}}));
      h.toast(msg, '#b3261e');
    } else h.fail(e);
  });
}

function toggleAd(h: ConsoleHost, a: Ad) {
  h.api.patch('/admin/ads/' + a.id + '/', {is_active: !a.is_active}).then(() => {
    h.toast((a.is_active ? 'Banner paused · ' : 'Banner showing · ') + a.title);
    loadAds(h);
  }).catch((e: unknown) => h.fail(e));
}

function deleteAd(h: ConsoleHost, a: Ad) {
  h.ask({title: 'Delete this banner?', body: '"' + a.title + '" is removed from every Home page. This cannot be undone.', confirmLabel: 'Delete', bg: '#b3261e', onConfirm: () => h.api.del('/admin/ads/' + a.id + '/').then(() => {
    h.setState({af: null});
    h.toast('Banner deleted · ' + a.title);
    loadAds(h);
  }).catch((e: unknown) => h.fail(e))});
}

// Running first, then what starts later, then paused and ended ones.
const AD_ORDER: readonly AdStatus[] = ['live', 'scheduled', 'paused', 'ended'];

// "17 Nov 2026 – 30 Nov 2026", "From 17 Nov 2026 · no end date", "Until 30 Nov 2026".
function adDates(a: Ad) {
  const from = dayLabel(a.starts_on), to = dayLabel(a.ends_on);
  if (from && to) return from + ' – ' + to;
  if (to) return 'Until ' + to;
  return (from ? 'From ' + from + ' · ' : '') + 'no end date';
}

/** The page's renderVals() values (screens/Ads.tsx). */
export function adsView(h: ConsoleHost) {
  const s = h.state;
  const withStatus = s.ads.map((a) => ({a, k: adStatus(a)})).sort((x, y) => AD_ORDER.indexOf(x.k) - AD_ORDER.indexOf(y.k));
  const shown = withStatus.filter((x) => s.adTab === 'all' || x.k === s.adTab);
  const adTabs = [{id: 'all', label: 'All', count: s.ads.length}, ...AD_ORDER.map((k) => ({id: k, label: AD_STATUS[k].label, count: withStatus.filter((x) => x.k === k).length}))]
    .map((t) => ({...t, on: s.adTab === t.id, go: () => h.setState({adTab: t.id})}));
  const tabName = s.adTab === 'all' ? '' : AD_STATUS[s.adTab as AdStatus].label.toLowerCase() + ' ';
  return {
    newAd: () => openAd(h, null), adTabs, adsEmpty: !shown.length, adsUnavailable: s.adsUnavailable,
    adsEmptyText: s.adsLoading ? 'Loading…' : s.adsUnavailable ? 'Banners will show here once the server is updated' : s.ads.length ? 'No ' + tabName + 'banners' : 'No banners yet',
    // Where banners show, only when there are none at all.
    adsEmptyHint: s.adsLoading || s.adsUnavailable || s.ads.length ? '' : "Banners show at the top of citizens' Home, in their area and on their dates.",
    adSel: h.selView('adSel', shown.map((x) => x.a.id), (n) => ({title: 'Delete ' + n + ' banner' + (n === 1 ? '' : 's') + '?', body: 'They are removed from every Home page. This cannot be undone.', confirm: 'Delete ' + n, url: (id) => '/admin/ads/' + id + '/', done: () => loadAds(h)})),
    adRows: shown.map(({a, k}) => {
      const S = AD_STATUS[k];
      const ar = a.area;
      return {rowKey: String(a.id), sel: s.adSel.includes(a.id), toggleSel: () => h.toggleSel('adSel', a.id), title: a.title, image: a.image, isVideo: !!a.video,
        // A frame one second in: the server's poster is a plain grey placeholder while it has no ffmpeg.
        frame: a.video ? a.video + '#t=1' : '', area: !ar || ar.level === 'STATE' ? 'Every village' : ar.name + ' ' + ar.level.toLowerCase(),
        dates: adDates(a), status: S.label, sbg: S.bg, scolor: S.color, dim: k === 'live' ? 1 : .55, canToggle: k !== 'ended', on: !!a.is_active, toggle: () => toggleAd(h, a), open: () => openAd(h, a)};
    }),
  };
}

/** The New ad / Edit ad form's renderVals() values (panels/AdForm.tsx). */
export function adFormView(h: ConsoleHost) {
  const s = h.state;
  const af = s.af;
  return {
    afShow: !!af, closeAF: () => { if (!h.state.af?.saving) h.setState({af: null}); }, pickAdMedia: () => pickAdMedia(h), saveAF: () => saveAd(h),
    onAF: (e: FieldChange) => {
      const t = e.target;
      const name = t.name;
      const value = t instanceof HTMLInputElement && t.type === 'checkbox' ? t.checked : t.value;
      if (name === 'm' && value) void h.loadVillages(String(value)); // the Village menu lists this mandal's villages
      h.setState((x) => {
        if (!x.af) return null;
        const f = {...x.af, [name]: value};
        if (name === 'd') {
          f.m = '';
          f.v = '';
        }
        if (name === 'm') f.v = '';
        return {af: f};
      });
    },
    af: af ? (() => {
      const f = af;
      const err = f.tried ? adErrors(f) : {};
      const d = s.geo.find((x) => String(x.id) === f.d);
      const m = d && d.mandals.find((x) => String(x.id) === f.m);
      const v = m && m.villages.find((x) => String(x.id) === f.v);
      return {...f, title_: f.id ? 'Edit banner' : 'New banner', saveLabel: f.saving ? (f.vfile ? 'Uploading…' : 'Saving…') : f.id ? 'Save' : 'Publish', isEdit: !!f.id,
        del: () => {
          const ad = s.ads.find((a) => a.id === f.id);
          if (ad) deleteAd(h, ad);
        },
        // A refused file says why at once; a missing banner only after "Publish".
        errTitle: err.title || '', errImage: f.verr || err.image || '', errLink: err.link || '', errEnd: err.end || '',
        isVideo: f.kind === 'video',
        mediaHint: f.vchecking ? 'Checking the video…' : 'Wide 3:2 picture (up to 5 MB) or video (up to ' + AD_VIDEO_MAX_MB + ' MB)',
        durLabel: f.dur ? Math.floor(f.dur / 60) + ':' + String(f.dur % 60).padStart(2, '0') : '',
        toggleActive: () => h.setState((x) => x.af ? {af: {...x.af, active: !x.af.active}} : null),
        showM: !!d, showV: !!m,
        where: v ? 'Only ' + v.name + ' village' : m ? 'All villages in ' + m.name + ' mandal' : d ? 'All villages in ' + d.name + ' district' : 'Every village',
        dOpts: s.geo.filter((x) => x.active).map((x) => ({id: String(x.id), label: x.name})), mOpts: d ? d.mandals.filter((x) => x.active).map((x) => ({id: String(x.id), label: x.name})) : [], vOpts: m ? m.villages.filter((x) => x.active).map((x) => ({id: String(x.id), label: x.name})) : []};
    })() : null,
  };
}
