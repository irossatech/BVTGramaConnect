// The citizen wallet on the website (BVTGC-141/142; BackEnd docs/features/citizen-wallet/, contract section 21):
// the friend's referral code from an invite link, and the "Delete my wallet account" page's address and login check.
// No React here, so tests/website-wallet.test.mjs checks it with Node alone.

/** The letters and digits a referral code is made of (BackEnd apps/citizens/services_account.py REFERRAL_ALPHABET):
 *  no 0, O, 1, I or L, which look alike. */
export const REF_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const REF = new RegExp("^[" + REF_ALPHABET + "]{8}$");

/** The friend's code in an invite link's query (`/app/?ref=K7QX2MPA` lands on `/?ref=K7QX2MPA#get-app`), in capitals;
 *  null when there is none or it is not 8 characters of the code alphabet. The page checks the shape only: it never
 *  asks the server whether a code exists (BackEnd design section 7.3). */
export function friendCode(search: string): string | null {
  let raw: string | null = null;
  try {
    raw = new URLSearchParams(search || "").get("ref");
  } catch {
    return null;
  }
  const code = (raw || "").trim().toUpperCase();
  return REF.test(code) ? code : null;
}

/** The "Delete my wallet account" page's address, given to Google Play and named in the privacy policy (BVTGC-142). */
export const DELETE_PATH = "/delete-account/";

/** What the deletion page may send as the login: an email, or a 10-digit Indian mobile number (spaces, dashes and a
 *  leading +91 or 0 dropped, as the server does). The server answers the same for every login either way. */
export function loginOk(text: string): boolean {
  const t = (text || "").trim();
  if (t.includes("@")) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
  let d = t.replace(/[\s-]/g, "");
  if (d.startsWith("+91")) d = d.slice(3);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d);
}
