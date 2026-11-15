// Super Admin console, ported from the approved prototype "Super Admin Console.dc.html"
// with the documented additions. The logic class holds all behaviour; render() is the template as JSX.
// Keep render() bound to the same renderVals() keys; map API data into those shapes in the logic.
import React from "react";
import { css } from "../shared/dc";
import GC_API, { ApiError, type Query } from "./api";
import Checking from "./screens/Checking";
import AuthLayout from "./layout/AuthLayout";
import Sidebar from "./layout/Sidebar";
import TopBar from "./layout/TopBar";
import DashboardScreen from "./screens/Dashboard";
import Geography from "./screens/Geography";
import Users from "./screens/Users";
import Posts from "./screens/Posts";
import Reports from "./screens/Reports";
import Audit from "./screens/Audit";
import Messages from "./screens/Messages";
import ServiceTabs from "./screens/ServiceTabs";
import Requests from "./screens/Requests";
import Ads from "./screens/Ads";
import Services from "./screens/Services";
import Numbers from "./screens/Numbers";
import SettingsScreen from "./screens/Settings";
import DetailPanel from "./panels/DetailPanel";
import UserDrawer from "./panels/UserDrawer";
import RequestPanel from "./panels/RequestPanel";
import ContactPanel from "./panels/ContactPanel";
import ServiceFormPanel from "./panels/ServiceForm";
import AdFormPanel from "./panels/AdForm";
import ComposeFormPanel from "./panels/ComposeForm";
import NumberFormPanel from "./panels/NumberForm";
import TypeFormPanel from "./panels/TypeForm";
import ConfirmModal from "./panels/ConfirmModal";
import ImportProgressPanel from "./panels/ImportProgress";
import Toasts from "./panels/Toasts";
import type { ConsoleHost } from "./logic/host";
import { contactPanelView, contactsView, loadContacts } from "./logic/messages";
import { loadRequests, openRequest, requestPanelView, requestsView } from "./logic/requests";
import { adFormView, adsView, loadAds } from "./logic/ads";
import { auditRow, auditView, loadAudit } from "./logic/audit";
import { loadReports, reportsView } from "./logic/reports";
import { loadCategories, loadSettings, settingsView } from "./logic/settings";
import { loadServices, servicesView } from "./logic/services";
import { loadNumbers, loadTypes, numbersView } from "./logic/numbers";
import { geographyView } from "./logic/geography";
import { addRole, editUser, loadUsers, reassignUser, removeRole, resetPassword, roleChoices, toggleUser, unlockUser, userCan, usersView } from "./logic/users";
import type { Area, Dashboard, DiscardCitizenResult, GeoState,
  ConsoleNotification, LoginResponse, Me, NotificationPage, Paged, Post, PostsPage, ReviewAction, ServiceRequest,
} from "./types";

import { FORMS, ROLE, RK, LEVEL_OF_ROLE, pager, one, isStatus, PAGE_SIZE, pageCount, blobPreviews, isActor, historyPage, EMPTY_NU } from "./model";
import type { Props, PageKey, NavKey, FieldChange, Timer, AreaOption, ModalSpec, ComposeForm, GeoDistrictRow, AdminUser, PostRow, SelKey, SelId, BulkOptions, SelView, State, TeForm, Tone } from "./model";
export type { SelView } from "./model";

export type View = ReturnType<Component["renderVals"]>;

export default class Component extends React.Component<Props, State> {
  private static readonly ICON: Readonly<Record<NavKey, string>> = {bills:'M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1zM16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11',services:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',ads:'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM2 15l5-5 4 4 3-3 8 8M15.5 9.5h.01',requests:'M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z',contact:'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',numbers:'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',dashboard:'M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z',geography:'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',users:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',posts:'M4 4h13a3 3 0 0 1 3 3v12H5a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1zm3 4h6M7 12h6M7 16h4M16 8h1M16 12h1',reports:'M3 20h18M6 17V10M11 17V4M16 17v-7M21 17v-4',audit:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 8h6m-6 4h4',settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-1.7-1L14.8 3H9.2l-.4 2.6a7.5 7.5 0 0 0-1.7 1l-2.4-1-2 3.4L4.7 11a7.4 7.4 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 1.7 1l.4 2.6h5.6l.4-2.6a7.5 7.5 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1z'};
  private static readonly STATUS: Readonly<Record<string, Tone>> = {Pending:{bg:'#fff0dc',color:'#b35a0e',label:'Pending'},Published:{bg:'#e4f4df',color:'#1d7a33',label:'Published'},Recheck:{bg:'#f1e6f7',color:'#8f4bb4',label:'Recheck'},Discarded:{bg:'#eef2f6',color:'#3b4a5c',label:'Discarded'},TakenDown:{bg:'#fde7e5',color:'#b3261e',label:'Taken down'},Draft:{bg:'#eef2f6',color:'#6b7a8c',label:'Draft'}};
  private static readonly ROLE = ROLE;
  // API values -> the prototype's keys
  private static readonly RK = RK;
  private static readonly SK: Readonly<Record<string, string>> = {PENDING:'Pending',PUBLISHED:'Published',RECHECK:'Recheck',DISCARDED:'Discarded',UNPUBLISHED:'TakenDown',DRAFT:'Draft'};
  private static readonly SAPI: Readonly<Record<string, string>> = {Pending:'PENDING',Published:'PUBLISHED',Recheck:'RECHECK',Discarded:'DISCARDED',TakenDown:'UNPUBLISHED'};
  private static readonly LEVEL_OF_ROLE = LEVEL_OF_ROLE;
  private static readonly HIST: Readonly<Record<string, string>> = {SUBMIT:'Submitted for review',RESUBMIT:'Resubmitted',PUBLISH:'Published',AUTO_PUBLISH:'Published directly (admin post)',RECHECK:'Sent back for recheck',DISCARD:'Discarded',UNPUBLISH:'Taken down',ESCALATE:'Escalated'};
  private static readonly EVENT: Readonly<Record<string, readonly [string, string, string]>> = {deadline:['Deadline','#fff0dc','#b35a0e'],camp:['Camp','#e4f4df','#1d7a33'],distribution:['Distribution','#e3f0fb','#0D3B7A'],closure:['Closure','#eef2f6','#3b4a5c'],meeting:['Meeting','#f1e6f7','#8f4bb4']};
  private static readonly PAGE = PAGE_SIZE;
  private static readonly PAGES: readonly PageKey[] = ['dashboard','geography','users','posts','requests','bills','ads','reports','audit','contact','numbers','settings'];
  // A page shows when the user has any one of these permissions (BackEnd apps/accounts/role_matrix.py).
  private static readonly NAV_PERM: Readonly<Record<NavKey, readonly string[]>> = {bills:['bills.manage_bills'],services:['service_requests.manage_services'],dashboard:['web_admin.view_dashboard'],geography:['geography.manage_master_data'],users:['accounts.manage_district_admin','accounts.manage_mandal_admin','accounts.manage_village_admin','accounts.manage_panchayat_member'],posts:['posts.view_review_queue'],reports:['web_admin.view_reports'],audit:['audit.view_audit_log'],contact:['web_public.manage_contact_messages'],requests:['service_requests.view_service_requests','service_requests.manage_services'],ads:['ads.manage_ad'],numbers:['contacts.manage_contact'],settings:['posts.manage_settings','posts.manage_categories','notifications.manage_templates']};
  private static readonly CONSOLE_PERM = 'web_admin.access_web_console';
  private static readonly LOGIN_ERR: Readonly<Record<string, string>> = {invalid_credentials:'Wrong username or password.',not_console_user:'This console is for Super Admins only. Use the mobile app.',account_blocked:'This account is blocked. Contact your administrator.'};

  // The console signs out after this long without a key press, click, scroll or pointer move (owner decision of
  // 2026-10-21: 30-minute idle timeout). The bell's background poll does not count, though it keeps the server
  // session fresh, so the console itself ends an unattended session.
  private static readonly IDLE_MS = 30 * 60 * 1000;
  private static readonly ACTIVITY: readonly string[] = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'];

  // Everything the console shows starts from here, and goes back here on sign-out (nothing of the last session stays).
  private static readonly INITIAL: State = {
    screen: 'checking', page: 'dashboard', username: '', password: '', cpCurrent: '', cpNext: '', cpVoluntary: false, showPw: {}, menuOpen: false, navOpen: false, exporting: null, notifOpen: false, notifs: [], notifUnread: 0, notifNext: null, notifLoading: false, notifError: false, gsearch: '', me: null,
    geo: [], stateRow: null, expanded: {}, geoQ: '', geoForm: null,
    users: [], userCount: 0, userPage: 1, userPages: 1, usersLoading: false,
    reqs: [], reqCount: 0, reqPage: 1, reqPages: 1, reqLoading: false, reqFilter: 'NEW', svcView: 'requests', ads: [], adsLoading: false, adsUnavailable: false, af: null,
    svcs: [], svcsLoading: false, svcsUnavailable: false, bills: [], billsLoading: false, billsUnavailable: false, sf: null, reqQ: '', reqCounts: {}, reqUnavailable: false,
    rq: null, cm: null, rqAssignees: [], uf: {role: '', district: '', status: '', q: ''},
    posts: [], postCount: 0, postPage: 1, postPages: 1, postsLoading: false, statusCounts: {}, pendingCount: 0, pf: {district: '', cat: '', source: ''}, statusTab: 'Pending',
    numSel: [], adSel: [], bulk: '', cf: null,
    panel: null, panelPost: null, panelHistory: [], panelUser: null, panelUserPosts: [], drawerOpen: false, nu: {...EMPTY_NU},
    audit: [], auditCount: 0, auditPage: 1, auditPages: 1, auditQ: '', auditType: '', distQ: '', auditLoading: false,
    contacts: [], contactCount: 0, contactPage: 1, contactPages: 1, contactQ: '', contactFilter: 'new', contactLoading: false,
    nums: [], numCount: 0, numPage: 1, numPages: 1, numLoading: false, numTab: 'AREA', numQ: '', numType: '', numDistrict: '', ctypes: [], ctypesAdmin: [], nf: null, tf: null,
    dash: null, reports: {summary: null, byArea: [], reviewTime: [], activity: []}, categories: [],
    settings: {escalation: 24, citizenPerDay: 5, langs: {te: true, en: true}, templates: []},
    modal: null, modalText: '', modalText2: '', modalSel: '', modalGen: '', toasts: [], imp: null,
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
  private searchTimer: Timer | undefined;
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
    openUser: (u) => c.openUser(u),
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
    clearTimeout(this.searchTimer);
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
    if (Date.now() - this.lastActive < Component.IDLE_MS) return false;
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
    this.setState({modal: m, modalText: m.preset || '', modalText2: m.preset2 || '', modalSel: m.sel || (m.options && m.options.length ? m.options[0].id : ''), modalGen: ''});
  }

  private closeModal() {
    this.setState({modal: null, modalText: '', modalText2: '', modalSel: '', modalGen: ''});
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

  // Where a post goes: one post can go to Everyone or to several areas (`targets`): "Guntur +2".
  private postWhere(p: Post) {
    const t = p.targets || [];
    if (!t.length) return this.an(p.target_area);
    if (t[0].level === 'STATE') return 'Everyone';
    return this.an(t[0]) + (t.length > 1 ? ' +' + (t.length - 1) : '');
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
    this.setState({me, screen: 'app', page, svcView: cat ? 'catalog' : 'requests', password: '', cpCurrent: '', cpNext: '', cpVoluntary: false, showPw: {}});
    this.loadGeo();
    loadCategories(this.host);
    this.loadPage(page);
    this.loadNotifs();
    this.lastActive = Date.now();
    clearInterval(this.notifTimer);
    this.notifTimer = setInterval(() => {
      // An unattended console signs out after IDLE_MS; the poll itself must not keep it signed in.
      if (this.checkIdle()) return;
      // Only while signed in, the tab is visible and the list is closed (an open list is not reshuffled under the cursor).
      if (this.state.screen === 'app' && !this.state.notifOpen && document.visibilityState === 'visible') this.loadNotifs();
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
      const me = (d && d.user) || d;
      if (this.afterLogin(me)) this.toast('Welcome, ' + me.name);
    }).catch((e: unknown) => {
      this.setState({password: ''});
      this.loginFail(e);
    });
  }

  private loginFail(e: unknown) {
    const c = e instanceof ApiError ? e.code : undefined, L = Component.LOGIN_ERR;
    if (e instanceof ApiError && (c === 'locked_out' || c === 'throttled')) {
      const sec = Number(e.body.retry_after_s) || (c === 'throttled' ? 3600 : 900);
      const min = Math.max(1, Math.ceil(sec / 60));
      const what = c === 'throttled' ? 'Too many logins from this network.' : 'Too many failed attempts.';
      this.toast(what + ' Try again in ' + min + ' minute' + (min === 1 ? '' : 's') + '.', '#b3261e');
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
    if (p === 'dashboard') this.loadDash();
    if (p === 'users') loadUsers(this.host, 1);
    if (p === 'posts') this.loadPosts(1);
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
    if (p === 'geography') this.loadGeo();
  }

  private loadGeo() {
    return this.api.get<GeoState[]>('/geo/tree/', {villages: 1}).then((tree) => {
      const st = tree[0] || null;
      const teMap: Record<string, string> = {};
      const geo = (st ? st.districts : []).map((d): GeoDistrictRow => {
        teMap['DISTRICT:' + d.id] = d.name_te;
        return {id: d.id, name: d.name_en, te: d.name_te, lgd: d.lgd_code || '', active: d.is_active, mandals: d.mandals.map((m) => {
          teMap['MANDAL:' + m.id] = m.name_te;
          return {id: m.id, name: m.name_en, te: m.name_te, lgd: m.lgd_code || '', active: m.is_active, villages: (m.villages || []).map((v) => {
            teMap['VILLAGE:' + v.id] = v.name_te;
            return {id: v.id, name: v.name_en, te: v.name_te, lgd: v.lgd_code || '', lat: v.latitude || '', lng: v.longitude || '', pin: v.pin_code || '', active: v.is_active};
          })};
        })};
      });
      if (st) teMap['STATE:' + st.id] = st.name_te;
      this.teNames = teMap;
      const expanded = {...this.state.expanded};
      if (geo[0] && !Object.keys(expanded).length) {
        expanded[geo[0].id] = true;
        if (geo[0].mandals[0]) expanded['m' + geo[0].mandals[0].id] = true;
      }
      this.setState({geo, stateRow: st, expanded});
    }).catch((e: unknown) => this.fail(e));
  }

  private loadDash() {
    this.api.get<Dashboard>('/admin/dashboard/').then((dash) => this.setState({dash, pendingCount: dash.kpis.pending})).catch((e: unknown) => this.fail(e));
  }

  private adaptPost(p: Post): PostRow {
    const a = p.author;
    const role = Component.RK[a?.role ?? ''] || 'panchayat';
    return {
      id: p.id, raw: p, cat: p.category ? p.category.key : 'updates', catLabel: p.category ? p.category.name : '',
      titleTe: p.title, titleEn: p.translation ? p.translation.title : '', bodyTe: p.body, bodyEn: p.translation ? p.translation.body : '',
      area: this.postWhere(p), areaName: p.target_area ? p.target_area.name : '', date: this.fmt(p.submitted_at || p.published_at || p.created_at),
      author: a?.name || (p.citizen ? 'Citizen' : '—'), role, status: Component.SK[p.status] || 'Pending',
      media: (p.media || []).filter((m) => m.kind !== 'video'), videos: (p.media || []).filter((m) => m.kind === 'video'),
      urgent: !!p.is_urgent, event: p.event || null, allowed: p.allowed_actions || [], citizen: p.citizen || null,
    };
  }

  private postQuery(page: number): Query {
    const s = this.state;
    return {status: s.statusTab === 'All' ? '' : Component.SAPI[s.statusTab], source: s.pf.source, district: s.pf.district, category: s.pf.cat, q: s.gsearch, page, page_size: Component.PAGE};
  }

  private loadPosts(page: number) {
    const latest = this.ticket('posts');
    this.setState({postsLoading: true});
    this.api.get<PostsPage>('/posts/', this.postQuery(page))
      .then((d) => latest() && this.setState({posts: d.results.map((p) => this.adaptPost(p)), postCount: d.count, postPage: page, postPages: pageCount(d.count), statusCounts: d.status_counts || {}, pendingCount: (d.status_counts || {}).PENDING || 0, postsLoading: false}))
      .catch((e: unknown) => {
        if (!latest()) return;
        this.setState({postsLoading: false});
        this.fail(e);
      });
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
    const mine = () => {
      const f = this.state[form];
      return !!f && seq === this.teSeq && (!(f.te || '').trim() || f.te === this.teAuto);
    };
    const put = (te: string) => {
      this.teAuto = te;
      this.setState((st) => {
        const f = st[form];
        return f ? one(form, {...f, te}) : null;
      });
    };
    if (!mine()) return;
    if (!en.trim()) {
      if (this.state[form]?.te) put('');
      return;
    }
    this.teTimer = setTimeout(() => this.api.get<{te: string}>('/admin/transliterate/', {text: en.trim().slice(0, 150)})
      .then((r) => {
        if (r?.te && mine()) put(r.te);
      }).catch(() => {}), 400);
  }

  // ---- new post (the app's Compose) ----
  // Up to 3 photos, or one video, never both (lead's decision of 2026-11-13, for everyone who posts);
  // the video at most 60 MB and 60 seconds (lead's decision of 2026-11-14; banner videos have no
  // time limit, logic/ads.ts). The same numbers as the server: MAX_PHOTOS_PER_POST, MAX_IMAGE_UPLOAD_MB,
  // MAX_VIDEO_UPLOAD_MB and VIDEO_MAX_SECONDS. Change them together.
  private static readonly CF_MAX_PHOTOS = 3;
  private static readonly CF_MAX_MB = 10;
  private static readonly CF_VIDEO_MAX_MB = 60;
  private static readonly CF_VIDEO_MAX_S = 60;

  private openCompose() {
    const cats = this.state.categories.filter((c) => c.is_active);
    this.setState({cf: {cat: cats[0]?.key || '', lang: 'te', title: '', body: '', d: '', m: '', v: '', urgent: false, files: [], previews: [], kinds: [], durs: [], posters: [], checking: 0, saving: false, tried: false, step: '', postId: '', uploaded: 0, photoErr: ''}});
  }

  private closeCompose() {
    const f = this.state.cf;
    if (f && f.saving) return;
    f?.previews.forEach((u) => URL.revokeObjectURL(u));
    this.setState({cf: null});
  }

  private cfErrors(f: ComposeForm): Partial<Record<'cat' | 'title' | 'body', string>> {
    const e: Partial<Record<'cat' | 'title' | 'body', string>> = {};
    if (!f.cat) e.cat = 'Choose a category.';
    if (!f.title.trim()) e.title = 'Write a title.';
    if (!f.body.trim()) e.body = 'Write the message.';
    return e;
  }

  private onCF(e: FieldChange) {
    const {name, value} = e.target;
    this.setState((st) => {
      if (!st.cf) return null;
      const p: Partial<ComposeForm> = name === 'd' ? {d: value, m: '', v: ''} : name === 'm' ? {m: value, v: ''} : {[name]: value};
      return {cf: {...st.cf, ...p}};
    });
  }

  /** Add one file to the form, at the end. */
  private addCFItem(file: File, kind: 'image' | 'video', url: string, dur: number, poster: Blob | null, err = '') {
    this.setState((st) => {
      const f = st.cf;
      if (!f) {
        URL.revokeObjectURL(url);
        return null;
      }
      return {cf: {...f, files: [...f.files, file], previews: [...f.previews, url], kinds: [...f.kinds, kind], durs: [...f.durs, dur], posters: [...f.posters, poster], photoErr: err || f.photoErr}};
    });
  }

  /** A video's length and first frame, read in the browser. Null when the browser cannot play it. */
  private readVideo(url: string): Promise<{secs: number; poster: Blob | null} | null> {
    return new Promise((resolve) => {
      const probe = document.createElement('video');
      probe.preload = 'auto';
      probe.muted = true;
      let secs = 0;
      // A browser that never seeks still gets an answer: the length without a poster.
      setTimeout(() => resolve(secs > 0 ? {secs, poster: null} : null), 8000);
      const posterNow = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = probe.videoWidth;
          canvas.height = probe.videoHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx || !canvas.width || !canvas.height) return resolve({secs, poster: null});
          ctx.drawImage(probe, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => resolve({secs, poster: blob}), 'image/jpeg', 0.85);
        } catch {
          resolve({secs, poster: null});
        }
      };
      probe.onloadedmetadata = () => {
        secs = probe.duration;
        if (!isFinite(secs) || secs <= 0) return resolve(null);
        probe.currentTime = Math.min(1, secs / 2); // the first second, as the server's poster
      };
      probe.onseeked = posterNow;
      probe.onerror = () => resolve(secs > 0 ? {secs, poster: null} : null);
      probe.src = url;
    });
  }

  // Up to 3 photos, or one video, never both. Photos are added at once; a video after its length and
  // first frame are read (sent as duration_s and poster for a server without ffmpeg); one over
  // 60 seconds is refused here (the server allows half a second of slack, as here).
  private pickCFMedia(e: React.ChangeEvent<HTMLInputElement>) {
    const f = this.state.cf;
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    if (!f || !picked.length) return;
    const setErr = (photoErr: string) => this.setState((st) => st.cf ? {cf: {...st.cf, photoErr}} : null);
    const isPhoto = (x: File) => /^image\/(jpeg|png|webp)$/.test(x.type);
    const isVideo = (x: File) => /^video\/(mp4|quicktime)$/.test(x.type);
    const both = 'A post has up to ' + Component.CF_MAX_PHOTOS + ' photos or one video, not both.';
    if (f.kinds.includes('video') || f.checking) return setErr(both + ' Remove the video first.');
    if (picked.some((x) => !isPhoto(x) && !isVideo(x))) return setErr('Choose JPG, PNG or WebP photos, or an MP4 or MOV video.');
    const videos = picked.filter(isVideo), photos = picked.filter(isPhoto);
    if (videos.length) {
      if (photos.length || f.files.length) return setErr(both + (f.files.length ? ' Remove the photos first.' : ''));
      if (videos.length > 1) return setErr('A post can have one video.');
      const file = videos[0];
      if (file.size > Component.CF_VIDEO_MAX_MB * 1024 * 1024) return setErr(file.name + ' is larger than ' + Component.CF_VIDEO_MAX_MB + ' MB.');
      const url = URL.createObjectURL(file);
      this.setState({cf: {...f, photoErr: '', checking: 1}});
      this.readVideo(url).then((read) => {
        this.setState((st) => st.cf ? {cf: {...st.cf, checking: 0}} : null);
        if (!read) {
          URL.revokeObjectURL(url);
          return setErr(file.name + ' could not be read. Try an MP4 file.');
        }
        if (read.secs > Component.CF_VIDEO_MAX_S + 0.5) {
          URL.revokeObjectURL(url);
          return setErr(file.name + ' is longer than ' + Component.CF_VIDEO_MAX_S + ' seconds.');
        }
        this.addCFItem(file, 'video', url, Math.round(read.secs), read.poster);
      });
      return;
    }
    const room = Math.max(0, Component.CF_MAX_PHOTOS - f.files.length);
    const small = photos.filter((x) => x.size <= Component.CF_MAX_MB * 1024 * 1024);
    const added = small.slice(0, room);
    const err = small.length < photos.length ? 'Photos larger than ' + Component.CF_MAX_MB + ' MB were not added.'
      : added.length < small.length ? 'Up to ' + Component.CF_MAX_PHOTOS + ' photos per post.' : '';
    this.setState({cf: {...f, photoErr: err}});
    added.forEach((x) => this.addCFItem(x, 'image', URL.createObjectURL(x), 0, null));
  }

  private removeCFPhoto(i: number) {
    const f = this.state.cf;
    if (!f || f.saving) return;
    URL.revokeObjectURL(f.previews[i]);
    const keep = (_: unknown, k: number) => k !== i;
    this.setState({cf: {...f, files: f.files.filter(keep), previews: f.previews.filter(keep), kinds: f.kinds.filter(keep), durs: f.durs.filter(keep), posters: f.posters.filter(keep), photoErr: ''}});
  }

  private saveCompose() {
    const f = this.state.cf;
    if (!f || f.saving) return;
    if (Object.keys(this.cfErrors(f)).length) {
      this.setState({cf: {...f, tried: true}});
      return;
    }
    const st = this.state.stateRow;
    const target = f.v ? {level: 'VILLAGE', id: Number(f.v)} : f.m ? {level: 'MANDAL', id: Number(f.m)} : f.d ? {level: 'DISTRICT', id: Number(f.d)} : st ? {level: 'STATE', id: st.id} : null;
    if (!target) {
      this.toast('Areas are still loading. Try again in a moment.', '#b3261e');
      return;
    }
    if (f.checking) {
      this.toast('A video is still being checked. Try again in a moment.', '#b3261e');
      return;
    }
    const setF = (p: Partial<ComposeForm>) => this.setState((x) => ({cf: x.cf && {...x.cf, ...p}}));
    const count = f.files.length;
    setF({saving: true, step: 'Saving…'});
    const created: Promise<Post> = f.postId
      ? Promise.resolve({id: f.postId} as Post)
      : this.api.post<Post>('/posts/', {category: f.cat, language: f.lang, title: f.title.trim(), body: f.body.trim(), targets: [target], is_urgent: f.urgent, submit: !count});
    created.then(async (p) => {
      if (!count) return p;
      setF({postId: p.id});
      // One file per request, in the order picked; each goes after those already on the post.
      for (let i = this.state.cf?.uploaded || 0; i < count; i++) {
        const video = f.kinds[i] === 'video';
        setF({step: 'Uploading ' + (video ? 'video' : 'photo') + ' ' + (i + 1) + ' of ' + count + '…'});
        const form = new FormData();
        form.append('kind', f.kinds[i]);
        form.append('file', f.files[i]);
        if (video) {
          // Used only by a server without ffmpeg; one with it measures and cuts its own poster.
          if (f.durs[i]) form.append('duration_s', String(f.durs[i]));
          const poster = f.posters[i];
          if (poster) form.append('poster', poster, 'poster.jpg');
        }
        await this.api.upload('/posts/' + p.id + '/media/', form);
        setF({uploaded: i + 1});
      }
      setF({step: 'Publishing…'});
      return this.api.post<Post>('/posts/' + p.id + '/submit/');
    }).then((p) => {
      f.previews.forEach((u) => URL.revokeObjectURL(u));
      this.setState({cf: null});
      this.toast(p && p.status === 'PUBLISHED' ? 'Post published' : 'Post sent for review');
      if (this.state.page === 'posts') this.loadPosts(1);
    }).catch((e: unknown) => {
      setF({saving: false, step: ''});
      this.fail(e);
    });
  }

  // ---- notifications (the bell) ----
  private loadNotifs(more?: boolean) {
    const cursor = more ? this.state.notifNext : null;
    if (more && !cursor) return;
    this.setState({notifLoading: true, notifError: false});
    this.api.get<NotificationPage>('/notifications/', cursor ? {cursor} : undefined).then((d) => {
      let next: string | null = null;
      try {
        next = d.next ? new URL(d.next, window.location.href).searchParams.get('cursor') : null;
      } catch {
        next = null;
      }
      this.setState((s) => ({notifs: more ? [...s.notifs, ...(d.results || [])] : (d.results || []), notifUnread: d.unread_count ?? 0, notifNext: next, notifLoading: false}));
    }).catch(() => this.setState({notifLoading: false, notifError: true}));
  }

  private toggleNotifs() {
    const open = !this.state.notifOpen;
    this.setState({notifOpen: open, menuOpen: false});
    if (open) this.loadNotifs();
  }

  // Open what the notification is about (its post or service request) and mark it read.
  private openNotif(n: ConsoleNotification) {
    if (!n.read_at) {
      const now = new Date().toISOString();
      this.setState((s) => ({notifs: s.notifs.map((x) => x.id === n.id ? {...x, read_at: now} : x), notifUnread: Math.max(0, s.notifUnread - 1)}));
      this.api.post('/notifications/' + n.id + '/read/').catch(() => {});
    }
    this.setState({notifOpen: false});
    if (n.post_id) {
      this.api.get<Post>('/posts/' + n.post_id + '/').then((p) => this.openPost(this.adaptPost(p))).catch((e: unknown) => this.fail(e));
    } else if (n.service_request_id) {
      this.api.get<ServiceRequest>('/service-requests/' + n.service_request_id + '/').then((r) => openRequest(this.host, r)).catch((e: unknown) => this.fail(e));
    }
  }

  private readAllNotifs() {
    const now = new Date().toISOString();
    this.setState((s) => ({notifs: s.notifs.map((x) => x.read_at ? x : {...x, read_at: now}), notifUnread: 0}));
    this.api.post('/notifications/read-all/').catch((e: unknown) => {
      this.fail(e);
      this.loadNotifs();
    });
  }

  /** "Just now", "5 min ago", "3 h ago", "2 d ago", then the date. */
  private ago(iso: string) {
    const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (isNaN(min)) return '';
    if (min < 1) return 'Just now';
    if (min < 60) return min + ' min ago';
    if (min < 24 * 60) return Math.floor(min / 60) + ' h ago';
    if (min < 7 * 24 * 60) return Math.floor(min / (24 * 60)) + ' d ago';
    return this.fmt(iso, false);
  }

  private openPost(p: PostRow) {
    this.setState({panel: {type: 'post', id: p.id}, panelPost: p, panelHistory: []});
    const latest = this.ticket('panel');
    this.api.get<ReviewAction[]>('/posts/' + p.id + '/history/').then((h) => {
      if (latest()) this.setState({panelHistory: h});
    }).catch((e: unknown) => latest() && this.fail(e));
  }

  private refreshPost(id: string) {
    return this.api.get<Post>('/posts/' + id + '/').then((p) => {
      const ap = this.adaptPost(p);
      this.setState((s) => ({panelPost: s.panel && s.panel.id === id ? ap : s.panelPost, posts: s.posts.map((x) => x.id === id ? ap : x)}));
      return this.api.get<ReviewAction[]>('/posts/' + id + '/history/').then((h) => {
        if (this.state.panel && this.state.panel.id === id) this.setState({panelHistory: h});
      });
    }).catch((e: unknown) => this.fail(e));
  }

  // The user's recent posts: dropped if another user's panel opened meanwhile (no one else's posts under this name).
  private openUser(u: AdminUser) {
    this.setState({panel: {type: 'user', id: u.id}, panelUser: u, panelUserPosts: []});
    const latest = this.ticket('panel');
    this.api.get<Paged<Post>>('/posts/', {author: u.id, page_size: 5}).then((d) => {
      if (latest()) this.setState({panelUserPosts: d.results.map((p) => this.adaptPost(p))});
    }).catch((e: unknown) => latest() && this.fail(e));
  }

  // ---- posts actions ----
  private review(p: PostRow, body: {action: string; comment?: string; to_status?: string}, done: () => void) {
    this.api.post('/posts/' + p.id + '/review/', body).then(() => {
      done();
      this.loadPosts(this.state.postPage);
      this.refreshPost(p.id);
    }).catch((e: unknown) => {
      if (e instanceof ApiError && e.code === 'already_decided') {
        const by = e.body.decided_by;
        const who = isActor(by) ? (by.name + ' (' + ((Component.ROLE[Component.RK[by.role]] || {}).label || by.role) + ')') : 'another reviewer';
        this.toast('Already decided by ' + who + '. Showing the latest status.', '#E9791E');
        this.loadPosts(this.state.postPage);
        this.refreshPost(p.id);
        return;
      }
      this.fail(e);
    });
  }

  private postAction(kind: string, p: PostRow) {
    if (kind === 'urgent') {
      this.urgentPost(p);
      return;
    }
    const title = p.titleTe;
    const area = p.areaName;
    const C = Component;
    // Citizens' posts (contract section 15): block the phone for some days, unblock, or discard all its pending posts.
    const after = (msg: string) => () => {
      this.toast(msg);
      this.setState({panel: null});
      this.loadPosts(this.state.postPage);
    };
    if (kind === 'blockCitizen') this.ask({title: 'Block this citizen', body: 'The phone cannot post until the block ends. Its other pending posts in your area are discarded. The citizen sees your reason.', hasSelect: true, selectLabel: 'Block for', options: [{id: '1', label: '1 day'}, {id: '7', label: '7 days'}, {id: '30', label: '30 days'}, {id: '90', label: '90 days'}], sel: '7', needsText: true, textLabel: 'Reason (required)', confirmLabel: 'Block', bg: '#b3261e', onConfirm: (t, sel) => this.api.post('/posts/' + p.id + '/block-citizen/', {comment: t, days: Number(sel || 7)}).then(after('Citizen blocked')).catch((e: unknown) => this.fail(e))});
    if (kind === 'unblockCitizen') this.ask({title: 'Unblock this citizen', body: 'The phone can post again.', confirmLabel: 'Unblock', bg: '#1d7a33', onConfirm: () => this.api.post('/posts/' + p.id + '/unblock-citizen/', {comment: ''}).then(after('Citizen unblocked')).catch((e: unknown) => this.fail(e))});
    if (kind === 'discardCitizen') this.ask({title: 'Discard all their pending posts', body: 'Every pending post from this phone is discarded (for spam). The phone is not blocked.', needsText: true, textLabel: 'Reason (required)', confirmLabel: 'Discard all', bg: '#3b4a5c', onConfirm: (t) => this.api.post<DiscardCitizenResult | null>('/posts/' + p.id + '/discard-citizen-posts/', {comment: t}).then((d) => after('Discarded ' + ((d && d.discarded) || 0) + ' posts')()).catch((e: unknown) => this.fail(e))});
    if (kind === 'publish') this.ask({title: 'Publish post', body: 'Publish "' + title + '" to citizens in ' + area + '? This overrides the local review queue.', confirmLabel: 'Publish', bg: '#1F8A3B', onConfirm: () => this.review(p, {action: 'publish'}, () => this.toast('Post published'))});
    if (kind === 'recheck') this.ask({title: 'Send for recheck', body: 'The author will see your comment and can edit and resubmit.', needsText: true, textLabel: 'Comment to author (required)', confirmLabel: 'Send for recheck', bg: '#E9791E', onConfirm: (t) => this.review(p, {action: 'recheck', comment: t}, () => this.toast('Sent back for recheck', '#E9791E'))});
    if (kind === 'discard') this.ask({title: 'Discard post', body: 'The post will not be published. The author is notified with your reason.', needsText: true, textLabel: 'Reason (required)', confirmLabel: 'Discard', bg: '#3b4a5c', onConfirm: (t) => this.review(p, {action: 'discard', comment: t}, () => this.toast('Post discarded', '#cfd8e3'))});
    if (kind === 'takedown') this.ask({title: 'Take down post', body: 'Remove "' + title + '" from all citizen feeds immediately.', needsText: true, textLabel: 'Reason (required)', confirmLabel: 'Take down', bg: '#b3261e', onConfirm: (t) => this.review(p, {action: 'unpublish', comment: t}, () => this.toast('Post taken down', '#E9791E'))});
    if (kind === 'override') this.ask({title: 'Override previous decision', body: 'Current status: ' + C.STATUS[p.status].label + '. Choose the new status and record why you are overriding the earlier reviewer.', hasSelect: true, selectLabel: 'New status', options: [{id: 'Published', label: 'Published'}, {id: 'Pending', label: 'Pending (back to queue)'}, {id: 'Recheck', label: 'Recheck'}, {id: 'Discarded', label: 'Discarded'}].filter((o) => o.id !== p.status), needsText: true, textLabel: 'Override reason (required)', confirmLabel: 'Override', bg: '#0D3B7A', onConfirm: (t, sel) => this.review(p, {action: 'reverse', to_status: C.SAPI[sel], comment: t}, () => this.toast('Decision overridden → ' + C.STATUS[sel].label))});
  }

  private urgentPost(p: PostRow) {
    const on = !p.urgent;
    this.api.post('/posts/' + p.id + '/urgent/', {is_urgent: on}).then(() => {
      this.toast(on ? 'Marked urgent' : 'Urgent mark removed', on ? '#E9791E' : '#6cc04a');
      this.loadPosts(this.state.postPage);
      this.refreshPost(p.id);
    }).catch((e: unknown) => this.fail(e));
  }

  private areaOptions(role: string): AreaOption[] {
    const lv = Component.LEVEL_OF_ROLE[role];
    const g = this.state.geo;
    const st = this.state.stateRow;
    if (lv === 'STATE') return st ? [{id: String(st.id), label: st.name_en, level: lv}] : [];
    if (lv === 'DISTRICT') return g.filter((d) => d.active).map((d) => ({id: String(d.id), label: this.nl(d), level: lv}));
    if (lv === 'MANDAL') return g.flatMap((d) => d.mandals.filter((m) => m.active && d.active).map((m) => ({id: String(m.id), label: this.nl(m), level: lv})));
    return g.flatMap((d) => d.mandals.flatMap((m) => m.villages.filter((v) => v.active && m.active && d.active).map((v) => ({id: String(v.id), label: this.nl(v), level: 'VILLAGE' as const}))));
  }

  private editProfile() {
    const me = this.state.me;
    const g = (me?.groups || []).map((x) => x.name || x.label || x.key || x).join(', ') || 'Super Admin';
    this.setState({menuOpen: false});
    // Name and Telugu name, as on the app's profile (PATCH /me/).
    this.ask({title: 'My profile', body: 'Signed in as ' + (me?.username || '') + ' · ' + g + '. Your name shows in the console, the app and the audit log.', hasInput: true, noGen: true, inputLabel: 'Name', inputPh: 'Your name', preset: me?.name || '', input2Label: 'Name in Telugu', input2Ph: 'తెలుగులో పేరు', preset2: me?.name_te || '', confirmLabel: 'Save', onConfirm: (t, _sel, _gen, t2) => {
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
    const s = this.state, C = Component, ST = C.STATUS, R = C.ROLE;
    const is = {checking: s.screen === 'checking', auth: s.screen === 'login' || s.screen === 'change_password', login: s.screen === 'login', changePassword: s.screen === 'change_password', app: s.screen === 'app'};
    const pg: Partial<Record<PageKey, boolean>> = {};
    pg[s.page] = true;
    const titles: Readonly<Record<NavKey, string>> = {bills: 'Bills & Recharges', ads: 'Sponsored banners', services: 'Services', requests: 'Services', dashboard: 'Dashboard', geography: 'Geography · Master Data', users: 'Users', posts: 'Posts & Moderation', reports: 'Reports', audit: 'Audit Log', contact: 'Contact messages', numbers: 'Important numbers', settings: 'Settings'};
    const pendingN = s.pendingCount;
    const navItems = C.PAGES.filter((k) => this.navOk(k)).map((k) => {
      const on = s.page === k;
      // The side bar says just "Posts" next to its pending count; the page title keeps "Posts & Moderation".
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
    const hist = (h: ReviewAction) => {
      const rk = C.RK[h.actor?.role ?? ''] || 'system';
      const label = h.action === 'REVERSE'
        ? 'Override: ' + (ST[C.SK[h.from_status ?? '']] || {label: h.from_status}).label + ' → ' + (ST[C.SK[h.to_status ?? '']] || {label: h.to_status}).label
        : (C.HIST[h.action] || h.action);
      return {who: (h.actor && h.actor.name) || 'System', role: R[rk].label, action: label, note: h.comment || '', hasNote: !!h.comment, time: this.fmt(h.at),
        dot: /PUBLISH/.test(h.action) ? '#1F8A3B' : h.action === 'RECHECK' ? '#8f4bb4' : /DISCARD|UNPUBLISH/.test(h.action) ? '#b3261e' : h.action === 'REVERSE' ? '#0D3B7A' : '#E9791E'};
    };
    // [label, action, border, background, colour]
    type Act = [string, string, string, string, string];
    const dp = (p: PostRow, withHistory?: boolean) => {
      const st = ST[p.status] || ST.Pending;
      const rr = R[p.role] || R.panchayat;
      const al = p.allowed;
      const acts: Act[] = [];
      if (p.status === 'Pending') {
        if (al.includes('publish')) acts.push(['Publish', 'publish', '#1F8A3B', '#1F8A3B', '#fff']);
        if (al.includes('recheck')) acts.push(['Recheck (comment)', 'recheck', '#E9791E', '#fff0dc', '#b35a0e']);
        if (al.includes('discard')) acts.push(['Discard (reason)', 'discard', '#cfd8e3', '#fff', '#3b4a5c']);
      } else if (p.status === 'Published') {
        if (al.includes('unpublish')) acts.push(['Take down', 'takedown', '#b3261e', '#fff', '#b3261e']);
        if (al.includes('reverse')) acts.push(['Override previous decision', 'override', '#0D3B7A', '#fff', '#0D3B7A']);
      } else if (al.includes('reverse')) acts.push(['Override previous decision', 'override', '#0D3B7A', '#0D3B7A', '#fff']);
      if (al.includes('set_urgent')) acts.push([p.urgent ? 'Remove urgent' : 'Mark urgent', 'urgent', '#E9791E', '#fff', '#b35a0e']);
      if (al.includes('block_citizen')) acts.push(['Block this citizen', 'blockCitizen', '#b3261e', '#fff', '#b3261e']);
      if (al.includes('unblock_citizen')) acts.push(['Unblock this citizen', 'unblockCitizen', '#1d7a33', '#fff', '#1d7a33']);
      if (al.includes('discard_citizen_posts')) acts.push(['Discard all their pending posts', 'discardCitizen', '#cfd8e3', '#fff', '#3b4a5c']);
      const cz = p.citizen;
      const czLine = cz ? [(cz.posts_total || 0) + ' posts from this phone', (cz.posts_discarded || 0) + ' discarded', cz.blocked ? (cz.blocked_until ? 'Blocked till ' + this.fmt(cz.blocked_until, true).slice(0, 11) : 'Blocked') : ''].filter(Boolean).join(' · ') : '';
      const ev = p.event;
      const evs = ev ? (C.EVENT[ev.kind] || [ev.kind, '#e3f0fb', '#0D3B7A']) : null;
      const evDates = ev ? (this.fmt(ev.start_date + 'T00:00:00+05:30', true).slice(0, 11) + (ev.end_date ? ' – ' + this.fmt(ev.end_date + 'T00:00:00+05:30', true).slice(0, 11) : '')) : '';
      // The post's own language and its translation's, so screen readers and fonts treat Telugu text as Telugu.
      return {rowKey: p.id, cat: p.cat, catLabel: p.catLabel, titleTe: p.titleTe, titleEn: p.titleEn, bodyTe: p.bodyTe, bodyEn: p.bodyEn, lang: p.raw?.language || undefined, langEn: p.raw?.translation?.language || undefined, area: p.area, date: p.date, author: p.author, authorRole: czLine || rr.label, amobile: '', abg: rr.bg, ainitial: (p.author || '?')[0],
        st: {bg: st.bg, color: st.color, label: st.label}, hasPhoto: p.media.length > 0, photos: p.media.map((m) => ({src: m.thumb_url || m.url, pos: 'center'})), urgent: !!p.urgent,
        hasEvent: !!ev, eventLabel: evs ? evs[0] + ' · ' + evDates : '', eventBg: evs ? evs[1] : '', eventColor: evs ? evs[2] : '',
        hasVideo: (p.videos || []).length > 0, videos: (p.videos || []).map((v) => ({src: v.url, poster: v.poster_url || v.thumb_url || ''})), rowBg: s.panel && s.panel.type === 'post' && s.panel.id === p.id ? '#f0f6fd' : '#fff',
        history: withHistory ? s.panelHistory.map(hist) : [], open: () => this.openPost(p), actions: acts.map(([label, k, border, bg, color]) => ({label, border, bg, color, go: () => this.postAction(k, p)}))};
    };
    // dashboard
    const D = s.dash;
    const dayLabel = (iso: string) => {
      const d = new Date(iso + 'T00:00:00');
      return d.getDate() + ' ' + d.toLocaleString('en-GB', {month: 'short'});
    };
    const todayLabel = new Intl.DateTimeFormat('en-GB', {day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata'}).format(new Date());
    const kpis = [
      {label: 'Total posts', value: D ? D.kpis.total_posts : '…', sub: 'All statuses · ' + (D ? D.geo.districts : '…') + ' districts', color: '#0A2550', go: () => { this.setState({page: 'posts', statusTab: 'All'}, () => this.loadPosts(1)); }},
      {label: 'Pending review', value: D ? D.kpis.pending : '…', sub: D ? (D.kpis.pending ? 'Oldest ' + Math.round(D.kpis.oldest_pending_hours || 0) + ' h · ' + D.kpis.escalated + ' escalated' : 'Nothing waiting') : '', color: '#b35a0e', go: () => { this.setState({page: 'posts', statusTab: 'Pending'}, () => this.loadPosts(1)); }},
      {label: 'Published today', value: D ? D.kpis.published_today : '…', sub: todayLabel, color: '#1F8A3B', go: () => { this.setState({page: 'posts', statusTab: 'Published'}, () => this.loadPosts(1)); }},
      {label: 'Active admins', value: D ? D.kpis.active_admins : '…', sub: 'District · Mandal · Village', color: '#0D3B7A', go: () => { this.setState({page: 'users', uf: {...s.uf, status: 'active'}}, () => loadUsers(this.host, 1)); }},
      {label: 'Blocked users', value: D ? D.kpis.blocked_users : '…', sub: 'Across all roles', color: '#b3261e', go: () => { this.setState({page: 'users', uf: {...s.uf, status: 'blocked'}}, () => loadUsers(this.host, 1)); }},
    ];
    const ppd = D ? D.posts_per_day : [];
    const max = Math.max(1, ...ppd.map((c) => c.submitted));
    const chart = ppd.map((c) => ({h1: Math.round(c.submitted / max * 100) + '%', h2: Math.round(c.published / max * 100) + '%', day: dayLabel(c.date), tip: dayLabel(c.date) + ': ' + c.submitted + ' submitted, ' + c.published + ' published'}));
    // Every district, most pending first; the search box filters by English or Telugu name.
    const dq = s.distQ.trim().toLowerCase();
    const pendingByDistrict = (D ? D.pending_by_district : []).filter((r) => !dq || r.district.name.toLowerCase().includes(dq) || (r.name_te || '').includes(s.distQ.trim())).sort((a, b) => b.pending - a.pending).map((r) => ({name: r.district.name, te: r.name_te || '', count: r.pending, oldest: r.pending && r.oldest_pending_hours !== null ? Math.round(r.oldest_pending_hours) + ' h' : '—',
      go: () => { this.setState({page: 'posts', statusTab: 'Pending', pf: {...s.pf, district: String(r.district.id)}}, () => this.loadPosts(1)); }}));
    const recent = (D ? D.recent_activity : []).map((a) => auditRow(this.host, a));
    const districtOpts = s.geo.map((d) => ({id: String(d.id), label: d.name}));
    // posts
    const tabs = ['Pending', 'Published', 'Recheck', 'Discarded', 'TakenDown'] as const;
    const sc = s.statusCounts;
    const statusTabs = [{id: 'All' as const, label: 'All'}, ...tabs.map((k) => ({id: k, label: ST[k].label}))].map((t) => {
      const on = s.statusTab === t.id;
      const n = t.id === 'All' ? (sc.ALL || 0) : (sc[C.SAPI[t.id]] || 0);
      return {label: t.label, count: n, line: on ? '#0D3B7A' : 'transparent', color: on ? '#0A2550' : '#6b7a8c', cbg: on ? '#0D3B7A' : '#eef2f6', ccolor: on ? '#fff' : '#3b4a5c', go: () => { this.setState({statusTab: t.id}, () => this.loadPosts(1)); }};
    });
    const pf = s.pf;
    const postRows = s.posts.map((p) => dp(p));
    const catOpts = s.categories.map((c) => ({id: c.key, label: c.name_en || c.name || c.key}));
    // panel
    const panel = s.panel ? {show: true, isPost: s.panel.type === 'post', isUser: s.panel.type === 'user', title: s.panel.type === 'post' ? 'Post review' : 'User details'} : {show: false};
    const empty: PostRow = {id: '', cat: 'updates', catLabel: '', titleTe: '', titleEn: '', bodyTe: '', bodyEn: '', area: '', areaName: '', date: '', author: '', role: 'panchayat', status: 'Pending', media: [], videos: [], urgent: false, event: null, allowed: [], citizen: null};
    const sp = dp(s.panelPost || empty, true);
    // The panel names every area the post goes to (the list shows the first one and "+N").
    const spTargets = (s.panelPost && s.panelPost.raw && s.panelPost.raw.targets) || [];
    if (spTargets.length > 1 && spTargets[0].level !== 'STATE') sp.area = spTargets.map((t) => this.an(t)).join(', ');
    const pu = s.panelUser;
    const su = pu ? {name: pu.name, te: pu.te, initial: pu.name[0], bg: R[pu.role].bg,
      fields: [{k: 'Role', v: R[pu.role].label}, {k: 'Mobile', v: pu.mobile ? '+91 ' + pu.mobile : (pu.email || '—')}, {k: 'District', v: pu.district || '—'}, {k: 'Mandal', v: pu.mandal || '—'}, {k: 'Village', v: pu.village || '—'}, {k: 'Status', v: (pu.active ? 'Active · last login ' + pu.last : 'Blocked') + (pu.locked ? ' · locked after failed logins' : '')}],
      posts: s.panelUserPosts.map((p) => dp(p)),
      roles: (pu.ras || []).map((ra) => {
        const k = C.RK[ra.role] || 'panchayat';
        return {label: R[k].label, rbg: R[k].tbg, rcolor: R[k].tc, area: ra.area ? (ra.area.path || ra.area.name) : '—', canRemove: userCan(pu, 'remove_assignment'), remove: () => removeRole(this.host, pu, ra)};
      }),
      canEdit: userCan(pu, 'edit'), edit: () => editUser(this.host, pu), canAddRole: userCan(pu, 'add_assignment') && roleChoices(this.host).length > 0, canReassign: !!pu.raId && userCan(pu, 'reassign'), canReset: userCan(pu, 'reset_password'), canUnlock: pu.locked && userCan(pu, 'unlock'), canToggle: userCan(pu, pu.active ? 'block' : 'unblock'),
      addRole: () => addRole(this.host, pu), reassign: () => reassignUser(this.host, pu), reset: () => resetPassword(this.host, pu), unlock: () => unlockUser(this.host, pu), toggle: () => toggleUser(this.host, pu), toggleLabel: pu.active ? 'Block user' : 'Unblock user', tbg: pu.active ? '#b3261e' : '#1F8A3B'} : {fields: [], posts: [], roles: []};
    // modal
    const m = s.modal;
    const cannot = !!(m && m.needsText && !s.modalText.trim());
    const modal = m ? {show: true, title: m.title, body: m.body, hasInput: !!m.hasInput, inputType: m.password ? 'password' : 'text', hasGen: !!m.hasInput && !m.noGen, inputLabel: m.inputLabel || '', inputPh: m.inputPh || '', input2Label: m.input2Label || '', input2Ph: m.input2Ph || '', hasSecret: !!m.secret, secret: m.secret || '', hasCancel: !m.noCancel, needsText: !!m.needsText, textLabel: m.textLabel || '',
      hasSelect: !!m.hasSelect, selectLabel: m.selectLabel || '', options: m.options || [], confirmLabel: m.confirmLabel, bg: m.bg || '#0D3B7A', cannot, opacity: cannot ? .5 : 1} : {show: false, options: [], hasCancel: true};
    const me = s.me || {name: '', username: '', email: ''};
    // The bell: one row per notification, coloured by what it is about.
    const NK: Record<string, {label: string; color: string; bg: string; d: string}> = {POST_PUBLISHED: {label: 'Published', color: '#1F8A3B', bg: '#e4f4df', d: 'M20 6L9 17l-5-5'},
      POST_RECHECK: {label: 'Needs changes', color: '#8f4bb4', bg: '#f1e6f7', d: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'},
      POST_DISCARDED: {label: 'Discarded', color: '#b3261e', bg: '#fde8e6', d: 'M18 6L6 18M6 6l12 12'},
      POST_UNPUBLISHED: {label: 'Taken down', color: '#b3261e', bg: '#fde8e6', d: 'M12 5v14M5 12l7 7 7-7'},
      REVIEW_PENDING: {label: 'To review', color: '#b35a0e', bg: '#fff0dc', d: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'},
      ESCALATION: {label: 'Escalated', color: '#b3261e', bg: '#fde8e6', d: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z'},
      ACCOUNT: {label: 'Account', color: '#0D3B7A', bg: '#e3f0fb', d: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0'},
      SERVICE_REQUEST: {label: 'Service request', color: '#07818e', bg: '#dff3f4', d: 'M9 12h6M9 16h4M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z'}};
    const bell = {label: '', color: '#3b4a5c', bg: '#eef2f6', d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0'};
    const notifRows = s.notifs.map((n) => {
      const k = NK[n.kind] || bell;
      return {id: n.id, title: n.title, body: n.body, time: this.ago(n.created_at), unread: !n.read_at, label: k.label, color: k.color, bg: k.bg, d: k.d, linked: !!(n.post_id || n.service_request_id), open: () => this.openNotif(n)};
    });
    return {screen: s.screen, is, pg, pageTitle: titles[s.page], navGroups, navOpen: s.navOpen, toggleNav: () => this.setState((st) => ({navOpen: !st.navOpen})), notifOpen: s.notifOpen, notifRows, notifUnread: s.notifUnread, notifBadge: s.notifUnread > 99 ? '99+' : String(s.notifUnread), notifLoading: s.notifLoading, notifError: s.notifError, notifEmpty: !s.notifs.length && !s.notifLoading && !s.notifError, notifHasMore: !!s.notifNext, notifMore: () => this.loadNotifs(true), notifRetry: () => this.loadNotifs(), toggleNotifs: () => this.toggleNotifs(), closeNotifs: () => this.setState({notifOpen: false}), readAllNotifs: () => this.readAllNotifs(), menuOpen: s.menuOpen, toggleMenu: () => this.setState((st) => ({menuOpen: !st.menuOpen, notifOpen: false})), menuProfile: () => this.editProfile(), goSettingsM: () => this.goPage('settings'), canSettings: this.navOk('settings'), menuChangePassword: () => this.openChangePassword(), goAudit: () => this.goPage('audit'),
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
      gsearch: s.gsearch,
      onGSearch: (e: FieldChange) => {
        const v = e.target.value;
        this.setState({gsearch: v, page: v ? 'posts' : s.page, statusTab: v ? 'All' : s.statusTab});
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => this.loadPosts(1), 300);
      },
      kpis, chart, chartEmpty: !ppd.some((c) => c.submitted || c.published), pendingByDistrict, distQ: s.distQ, onDistQ: (e: FieldChange) => this.setState({distQ: e.target.value}), distEmptyText: s.distQ.trim() ? 'No district matches “' + s.distQ.trim() + '”.' : 'Nothing waiting for review.', recent, noDistricts: !s.geo.length,
      ...geographyView(this.host),
      ...usersView(this.host), districtOpts,
      statusTabs, pf,
      onPF: (e: FieldChange) => {
        const {name, value} = e.target;
        this.setState((st) => ({pf: {...st.pf, [name]: value}}), () => this.loadPosts(1));
      },
      postRows, postCount: s.postCount, postEmpty: !postRows.length, postEmptyText: s.postsLoading ? 'Loading…' : 'No posts match these filters.', postsPager: pager(s.postPage, s.postPages, (p) => this.loadPosts(p)), catOpts,
      ...reportsView(this.host), ...auditView(this.host),
      ...contactsView(this.host),
      ...requestsView(this.host),
      ...adsView(this.host), ...adFormView(this.host),
      canCompose: this.can('posts.create_post') && s.me?.capabilities?.can_post !== false, openCompose: () => this.openCompose(),
      cfShow: !!s.cf, closeCF: () => this.closeCompose(), onCF: (e: FieldChange) => this.onCF(e), pickCFPhotos: (e: React.ChangeEvent<HTMLInputElement>) => this.pickCFMedia(e), saveCF: () => this.saveCompose(),
      cf: s.cf ? (() => {
        const f = s.cf;
        const err = f.tried ? this.cfErrors(f) : {};
        const d = s.geo.find((x) => String(x.id) === f.d), m = d && d.mandals.find((x) => String(x.id) === f.m), vl = m && m.villages.find((x) => String(x.id) === f.v);
        return {
          cat: f.cat, lang: f.lang, title: f.title, body: f.body, d: f.d, m: f.m, v: f.v, urgent: f.urgent, saving: f.saving,
          catOpts: s.categories.filter((c) => c.is_active).map((c) => ({id: c.key, label: (c.name_en || c.key) + (c.name_te ? ' · ' + c.name_te : '')})),
          errCat: err.cat || '', errTitle: err.title || '', errBody: err.body || '',
          titleCount: f.title.length + ' / 150', bodyCount: f.body.length + ' / 5000',
          photos: f.previews.map((src, i) => ({src, isVideo: f.kinds[i] === 'video', dur: f.durs[i] ? f.durs[i] + ' s' : '', remove: () => this.removeCFPhoto(i)})),
          canAddPhoto: !f.saving && !f.checking && !f.kinds.includes('video') && f.files.length < Component.CF_MAX_PHOTOS,
          photoErr: f.photoErr,
          // With photos already there only photos can be added; an empty form takes either.
          accept: f.files.length ? 'image/jpeg,image/png,image/webp' : 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime',
          addLabel: f.files.length ? 'Add photo' : 'Add photo or video',
          mediaHelp: 'Up to ' + Component.CF_MAX_PHOTOS + ' photos (JPG, PNG or WebP, up to ' + Component.CF_MAX_MB + ' MB each), or one video (MP4 or MOV, up to ' + Component.CF_VIDEO_MAX_MB + ' MB and ' + Component.CF_VIDEO_MAX_S + ' seconds). Not both.',
          photoCount: f.checking ? 'checking the video…' : f.kinds.includes('video') ? '1 video'
            : f.files.length + ' of ' + Component.CF_MAX_PHOTOS + ' photos, or one video',
          toggleUrgent: () => this.setState((x) => x.cf ? {cf: {...x.cf, urgent: !x.cf.urgent}} : null),
          showM: !!d, showV: !!m, allM: d ? 'All mandals in ' + d.name : '', allV: m ? 'All villages in ' + m.name : '',
          where: vl && m ? vl.name + ' village only, ' + m.name + ' mandal' : m && d ? 'all villages of ' + m.name + ' mandal, ' + d.name : d ? 'all villages of ' + d.name + ' district' : 'every village (everyone)',
          dOpts: s.geo.filter((x) => x.active).map((x) => ({id: String(x.id), label: x.name})), mOpts: d ? d.mandals.filter((x) => x.active).map((x) => ({id: String(x.id), label: x.name})) : [], vOpts: m ? m.villages.filter((x) => x.active).map((x) => ({id: String(x.id), label: x.name})) : [],
          saveLabel: f.saving ? f.step || 'Saving…' : f.postId ? 'Retry' : 'Publish post',
        };
      })() : null,
      ...servicesView(this.host),
      imp: s.imp ? {...s.imp, pct: Math.round(s.imp.done * 100 / s.imp.total), label: s.imp.phase + (s.imp.total > 1 ? ' part ' + Math.min(s.imp.done + 1, s.imp.total) + ' of ' + s.imp.total : '') + '…'} : null,
      ...requestPanelView(this.host), ...contactPanelView(this.host),
      ...numbersView(this.host),
      ...settingsView(this.host),
      panel, sp, su, closePanel: () => this.setState({panel: null}),
      modal, modalText: s.modalText, modalSel: s.modalSel, onModalText: (e: FieldChange) => this.setState({modalText: e.target.value}), modalText2: s.modalText2, onModalText2: (e: FieldChange) => this.setState({modalText2: e.target.value}), onModalSel: (e: FieldChange) => this.setState({modalSel: e.target.value}), closeModal: () => this.closeModal(),
      confirmModal: () => {
        if (!m || cannot) return;
        const t = s.modalText, sel = s.modalSel, gen = s.modalGen, t2 = s.modalText2;
        this.closeModal();
        m.onConfirm(t, sel, gen, t2);
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
        {v.is?.app ? <>
          {" "}
          <div className={"sa-shell" + (v.navOpen ? " is-open" : "")} style={{display: "grid", gridTemplateColumns: "248px minmax(0, 1fr)", height: "100dvh", overflow: "hidden"}}>
            <Sidebar v={v} />
            <button className="sa-scrim" aria-label="Close menu" tabIndex={v.navOpen ? 0 : -1} onClick={v.toggleNav} />
            <main style={{display: "flex", flexDirection: "column", minWidth: "0", minHeight: "0"}}>
              <TopBar v={v} />
              <div ref={v.scrollRef} style={{flex: "1", minHeight: "0", overflowY: "auto"}}>
              <div className="sa-content" style={{padding: "24px 28px 40px", display: "flex", flexDirection: "column", gap: "20px", animation: "sa-fade .2s ease-out"}}>
                {/* DASHBOARD */}
                {v.pg?.dashboard ? <DashboardScreen v={v} /> : null}
                {/* GEOGRAPHY */}
                {v.pg?.geography ? <Geography v={v} /> : null}
                {/* USERS */}
                {v.pg?.users ? <Users v={v} /> : null}
                {/* POSTS */}
                {v.pg?.posts ? <Posts v={v} /> : null}
                {/* REPORTS */}
                {v.pg?.reports ? <Reports v={v} /> : null}
                {/* AUDIT */}
                {v.pg?.audit ? <Audit v={v} /> : null}
                {/* CONTACT MESSAGES */}
                {v.pg?.contact ? <Messages v={v} /> : null}
                {/* SERVICE REQUESTS */}
                {v.pg?.requests && v.canCatalog ? <ServiceTabs v={v} /> : null}
                {v.pg?.requests && (v.svcView === "requests" || !v.canCatalog) ? <Requests v={v} /> : null}
                {/* ADS */}
                {v.pg?.ads ? <Ads v={v} /> : null}
                {/* SERVICES / BILLS: the services citizens can request, or the bills & recharges, on the app's Home
                    (same as the app's Super Admin › Services and › Bills & Recharges) */}
                {(v.pg?.requests || v.pg?.bills) && v.catShow ? <Services v={v} /> : null}
                {/* IMPORTANT NUMBERS */}
                {v.pg?.numbers ? <Numbers v={v} /> : null}
                {/* SETTINGS */}
                {v.pg?.settings ? <SettingsScreen v={v} /> : null}
              </div>
              </div>
            </main>
          </div>
          {" "}
          {/* SIDE PANEL (post / user) */}
          {" "}
          {v.panel?.show ? <DetailPanel v={v} /> : null}
          {" "}
          {/* ADD USER DRAWER */}
          {" "}
          {v.drawerOpen ? <UserDrawer v={v} /> : null}
          {/* IMPORTANT NUMBER DRAWER */}
          {v.rqShow ? <RequestPanel v={v} /> : null}
          {v.cmShow ? <ContactPanel v={v} /> : null}
          {v.sfShow ? <ServiceFormPanel v={v} /> : null}
          {v.afShow ? <AdFormPanel v={v} /> : null}
          {v.cfShow ? <ComposeFormPanel v={v} /> : null}
          {v.nfShow ? <NumberFormPanel v={v} /> : null}
          {v.tfShow ? <TypeFormPanel v={v} /> : null}
          {" "}
          {/* MODAL */}
          {" "}
          {v.modal?.show ? <ConfirmModal v={v} /> : null}
          {" "}
        </> : null}
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
