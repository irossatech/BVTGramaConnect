// Shapes of the API data the console reads and sends (BackEnd docs/api-contract.md).
// Only the fields the console uses are listed; fields that can be missing or null are marked so.

export type AreaLevel = "STATE" | "DISTRICT" | "MANDAL" | "VILLAGE";

/** Contract section 2 "Area". */
export interface Area {
  level: AreaLevel;
  id: number;
  name: string;
  /** From the area up to the district: "Tenali · Guntur". */
  path?: string;
}

/** Page-number lists: {count, next, previous, results}. */
export interface Paged<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

/** Lists that some servers send plain and others paged. */
export type ListOrPage<T> = T[] | Paged<T>;

/** Who did something: in audit entries, post history, decided_by. */
export interface Actor {
  id?: string | null;
  name: string;
  role: string;
}

// ---- accounts ----

export interface RoleAssignment {
  id: string;
  /** Group key, e.g. VILLAGE_ADMIN. */
  role: string;
  area: Area | null;
  is_active?: boolean;
}

export interface MeGroup {
  key?: string;
  name?: string;
  label?: string;
}

/** GET /me/ (also inside the session login answer). */
export interface Me {
  id: string;
  username: string;
  name: string;
  email: string | null;
  must_change_password?: boolean;
  /** "app_label.codename" strings. */
  permissions?: string[];
  groups?: MeGroup[];
}

/** POST /auth/session/login/: {user: Me}; older servers sent Me itself. */
export type LoginResponse = Me & { user?: Me };

/** User (admin view), GET /users/. */
export interface User {
  id: string;
  username?: string;
  name: string;
  name_te?: string;
  mobile?: string | null;
  email?: string | null;
  is_active?: boolean;
  status?: string;
  role_assignments?: RoleAssignment[];
  last_login_at?: string | null;
  locked_out?: boolean;
  allowed_actions?: string[];
}

/** POST /users/{id}/block/ and /unblock/: the user, or {user}. */
export type UserResponse = User & { user?: User };

/** POST /users/ and /users/{id}/reset-password/. */
export interface TemporaryPassword {
  temporary_password?: string;
}

// ---- geography ----

interface GeoRow {
  id: number;
  name_en: string;
  name_te: string;
  lgd_code: string | null;
  is_active: boolean;
}

export interface GeoVillage extends GeoRow {
  latitude: string | null;
  longitude: string | null;
  pin_code: string | null;
}

export interface GeoMandal extends GeoRow {
  villages?: GeoVillage[];
}

export interface GeoDistrict extends GeoRow {
  mandals: GeoMandal[];
}

/** GET /geo/tree/?villages=1 returns [GeoState]. */
export interface GeoState {
  id: number;
  name_en: string;
  name_te: string;
  districts: GeoDistrict[];
}

/** POST /geo/villages/import/ (also the dry run). */
export interface GeoImportResult {
  counts?: Partial<Record<"state" | "district" | "mandal" | "village", { created?: number; updated?: number; unchanged?: number }>>;
  warnings?: unknown[];
  missing_coordinates_count?: number;
  missing_coordinates_total?: number;
}

// ---- posts ----

export interface Category {
  id: number;
  key: string;
  name?: string;
  name_en: string;
  name_te: string;
  is_active: boolean;
  post_count?: number;
}

export interface Media {
  kind: string;
  url: string;
  thumb_url?: string | null;
  poster_url?: string | null;
}

export interface PostEvent {
  kind: string;
  start_date: string;
  end_date: string | null;
}

/** A citizen's phone behind a citizen post (contract section 15). */
export interface PostCitizen {
  blocked?: boolean;
  blocked_until?: string | null;
  posts_total?: number;
  posts_discarded?: number;
}

/** Post (authoring and review view). */
export interface Post {
  id: string;
  status: string;
  category?: { key: string; name: string } | null;
  title: string;
  body: string;
  translation?: { title: string; body: string } | null;
  target_area?: Area | null;
  targets?: Area[];
  event?: PostEvent | null;
  is_urgent?: boolean;
  media?: Media[];
  author?: Actor;
  created_at: string;
  submitted_at?: string | null;
  published_at?: string | null;
  allowed_actions?: string[];
  citizen?: PostCitizen | null;
}

export interface PostsPage extends Paged<Post> {
  status_counts?: Record<string, number>;
}

/** GET /posts/{id}/history/. */
export interface ReviewAction {
  action: string;
  from_status?: string;
  to_status?: string;
  comment?: string;
  actor?: Actor | null;
  at: string;
}

/** POST /posts/{id}/discard-citizen-posts/. */
export interface DiscardCitizenResult {
  discarded?: number;
}

// ---- audit, dashboard, reports ----

export interface AuditEntry {
  at: string;
  actor?: Actor | null;
  action: string;
  target_label?: string;
  area?: Area | null;
}

export interface Dashboard {
  geo: { districts: number };
  kpis: {
    total_posts: number;
    pending: number;
    oldest_pending_hours?: number | null;
    escalated: number;
    published_today: number;
    active_admins: number;
    blocked_users: number;
  };
  posts_per_day: { date: string; submitted: number; published: number }[];
  pending_by_district: { district: Area; name_te?: string; pending: number; oldest_pending_hours: number | null }[];
  recent_activity: AuditEntry[];
}

export interface ReportSummary {
  total: number;
  published: number;
  pending: number;
  rejected: number;
  days: number;
}

interface ReportCounts {
  total: number;
  published: number;
  pending: number;
  rejected: number;
}

export interface ReportDistrict extends ReportCounts {
  district: Area;
  mandals: (ReportCounts & { mandal: Area })[];
}

export interface ReportReviewTime {
  level: AreaLevel;
  avg_hours: number | null;
  reviews: number;
  escalation_hours: number;
}

export interface ReportActivity {
  user: Actor;
  area: Area | null;
  reviewed: number;
  published: number;
  recheck: number;
  discarded: number;
  avg_review_hours: number | null;
  last_active_at: string | null;
}

// ---- settings ----

export interface Settings {
  review_escalation_hours: number;
  citizen_posts_per_day?: number | null;
  languages?: { te?: boolean; en?: boolean } | null;
}

export interface NotificationTemplate {
  key: string;
  name?: string;
  channel: string;
  text_te: string;
  text_en: string;
  variables?: string[];
  editable?: boolean;
}

// ---- web_public ----

export interface ContactMessage {
  id: number;
  name: string;
  mobile?: string;
  village_text?: string;
  message: string;
  created_at: string;
  status?: string;
  handled?: boolean;
}

// ---- contacts: important numbers (section 14) ----

/** GET /contact-types/ (public). */
export interface ContactTypeRef {
  key: string;
  section: string;
  name: string;
  is_other?: boolean;
}

/** GET /admin/contact-types/. */
export interface AdminContactType {
  id: number;
  key: string;
  section: string;
  name_en: string;
  name_te: string;
  is_other: boolean;
  is_active: boolean;
  contact_count: number;
}

export interface AdminContact {
  id: string;
  type: ContactTypeRef;
  custom_type?: string;
  name: string;
  name_te?: string;
  phone: string;
  phone_kind?: string;
  email?: string | null;
  area?: Area | null;
  sort_order?: number | null;
  consent_recorded?: boolean;
  verified_at?: string | null;
  needs_recheck?: boolean;
  allowed_actions?: string[];
}

/** POST /admin/contacts/import/. */
export interface ContactImportResult {
  created: number;
  updated: number;
  skipped: number;
}

/** One bad row in error.report.errors of a contacts import. */
export interface ContactImportError {
  row: number;
  field?: string;
  message: string;
}

// ---- services and bills (sections 16 and 18) ----

/** A service or a bill: the two lists have the same fields. */
export interface CatalogItem {
  key: string;
  name_en: string;
  name_te?: string;
  icon: string;
  color: string;
  logo?: string | null;
  is_active?: boolean;
  // Services only: the example under "Your request" on the citizen's request form (backend plan: service hint).
  hint_en?: string;
  hint_te?: string;
}

interface Named {
  id: number;
  name: string;
}

export interface ServiceRequestEvent {
  at: string;
  by?: { name: string } | null;
  status?: string;
  assigned_to?: { name: string } | null;
  note?: string;
}

export interface ServiceRequest {
  id: number;
  service: string;
  service_name?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  details?: string;
  village?: Named | null;
  mandal?: Named | null;
  district?: Named | null;
  status: string;
  note?: string;
  created_at: string;
  assigned_to?: { id: string; name: string } | null;
  allowed_actions?: string[];
  history?: ServiceRequestEvent[];
}

export interface ServiceRequestsPage extends Paged<ServiceRequest> {
  status_counts?: Record<string, number>;
}

// ---- ads (section 17) ----

export interface Ad {
  id: number;
  title: string;
  image: string;
  link?: string;
  area?: { level: AreaLevel; id: number; name: string } | null;
  starts_on: string | null;
  ends_on: string | null;
  is_active: boolean;
}
