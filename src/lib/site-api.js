// Tiny fetch wrapper for the BVT Grama Connect API (docs/api-contract.md), used by the website.
// Errors reject with the contract's error object plus `status`:
//   { code: "validation_error", message: "...", fields: {...}, status: 400 }
import config from "./config";

const base = String(config.apiBase).replace(/\/+$/, "");

function request(method, path, body, options = {}) {
  const headers = { Accept: "application/json" };
  if (options.lang) headers["Accept-Language"] = options.lang;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  return fetch(base + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  }).then(
    (response) => {
      if (response.status === 204 || response.status === 304) return null;
      return response.json().catch(() => null).then((data) => {
        if (response.ok) return data;
        const error = (data && data.error) || { code: "http_" + response.status, message: response.statusText };
        error.status = response.status;
        throw error;
      });
    },
    () => {
      throw { code: "network", message: "Network error", status: 0 };
    }
  );
}

const GCApi = {
  base,
  get: (path, options) => request("GET", path, undefined, options),
  post: (path, body, options) => request("POST", path, body === undefined ? {} : body, options),
};

export default GCApi;
