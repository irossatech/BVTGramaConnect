/** Day of the month and month index (0 = January) of an ISO time in India time, or null for a bad date. India time is
 *  always UTC+5:30 (no daylight saving), so plain arithmetic is exact: building an Intl.DateTimeFormat for every post
 *  cost about 100 ms of start-up on a slow phone (audit WEB-PERF-102, 2026-11-23). */
export function istDayMonth(iso: string): [number, number] | null {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return null;
  const ist = new Date(t + 330 * 60000);
  return [ist.getUTCDate(), ist.getUTCMonth()];
}
