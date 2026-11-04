/* BVT Grama Connect console: small fetch wrapper around the REST API.
 *
 * - Base URL from window.GC_CONFIG.apiBase (config.js, written by build.mjs).
 * - The console signs in with a Django session: the server sets the HttpOnly
 *   `sessionid` cookie at login. The page never sees a token.
 * - Every call is same-origin with cookies. Writes (POST, PATCH, PUT, DELETE)
 *   send the CSRF token from the readable `csrftoken` cookie as X-CSRFToken.
 *   The cookie is read on every request because Django rotates it at login.
 * - Errors are thrown as Error objects with .status, .code and .body (the
 *   contract's {"error": {...}} object).
 */
(function () {
  var cfg = window.GC_CONFIG || { apiBase: "/api/v1" };
  var SAFE = { GET: true, HEAD: true, OPTIONS: true };
  var csrfReady = null;

  function cookie(name) {
    var parts = document.cookie ? document.cookie.split("; ") : [];
    for (var i = 0; i < parts.length; i++) {
      var eq = parts[i].indexOf("=");
      if (parts[i].slice(0, eq) === name) return decodeURIComponent(parts[i].slice(eq + 1));
    }
    return "";
  }

  function headers(method, extra) {
    var h = { "Accept-Language": "en", "X-GC-Client": "console" };
    if (!SAFE[method]) h["X-CSRFToken"] = cookie("csrftoken");
    for (var k in extra || {}) h[k] = extra[k];
    return h;
  }

  async function toError(response) {
    var body = null;
    try { body = await response.json(); } catch (e) { /* not JSON */ }
    var err = (body && body.error) || {};
    var e = new Error(err.message || "Request failed (" + response.status + ")");
    e.status = response.status;
    e.code = err.code;
    e.body = err;
    return e;
  }

  function buildUrl(path, query) {
    var url = cfg.apiBase + path;
    if (query) {
      var q = new URLSearchParams();
      Object.keys(query).forEach(function (k) {
        var v = query[k];
        if (v !== undefined && v !== null && v !== "") q.set(k, v);
      });
      var s = q.toString();
      if (s) url += (url.indexOf("?") >= 0 ? "&" : "?") + s;
    }
    return url;
  }

  // Makes sure the CSRF cookie exists before the first write.
  function csrf(force) {
    if (force || !csrfReady || !cookie("csrftoken")) {
      csrfReady = fetch(cfg.apiBase + "/auth/csrf/", {
        method: "GET",
        credentials: "same-origin",
        headers: headers("GET"),
      }).then(function (r) { if (!r.ok) { csrfReady = null; } return null; }, function () { csrfReady = null; return null; });
    }
    return csrfReady;
  }

  async function request(method, path, opts) {
    opts = opts || {};
    if (!SAFE[method]) await csrf();
    var extra = {};
    var payload;
    if (opts.form) payload = opts.form;
    else if (opts.body !== undefined) { extra["Content-Type"] = "application/json"; payload = JSON.stringify(opts.body); }
    var response = await fetch(buildUrl(path, opts.query), {
      method: method,
      headers: headers(method, extra),
      body: payload,
      credentials: "same-origin",
    });
    if (!response.ok) throw await toError(response);
    if (opts.raw) return response;
    if (response.status === 204) return null;
    return response.json();
  }

  async function download(path, query, filename) {
    var response = await request("GET", path, { query: query, raw: true });
    var blob = await response.blob();
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
  }

  window.GC_API = {
    get: function (p, q) { return request("GET", p, { query: q }); },
    post: function (p, b, q) { return request("POST", p, { body: b || {}, query: q }); },
    patch: function (p, b) { return request("PATCH", p, { body: b || {} }); },
    del: function (p) { return request("DELETE", p); },
    upload: function (p, form, q) { return request("POST", p, { form: form, query: q }); },
    download: download,
    // Page load: get the CSRF cookie, then ask who is signed in (401 when nobody is).
    start: function () { return csrf(true).then(function () { return request("GET", "/me/"); }); },
    login: function (username, password) {
      return csrf(true).then(function () {
        return request("POST", "/auth/session/login/", { body: { username: username, password: password } });
      });
    },
    logout: async function () {
      try { await request("POST", "/auth/session/logout/", { body: {} }); } catch (e) { /* already gone */ }
      csrfReady = null;
    },
  };
})();
