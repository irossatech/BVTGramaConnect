// Settings page (sidebar and profile menu "Settings"): review escalation hours, citizen posts per day, languages,
// post categories and notification templates. Moved out of Console.tsx unchanged (audit WEB-ARCH-001).
// Calls GET/PATCH /admin/settings/, /admin/categories/ and /admin/notification-templates/ (.claude/api.md).
import type * as ds from "../ds";
import type { Category, ListOrPage, NotificationTemplate, Settings } from "../types";
import { rows, type FieldChange } from "../model";
import type { ConsoleHost } from "./host";

// Categories the design system has an icon for; any other category shows the "updates" icon.
const CAT_ICONS: readonly ds.Category[] = ['announce', 'schemes', 'news', 'updates'];

/** The post categories (Settings, and the Posts filter and New post: loaded after sign-in too). */
export function loadCategories(h: ConsoleHost) {
  // Settings needs posts.manage_categories; without it the list stays empty and nobody is told (nothing to fix).
  if (!h.can('posts.manage_categories')) return Promise.resolve();
  return h.api.get<ListOrPage<Category>>('/admin/categories/').then((d) => h.setState({categories: rows(d)})).catch((e: unknown) => h.fail(e));
}

export function loadSettings(h: ConsoleHost) {
  loadCategories(h);
  h.api.get<Settings>('/admin/settings/').then((st) => h.setState((s) => ({settings: {...s.settings, escalation: st.review_escalation_hours, citizenPerDay: st.citizen_posts_per_day ?? 0, langs: {te: true, en: !!st.languages?.en}}}))).catch((e: unknown) => h.fail(e));
  if (h.can('notifications.manage_templates')) h.api.get<ListOrPage<NotificationTemplate>>('/admin/notification-templates/').then((d) => {
    const templates = rows(d);
    h.setState((s) => ({settings: {...s.settings, templates}}));
  }).catch((e: unknown) => h.fail(e));
}

/** The page's renderVals() values (screens/Settings.tsx). */
export function settingsView(h: ConsoleHost) {
  const s = h.state;
  const catRows = s.categories.map((c) => ({te: c.name_te, en: c.name_en, icon: CAT_ICONS.find((k) => k === c.key) ?? 'updates', count: c.post_count || 0, swBg: c.is_active ? '#1F8A3B' : '#cfd8e3', swLeft: c.is_active ? '21px' : '3px',
    toggle: () => h.api.patch('/admin/categories/' + c.id + '/', {is_active: !c.is_active}).then(() => {
      h.toast(c.name_en + (c.is_active ? ' disabled' : ' enabled'), c.is_active ? '#E9791E' : '#6cc04a');
      loadCategories(h);
    }).catch((e: unknown) => h.fail(e))}));
  const langRows = ([{id: 'te', name: 'తెలుగు · Telugu', sub: 'Default app language'}, {id: 'en', name: 'English', sub: 'Secondary · header toggle'}] as const).map((l) => {
    const on = s.settings.langs[l.id];
    return {...l, swBg: on ? '#1F8A3B' : '#cfd8e3', swLeft: on ? '21px' : '3px', toggle: () => {
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
      h.toast('This template cannot be edited', '#E9791E');
      return;
    }
    h.ask({title: 'Edit template · ' + (tp.name || tp.key), body: 'Placeholders: ' + (tp.variables || []).map((v) => '{' + v + '}').join(' ') + '. Telugu and English are sent according to each user’s language.', needsText: true, textLabel: 'English template', confirmLabel: 'Save template', bg: '#0D3B7A', preset: tp.text_en,
      onConfirm: (t) => h.api.patch('/admin/notification-templates/' + tp.key + '/', {text_te: tp.text_te, text_en: t}).then(() => {
        h.toast('Template saved · ' + (tp.name || tp.key));
        loadSettings(h);
      }).catch((e: unknown) => h.fail(e))});
  }}));
  return {
    settings: s.settings, catRows, langRows, templates, badge36: {size: 36},
    onEscalation: (e: FieldChange) => h.setState((st) => ({settings: {...st.settings, escalation: Number(e.target.value) || 0}})), saveSettings: () => h.api.patch('/admin/settings/', {review_escalation_hours: s.settings.escalation}).then(() => h.toast('Settings saved · escalation ' + s.settings.escalation + ' h')).catch((e: unknown) => h.fail(e)),
    onCitizenPerDay: (e: FieldChange) => h.setState((st) => ({settings: {...st.settings, citizenPerDay: e.target.value === '' ? '' : Math.max(0, Math.min(1000, Math.round(Number(e.target.value) || 0)))}})),
    saveCitizenPerDay: () => {
      const n = Number(s.settings.citizenPerDay) || 0;
      h.api.patch('/admin/settings/', {citizen_posts_per_day: n}).then(() => h.toast(n ? 'Settings saved · ' + n + ' citizen posts per phone a day' : 'Settings saved · no daily limit for citizen posts')).catch((e: unknown) => h.fail(e));
    },
  };
}
