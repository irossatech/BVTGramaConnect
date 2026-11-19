// A random id (UUID v4) for one new post, sent as `client_ref` (backend docs/api-contract.md, section 1,
// "Sending again after a lost answer"). The same id goes with every Save of the same form, so when an answer is
// lost on the network and the Super Admin saves again, the server returns the first post instead of making a
// second one. A new form gets a new id. The app does the same (BVTGramaConnect_Mobile, ComposeForm.clientRef).
export function newClientRef(): string {
  const c = globalThis.crypto;
  if (typeof c.randomUUID === 'function') return c.randomUUID();
  // randomUUID exists only on HTTPS and localhost; getRandomValues works on any page.
  const b = c.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // RFC 4122 variant
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
