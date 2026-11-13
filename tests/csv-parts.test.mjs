// `npm test`: the console's geography CSV splitter (src/console/csv-parts.ts). Node 22.18+ runs the .ts file as is.
import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeUtf8, fileLine, planParts } from "../src/console/csv-parts.ts";

const HEAD = "State,District,Mandal,Village\n";

test("an empty file and a header-only file are refused", () => {
  assert.deepEqual(planParts(""), { error: "The file is empty." });
  assert.deepEqual(planParts(HEAD), { error: "The file has a header but no villages." });
});

test("a file without the required columns names what is missing", () => {
  const plan = planParts("State,District,Name\nAP,Guntur,X\n");
  assert.ok("error" in plan);
  assert.match(plan.error, /missing mandal, village/);
  assert.match(plan.error, /it has: State, District, Name/);
});

test("header names are matched in lower case, with aliases", () => {
  const plan = planParts("STATE_NAME,District Name,mandal,Village Name\nAP,Guntur,Tenali,Kolakaluru\n");
  assert.ok(!("error" in plan));
  assert.equal(plan.rows, 1);
});

test("rows are counted per district and mandal, and blank lines are skipped", () => {
  const plan = planParts(HEAD + "AP,Guntur,Tenali,A\n\nAP,Guntur,Tenali,B\r\nAP,Guntur,Ponnur,C\nAP,Krishna,Gudivada,D\n");
  assert.ok(!("error" in plan));
  assert.equal(plan.rows, 4);
  assert.equal(plan.districts, 2);
  assert.equal(plan.mandals, 3);
  assert.equal(plan.parts.length, 1);
});

test("a mandal's villages stay in one part", () => {
  const rows = ["AP,G,M1,a", "AP,G,M2,b", "AP,G,M1,c", "AP,G,M2,d", "AP,G,M3,e"];
  const plan = planParts(HEAD + rows.join("\n") + "\n", 2);
  assert.ok(!("error" in plan));
  const villages = plan.parts.map((p) => p.text.trim().split("\n").slice(1).map((r) => r.split(",")[3]));
  assert.deepEqual(villages, [["a", "c"], ["b", "d"], ["e"]]);
  // Each part keeps the header and the original line numbers (header is line 1).
  for (const p of plan.parts) assert.ok(p.text.startsWith(HEAD));
  assert.deepEqual(plan.parts[0].lines, [2, 4]);
  assert.deepEqual(plan.parts[1].lines, [3, 5]);
});

test("a mandal bigger than a part is cut", () => {
  const plan = planParts(HEAD + ["a", "b", "c"].map((v) => "AP,G,M," + v).join("\n"), 2);
  assert.ok(!("error" in plan));
  assert.deepEqual(plan.parts.map((p) => p.lines), [[2, 3], [4]]);
});

test("quoted cells keep commas, quotes and newlines", () => {
  const plan = planParts(HEAD + 'AP,"Guntur, East",Tenali,"Say ""hi""\nthere"\nAP,"Guntur, East",Tenali,Next\n');
  assert.ok(!("error" in plan));
  assert.equal(plan.rows, 2);
  assert.equal(plan.mandals, 1);
  assert.deepEqual(plan.parts[0].lines, [2, 4]);
});

test("Telugu text survives decoding; a BOM is dropped; non-UTF-8 bytes give null", () => {
  const bytes = new TextEncoder().encode("﻿గ్రామం");
  assert.equal(decodeUtf8(bytes.buffer), "గ్రామం");
  assert.equal(decodeUtf8(new Uint8Array([0xff, 0xfe, 0xe9]).buffer), null);
});

test("server line numbers are mapped back to the user's file", () => {
  const part = { text: "", lines: [10, 12, 15] };
  assert.equal(fileLine("Line 3: unknown district", part), "Line 12: unknown district");
  assert.equal(fileLine("Line 9: out of range", part), "Line 9: out of range");
  assert.equal(fileLine("No line here", part), "No line here");
});
