// Dates for the Audit log's From / To fields (logic/audit.ts). The server shows the last 180 days by default and
// any older days when dates are sent (backend docs/api-contract.md, section 8; lead's decision of 2026-11-19).

/** A day as YYYY-MM-DD in the browser's local time (India for the Super Admins), `offset` days from today. */
export function isoDay(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
