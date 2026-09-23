// Checks for functions/api/contact.js (no dependencies). Run: node scripts/test-contact.mjs
// The function carries real leads, so these cover the paths where a bug would lose one
// or let junk through. Formspree is mocked — nothing is sent anywhere.
import assert from 'node:assert/strict';
import { onRequestPost, onRequest } from '../functions/api/contact.js';

const ORIGIN = 'https://qualiber.ai';
const realFetch = globalThis.fetch;
let calls;
const mockFetch = (impl) => { calls = []; globalThis.fetch = async (url, init) => { calls.push({ url, init }); return impl(url, init); }; };
const ok = () => new Response('{"ok":true}', { status: 200 });

const post = (fields, { origin = ORIGIN, headers = {}, env = {} } = {}) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  const h = { ...headers }; if (origin !== null) h.Origin = origin;
  return onRequestPost({ request: new Request(`${ORIGIN}/api/contact`, { method: 'POST', body: fd, headers: h }), env });
};
const good = { name: 'Ada Lovelace', email: 'ada@example.com', company: 'Analytical Engines', message: 'Hello' };
const body = async (r) => r.json();
const forwardedFields = () => Object.fromEntries(calls[0].init.body.entries());

const tests = {
  async 'valid submission is forwarded to Formspree and answers ok'() {
    mockFetch(ok);
    const r = await post(good);
    assert.equal(r.status, 200); assert.deepEqual(await body(r), { ok: true });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://formspree.io/f/xeeykpae');
    assert.deepEqual(forwardedFields(), good);
  },
  async 'only known fields are forwarded (client extras and the honeypot are dropped)'() {
    mockFetch(ok);
    await post({ ...good, _gotcha: '', _next: 'https://evil.example', _replyto: 'x@y.z', extra: 'zzz' });
    assert.deepEqual(Object.keys(forwardedFields()).sort(), ['company', 'email', 'message', 'name']);
  },
  async 'values are trimmed; empty optional fields are not sent'() {
    mockFetch(ok);
    await post({ name: '  Ada  ', email: ' ada@example.com ', company: '', message: '   ' });
    assert.deepEqual(forwardedFields(), { name: 'Ada', email: 'ada@example.com' });
  },
  async 'honeypot filled: answers ok but forwards nothing'() {
    mockFetch(ok);
    const r = await post({ ...good, _gotcha: 'http://spam' });
    assert.equal(r.status, 200); assert.deepEqual(await body(r), { ok: true }); assert.equal(calls.length, 0);
  },
  async 'missing name or invalid email is rejected, nothing forwarded'() {
    mockFetch(ok);
    for (const bad of [{ ...good, name: '' }, { ...good, name: '   ' }, { ...good, email: '' }, { ...good, email: 'not-an-email' }, { ...good, email: 'a@b' }, { ...good, email: 'a b@c.d' }]) {
      const r = await post(bad); assert.equal(r.status, 400, JSON.stringify(bad));
    }
    assert.equal(calls.length, 0);
  },
  async 'over-long fields are rejected'() {
    mockFetch(ok);
    assert.equal((await post({ ...good, name: 'x'.repeat(201) })).status, 400);
    assert.equal((await post({ ...good, message: 'x'.repeat(5001) })).status, 400);
    assert.equal((await post({ ...good, message: 'x'.repeat(5000) })).status, 200);
  },
  async 'oversized request is rejected before parsing'() {
    mockFetch(ok);
    const r = await post(good, { headers: { 'Content-Length': '50000' } });
    assert.equal(r.status, 413); assert.equal(calls.length, 0);
  },
  async 'cross-origin or origin-less posts are refused'() {
    mockFetch(ok);
    assert.equal((await post(good, { origin: 'https://evil.example' })).status, 403);
    assert.equal((await post(good, { origin: null })).status, 403);
    assert.equal((await post(good, { origin: 'https://www.qualiber.ai' })).status, 403);
    assert.equal(calls.length, 0);
  },
  async 'Formspree failure surfaces as 502 (never a false success)'() {
    mockFetch(() => new Response('nope', { status: 500 }));
    const r = await post(good); assert.equal(r.status, 502); assert.equal((await body(r)).ok, false);
    mockFetch(() => new Response('nope', { status: 422 }));
    assert.equal((await post(good)).status, 502);
  },
  async 'network error / timeout to Formspree surfaces as 502'() {
    mockFetch(() => { throw new TypeError('network down'); });
    assert.equal((await post(good)).status, 502);
    mockFetch(() => { const e = new Error('t'); e.name = 'TimeoutError'; throw e; });
    assert.equal((await post(good)).status, 502);
  },
  async 'server logs never contain submitted data'() {
    const seen = []; const orig = console.error; console.error = (...a) => seen.push(a.join(' '));
    try { mockFetch(() => new Response('x', { status: 500 })); await post(good); mockFetch(() => { throw new Error('boom ada@example.com'); }); await post(good); }
    finally { console.error = orig; }
    assert.ok(seen.length >= 2); assert.ok(!seen.join('\n').match(/ada@example|Ada|Lovelace|Analytical|Hello/), seen.join('\n'));
  },
  async 'FORMSPREE_ENDPOINT env overrides the default'() {
    mockFetch(ok); await post(good, { env: { FORMSPREE_ENDPOINT: 'http://127.0.0.1:1/f/test' } });
    assert.equal(calls[0].url, 'http://127.0.0.1:1/f/test');
  },
  async 'malformed body answers 400'() {
    mockFetch(ok);
    const r = await onRequestPost({ request: new Request(`${ORIGIN}/api/contact`, { method: 'POST', body: 'not form data', headers: { Origin: ORIGIN, 'Content-Type': 'multipart/form-data; boundary=x' } }), env: {} });
    assert.equal(r.status, 400); assert.equal(calls.length, 0);
  },
  async 'other methods answer 405 with Allow: POST'() {
    const r = await onRequest(); assert.equal(r.status, 405); assert.equal(r.headers.get('Allow'), 'POST');
  },
  async 'responses are JSON and uncacheable'() {
    mockFetch(ok); const r = await post(good);
    assert.match(r.headers.get('Content-Type'), /application\/json/); assert.equal(r.headers.get('Cache-Control'), 'no-store');
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { await fn(); console.log(`  ok   ${name}`); }
  catch (e) { failed++; console.log(`  FAIL ${name}\n       ${e.message.split('\n')[0]}`); }
}
globalThis.fetch = realFetch;
console.log(failed ? `\n${failed} failed` : `\nall ${Object.keys(tests).length} passed`);
process.exit(failed ? 1 : 0);
