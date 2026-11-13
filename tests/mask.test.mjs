import assert from "node:assert/strict";
import { test } from "node:test";
import { maskMobile, mobileDigits } from "../src/console/mask.ts";

test("prefixes are removed: +91, 91, 0091 and a leading 0", () => {
  for (const raw of ["9876543210", "+919876543210", "+91 98765 43210", "+91-98765-43210", "91 9876543210",
    "919876543210", "0091 9876543210", "09876543210", "098765 43210", " (+91) 98765-43210 "]) {
    assert.equal(mobileDigits(raw), "9876543210", raw);
    assert.equal(maskMobile(raw), "+91 ******3210", raw);
  }
});

test("a 10-digit number that starts with 91 or 0 is not cut", () => {
  assert.equal(maskMobile("9100001234"), "+91 ******1234");
  assert.equal(maskMobile("0123456789"), "+91 ******6789");
});

test("never the full number, whatever the length", () => {
  assert.equal(maskMobile("98765432"), "****5432");
  assert.equal(maskMobile("987654321012345"), "***********2345");
  assert.equal(maskMobile("1234"), "****");
  assert.equal(maskMobile("12"), "****");
});

test("no digits gives an empty string, so the table falls back", () => {
  for (const raw of [null, undefined, "", "   ", "+", "abc"]) assert.equal(maskMobile(raw), "", String(raw));
});
