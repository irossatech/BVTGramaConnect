// `npm test`: the citizen wallet on the website (BVTGC-141/142): the friend's code from an invite link, and the
// deletion page's login check.
import assert from "node:assert/strict";
import { test } from "node:test";
import { DELETE_PATH, REF_ALPHABET, friendCode, loginOk } from "../src/website/wallet.ts";

test("an invite link's code shows in capitals", () => {
  assert.equal(friendCode("?ref=K7QX2MPA"), "K7QX2MPA");
  assert.equal(friendCode("?ref=k7qx2mpa"), "K7QX2MPA");
  assert.equal(friendCode("?utm=x&ref=%20K7QX2MPA%20"), "K7QX2MPA");
});

test("anything that is not 8 characters of the code alphabet is ignored", () => {
  for (const bad of ["", "?ref=", "?ref=K7QX2MP", "?ref=K7QX2MPAA", "?ref=K7QX2MP0", "?ref=OIL12345", "?ref=invite", "?ref=<script>", "?other=K7QX2MPA"]) {
    assert.equal(friendCode(bad), null, bad);
  }
});

test("the alphabet leaves out the look-alikes", () => {
  for (const c of ["0", "O", "1", "I", "L"]) assert.equal(REF_ALPHABET.includes(c), false, c);
  assert.equal(REF_ALPHABET.length, 31);
});

test("the deletion page takes an email or a 10-digit mobile number", () => {
  for (const ok of ["lakshmi@gmail.com", " Lakshmi.Devi@Gmail.com ", "9876543210", "+91 98765 43210", "98765-43210", "09876543210"]) assert.equal(loginOk(ok), true, ok);
  for (const bad of ["", "lakshmi", "lakshmi@", "@gmail.com", "12345", "5876543210", "98765432101"]) assert.equal(loginOk(bad), false, bad);
});

test("the deletion page has the address given to Google Play", () => {
  assert.equal(DELETE_PATH, "/delete-account/");
});
