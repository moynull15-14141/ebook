import test from 'node:test';
import assert from 'node:assert/strict';
import { http } from './helpers.mjs';

test('পুরো প্রবাহ: নিবন্ধন, Login, Booking, তালিকা, বাতিল', async (t) => {
  const app = await http();
  t.after(app.close);
  const token = await app.signUp('Rafi');
  const body = { packageId: 'CXB-3D', travelers: 2,
    idempotencyKey: 'web-flow-0001' };
  const created = await app.call('/api/bookings', { method: 'POST', token,
    body });
  assert.equal(created.status, 201);
  assert.equal(created.json.data.totalBdt, 19_600);
  const replay = await app.call('/api/bookings', { method: 'POST', token,
    body });
  assert.deepEqual([replay.status, replay.json.data.id],
    [200, created.json.data.id]);
  const list = await app.call('/api/bookings', { token });
  assert.equal(list.json.data.length, 1);
  const cancel = await app.call(
    `/api/bookings/${created.json.data.id}/cancel`, { method: 'PATCH', token });
  assert.equal(cancel.json.data.status, 'CANCELLED');
  const catalog = await app.call('/api/packages');
  assert.equal(catalog.json.data.find((p) => p.id === 'CXB-3D').seats, 20);
});

test('নিরাপত্তা: 401, অন্যের Booking 404, ভুল Input-এ সঠিক Status',
  async (t) => {
  const app = await http();
  t.after(app.close);
  assert.equal((await app.call('/api/bookings')).status, 401);
  const rafi = await app.signUp('Rafi');
  const mina = await app.signUp('Mina');
  const { json } = await app.call('/api/bookings', { method: 'POST',
    token: rafi, body: { packageId: 'BT-4D', travelers: 1,
      idempotencyKey: 'rafi-key-0001' } });
  const steal = await app.call(`/api/bookings/${json.data.id}/cancel`,
    { method: 'PATCH', token: mina });
  assert.equal(steal.status, 404);
  const post = (opts) => app.call('/api/bookings', { method: 'POST',
    token: rafi, ...opts });
  assert.equal((await post({ raw: '{bad json' })).status, 400);
  assert.equal((await post({ raw: '{}', type: 'text/plain' })).status, 415);
  assert.equal((await post({ raw: JSON.stringify({ x: 'y'.repeat(5000) }) }))
    .status, 413);
  const invalid = await post({ body: { packageId: 'BT-4D', travelers: 0 } });
  assert.equal(invalid.status, 400);
  assert.deepEqual(invalid.json.error.details,
    ['travelers: ১-১০ পূর্ণসংখ্যা', 'idempotencyKey']);
  assert.equal((await app.call('/api/nothing')).status, 404);
});

test('Error চুক্তি ও Header: Stack বা Password Response-এ নয়', async (t) => {
  const app = await http();
  t.after(app.close);
  app.service.listPackages = () => { throw new Error('disk on fire'); };
  const res = await app.call('/api/packages');
  assert.equal(res.status, 500);
  assert.deepEqual(res.json, { error: { code: 'INTERNAL',
    message: 'Server-এ সমস্যা' } });
  assert.match(app.logs[0].stack, /disk on fire/);
  const login = await app.call('/api/login', { method: 'POST',
    body: { email: 'x@example.com', password: 'secret-password' } });
  assert.doesNotMatch(login.text, /secret-password/);
  const page = await app.call('/');
  assert.match(page.headers.get('content-security-policy'),
    /script-src 'self'/);
  assert.equal(page.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(login.headers.get('cache-control'), 'no-store');
});
