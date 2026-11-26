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

/** What copyText() needs of the browser; tests pass small fakes. */
export type CopyNavigator = { clipboard?: { writeText(text: string): Promise<void> } };
export type CopyDocument = Pick<Document, "createElement" | "execCommand"> & { body: Pick<HTMLElement, "appendChild" | "removeChild"> | null };

/** Copies `text` and says whether it worked (BVTGC-163). Browsers give the clipboard to https pages only; on an http
 *  address (the qa server) it is missing, so the older way is tried: a hidden text box, selected and copied. False
 *  when neither works, so the page can tell the visitor to copy the code by hand instead of doing nothing. */
export async function copyText(text: string, nav: CopyNavigator | undefined, doc: CopyDocument | undefined): Promise<boolean> {
  try {
    if (nav?.clipboard?.writeText) {
      await nav.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* refused (no permission): try the older way */
  }
  if (!doc?.body) return false;
  try {
    const box = doc.createElement("textarea");
    box.value = text;
    box.setAttribute("readonly", "");
    box.style.position = "fixed";
    box.style.opacity = "0";
    doc.body.appendChild(box);
    box.select();
    const ok = doc.execCommand("copy");
    doc.body.removeChild(box);
    return ok;
  } catch {
    return false;
  }
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
