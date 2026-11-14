// The Super Admin console's own data shapes (API data mapped for the markup), its state, and the small helpers
// Console.tsx and the screen logic in logic/ share. Moved out of Console.tsx unchanged (audit WEB-ARCH-001).
import type React from "react";
import { ApiError } from "./api";
import type {
  Actor, Ad, AdminContact, AdminContactType, Area, AreaLevel, AuditEntry, CatalogItem, Category, ContactImportError, ContactMessage, ContactTypeRef, Dashboard, GeoState,
  ConsoleNotification, ListOrPage, Me, Media, NotificationTemplate, Post, PostCitizen, PostEvent,
  ReportActivity, ReportDistrict, ReportReviewTime, ReportSummary, ReviewAction, RoleAssignment, ServiceRequest,
} from "./types";
// ---- the console's own shapes (API data mapped for the markup) ----

export type Props = Record<string, never>;
export type Screen = "checking" | "login" | "change_password" | "app";
export type PageKey = "dashboard" | "geography" | "users" | "posts" | "requests" | "bills" | "ads" | "reports" | "audit" | "contact" | "numbers" | "settings";
/** A page, or the services list (a view of the requests page with its own permissions). */
export type NavKey = PageKey | "services";
export type StatusTab = "All" | "Pending" | "Published" | "Recheck" | "Discarded" | "TakenDown";
export type NumTab = "AREA" | "HELPLINE" | "TYPES";
export type SvcView = "requests" | "catalog";
export type GeoKind = "district" | "mandal" | "village";
export type AdStatus = "live" | "scheduled" | "paused" | "ended";
export type FieldChange = React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
export type Timer = ReturnType<typeof setTimeout>;

export interface Option {
  id: string;
  label: string;
}

export interface AreaOption extends Option {
  level: AreaLevel;
}

export interface Toast {
  id: number;
  text: string;
  dot: string;
}

/** The confirm dialog (ask()). onConfirm gets the text box, the select and the generated password. */
export interface ModalSpec {
  title: string;
  body: string;
  confirmLabel: string;
  bg?: string;
  onConfirm: (text: string, sel: string, gen: string, text2: string) => void;
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
  /** The text box hides what is typed (confirming with your own password). */
  password?: boolean;
  inputLabel?: string;
  inputPh?: string;
  /** A second text field under the first (My profile: the Telugu name). */
  input2Label?: string;
  input2Ph?: string;
  preset2?: string;
}

/** The New post panel (same fields as the app's Compose). */
export interface ComposeForm {
  cat: string;
  lang: string;
  title: string;
  body: string;
  d: string;
  m: string;
  v: string;
  urgent: boolean;
  /** Photos and videos in the order picked; previews, kinds, durs and posters line up with them. */
  files: File[];
  previews: string[];
  kinds: ('image' | 'video')[];
  /** A video's length in seconds (0 for a photo), read in the browser. */
  durs: number[];
  /** A video's first frame as a JPEG (null for a photo, or when the browser could not draw it). */
  posters: (Blob | null)[];
  /** Videos still being read before they are added. */
  checking: number;
  saving: boolean;
  tried: boolean;
  /** What is happening while saving ("Uploading 2 of 3…"). */
  step: string;
  /** Set once the post exists, so a retry after a failed upload does not create it twice. */
  postId: string;
  uploaded: number;
  photoErr: string;
}

export interface GeoVillageRow {
  id: number;
  name: string;
  te: string;
  lgd: string;
  lat: string;
  lng: string;
  pin: string;
  active: boolean;
}

export interface GeoMandalRow {
  id: number;
  name: string;
  te: string;
  lgd: string;
  active: boolean;
  villages: GeoVillageRow[];
}

export interface GeoDistrictRow {
  id: number;
  name: string;
  te: string;
  lgd: string;
  active: boolean;
  mandals: GeoMandalRow[];
}

/** Any row of the geography tree. */
export interface GeoNode {
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

export interface GeoForm {
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

export interface GeoErrs {
  name: string;
  pin: string;
  coords: string;
}

/** A user from GET /users/, in the prototype's shape. */
export interface AdminUser {
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
export interface NewUserForm {
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
export interface PostRow {
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

export interface Panel {
  type: "post" | "user";
  id: string;
}

export interface AdForm {
  id: number | null;
  title: string;
  link: string;
  /** 'image' or 'video': what the banner shows. */
  kind: 'image' | 'video';
  file: File | null;
  preview: string;
  /** A video picked here, its object URL (or the server's file), its poster and length in seconds. */
  vfile: File | null;
  vpreview: string;
  poster: string;
  dur: number;
  vchecking: boolean;
  /** Why the picked video was refused ('' = fine). */
  verr: string;
  d: string;
  m: string;
  v: string;
  start: string;
  end: string;
  active: boolean;
  tried: boolean;
  saving: boolean;
}

export type AdErrors = Partial<Record<"title" | "image" | "link" | "end", string>>;

/** The service or bill form. */
export interface ServiceForm {
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
export interface CatalogSet {
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

export interface NumberForm {
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

export interface TypeForm {
  id?: number;
  section: string;
  /** Opened from the number form's "+ Add a new type…": the new type is picked there. */
  forNumber?: boolean;
  en: string;
  te: string;
  tried: boolean;
  saving: boolean;
}

export interface ImportProgress {
  phase: string;
  done: number;
  total: number;
  name: string;
}

export type SelKey = "numSel" | "adSel";
export type SelId = string | number;

export interface BulkOptions {
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

export interface SettingsState {
  escalation: number;
  /** '' while the box is empty. */
  citizenPerDay: number | "";
  langs: { te: boolean; en: boolean };
  templates: NotificationTemplate[];
}

export interface State {
  screen: Screen;
  page: PageKey;
  username: string;
  password: string;
  cpCurrent: string;
  cpNext: string;
  cpVoluntary: boolean;
  showPw: Record<string, boolean>;
  menuOpen: boolean;
  /** The bell's dropdown: this official's own notifications (newest first). */
  /** The CSV export running now (its report name, or "audit"): its button says Exporting… and ignores clicks. */
  exporting: string | null;
  notifOpen: boolean;
  notifs: ConsoleNotification[];
  notifUnread: number;
  /** Cursor for the next page, or null on the last one. */
  notifNext: string | null;
  notifLoading: boolean;
  notifError: boolean;
  /** Phones and tablets: the side bar slides in over the page. */
  navOpen: boolean;
  gsearch: string;
  me: Me | null;
  geo: GeoDistrictRow[];
  stateRow: GeoState | null;
  expanded: Record<string, boolean>;
  /** Geography search: district, mandal or village name (English or Telugu) or LGD code. */
  geoQ: string;
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
  cf: ComposeForm | null;
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
  /** The contact message open in its View panel, read in full from GET /admin/contact-messages/{id}/. */
  cm: ContactMessage | null;
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
  /** Audit tab: '' (all) or posts, users, areas, logins, settings, system (GET /audit/?type=). */
  auditType: string;
  /** Dashboard: filter for the "Pending by district" list (English or Telugu name). */
  distQ: string;
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
  /** Important numbers (village tab): one district's numbers only, or '' for all (as in the app). */
  numDistrict: string;
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
  modalText2: string;
  modalSel: string;
  modalGen: string;
  toasts: Toast[];
  imp: ImportProgress | null;
}

/** The forms Escape closes, top first. */
export const FORMS = ["tf", "nf", "sf", "af", "rq", "cm", "cf"] as const;
/** The forms whose Telugu name is suggested from the English one. */
export type TeForm = "geoForm" | "nu" | "sf" | "tf" | "nf";

// setState for a key picked at runtime. TypeScript widens {[key]: value} to an index signature,
// so the one assertion here names it back as the key it is.
export function one<K extends keyof State>(key: K, value: State[K]): Pick<State, K> {
  return { [key]: value } as Pick<State, K>;
}

// A form value for the markup: the open form, or {} while it is closed (the markup reads it as v.x?.field).
export const orEmpty = <T extends object>(x: T | null): Partial<T> => x || {};

export const isStatus = (e: unknown, status: number): boolean => e instanceof ApiError && e.status === status;

/** Rows per page in every paged list (the server's page_size). */
export const PAGE_SIZE = 20;

/** Pages in a list of `count` rows; at least one. */
export const pageCount = (count: number | null | undefined): number => Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

/** The rows of an answer that is either a plain list or a page ({results}). */
export const rows = <T,>(d: ListOrPage<T>): T[] => (Array.isArray(d) ? d : d.results || []);

/** The local (blob:) previews the service and ad forms show; New post frees its own. */
export const blobPreviews = (s: State): string[] => [s.sf?.image, s.af?.preview, s.af?.vpreview].filter((u): u is string => !!u && u.startsWith("blob:"));

/** Opens the browser's file picker and hands over the chosen file. */
export function pickFile(accept: string, onFile: (file: File) => void): void {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.onchange = () => {
    const file = input.files && input.files[0];
    if (file) onFile(file);
  };
  input.click();
}

/** Reads a picture's width in pixels; 0 when the browser cannot decode it (the server then decides). */
export function imageWidth(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.naturalWidth);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    img.src = url;
  });
}

/** Text cells that start like a formula (=, +, -, @, tab, CR) get a leading apostrophe, so Excel shows them as text
 * (the server's grama/csvsafe.py rule). Plain numbers, such as coordinates, stay as they are. */
export function csvCell(x: string | number | null | undefined): string {
  let t = String(x ?? "");
  if (/^[=+\-@\t\r]/.test(t) && !/^-?\d+(\.\d+)?$/.test(t)) t = "'" + t;
  return /[",\r\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
}

// error.report.errors of a CSV import refused with 400 (contract sections 4 and 14).
export function reportErrors(e: unknown): unknown[] {
  const rep = e instanceof ApiError ? e.body.report : undefined;
  return typeof rep === "object" && rep !== null && "errors" in rep && Array.isArray(rep.errors) ? rep.errors : [];
}

export const isActor = (x: unknown): x is Actor => typeof x === "object" && x !== null;
export const isRowError = (x: unknown): x is ContactImportError => typeof x === "object" && x !== null;

// The page in a history entry this console pushed ({gc: page}); '' for any other entry.
export function historyPage(e: PopStateEvent): string {
  const st: unknown = e.state;
  return typeof st === "object" && st !== null && "gc" in st && typeof st.gc === "string" ? st.gc : "";
}

/** Google Input Tools answer: ["SUCCESS", [[input, [suggestion, …], …]]]. */

export const EMPTY_NU: NewUserForm = { id: null, name: "", te: "", email: "", username: "", mobile: "", password: "", role: "panchayat", area: "", nuD: "", nuM: "" };


export interface RoleStyle {
  label: string;
  bg: string;
  tbg: string;
  tc: string;
}

export interface Tone {
  label: string;
  bg: string;
  color: string;
}

/** Role badges, by role key (super, district…). */
export const ROLE: Readonly<Record<string, RoleStyle>> = {super:{label:'Super Admin',bg:'#0A2550',tbg:'#e3f0fb',tc:'#0D3B7A'},district:{label:'District Admin',bg:'#0D3B7A',tbg:'#e3f0fb',tc:'#0D3B7A'},mandal:{label:'Mandal Admin',bg:'#07818e',tbg:'#dff3f5',tc:'#07818e'},village:{label:'Village Admin',bg:'#1F8A3B',tbg:'#e4f4df',tc:'#1d7a33'},panchayat:{label:'Panchayat Member',bg:'#E9791E',tbg:'#fff0dc',tc:'#b35a0e'},system:{label:'System',bg:'#6b7a8c',tbg:'#eef2f6',tc:'#3b4a5c'}};
/** API role key (SUPER_ADMIN…) to role key. */
export const RK: Readonly<Record<string, string>> = {SUPER_ADMIN:'super',DISTRICT_ADMIN:'district',MANDAL_ADMIN:'mandal',VILLAGE_ADMIN:'village',PANCHAYAT_MEMBER:'panchayat',SYSTEM:'system'};

/** A list pager: Prev and Next load the page before or after, and fade at the ends. */
export const pager = (page: number, pages: number, load: (p: number) => void) => ({show: pages > 1, page, pages, prev: () => { if (page > 1) load(page - 1); }, next: () => { if (page < pages) load(page + 1); }, prevOpacity: page > 1 ? 1 : .4, nextOpacity: page < pages ? 1 : .4});
