/* BVT Grama Connect console: small fetch wrapper around the REST API.
 *
 * - Base URL from shared/config.ts (GC_API_BASE at build time).
 * - The console signs in with a Django session: the server sets the HttpOnly
 *   `sessionid` cookie at login. The page never sees a token.
 * - Every call is same-origin with cookies. Writes (POST, PATCH, PUT, DELETE)
 *   send the CSRF token from the readable `csrftoken` cookie as X-CSRFToken.
 *   The cookie is read on every request because Django rotates it at login.
 * - Errors are thrown as ApiError objects with .status, .code and .body (the
 *   contract's {"error": {...}} object).
 */
import config from "../shared/config";

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
/** Query string values; empty, null and undefined values are left out. */
export type Query = Record<string, string | number | boolean | null | undefined>;

/** The contract's error object: {"error": {code, message, fields?, ...}}. */
export interface ApiErrorBody {
  code?: string;
  message?: string;
  fields?: Record<string, string[] | string>;
  [key: string]: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string | undefined,
    readonly body: ApiErrorBody,
  ) {
    super(message);
  }
}

const SAFE: ReadonlySet<Method> = new Set<Method>(["GET"]);
let csrfReady: Promise<null> | null = null;

function cookie(name: string): string {
  for (const part of document.cookie ? document.cookie.split("; ") : []) {
    const eq = part.indexOf("=");
    if (part.slice(0, eq) === name) return decodeURIComponent(part.slice(eq + 1));
  }
  return "";
}

function headers(method: Method, extra: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = { "Accept-Language": "en", "X-GC-Client": "console" };
  if (!SAFE.has(method)) h["X-CSRFToken"] = cookie("csrftoken");
  return { ...h, ...extra };
}

async function toError(response: Response): Promise<ApiError> {
  let body: { error?: ApiErrorBody } | null = null;
  try {
    body = await response.json();
  } catch {
    /* not JSON */
  }
  const err = body?.error ?? {};
  return new ApiError(err.message || "Request failed (" + response.status + ")", response.status, err.code, err);
}

function buildUrl(path: string, query?: Query): string {
  let url = config.apiBase + path;
  if (query) {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
    const s = q.toString();
    if (s) url += (url.includes("?") ? "&" : "?") + s;
  }
  return url;
}

// Makes sure the CSRF cookie exists before the first write.
function csrf(force = false): Promise<null> {
  if (force || !csrfReady || !cookie("csrftoken")) {
    csrfReady = fetch(config.apiBase + "/auth/csrf/", { method: "GET", credentials: "same-origin", headers: headers("GET") }).then(
      (r) => {
        if (!r.ok) csrfReady = null;
        return null;
      },
      () => {
        csrfReady = null;
        return null;
      },
    );
  }
  return csrfReady;
}

interface RequestOptions {
  query?: Query;
  body?: unknown;
  form?: FormData;
}

async function send(method: Method, path: string, opts: RequestOptions = {}): Promise<Response> {
  if (!SAFE.has(method)) await csrf();
  const extra: Record<string, string> = {};
  let payload: BodyInit | undefined;
  if (opts.form) payload = opts.form;
  else if (opts.body !== undefined) {
    extra["Content-Type"] = "application/json";
    payload = JSON.stringify(opts.body);
  }
  const response = await fetch(buildUrl(path, opts.query), { method, headers: headers(method, extra), body: payload, credentials: "same-origin" });
  if (!response.ok) throw await toError(response);
  return response;
}

async function request<T>(method: Method, path: string, opts?: RequestOptions): Promise<T> {
  const response = await send(method, path, opts);
  return (response.status === 204 ? null : await response.json()) as T;
}

async function download(path: string, query: Query, filename: string): Promise<void> {
  const blob = await (await send("GET", path, { query })).blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

const GC_API = {
  get: <T>(path: string, query?: Query) => request<T>("GET", path, { query }),
  post: <T>(path: string, body?: unknown, query?: Query) => request<T>("POST", path, { body: body || {}, query }),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, { body: body || {} }),
  del: (path: string) => request<null>("DELETE", path),
  upload: <T>(path: string, form: FormData, query?: Query, method: Method = "POST") => request<T>(method, path, { form, query }),
  download,
  // Page load: get the CSRF cookie, then ask who is signed in (401 when nobody is).
  start: <T>() => csrf(true).then(() => request<T>("GET", "/me/")),
  login: <T>(username: string, password: string) =>
    csrf(true).then(() => request<T>("POST", "/auth/session/login/", { body: { username, password } })),
  logout: async (): Promise<void> => {
    try {
      await request<null>("POST", "/auth/session/logout/", { body: {} });
    } catch {
      /* already gone */
    }
    csrfReady = null;
  },
};

export default GC_API;
