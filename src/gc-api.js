// Tiny fetch wrapper for the BVT Grama Connect API (docs/api-contract.md).
// Errors reject with the contract's error object plus `status`:
//   { code: "validation_error", message: "...", fields: {...}, status: 400 }
(function () {
  "use strict";
  var config = window.GC_CONFIG || {};
  var base = String(config.apiBase || "/api/v1").replace(/\/+$/, "");

  function request(method, path, body, options) {
    options = options || {};
    var headers = { Accept: "application/json" };
    if (options.lang) headers["Accept-Language"] = options.lang;
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (options.token) headers.Authorization = "Bearer " + options.token;
    return fetch(base + path, {
      method: method,
      headers: headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
    }).then(
      function (response) {
        if (response.status === 204 || response.status === 304) return null;
        return response.json().catch(function () { return null; }).then(function (data) {
          if (response.ok) return data;
          var error = (data && data.error) || { code: "http_" + response.status, message: response.statusText };
          error.status = response.status;
          throw error;
        });
      },
      function () {
        throw { code: "network", message: "Network error", status: 0 };
      }
    );
  }

  window.GCApi = {
    base: base,
    get: function (path, options) { return request("GET", path, undefined, options); },
    post: function (path, body, options) { return request("POST", path, body === undefined ? {} : body, options); },
  };
})();
