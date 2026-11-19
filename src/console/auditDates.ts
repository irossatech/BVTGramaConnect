// Dates for the Audit log's Month and From / To fields (logic/audit.ts). The server shows the last 180 days by
// default and any older days when dates are sent (backend docs/api-contract.md, section 8; lead's decision of
// 2026-11-19); a month goes as its first and last day.

/** A day as YYYY-MM-DD in the browser's local time (India for the Super Admins), `offset` days from today. */
export function isoDay(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/** A month ('YYYY-MM') as its first and last day; the current month ends `today` (the date fields stop there). */
export function monthDays(month: string, today: string = isoDay(0)): [string, string] {
  const [y, m] = month.split('-').map(Number);
  const last = new Date(y, m, 0).getDate(); // day 0 of the next month = the last day of this one
  const to = month + '-' + String(last).padStart(2, '0');
  return [month + '-01', to < today ? to : today];
}

/** The month that From / To make up exactly (as monthDays gives it), else '': the Month field shows it. */
export function monthOf(from: string, to: string, today: string = isoDay(0)): string {
  if (!from || !to || from.slice(0, 7) !== to.slice(0, 7) || !from.endsWith('-01')) return '';
  return to === monthDays(from.slice(0, 7), today)[1] ? from.slice(0, 7) : '';
}
