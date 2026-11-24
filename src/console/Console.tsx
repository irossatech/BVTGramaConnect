// Super Admin console, ported from the approved prototype "Super Admin Console.dc.html"
// with the documented additions. The logic class holds all behaviour; render() is the template as JSX.
// Keep render() bound to the same renderVals() keys; map API data into those shapes in the logic.
import React from "react";
import { css } from "../shared/dc";
import GC_API, { ApiError } from "./api";
import Checking from "./screens/Checking";
import AuthLayout from "./layout/AuthLayout";
import ImportProgressPanel from "./panels/ImportProgress";
import Toasts from "./panels/Toasts";
import type { ConsoleHost } from "./logic/host";
import { contactPanelView, contactsView, loadContacts } from "./logic/messages";
import { loadRequests, requestPanelView, requestsView } from "./logic/requests";
import { adFormView, adsView, loadAds } from "./logic/ads";
import { auditView, loadAudit } from "./logic/audit";
import { loadReports, reportsView } from "./logic/reports";
import { loadCategories, loadSettings, settingsView } from "./logic/settings";
import { loadServices, servicesView } from "./logic/services";
import { loadNumbers, loadTypes, numbersView } from "./logic/numbers";
import { geographyView } from "./logic/geography";
import { loadUsers, userPanelView, usersView } from "./logic/users";
import { loadPosts, postPanelView, postsView } from "./logic/posts";
import { composeView } from "./logic/compose";
import { loadNotifs, notificationsView } from "./logic/notifications";
import { dashboardView, loadDash } from "./logic/dashboard";
import type { Area, GeoState, GeoVillage,
  LoginResponse, Me,
} from "./types";

import { FORMS, LEVEL_OF_ROLE, one, isStatus, blobPreviews, historyPage, EMPTY_NU, pickFile } from "./model";
import type { Props, PageKey, NavKey, FieldChange, Timer, AreaOption, ModalSpec, GeoDistrictRow, GeoVillageRow, SelKey, SelId, BulkOptions, SelView, State, TeForm } from "./model";
export type { SelView } from "./model";

// The signed-in screens load after sign-in (WEB-PERF-003): see AppShell.tsx.
const AppShell = React.lazy(() => import("./AppShell"));

export type View = ReturnType<Component["renderVals"]>;

export default class Component extends React.Component<Props, State> {
  private static readonly ICON: Readonly<Record<NavKey, string>> = {bills:'M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1zM16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11',services:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',ads:'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM2 15l5-5 4 4 3-3 8 8M15.5 9.5h.01',requests:'M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z',contact:'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',numbers:'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',dashboard:'M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z',geography:'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',users:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',posts:'M4 4h13a3 3 0 0 1 3 3v12H5a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1zm3 4h6M7 12h6M7 16h4M16 8h1M16 12h1',reports:'M3 20h18M6 17V10M11 17V4M16 17v-7M21 17v-4',audit:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 8h6m-6 4h4',settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-1.7-1L14.8 3H9.2l-.4 2.6a7.5 7.5 0 0 0-1.7 1l-2.4-1-2 3.4L4.7 11a7.4 7.4 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 1.7 1l.4 2.6h5.6l.4-2.6a7.5 7.5 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1z'};
  private static readonly LEVEL_OF_ROLE = LEVEL_OF_ROLE;
  private static readonly PAGES: readonly PageKey[] = ['dashboard','geography','users','posts','requests','bills','ads','reports','audit','contact','numbers','settings'];
  // A page shows when the user has any one of these permissions (BackEnd apps/accounts/role_matrix.py).
  private static readonly NAV_PERM: Readonly<Record<NavKey, readonly string[]>> = {bills:['bills.manage_bills'],services:['service_requests.manage_services'],dashboard:['web_admin.view_dashboard'],geography:['geography.manage_master_data'],users:['accounts.manage_district_admin','accounts.manage_mandal_admin','accounts.manage_village_admin','accounts.manage_panchayat_member'],posts:['posts.view_review_queue'],reports:['web_admin.view_reports'],audit:['audit.view_audit_log'],contact:['web_public.manage_contact_messages'],requests:['service_requests.view_service_requests','service_requests.manage_services'],ads:['ads.manage_ad'],numbers:['contacts.manage_contact'],settings:['posts.manage_settings','posts.manage_categories','notifications.manage_templates']};
  private static readonly CONSOLE_PERM = 'web_admin.access_web_console';
  private static readonly LOGIN_ERR: Readonly<Record<string, string>> = {invalid_credentials:'Wrong username or password.',not_console_user:'This console is for Super Admins only. Use the mobile app.',account_blocked:'This account is blocked. Contact your administrator.'};

  // The console signs out after this long without a key press, click, scroll or pointer move (owner decision of
  // 2026-10-21: 30-minute idle timeout). The bell's background poll does not count, though it keeps the server
  // session fresh, so the console itself ends an unattended session.
  private static readonly IDLE_MS = 30 * 60 * 1000;
  /** The idle limit the server sets (/me rules.console_idle_minutes, Jira BVTGC-72), else the 30 minutes above. */
  private idleMs(): number {
    const m = Number(this.state.me?.rules?.console_idle_minutes);
    return m > 0 ? m * 60 * 1000 : Component.IDLE_MS;
  }
  private static readonly ACTIVITY: readonly string[] = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'];

  // Everything the console shows starts from here, and goes back here on sign-out (nothing of the last session stays).
  private static readonly INITIAL: State = {
    screen: 'checking', page: 'dashboard', username: '', password: '', cpCurrent: '', cpNext: '', cpVoluntary: false, showPw: {}, menuOpen: false, navOpen: false, exporting: null, notifOpen: false, notifs: [], notifUnread: 0, notifNext: null, notifLoading: false, notifError: false, gsearch: '', me: null,
    geo: [], geoAll: false, geoAllLoading: false, stateRow: null, expanded: {}, geoQ: '', geoForm: null,
    users: [], userCount: 0, userCounts: null, userPage: 1, userPages: 1, usersLoading: false,
    reqs: [], reqCount: 0, reqPage: 1, reqPages: 1, reqLoading: false, reqFilter: 'NEW', svcView: 'requests', ads: [], adsLoading: false, adsUnavailable: false, af: null,
    svcs: [], svcsLoading: false, svcsUnavailable: false, bills: [], billsLoading: false, billsUnavailable: false, sf: null, reqQ: '', reqCounts: {}, reqUnavailable: false,
    rq: null, cm: null, rqAssignees: [], uf: {role: '', district: '', status: '', q: ''},
    posts: [], postCount: 0, postPage: 1, postPages: 1, postsLoading: false, statusCounts: {}, pendingCount: 0, pf: {district: '', cat: '', source: ''}, statusTab: 'Pending',
    numSel: [], adSel: [], adTab: 'all', postSel: [], userSel: [], blockedPosts: [], blockReasons: {}, citizensServer: null, citizenPosts: [], citizenBlocks: [], bulk: '', cf: null,
    panel: null, panelPost: null, panelHistory: [], panelUser: null, panelUserPosts: [], drawerOpen: false, nu: {...EMPTY_NU},
    audit: [], auditCount: 0, auditOpen: null, auditPage: 1, auditPages: 1, auditQ: '', auditType: '', auditFrom: '', auditTo: '', distQ: '', auditLoading: false,
    contacts: [], contactCount: 0, contactCounts: {}, contactPage: 1, contactPages: 1, contactQ: '', contactFilter: 'new', contactLoading: false,
    nums: [], numCount: 0, numPage: 1, numPages: 1, numLoading: false, numTab: 'AREA', numQ: '', numType: '', numDistrict: '', ctypes: [], ctypesAdmin: [], nf: null, tf: null,
    dash: null, dashPeople: null, reports: {summary: null, byArea: [], reviewTime: [], activity: []}, categories: [],
    settings: {escalation: 24, citizenPerDay: 5, langs: {te: true, en: true}, templates: []},
    modal: null, modalText: '', modalText2: '', modalSel: '', modalGen: '', modalFile: null, modalImg: '', toasts: [], imp: null,
  };

  state: State = {...Component.INITIAL};

  /** When the user last pressed a key, clicked, scrolled or moved the pointer. */
  private lastActive = Date.now();
  private readonly onActivity = (): void => {
    this.lastActive = Date.now();
  };
  private readonly onVisible = (): void => {
    if (document.visibilityState === 'visible') this.checkIdle();
  };
  /** The latest request number per list or panel: an older answer that arrives late is dropped. */
  private seq: Record<string, number> = {};
  private seqNo = 0;

  private toastTimers: Timer[] = [];
  /** The screen modules' waiting search boxes (ConsoleHost.later), by key. */
  private timers: Record<string, Timer> = {};
  /** Refreshes the bell every minute while the console is open. */
  private notifTimer: ReturnType<typeof setInterval> | undefined;
  private teTimer: Timer | undefined;
  /** The next page change comes from Back/Forward, so it is not pushed to history again. */
  private fromPop = false;
  private scrollEl: HTMLDivElement | null = null;
  /** Telugu names of every area, by "LEVEL:id", from the geography tree. */
  private teNames: Record<string, string> = {};
  private teSeq = 0;
  /** The last Telugu name suggested, so a hand-typed one is never overwritten. */
  private teAuto: string | undefined;
  /** The password Generate put in the Add User form (shown once after saving). */
  private nuGen: string | undefined;

  private get api() {
    return GC_API;
  }

  /** What the screen modules in logic/ may use of the console (logic/host.ts). Every member reads the class at
   * the moment it is called, so it always sees the current state. */
  private readonly host: ConsoleHost = ((c: Component): ConsoleHost => ({
    get state() {
      return c.state;
    },
    setState: (update, then) => c.setState(update as Parameters<Component['setState']>[0], then),
    get api() {
      return c.api;
    },
    ticket: (key) => c.ticket(key),
    toast: (text, dot) => c.toast(text, dot),
    fail: (e) => c.fail(e),
    ask: (modal) => c.ask(modal),
    fmt: (iso, withYear) => c.fmt(iso, withYear),
    fmtLast: (iso) => c.fmtLast(iso),
    can: (code) => c.can(code),
    an: (ref) => c.an(ref),
    nl: (x) => c.nl(x),
    newPassword: () => c.newPassword(),
    get nuGen() {
      return c.nuGen;
    },
    set nuGen(v) {
      c.nuGen = v;
    },
    areaOptions: (role) => c.areaOptions(role),
    navOk: (key) => c.navOk(key),
    suggestTe: (form, english) => c.suggestTe(form, english),
    later: (key, run, ms) => {
      clearTimeout(c.timers[key]);
      c.timers[key] = setTimeout(run, ms);
    },
    loadGeo: () => c.loadGeo(),
    loadVillages: (mandalId) => c.loadVillages(mandalId),
    loadAllVillages: () => c.loadAllVillages(),
    toggleSel: (key, id) => c.toggleSel(key, id),
    selView: (key, ids, options) => c.selView(key, ids, options),
  }))(this);

  private readonly onPop = (e: PopStateEvent): void => this.onBack(e);

  // Escape closes the top dialog or side panel: the keyboard's way out of the dimmed backdrop.
  private readonly onKey = (e: KeyboardEvent): void => {
    if (e.key !== 'Escape') return;
    const s = this.state;
    const form = FORMS.find((k) => s[k]);
    const close = s.notifOpen ? () => this.setState({notifOpen: false})
      : s.menuOpen ? () => this.setState({menuOpen: false})
      : s.modal ? () => this.closeModal()
      : form ? () => this.setState(one(form, null))
      : s.drawerOpen ? () => this.setState({drawerOpen: false})
      : s.panel ? () => this.setState({panel: null})
      : null;
    if (!close) return;
    e.preventDefault();
    close();
  };

  componentDidMount() {
    // A console reload keeps the Django session (HttpOnly sessionid cookie). Until GET /me/ answers
    // the page shows a loading screen ('checking'), so a signed-in reload never flashes the login form.
    this.api.start<Me>().then((me) => this.afterLogin(me, true)).catch(() => this.setState({screen: 'login'}));
    window.addEventListener('popstate', this.onPop);
    window.addEventListener('keydown', this.onKey);
    Component.ACTIVITY.forEach((t) => window.addEventListener(t, this.onActivity, {passive: true, capture: true}));
    document.addEventListener('visibilitychange', this.onVisible);
  }

  // Browser history: each console page is its own entry (#users, #reports…), so Back and the swipe gesture move
  // between pages. Behind the first page sits a guard entry: going back onto it while signed in keeps the console
  // open and asks before leaving, so no one leaves the console signed in by accident.
  componentDidUpdate(_: Props, prev: State) {
    const s = this.state;
    // A logo, banner picture or banner video preview is freed once its form no longer shows it (replaced or closed).
    const shown = blobPreviews(s);
    blobPreviews(prev).forEach((u) => {
      if (!shown.includes(u)) URL.revokeObjectURL(u);
    });
    if (s.screen === 'app' && (prev.screen !== 'app' || prev.page !== s.page)) {
      const h = '#' + s.page;
      try {
        if (prev.screen !== 'app') {
          window.history.replaceState({gc: 'guard'}, '', window.location.pathname);
          window.history.pushState({gc: s.page}, '', h);
        } else if (!this.fromPop) window.history.pushState({gc: s.page}, '', h);
      } catch {
        /* history not available */
      }
      this.fromPop = false;
    }
    if (prev.screen !== 'login' && s.screen === 'login') {
      try {
        window.history.replaceState(null, '', window.location.pathname);
      } catch {
        /* history not available */
      }
    }
  }

  // On the login screen (e.g. after logging out) Back leaves for the website's home page; the console
  // pages still behind it in history would only show the login form again.
  private onBack(e: PopStateEvent) {
    const s = this.state;
    if (s.screen === 'login') {
      window.location.replace('/');
      return;
    }
    if (s.screen !== 'app') return;
    const to = historyPage(e);
    if (to !== 'guard') {
      // a console page: from history, or a hash typed in the address bar (no state yet)
      const pg = to || (window.location.hash || '').slice(1);
      const page = Component.PAGES.find((k) => k === pg);
      if (!page || !this.navOk(page)) {
        try {
          window.history.replaceState({gc: s.page}, '', '#' + s.page);
        } catch {
          /* history not available */
        }
        return;
      }
      if (!to) {
        try {
          window.history.replaceState({gc: page}, '', '#' + page);
        } catch {
          /* history not available */
        }
      }
      if (page !== s.page) {
        this.fromPop = true;
        this.goPage(page);
      }
      return;
    }
    try {
      window.history.pushState({gc: s.page}, '', '#' + s.page);
    } catch {
      /* history not available */
    }
    this.ask({title: 'Leave the console?', body: 'You are still signed in. Log out first, or stay on this page.', confirmLabel: 'Log out and leave', bg: '#b3261e', onConfirm: () => this.logout(true)});
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.onPop);
    window.removeEventListener('keydown', this.onKey);
    Component.ACTIVITY.forEach((t) => window.removeEventListener(t, this.onActivity, {capture: true}));
    document.removeEventListener('visibilitychange', this.onVisible);
    this.toastTimers.forEach(clearTimeout);
    this.stopTimers();
  }

  private stopTimers() {
    Object.values(this.timers).forEach(clearTimeout);
    this.timers = {};
    clearTimeout(this.teTimer);
    clearInterval(this.notifTimer);
    this.notifTimer = undefined;
  }

  // Back to the login screen with nothing of the last session left: every list, panel, form and timer goes, and
  // answers still on their way are dropped (their request numbers no longer match). The username stays after a
  // timeout, so signing in again is quick; a deliberate logout clears it.
  private resetSession(keepUsername: boolean) {
    this.stopTimers();
    this.seq = {};
    this.teNames = {};
    this.villageLoads.clear();
    this.allVillagesLoad = null;
    this.teAuto = undefined;
    this.nuGen = undefined;
    this.setState((s) => ({...Component.INITIAL, screen: 'login', toasts: s.toasts, username: keepUsername ? s.username : ''}));
  }

  // Tags a request for one list or panel; the returned check is false once a newer request for it has started.
  private ticket(key: string) {
    const n = (this.seqNo = this.seqNo + 1);
    this.seq[key] = n;
    return () => this.seq[key] === n;
  }

  // No key press, click, scroll or pointer move for IDLE_MS while signed in: end the session on the server too.
  private checkIdle() {
    const s = this.state;
    if (s.screen !== 'app' && s.screen !== 'change_password') return false;
    if (Date.now() - this.lastActive < this.idleMs()) return false;
    this.api.logout();
    this.resetSession(true);
    this.toast('Your session has ended. Log in again.', '#E9791E');
    return true;
  }

  private toast(text: string, dot?: string) {
    const id = Date.now() + Math.random();
    this.setState((s) => ({toasts: [...s.toasts, {id, text, dot: dot || '#6cc04a'}]}));
    this.toastTimers.push(setTimeout(() => this.setState((s) => ({toasts: s.toasts.filter((t) => t.id !== id)})), 2600));
  }

  private fail(e: unknown) {
    const err = e instanceof ApiError ? e : null;
    if (err?.code === 'password_change_required') {
      this.setState({screen: 'change_password', cpVoluntary: false, cpCurrent: '', cpNext: '', menuOpen: false, panel: null, drawerOpen: false});
      this.toast('Choose a new password first.', '#E9791E');
      return;
    }
    // Console access taken away mid-session: every call now answers 403 not_console_user, so sign out with the same
    // words as at login instead of a toast on each call (Jira BVTGC-55).
    if (err?.code === 'not_console_user' && this.state.screen !== 'login') {
      this.api.logout();
      this.resetSession(true);
      this.toast(Component.LOGIN_ERR.not_console_user, '#b3261e');
      return;
    }
    if (err?.status === 401 && this.state.screen !== 'login') {
      this.resetSession(true);
      this.toast('Your session has ended. Log in again.', '#E9791E');
      return;
    }
    let text = (e instanceof Error && e.message) || 'Something went wrong. Try again.';
    const f = err?.body.fields;
    if (f) {
      const first = f[Object.keys(f)[0]];
      const v = Array.isArray(first) ? first[0] : first;
      if (v && typeof v === 'string' && !text.includes(v)) text = text + ' ' + v;
    }
    // A server error (500) names its request, so the backend team can find it in the logs.
    const ref = err?.body.request_id;
    if (typeof ref === 'string' && ref) text = text + ' (ref. ' + ref.slice(0, 8) + ')';
    this.toast(text, '#b3261e');
  }

  private goPage(p: PageKey) {
    this.setState({page: p, menuOpen: false, navOpen: false, panel: null, drawerOpen: false, nf: null, rq: null, cm: null, af: null, cf: null});
    if (this.scrollEl) this.scrollEl.scrollTop = 0;
    this.loadPage(p);
  }

  private ask(m: ModalSpec) {
    this.setState({modal: m, modalText: m.preset || '', modalText2: m.preset2 || '', modalSel: m.sel || (m.options && m.options.length ? m.options[0].id : ''), modalGen: '', modalFile: null, modalImg: ''});
  }

  private closeModal() {
    if (this.state.modalImg) URL.revokeObjectURL(this.state.modalImg);
    this.setState({modal: null, modalText: '', modalText2: '', modalSel: '', modalGen: '', modalFile: null, modalImg: ''});
  }

  /** The dialog's image (Add category icon): PNG, JPG or WebP up to 2 MB, as service logos. */
  private pickModalImage() {
    pickFile('image/png,image/jpeg,image/webp', (file) => {
      if (file.size > 2 * 1024 * 1024) return this.toast('The icon is larger than 2 MB', '#E9791E');
      if (this.state.modalImg) URL.revokeObjectURL(this.state.modalImg);
      this.setState({modalFile: file, modalImg: URL.createObjectURL(file)});
    });
  }

  // ---- permissions (from GET /me/; the server enforces every one) ----
  // "app_label.codename" strings from GET /me/ permissions. No list means no permissions.
  private can(code: string, me?: Me | null) {
    const p = (me || this.state.me)?.permissions;
    return Array.isArray(p) && p.includes(code);
  }

  private canAny(codes: readonly string[], me?: Me | null) {
    return !codes.length || codes.some((c) => this.can(c, me));
  }

  private navOk(k: NavKey, me?: Me | null) {
    return this.canAny(Component.NAV_PERM[k], me);
  }

  // A temporary password to hand over in person: 12 characters, no look-alikes, at least one lower, upper,
  // digit and special character (the server's password rules; the app's newTempPassword is the same).
  private newPassword() {
    const sets = ['abcdefghjkmnpqrstuvwxyz', 'ABCDEFGHJKLMNPQRSTUVWXYZ', '23456789', '@#$%&*!?'];
    const all = sets.join('');
    const pick = (chars: string, n: number) => {
      const r = new Uint32Array(n);
      crypto.getRandomValues(r);
      return Array.from(r, (x) => chars[x % chars.length]);
    };
    const out = [...sets.map((c) => pick(c, 1)[0]), ...pick(all, 12 - sets.length)];
    const r = new Uint32Array(out.length);
    crypto.getRandomValues(r);
    for (let i = out.length - 1; i > 0; i--) {
      const j = r[i] % (i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out.join('');
  }

  private copySecret() {
    const v = this.state.modal && this.state.modal.secret;
    if (!v) return;
    const ok = () => this.toast('Copied');
    (navigator.clipboard && window.isSecureContext ? navigator.clipboard.writeText(v) : Promise.reject()).then(ok).catch(() => {
      const t = document.createElement('textarea');
      t.value = v;
      t.style.position = 'fixed';
      t.style.opacity = '0';
      document.body.appendChild(t);
      t.select();
      try {
        document.execCommand('copy');
        ok();
      } catch {
        this.toast('Select the password and copy it', '#E9791E');
      }
      t.remove();
    });
  }

  // ---- formatting ----
  private fmt(iso: string | null | undefined, withYear?: boolean) {
    if (!iso) return '—';
    const d = new Date(iso);
    const o: Intl.DateTimeFormatOptions = {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata'};
    if (withYear !== false) o.year = 'numeric';
    return new Intl.DateTimeFormat('en-GB', o).format(d).replace(',', '');
  }

  private dayKey(d: Date) {
    return new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Kolkata'}).format(d);
  }

  private fmtLast(iso: string | null | undefined) {
    if (!iso) return 'Never';
    const d = new Date(iso), now = new Date();
    const t = new Intl.DateTimeFormat('en-GB', {hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata'}).format(d);
    if (this.dayKey(d) === this.dayKey(now)) return 'Today ' + t;
    if (this.dayKey(d) === this.dayKey(new Date(now.getTime() - 864e5))) return 'Yesterday ' + t;
    return this.fmt(iso, false);
  }

  private te(ref: Area) {
    return this.teNames[ref.level + ':' + ref.id] || '';
  }

  // "Tenali · తెనాలి"; just "Tenali" when there is no Telugu name (the server then sends the English one again).
  private nl(x: {name: string; te?: string}) {
    const t = (x.te || '').trim();
    return x.name + (t && t.toLowerCase() !== String(x.name).trim().toLowerCase() ? ' · ' + t : '');
  }

  private an(ref: Area | null | undefined) {
    if (!ref) return '';
    const t = this.te(ref);
    return ref.name + (t && t !== ref.name ? ' · ' + t : '');
  }

  // ---- auth (username + password, Django session for the console) ----
  private enter(me: Me) {
    let want = (window.location.hash || '').slice(1);
    const cat = want === 'services';
    if (cat) want = 'requests';
    const asked = Component.PAGES.find((k) => k === want);
    const page = asked && this.navOk(asked, me) ? asked : (Component.PAGES.find((k) => this.navOk(k, me)) || 'dashboard');
    // Loaders that check permissions run once `me` is in state (Services reads navOk('services'), categories
    // can('posts.manage_categories')): before the update lands they would see no user and skip their list.
    this.setState({me, screen: 'app', page, svcView: cat ? 'catalog' : 'requests', password: '', cpCurrent: '', cpNext: '', cpVoluntary: false, showPw: {}}, () => {
      loadCategories(this.host);
      this.loadPage(page);
    });
    this.loadGeo();
    loadNotifs(this.host);
    this.lastActive = Date.now();
    clearInterval(this.notifTimer);
    this.notifTimer = setInterval(() => {
      // An unattended console signs out after IDLE_MS; the poll itself must not keep it signed in.
      if (this.checkIdle()) return;
      // Only while signed in, the tab is visible and the list is closed (an open list is not reshuffled under the cursor).
      if (this.state.screen === 'app' && !this.state.notifOpen && document.visibilityState === 'visible') loadNotifs(this.host, false, true);
      // Service requests: a citizen's new request shows up without reopening the page, while no request is open.
      if (this.state.screen === 'app' && this.state.page === 'requests' && this.state.svcView === 'requests' && !this.state.rq && document.visibilityState === 'visible') loadRequests(this.host, this.state.reqPage, true);
    }, 60000);
  }

  private afterLogin(me: Me, quiet?: boolean) {
    if (!this.can(Component.CONSOLE_PERM, me)) {
      this.api.logout();
      this.setState({screen: 'login', me: null, password: ''});
      if (!quiet) this.toast(Component.LOGIN_ERR.not_console_user, '#b3261e');
      return false;
    }
    if (me.must_change_password) {
      this.setState({me, screen: 'change_password', cpVoluntary: false, password: '', cpCurrent: '', cpNext: ''});
      return false;
    }
    this.enter(me);
    return true;
  }

  private signIn() {
    const s = this.state;
    if (!s.username.trim() || !s.password) return;
    this.api.login<LoginResponse>(s.username.trim(), s.password).then((d) => {
      const me = d.user;
      if (this.afterLogin(me)) this.toast('Welcome, ' + me.name);
    }).catch((e: unknown) => {
      this.setState({password: ''});
      this.loginFail(e);
    });
  }

  private loginFail(e: unknown) {
    const c = e instanceof ApiError ? e.code : undefined, L = Component.LOGIN_ERR;
    // The login's only limit is the username + network lockout (429 locked_out); the old login throttle is gone.
    // retry_after_s is missing on one server path, so 15 minutes, the lockout's length, stands in (Jira BVTGC-54).
    if (e instanceof ApiError && c === 'locked_out') {
      const min = Math.max(1, Math.ceil((Number(e.body.retry_after_s) || 900) / 60));
      this.toast('Too many failed attempts. Try again in ' + min + ' minute' + (min === 1 ? '' : 's') + '.', '#b3261e');
      return;
    }
    if (c && L[c]) {
      this.toast(L[c], '#b3261e');
      return;
    }
    this.fail(e);
  }

  private openChangePassword() {
    this.setState({screen: 'change_password', cpVoluntary: true, menuOpen: false, cpCurrent: '', cpNext: ''});
  }

  private changePassword() {
    const s = this.state;
    if (!s.cpCurrent || !s.cpNext) return;
    const vol = s.cpVoluntary;
    this.api.post('/auth/password/change/', {current_password: s.cpCurrent, new_password: s.cpNext}).then(() => this.api.get<Me>('/me/')).then((me) => {
      if (vol) this.setState({me, screen: 'app', cpCurrent: '', cpNext: '', cpVoluntary: false});
      else this.enter(me);
      this.toast(vol ? 'Password changed · your other sessions are signed out' : 'Password changed');
    }).catch((e: unknown) => {
      this.setState({cpCurrent: '', cpNext: ''});
      this.fail(e);
    });
  }

  private logout(leave?: boolean) {
    this.api.logout().finally(() => {
      if (leave) {
        window.location.replace('/');
        return;
      }
      this.resetSession(false);
      this.toast('Signed out');
    });
  }

  // ---- loading ----
  private loadPage(p: PageKey) {
    if (p === 'dashboard') loadDash(this.host);
    if (p === 'users') loadUsers(this.host, 1);
    if (p === 'posts') loadPosts(this.host, 1);
    if (p === 'audit') loadAudit(this.host, 1);
    if (p === 'contact') loadContacts(this.host, 1);
    if (p === 'ads') loadAds(this.host);
    if (p === 'bills') loadServices(this.host, true);
    if (p === 'requests') {
      loadRequests(this.host, 1);
      if (this.navOk('services')) loadServices(this.host);
    }
    if (p === 'numbers') {
      loadTypes(this.host);
      if (this.state.numTab !== 'TYPES') loadNumbers(this.host, 1);
    }
    if (p === 'reports') loadReports(this.host);
    if (p === 'settings') loadSettings(this.host);
    if (p === 'geography') {
      this.loadGeo();
      if (this.state.geoQ.trim()) void this.loadAllVillages(); // back to a search left typed in: it needs every village
    }
  }

  // The geography tree: districts and mandals, each mandal with its village count (GET /geo/tree/). The ~18,000
  // villages no longer come with every sign-in (backend audit; contract, "Geography"): one mandal's load when it is
  // opened or picked (loadVillages, GET /geo/admin/villages/?mandal=), and all of them only where a screen needs
  // every one, Geography search and export or a list of all villages (loadAllVillages). Each load runs once.
  private villageLoads = new Map<number, Promise<void>>();
  private allVillagesLoad: Promise<void> | null = null;

  private loadGeo() {
    // A reload (after an edit or an import) keeps what was there: every village again if they were all loaded,
    // else the villages of the mandals already loaded and of the mandals open in the tree.
    const all = this.state.geoAll;
    const wereLoaded = this.state.geo.flatMap((d) => d.mandals.filter((m) => m.loaded).map((m) => m.id));
    this.villageLoads.clear();
    this.allVillagesLoad = null;
    return this.api.get<GeoState[]>('/geo/tree/', all ? {villages: 1} : {}).then((tree) => {
      const st = tree[0] || null;
      const geo = this.geoRows(st, all);
      const expanded = {...this.state.expanded};
      if (geo[0] && !Object.keys(expanded).length) {
        expanded[geo[0].id] = true;
        if (geo[0].mandals[0]) expanded['m' + geo[0].mandals[0].id] = true;
      }
      this.setState({geo, geoAll: all, stateRow: st, expanded}, () => {
        if (all) return;
        const open = Object.keys(this.state.expanded).filter((k) => /^m\d+$/.test(k) && this.state.expanded[k]).map((k) => Number(k.slice(1)));
        for (const id of new Set([...wereLoaded, ...open])) void this.loadVillages(id);
      });
    }).catch((e: unknown) => this.fail(e));
  }

  // The tree from the server as the console's rows; also fills the Telugu names (teNames) of every place in it.
  private geoRows(st: GeoState | null, withVillages: boolean): GeoDistrictRow[] {
    const teMap: Record<string, string> = {};
    const geo = (st ? st.districts : []).map((d): GeoDistrictRow => {
      teMap['DISTRICT:' + d.id] = d.name_te;
      return {id: d.id, name: d.name_en, te: d.name_te, lgd: d.lgd_code || '', active: d.is_active, mandals: d.mandals.map((m) => {
        teMap['MANDAL:' + m.id] = m.name_te;
        const villages = (m.villages || []).map((v) => this.villageRow(v, teMap));
        return {id: m.id, name: m.name_en, te: m.name_te, lgd: m.lgd_code || '', active: m.is_active, count: m.village_count ?? villages.length, loaded: withVillages, villages};
      })};
    });
    if (st) teMap['STATE:' + st.id] = st.name_te;
    this.teNames = teMap;
    return geo;
  }

  private villageRow(v: GeoVillage, teMap: Record<string, string>): GeoVillageRow {
    teMap['VILLAGE:' + v.id] = v.name_te;
    return {id: v.id, name: v.name_en, te: v.name_te, lgd: v.lgd_code || '', lat: v.latitude || '', lng: v.longitude || '', pin: v.pin_code || '', active: v.is_active};
  }

  private loadVillages(mandalId: number | string): Promise<void> {
    const id = Number(mandalId);
    if (!id || this.state.geoAll) return Promise.resolve();
    if (this.state.geo.some((d) => d.mandals.some((m) => m.id === id && m.loaded))) return Promise.resolve();
    const going = this.villageLoads.get(id) || this.allVillagesLoad;
    if (going) return going;
    // Settles once the villages are in the state, so a caller reading h.state next finds them.
    const load = this.api.get<GeoVillage[]>('/geo/admin/villages/', {mandal: id}).then((rows) => new Promise<void>((done) => {
      const villages = rows.map((v) => this.villageRow(v, this.teNames));
      this.setState((s) => ({geo: s.geo.map((d) => d.mandals.some((m) => m.id === id) ? {...d, mandals: d.mandals.map((m) => m.id === id ? {...m, villages, loaded: true, count: villages.length} : m)} : d)}), done);
    })).catch((e: unknown) => {
      this.villageLoads.delete(id);
      this.fail(e);
    });
    this.villageLoads.set(id, load);
    return load;
  }

  private loadAllVillages(): Promise<void> {
    if (this.state.geoAll) return Promise.resolve();
    if (this.allVillagesLoad) return this.allVillagesLoad;
    this.setState({geoAllLoading: true});
    const load = this.api.get<GeoState[]>('/geo/tree/', {villages: 1}).then((tree) => new Promise<void>((done) => {
      const st = tree[0] || null;
      this.setState({geo: this.geoRows(st, true), geoAll: true, geoAllLoading: false, stateRow: st}, done);
    })).catch((e: unknown) => {
      this.allVillagesLoad = null;
      this.setState({geoAllLoading: false});
      this.fail(e);
    });
    this.allVillagesLoad = load;
    return load;
  }



  // ---- select several and remove them at once (the server removes one per request, so one by one with progress) ----
  private toggleSel(key: SelKey, id: SelId) {
    this.setState((s) => one(key, s[key].includes(id) ? s[key].filter((x) => x !== id) : [...s[key], id]));
  }

  private selAll(key: SelKey, ids: SelId[]) {
    this.setState((s) => one(key, ids.length && ids.every((i) => s[key].includes(i)) ? [] : ids));
  }

  private bulkRemove(key: SelKey, ids: SelId[], o: BulkOptions) {
    if (!ids.length || this.state.bulk) return;
    this.ask({title: o.title, body: o.body, confirmLabel: o.confirm, bg: '#b3261e', onConfirm: async () => {
      let ok = 0, why = '';
      for (let i = 0; i < ids.length; i++) {
        this.setState({bulk: 'Removing ' + (i + 1) + ' of ' + ids.length + '…'});
        try {
          await this.api.del(o.url(ids[i]));
          ok++;
        } catch (e) {
          // The session ended or this admin may not remove these: the rest would fail too, so stop here.
          if (isStatus(e, 401) || isStatus(e, 403)) {
            this.setState({bulk: '', ...one(key, [])});
            // A plain 403 reloads the list (some may be gone); a 401 or a forced password change leaves the page.
            if (isStatus(e, 403) && !(e instanceof ApiError && e.code === 'password_change_required')) o.done();
            this.fail(e);
            return;
          }
          why = why || (e instanceof Error && e.message) || 'the server did not answer';
        }
      }
      this.setState({bulk: '', ...one(key, [])});
      o.done();
      if (why) this.ask({title: ok + ' removed', body: (ids.length - ok) + ' could not be removed: ' + why, confirmLabel: 'Close', bg: '#3b4a5c', noCancel: true, onConfirm: () => {}});
      else this.toast(ok + ' removed', '#E9791E');
    }});
  }

  private selView(key: SelKey, ids: SelId[], o: (n: number) => BulkOptions): SelView {
    const s = this.state;
    const picked = s[key].filter((i) => ids.includes(i));
    const n = picked.length;
    return {show: ids.length > 0, all: n > 0 && n === ids.length, some: n > 0 && n < ids.length, count: n, label: n + ' selected', busy: s.bulk,
      toggleAll: () => this.selAll(key, ids), clear: () => this.setState(one(key, [])), remove: () => this.bulkRemove(key, picked, o(n))};
  }

  // Fills a form's Telugu name from its English name as the admin types (the server's spelling
  // suggestion, `/admin/transliterate/`: "Ravi Kumar" → "రవి కుమార్"). Only while the Telugu box is empty or
  // still holds the last suggestion, so Telugu typed by hand is never overwritten. No suggestion: nothing happens.
  private suggestTe(form: TeForm, en: string) {
    clearTimeout(this.teTimer);
    const seq = (this.teSeq = this.teSeq + 1);
    // The dialog keeps its Telugu box in modalText2; the forms in their own `te`.
    const teOf = (st: State): string | null => form === 'modal' ? (st.modal ? st.modalText2 : null) : (st[form] ? st[form].te || '' : null);
    const mine = () => {
      const te = teOf(this.state);
      return te !== null && seq === this.teSeq && (!te.trim() || te === this.teAuto);
    };
    const put = (te: string) => {
      this.teAuto = te;
      if (form === 'modal') return this.setState((st) => st.modal ? {modalText2: te} : null);
      this.setState((st) => {
        const f = st[form];
        return f ? one(form, {...f, te}) : null;
      });
    };
    if (!mine()) return;
    if (!en.trim()) {
      if (teOf(this.state)) put('');
      return;
    }
    this.teTimer = setTimeout(() => this.api.get<{te: string}>('/admin/transliterate/', {text: en.trim().slice(0, 150)})
      .then((r) => {
        if (r?.te && mine()) put(r.te);
      }).catch(() => {}), 400);
  }

  /** Add one file to the form, at the end. */

  /** A video's length and first frame, read in the browser. Null when the browser cannot play it. */

  /** "Just now", "5 min ago", "3 h ago", "2 d ago", then the date. */

  private areaOptions(role: string): AreaOption[] {
    const lv = Component.LEVEL_OF_ROLE[role];
    const g = this.state.geo;
    const st = this.state.stateRow;
    // A Super Admin's area: "Whole state", the same words as the app (Jira BVTGC-47).
    if (lv === 'STATE') return st ? [{id: String(st.id), label: 'Whole state', level: lv}] : [];
    if (lv === 'DISTRICT') return g.filter((d) => d.active).map((d) => ({id: String(d.id), label: this.nl(d), level: lv}));
    if (lv === 'MANDAL') return g.flatMap((d) => d.mandals.filter((m) => m.active && d.active).map((m) => ({id: String(m.id), label: this.nl(m), level: lv})));
    return g.flatMap((d) => d.mandals.flatMap((m) => m.villages.filter((v) => v.active && m.active && d.active).map((v) => ({id: String(v.id), label: this.nl(v), level: 'VILLAGE' as const}))));
  }

  private editProfile() {
    const me = this.state.me;
    const g = (me?.groups || []).map((x) => x.name || x.key).join(', ') || 'Super Admin';
    this.setState({menuOpen: false});
    // Name and Telugu name, as on the app's profile (PATCH /me/).
    this.ask({title: 'My profile', body: 'Signed in as ' + (me?.username || '') + ' · ' + g + '. Your name shows in the console, the app and the audit log.', hasInput: true, noGen: true, inputLabel: 'Name', inputPh: 'Your name', preset: me?.name || '', input2Label: 'Name in Telugu', input2Ph: 'తెలుగులో పేరు', preset2: me?.name_te || '', teFromEn: true, confirmLabel: 'Save', onConfirm: (t, _sel, _gen, t2) => {
      const name = (t || '').trim();
      const nameTe = (t2 || '').trim();
      if (!name || (name === me?.name && nameTe === (me?.name_te || ''))) return;
      this.api.patch<Partial<Me> | null>('/me/', {name, name_te: nameTe}).then((d) => {
        this.setState((s) => ({me: s.me && {...s.me, ...(d || {}), name, name_te: nameTe}}));
        this.toast('Profile saved');
      }).catch((e: unknown) => this.fail(e));
    }});
  }

  renderVals() {
    const s = this.state, C = Component;
    const is = {checking: s.screen === 'checking', auth: s.screen === 'login' || s.screen === 'change_password', login: s.screen === 'login', changePassword: s.screen === 'change_password', app: s.screen === 'app'};
    const pg: Partial<Record<PageKey, boolean>> = {};
    pg[s.page] = true;
    const titles: Readonly<Record<NavKey, string>> = {bills: 'Bills & Recharges', ads: 'Sponsored banners', services: 'Services', requests: 'Services', dashboard: 'Dashboard', geography: 'Geography · Master Data', users: 'Users', posts: 'Posts', reports: 'Reports', audit: 'Audit Log', contact: 'Contact messages', numbers: 'Important numbers', settings: 'Settings'};
    const pendingN = s.pendingCount;
    const navItems = C.PAGES.filter((k) => this.navOk(k)).map((k) => {
      const on = s.page === k;
            return {label: k === 'posts' ? 'Posts' : titles[k].split(' ·')[0], d: C.ICON[k], color: on ? '#fff' : 'rgba(255,255,255,.78)', bg: on ? '#0D3B7A' : 'transparent', on, hasCount: k === 'posts' && pendingN > 0, count: pendingN, go: () => this.goPage(k)};
    });
    // The side bar in four short groups (same pages, same order inside a group); a group this user cannot open is left out.
    const NAV_GROUPS: readonly {label: string; keys: readonly PageKey[]}[] = [
      {label: '', keys: ['dashboard', 'reports']},
      {label: 'Content', keys: ['posts', 'ads']},
      {label: 'Citizens', keys: ['requests', 'bills', 'contact', 'numbers']},
      {label: 'Admin', keys: ['users', 'geography', 'audit', 'settings']},
    ];
    const navKeys = C.PAGES.filter((k) => this.navOk(k));
    const navGroups = NAV_GROUPS.map((g) => ({label: g.label, items: g.keys.filter((k) => navKeys.includes(k)).map((k) => navItems[navKeys.indexOf(k)])})).filter((g) => g.items.length);
    const districtOpts = s.geo.map((d) => ({id: String(d.id), label: d.name}));
    // modal
    const m = s.modal;
    const cannot = !!(m && ((m.needsText && !s.modalText.trim()) || (m.imageLabel && !s.modalFile)));
    const modal = m ? {show: true, title: m.title, body: m.body, hasInput: !!m.hasInput, inputType: m.password ? 'password' : 'text', hasGen: !!m.hasInput && !m.noGen, inputLabel: m.inputLabel || '', inputPh: m.inputPh || '', input2Label: m.input2Label || '', input2Ph: m.input2Ph || '', hasSecret: !!m.secret, secret: m.secret || '', hasCancel: !m.noCancel, needsText: !!m.needsText, textLabel: m.textLabel || '',
      hasSelect: !!m.hasSelect, selectLabel: m.selectLabel || '', options: m.options || [],
      imageLabel: m.imageLabel || '', image: s.modalImg, pickImage: () => this.pickModalImage(), confirmLabel: m.confirmLabel, bg: m.bg || '#0D3B7A', cannot, opacity: cannot ? .5 : 1} : {show: false, options: [], hasCancel: true};
    const me = s.me || {name: '', username: '', email: ''};
    return {screen: s.screen, is, pg, pageTitle: titles[s.page], navGroups, navOpen: s.navOpen, toggleNav: () => this.setState((st) => ({navOpen: !st.navOpen})), ...notificationsView(this.host), menuOpen: s.menuOpen, toggleMenu: () => this.setState((st) => ({menuOpen: !st.menuOpen, notifOpen: false})), menuProfile: () => this.editProfile(), goSettingsM: () => this.goPage('settings'), canSettings: this.navOk('settings'), menuChangePassword: () => this.openChangePassword(), goAudit: () => this.goPage('audit'),
      meName: me.name, meInitial: (me.name || '?')[0], stateName: s.stateRow ? s.stateRow.name_en : '', stateTe: s.stateRow ? s.stateRow.name_te : '',
      logout: () => this.logout(),
      frameW: '100%', frameH: '100vh', scrollRef: (el: HTMLDivElement | null) => { this.scrollEl = el; },
      username: s.username, password: s.password,
      onLogin: (e: FieldChange) => {
        const {name, value} = e.target;
        if (name === 'username' || name === 'password') this.setState(one(name, value));
      },
      onLoginKey: (e: React.KeyboardEvent) => { if (e.key === 'Enter') this.signIn(); }, cannotSignIn: !(s.username.trim() && s.password), signInOpacity: s.username.trim() && s.password ? 1 : .5, signIn: () => this.signIn(),
      pw: Object.fromEntries(['login', 'current', 'next'].map((k) => {
        const on = !!s.showPw[k];
        return [k, {shown: on, type: on ? 'text' : 'password', icon: on ? 'M3 3l18 18M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6C3.9 8.4 2 12 2 12s3.6 7 10 7a9.8 9.8 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2' : 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', label: on ? 'Hide password' : 'Show password', toggle: () => this.setState((st) => ({showPw: {...st.showPw, [k]: !st.showPw[k]}}))}];
      })),
      cpCurrent: s.cpCurrent, cpNext: s.cpNext,
      onCp: (e: FieldChange) => {
        const {name, value} = e.target;
        if (name === 'current') this.setState({cpCurrent: value});
        else this.setState({cpNext: value});
      },
      onCpKey: (e: React.KeyboardEvent) => { if (e.key === 'Enter') this.changePassword(); }, cannotChange: !(s.cpCurrent && s.cpNext), changeOpacity: s.cpCurrent && s.cpNext ? 1 : .5, changePassword: () => this.changePassword(),
      cpSub: s.cpVoluntary ? 'Your other sessions are signed out when you save.' : 'Choose your own password before you continue.', cpBackLabel: s.cpVoluntary ? '‹ Back' : '‹ Sign out',
      cpBack: () => {
        if (s.cpVoluntary) this.setState({screen: 'app', cpVoluntary: false, cpCurrent: '', cpNext: ''});
        else this.logout();
      },
      ...dashboardView(this.host),
      ...geographyView(this.host),
      ...usersView(this.host), districtOpts,
      ...postsView(this.host),
      ...reportsView(this.host), ...auditView(this.host),
      ...contactsView(this.host),
      ...requestsView(this.host),
      ...adsView(this.host), ...adFormView(this.host),
      ...composeView(this.host),
      ...servicesView(this.host),
      imp: s.imp ? {...s.imp, pct: Math.round(s.imp.done * 100 / s.imp.total), label: s.imp.phase + (s.imp.total > 1 ? ' part ' + Math.min(s.imp.done + 1, s.imp.total) + ' of ' + s.imp.total : '') + '…'} : null,
      ...requestPanelView(this.host), ...contactPanelView(this.host),
      ...numbersView(this.host),
      ...settingsView(this.host),
      ...postPanelView(this.host), ...userPanelView(this.host),
      modal, modalText: s.modalText, modalSel: s.modalSel, onModalText: (e: FieldChange) => {
        const t = e.target.value;
        this.setState({modalText: t});
        if (s.modal?.teFromEn) this.suggestTe('modal', t);
      }, modalText2: s.modalText2, onModalText2: (e: FieldChange) => this.setState({modalText2: e.target.value}), onModalSel: (e: FieldChange) => this.setState({modalSel: e.target.value}), closeModal: () => this.closeModal(),
      confirmModal: () => {
        if (!m || cannot) return;
        const t = s.modalText, sel = s.modalSel, gen = s.modalGen, t2 = s.modalText2, file = s.modalFile;
        this.closeModal();
        m.onConfirm(t, sel, gen, t2, file);
      },
      genModal: (e?: React.MouseEvent) => {
        e?.preventDefault();
        const p = this.newPassword();
        this.setState({modalText: p, modalGen: p});
      },
      copySecret: () => this.copySecret(), noop: () => {},
      toasts: s.toasts};
  }

  render() {
    const v = this.renderVals();
    return (
      <div data-screen-label={v.screen} style={css(`width: ${v.frameW ?? ""};min-height: ${v.frameH ?? ""};background:#F6F8F3;position:relative;font-family:'Nunito Sans','Noto Sans Telugu',sans-serif;color:#17212e;font-size:14px;overflow:hidden`)}>
        {" "}
        {/* CHECKING THE SESSION (page load) */}
        {v.is?.checking ? <Checking /> : null}
        {/* LOGIN / CHANGE PASSWORD */}
        {" "}
        {v.is?.auth ? <AuthLayout v={v} /> : null}
        {" "}
        {/* APP SHELL */}
        {" "}
        {v.is?.app ? <React.Suspense fallback={<Checking />}><AppShell v={v} /></React.Suspense> : null}
        {" "}
        {/* CSV import progress */}
        {v.imp ? <ImportProgressPanel imp={v.imp} /> : null}
        {/* TOASTS */}
        {" "}
        <Toasts v={v} />
      </div>
    );
  }
}
