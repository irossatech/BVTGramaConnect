import assert from "node:assert/strict";
import { test } from "node:test";
import { isoDay } from "../src/console/auditDates.ts";

// The Audit log's From / To fields stop at today (isoDay(0)), in the form the server reads (YYYY-MM-DD).
test("isoDay is YYYY-MM-DD, and yesterday comes before today", () => {
  assert.match(isoDay(0), /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(isoDay(-1) < isoDay(0));
  assert.ok(isoDay(-400) < isoDay(-1), "dates far back still sort correctly");
});
