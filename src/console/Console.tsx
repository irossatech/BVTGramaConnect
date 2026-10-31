// Super Admin console, ported from the approved prototype "Super Admin Console.dc.html"
// with the documented additions. The logic class holds all behaviour; render() is the template as JSX.
// Keep render() bound to the same renderVals() keys; map API data into those shapes in the logic.
import React from "react";
import { css } from "../shared/dc";
import * as ds from "./ds";
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
import ServiceFormPanel from "./panels/ServiceForm";
import AdFormPanel from "./panels/AdForm";
import NumberFormPanel from "./panels/NumberForm";
import TypeFormPanel from "./panels/TypeForm";
import ConfirmModal from "./panels/ConfirmModal";
import ImportProgressPanel from "./panels/ImportProgress";
import Toasts from "./panels/Toasts";
import { decodeUtf8, planParts, fileLine, type CsvPart } from "./csv-parts";
import type {
  Actor, Ad, AdminContact, AdminContactType, Area, AreaLevel, AuditEntry, CatalogItem, Category, ContactImportError,
  ContactImportResult, ContactMessage, ContactTypeRef, Dashboard, DiscardCitizenResult, GeoImportResult, GeoState,
  ListOrPage, LoginResponse, Me, Media, NotificationTemplate, Paged, Post, PostCitizen, PostEvent, PostsPage,
  ReportActivity, ReportDistrict, ReportReviewTime, ReportSummary, ReviewAction, RoleAssignment, ServiceRequest,
  ServiceRequestsPage, Settings, TemporaryPassword, User, UserResponse,
} from "./types";

// ---- the console's own shapes (API data mapped for the markup) ----

type Props = Record<string, never>;
type Screen = "checking" | "login" | "change_password" | "app";
type PageKey = "dashboard" | "geography" | "users" | "posts" | "requests" | "bills" | "ads" | "reports" | "audit" | "contact" | "numbers" | "settings";
/** A page, or the services list (a view of the requests page with its own permissions). */
type NavKey = PageKey | "services";
type StatusTab = "All" | "Pending" | "Published" | "Recheck" | "Discarded" | "TakenDown";
type NumTab = "AREA" | "HELPLINE" | "TYPES";
type SvcView = "requests" | "catalog";
type GeoKind = "district" | "mandal" | "village";
type AdStatus = "live" | "scheduled" | "paused" | "ended";
type FieldChange = React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
type Timer = ReturnType<typeof setTimeout>;

interface Option {
  id: string;
  label: string;
}

interface AreaOption extends Option {
  level: AreaLevel;
}

interface Toast {
  id: number;
  text: string;
  dot: string;
}

/** The confirm dialog (ask()). onConfirm gets the text box, the select and the generated password. */
interface ModalSpec {
  title: string;
  body: string;
  confirmLabel: string;
  bg?: string;
  onConfirm: (text: string, sel: string, gen: string) => void;
  noCancel?: boolean;
  secret?: string;
  preset?: string;
  needsText?: boolean;
  textLabel?: string;
  hasSelect?: boolean;
  selectLabel?: string;
  options?: Option[];
  sel?: string;
  hasInput?: boolean;
  noGen?: boolean;
  inputLabel?: string;
  inputPh?: string;
}

interface GeoVillageRow {
  id: number;
  name: string;
  te: string;
  lgd: string;
  lat: string;
  lng: string;
  pin: string;
  active: boolean;
}

interface GeoMandalRow {
  id: number;
  name: string;
  te: string;
  lgd: string;
  active: boolean;
  villages: GeoVillageRow[];
}

interface GeoDistrictRow {
  id: number;
  name: string;
  te: string;
  lgd: string;
  active: boolean;
  mandals: GeoMandalRow[];
}

/** Any row of the geography tree. */
interface GeoNode {
  id: number;
  name: string;
  te: string;
  lgd: string;
  active: boolean;
  lat?: string;
  lng?: string;
  pin?: string;
  mandals?: GeoMandalRow[];
  villages?: GeoVillageRow[];
}

interface GeoForm {
  kind: GeoKind;
  id: number | null;
  parentId: number | null;
  parentName: string | null;
  parentKey?: string | null;
  parent: string;
  name: string;
  te: string;
  lgd: string;
  lat: string;
  lng: string;
  pin: string;
  active?: boolean;
  wasActive?: boolean;
  isVillage: boolean;
  /** What was pasted in "Where is it?" (coordinates or a map link). */
  where?: string;
  manual?: boolean;
  tried?: boolean;
}

interface GeoErrs {
  name: string;
  pin: string;
  coords: string;
}

/** A user from GET /users/, in the prototype's shape. */
interface AdminUser {
  id: string;
  name: string;
  te: string;
  nameTe: string;
  mobile: string;
  email: string;
  username: string;
  role: string;
  district: string | null;
  mandal: string | null;
  village: string | null;
  area: Area | null;
  raId: string | null;
  ras: RoleAssignment[];
  active: boolean;
  locked: boolean;
  allowed: string[] | null;
  last: string;
}

/** Add User / Edit user drawer. nuD and nuM are the district and mandal steps of the area picker. */
interface NewUserForm {
  id: string | null;
  name: string;
  te: string;
  email: string;
  username: string;
  mobile: string;
  password: string;
  role: string;
  area: string;
  nuD?: string;
  nuM?: string;
}

/** A post from GET /posts/, in the prototype's shape. */
interface PostRow {
  id: string;
  /** The post as the server sent it; missing on the empty placeholder the closed panel renders. */
  raw?: Post;
  cat: string;
  catLabel: string;
  titleTe: string;
  titleEn: string;
  bodyTe: string;
  bodyEn: string;
  area: string;
  date: string;
  author: string;
  role: string;
  status: string;
  media: Media[];
  videos: Media[];
  urgent: boolean;
  event: PostEvent | null;
  allowed: string[];
  citizen: PostCitizen | null;
  areaName: string;
}

interface Panel {
  type: "post" | "user";
  id: string;
}

interface AdForm {
  id: number | null;
  title: string;
  link: string;
  file: File | null;
  preview: string;
  d: string;
  m: string;
  v: string;
  start: string;
  end: string;
  active: boolean;
  tried: boolean;
  saving: boolean;
}

type AdErrors = Partial<Record<"title" | "image" | "link" | "end", string>>;

/** The service or bill form. */
interface ServiceForm {
  bill: boolean;
  key: string | null;
  en: string;
  te: string;
  icon: string;
  color: string;
  image: string;
  had: boolean;
  file: File | null;
  active: boolean;
  tried: boolean;
  saving: boolean;
  hintEn: string;
  hintTe: string;
}

/** Where a list (services or bills) lives: state keys, endpoint, built-in fallback, icon set and words. */
interface CatalogSet {
  l: "bills" | "svcs";
  ld: "billsLoading" | "svcsLoading";
  un: "billsUnavailable" | "svcsUnavailable";
  path: string;
  seed: CatalogItem[];
  icon: string;
  icons: Readonly<Record<string, string>>;
  one: string;
  what: string;
}

interface NumberForm {
  id: string | null;
  section: string;
  type: string;
  /** A number's own type, kept even when it is not offered for new numbers ("Other"). */
  typeObj?: ContactTypeRef;
  custom: string;
  name: string;
  te: string;
  phone: string;
  email: string;
  level: string;
  area: string;
  sort: string;
  consent: boolean;
}

interface TypeForm {
  id?: number;
  section: string;
  /** Opened from the number form's "+ Add a new type…": the new type is picked there. */
  forNumber?: boolean;
  en: string;
  te: string;
  tried: boolean;
  saving: boolean;
}

interface ImportProgress {
  phase: string;
  done: number;
  total: number;
  name: string;
}

type SelKey = "numSel" | "adSel";
type SelId = string | number;

interface BulkOptions {
  title: string;
  body: string;
  confirm: string;
  url: (id: SelId) => string;
  done: () => void;
}

/** The bar and tick boxes for removing several rows at once. */
export interface SelView {
  show: boolean;
  all: boolean;
  some: boolean;
  count: number;
  label: string;
  busy: string;
  toggleAll: () => void;
  clear: () => void;
  remove: () => void;
}

interface SettingsState {
  escalation: number;
  /** '' while the box is empty. */
  citizenPerDay: number | "";
  langs: { te: boolean; en: boolean };
  templates: NotificationTemplate[];
}

interface State {
  screen: Screen;
  page: PageKey;
  username: string;
  password: string;
  cpCurrent: string;
  cpNext: string;
  cpVoluntary: boolean;
  showPw: Record<string, boolean>;
  menuOpen: boolean;
  gsearch: string;
  me: Me | null;
  geo: GeoDistrictRow[];
  stateRow: GeoState | null;
  expanded: Record<string, boolean>;
  geoForm: GeoForm | null;
  users: AdminUser[];
  userCount: number;
  userPage: number;
  userPages: number;
  usersLoading: boolean;
  reqs: ServiceRequest[];
  reqCount: number;
  reqPage: number;
  reqPages: number;
  reqLoading: boolean;
  reqFilter: string;
  svcView: SvcView;
  ads: Ad[];
  adsLoading: boolean;
  adsUnavailable: boolean;
  af: AdForm | null;
  svcs: CatalogItem[];
  svcsLoading: boolean;
  svcsUnavailable: boolean;
  bills: CatalogItem[];
  billsLoading: boolean;
  billsUnavailable: boolean;
  sf: ServiceForm | null;
  reqQ: string;
  reqCounts: Record<string, number>;
  reqUnavailable: boolean;
  rq: { r: ServiceRequest } | null;
  rqAssignees: Option[];
  uf: { role: string; district: string; status: string; q: string };
  posts: PostRow[];
  postCount: number;
  postPage: number;
  postPages: number;
  postsLoading: boolean;
  statusCounts: Record<string, number>;
  pendingCount: number;
  pf: { district: string; cat: string; source: string };
  statusTab: StatusTab;
  numSel: SelId[];
  adSel: SelId[];
  bulk: string;
  panel: Panel | null;
  panelPost: PostRow | null;
  panelHistory: ReviewAction[];
  panelUser: AdminUser | null;
  panelUserPosts: PostRow[];
  drawerOpen: boolean;
  nu: NewUserForm;
  audit: AuditEntry[];
  auditCount: number;
  auditPage: number;
  auditPages: number;
  auditQ: string;
  auditLoading: boolean;
  contacts: ContactMessage[];
  contactCount: number;
  contactPage: number;
  contactPages: number;
  contactQ: string;
  contactFilter: string;
  contactLoading: boolean;
  nums: AdminContact[];
  numCount: number;
  numPage: number;
  numPages: number;
  numLoading: boolean;
  numTab: NumTab;
  numQ: string;
  numType: string;
  ctypes: ContactTypeRef[];
  ctypesAdmin: AdminContactType[];
  nf: NumberForm | null;
  tf: TypeForm | null;
  dash: Dashboard | null;
  reports: { summary: ReportSummary | null; byArea: ReportDistrict[]; reviewTime: ReportReviewTime[]; activity: ReportActivity[] };
  categories: Category[];
  settings: SettingsState;
  modal: ModalSpec | null;
  modalText: string;
  modalSel: string;
  modalGen: string;
  toasts: Toast[];
  imp: ImportProgress | null;
}

/** The forms Escape closes, top first. */
const FORMS = ["tf", "nf", "sf", "af", "rq"] as const;
/** The forms whose Telugu name is suggested from the English one. */
type TeForm = "geoForm" | "nu" | "sf" | "tf" | "nf";

// setState for a key picked at runtime. TypeScript widens {[key]: value} to an index signature,
// so the one assertion here names it back as the key it is.
function one<K extends keyof State>(key: K, value: State[K]): Pick<State, K> {
  return { [key]: value } as Pick<State, K>;
}

// A form value for the markup: the open form, or {} while it is closed (the markup reads it as v.x?.field).
const orEmpty = <T extends object>(x: T | null): Partial<T> => x || {};

const isStatus = (e: unknown, status: number): boolean => e instanceof ApiError && e.status === status;

// error.report.errors of a CSV import refused with 400 (contract sections 4 and 14).
function reportErrors(e: unknown): unknown[] {
  const rep = e instanceof ApiError ? e.body.report : undefined;
  return typeof rep === "object" && rep !== null && "errors" in rep && Array.isArray(rep.errors) ? rep.errors : [];
}

const isActor = (x: unknown): x is Actor => typeof x === "object" && x !== null;
const isRowError = (x: unknown): x is ContactImportError => typeof x === "object" && x !== null;

// The page in a history entry this console pushed ({gc: page}); '' for any other entry.
function historyPage(e: PopStateEvent): string {
  const st: unknown = e.state;
  return typeof st === "object" && st !== null && "gc" in st && typeof st.gc === "string" ? st.gc : "";
}

/** Google Input Tools answer: ["SUCCESS", [[input, [suggestion, …], …]]]. */

const EMPTY_NU: NewUserForm = { id: null, name: "", te: "", email: "", username: "", mobile: "", password: "", role: "panchayat", area: "", nuD: "", nuM: "" };


interface RoleStyle {
  label: string;
  bg: string;
  tbg: string;
  tc: string;
}

interface Tone {
  label: string;
  bg: string;
  color: string;
}

export type View = ReturnType<Component["renderVals"]>;

export default class Component extends React.Component<Props, State> {
  private static readonly ICON: Readonly<Record<NavKey, string>> = {bills:'M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1zM16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11',services:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',ads:'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM2 15l5-5 4 4 3-3 8 8M15.5 9.5h.01',requests:'M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z',contact:'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',numbers:'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',dashboard:'M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z',geography:'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',users:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',posts:'M4 4h13a3 3 0 0 1 3 3v12H5a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1zm3 4h6M7 12h6M7 16h4M16 8h1M16 12h1',reports:'M3 20h18M6 17V10M11 17V4M16 17v-7M21 17v-4',audit:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 8h6m-6 4h4',settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-1.7-1L14.8 3H9.2l-.4 2.6a7.5 7.5 0 0 0-1.7 1l-2.4-1-2 3.4L4.7 11a7.4 7.4 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 1.7 1l.4 2.6h5.6l.4-2.6a7.5 7.5 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1z'};
  private static readonly STATUS: Readonly<Record<string, Tone>> = {Pending:{bg:'#fff0dc',color:'#b35a0e',label:'Pending'},Published:{bg:'#e4f4df',color:'#1d7a33',label:'Published'},Recheck:{bg:'#f1e6f7',color:'#8f4bb4',label:'Recheck'},Discarded:{bg:'#eef2f6',color:'#3b4a5c',label:'Discarded'},TakenDown:{bg:'#fde7e5',color:'#b3261e',label:'Taken down'},Draft:{bg:'#eef2f6',color:'#6b7a8c',label:'Draft'}};
  private static readonly ROLE: Readonly<Record<string, RoleStyle>> = {super:{label:'Super Admin',bg:'#0A2550',tbg:'#e3f0fb',tc:'#0D3B7A'},district:{label:'District Admin',bg:'#0D3B7A',tbg:'#e3f0fb',tc:'#0D3B7A'},mandal:{label:'Mandal Admin',bg:'#07818e',tbg:'#dff3f5',tc:'#07818e'},village:{label:'Village Admin',bg:'#1F8A3B',tbg:'#e4f4df',tc:'#1d7a33'},panchayat:{label:'Panchayat Member',bg:'#E9791E',tbg:'#fff0dc',tc:'#b35a0e'},system:{label:'System',bg:'#6b7a8c',tbg:'#eef2f6',tc:'#3b4a5c'}};
  // Categories the design system has an icon for; any other category shows the "updates" icon.
  private static readonly CAT_ICONS: readonly ds.Category[] = ['announce', 'schemes', 'news', 'updates'];
  // API values -> the prototype's keys
  private static readonly RK: Readonly<Record<string, string>> = {SUPER_ADMIN:'super',DISTRICT_ADMIN:'district',MANDAL_ADMIN:'mandal',VILLAGE_ADMIN:'village',PANCHAYAT_MEMBER:'panchayat',SYSTEM:'system'};
  private static readonly RAPI: Readonly<Partial<Record<string, string>>> = {district:'DISTRICT_ADMIN',mandal:'MANDAL_ADMIN',village:'VILLAGE_ADMIN',panchayat:'PANCHAYAT_MEMBER'};
  private static readonly SK: Readonly<Record<string, string>> = {PENDING:'Pending',PUBLISHED:'Published',RECHECK:'Recheck',DISCARDED:'Discarded',UNPUBLISHED:'TakenDown',DRAFT:'Draft'};
  private static readonly SAPI: Readonly<Record<string, string>> = {Pending:'PENDING',Published:'PUBLISHED',Recheck:'RECHECK',Discarded:'DISCARDED',TakenDown:'UNPUBLISHED'};
  private static readonly LEVEL_OF_ROLE: Readonly<Partial<Record<string, AreaLevel>>> = {district:'DISTRICT',mandal:'MANDAL',village:'VILLAGE',panchayat:'VILLAGE'};
  private static readonly HIST: Readonly<Record<string, string>> = {SUBMIT:'Submitted for review',RESUBMIT:'Resubmitted',PUBLISH:'Published',AUTO_PUBLISH:'Published directly (admin post)',RECHECK:'Sent back for recheck',DISCARD:'Discarded',UNPUBLISH:'Taken down',ESCALATE:'Escalated'};
  private static readonly ACT: Readonly<Record<string, string>> = {'post.created':'created post','post.updated':'edited post','post.deleted':'deleted draft','post.urgent_set':'marked post urgent','post.urgent_cleared':'removed urgent mark','user.updated':'edited user','user.password_changed':'changed password','user.password_reset':'reset password','setting.role_password_changed':'changed a default password','email.failed':'email not delivered','email.skipped':'email skipped','contact.handled':'handled contact message','contact.reopened':'reopened contact message','contact.created':'added important number','contact.updated':'edited important number','contact.removed':'removed important number','contact_type.created':'added contact type','contact_type.updated':'changed contact type','contacts.imported':'imported important numbers','auth.login':'logged in','auth.logout':'logged out','auth.login_failed':'failed login','auth.locked_out':'locked out after failed logins','user.unlocked':'unlocked user','user.password_set':'set a temporary password','group.permissions_changed':'changed group permissions','post.submitted':'submitted post','post.resubmitted':'resubmitted post','post.published':'published post','post.auto_published':'published post','post.recheck':'sent for recheck','post.discarded':'discarded post','post.unpublished':'took down post','post.reversed':'overrode decision','post.overridden':'overrode decision','post.escalated':'escalated post','user.created':'added user','user.blocked':'blocked user','user.unblocked':'unblocked user','user.reassigned':'reassigned user','user.assignment_added':'added role','user.assignment_removed':'removed role','area.created':'added area','area.updated':'edited area','area.deactivated':'deactivated area','area.reactivated':'reactivated area','area.imported':'imported villages','category.created':'added category','category.updated':'changed category','setting.changed':'changed setting','template.updated':'edited template','report.exported':'exported report','push.failed':'push failed'};
  private static readonly EVENT: Readonly<Record<string, readonly [string, string, string]>> = {deadline:['Deadline','#fff0dc','#b35a0e'],camp:['Camp','#e4f4df','#1d7a33'],distribution:['Distribution','#e3f0fb','#0D3B7A'],closure:['Closure','#eef2f6','#3b4a5c'],meeting:['Meeting','#f1e6f7','#8f4bb4']};
  private static readonly PAGE = 20;
  // Home banner ads (docs/api-contract.md section 17): status worked out from the dates and the switch.
  private static readonly AD_STATUS: Readonly<Record<AdStatus, Tone>> = {live:{label:'Running',bg:'#e4f4df',color:'#1d7a33'},scheduled:{label:'Scheduled',bg:'#e6eef8',color:'#0D3B7A'},paused:{label:'Paused',bg:'#fff0dc',color:'#b35a0e'},ended:{label:'Ended',bg:'#f1f3f6',color:'#6b7a8c'}};
  // Service request: what the citizen is told when it moves to each status.
  private static readonly SVC_MOVE: Readonly<Record<string, string>> = {NEW:'The request goes back to New.',APPROVED:'The citizen sees that it is approved.',IN_PROGRESS:'The citizen sees that work has started.',COMPLETED:'The citizen sees that it is done. Write what they should do next.',REJECTED:'Write why. The citizen sees your reason.'};
  private static readonly PAGES: readonly PageKey[] = ['dashboard','geography','users','posts','requests','bills','ads','reports','audit','contact','numbers','settings'];
  // Service requests from citizens (backend plan: service-requests). Status keys as the server sends them.
  private static readonly SVC_STATUS: Readonly<Record<string, Tone & {dot: string}>> = {NEW:{label:'New',bg:'#e3f0fb',color:'#0D3B7A',dot:'#0D3B7A'},APPROVED:{label:'Approved',bg:'#dff3f5',color:'#07818e',dot:'#07818e'},IN_PROGRESS:{label:'In progress',bg:'#fff0dc',color:'#b35a0e',dot:'#b35a0e'},COMPLETED:{label:'Completed',bg:'#e4f4df',color:'#1d7a33',dot:'#1d7a33'},REJECTED:{label:'Rejected',bg:'#fde7e5',color:'#b3261e',dot:'#b3261e'}};
  private static readonly SERVICES: Readonly<Record<string, string>> = {aadhaar:'Aadhaar Services',pan:'PAN Services',voter_id:'Voter ID',certificates:'Certificates',loans_insurance:'Loans & Insurance',govt_schemes:'Govt Schemes',land_records:'Land Records',farmer:'Farmer Services'};
  private static readonly LVROLE: Readonly<Record<string, string>> = {DISTRICT:'district',MANDAL:'mandal',VILLAGE:'village'};
  // A page shows when the user has any one of these permissions (BackEnd apps/accounts/role_matrix.py).
  private static readonly NAV_PERM: Readonly<Record<NavKey, readonly string[]>> = {bills:['bills.manage_bills','service_requests.manage_services'],services:['service_requests.manage_services','web_admin.access_web_console'],dashboard:['web_admin.view_dashboard'],geography:['geography.manage_master_data'],users:['accounts.manage_district_admin','accounts.manage_mandal_admin','accounts.manage_village_admin','accounts.manage_panchayat_member'],posts:['posts.view_review_queue'],reports:['web_admin.view_reports'],audit:['audit.view_audit_log'],contact:['web_public.manage_contact_messages'],requests:['service_requests.view_service_requests','service_requests.manage_services','posts.view_review_queue'],ads:['ads.manage_ad'],numbers:['contacts.manage_contact'],settings:['posts.manage_settings','posts.manage_categories','notifications.manage_templates']};
  private static readonly MANAGE: Readonly<Partial<Record<string, string>>> = {district:'accounts.manage_district_admin',mandal:'accounts.manage_mandal_admin',village:'accounts.manage_village_admin',panchayat:'accounts.manage_panchayat_member'};
  private static readonly CONSOLE_PERM = 'web_admin.access_web_console';
  private static readonly LOGIN_ERR: Readonly<Record<string, string>> = {invalid_credentials:'Wrong username or password.',not_console_user:'This console is for Super Admins only. Use the mobile app.',account_blocked:'This account is blocked. Contact your administrator.'};

  state: State = {
    screen: 'checking', page: 'dashboard', username: '', password: '', cpCurrent: '', cpNext: '', cpVoluntary: false, showPw: {}, menuOpen: false, gsearch: '', me: null,
    geo: [], stateRow: null, expanded: {}, geoForm: null,
    users: [], userCount: 0, userPage: 1, userPages: 1, usersLoading: false,
    reqs: [], reqCount: 0, reqPage: 1, reqPages: 1, reqLoading: false, reqFilter: 'NEW', svcView: 'requests', ads: [], adsLoading: false, adsUnavailable: false, af: null,
    svcs: [], svcsLoading: false, svcsUnavailable: false, bills: [], billsLoading: false, billsUnavailable: false, sf: null, reqQ: '', reqCounts: {}, reqUnavailable: false,
    rq: null, rqAssignees: [], uf: {role: '', district: '', status: '', q: ''},
    posts: [], postCount: 0, postPage: 1, postPages: 1, postsLoading: false, statusCounts: {}, pendingCount: 0, pf: {district: '', cat: '', source: ''}, statusTab: 'Pending',
    numSel: [], adSel: [], bulk: '',
    panel: null, panelPost: null, panelHistory: [], panelUser: null, panelUserPosts: [], drawerOpen: false, nu: {...EMPTY_NU},
    audit: [], auditCount: 0, auditPage: 1, auditPages: 1, auditQ: '', auditLoading: false,
    contacts: [], contactCount: 0, contactPage: 1, contactPages: 1, contactQ: '', contactFilter: 'new', contactLoading: false,
    nums: [], numCount: 0, numPage: 1, numPages: 1, numLoading: false, numTab: 'AREA', numQ: '', numType: '', ctypes: [], ctypesAdmin: [], nf: null, tf: null,
    dash: null, reports: {summary: null, byArea: [], reviewTime: [], activity: []}, categories: [],
    settings: {escalation: 24, citizenPerDay: 5, langs: {te: true, en: true}, templates: []},
    modal: null, modalText: '', modalSel: '', modalGen: '', toasts: [], imp: null,
  };

  private toastTimers: Timer[] = [];
  private contactTimer: Timer | undefined;
  private numTimer: Timer | undefined;
  private userTimer: Timer | undefined;
  private auditTimer: Timer | undefined;
  private searchTimer: Timer | undefined;
  private reqTimer: Timer | undefined;
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

  private readonly onPop = (e: PopStateEvent): void => this.onBack(e);

  // Escape closes the top dialog or side panel: the keyboard's way out of the dimmed backdrop.
  private readonly onKey = (e: KeyboardEvent): void => {
    if (e.key !== 'Escape') return;
    const s = this.state;
    const form = FORMS.find((k) => s[k]);
    const close = s.modal ? () => this.closeModal()
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
  }

  // Browser history: each console page is its own entry (#users, #reports…), so Back and the swipe gesture move
  // between pages. Behind the first page sits a guard entry: going back onto it while signed in keeps the console
  // open and asks before leaving, so no one leaves the console signed in by accident.
  componentDidUpdate(_: Props, prev: State) {
    const s = this.state;
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
    this.toastTimers.forEach(clearTimeout);
    clearTimeout(this.contactTimer);
    clearTimeout(this.numTimer);
    clearTimeout(this.userTimer);
    clearTimeout(this.auditTimer);
    clearTimeout(this.searchTimer);
    clearTimeout(this.reqTimer);
    clearTimeout(this.teTimer);
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
      this.setState({screen: 'login', me: null, menuOpen: false, panel: null, drawerOpen: false, nf: null, cpVoluntary: false, cpCurrent: '', cpNext: ''});
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
    this.toast(text, '#b3261e');
  }

  private goPage(p: PageKey) {
    this.setState({page: p, menuOpen: false, panel: null, drawerOpen: false, nf: null, rq: null, af: null});
    if (this.scrollEl) this.scrollEl.scrollTop = 0;
    this.loadPage(p);
  }

  private ask(m: ModalSpec) {
    this.setState({modal: m, modalText: m.preset || '', modalSel: m.sel || (m.options && m.options.length ? m.options[0].id : ''), modalGen: ''});
  }

  private closeModal() {
    this.setState({modal: null, modalText: '', modalSel: '', modalGen: ''});
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

  private userCan(u: AdminUser, a: string) {
    return !u.allowed || u.allowed.includes(a);
  }

  private roleChoices(): Option[] {
    return ['district', 'mandal', 'village', 'panchayat'].filter((k) => this.can(Component.MANAGE[k] || '')).map((k) => ({id: k, label: Component.ROLE[k].label}));
  }

  // A temporary password to hand over in person: 12 characters, no look-alikes, at least one lower, upper and digit.
  private newPassword() {
    const sets = ['abcdefghjkmnpqrstuvwxyz', 'ABCDEFGHJKLMNPQRSTUVWXYZ', '23456789'];
    const all = sets.join('');
    const pick = (chars: string, n: number) => {
      const r = new Uint32Array(n);
      crypto.getRandomValues(r);
      return Array.from(r, (x) => chars[x % chars.length]);
    };
    const out = [...sets.map((c) => pick(c, 1)[0]), ...pick(all, 9)];
    const r = new Uint32Array(out.length);
    crypto.getRandomValues(r);
    for (let i = out.length - 1; i > 0; i--) {
      const j = r[i] % (i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out.join('');
  }

  private showSecret(name: string, secret: string) {
    this.ask({title: 'Temporary password · ' + name, body: 'Shown only this once. Give it to ' + name + ' in person. They choose their own password when they first log in.', secret, confirmLabel: 'Done', noCancel: true, bg: '#0D3B7A', onConfirm: () => {}});
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

  private pathParts(area: Area | null | undefined) {
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

  // ---- auth (username + password, Django session for the console) ----
  private enter(me: Me) {
    let want = (window.location.hash || '').slice(1);
    const cat = want === 'services';
    if (cat) want = 'requests';
    const asked = Component.PAGES.find((k) => k === want);
    const page = asked && this.navOk(asked, me) ? asked : (Component.PAGES.find((k) => this.navOk(k, me)) || 'dashboard');
    this.setState({me, screen: 'app', page, svcView: cat ? 'catalog' : 'requests', password: '', cpCurrent: '', cpNext: '', cpVoluntary: false, showPw: {}});
    this.loadGeo();
    this.loadCategories();
    this.loadPage(page);
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
    if (e instanceof ApiError && c === 'locked_out') {
      const sec = Number(e.body.retry_after_s) || 900;
      const min = Math.max(1, Math.ceil(sec / 60));
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
      this.setState({screen: 'login', menuOpen: false, panel: null, drawerOpen: false, modal: null, username: '', password: '', cpCurrent: '', cpNext: '', cpVoluntary: false, showPw: {}, me: null});
      this.toast('Signed out');
    });
  }

  // ---- loading ----
  private loadPage(p: PageKey) {
    if (p === 'dashboard') this.loadDash();
    if (p === 'users') this.loadUsers(1);
    if (p === 'posts') this.loadPosts(1);
    if (p === 'audit') this.loadAudit(1);
    if (p === 'contact') this.loadContacts(1);
    if (p === 'ads') this.loadAds();
    if (p === 'bills') this.loadServices(true);
    if (p === 'requests') {
      this.loadRequests(1);
      if (this.navOk('services')) this.loadServices();
    }
    if (p === 'numbers') {
      this.loadTypes();
      if (this.state.numTab !== 'TYPES') this.loadNumbers(1);
    }
    if (p === 'reports') this.loadReports();
    if (p === 'settings') this.loadSettings();
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

  private loadCategories() {
    return this.api.get<ListOrPage<Category>>('/admin/categories/').then((d) => {
      const categories = Array.isArray(d) ? d : (d.results || []);
      this.setState({categories});
    }).catch(() => {});
  }

  private loadDash() {
    this.api.get<Dashboard>('/admin/dashboard/').then((dash) => this.setState({dash, pendingCount: dash.kpis.pending})).catch((e: unknown) => this.fail(e));
  }

  private adaptUser(u: User): AdminUser {
    const ras = (u.role_assignments || []).filter((r) => r.is_active !== false);
    const ra = ras[0] || null;
    const role = ra ? (Component.RK[ra.role] || 'panchayat') : 'panchayat';
    const parts = this.pathParts(ra && ra.area);
    return {
      id: u.id, name: u.name, te: u.name_te || u.name, nameTe: u.name_te || '', mobile: u.mobile || '', email: u.email || '', username: u.username || '', role,
      district: parts.district, mandal: parts.mandal, village: parts.village, area: ra ? ra.area : null, raId: ra ? ra.id : null, ras,
      active: u.is_active !== undefined ? !!u.is_active : u.status === 'ACTIVE', locked: !!u.locked_out,
      allowed: Array.isArray(u.allowed_actions) ? u.allowed_actions : null, last: this.fmtLast(u.last_login_at),
    };
  }

  private loadUsers(page: number) {
    const uf = this.state.uf;
    this.setState({usersLoading: true});
    this.api.get<Paged<User>>('/users/', {role: uf.role ? Component.RAPI[uf.role] : '', district: uf.district, status: uf.status ? uf.status.toUpperCase() : '', is_active: uf.status ? String(uf.status === 'active') : '', q: uf.q, page, page_size: Component.PAGE})
      .then((d) => this.setState({users: d.results.map((u) => this.adaptUser(u)), userCount: d.count, userPage: page, userPages: Math.max(1, Math.ceil(d.count / Component.PAGE)), usersLoading: false}))
      .catch((e: unknown) => {
        this.setState({usersLoading: false});
        this.fail(e);
      });
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
    this.setState({postsLoading: true});
    this.api.get<PostsPage>('/posts/', this.postQuery(page))
      .then((d) => this.setState({posts: d.results.map((p) => this.adaptPost(p)), postCount: d.count, postPage: page, postPages: Math.max(1, Math.ceil(d.count / Component.PAGE)), statusCounts: d.status_counts || {}, pendingCount: (d.status_counts || {}).PENDING || 0, postsLoading: false}))
      .catch((e: unknown) => {
        this.setState({postsLoading: false});
        this.fail(e);
      });
  }

  private loadAudit(page: number) {
    this.setState({auditLoading: true});
    this.api.get<Paged<AuditEntry>>('/audit/', {q: this.state.auditQ, page, page_size: Component.PAGE})
      .then((d) => this.setState({audit: d.results, auditCount: d.count, auditPage: page, auditPages: Math.max(1, Math.ceil(d.count / Component.PAGE)), auditLoading: false}))
      .catch((e: unknown) => {
        this.setState({auditLoading: false});
        this.fail(e);
      });
  }

  private loadRequests(page: number) {
    const s = this.state;
    this.setState({reqLoading: true});
    this.api.get<ServiceRequestsPage>('/service-requests/', {status: s.reqFilter === 'ALL' ? '' : s.reqFilter, q: s.reqQ, page, page_size: Component.PAGE})
      .then((d) => this.setState({reqs: d.results || [], reqCount: d.count || 0, reqCounts: d.status_counts || {}, reqPage: page, reqPages: Math.max(1, Math.ceil((d.count || 0) / Component.PAGE)), reqLoading: false, reqUnavailable: false}))
      .catch((e: unknown) => {
        this.setState({reqLoading: false, reqs: [], reqCount: 0, reqCounts: {}, reqUnavailable: isStatus(e, 404)});
        if (!isStatus(e, 404)) this.fail(e);
      });
  }

  // --- Ads: the Super Admin's banners on citizens' Home.
  // ---- services citizens can request (mobile: Super Admin › Services; API: services-catalog-backend-plan.md) ----
  // Until the server has GET /admin/services/, the page shows the app's built-in list read-only and says so.
  private static readonly SVC_SEED: CatalogItem[] = [['aadhaar','Aadhaar Services','ఆధార్ సేవలు','aadhaar','orange'],['pan','PAN Services','పాన్ సేవలు','id_badge','blue'],['voter_id','Voter ID','ఓటర్ ఐడి','eci','green'],['certificates','Certificates','ధ్రువపత్రాలు','certificate','purple'],['loans_insurance','Loans & Insurance','రుణాలు & బీమా','loan','teal'],['govt_schemes','Govt Schemes','ప్రభుత్వ పథకాలు','scheme','orange'],['land_records','Land Records','భూ రికార్డులు','land','purple'],['farmer','Farmer Services','రైతు సేవలు','farmer','green']].map(([key,name_en,name_te,icon,color])=>({key,name_en,name_te,icon,color,is_active:true}));
  private static readonly SVC_COLORS: Readonly<Record<string, readonly [string, string, string]>> = {orange:['#B35A0E','#FFF0DC','Orange'],blue:['#1A75C4','#E3F0FB','Blue'],green:['#1D7A33','#E4F4DF','Green'],purple:['#8F4BB4','#F1E6F7','Purple'],teal:['#07818E','#DFF3F5','Teal']};
  private static readonly SVC_ICONS: Readonly<Record<string, string>> = {aadhaar:'img:/assets/logo-aadhaar.svg',eci:'img:/assets/logo-eci.svg',id_badge:'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM9 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5.5 16.5c.6-1.8 2-2.7 3.5-2.7s2.9.9 3.5 2.7M14.5 9.5h4M14.5 13h3',
    card:'M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM2 10h20M6 15h4',certificate:'M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM8.5 13 7 21l5-3 5 3-1.5-8',document:'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4',
    scheme:'M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10M2 10l10-6 10 6z',loan:'M11 14h2a2 2 0 0 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16M7 20l1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.8-2.8L14.6 13M2 15l6 6',land:'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
    farmer:'M7 20h10M10 20c5.5-2.5.8-6.4 3-10M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8zM14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z',house:'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',ration:'M5 11l3-6M19 11l-3-6M2 11h20l-2 9H4zM9 15v2M15 15v2',
    health:'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',education:'M2 9l10-5 10 5-10 5zM6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5M22 9v6',pension:'M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM10 22l1-7 3 3v4M11 15l-1-4 4-1 2 3M17 13v9',women:'M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 15v7M9 19h6',
    job:'M4 7h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18',water:'M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z',power:'M13 2 4 14h7l-1 8 9-12h-7z',police:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9.5 11.5l1.8 1.8 3.4-3.6',
    help:'M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z',services:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-1.7-1L14.8 3H9.2l-.4 2.6a7.5 7.5 0 0 0-1.7 1l-2.4-1-2 3.4L4.7 11a7.4 7.4 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 1.7 1l.4 2.6h5.6l.4-2.6a7.5 7.5 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1z'};
  // ---- bills & recharges on Home (mobile: Super Admin › More › Bills & Recharges; API: bills-catalog-backend-plan.md) ----
  // A separate list with its own endpoints; same fields, logo upload and screens as services. Until the server has
  // GET /admin/bills/, the page shows the app's built-in bills read-only.
  private static readonly BILL_SEED: CatalogItem[] = [['electricity','Electricity Bill','కరెంట్ బిల్లు','power','orange'],['water_bill','Water Bill','నీటి బిల్లు','water','blue'],['mobile_recharge','Mobile Recharge','మొబైల్ రీఛార్జ్','mobile','purple'],['dth_recharge','DTH Recharge','DTH రీఛార్జ్','dth','teal'],['broadband','Broadband','బ్రాడ్‌బ్యాండ్','broadband','green']].map(([key,name_en,name_te,icon,color])=>({key,name_en,name_te,icon,color,is_active:true}));
  private static readonly BILL_ICONS: Readonly<Record<string, string>> = {power:'M13 2 4 14h7l-1 8 9-12h-7z',water:'M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z',gas:'M10 2h4v3h-4zM8 5h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM6 11h12',
    mobile:'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM12 18h.01',landline:'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',
    dth:'M4 10a7.3 7.3 0 0 0 10 10zM10.5 13.5l3-3M13 7a4 4 0 0 1 4 4M13 3a8 8 0 0 1 8 8',broadband:'M5 12.55a11 11 0 0 1 14 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.1a6 6 0 0 1 6.95 0M12 20h.01',
    fastag:'M3 7h18v10H3zM7 7v10M17 11h-6M17 14h-4',credit_card:'M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM2 10h20M6 15h4',
    bill:'M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1zM16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11'};

  // Where a list lives: state keys, endpoint, built-in fallback, icon set and words.
  private cat(b: boolean): CatalogSet {
    return b
      ? {l: 'bills', ld: 'billsLoading', un: 'billsUnavailable', path: '/admin/bills/', seed: Component.BILL_SEED, icon: 'bill', icons: Component.BILL_ICONS, one: 'bill', what: 'bills list'}
      : {l: 'svcs', ld: 'svcsLoading', un: 'svcsUnavailable', path: '/admin/services/', seed: Component.SVC_SEED, icon: 'services', icons: Component.SVC_ICONS, one: 'service', what: 'services list'};
  }

  private loadServices(b = false) {
    const c = this.cat(b);
    this.setState(one(c.ld, true));
    this.api.get<ListOrPage<CatalogItem>>(c.path)
      .then((d) => this.setState({...one(c.l, Array.isArray(d) ? d : (d.results || [])), ...one(c.ld, false), ...one(c.un, false)}))
      .catch((e: unknown) => {
        const nf = isStatus(e, 404);
        this.setState({...one(c.ld, false), ...one(c.un, nf), ...one(c.l, nf ? c.seed : [])});
        if (!nf) this.fail(e);
      });
  }

  private openService(g: CatalogItem | null, b = false) {
    const c = this.cat(b);
    if (this.state[c.un]) return;
    this.setState({sf: g
      ? {bill: b, key: g.key, en: g.name_en, te: g.name_te || '', icon: g.icon || c.icon, color: g.color || 'blue', image: g.logo || '', had: !!g.logo, file: null, active: g.is_active !== false, tried: false, saving: false, hintEn: g.hint_en || '', hintTe: g.hint_te || ''}
      : {bill: b, key: null, en: '', te: '', icon: c.icon, color: 'blue', image: '', had: false, file: null, active: true, tried: false, saving: false, hintEn: '', hintTe: ''}});
  }

  // The Super Admin's own logo (contract section 16: `logo`): PNG, JPG or WebP up to 2 MB.
  private pickServiceIcon() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp';
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        this.toast('The logo is larger than 2 MB', '#E9791E');
        return;
      }
      this.setState((st) => ({sf: st.sf && {...st.sf, file, image: URL.createObjectURL(file)}}));
    };
    input.click();
  }

  private svcErr(f: ServiceForm) {
    const c = this.cat(f.bill), en = f.en.trim();
    if (en.length < 2) return 'Enter an English name of at least 2 letters';
    if (this.state[c.l].some((g) => g.key !== f.key && g.name_en.toLowerCase() === en.toLowerCase())) return 'A ' + c.one + ' with this name already exists';
    return '';
  }

  private saveService() {
    const f = this.state.sf;
    if (!f || f.saving) return;
    if (this.svcErr(f)) {
      this.setState({sf: {...f, tried: true}});
      return;
    }
    const c = this.cat(f.bill), body = {name_en: f.en.trim(), name_te: f.te.trim(), icon: f.icon, color: f.color, is_active: f.active,
      ...(f.bill ? {} : {hint_en: f.hintEn.trim(), hint_te: f.hintTe.trim()})};
    this.setState({sf: {...f, saving: true}});
    const path = f.key ? c.path + f.key + '/' : c.path;
    let req: Promise<unknown>;
    if (f.file) {
      const fd = new FormData();
      Object.entries(body).forEach(([k, v]) => fd.append(k, String(v)));
      fd.append('logo', f.file);
      req = this.api.upload(path, fd, undefined, f.key ? 'PATCH' : 'POST');
    } else req = f.key ? this.api.patch(path, {...body, ...(f.had && !f.image ? {logo: null} : {})}) : this.api.post(path, body);
    req.then((x) => {
      this.setState({sf: null});
      // A server without the example yet drops it: say so rather than lose it quietly.
      if (!f.bill && (f.hintEn + f.hintTe).trim() && !(x && typeof x === 'object' && 'hint_en' in x)) this.toast('Saved. The request example needs a server update before citizens see it.', '#E9791E');
      else this.toast(f.key ? 'Changes saved' : (f.bill ? 'Bill added · ' : 'Service added · ') + body.name_en);
      this.loadServices(f.bill);
    }).catch((e: unknown) => {
      this.setState((x) => ({sf: x.sf && {...x.sf, saving: false}}));
      if (isStatus(e, 404)) {
        this.setState(one(c.un, true));
        this.toast('The ' + c.what + ' is not on the server yet.', '#E9791E');
        return;
      }
      this.fail(e);
    });
  }

  private toggleService(g: CatalogItem, b = false) {
    const c = this.cat(b);
    if (this.state[c.un]) return;
    this.api.patch(c.path + g.key + '/', {is_active: g.is_active === false}).then(() => {
      this.toast(g.is_active === false ? (b ? 'Bill is on Home' : 'Service is on Home') : (b ? 'Bill hidden' : 'Service hidden'));
      this.loadServices(b);
    }).catch((e: unknown) => this.fail(e));
  }

  private moveService(g: CatalogItem, by: number, b = false) {
    const c = this.cat(b), items = this.state[c.l], i = items.findIndex((x) => x.key === g.key), j = i + by;
    if (this.state[c.un] || i < 0 || j < 0 || j >= items.length) return;
    const next = [...items];
    next[i] = items[j];
    next[j] = g;
    this.setState(one(c.l, next));
    this.api.post(c.path + 'order/', {keys: next.map((x) => x.key)}).catch((e: unknown) => {
      this.setState(one(c.l, items));
      this.fail(e);
    });
  }

  private loadAds() {
    this.setState({adsLoading: true});
    if (!this.state.geo.length) this.loadGeo();
    this.api.get<ListOrPage<Ad>>('/admin/ads/', {page_size: 100})
      .then((d) => this.setState({ads: Array.isArray(d) ? d : (d.results || []), adsLoading: false, adsUnavailable: false}))
      .catch((e: unknown) => {
        this.setState({adsLoading: false, ads: [], adsUnavailable: isStatus(e, 404)});
        if (!isStatus(e, 404)) this.fail(e);
      });
  }

  private today() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  private adStatus(a: Ad): AdStatus {
    const t = this.today();
    if (a.ends_on && a.ends_on < t) return 'ended';
    if (!a.is_active) return 'paused';
    if (a.starts_on && a.starts_on > t) return 'scheduled';
    return 'live';
  }

  private dayLabel(x: string | null) {
    return x ? new Date(x + 'T00:00:00').toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'}) : '';
  }

  // An ad's area as the form's three picks (ids as strings; '' = all); STATE = every village.
  private adArea(a: Ad['area']) {
    const none = {d: '', m: '', v: ''};
    if (!a || a.level === 'STATE') return none;
    for (const d of this.state.geo) {
      if (a.level === 'DISTRICT' && d.id === a.id) return {d: String(d.id), m: '', v: ''};
      for (const m of d.mandals) {
        if (a.level === 'MANDAL' && m.id === a.id) return {d: String(d.id), m: String(m.id), v: ''};
        for (const v of m.villages) if (a.level === 'VILLAGE' && v.id === a.id) return {d: String(d.id), m: String(m.id), v: String(v.id)};
      }
    }
    return none;
  }

  private openAd(a: Ad | null) {
    this.setState({af: a
      ? {id: a.id, title: a.title, link: a.link || '', file: null, preview: a.image, ...this.adArea(a.area), start: a.starts_on || '', end: a.ends_on || '', active: !!a.is_active, tried: false, saving: false}
      : {id: null, title: '', link: '', file: null, preview: '', d: '', m: '', v: '', start: this.today(), end: '', active: true, tried: false, saving: false}});
  }

  private adErrors(f: AdForm) {
    const e: AdErrors = {};
    if (!f.title.trim()) e.title = 'Enter a name for the ad.';
    if (!f.preview) e.image = 'Choose a banner image.';
    const l = f.link.trim();
    if (l && !/^https?:\/\/[^\s/]+\.[^\s]+$/.test(l)) e.link = 'Enter a full link starting with https://';
    if (f.start && f.end && f.end < f.start) e.end = 'The end date must be on or after the start date.';
    return e;
  }

  private pickAdImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        this.toast('The image is larger than 5 MB');
        return;
      }
      const url = URL.createObjectURL(file);
      this.setState((st) => ({af: st.af && {...st.af, file, preview: url}}));
    };
    input.click();
  }

  private saveAd() {
    const f = this.state.af;
    if (!f || f.saving) return;
    if (Object.keys(this.adErrors(f)).length) {
      this.setState({af: {...f, tried: true}});
      return;
    }
    const st = this.state.stateRow;
    const area = f.v ? ['VILLAGE', f.v] : f.m ? ['MANDAL', f.m] : f.d ? ['DISTRICT', f.d] : ['STATE', st && st.id];
    const fields = {title: f.title.trim(), link: f.link.trim(), area_level: String(area[0]), area_id: String(area[1]), starts_on: f.start || '', ends_on: f.end || '', is_active: String(f.active)};
    let req: Promise<unknown>;
    if (f.file) {
      const fd = new FormData();
      Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
      fd.append('image', f.file);
      req = f.id ? this.api.upload('/admin/ads/' + f.id + '/', fd, undefined, 'PATCH') : this.api.upload('/admin/ads/', fd);
    } else req = this.api.patch('/admin/ads/' + f.id + '/', {...fields, area_id: Number(area[1]), starts_on: f.start || null, ends_on: f.end || null, is_active: f.active});
    this.setState({af: {...f, saving: true}});
    req.then(() => {
      this.setState({af: null});
      this.toast((f.id ? 'Ad saved · ' : 'Ad published · ') + fields.title);
      this.loadAds();
    }).catch((e: unknown) => {
      this.setState((x) => ({af: x.af && {...x.af, saving: false}}));
      this.fail(e);
    });
  }

  private toggleAd(a: Ad) {
    this.api.patch('/admin/ads/' + a.id + '/', {is_active: !a.is_active}).then(() => {
      this.toast((a.is_active ? 'Paused · ' : 'Showing again · ') + a.title);
      this.loadAds();
    }).catch((e: unknown) => this.fail(e));
  }

  private deleteAd(a: Ad) {
    this.ask({title: 'Delete this ad?', body: '"' + a.title + '" will be removed from every Home page. This cannot be undone.', confirmLabel: 'Delete', bg: '#b3261e', onConfirm: () => this.api.del('/admin/ads/' + a.id + '/').then(() => {
      this.setState({af: null});
      this.toast('Ad deleted · ' + a.title);
      this.loadAds();
    }).catch((e: unknown) => this.fail(e))});
  }

  // One request in the side panel; the people it can be assigned to are the active officials this admin sees.
  private openRequest(r: ServiceRequest) {
    this.setState({rq: {r}, rqAssignees: []});
    if ((r.allowed_actions || []).includes('assign')) {
      this.api.get<Paged<User>>('/users/', {is_active: 'true', page: 1, page_size: 100}).then((d) => this.setState({rqAssignees: (d.results || []).map((u) => {
        const ra = (u.role_assignments || [])[0];
        const role = (Component.ROLE[Component.RK[ra?.role ?? '']] || {label: ''}).label;
        return {id: String(u.id), label: !role || u.name.toLowerCase() === role.toLowerCase() ? u.name : u.name + ' · ' + role};
      })})).catch(() => {});
    }
  }

  // Only the person a request is assigned to changes it (the server sends that as allowed_actions); everyone else reads.
  private svcAllowed(r: ServiceRequest) {
    return (r.allowed_actions || []).includes('set_status') ? Object.keys(Component.SVC_STATUS) : [];
  }

  private patchRequest(r: ServiceRequest, body: {status?: string; assigned_to?: string | null; note?: string}, msg: string) {
    return this.api.patch<ServiceRequest | null>('/service-requests/' + r.id + '/', body).then((n) => {
      this.setState((x) => ({rq: x.rq && {...x.rq, r: n || x.rq.r}}));
      this.toast(msg);
      this.loadRequests(this.state.reqPage);
    }).catch((e: unknown) => this.fail(e));
  }

  // A note only when the request is closed: why it was rejected, or what to do now it is done.
  private moveRequest(r: ServiceRequest, to: string) {
    const label = Component.SVC_STATUS[to].label;
    const reject = to === 'REJECTED', closing = reject || to === 'COMPLETED';
    this.ask({title: 'Change status to ' + label + '?', body: Component.SVC_MOVE[to], needsText: closing, textLabel: reject ? 'Reason (required; the citizen sees it)' : 'Note for the citizen (required)', confirmLabel: reject ? 'Reject' : 'Change status', bg: reject ? '#b3261e' : '#0D3B7A',
      onConfirm: (t) => this.patchRequest(r, {status: to, ...(t.trim() ? {note: t.trim()} : {})}, 'Status: ' + label)});
  }

  private assignRequest(r: ServiceRequest, id: string) {
    const was = r.assigned_to ? String(r.assigned_to.id) : '';
    if (id === was) return;
    const who = this.state.rqAssignees.find((a) => a.id === id);
    this.patchRequest(r, {assigned_to: id || null}, id ? 'Assigned to ' + (who ? who.label.split(' · ')[0] : 'them') : 'Not assigned now');
  }

  private loadContacts(page: number) {
    const s = this.state;
    this.setState({contactLoading: true});
    this.api.get<Paged<ContactMessage>>('/admin/contact-messages/', {status: s.contactFilter === 'all' ? '' : s.contactFilter, q: s.contactQ, page, page_size: Component.PAGE})
      .then((d) => this.setState({contacts: d.results || [], contactCount: d.count || 0, contactPage: page, contactPages: Math.max(1, Math.ceil((d.count || 0) / Component.PAGE)), contactLoading: false}))
      .catch((e: unknown) => {
        this.setState({contactLoading: false, contacts: [], contactCount: 0});
        this.fail(e);
      });
  }

  private isHandled(c: ContactMessage) {
    return c.status ? String(c.status).toUpperCase() === 'HANDLED' : !!c.handled;
  }

  private toggleContact(c: ContactMessage) {
    const done = !this.isHandled(c);
    this.api.patch('/admin/contact-messages/' + c.id + '/', {handled: done}).then(() => {
      this.toast(done ? 'Marked handled' : 'Marked new', done ? '#6cc04a' : '#E9791E');
      this.loadContacts(this.state.contactPage);
    }).catch((e: unknown) => this.fail(e));
  }

  // ---- important numbers (contract section 14) ----
  private loadNumbers(page: number) {
    const s = this.state;
    this.setState({numLoading: true});
    this.api.get<Paged<AdminContact>>('/admin/contacts/', {section: s.numTab, type: s.numType, q: s.numQ, page, page_size: Component.PAGE})
      .then((d) => this.setState({nums: d.results || [], numCount: d.count || 0, numPage: page, numPages: Math.max(1, Math.ceil((d.count || 0) / Component.PAGE)), numLoading: false}))
      .catch((e: unknown) => {
        this.setState({numLoading: false, nums: [], numCount: 0});
        this.fail(e);
      });
  }

  // adminOnly: after adding a type, the public list may still be the cached one, so only the admin list reloads.
  private loadTypes(adminOnly?: boolean) {
    if (!adminOnly) this.api.get<ListOrPage<ContactTypeRef>>('/contact-types/').then((d) => this.setState({ctypes: Array.isArray(d) ? d : (d.results || [])})).catch(() => {});
    if (this.can('contacts.manage_contact_types')) this.api.get<ListOrPage<AdminContactType>>('/admin/contact-types/').then((d) => this.setState({ctypesAdmin: Array.isArray(d) ? d : (d.results || [])})).catch((e: unknown) => this.fail(e));
  }

  // The server's phone grammar: drop spaces, dashes, brackets and a leading +91 (or 91 before 10 digits).
  private phoneDigits(p: string) {
    const d = String(p || '').replace(/[\s\-()]/g, '');
    return d.startsWith('+91') ? d.slice(3) : /^91\d{10}$/.test(d) ? d.slice(2) : d;
  }

  private openNumber(c: AdminContact | null) {
    const a = c && c.area && c.area.level !== 'STATE' ? c.area : null;
    this.setState({nf: c
      ? {id: c.id, section: c.type.section, type: c.type.key, typeObj: {...c.type, is_other: !!c.custom_type}, custom: c.custom_type || '', name: c.name, te: c.name_te || '', phone: c.phone, email: c.email || '', level: a ? a.level : 'VILLAGE', area: a ? String(a.id) : '', sort: String(c.sort_order == null ? 100 : c.sort_order), consent: !!c.consent_recorded}
      : {id: null, section: this.state.numTab === 'HELPLINE' ? 'HELPLINE' : 'AREA', type: '', custom: '', name: '', te: '', phone: '', email: '', level: 'VILLAGE', area: '', sort: '100', consent: false}});
  }

  private nfView() {
    const f = this.state.nf;
    if (!f) return null;
    // "Other" is not a type: new kinds come from Add type; a number already "Other" keeps it (typeObj below)
    const types = this.state.ctypes.filter((x) => x.section === f.section && !x.is_other);
    const own = f.typeObj;
    if (own && !types.some((x) => x.key === own.key)) types.unshift(own);
    const type = types.find((x) => x.key === f.type) || types[0] || null;
    const areas = f.section === 'AREA' ? this.areaOptions(Component.LVROLE[f.level]) : [];
    const area = areas.find((x) => x.id === f.area) || areas[0] || null;
    const mobile = /^[6-9]\d{9}$/.test(this.phoneDigits(f.phone));
    const ok = !!(f.name.trim() && this.phoneDigits(f.phone) && type && (!type.is_other || f.custom.trim()) && (f.section !== 'AREA' || area) && (!mobile || f.consent) && (!f.email.trim() || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())));
    return {f, types, type, areas, area, mobile, ok};
  }

  private saveNumber() {
    const n = this.nfView();
    // ok implies a type (and an area for AREA numbers); the checks below only tell TypeScript so.
    if (!n || !n.ok || !n.type) return;
    const f = n.f;
    const body = {type: n.type.key, name: f.name.trim(), name_te: f.te.trim(), phone: f.phone.trim(), email: f.email.trim(), sort_order: f.sort === '' ? 100 : Number(f.sort), consent_recorded: n.mobile && f.consent,
      area: f.section === 'AREA' && n.area ? {level: n.area.level, id: Number(n.area.id)} : {level: 'STATE', id: this.state.stateRow && this.state.stateRow.id},
      ...(n.type.is_other ? {custom_type: f.custom.trim()} : {})};
    (f.id ? this.api.patch('/admin/contacts/' + f.id + '/', body) : this.api.post('/admin/contacts/', body)).then(() => {
      this.setState({nf: null});
      this.toast((f.id ? 'Number updated · ' : 'Number added · ') + body.name);
      this.loadNumbers(f.id ? this.state.numPage : 1);
    }).catch((e: unknown) => this.fail(e));
  }

  private verifyNumber(c: AdminContact) {
    this.api.patch('/admin/contacts/' + c.id + '/', {verified: true}).then(() => {
      this.toast('Marked verified · ' + c.name);
      this.loadNumbers(this.state.numPage);
    }).catch((e: unknown) => this.fail(e));
  }

  private removeNumber(c: AdminContact) {
    this.ask({title: 'Remove number', body: 'Remove ' + c.name + ' (' + c.phone + ')? Citizens stop seeing it at once. The audit log keeps a record.', confirmLabel: 'Remove', bg: '#b3261e', onConfirm: () => this.api.del('/admin/contacts/' + c.id + '/').then(() => {
      this.toast('Number removed', '#E9791E');
      this.loadNumbers(this.state.numPage);
    }).catch((e: unknown) => this.fail(e))});
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

  private importNumbers() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,text/csv';
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const form = () => {
        const fd = new FormData();
        fd.append('file', file);
        return fd;
      };
      this.api.upload<ContactImportResult>('/admin/contacts/import/', form(), {dry_run: 1}).then((r) => this.ask({title: 'Import important numbers', body: 'File checked: ' + r.created + ' new, ' + r.updated + ' updated, ' + r.skipped + ' unchanged.', confirmLabel: 'Import', bg: '#0D3B7A',
        onConfirm: () => this.api.upload<ContactImportResult>('/admin/contacts/import/', form()).then((d) => {
          this.toast('Imported · ' + d.created + ' new, ' + d.updated + ' updated');
          this.loadNumbers(1);
        }).catch((e: unknown) => this.fail(e))})).catch((e: unknown) => {
        const errors = reportErrors(e).filter(isRowError);
        if (errors.length) {
          this.ask({title: 'File has errors', body: errors.slice(0, 5).map((x) => 'Row ' + x.row + (x.field ? ' · ' + x.field : '') + ': ' + x.message).join(' · ') + (errors.length > 5 ? ' · and ' + (errors.length - 5) + ' more.' : ''), confirmLabel: 'Close', bg: '#3b4a5c', onConfirm: () => {}});
        } else this.fail(e);
      });
    };
    input.click();
  }

  // Add a contact type: one form (section, English and Telugu names); the key is made from the English name.
  private addType(section?: string, forNumber?: boolean) {
    this.setState({tf: {section: section || (this.state.numTab === 'HELPLINE' ? 'HELPLINE' : 'AREA'), forNumber: !!forNumber, en: '', te: '', tried: false, saving: false}});
  }

  // Edit a type: the same form; the names change, the section and key stay (the server keeps them).
  private editType(t: AdminContactType) {
    this.setState({tf: {id: t.id, section: t.section, en: t.name_en || '', te: t.name_te && t.name_te !== t.name_en ? t.name_te : '', tried: false, saving: false}});
  }

  // Delete a type nobody uses. One with numbers cannot go: move or remove them first, or switch it off.
  private deleteType(t: AdminContactType) {
    const n = t.contact_count || 0;
    if (n) {
      this.ask({title: 'This type is in use', body: n + ' number' + (n === 1 ? ' uses' : 's use') + ' "' + t.name_en + '". Change ' + (n === 1 ? 'its' : 'their') + ' type, or remove ' + (n === 1 ? 'it' : 'them') + ', then delete the type. Or switch the type off: it is hidden from citizens and its numbers stay.', confirmLabel: 'OK', bg: '#3b4a5c', noCancel: true, onConfirm: () => {}});
      return;
    }
    this.ask({title: 'Delete "' + t.name_en + '"?', body: 'No number uses this type. It is removed from the list for good.', confirmLabel: 'Delete', bg: '#b3261e', onConfirm: () => this.api.del('/admin/contact-types/' + t.id + '/').then(() => {
      this.setState((st) => ({ctypesAdmin: st.ctypesAdmin.filter((x) => x.id !== t.id), ctypes: st.ctypes.filter((x) => x.key !== t.key)}));
      this.toast('Type deleted · ' + t.name_en, '#E9791E');
    }).catch((e: unknown) => {
      // Until the server can delete types (backend plan: contact-type-delete), it answers 405.
      if (isStatus(e, 405)) this.ask({title: 'Not available yet', body: 'Deleting a type needs a server update, which is planned. For now, switch the type off: citizens stop seeing it.', confirmLabel: 'OK', bg: '#3b4a5c', noCancel: true, onConfirm: () => {}});
      else this.fail(e);
    })});
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

  private tfErrs(f: TypeForm) {
    return {en: !f.en.trim() ? 'Enter the English name.' : '', te: ''};
  }

  private saveType() {
    const f = this.state.tf;
    if (!f || f.saving) return;
    const e = this.tfErrs(f);
    if (e.en || e.te) {
      this.setState({tf: {...f, tried: true}});
      return;
    }
    const en = f.en.trim(), key = (en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'type').slice(0, 40);
    this.setState({tf: {...f, saving: true}});
    if (f.id) {
      this.api.patch<AdminContactType | null>('/admin/contact-types/' + f.id + '/', {name_en: en, name_te: f.te.trim() || en}).then((x) => {
        this.setState((st) => ({tf: null, ctypesAdmin: st.ctypesAdmin.map((c) => c.id === f.id ? {...c, ...(x || {}), name_en: en, name_te: f.te.trim() || en} : c), ctypes: st.ctypes.map((c) => x && c.key === x.key ? {...c, name: en} : c)}));
        this.toast('Type saved · ' + en);
      }).catch((err: unknown) => {
        this.setState((st) => ({tf: st.tf && {...st.tf, saving: false}}));
        this.fail(err);
      });
      return;
    }
    this.api.post<AdminContactType | null>('/admin/contact-types/', {key, section: f.section, name_en: en, name_te: f.te.trim() || en}).then((x) => {
      const k = (x && x.key) || key;
      // the public types list can come back cached for a moment: add the new type here
      this.setState((st) => ({tf: null, ctypes: st.ctypes.some((c) => c.key === k) ? st.ctypes : [...st.ctypes, {key: k, section: f.section, name: en, is_other: false}], nf: f.forNumber && st.nf ? {...st.nf, type: k, custom: ''} : st.nf}));
      this.toast('Type added · ' + en);
      this.loadTypes(true);
    }).catch((err: unknown) => {
      this.setState((x) => ({tf: x.tf && {...x.tf, saving: false}}));
      this.fail(err);
    });
  }

  private toggleType(t: AdminContactType) {
    this.api.patch('/admin/contact-types/' + t.id + '/', {is_active: !t.is_active}).then(() => {
      this.toast(t.name_en + (t.is_active ? ' switched off' : ' switched on'), t.is_active ? '#E9791E' : '#6cc04a');
      this.loadTypes();
    }).catch((e: unknown) => this.fail(e));
  }

  private humanAction(k: string) {
    const p = String(k || '').split('.');
    return (p[1] || p[0]).replace(/_/g, ' ');
  }

  private loadReports() {
    Promise.all([
      this.api.get<ReportSummary>('/admin/reports/summary/'),
      this.api.get<ReportDistrict[]>('/admin/reports/posts-by-area/'),
      this.api.get<ReportReviewTime[]>('/admin/reports/review-time/'),
      this.api.get<Paged<ReportActivity>>('/admin/reports/admin-activity/', {page_size: 8}),
    ]).then(([summary, byArea, reviewTime, activity]) => this.setState({reports: {summary, byArea, reviewTime, activity: activity.results}})).catch((e: unknown) => this.fail(e));
  }

  private loadSettings() {
    this.loadCategories();
    this.api.get<Settings>('/admin/settings/').then((st) => this.setState((s) => ({settings: {...s.settings, escalation: st.review_escalation_hours, citizenPerDay: st.citizen_posts_per_day ?? 0, langs: {te: true, en: !!st.languages?.en}}}))).catch((e: unknown) => this.fail(e));
    this.api.get<ListOrPage<NotificationTemplate>>('/admin/notification-templates/').then((d) => {
      const templates = Array.isArray(d) ? d : (d.results || []);
      this.setState((s) => ({settings: {...s.settings, templates}}));
    }).catch(() => {});
  }

  private openPost(p: PostRow) {
    this.setState({panel: {type: 'post', id: p.id}, panelPost: p, panelHistory: []});
    this.api.get<ReviewAction[]>('/posts/' + p.id + '/history/').then((h) => {
      if (this.state.panel && this.state.panel.id === p.id) this.setState({panelHistory: h});
    }).catch(() => {});
  }

  private refreshPost(id: string) {
    return this.api.get<Post>('/posts/' + id + '/').then((p) => {
      const ap = this.adaptPost(p);
      this.setState((s) => ({panelPost: s.panel && s.panel.id === id ? ap : s.panelPost, posts: s.posts.map((x) => x.id === id ? ap : x)}));
      return this.api.get<ReviewAction[]>('/posts/' + id + '/history/').then((h) => {
        if (this.state.panel && this.state.panel.id === id) this.setState({panelHistory: h});
      });
    }).catch(() => {});
  }

  private openUser(u: AdminUser) {
    this.setState({panel: {type: 'user', id: u.id}, panelUser: u, panelUserPosts: []});
    this.api.get<Paged<Post>>('/posts/', {author: u.id, page_size: 5}).then((d) => this.setState({panelUserPosts: d.results.map((p) => this.adaptPost(p))})).catch(() => {});
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

  // ---- users actions ----
  // Add User area picker, same as the mobile app: district -> mandal -> village, each list only inside the step above.
  private areaSteps(f: NewUserForm) {
    const g = this.state.geo.filter((d) => d.active);
    const lv = Component.LEVEL_OF_ROLE[f.role];
    const d = g.find((x) => String(x.id) === String(f.nuD));
    const m = d && d.mandals.find((x) => String(x.id) === String(f.nuM));
    const steps: {key: 'nuD' | 'nuM' | 'area'; label: string; ph: string; value: string; options: Option[]}[] = [{key: 'nuD', label: 'District', ph: 'Choose a district', value: f.nuD || '', options: g.map((x) => ({id: String(x.id), label: this.nl(x)}))}];
    if (lv !== 'DISTRICT' && d) steps.push({key: 'nuM', label: 'Mandal', ph: 'Choose a mandal', value: f.nuM || '', options: d.mandals.filter((x) => x.active).map((x) => ({id: String(x.id), label: this.nl(x)}))});
    if (lv === 'VILLAGE' && m) steps.push({key: 'area', label: 'Village', ph: 'Choose a village', value: f.area || '', options: m.villages.filter((x) => x.active).map((x) => ({id: String(x.id), label: this.nl(x)}))});
    return steps;
  }

  private areaPick(prev: NewUserForm, name: 'role' | 'nuD' | 'nuM', value: string) {
    const n = {...prev, [name]: value};
    const lv = Component.LEVEL_OF_ROLE[n.role];
    if (name === 'role') {
      n.nuD = '';
      n.nuM = '';
      n.area = '';
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

  private areaSummary(f: NewUserForm) {
    if (!f.area) return '';
    const lv = Component.LEVEL_OF_ROLE[f.role];
    const d = this.state.geo.find((x) => String(x.id) === String(f.nuD));
    const m = d && d.mandals.find((x) => String(x.id) === String(f.nuM));
    const v = m && m.villages.find((x) => String(x.id) === String(f.area));
    return [lv === 'VILLAGE' && v ? v.name : null, lv !== 'DISTRICT' && m ? m.name : null, d ? d.name : null].filter(Boolean).join(' · ');
  }

  private areaOptions(role: string): AreaOption[] {
    const lv = Component.LEVEL_OF_ROLE[role];
    const g = this.state.geo;
    if (lv === 'DISTRICT') return g.filter((d) => d.active).map((d) => ({id: String(d.id), label: this.nl(d), level: lv}));
    if (lv === 'MANDAL') return g.flatMap((d) => d.mandals.filter((m) => m.active && d.active).map((m) => ({id: String(m.id), label: this.nl(m), level: lv})));
    return g.flatMap((d) => d.mandals.flatMap((m) => m.villages.filter((v) => v.active && m.active && d.active).map((v) => ({id: String(v.id), label: this.nl(v), level: 'VILLAGE' as const}))));
  }

  private toggleUser(u: AdminUser) {
    const R = Component.ROLE;
    this.ask({title: u.active ? 'Block user' : 'Unblock user', body: (u.active ? 'Block ' : 'Unblock ') + u.name + ' (' + R[u.role].label + ', ' + (u.area ? u.area.name : '—') + ')? ' + (u.active ? 'They will be signed out and cannot post or review.' : 'They regain access immediately.'), confirmLabel: u.active ? 'Block' : 'Unblock', bg: u.active ? '#b3261e' : '#1F8A3B',
      onConfirm: () => this.api.post<UserResponse>('/users/' + u.id + '/' + (u.active ? 'block' : 'unblock') + '/', {}).then((d) => {
        const nu = this.adaptUser(d && d.user ? d.user : d);
        this.setState((s) => ({users: s.users.map((x) => x.id === u.id ? nu : x), panelUser: s.panelUser && s.panelUser.id === u.id ? nu : s.panelUser}));
        this.toast(u.name + (u.active ? ' blocked' : ' unblocked'), u.active ? '#E9791E' : '#6cc04a');
      }).catch((e: unknown) => this.fail(e))});
  }

  private reassignUser(u: AdminUser) {
    const R = Component.ROLE;
    const opts = this.areaOptions(u.role);
    if (!u.raId) {
      this.toast('This user has no role to move.', '#E9791E');
      return;
    }
    const raId = u.raId;
    this.ask({title: 'Reassign area', body: 'Move ' + u.name + ' (' + R[u.role].label + ') to a different ' + (u.role === 'district' ? 'district' : u.role === 'mandal' ? 'mandal' : 'village') + '. Their pending reviews stay with the old area.', hasSelect: true, selectLabel: 'New area', options: opts, confirmLabel: 'Reassign', bg: '#0D3B7A', onConfirm: (_t, sel) => {
      const o = opts.find((x) => x.id === sel) || opts[0];
      if (!o) return;
      this.api.patch('/users/' + u.id + '/role-assignments/' + raId + '/', {area: {level: o.level, id: Number(o.id)}}).then(() => {
        this.toast(u.name + ' reassigned to ' + o.label.split(' · ')[0]);
        this.loadUsers(this.state.userPage);
        if (this.state.panel && this.state.panel.type === 'user') this.setState({panel: null});
      }).catch((e: unknown) => this.fail(e));
    }});
  }

  private refreshUser(id: string) {
    return this.api.get<User>('/users/' + id + '/').then((x) => {
      const u = this.adaptUser(x);
      this.setState((s) => ({panelUser: s.panel && s.panel.id === id ? u : s.panelUser}));
      this.loadUsers(this.state.userPage);
    }).catch((e: unknown) => this.fail(e));
  }

  private addRole(u: AdminUser) {
    const R = Component.ROLE;
    const roles = this.roleChoices();
    if (!roles.length) {
      this.toast('You cannot add roles.', '#E9791E');
      return;
    }
    this.ask({title: 'Add role', body: 'Give ' + u.name + ' another role. They choose which role to use after login.', hasSelect: true, selectLabel: 'Role', options: roles, confirmLabel: 'Next', bg: '#0D3B7A', onConfirm: (_t, role) => {
      const opts = this.areaOptions(role);
      if (!opts.length) {
        this.toast('Add areas in Geography first.', '#E9791E');
        return;
      }
      setTimeout(() => this.ask({title: 'Add role · ' + R[role].label, body: 'Choose the area for this role.', hasSelect: true, selectLabel: 'Area', options: opts, confirmLabel: 'Add role', bg: '#0D3B7A', onConfirm: (_t2, areaId) => {
        const o = opts.find((x) => x.id === areaId) || opts[0];
        this.api.post('/users/' + u.id + '/role-assignments/', {role: Component.RAPI[role], area: {level: o.level, id: Number(o.id)}}).then(() => {
          this.toast('Role added · ' + R[role].label + ' · ' + o.label);
          this.refreshUser(u.id);
        }).catch((e: unknown) => this.fail(e));
      }}), 0);
    }});
  }

  private removeRole(u: AdminUser, ra: RoleAssignment) {
    const R = Component.ROLE;
    const label = (R[Component.RK[ra.role]] || {label: ra.role}).label;
    this.ask({title: 'Remove role', body: 'Remove ' + label + ' · ' + (ra.area ? ra.area.name : '') + ' from ' + u.name + '?' + ((u.ras || []).length <= 1 ? ' This is their only role: they will not be able to log in.' : ''), confirmLabel: 'Remove', bg: '#b3261e', onConfirm: () => this.api.del('/users/' + u.id + '/role-assignments/' + ra.id + '/').then(() => {
      this.toast('Role removed', '#E9791E');
      this.refreshUser(u.id);
    }).catch((e: unknown) => this.fail(e))});
  }

  private resetPassword(u: AdminUser) {
    this.ask({title: 'Reset password', body: 'Give ' + u.name + ' a new temporary password. They are signed out everywhere and must choose their own password at their next login.', hasInput: true, inputLabel: 'Temporary password', inputPh: 'Leave empty to generate one', confirmLabel: 'Reset password', bg: '#0D3B7A', onConfirm: (t, _sel, gen) => {
      const pw = (t || '').trim();
      this.api.post<TemporaryPassword | null>('/users/' + u.id + '/reset-password/', pw ? {password: pw} : {}).then((d) => {
        const temp = (d && d.temporary_password) || (pw && pw === gen ? pw : '');
        if (temp) this.showSecret(u.name, temp);
        else this.toast('Password reset · ' + u.name);
        this.refreshUser(u.id);
      }).catch((e: unknown) => this.fail(e));
    }});
  }

  private unlockUser(u: AdminUser) {
    this.ask({title: 'Unlock login', body: u.name + ' is locked out after too many wrong passwords. Unlock now so they can try again?', confirmLabel: 'Unlock', bg: '#1F8A3B', onConfirm: () => this.api.post('/users/' + u.id + '/unlock/', {}).then(() => {
      this.toast(u.name + ' unlocked');
      this.refreshUser(u.id);
    }).catch((e: unknown) => this.fail(e))});
  }

  private nuValid(f: NewUserForm) {
    return !!(f.name.trim() && f.username.trim() && (!f.email.trim() || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) && (!f.mobile || f.mobile.length === 10));
  }

  private editUser(u: AdminUser) {
    this.setState({drawerOpen: true, nu: {id: u.id, name: u.name, te: u.nameTe, email: u.email, username: u.username, mobile: u.mobile, password: '', role: u.role, area: ''}});
  }

  private saveUserEdit(f: NewUserForm) {
    this.api.patch('/users/' + f.id + '/', {name: f.name.trim(), name_te: f.te.trim(), email: f.email.trim() || null, mobile: f.mobile || null}).then(() => {
      this.setState({drawerOpen: false, nu: {...EMPTY_NU}});
      this.toast('Details saved · ' + f.name.trim());
      if (f.id) this.refreshUser(f.id);
    }).catch((e: unknown) => this.fail(e));
  }

  private editProfile() {
    const me = this.state.me;
    const g = (me?.groups || []).map((x) => x.name || x.label || x.key || x).join(', ') || 'Super Admin';
    this.setState({menuOpen: false});
    this.ask({title: 'My profile', body: 'Signed in as ' + (me?.username || '') + ' · ' + g + '. You can change the name shown in the console and in the audit log.', hasInput: true, noGen: true, inputLabel: 'Name', inputPh: 'Your full name', preset: me?.name || '', confirmLabel: 'Save', bg: '#0D3B7A', onConfirm: (t) => {
      const name = (t || '').trim();
      if (!name || name === me?.name) return;
      this.api.patch<Partial<Me> | null>('/me/', {name}).then((d) => {
        this.setState((s) => ({me: s.me && {...s.me, ...(d || {}), name}}));
        this.toast('Profile saved');
      }).catch((e: unknown) => this.fail(e));
    }});
  }

  private saveNU() {
    const f = this.state.nu;
    if (!this.nuValid(f)) return;
    if (f.id) {
      this.saveUserEdit(f);
      return;
    }
    const opts = this.areaOptions(f.role);
    const o = opts.find((x) => x.id === String(f.area));
    if (!o) {
      this.toast(opts.length ? 'Choose the area.' : 'Add areas in Geography first.', '#E9791E');
      return;
    }
    const body: {username: string; name: string; name_te: string; role?: string; area: {level: AreaLevel; id: number}; email?: string; mobile?: string; password?: string} = {username: f.username.trim(), name: f.name.trim(), name_te: f.te.trim(), role: Component.RAPI[f.role], area: {level: o.level, id: Number(o.id)}};
    if (f.email.trim()) body.email = f.email.trim();
    if (f.mobile) body.mobile = f.mobile;
    const pw = f.password.trim();
    if (pw) body.password = pw;
    const gen = this.nuGen;
    this.api.post<TemporaryPassword | null>('/users/', body).then((d) => {
      this.nuGen = '';
      this.setState({drawerOpen: false, nu: {...EMPTY_NU}});
      const temp = (d && d.temporary_password) || (pw && pw === gen ? pw : '');
      if (temp) this.showSecret(body.name, temp);
      else this.toast('User created · ' + body.username);
      this.loadUsers(1);
    }).catch((e: unknown) => this.fail(e));
  }

  // ---- geography ----
  // "16.2345, 80.4567" or a Google Maps / OpenStreetMap link -> [lat, lng] (at most 6 decimals, as the server stores), else null.
  private static parseCoords(text: string): [string, string] | null {
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

  private onGeoWhere(text: string) {
    const c = Component.parseCoords(text);
    this.setState((st) => st.geoForm ? {geoForm: {...st.geoForm, where: text, ...(c ? {lat: c[0], lng: c[1]} : {})}} : null);
  }

  // Search text for Google Maps: village, mandal, district, state.
  private geoPlace(f: GeoForm) {
    const g = this.state.geo;
    const parts: (string | null | undefined)[] = [f.name.trim()];
    if (f.kind === 'village') {
      const d = g.find((x) => x.mandals.some((m) => m.id === f.parentId));
      parts.push(f.parentName || f.parent, d && d.name);
    } else if (f.kind === 'mandal') parts.push(f.parentName || f.parent);
    parts.push(this.state.stateRow ? this.state.stateRow.name_en : 'Andhra Pradesh');
    return parts.filter(Boolean).join(', ');
  }

  // Same checks as the app's area sheet; the server checks again.
  private geoSiblings(f: GeoForm): {id: number; name: string}[] {
    const g = this.state.geo;
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

  private geoErrs(f: GeoForm): GeoErrs {
    const nm = f.name.trim();
    const dupe = !!nm && this.geoSiblings(f).some((x) => x.id !== f.id && x.name.toLowerCase() === nm.toLowerCase());
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

  private geoSave() {
    const f = this.state.geoForm;
    if (!f) return;
    const er = this.geoErrs(f);
    if (er.name || er.pin || er.coords) {
      this.setState({geoForm: {...f, tried: true}});
      return;
    }
    const name = f.name.trim(), te = (f.te || '').trim();
    const base: {name_en: string; name_te: string; lgd_code: string | null; is_active?: boolean} = {name_en: name, name_te: te, lgd_code: (f.lgd || '').trim() || null};
    if (f.id && f.active !== f.wasActive) base.is_active = f.active;
    let req: Promise<unknown>;
    if (f.kind === 'district') req = f.id ? this.api.patch('/geo/districts/' + f.id + '/', base) : this.api.post('/geo/districts/', {...base, state_id: this.state.stateRow && this.state.stateRow.id});
    else if (f.kind === 'mandal') req = f.id ? this.api.patch('/geo/mandals/' + f.id + '/', base) : this.api.post('/geo/mandals/', {...base, district_id: f.parentId});
    else {
      const v: typeof base & {pin_code: string; latitude?: string; longitude?: string} = {...base, pin_code: f.pin || ''};
      if (String(f.lat).trim()) v.latitude = String(f.lat).trim();
      if (String(f.lng).trim()) v.longitude = String(f.lng).trim();
      req = f.id ? this.api.patch('/geo/villages/' + f.id + '/', v) : this.api.post('/geo/villages/', {...v, mandal_id: f.parentId});
    }
    req.then(() => {
      const ex = {...this.state.expanded};
      if (f.parentKey) ex[f.parentKey] = true;
      this.setState({geoForm: null, expanded: ex});
      this.toast((f.id ? 'Updated ' : 'Added ') + f.kind + ' · ' + name);
      this.loadGeo();
    }).catch((e: unknown) => this.fail(e));
  }

  private geoDeact(node: {id: number; name: string; active: boolean; kind: GeoKind}) {
    const next = !node.active;
    const path = {district: 'districts', mandal: 'mandals', village: 'villages'}[node.kind];
    this.ask({title: (next ? 'Reactivate ' : 'Deactivate ') + node.kind, body: (next ? 'Reactivate ' : 'Deactivate ') + node.name + '? ' + (next ? 'It becomes selectable again for users and posts.' : 'Existing posts stay visible; no new users or posts can be assigned here' + (node.kind !== 'village' ? ', including all areas under it.' : '.')), confirmLabel: next ? 'Reactivate' : 'Deactivate', bg: next ? '#1F8A3B' : '#b3261e',
      onConfirm: () => this.api.patch('/geo/' + path + '/' + node.id + '/', {is_active: next}).then(() => {
        this.toast(node.name + (next ? ' reactivated' : ' deactivated'), next ? '#6cc04a' : '#E9791E');
        this.loadGeo();
      }).catch((e: unknown) => this.fail(e))});
  }

  // Villages CSV import. Big files go up in parts of ~4,000 villages (each mandal kept in one part) so no request
  // reaches the server's 60 s limit; the importer is safe to repeat. Every part is checked first (dry run), the
  // totals are shown, and only then is anything saved. Helpers and rules: src/console/csv-parts.ts.
  private importCsv() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,text/csv';
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (file) this.importParts(file);
    };
    input.click();
  }

  private async importParts(file: File) {
    const info = (title: string, body: string) => this.ask({title, body, confirmLabel: 'Close', bg: '#3b4a5c', noCancel: true, onConfirm: () => {}});
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
      return this.api.upload<GeoImportResult>('/geo/villages/import/', fd, dry ? {dry_run: 1} : undefined);
    };
    const step = (phase: string, done: number) => this.setState({imp: {phase, done, total: n, name: file.name}});
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
          this.setState({imp: null});
          this.fail(e);
          return;
        }
      }
    }
    this.setState({imp: null});
    if (errors.length) {
      info('File has errors · nothing imported', errors.slice(0, 6).join(' · ') + (errors.length > 6 ? ' · and ' + (errors.length - 6) + ' more.' : '') + ' Fix them in the file and import it again.');
      return;
    }
    const body = plan.rows.toLocaleString('en-IN') + ' villages in ' + plan.districts + ' district' + (plan.districts === 1 ? '' : 's') + ' and ' + plan.mandals + ' mandal' + (plan.mandals === 1 ? '' : 's') + ' checked. Villages: ' + sum.created.toLocaleString('en-IN') + ' new, ' + sum.updated + ' updated, ' + sum.unchanged.toLocaleString('en-IN') + ' unchanged.' + (sum.noXY ? ' ' + sum.noXY + ' without coordinates.' : '') + (sum.warn ? ' ' + sum.warn + ' warning(s).' : '') + (n > 1 ? ' It is imported in ' + n + ' parts.' : '');
    this.ask({title: 'Import villages', body, confirmLabel: 'Import', bg: '#0D3B7A', onConfirm: async () => {
      // 2. import part by part
      let last: GeoImportResult | null = null;
      for (let i = 0; i < n; i++) {
        step('Importing', i);
        try {
          last = await send(plan.parts[i], false);
        } catch (e) {
          this.setState({imp: null});
          this.loadGeo();
          info('Import stopped at part ' + (i + 1) + ' of ' + n, (i ? 'Parts 1' + (i > 1 ? '–' + i : '') + ' are saved. ' : '') + 'Nothing in part ' + (i + 1) + ' was saved (' + ((e instanceof Error && e.message) || 'the server did not answer') + '). Importing the same file again is safe: villages already there stay as they are.');
          return;
        }
      }
      this.setState({imp: null});
      this.loadGeo();
      // Villages without coordinates in the whole database: "Use my location" can never find them.
      const noXY = (last && last.missing_coordinates_total) || 0;
      if (noXY) info('Imported ' + plan.rows.toLocaleString('en-IN') + ' villages', noXY.toLocaleString('en-IN') + ' village' + (noXY === 1 ? '' : 's') + ' in the database still ' + (noXY === 1 ? 'has' : 'have') + ' no latitude and longitude, so "Use my location" can never find ' + (noXY === 1 ? 'it' : 'them') + '. Citizens there must choose their village by hand. Fill in the coordinates and import the file again.');
      else this.toast('Imported ' + plan.rows.toLocaleString('en-IN') + ' villages');
    }});
  }

  // ---- exports ----
  private exportCsv() {
    const s = this.state;
    const stamp = new Date().toISOString().slice(0, 10);
    if (s.page === 'audit') this.api.download('/audit/export/', {q: s.auditQ}, 'grama-audit-' + stamp + '.csv').then(() => this.toast('Audit log exported')).catch((e: unknown) => this.fail(e));
    else this.exportReport('posts-by-area');
  }

  private exportReport(name: string) {
    const stamp = new Date().toISOString().slice(0, 10);
    this.api.download('/admin/reports/' + name + '/export/', {format: 'csv'}, 'grama-' + name + '-' + stamp + '.csv').then(() => this.toast('Report exported')).catch((e: unknown) => this.fail(e));
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
      return {label: titles[k].split(' ·')[0], d: C.ICON[k], color: on ? '#fff' : 'rgba(255,255,255,.78)', bg: on ? '#0D3B7A' : 'transparent', hasCount: k === 'posts' && pendingN > 0, count: pendingN, go: () => this.goPage(k)};
    });
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
      return {cat: p.cat, catLabel: p.catLabel, titleTe: p.titleTe, titleEn: p.titleEn, bodyTe: p.bodyTe, bodyEn: p.bodyEn, area: p.area, date: p.date, author: p.author, authorRole: czLine || rr.label, amobile: '', abg: rr.bg, ainitial: (p.author || '?')[0],
        st: {bg: st.bg, color: st.color, label: st.label}, hasPhoto: p.media.length > 0, photos: p.media.slice(0, 5).map((m) => ({src: m.thumb_url || m.url, pos: 'center'})), urgent: !!p.urgent,
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
      {label: 'Active admins', value: D ? D.kpis.active_admins : '…', sub: 'District · Mandal · Village', color: '#0D3B7A', go: () => { this.setState({page: 'users', uf: {...s.uf, status: 'active'}}, () => this.loadUsers(1)); }},
      {label: 'Blocked users', value: D ? D.kpis.blocked_users : '…', sub: 'Across all roles', color: '#b3261e', go: () => { this.setState({page: 'users', uf: {...s.uf, status: 'blocked'}}, () => this.loadUsers(1)); }},
    ];
    const ppd = D ? D.posts_per_day : [];
    const max = Math.max(1, ...ppd.map((c) => c.submitted));
    const chart = ppd.map((c) => ({h1: Math.round(c.submitted / max * 100) + '%', h2: Math.round(c.published / max * 100) + '%', day: dayLabel(c.date), tip: dayLabel(c.date) + ': ' + c.submitted + ' submitted, ' + c.published + ' published'}));
    const pendingByDistrict = (D ? D.pending_by_district : []).map((r) => ({name: r.district.name, te: r.name_te || '', count: r.pending, oldest: r.pending && r.oldest_pending_hours !== null ? Math.round(r.oldest_pending_hours) + ' h' : '—',
      go: () => { this.setState({page: 'posts', statusTab: 'Pending', pf: {...s.pf, district: String(r.district.id)}}, () => this.loadPosts(1)); }}));
    const auditRow = (a: AuditEntry) => {
      const rk = C.RK[a.actor?.role ?? ''] || (a.actor && a.actor.role === 'SYSTEM' ? 'system' : 'super');
      const name = (a.actor && a.actor.name) || 'System';
      return {time: this.fmt(a.at, false), user: name, role: R[rk].label, action: C.ACT[a.action] || this.humanAction(a.action), target: a.target_label || '', area: a.area ? a.area.name : 'State', bg: R[rk].bg, initial: name[0], rbg: R[rk].tbg, rcolor: R[rk].tc};
    };
    const recent = (D ? D.recent_activity : []).map(auditRow);
    // geography
    const tag: Readonly<Record<GeoKind, readonly [string, string]>> = {district: ['#e3f0fb', '#0D3B7A'], mandal: ['#dff3f5', '#07818e'], village: ['#e4f4df', '#1d7a33']};
    const treeRow = (node: GeoNode, kind: GeoKind, depth: number, parentId: number | null, parentName: string | null, parentKey: string | null, meta: string, key: string, open: boolean) => {
      const hasKids = kind !== 'village';
      const sel = s.geoForm && s.geoForm.id === node.id && s.geoForm.kind === kind;
      return {kind, name: node.name, te: node.te && node.te !== node.name ? node.te : '', indent: (8 + depth * 28) + 'px', rowBg: sel ? '#f0f6fd' : 'transparent', opacity: node.active ? 1 : .55, toggleVis: hasKids ? 'visible' : 'hidden', chev: open ? 'M6 9l6 6 6-6' : 'M9 6l6 6-6 6',
        tagBg: tag[kind][0], tagColor: tag[kind][1], inactive: !node.active, meta, canAdd: hasKids, childKind: kind === 'district' ? 'Mandal' : 'Village',
        toggle: () => this.setState((st) => ({expanded: {...st.expanded, [key]: !st.expanded[key]}})),
        select: () => this.setState({geoForm: {kind, id: node.id, parentId, parentName, parentKey, parent: parentName || (s.stateRow ? s.stateRow.name_en : 'Andhra Pradesh'), name: node.name, te: node.te || '', lgd: node.lgd || '', lat: node.lat || '', lng: node.lng || '', pin: node.pin || '', active: node.active, wasActive: node.active, isVillage: kind === 'village'}}),
        add: () => this.setState({geoForm: {kind: kind === 'district' ? 'mandal' : 'village', id: null, parentId: node.id, parentName: node.name, parentKey: key, parent: node.name, name: '', te: '', lgd: '', lat: '', lng: '', pin: '', active: true, isVillage: kind === 'mandal'}}),
        deact: () => this.geoDeact({...node, kind}), deactLabel: node.active ? 'Deactivate' : 'Reactivate', deactColor: node.active ? '#b3261e' : '#1d7a33'};
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
    s.geo.forEach((d) => walk(d, 'district', 0, null, null, null, d.mandals.length + ' mandals'));
    const gf = s.geoForm;
    const geoErr: Partial<GeoErrs> = gf && gf.tried ? this.geoErrs(gf) : {};
    const geoActive = gf && gf.id ? {on: gf.active, swBg: gf.active ? '#1F8A3B' : '#cfd8e3', swLeft: gf.active ? '21px' : '3px', bg: gf.active ? '#e4f4df' : '#f3f5f8',
      sub: gf.isVillage ? (gf.active ? 'Citizens can choose this village and see its posts.' : 'Hidden from citizens. Its users and posts are kept.') : (gf.active ? 'New users and posts can be added here.' : 'Hidden with every area below it. Existing posts stay visible.')} : null;
    const geoForm: Partial<GeoForm> = gf || {};
    const geoCoordsOk = !!gf && gf.isVillage && !this.geoErrs({...gf, id: gf.id || 1}).coords && !!String(gf.lat || '').trim();
    // users
    const uf = s.uf;
    const userRows = s.users.map((u) => ({name: u.name, te: u.te, mobile: u.mobile ? '+91 ' + u.mobile : (u.email || '—'), roleLabel: R[u.role].label, rbg: R[u.role].tbg, rcolor: R[u.role].tc, bg: R[u.role].bg, initial: u.name[0], area: this.an(u.area),
      statusLabel: u.active ? 'Active' : 'Blocked', scolor: u.active ? '#1d7a33' : '#b3261e', lastLogin: u.last, toggleLabel: u.active ? 'Block' : 'Unblock', tcolor: u.active ? '#b3261e' : '#1d7a33',
      canReassign: !!u.raId && this.userCan(u, 'reassign'), canToggle: this.userCan(u, u.active ? 'block' : 'unblock'), view: () => this.openUser(u), reassign: () => this.reassignUser(u), toggle: () => this.toggleUser(u)}));
    const districtOpts = s.geo.map((d) => ({id: String(d.id), label: d.name}));
    const pager = (page: number, pages: number, load: (p: number) => void) => ({show: pages > 1, page, pages, prev: () => { if (page > 1) load(page - 1); }, next: () => { if (page < pages) load(page + 1); }, prevOpacity: page > 1 ? 1 : .4, nextOpacity: page < pages ? 1 : .4});
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
    // reports
    const RP = s.reports;
    const byArea: {name: string; indent: string; weight: number; total: number; pub: number; pend: number; rej: number}[] = [];
    RP.byArea.forEach((d) => {
      byArea.push({name: d.district.name, indent: '0px', weight: 700, total: d.total, pub: d.published, pend: d.pending, rej: d.rejected});
      d.mandals.forEach((m) => byArea.push({name: m.mandal.name, indent: '20px', weight: 500, total: m.total, pub: m.published, pend: m.pending, rej: m.rejected}));
    });
    const SM = RP.summary;
    const repSummary = ([['Posts', 'total', '#0A2550'], ['Published', 'published', '#1F8A3B'], ['Pending', 'pending', '#b35a0e'], ['Rejected', 'rejected', '#6b7a8c']] as const).map(([label, k, color]) => ({label, value: SM ? SM[k] : '…', color, sub: 'Last ' + (SM ? SM.days : 30) + ' days' + (k === 'rejected' ? ' · discarded or taken down' : '')}));
    const LV: Readonly<Partial<Record<string, readonly [string, string]>>> = {VILLAGE: ['Village Admin', '#1F8A3B'], MANDAL: ['Mandal Admin', '#07818e'], DISTRICT: ['District Admin', '#E9791E']};
    const reviewTime = RP.reviewTime.flatMap((r) => {
      const lv = LV[r.level];
      if (!lv) return [];
      const hours = r.avg_hours || 0;
      return [{level: lv[0], hours, n: r.reviews, sla: r.escalation_hours, color: lv[1], w: Math.min(100, Math.round(hours / (r.escalation_hours || 24) * 100)) + '%'}];
    });
    const adminActivity = RP.activity.map((a) => ({name: a.user.name, role: (R[C.RK[a.user.role]] || R.village).label, area: a.area ? a.area.name : '—', reviewed: a.reviewed, pub: a.published, re: a.recheck, dis: a.discarded, avg: a.avg_review_hours == null ? '—' : a.avg_review_hours, last: this.fmtLast(a.last_active_at)}));
    // audit
    const auditRows = s.audit.map(auditRow);
    // important numbers
    const sw = (on: boolean) => ({swBg: on ? '#1F8A3B' : '#cfd8e3', swLeft: on ? '21px' : '3px'});
    const numTabList: {id: NumTab; label: string}[] = [{id: 'AREA', label: 'For villages'}, {id: 'HELPLINE', label: 'Government helplines'}, ...(this.can('contacts.manage_contact_types') ? [{id: 'TYPES' as const, label: 'Types'}] : [])];
    const numTabs = numTabList.map((t) => {
      const on = s.numTab === t.id;
      return {label: t.label, line: on ? '#0D3B7A' : 'transparent', color: on ? '#0A2550' : '#6b7a8c', go: () => this.setState({numTab: t.id, numType: '', nf: null}, () => { if (t.id === 'TYPES') this.loadTypes(); else this.loadNumbers(1); })};
    });
    const numIds = s.nums.filter((c) => (c.allowed_actions || []).includes('remove')).map((c) => c.id);
    const numRows = s.nums.map((c) => {
      const al = c.allowed_actions || [];
      const rc = c.needs_recheck;
      return {canSel: al.includes('remove'), sel: s.numSel.includes(c.id), toggleSel: () => this.toggleSel('numSel', c.id), type: c.custom_type || c.type.name, name: c.name, te: c.name_te && c.name_te !== c.name ? c.name_te : '',
        phone: c.phone_kind === 'MOBILE' ? '+91 ' + c.phone.slice(0, 5) + ' ' + c.phone.slice(5) : c.phone, email: c.email || '', area: c.area ? (c.area.path || c.area.name) : '—', status: rc ? 'Needs check' : 'Verified ' + this.fmt(c.verified_at, true).slice(0, 11),
        sbg: rc ? '#fff0dc' : '#e4f4df', scolor: rc ? '#b35a0e' : '#1d7a33', canEdit: al.includes('edit'), canVerify: al.includes('verify'), canRemove: al.includes('remove'), edit: () => this.openNumber(c), verify: () => this.verifyNumber(c), remove: () => this.removeNumber(c)};
    });
    // "Other" is not a type: not listed
    const typeRows = s.ctypesAdmin.filter((t) => !t.is_other).map((t) => ({key: t.key, section: t.section === 'HELPLINE' ? 'Government helplines' : 'For villages', en: t.name_en, te: t.name_te, count: String(t.contact_count), ...sw(t.is_active), toggle: () => this.toggleType(t), edit: () => this.editType(t), del: () => this.deleteType(t)}));
    const nv = this.nfView();
    // settings
    const catRows = s.categories.map((c) => ({te: c.name_te, en: c.name_en, icon: C.CAT_ICONS.find((k) => k === c.key) ?? 'updates', count: c.post_count || 0, swBg: c.is_active ? '#1F8A3B' : '#cfd8e3', swLeft: c.is_active ? '21px' : '3px',
      toggle: () => this.api.patch('/admin/categories/' + c.id + '/', {is_active: !c.is_active}).then(() => {
        this.toast(c.name_en + (c.is_active ? ' disabled' : ' enabled'), c.is_active ? '#E9791E' : '#6cc04a');
        this.loadCategories();
      }).catch((e: unknown) => this.fail(e))}));
    const langRows = ([{id: 'te', name: 'తెలుగు · Telugu', sub: 'Default app language'}, {id: 'en', name: 'English', sub: 'Secondary · header toggle'}] as const).map((l) => {
      const on = s.settings.langs[l.id];
      return {...l, swBg: on ? '#1F8A3B' : '#cfd8e3', swLeft: on ? '21px' : '3px', toggle: () => {
        if (l.id === 'te') {
          this.toast('Telugu is the default language and cannot be disabled', '#E9791E');
          return;
        }
        this.api.patch('/admin/settings/', {languages: {en: !on}}).then(() => {
          this.setState((st) => ({settings: {...st.settings, langs: {...st.settings.langs, en: !on}}}));
          this.toast('English ' + (on ? 'disabled' : 'enabled'));
        }).catch((e: unknown) => this.fail(e));
      }};
    });
    const CH: Readonly<Record<string, string>> = {push: 'Push'};
    const templates = s.settings.templates.map((tp) => ({name: tp.name || tp.key, channel: CH[tp.channel] || tp.channel, te: tp.text_te, en: tp.text_en, edit: () => {
      if (tp.editable === false) {
        this.toast('This template cannot be edited', '#E9791E');
        return;
      }
      this.ask({title: 'Edit template · ' + (tp.name || tp.key), body: 'Placeholders: ' + (tp.variables || []).map((v) => '{' + v + '}').join(' ') + '. Telugu and English are sent according to each user’s language.', needsText: true, textLabel: 'English template', confirmLabel: 'Save template', bg: '#0D3B7A', preset: tp.text_en,
        onConfirm: (t) => this.api.patch('/admin/notification-templates/' + tp.key + '/', {text_te: tp.text_te, text_en: t}).then(() => {
          this.toast('Template saved · ' + (tp.name || tp.key));
          this.loadSettings();
        }).catch((e: unknown) => this.fail(e))});
    }}));
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
        return {label: R[k].label, rbg: R[k].tbg, rcolor: R[k].tc, area: ra.area ? (ra.area.path || ra.area.name) : '—', canRemove: this.userCan(pu, 'remove_assignment'), remove: () => this.removeRole(pu, ra)};
      }),
      canEdit: this.userCan(pu, 'edit'), edit: () => this.editUser(pu), canAddRole: this.userCan(pu, 'add_assignment') && this.roleChoices().length > 0, canReassign: !!pu.raId && this.userCan(pu, 'reassign'), canReset: this.userCan(pu, 'reset_password'), canUnlock: pu.locked && this.userCan(pu, 'unlock'), canToggle: this.userCan(pu, pu.active ? 'block' : 'unblock'),
      addRole: () => this.addRole(pu), reassign: () => this.reassignUser(pu), reset: () => this.resetPassword(pu), unlock: () => this.unlockUser(pu), toggle: () => this.toggleUser(pu), toggleLabel: pu.active ? 'Block user' : 'Unblock user', tbg: pu.active ? '#b3261e' : '#1F8A3B'} : {fields: [], posts: [], roles: []};
    // modal
    const m = s.modal;
    const cannot = !!(m && m.needsText && !s.modalText.trim());
    const modal = m ? {show: true, title: m.title, body: m.body, hasInput: !!m.hasInput, hasGen: !!m.hasInput && !m.noGen, inputLabel: m.inputLabel || '', inputPh: m.inputPh || '', hasSecret: !!m.secret, secret: m.secret || '', hasCancel: !m.noCancel, needsText: !!m.needsText, textLabel: m.textLabel || '',
      hasSelect: !!m.hasSelect, selectLabel: m.selectLabel || '', options: m.options || [], confirmLabel: m.confirmLabel, bg: m.bg || '#0D3B7A', cannot, opacity: cannot ? .5 : 1} : {show: false, options: [], hasCancel: true};
    const nu = s.nu;
    const canNU = this.nuValid(nu);
    const nuRoles = this.roleChoices();
    const nuSteps = this.areaSteps(nu);
    const nuPlace = this.areaSummary(nu);
    const me = s.me || {name: '', username: '', email: ''};
    // ads
    const af = s.af;
    // services
    const sf = s.sf;
    // service request panel
    const rq = s.rq;
    const tf: Partial<TypeForm> = s.tf || {};
    const tfErr: Partial<{en: string; te: string}> = s.tf && s.tf.tried ? this.tfErrs(s.tf) : {};
    return {screen: s.screen, is, pg, pageTitle: titles[s.page], navItems, menuOpen: s.menuOpen, toggleMenu: () => this.setState((st) => ({menuOpen: !st.menuOpen})), menuProfile: () => this.editProfile(), goSettingsM: () => this.goPage('settings'), canSettings: this.navOk('settings'), menuChangePassword: () => this.openChangePassword(), goAudit: () => this.goPage('audit'),
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
      kpis, chart, chartEmpty: !ppd.some((c) => c.submitted || c.published), pendingByDistrict, recent, noDistricts: !s.geo.length,
      tree, addDistrict: () => this.setState({geoForm: {kind: 'district', id: null, parentId: null, parentName: null, parent: s.stateRow ? s.stateRow.name_en : 'Andhra Pradesh', name: '', te: '', lgd: '', lat: '', lng: '', pin: '', isVillage: false}}), importCsv: () => this.importCsv(),
      geoForm, geoFormShow: !!gf, geoFormEmpty: !gf, geoFormTitle: gf ? ((gf.id ? 'Edit ' : 'Add ') + gf.kind) : 'Details', geoSaveLabel: gf && gf.id ? 'Save changes' : 'Add', geoNamePh: gf ? {district: 'e.g. Bapatla', mandal: 'e.g. Ponnur', village: 'e.g. Kothapalem'}[gf.kind] : '',
      cannotSaveGeo: false, saveGeoOpacity: 1, geoErr, geoCoordsRequired: !!(gf && gf.isVillage && !gf.id), onGeoWhere: (e: FieldChange) => this.onGeoWhere(e.target.value),
      geoWhereNote: gf && gf.where ? (Component.parseCoords(gf.where) ? 'Latitude and longitude filled from what you pasted.' : /goo\.gl|maps\.app/.test(gf.where) ? 'Short links cannot be read here. Open the link, then copy the numbers shown (e.g. 16.2345, 80.4567).' : 'Paste numbers like 16.2345, 80.4567 or a full map link.') : '',
      geoWhereOk: !!(gf && gf.where && Component.parseCoords(gf.where)), geoManual: !!(gf && gf.manual), toggleGeoManual: () => this.setState((st) => st.geoForm ? {geoForm: {...st.geoForm, manual: !st.geoForm.manual}} : null),
      geoFindUrl: gf && gf.name.trim() ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(this.geoPlace(gf)) : '', geoHasCoords: geoCoordsOk, geoCoordsText: gf ? String(gf.lat || '').trim() + ', ' + String(gf.lng || '').trim() : '',
      geoViewUrl: gf && geoCoordsOk ? 'https://www.google.com/maps/search/?api=1&query=' + String(gf.lat).trim() + ',' + String(gf.lng).trim() : '',
      geoActive, toggleGeoActive: () => this.setState((st) => st.geoForm ? {geoForm: {...st.geoForm, active: !st.geoForm.active}} : null),
      onGeoField: (e: FieldChange) => {
        const {name, value} = e.target;
        if (name === 'name') this.suggestTe('geoForm', value);
        this.setState((st) => st.geoForm ? {geoForm: {...st.geoForm, [name]: value}} : null);
      },
      saveGeo: () => this.geoSave(), cancelGeo: () => this.setState({geoForm: null}),
      uf,
      onUF: (e: FieldChange) => {
        const {name, value} = e.target;
        this.setState((st) => ({uf: {...st.uf, [name]: value}}), () => {
          clearTimeout(this.userTimer);
          this.userTimer = setTimeout(() => this.loadUsers(1), name === 'q' ? 300 : 0);
        });
      },
      userRows, userCount: s.userCount, userEmpty: !userRows.length, userEmptyText: s.usersLoading ? 'Loading…' : 'No users match these filters.', usersPager: pager(s.userPage, s.userPages, (p) => this.loadUsers(p)), districtOpts,
      nuEdit: !!nu.id, nuTitle: nu.id ? 'Edit user' : 'Add User', nuSaveLabel: nu.id ? 'Save changes' : 'Create user',
      openAddUser: () => this.setState((st) => ({drawerOpen: true, nu: {...(st.nu.id ? {id: null, name: '', te: '', email: '', username: '', mobile: '', password: '', area: '', nuD: '', nuM: ''} : st.nu), role: nuRoles.some((r) => r.id === st.nu.role) ? st.nu.role : (nuRoles[0] ? nuRoles[0].id : st.nu.role)}})),
      canAddUser: nuRoles.length > 0, nuRoles,
      genNU: (e?: React.MouseEvent) => {
        e?.preventDefault();
        const p = this.newPassword();
        this.nuGen = p;
        this.setState((st) => ({nu: {...st.nu, password: p}}));
      },
      closeDrawer: () => this.setState({drawerOpen: false}), drawerOpen: s.drawerOpen, nu,
      onNU: (e: FieldChange) => {
        const {name, value} = e.target;
        if (name === 'name') this.suggestTe('nu', value);
        this.setState((st) => {
          const n = {...st.nu, [name]: name === 'mobile' ? value.replace(/\D/g, '').slice(0, 10) : value};
          if (name === 'role' || name === 'nuD' || name === 'nuM') return {nu: this.areaPick(st.nu, name, value)};
          return {nu: n};
        });
      },
      cannotSaveNU: !(canNU && (nu.id || nu.area)), saveNUOpacity: canNU && (nu.id || nu.area) ? 1 : .5, nuSteps, nuPlace, nuRoleLabel: (Component.ROLE[nu.role] || {label: ''}).label, saveNU: () => this.saveNU(),
      statusTabs, pf,
      onPF: (e: FieldChange) => {
        const {name, value} = e.target;
        this.setState((st) => ({pf: {...st.pf, [name]: value}}), () => this.loadPosts(1));
      },
      postRows, postCount: s.postCount, postEmpty: !postRows.length, postEmptyText: s.postsLoading ? 'Loading…' : 'No posts match these filters.', postsPager: pager(s.postPage, s.postPages, (p) => this.loadPosts(p)), catOpts,
      repSummary, byArea, reviewTime, adminActivity, exportCsv: () => this.exportCsv(), exportByArea: () => this.exportReport('posts-by-area'), exportReviewTime: () => this.exportReport('review-time'), exportActivity: () => this.exportReport('admin-activity'),
      auditQ: s.auditQ,
      onAuditQ: (e: FieldChange) => {
        this.setState({auditQ: e.target.value});
        clearTimeout(this.auditTimer);
        this.auditTimer = setTimeout(() => this.loadAudit(1), 300);
      },
      auditRows, auditCount: s.auditCount, auditEmpty: !auditRows.length, auditEmptyText: s.auditLoading ? 'Loading…' : 'No entries match.', auditPager: pager(s.auditPage, s.auditPages, (p) => this.loadAudit(p)), canExportAudit: this.can('audit.export_audit_log'),
      contactQ: s.contactQ,
      onContactQ: (e: FieldChange) => {
        this.setState({contactQ: e.target.value});
        clearTimeout(this.contactTimer);
        this.contactTimer = setTimeout(() => this.loadContacts(1), 300);
      },
      contactFilter: s.contactFilter, contactFilters: [{id: 'new', label: 'New'}, {id: 'handled', label: 'Handled'}, {id: 'all', label: 'All'}], onContactFilter: (e: FieldChange) => this.setState({contactFilter: e.target.value}, () => this.loadContacts(1)),
      contactRows: s.contacts.map((c) => {
        const done = this.isHandled(c);
        return {time: this.fmt(c.created_at, false), name: c.name, mobile: c.mobile ? '+91 ' + c.mobile : '—', village: c.village_text || '—', message: c.message, status: done ? 'Handled' : 'New', sbg: done ? '#e4f4df' : '#fff0dc', scolor: done ? '#1d7a33' : '#b35a0e', toggleLabel: done ? 'Mark new' : 'Mark handled', toggle: () => this.toggleContact(c)};
      }),
      contactCount: s.contactCount + (s.contactCount === 1 ? ' message' : ' messages'), contactEmpty: !s.contacts.length, contactEmptyText: s.contactLoading ? 'Loading…' : 'No messages match.', contactPager: pager(s.contactPage, s.contactPages, (p) => this.loadContacts(p)),
      reqTabs: [...Object.keys(Component.SVC_STATUS), 'ALL'].map((k) => {
        const on = s.reqFilter === k;
        const c = s.reqCounts || {};
        const n = k === 'ALL' ? Object.values(c).reduce((a, b) => a + (b || 0), 0) : (c[k] || 0);
        return {label: k === 'ALL' ? 'All' : Component.SVC_STATUS[k].label, count: n, line: on ? '#0D3B7A' : 'transparent', color: on ? '#0A2550' : '#6b7a8c', cbg: on ? '#0D3B7A' : '#eef2f6', ccolor: on ? '#fff' : '#3b4a5c', go: () => this.setState({reqFilter: k}, () => this.loadRequests(1))};
      }),
      reqQ: s.reqQ,
      onReqQ: (e: FieldChange) => {
        this.setState({reqQ: e.target.value});
        clearTimeout(this.reqTimer);
        this.reqTimer = setTimeout(() => this.loadRequests(1), 300);
      },
      reqRows: s.reqs.map((r) => {
        const st = Component.SVC_STATUS[r.status] || Component.SVC_STATUS.NEW;
        return {address: r.address || '', time: this.fmt(r.created_at, false), service: r.service_name || Component.SERVICES[r.service] || r.service, ref: String(r.id).slice(-6).toUpperCase(), name: r.name, mobile: '+91 ' + r.phone,
          place: [r.village && r.village.name, r.mandal && r.mandal.name].filter(Boolean).join(', ') || '—', status: st.label, sbg: st.bg, scolor: st.color, assignee: r.assigned_to ? r.assigned_to.name : '—', open: () => this.openRequest(r)};
      }),
      reqCountLabel: s.reqCount + (s.reqCount === 1 ? ' request' : ' requests'), reqEmpty: !s.reqs.length, reqEmptyText: s.reqLoading ? 'Loading…' : s.reqUnavailable ? 'Service requests will show here once the server is updated.' : 'No requests here. Citizens send them from Services in the app.', reqPager: pager(s.reqPage, s.reqPages, (p) => this.loadRequests(p)),
      newAd: () => this.openAd(null), adsCountLabel: s.ads.filter((a) => this.adStatus(a) === 'live').length + ' running · ' + s.ads.length + ' in all', adsEmpty: !s.ads.length, adsUnavailable: s.adsUnavailable,
      adsEmptyText: s.adsLoading ? 'Loading…' : s.adsUnavailable ? 'Ads will show here once the server is updated.' : 'No ads yet. Create one and it shows at the top of Home in the villages you choose.',
      adSel: this.selView('adSel', s.ads.map((a) => a.id), (n) => ({title: 'Delete ' + n + ' ad' + (n === 1 ? '' : 's') + '?', body: 'They are removed from every Home page, with their pictures. This cannot be undone.', confirm: 'Delete ' + n, url: (id) => '/admin/ads/' + id + '/', done: () => this.loadAds()})),
      adRows: s.ads.map((a) => {
        const k = this.adStatus(a);
        const S = C.AD_STATUS[k];
        const ar = a.area;
        return {sel: s.adSel.includes(a.id), toggleSel: () => this.toggleSel('adSel', a.id), title: a.title, image: a.image, area: !ar || ar.level === 'STATE' ? 'All villages' : ar.name + ' ' + ar.level.toLowerCase(),
          dates: [a.starts_on ? 'From ' + this.dayLabel(a.starts_on) : '', a.ends_on ? 'till ' + this.dayLabel(a.ends_on) : 'no end date'].filter(Boolean).join(' '), status: S.label, sbg: S.bg, scolor: S.color, dim: k === 'live' ? 1 : .55, canToggle: k !== 'ended', on: !!a.is_active, toggle: () => this.toggleAd(a), open: () => this.openAd(a)};
      }),
      afShow: !!af, closeAF: () => this.setState({af: null}), pickAdImage: () => this.pickAdImage(), saveAF: () => this.saveAd(),
      onAF: (e: FieldChange) => {
        const t = e.target;
        const name = t.name;
        const value = t instanceof HTMLInputElement && t.type === 'checkbox' ? t.checked : t.value;
        this.setState((x) => {
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
        const err = f.tried ? this.adErrors(f) : {};
        const d = s.geo.find((x) => String(x.id) === f.d);
        const m = d && d.mandals.find((x) => String(x.id) === f.m);
        const v = m && m.villages.find((x) => String(x.id) === f.v);
        return {...f, title_: f.id ? 'Edit ad' : 'New ad', saveLabel: f.saving ? 'Saving…' : f.id ? 'Save' : 'Publish ad', isEdit: !!f.id,
          del: () => {
            const ad = s.ads.find((a) => a.id === f.id);
            if (ad) this.deleteAd(ad);
          },
          errTitle: err.title || '', errImage: err.image || '', errLink: err.link || '', errEnd: err.end || '',
          toggleActive: () => this.setState((x) => x.af ? {af: {...x.af, active: !x.af.active}} : null),
          showM: !!d, showV: !!m, allM: d ? 'All mandals in ' + d.name : '', allV: m ? 'All villages in ' + m.name : '',
          where: v && m ? v.name + ' village only, ' + m.name + ' mandal' : m && d ? 'all villages of ' + m.name + ' mandal, ' + d.name : d ? 'all villages of ' + d.name + ' district' : 'every village',
          dOpts: s.geo.filter((x) => x.active).map((x) => ({id: String(x.id), label: x.name})), mOpts: d ? d.mandals.filter((x) => x.active).map((x) => ({id: String(x.id), label: x.name})) : [], vOpts: m ? m.villages.filter((x) => x.active).map((x) => ({id: String(x.id), label: x.name})) : []};
      })() : null,
      // Services page
      ...(() => {
        const b = s.page === 'bills', c = this.cat(b), L = s[c.l];
        return {
          catShow: b || (s.svcView === 'catalog' && this.navOk('services')),
          catSub: b ? "What citizens see under Bills & Recharges on the app's Home. Only the Super Admin adds or changes them." : "The services citizens can choose from on the app's Home. Only the Super Admin adds or changes them.",
          catNew: b ? 'New bill / recharge' : 'New service',
          catUnavailText: b ? "The bills list is not on the server yet. Until it is, citizens see the built-in bills below, and changes can't be saved." : "The services list is not on the server yet. Until it is, citizens see the built-in list below, and changes can't be saved.",
          catHelp: b ? 'Use the arrows to set the order on Home. A hidden bill is not on Home.' : 'Use the arrows to set the order on Home. A hidden service is not on Home; requests already sent stay as they are.',
          svcRows: L.map((g, i) => {
            const [col, tint] = C.SVC_COLORS[g.color] || C.SVC_COLORS.blue;
            const icon = g.logo ? 'img:' + g.logo : (c.icons[g.icon] || c.icons[c.icon]);
            const on = g.is_active !== false;
            return {name: g.name_en, sub: on ? (g.name_te && g.name_te !== g.name_en ? g.name_te : 'Shown on Home') : 'Hidden', on, c: col, tint, img: icon.startsWith('img:') ? icon.slice(4) : '', d: icon.startsWith('img:') ? '' : icon,
              up: () => this.moveService(g, -1, b), down: () => this.moveService(g, 1, b), canUp: i > 0 && !s[c.un], canDown: i < L.length - 1 && !s[c.un], toggle: () => this.toggleService(g, b), open: () => this.openService(g, b), locked: s[c.un]};
          }),
          svcsUnavailable: s[c.un], svcsEmpty: !L.length, svcsEmptyText: s[c.ld] ? 'Loading…' : b ? 'No bills yet. Add one and citizens see it under Bills & Recharges.' : 'No services yet. Add one and citizens can request it from Home.',
          svcShownLabel: 'On Home: ' + L.filter((g) => g.is_active !== false).length, newService: () => this.openService(null, b),
        };
      })(),
      sfShow: !!sf, closeSF: () => this.setState({sf: null}), saveSF: () => this.saveService(),
      sf: orEmpty(sf ? (() => {
        const f = sf, set = this.cat(f.bill), [c, tint] = C.SVC_COLORS[f.color] || C.SVC_COLORS.blue, icon = f.image ? 'img:' + f.image : (set.icons[f.icon] || set.icons[set.icon]);
        return {...f, err: f.tried ? this.svcErr(f) : '', c, tint, img: icon.startsWith('img:') ? icon.slice(4) : '', d: icon.startsWith('img:') ? '' : icon, preview: f.en.trim() || (f.bill ? 'e.g. Gas Booking' : 'e.g. Ration Card'),
          title: f.bill ? (f.key ? 'Edit bill / recharge' : 'New bill / recharge') : (f.key ? 'Edit service' : 'New service'), saveLabel: f.saving ? 'Saving…' : (f.key ? 'Save' : f.bill ? 'Add bill / recharge' : 'Add service'),
          onField: (e: FieldChange) => {
            const {name, value} = e.target;
            if (name === 'en') this.suggestTe('sf', value);
            this.setState((st) => st.sf ? {sf: {...st.sf, [name]: value}} : null);
          },
          toggle: () => this.setState((st) => st.sf ? {sf: {...st.sf, active: !st.sf.active}} : null),
          icons: Object.entries(set.icons).map(([k, v]) => ({k, on: !f.image && f.icon === k, img: v.startsWith('img:') ? v.slice(4) : '', d: v.startsWith('img:') ? '' : v, pick: () => this.setState((st) => st.sf ? {sf: {...st.sf, icon: k, image: '', file: null}} : null)})),
          ownIcon: f.image, pickIcon: () => this.pickServiceIcon(), removeIcon: () => this.setState((st) => st.sf ? {sf: {...st.sf, image: '', file: null}} : null),
          colors: Object.entries(C.SVC_COLORS).map(([k, [cc, tt, label]]) => ({label, c: cc, tint: tt, on: f.color === k, pick: () => this.setState((st) => st.sf ? {sf: {...st.sf, color: k}} : null)}))};
      })() : null),
      svcView: s.svcView, canCatalog: this.navOk('services'),
      svcTabs: ([['requests', 'Citizen requests'], ['catalog', 'Services list']] as const).map(([k, label]) => ({label, on: s.svcView === k, go: () => this.setState({svcView: k}), bg: s.svcView === k ? '#fff' : 'transparent', color: s.svcView === k ? '#0A2550' : '#6b7a8c', shadow: s.svcView === k ? '0 1px 3px rgba(10,37,80,.12)' : 'none'})),
      imp: s.imp ? {...s.imp, pct: Math.round(s.imp.done * 100 / s.imp.total), label: s.imp.phase + (s.imp.total > 1 ? ' part ' + Math.min(s.imp.done + 1, s.imp.total) + ' of ' + s.imp.total : '') + '…'} : null,
      rqShow: !!rq, closeRQ: () => this.setState({rq: null}),
      rq: orEmpty(rq ? (() => {
        const r = rq.r, st = Component.SVC_STATUS[r.status] || Component.SVC_STATUS.NEW, al = r.allowed_actions || [];
        return {service: r.service_name || Component.SERVICES[r.service] || r.service, ref: String(r.id).slice(-6).toUpperCase(), time: this.fmt(r.created_at, true), statusLabel: st.label, sbg: st.bg, scolor: st.color, name: r.name, mobile: '+91 ' + r.phone, tel: 'tel:+91' + r.phone, email: r.email || '', mailto: 'mailto:' + (r.email || ''),
          place: [r.village && r.village.name, r.mandal && r.mandal.name, r.district && r.district.name].filter(Boolean).join(', '), details: r.details || '', address: r.address || '', canAssign: al.includes('assign'), assigned: r.assigned_to ? String(r.assigned_to.id) : ''};
      })() : null),
      rqView: orEmpty(rq ? (() => {
        const r = rq.r, steps = ['NEW', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'], rej = r.status === 'REJECTED', at = rej ? 1 : steps.indexOf(r.status);
        const allowed = this.svcAllowed(r), cur = C.SVC_STATUS[r.status] || C.SVC_STATUS.NEW;
        // Every step reached (the current one too) is a filled green tick; Rejected: a red cross after New.
        const tone = (i: number) => rej && i === 1 ? '#b3261e' : i <= at ? '#1F8A3B' : '#cfd8e3';
        return {steps: steps.map((k, i) => {
            const red = rej && i === 1, on = i <= at;
            return {label: red ? 'Rejected' : C.SVC_STATUS[k].label, bg: on ? tone(i) : '#fff', border: tone(i), bw: 2, mark: on ? (red ? '✕' : '✓') : '', weight: i === at ? 800 : 600, color: red ? '#b3261e' : i === at ? '#0A2550' : '#6b7a8c', line: i === 0 ? '' : (on ? tone(i) : '#cfd8e3')};
          }),
          curLabel: cur.label, curBg: cur.bg, curColor: cur.color, note: r.note || '',
          viewOnly: !allowed.length ? ((r.allowed_actions || []).includes('assign') ? 'Nobody handles this request yet. Assign it to someone below.' : 'View only. ' + (r.assigned_to ? r.assigned_to.name : 'Nobody') + ' handles this request; only they can change it.') : '',
          moves: allowed.filter((k) => k !== r.status).map((k) => ({label: C.SVC_STATUS[k].label, go: () => this.moveRequest(r, k), color: k === 'REJECTED' ? '#b3261e' : '#0D3B7A'})),
          assignedName: r.assigned_to ? r.assigned_to.name : 'Not assigned', onAssign: (e: FieldChange) => this.assignRequest(r, e.target.value)};
      })() : null),
      rqAssigneeOpts: rq ? [{id: '', label: 'Not assigned'}, ...(rq.r.assigned_to && !s.rqAssignees.some((a) => rq.r.assigned_to && a.id === String(rq.r.assigned_to.id)) ? [{id: String(rq.r.assigned_to.id), label: rq.r.assigned_to.name}] : []), ...s.rqAssignees] : [],
      rqHistory: rq ? [...(rq.r.history || []).slice().reverse().map((h) => ({dot: (Component.SVC_STATUS[h.status ?? ''] || {dot: '#9aa6b4'}).dot, what: [h.status ? (Component.SVC_STATUS[h.status] || {label: h.status}).label : '', h.assigned_to !== undefined ? ('Assigned to ' + (h.assigned_to ? h.assigned_to.name : 'nobody')) : ''].filter(Boolean).join(' · '), note: h.note || '', meta: this.fmt(h.at, true) + (h.by ? ' · by ' + h.by.name : '')})), {dot: '#9aa6b4', what: 'Request received', note: '', meta: this.fmt(rq.r.created_at, true) + ' · from ' + rq.r.name}] : [],
      numSel: this.selView('numSel', numIds, (n) => ({title: 'Remove ' + n + ' number' + (n === 1 ? '' : 's') + '?', body: 'Citizens stop seeing them at once. The audit log keeps a record.', confirm: 'Remove ' + n, url: (id) => '/admin/contacts/' + id + '/', done: () => this.loadNumbers(this.state.numPage)})),
      numTabs, numRows, isTypesTab: s.numTab === 'TYPES', typeRows, numQ: s.numQ,
      onNumQ: (e: FieldChange) => {
        this.setState({numQ: e.target.value});
        clearTimeout(this.numTimer);
        this.numTimer = setTimeout(() => this.loadNumbers(1), 300);
      },
      numType: s.numType, numTypeOpts: [{id: '', label: 'All types'}, ...s.ctypes.filter((x) => x.section === s.numTab).map((x) => ({id: x.key, label: x.name}))], onNumType: (e: FieldChange) => this.setState({numType: e.target.value}, () => this.loadNumbers(1)),
      numCount: s.numCount + (s.numCount === 1 ? ' number' : ' numbers'), numEmpty: !numRows.length, numEmptyText: s.numLoading ? 'Loading…' : (s.numQ || s.numType ? 'No numbers match.' : 'No numbers yet. Add one, or import a CSV file.'), numPager: pager(s.numPage, s.numPages, (p) => this.loadNumbers(p)), addNumber: () => this.openNumber(null), importNumbers: () => this.importNumbers(), addType: () => this.addType(),
      tfShow: !!s.tf, tf, tfErr, tfSaveLabel: s.tf && s.tf.saving ? (s.tf.id ? 'Saving…' : 'Adding…') : (s.tf && s.tf.id ? 'Save' : 'Add type'), tfTitle: s.tf && s.tf.id ? 'Edit contact type' : 'Add contact type', tfEditing: !!(s.tf && s.tf.id), tfSectionLabel: s.tf && s.tf.section === 'HELPLINE' ? 'Government helplines' : 'For villages', closeTF: () => this.setState({tf: null}), saveTF: () => this.saveType(),
      onTF: (e: FieldChange) => {
        const {name, value} = e.target;
        if (name === 'en') this.suggestTe('tf', value);
        this.setState((st) => st.tf ? {tf: {...st.tf, [name]: value}} : null);
      },
      tfSections: [{id: 'AREA', label: 'For villages', sub: 'Numbers for a district, mandal or village, such as a VRO or Mee Seva centre.'}, {id: 'HELPLINE', label: 'Government helplines', sub: 'Statewide numbers every citizen sees, such as 108 or 1912.'}].map((o) => ({...o, on: s.tf && s.tf.section === o.id, pick: () => this.setState((st) => st.tf ? {tf: {...st.tf, section: o.id}} : null)})),
      nfShow: !!nv, nf: orEmpty(nv ? {...nv.f, type: nv.type ? nv.type.key : '', area: nv.area ? nv.area.id : ''} : null), nfTitle: nv ? (nv.f.id ? 'Edit number' : nv.f.section === 'HELPLINE' ? 'Add helpline' : 'Add number') : '', nfSaveLabel: nv && nv.f.id ? 'Save changes' : 'Add number',
      nfTypes: nv ? [...nv.types.map((x) => ({id: x.key, label: x.name})), ...(this.can('contacts.manage_contact_types') ? [{id: '__new', label: '+ Add a new type…'}] : [])] : [], nfIsOther: !!(nv && nv.type && nv.type.is_other), nfIsArea: !!(nv && nv.f.section === 'AREA'),
      nfLevels: [{id: 'VILLAGE', label: 'Village'}, {id: 'MANDAL', label: 'Mandal'}, {id: 'DISTRICT', label: 'District'}], nfAreas: nv ? nv.areas : [], nfMobile: !!(nv && nv.mobile),
      onNF: (e: FieldChange) => {
        const t = e.target;
        const {name, value} = t;
        if (name === 'type' && value === '__new') {
          this.addType(this.state.nf?.section, true);
          return;
        }
        if (name === 'name') this.suggestTe('nf', value);
        const next = t instanceof HTMLInputElement && t.type === 'checkbox' ? t.checked : value;
        this.setState((st) => {
          if (!st.nf) return null;
          const n = {...st.nf, [name]: next};
          if (name === 'level') n.area = '';
          if (name === 'type') n.custom = '';
          return {nf: n};
        });
      },
      cannotSaveNF: !(nv && nv.ok), saveNFOpacity: nv && nv.ok ? 1 : .5, saveNF: () => this.saveNumber(), closeNF: () => this.setState({nf: null}),
      settings: s.settings, catRows, langRows, templates, badge36: {size: 36},
      onEscalation: (e: FieldChange) => this.setState((st) => ({settings: {...st.settings, escalation: Number(e.target.value) || 0}})), saveSettings: () => this.api.patch('/admin/settings/', {review_escalation_hours: s.settings.escalation}).then(() => this.toast('Settings saved · escalation ' + s.settings.escalation + ' h')).catch((e: unknown) => this.fail(e)),
      onCitizenPerDay: (e: FieldChange) => this.setState((st) => ({settings: {...st.settings, citizenPerDay: e.target.value === '' ? '' : Math.max(0, Math.min(1000, Math.round(Number(e.target.value) || 0)))}})),
      saveCitizenPerDay: () => {
        const n = Number(s.settings.citizenPerDay) || 0;
        this.api.patch('/admin/settings/', {citizen_posts_per_day: n}).then(() => this.toast(n ? 'Settings saved · ' + n + ' citizen posts per phone a day' : 'Settings saved · no daily limit for citizen posts')).catch((e: unknown) => this.fail(e));
      },
      panel, sp, su, closePanel: () => this.setState({panel: null}),
      modal, modalText: s.modalText, modalSel: s.modalSel, onModalText: (e: FieldChange) => this.setState({modalText: e.target.value}), onModalSel: (e: FieldChange) => this.setState({modalSel: e.target.value}), closeModal: () => this.closeModal(),
      confirmModal: () => {
        if (!m || cannot) return;
        const t = s.modalText, sel = s.modalSel, gen = s.modalGen;
        this.closeModal();
        m.onConfirm(t, sel, gen);
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
          <div style={{display: "grid", gridTemplateColumns: "248px minmax(0, 1fr)", height: "100vh", overflow: "hidden"}}>
            <Sidebar v={v} />
            <main style={{display: "flex", flexDirection: "column", minWidth: "0", minHeight: "0"}}>
              <TopBar v={v} />
              <div ref={v.scrollRef} style={{flex: "1", minHeight: "0", overflowY: "auto"}}>
              <div style={{padding: "24px 28px 40px", display: "flex", flexDirection: "column", gap: "20px", animation: "sa-fade .2s ease-out"}}>
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
          {v.sfShow ? <ServiceFormPanel v={v} /> : null}
          {v.afShow ? <AdFormPanel v={v} /> : null}
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
