// `npm test`: the website's post dates in India time (src/website/dates.ts) match what Intl gives for Asia/Kolkata,
// across midnight on both sides and around month and year ends.
import assert from "node:assert/strict";
import { test } from "node:test";
import { istDayMonth } from "../src/website/dates.ts";

const intl = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "numeric", timeZone: "Asia/Kolkata" });
const ref = (iso) => {
  const p = intl.formatToParts(new Date(iso));
  return [Number(p.find((x) => x.type === "day").value), Number(p.find((x) => x.type === "month").value) - 1];
};

test("India day and month match Intl for times around midnight, month and year ends", () => {
  const times = ["2026-11-20T10:00:00+05:30", "2026-01-31T18:29:59Z", "2026-01-31T18:30:00Z", "2026-12-31T18:30:00Z", "2024-02-28T20:00:00Z", "2026-11-23T00:00:00+05:30", "2026-11-22T23:59:59+05:30"];
  for (let t = Date.UTC(2026, 0, 1); t < Date.UTC(2027, 0, 1); t += 7 * 3600 * 1000 + 17 * 60000) times.push(new Date(t).toISOString());
  for (const iso of times) assert.deepEqual(istDayMonth(iso), ref(iso), iso);
});

test("a bad date gives null", () => {
  assert.equal(istDayMonth("not a date"), null);
});
