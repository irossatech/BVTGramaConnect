// Tiny fetch wrapper for the Grama Connect API (docs/api-contract.md), used by the website.
// Errors reject with the contract's error object plus `status`:
//   { code: "validation_error", message: "...", fields: {...}, status: 400 }
import config from "../shared/config";

export interface SiteApiError {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
  status: number;
}

interface Options {
  /** Accept-Language: the language the server answers in. */
  lang?: string;
}

const base = String(config.apiBase).replace(/\/+$/, "");

function request<T>(method: "GET" | "POST", path: string, body?: unknown, options: Options = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.lang) headers["Accept-Language"] = options.lang;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  return fetch(base + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  }).then(
    (response) => {
      if (response.status === 204 || response.status === 304) return null as T;
      return response.json().catch(() => null).then((data: { error?: Omit<SiteApiError, "status"> } | null) => {
        if (response.ok) return data as T;
        const error: SiteApiError = { ...(data?.error ?? { code: "http_" + response.status, message: response.statusText }), status: response.status };
        throw error;
      });
    },
    () => {
      const error: SiteApiError = { code: "network", message: "Network error", status: 0 };
      throw error;
    },
  );
}

const GCApi = {
  base,
  get: <T>(path: string, options?: Options) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: Options) => request<T>("POST", path, body === undefined ? {} : body, options),
};

export default GCApi;
