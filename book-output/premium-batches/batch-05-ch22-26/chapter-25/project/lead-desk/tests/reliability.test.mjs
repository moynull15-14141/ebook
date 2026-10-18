// Idempotency, Optimistic Concurrency, Rate Limit, Request ID ও Log।
import test from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, newLead } from './helpers.mjs';

test('Idempotency-Key: একই অনুরোধ দুবার, একটিই Lead', async (t) => {
  const { call } = await startTestServer(t);
  const headers = { 'idempotency-key': 'form-7f3a' };
  const send = () =>
    call('POST', '/v1/leads', { as: 'rafi', body: newLead(), headers });
  const first = await send();
  const retry = await send();
  assert.deepEqual([first.status, retry.status], [201, 200]);
  assert.equal(retry.body.id, first.body.id);
  const list = await call('GET', '/v1/leads', { as: 'rafi' });
  assert.equal(list.body.items.length, 1);
  const changed = await call('POST', '/v1/leads',
    { as: 'rafi', body: newLead({ travelers: 9 }), headers });
  assert.equal(changed.status, 409);
  assert.equal(changed.body.error.code, 'IDEMPOTENCY_MISMATCH');
});

test('If-Match: পুরোনো version দিয়ে হালনাগাদে 412', async (t) => {
  const { call } = await startTestServer(t);
  await call('POST', '/v1/leads', { as: 'rafi', body: newLead() });
  const first = await call('PATCH', '/v1/leads/L-00001',
    { as: 'rafi', body: { status: 'contacted' },
      headers: { 'if-match': '"v1"' } });
  assert.equal(first.status, 200);
  const stale = await call('PATCH', '/v1/leads/L-00001',
    { as: 'manager', body: { status: 'lost' },
      headers: { 'if-match': '"v1"' } });
  assert.equal(stale.status, 412);
  const invalid = await call('PATCH', '/v1/leads/L-00001',
    { as: 'rafi', body: { status: 'won' } });
  assert.equal(invalid.status, 409);
  assert.equal(invalid.body.error.code, 'INVALID_TRANSITION');
});

test('Rate Limit: সীমার পরে 429 ও Retry-After; অন্য ব্যবহারকারী আলাদা', async (t) => {
  const { call } = await startTestServer(t, { rateLimit: 3 });
  for (let i = 0; i < 3; i += 1) {
    assert.equal((await call('GET', '/v1/leads', { as: 'rafi' })).status, 200);
  }
  const limited = await call('GET', '/v1/leads', { as: 'rafi' });
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get('retry-after')) >= 1);
  assert.equal((await call('GET', '/v1/leads', { as: 'mina' })).status, 200);
});

test('Request ID Header-এ ও Log-এ; Log-এ Token নেই; Health Token ছাড়া', async (t) => {
  const { call, logs } = await startTestServer(t);
  const health = await call('GET', '/health',
    { headers: { 'x-request-id': 'trace-42' } });
  assert.equal(health.status, 200);
  assert.equal(health.headers.get('x-request-id'), 'trace-42');
  assert.equal(health.headers.get('x-powered-by'), null);
  await call('GET', '/v1/leads', { as: 'rafi' });
  await new Promise((resolve) => setImmediate(resolve));
  assert.ok(logs.some((e) => e.requestId === 'trace-42' && e.status === 200));
  assert.ok(logs.some((e) => e.user === 'rafi'));
  assert.doesNotMatch(JSON.stringify(logs), /token-for-tests/);
});
