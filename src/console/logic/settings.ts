// Settings page (sidebar and profile menu "Settings"): review escalation hours, citizen posts per day, languages,
// post categories and notification templates. Moved out of Console.tsx unchanged (audit WEB-ARCH-001).
// Calls GET/PATCH /admin/settings/, /admin/categories/ and /admin/notification-templates/ (.claude/api.md).
import type * as ds from "../ds";
import type { Category, ListOrPage, NotificationTemplate, Settings } from "../types";
import { rows, type FieldChange } from "../model";
import type { ConsoleHost } from "./host";

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

export function loadSettings(h: ConsoleHost) {
  loadAdminCategories(h);
  h.api.get<Settings>('/admin/settings/').then((st) => h.setState((s) => ({settings: {...s.settings, escalation: st.review_escalation_hours, citizenPerDay: st.citizen_posts_per_day ?? 0, adsLimit: st.ads_banner_limit ?? 0, langs: {te: true, en: !!st.languages?.en}}}))).catch((e: unknown) => h.fail(e));
  if (h.can('notifications.manage_templates')) h.api.get<ListOrPage<NotificationTemplate>>('/admin/notification-templates/').then((d) => {
    const templates = rows(d);
    h.setState((s) => ({settings: {...s.settings, templates}}));
  }).catch((e: unknown) => h.fail(e));
}

/** The page's renderVals() values (screens/Settings.tsx). */
export function settingsView(h: ConsoleHost) {
  const s = h.state;
  const catRows = s.categories.map((c) => ({te: c.name_te, en: c.name_en, icon: CAT_ICONS.find((k) => k === c.key) ?? 'updates', iconUrl: c.icon_url || '', count: c.post_count || 0, on: !!c.is_active, swBg: c.is_active ? '#1F8A3B' : '#cfd8e3', swLeft: c.is_active ? '21px' : '3px',
    toggle: () => h.api.patch('/admin/categories/' + c.id + '/', {is_active: !c.is_active}).then(() => {
      h.toast(c.name_en + (c.is_active ? ' disabled' : ' enabled'), c.is_active ? '#E9791E' : '#6cc04a');
      loadAdminCategories(h);
    }).catch((e: unknown) => h.fail(e))}));
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
