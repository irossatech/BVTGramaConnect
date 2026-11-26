// Settings page (sidebar and profile menu "Settings"): review escalation hours, citizen posts per day, languages,
// post categories, notification templates, and the citizen wallet's eight settings (BVTGC-140). Moved out of Console.tsx unchanged (audit WEB-ARCH-001).
// Calls GET/PATCH /admin/settings/, /admin/categories/ and /admin/notification-templates/ (.claude/api.md).
import type * as ds from "../ds";
import { ApiError } from "../api";
import type { Category, ListOrPage, NotificationTemplate, Settings } from "../types";
import { rows, type FieldChange, type SettingsState, type WalletForm } from "../model";
import type { ConsoleHost } from "./host";
import { mandalPickLabel } from "../walletText";

// Categories the design system has an icon for; any other category shows the "updates" icon.
const CAT_ICONS: readonly ds.Category[] = ['announce', 'schemes', 'news', 'updates'];

// A New post form opened before the list arrived gets the first switched-on category now.
function setCategories(h: ConsoleHost, categories: Category[]) {
  h.setState((s) => ({categories, cf: s.cf && !s.cf.cat ? {...s.cf, cat: categories.find((c) => c.is_active)?.key || ''} : s.cf}));
}

/** The post categories for New post and the Posts filter, for every admin: the public list of switched-on categories
 *  (no permission needed, cached by the server, so fast). It never replaces the full list Settings loaded. */
export function loadCategories(h: ConsoleHost) {
  return h.api.get<{key: string; name: string}[]>('/categories/').then((d) => {
    if (h.state.categories.some((c) => c.id)) return; // the full (Settings) list is already here
    setCategories(h, (d || []).map((c) => ({id: 0, key: c.key, name: c.name, name_en: c.name, name_te: '', is_active: true})));
  }).catch((e: unknown) => h.fail(e));
}

/** Every category with its post count, switched-off ones too: the Settings page only (slower: the server counts posts). */
function loadAdminCategories(h: ConsoleHost) {
  if (!h.can('posts.manage_categories')) return Promise.resolve();
  return h.api.get<ListOrPage<Category>>('/admin/categories/').then((d) => setCategories(h, rows(d))).catch((e: unknown) => h.fail(e));
}

/** The category key from its English name: lower-case letters, digits and "_", at most 20 (the server's SlugField). */
const catKey = (en: string) => en.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 20).replace(/_+$/, '');

// Add a post category (POST /admin/categories/, contract Q6 default: the Super Admin may add categories; Jira
// BVTGC-49). It starts switched on; the app and the website list it from the server.
function addCategory(h: ConsoleHost) {
  h.ask({title: 'Add category', body: 'A new post category. It is on at once: officials can post in it, and citizens see it as its own News tab.',
    hasInput: true, noGen: true, inputLabel: 'Name in English', inputPh: 'For example Health', input2Label: 'Name in Telugu', input2Ph: 'ఉదా: ఆరోగ్యం', teFromEn: true,
    imageLabel: 'Icon',
    confirmLabel: 'Add category', bg: '#0D3B7A', onConfirm: (t, _sel, _gen, t2, icon) => {
      const en = t.trim(), te = t2.trim(), key = catKey(en);
      if (!en || !te) return h.toast('Write the name in English and in Telugu.', '#b3261e');
      if (!key) return h.toast('Write the English name in English letters.', '#b3261e');
      if (!icon) return h.toast('Upload an icon for the category.', '#b3261e');
      // Multipart with the icon (backend plan BE: category icon upload); the server answers with `icon_url`.
      const fd = new FormData();
      fd.append('key', key);
      fd.append('name_en', en);
      fd.append('name_te', te);
      fd.append('icon', icon);
      h.api.upload('/admin/categories/', fd).then(() => {
        h.toast('Category added · ' + en);
        loadAdminCategories(h);
      }).catch((e: unknown) => h.fail(e));
    }});
}

// Edit a post category (PATCH /admin/categories/{id}/, BackEnd contract section 5, 2026-11-26): the English and Telugu
// names and the icon. The key never changes, so the apps keep finding it; a new icon is optional (the current one stays).
function editCategory(h: ConsoleHost, c: Category) {
  h.ask({title: 'Edit category · ' + c.name_en, body: 'The new names show in the app, on the website and in New post. Its posts stay in this category.',
    hasInput: true, noGen: true, inputLabel: 'Name in English', inputPh: 'For example Health', preset: c.name_en, input2Label: 'Name in Telugu', input2Ph: 'ఉదా: ఆరోగ్యం', preset2: c.name_te,
    imageLabel: 'Icon', imagePreset: c.icon_url || '',
    confirmLabel: 'Save', bg: '#0D3B7A', onConfirm: (t, _sel, _gen, t2, icon) => {
      const en = t.trim(), te = t2.trim();
      if (!en || !te) return h.toast('Write the name in English and in Telugu.', '#b3261e');
      const path = '/admin/categories/' + c.id + '/';
      let saved: Promise<unknown>;
      if (icon) {
        const fd = new FormData();
        fd.append('name_en', en);
        fd.append('name_te', te);
        fd.append('icon', icon);
        saved = h.api.upload(path, fd, undefined, 'PATCH');
      } else {
        saved = h.api.patch(path, {name_en: en, name_te: te});
      }
      saved.then(() => {
        h.toast('Category saved · ' + en);
        loadAdminCategories(h);
      }).catch((e: unknown) => h.fail(e));
    }});
}

// Delete a post category added by mistake (DELETE /admin/categories/{id}/, 2026-11-26). Only a switched-off one no post
// uses: posts are kept permanently and keep their category, so the server answers 409 category_in_use otherwise.
function deleteCategory(h: ConsoleHost, c: Category) {
  const n = c.post_count || 0;
  if (n) {
    h.ask({title: 'This category has posts', body: n + ' post' + (n === 1 ? ' uses' : 's use') + ' "' + c.name_en + '", and posts are never deleted, so the category cannot be deleted. Keep it switched off: it stays hidden from citizens and from New post.', confirmLabel: 'OK', bg: '#3b4a5c', noCancel: true, onConfirm: () => {}});
    return;
  }
  h.ask({title: 'Delete "' + c.name_en + '"?', body: 'No post uses this category. It is removed from the app, the website and New post for good.', confirmLabel: 'Delete', bg: '#b3261e', onConfirm: () => h.api.del('/admin/categories/' + c.id + '/').then(() => {
    h.toast('Category deleted · ' + c.name_en, '#E9791E');
    loadAdminCategories(h);
  }).catch((e: unknown) => {
    // A server without the delete yet (BackEnd before 2026-11-26) answers 405.
    if (e instanceof ApiError && e.status === 405) h.ask({title: 'Not available yet', body: 'Deleting a category needs a server update. For now, switch the category off: citizens stop seeing it.', confirmLabel: 'OK', bg: '#3b4a5c', noCancel: true, onConfirm: () => {}});
    else h.fail(e);
    loadAdminCategories(h);
  })});
}

/** The wallet's settings as the server has them; an older server without them keeps the card hidden. */
function walletFrom(st: Settings, before: WalletForm): WalletForm {
  if (st.wallet_enabled === undefined) return before;
  return {known: true, enabled: !!st.wallet_enabled, pilot: st.wallet_pilot_mandals || [], reward: st.referral_reward_points ?? 0, welcome: st.welcome_bonus_points ?? 0,
    hold: st.referral_hold_days ?? 0, active: st.referral_active_days ?? 0, perMonth: st.referrals_per_month ?? 0, perPhone: st.welcome_bonuses_per_phone ?? 0};
}

export function loadSettings(h: ConsoleHost) {
  loadAdminCategories(h);
  h.api.get<Settings>('/admin/settings/').then((st) => h.setState((s) => ({settings: {...s.settings, escalation: st.review_escalation_hours, citizenPerDay: st.citizen_posts_per_day ?? 0, adsLimit: st.ads_banner_limit ?? 0, langs: {te: true, en: !!st.languages?.en}, wallet: walletFrom(st, s.settings.wallet), walletErr: {}}}))).catch((e: unknown) => h.fail(e));
  if (h.can('notifications.manage_templates')) h.api.get<ListOrPage<NotificationTemplate>>('/admin/notification-templates/').then((d) => {
    const templates = rows(d);
    h.setState((s) => ({settings: {...s.settings, templates}}));
  }).catch((e: unknown) => h.fail(e));
}

// ---- the citizen wallet (BVTGC-140; BackEnd contract section 21, "Settings"; mockup console.html frame 5) ----

type WalletNum = 'reward' | 'welcome' | 'hold' | 'active' | 'perMonth' | 'perPhone';
/** Each number: its form key, the server's field, its words. The ranges are the server's; its 400 shows under the field. */
const WALLET_NUMS: readonly {key: WalletNum; field: string; label: string; help: string}[] = [
  {key: 'reward', field: 'referral_reward_points', label: 'Referral reward (points)', help: 'For the citizen who invited, once confirmed. 0 to 10,000.'},
  {key: 'welcome', field: 'welcome_bonus_points', label: 'Welcome bonus (points)', help: 'For the new citizen, once confirmed. 0 to 10,000.'},
  {key: 'hold', field: 'referral_hold_days', label: 'Holding period (days)', help: 'Points wait this long before they are confirmed. 1 to 90.'},
  {key: 'active', field: 'referral_active_days', label: 'Active days needed in the holding period', help: 'Days the new citizen must open the app; at most the holding period.'},
  {key: 'perMonth', field: 'referrals_per_month', label: 'Confirmed referrals per citizen per month', help: '0 means no limit; at most 1,000.'},
  {key: 'perPhone', field: 'welcome_bonuses_per_phone', label: 'Welcome bonuses per phone', help: 'Accounts made on one phone that get the welcome bonus. 0 to 10.'},
];

/** One number of the form, typed: every WalletNum field holds a number, or '' while its box is empty. */
function numPatch(key: WalletNum, value: number | ""): Partial<WalletForm> {
  const patch: Partial<WalletForm> = {};
  patch[key] = value;
  return patch;
}

function setWallet(h: ConsoleHost, x: Partial<WalletForm>, extra: Partial<SettingsState> = {}) {
  h.setState((s) => ({settings: {...s.settings, wallet: {...s.settings.wallet, ...x}, walletErr: {}, ...extra}}));
}

/** The server refused a wallet setting (400 validation_error): its words under each field, and the toast. */
function walletRefused(h: ConsoleHost, e: unknown) {
  if (e instanceof ApiError && e.status === 400) {
    const err: Record<string, string> = {};
    for (const [k, v] of Object.entries(e.body.fields || {})) err[k] = Array.isArray(v) ? String(v[0] ?? '') : String(v);
    h.setState((s) => ({settings: {...s.settings, walletErr: err}}));
  }
  h.fail(e);
}

function saveWallet(h: ConsoleHost) {
  const w = h.state.settings.wallet;
  const missing = WALLET_NUMS.filter((n) => w[n.key] === '');
  if (missing.length) {
    h.setState((s) => ({settings: {...s.settings, walletErr: Object.fromEntries(missing.map((n) => [n.field, 'Enter a number.']))}}));
    return;
  }
  const body: Record<string, number | number[]> = {wallet_pilot_mandals: w.pilot};
  for (const n of WALLET_NUMS) body[n.field] = Number(w[n.key]) || 0;
  h.api.patch<Settings>('/admin/settings/', body).then((st) => {
    if (st) h.setState((s) => ({settings: {...s.settings, wallet: walletFrom(st, s.settings.wallet), walletErr: {}}}));
    h.toast('Wallet settings saved · phones follow within about 5 minutes');
  }).catch((e: unknown) => walletRefused(h, e));
}

/** The wallet card's renderVals() values. */
function walletSettingsView(h: ConsoleHost) {
  const s = h.state, w = s.settings.wallet, err = s.settings.walletErr;
  // The chips name a pilot mandal in English; the picker also shows its Telugu name, so its search finds either
  // (BVTGC-162: typing తెనాలి found nothing).
  const mandals = s.geo.flatMap((d) => d.mandals.map((m) => ({id: m.id, label: m.name + ' · ' + d.name, pick: mandalPickLabel(m.name, m.te, d.name)})));
  const name = (id: number) => mandals.find((m) => m.id === id)?.label || 'Mandal ' + id;
  return {
    walletShow: w.known && h.can('posts.manage_settings'),
    walletOn: w.enabled,
    toggleWallet: () => {
      const on = !w.enabled;
      h.api.patch('/admin/settings/', {wallet_enabled: on}).then(() => {
        setWallet(h, {enabled: on});
        h.toast(on ? 'Citizen wallet switched on' : 'Citizen wallet switched off', on ? '#6cc04a' : '#E9791E');
      }).catch((e: unknown) => walletRefused(h, e));
    },
    walletPilot: w.pilot.map((id) => ({label: name(id), remove: () => setWallet(h, {pilot: w.pilot.filter((x) => x !== id)})})),
    walletPilotEmpty: !w.pilot.length,
    walletPick: s.settings.walletPick,
    walletPickOpts: [{id: '', label: '+ Add mandal'}, ...mandals.filter((m) => !w.pilot.includes(m.id)).map((m) => ({id: String(m.id), label: m.pick})).sort((a, b) => a.label.localeCompare(b.label))],
    onWalletPick: (e: FieldChange) => {
      const id = Number(e.target.value);
      if (id) setWallet(h, {pilot: [...w.pilot, id]}, {walletPick: ''});
    },
    walletErrPilot: err.wallet_pilot_mandals || '',
    walletNums: WALLET_NUMS.map((n) => ({id: 'set-w-' + n.key, label: n.label, help: n.help, value: w[n.key], err: err[n.field] || '',
      onChange: (e: FieldChange) => setWallet(h, numPatch(n.key, e.target.value === '' ? '' : Math.min(100000, Number(e.target.value.replace(/[^0-9]/g, '')) || 0)))})),
    saveWallet: () => saveWallet(h),
  };
}

/** The page's renderVals() values (screens/Settings.tsx). */
export function settingsView(h: ConsoleHost) {
  const s = h.state;
  const catRows = s.categories.map((c) => ({te: c.name_te, en: c.name_en, icon: CAT_ICONS.find((k) => k === c.key) ?? 'updates', iconUrl: c.icon_url || '', count: c.post_count || 0, on: !!c.is_active, swBg: c.is_active ? '#1F8A3B' : '#cfd8e3', swLeft: c.is_active ? '21px' : '3px',
    toggle: () => h.api.patch('/admin/categories/' + c.id + '/', {is_active: !c.is_active}).then(() => {
      h.toast(c.name_en + (c.is_active ? ' disabled' : ' enabled'), c.is_active ? '#E9791E' : '#6cc04a');
      loadAdminCategories(h);
    }).catch((e: unknown) => h.fail(e)),
    // Only on the full list (Settings loads it with ids). Edit and Delete work only while the category is switched off
    // (2026-11-26; the server answers 409 switch_off_first otherwise); on, both are greyed and do nothing.
    canManage: !!c.id && h.can('posts.manage_categories'), canChange: !c.is_active,
    edit: () => editCategory(h, c), del: () => deleteCategory(h, c)}));
  // Telugu is always on (the default language): an "Always on" tag instead of a switch that only says no.
  const langRows = ([{id: 'te', name: 'తెలుగు · Telugu', sub: 'The default language'}, {id: 'en', name: 'English', sub: 'Citizens can switch to English in the app and on the website'}] as const).map((l) => {
    const on = s.settings.langs[l.id];
    return {...l, on, locked: l.id === 'te', swBg: on ? '#1F8A3B' : '#cfd8e3', swLeft: on ? '21px' : '3px', toggle: () => {
      if (l.id === 'te') {
        h.toast('Telugu is the default language and cannot be disabled', '#E9791E');
        return;
      }
      h.api.patch('/admin/settings/', {languages: {en: !on}}).then(() => {
        h.setState((st) => ({settings: {...st.settings, langs: {...st.settings.langs, en: !on}}}));
        h.toast('English ' + (on ? 'disabled' : 'enabled'));
      }).catch((e: unknown) => h.fail(e));
    }};
  });
  const CH: Readonly<Record<string, string>> = {push: 'Push'};
  const templates = s.settings.templates.map((tp) => ({name: tp.name || tp.key, channel: CH[tp.channel] || tp.channel, te: tp.text_te, en: tp.text_en, edit: () => {
    if (tp.editable === false) {
      h.toast('This notification text cannot be edited', '#E9791E');
      return;
    }
    // Both languages: the text box for English, the second field for Telugu (each person gets their own language).
    const uses = (tp.variables || []).map((v) => '{' + v + '}').join(' ');
    h.ask({title: 'Edit notification · ' + (tp.name || tp.key), body: (uses ? 'You can use: ' + uses + '. ' : '') + 'Each person gets the text in their own language.',
      needsText: true, textLabel: 'English', preset: tp.text_en, input2Label: 'Telugu', preset2: tp.text_te, confirmLabel: 'Save', bg: '#0D3B7A',
      onConfirm: (t, _sel, _gen, t2) => h.api.patch('/admin/notification-templates/' + tp.key + '/', {text_te: t2.trim() || tp.text_te, text_en: t.trim() || tp.text_en}).then(() => {
        h.toast('Saved · ' + (tp.name || tp.key));
        loadSettings(h);
      }).catch((e: unknown) => h.fail(e))});
  }}));
  return {
    ...walletSettingsView(h),
    settings: s.settings, catRows, langRows, templates, badge36: {size: 36},
    canAddCat: h.can('posts.manage_categories'), addCat: () => addCategory(h),
    onEscalation: (e: FieldChange) => h.setState((st) => ({settings: {...st.settings, escalation: Number(e.target.value) || 0}})), saveSettings: () => h.api.patch('/admin/settings/', {review_escalation_hours: s.settings.escalation}).then(() => h.toast('Settings saved · review time limit ' + s.settings.escalation + ' h')).catch((e: unknown) => h.fail(e)),
    // − and + beside the numbers, as the app's Settings: 6 hours a step (6 to 168), one post a step (0 to 1000).
    escLess: () => h.setState((st) => ({settings: {...st.settings, escalation: Math.max(6, (Number(st.settings.escalation) || 6) - 6)}})),
    escMore: () => h.setState((st) => ({settings: {...st.settings, escalation: Math.min(168, (Number(st.settings.escalation) || 0) + 6)}})),
    canEscLess: (Number(s.settings.escalation) || 0) > 6, canEscMore: (Number(s.settings.escalation) || 0) < 168,
    citLess: () => h.setState((st) => ({settings: {...st.settings, citizenPerDay: Math.max(0, (Number(st.settings.citizenPerDay) || 0) - 1)}})),
    citMore: () => h.setState((st) => ({settings: {...st.settings, citizenPerDay: Math.min(1000, (Number(st.settings.citizenPerDay) || 0) + 1)}})),
    canCitLess: (Number(s.settings.citizenPerDay) || 0) > 0, canCitMore: (Number(s.settings.citizenPerDay) || 0) < 1000,
    // Banners per village on a citizen's Home (Jira BVTGC-92): 0 = no limit, any other number = at most that many,
    // newest first. The server cuts the list; the app follows the same number.
    adsLess: () => h.setState((st) => ({settings: {...st.settings, adsLimit: Math.max(0, (Number(st.settings.adsLimit) || 0) - 1)}})),
    adsMore: () => h.setState((st) => ({settings: {...st.settings, adsLimit: Math.min(1000, (Number(st.settings.adsLimit) || 0) + 1)}})),
    canAdsLess: (Number(s.settings.adsLimit) || 0) > 0, canAdsMore: (Number(s.settings.adsLimit) || 0) < 1000,
    onAdsLimit: (e: FieldChange) => h.setState((st) => ({settings: {...st.settings, adsLimit: e.target.value === '' ? '' : Math.max(0, Math.min(1000, Math.round(Number(e.target.value) || 0)))}})),
    saveAdsLimit: () => {
      const n = Number(s.settings.adsLimit) || 0;
      h.api.patch('/admin/settings/', {ads_banner_limit: n}).then(() => h.toast(n ? 'Settings saved · ' + n + (n === 1 ? ' banner' : ' banners') + ' per village' : 'Settings saved · no banner limit')).catch((e: unknown) => h.fail(e));
    },
    onCitizenPerDay: (e: FieldChange) => h.setState((st) => ({settings: {...st.settings, citizenPerDay: e.target.value === '' ? '' : Math.max(0, Math.min(1000, Math.round(Number(e.target.value) || 0)))}})),
    saveCitizenPerDay: () => {
      const n = Number(s.settings.citizenPerDay) || 0;
      h.api.patch('/admin/settings/', {citizen_posts_per_day: n}).then(() => h.toast(n ? 'Settings saved · ' + n + ' citizen posts per phone a day' : 'Settings saved · no daily limit for citizen posts')).catch((e: unknown) => h.fail(e));
    },
  };
}
