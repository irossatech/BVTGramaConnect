import assert from "node:assert/strict";
import { test } from "node:test";
import { isoDay, monthDays, monthOf } from "../src/console/auditDates.ts";

// The Audit log's Month field sends a month as its first and last day (backend contract section 8).
const TODAY = "2026-11-19";

test("a past month is its first and last day, leap years included", () => {
  assert.deepEqual(monthDays("2026-10", TODAY), ["2026-10-01", "2026-10-31"]);
  assert.deepEqual(monthDays("2025-02", TODAY), ["2025-02-01", "2025-02-28"]);
  assert.deepEqual(monthDays("2024-02", TODAY), ["2024-02-01", "2024-02-29"]);
  assert.deepEqual(monthDays("2026-04", TODAY), ["2026-04-01", "2026-04-30"]);
});

test("the current month ends today, where the date fields stop", () => {
  assert.deepEqual(monthDays("2026-11", TODAY), ["2026-11-01", "2026-11-19"]);
});

test("the Month field shows a month only when From / To are exactly that month", () => {
  assert.equal(monthOf("2026-10-01", "2026-10-31", TODAY), "2026-10");
  assert.equal(monthOf("2026-11-01", "2026-11-19", TODAY), "2026-11");
  assert.equal(monthOf("2026-10-02", "2026-10-31", TODAY), "");
  assert.equal(monthOf("2026-10-01", "2026-10-30", TODAY), "");
  assert.equal(monthOf("2026-09-01", "2026-10-31", TODAY), "");
  assert.equal(monthOf("", "", TODAY), "");
});

test("isoDay is YYYY-MM-DD", () => {
  assert.match(isoDay(0), /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(isoDay(-1) < isoDay(0));
});
