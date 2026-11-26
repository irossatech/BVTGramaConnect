import assert from "node:assert/strict";
import { test } from "node:test";
import { accountTone, contactLine, entryKind, entryTone, findBody, mandalPickLabel, parsePoints, reasonWords, referralTone, signed, tooPersonalToSearch } from "../src/console/walletText.ts";

test("a full number or email is never searched in a web address (BVTGC-161)", () => {
  for (const personal of ["9876543210", "+91 98765 43210", "98765-43210", "09876543210", "lakshmi@gmail.com", "@gmail", "ravi 9876543210"]) {
    assert.equal(tooPersonalToSearch(personal), true, personal);
  }
  for (const fine of ["", "Ravi", "రవి కుమార్", "3210", "K7QX2MPA", "K7QX2345", "987654321"]) {
    assert.equal(tooPersonalToSearch(fine), false, fine);
  }
});

test("the pilot picker names a mandal in English and Telugu, so its search finds either (BVTGC-162)", () => {
  assert.equal(mandalPickLabel("Tenali", "తెనాలి", "Guntur"), "Tenali (తెనాలి) · Guntur");
  assert.equal(mandalPickLabel("Tenali", "", "Guntur"), "Tenali · Guntur");
  assert.equal(mandalPickLabel("Tenali", "Tenali", "Guntur"), "Tenali · Guntur");
  assert.ok(mandalPickLabel("Tenali", "తెనాలి", "Guntur").includes("తెనా"));
});

// Citizens & wallet (BVTGC-139/140): the small rules behind the page, without React.

test("Adjust points takes whole points from 1 to 100,000 only (the server's limit)", () => {
  assert.equal(parsePoints("30"), 30);
  assert.equal(parsePoints(" 100000 "), 100000);
  for (const bad of ["", "0", "-5", "2.5", "100001", "1e3", "abc", "1 000"]) assert.equal(parsePoints(bad), null, bad);
});

test("Find sends an email when it holds an @, else a mobile number, and nothing when empty", () => {
  assert.deepEqual(findBody(" Lakshmi.Devi@gmail.com "), {email: "Lakshmi.Devi@gmail.com"});
  assert.deepEqual(findBody("+91 98765 43210"), {mobile: "+91 98765 43210"});
  assert.equal(findBody("   "), null);
});

test("a row names the masked email and the last 4 digits, never more", () => {
  assert.equal(contactLine("l***@gmail.com", "3210", false), "l***@gmail.com · ••3210");
  assert.equal(contactLine("l***@gmail.com", "", true), "l***@gmail.com · No number");
  assert.equal(contactLine("", "", false), "— · —");
});

test("points carry their sign with a real minus", () => {
  assert.equal(signed(20), "+20");
  assert.equal(signed(-15), "−15");
  assert.equal(signed(0), "0");
});

test("states, kinds and reasons read as words", () => {
  assert.equal(accountTone("active").label, "Active");
  assert.equal(accountTone("blocked").label, "Blocked");
  assert.equal(accountTone("deleted").label, "Deleted");
  assert.equal(referralTone("PENDING").label, "Pending");
  assert.equal(referralTone("REJECTED").label, "Not confirmed");
  assert.equal(entryTone("HELD").label, "On hold");
  assert.equal(entryKind("WELCOME_BONUS"), "Welcome bonus");
  assert.equal(entryKind("SOMETHING_NEW"), "SOMETHING_NEW");
  assert.equal(reasonWords("not_active"), "not active");
  assert.equal(reasonWords("a_new_reason"), "a new reason");
  assert.equal(reasonWords(null), "");
});
