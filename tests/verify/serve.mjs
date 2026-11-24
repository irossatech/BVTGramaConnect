// Local test server for the browser checks (Jira BVTGC-7): serves dist/ the way the production Nginx does
// (security headers incl. the CSP from the config, gzip, /x/ → x/index.html, unknown → 404.html with 404), and a
// FAKE backend under /api/v1/ (owner's choice of 2026-11-23: no staging accounts; never a real server).
// The fake keeps a Django-like session: csrftoken cookie, HttpOnly sessionid, login lockout after N failures.
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { gzipSync } from "node:zlib";

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".woff2": "font/woff2", ".apk": "application/vnd.android.package-archive",
};
const GZIP = /^(text\/|application\/(json|xml)|image\/svg)/;

const cookies = (req) => Object.fromEntries((req.headers.cookie || "").split(/;\s*/).filter(Boolean).map((c) => c.split("=").map(decodeURIComponent)));

/** Starts the server; resolves to { url, log, expireSessions(), close() }. `log` lists every fake API call. */
export function startServer(c) {
  const fake = c.fake;
  const sessions = new Map(); // sessionid → username
  const failures = new Map(); // username → failed logins
  const log = [];
  const send = (res, status, body, headers = {}) => {
    res.writeHead(status, { "Content-Type": "application/json", ...headers });
    res.end(body === undefined ? "" : JSON.stringify(body));
  };
  const err = (res, status, code, extra = {}) => send(res, status, { error: { code, message: code.replaceAll("_", " "), ...extra } });

  // One official for the Users page (contract User). With contact=0 the list row leaves the mobile and email keys
  // out (BVTGC-75); GET /users/55/ has them in full.
  const official = { id: "55", username: "ravi kumar", name: "Ravi Kumar", is_active: true, status: "ACTIVE", mobile_last4: "3210", email_masked: "r***@example.org", allowed_actions: ["edit"],
    role_assignments: [{ id: "2", is_active: true, role: "VILLAGE_ADMIN", area: { level: "VILLAGE", id: 30, name: "Kolakaluru", path: "Kolakaluru · Tenali · Guntur" } }] };
  const officialContact = { mobile: "9876543210", email: "ravi@example.org" };

  async function api(req, res, path, query) {
    const unsafe = !["GET", "HEAD", "OPTIONS"].includes(req.method);
    const ck = cookies(req);
    const csrfOk = !unsafe || (!!ck.csrftoken && req.headers["x-csrftoken"] === ck.csrftoken);
    log.push({ method: req.method, path, query: Object.fromEntries(query), unsafe, csrfOk });
    let body = {};
    if (unsafe) {
      const raw = await new Promise((r) => {
        let s = "";
        req.on("data", (d) => (s += d));
        req.on("end", () => r(s));
      });
      try {
        body = raw ? JSON.parse(raw) : {};
      } catch {
        body = {};
      }
    }
    if (unsafe && !csrfOk) return err(res, 403, "csrf_failed");
    const user = sessions.get(ck.sessionid);
    const me = user ? fake.users[user].me : null;

    // ---- public (website) ----
    if (path === "/app-config/") return send(res, 200, fake.appConfig);
    if (path === "/public/showcase/") return send(res, 200, { ...fake.showcase, featured: { ...fake.showcase.featured, published_at: new Date().toISOString() } });
    if (path === "/categories/") return send(res, 200, fake.categories);

    // ---- console session ----
    if (path === "/auth/csrf/") return send(res, 200, {}, { "Set-Cookie": `csrftoken=${randomBytes(16).toString("hex")}; Path=/; SameSite=Lax` });
    if (path === "/auth/session/login/") {
      const u = String(body.username || "").trim().toLowerCase();
      const acct = fake.users[u];
      if ((failures.get(u) || 0) >= fake.lockoutAfter) return err(res, 429, "locked_out", { retry_after_s: 900 });
      if (!acct || acct.password !== body.password) {
        failures.set(u, (failures.get(u) || 0) + 1);
        return err(res, 400, "invalid_credentials");
      }
      failures.delete(u);
      if (!acct.me.permissions.includes("web_admin.access_web_console")) return err(res, 403, "not_console_user");
      const sid = randomBytes(16).toString("hex");
      sessions.set(sid, u);
      return send(res, 200, { user: acct.me }, { "Set-Cookie": `sessionid=${sid}; Path=/; HttpOnly; SameSite=Lax` });
    }
    if (path === "/auth/session/logout/") {
      sessions.delete(ck.sessionid);
      res.writeHead(204, { "Set-Cookie": "sessionid=; Path=/; HttpOnly; Max-Age=0" });
      return res.end();
    }
    if (!me) return err(res, 401, "not_authenticated");
    if (path === "/me/") return send(res, 200, me);
    if (path === "/users/" && req.method === "GET") {
      const row = query.get("contact") === "0" ? official : { ...official, ...officialContact };
      return send(res, 200, { count: 1, next: null, previous: null, results: [row], counts: { total: 1, active: 1, blocked: 0 } });
    }
    if (path === "/users/55/") return send(res, 200, { ...official, ...officialContact });
    // Every other console call: an empty answer in the shape the console reads (lists and pages).
    return send(res, 200, fake.emptyAnswers[path] ?? { results: [], count: 0, next: null, previous: null });
  }

  function file(req, res, path) {
    let p = normalize(decodeURIComponent(path)).replace(/^([/\\])+/, "");
    if (p.includes("..")) return send(res, 400, {});
    let f = join(c.dist, p);
    if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
    let status = 200;
    if (!existsSync(f)) {
      f = join(c.dist, "404.html");
      status = 404;
    }
    const type = TYPES[extname(f)] || "application/octet-stream";
    let data = readFileSync(f);
    const headers = { "Content-Type": type, ...c.securityHeaders };
    if (GZIP.test(type) && /gzip/.test(req.headers["accept-encoding"] || "")) {
      data = gzipSync(data);
      headers["Content-Encoding"] = "gzip";
    }
    res.writeHead(status, headers);
    res.end(data);
  }

  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://x"), path = url.pathname;
    if (path.startsWith("/api/v1/")) return api(req, res, path.slice("/api/v1".length), url.searchParams);
    return file(req, res, path);
  });
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () =>
      resolve({
        url: `http://127.0.0.1:${server.address().port}`,
        log,
        expireSessions: () => sessions.clear(),
        close: () => new Promise((r) => server.close(r)),
      }),
    ),
  );
}
