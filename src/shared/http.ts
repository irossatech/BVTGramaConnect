// The low-level pieces both API clients share (audit WEB-ARCH-003). Each app keeps its own policy on top:
// the website (src/website/api.ts) sends no CSRF header and rejects with a plain object; the console
// (src/console/api.ts) adds the session's CSRF header and throws ApiError.
import config from "./config";

/** GC_API_BASE without a trailing slash, so `apiBase + "/path/"` never doubles it. */
export const apiBase = String(config.apiBase).replace(/\/+$/, "");

/** The contract's error object (api-contract.md: {"error": {code, message, fields?, ...}}). */
export interface ErrorBody {
  code?: string;
  message?: string;
  fields?: Record<string, string[] | string>;
  [key: string]: unknown;
}

/** The error object of a failed answer; empty when the body is not JSON or has no `error`. */
export async function errorBody(response: Response): Promise<ErrorBody> {
  try {
    const data: { error?: ErrorBody } | null = await response.json();
    return data?.error ?? {};
  } catch {
    return {}; // not JSON (an Nginx error page, a timeout)
  }
}
