// The Citizens & wallet page's small rules and words (BVTGC-139/140; BackEnd docs/api-contract.md, section 21), kept
// apart from React so tests/wallet-console.test.mjs can check them with Node alone. Nothing here shows a full email or
// mobile number: the server never sends them (AccountRow carries the last 4 digits and a masked email).

/** A status pill: its words and colours, as the console's other pills. */
export interface Tone {
  label: string;
  bg: string;
  color: string;
}

/** An account's state in the list and the panel. */
export function accountTone(status: string): Tone {
  if (status === "blocked") return { label: "Blocked", bg: "#fde8e6", color: "#b3261e" };
  if (status === "deleted") return { label: "Deleted", bg: "#eef2f6", color: "#3b4a5c" };
  return { label: "Active", bg: "#e4f4df", color: "#1d7a33" };
}

/** A referral's state: waiting (Pending), confirmed, or not confirmed with its reason. */
export function referralTone(status: string): Tone {
  if (status === "CONFIRMED") return { label: "Confirmed", bg: "#e4f4df", color: "#1d7a33" };
  if (status === "REJECTED") return { label: "Not confirmed", bg: "#eef2f6", color: "#3b4a5c" };
  return { label: "Pending", bg: "#fff0dc", color: "#b35a0e" };
}

/** An entry's state. */
export function entryTone(status: string): Tone {
  if (status === "CONFIRMED") return { label: "Confirmed", bg: "#e4f4df", color: "#1d7a33" };
  if (status === "CANCELLED") return { label: "Cancelled", bg: "#eef2f6", color: "#3b4a5c" };
  return { label: "On hold", bg: "#fff0dc", color: "#b35a0e" };
}

const KINDS: Readonly<Record<string, string>> = { REFERRAL_REWARD: "Referral reward", WELCOME_BONUS: "Welcome bonus", ADJUSTMENT: "Adjustment" };

/** An entry's kind in words. */
export const entryKind = (kind: string): string => KINDS[kind] || kind;

/** Why a referral was not confirmed (reason_key), in short words; the entries carry the full sentence. */
const REASONS: Readonly<Record<string, string>> = {
  not_active: "not active",
  monthly_limit: "monthly limit",
  blocked: "an account blocked",
  deleted: "an account deleted",
  rejected: "by the Super Admin",
  same_phone: "same phone",
  welcome_limit: "welcome bonus limit",
  no_device: "phone not recognised",
};
export const reasonWords = (key: string | null | undefined): string => (key ? REASONS[key] || key.replace(/_/g, " ") : "");

/** Points with their sign: "+20", "−15" (a real minus sign), "0". */
export function signed(points: number): string {
  if (points > 0) return "+" + points;
  if (points < 0) return "−" + Math.abs(points);
  return "0";
}

/** The points typed in Adjust points: a whole number from 1 to 100,000 (the server's limit), else null. */
export function parsePoints(text: string): number | null {
  const t = (text || "").trim();
  if (!/^\d{1,6}$/.test(t)) return null;
  const n = Number(t);
  return n >= 1 && n <= 100000 ? n : null;
}

/** What "Find by mobile or email" sends: {email} when it holds an @, else {mobile} (the server drops +91, spaces and
 *  dashes); null when it is empty. The value goes in a POST body only, never a URL (contract section 21). */
export function findBody(text: string): { email: string } | { mobile: string } | null {
  const t = (text || "").trim();
  if (!t) return null;
  return t.includes("@") ? { email: t } : { mobile: t };
}

/** "l***@gmail.com · ••3210": how a row names its contact details, or "No number" when the Super Admin removed it. */
export function contactLine(emailHint: string, last4: string, missing: boolean): string {
  const mobile = missing ? "No number" : last4 ? "••" + last4 : "—";
  return [emailHint || "—", mobile].join(" · ");
}
