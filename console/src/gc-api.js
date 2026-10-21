/* BVT Grama Connect console: small fetch wrapper around the REST API.
 *
 * - Base URL from window.GC_CONFIG.apiBase (config.js, written by build.mjs).
 * - The access token lives in memory only. The refresh token is an HttpOnly,
 *   SameSite=Strict cookie the server sets at login; page scripts never see it.
 * - An expired access token is refreshed once and the request retried.
 * - Errors are thrown as Error objects with .status, .code and .body (the
 *   contract's {"error": {...}} object).
 */
(function () {
  var cfg = window.GC_CONFIG || { apiBase: "/api/v1" };
  var access = null;
  var refreshing = null;

  function headers(extra) {
    var h = { "Accept-Language": "en", "X-GC-Client": "console" };
    if (access) h.Authorization = "Bearer " + access;
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

  function refresh() {
    if (!refreshing) {
      refreshing = fetch(cfg.apiBase + "/auth/refresh/", {
        method: "POST",
        credentials: "same-origin",
        headers: headers({ "Content-Type": "application/json" }),
        body: "{}",
      })
        .then(async function (r) {
          if (!r.ok) { access = null; throw await toError(r); }
          var data = await r.json();
          access = data.access;
          return access;
        })
        .finally(function () { refreshing = null; });
    }
    return refreshing;
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

  async function request(method, path, opts) {
    opts = opts || {};
    var url = buildUrl(path, opts.query);
    function send() {
      var extra = {};
      var payload;
      if (opts.form) payload = opts.form;
      else if (opts.body !== undefined) { extra["Content-Type"] = "application/json"; payload = JSON.stringify(opts.body); }
      return fetch(url, { method: method, headers: headers(extra), body: payload, credentials: "same-origin" });
    }
    var response = await send();
    if (response.status === 401 && access) {
      var code = null;
      try { code = (await response.clone().json()).error.code; } catch (e) { /* ignore */ }
      if (code === "token_expired") {
        await refresh();
        response = await send();
      }
    }
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
    refresh: refresh,
    setAccess: function (token) { access = token; },
    logout: async function () {
      try { await request("POST", "/auth/logout/", { body: {} }); } catch (e) { /* already gone */ }
      access = null;
    },
  };
})();
