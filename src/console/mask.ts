// Masking for console tables (audit WEB-DP-001): a list shows only the last 4 digits of a mobile number;
// the full number is in the panel that opens from the row ("View"). The backend masks the same way in the
// audit log ("******3210").

/** The digits of an Indian mobile number without its country or trunk prefix: "+91 98765 43210",
 *  "91-9876543210", "0091 9876543210" and "098765 43210" all give "9876543210". Other lengths are kept. */
export function mobileDigits(raw: string | null | undefined): string {
  let d = String(raw ?? "").replace(/\D/g, "");
  if (d.length === 14 && d.startsWith("0091")) d = d.slice(4);
  else if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}

/** A mobile number for a table: "+91 ******4644". Empty when there are no digits, so the caller can fall back.
 *  A number that is not 10 digits after the prefix is removed (unexpected, old data) still shows only its last 4
 *  digits, without "+91"; one of 4 digits or fewer shows none. */
export function maskMobile(raw: string | null | undefined): string {
  const d = mobileDigits(raw);
  if (!d) return "";
  if (d.length === 10) return "+91 ******" + d.slice(-4);
  return d.length <= 4 ? "****" : "*".repeat(d.length - 4) + d.slice(-4);
}
