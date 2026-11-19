import assert from "node:assert/strict";
import { test } from "node:test";
import { newClientRef } from "../src/console/clientRef.ts";

const UUID4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test("a new post's client_ref is a UUID v4, as the server expects", () => {
  assert.match(newClientRef(), UUID4);
});

test("every new form gets its own id", () => {
  const ids = new Set(Array.from({ length: 500 }, newClientRef));
  assert.equal(ids.size, 500);
});

test("without randomUUID (a plain-HTTP page) the getRandomValues fallback still makes a UUID v4", () => {
  Object.defineProperty(globalThis.crypto, "randomUUID", { value: undefined, configurable: true });
  try {
    for (let i = 0; i < 100; i++) assert.match(newClientRef(), UUID4);
  } finally {
    delete globalThis.crypto.randomUUID; // the prototype's randomUUID shows through again
  }
  assert.equal(typeof globalThis.crypto.randomUUID, "function");
});
