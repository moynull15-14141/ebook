// HTTP Integration Test: আসল Express App, আসল HTTP, এলোমেলো Port।
import test from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, newLead } from './helpers.mjs';

test('REST: তৈরি, পড়া, তালিকা, হালনাগাদ, মুছে ফেলা', async (t) => {
  const { call } = await startTestServer(t);
  const created = await call('POST', '/v1/leads',
    { as: 'rafi', body: newLead() });
  assert.equal(created.status, 201);
  assert.equal(created.headers.get('location'), '/v1/leads/L-00001');
  assert.equal(created.headers.get('etag'), '"v1"');
  assert.equal(created.body.assignee, 'rafi');

  const read = await call('GET', '/v1/leads/L-00001', { as: 'rafi' });
  assert.equal(read.body.status, 'new');
  const patched = await call('PATCH', '/v1/leads/L-00001',
    { as: 'rafi', body: { status: 'contacted' } });
  assert.equal(patched.body.version, 2);
  const status = async (method, as) =>
    (await call(method, '/v1/leads/L-00001', { as })).status;
  assert.equal(await status('DELETE', 'rafi'), 403);
  assert.equal(await status('DELETE', 'manager'), 204);
  assert.equal(await status('GET', 'manager'), 404);
});

test('Status Code ও একই আকারের Error Body', async (t) => {
  const { call } = await startTestServer(t);
  const post = (body) => call('POST', '/v1/leads', { as: 'mina', body });
  const cases = [
    [await call('GET', '/v1/leads'), 401, 'UNAUTHENTICATED'],
    [await post(newLead({ phone: '12' })), 400, 'VALIDATION_FAILED'],
    [await post('{"name":'), 400, 'INVALID_JSON'],
    [await post(newLead({ name: 'x'.repeat(20_000) })), 413, 'PAYLOAD_TOO_LARGE'],
    [await call('GET', '/v1/leads?limit=500', { as: 'mina' }),
      400, 'VALIDATION_FAILED'],
    [await call('GET', '/v1/nothing', { as: 'mina' }), 404, 'NOT_FOUND'],
  ];
  for (const [response, status, code] of cases) {
    assert.equal(response.status, status, code);
    assert.equal(response.body.error.code, code);
    assert.match(response.body.error.requestId, /^[\w-]+$/);
  }
  const invalid = cases[1][0].body.error.details.map((d) => d.field);
  assert.deepEqual(invalid, ['phone']);
});

test('Object-level Authorization: অন্য Agent-এর Lead দেখা যায় না', async (t) => {
  const { call } = await startTestServer(t);
  await call('POST', '/v1/leads', { as: 'rafi', body: newLead() });
  await call('POST', '/v1/leads',
    { as: 'manager', body: newLead({ name: 'Unassigned' }) });
  const other = await call('GET', '/v1/leads/L-00001', { as: 'mina' });
  assert.equal(other.status, 404);
  const minaList = await call('GET', '/v1/leads', { as: 'mina' });
  assert.deepEqual(minaList.body.items.map((l) => l.id), ['L-00002']);
  const assign = await call('PATCH', '/v1/leads/L-00002',
    { as: 'mina', body: { assignee: 'mina' } });
  assert.equal(assign.status, 403);
});

test('Cursor Pagination ও Filter', async (t) => {
  const { call } = await startTestServer(t);
  for (let i = 0; i < 5; i += 1) {
    await call('POST', '/v1/leads',
      { as: 'manager', body: newLead({ travelers: i + 1 }) });
  }
  await call('PATCH', '/v1/leads/L-00004',
    { as: 'manager', body: { status: 'lost' } });
  const first = await call('GET', '/v1/leads?limit=2', { as: 'manager' });
  assert.deepEqual(first.body.items.map((l) => l.id), ['L-00001', 'L-00002']);
  assert.equal(first.body.next, 'L-00002');
  const second = await call('GET', `/v1/leads?limit=2&after=${first.body.next}`,
    { as: 'manager' });
  assert.deepEqual(second.body.items.map((l) => l.id), ['L-00003', 'L-00004']);
  const lost = await call('GET', '/v1/leads?status=lost', { as: 'manager' });
  assert.deepEqual(lost.body.items.map((l) => l.id), ['L-00004']);
  assert.equal(lost.body.next, null);
});
