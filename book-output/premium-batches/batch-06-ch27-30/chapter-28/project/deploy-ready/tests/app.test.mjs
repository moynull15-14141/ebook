import test from 'node:test';
import assert from 'node:assert/strict';
import { start, call, json, TOKEN } from './helpers.mjs';

test('Health, Version ও Request ID', async (t) => {
  const app = await start();
  t.after(() => app.shutdown('test'));
  assert.deepEqual((await call(app.base, '/health/live')).body,
    { status: 'live' });
  assert.equal((await call(app.base, '/health/ready')).status, 200);
  const version = await call(app.base, '/version');
  assert.deepEqual(version.body, { version: '1.2.3', commit: 'abc1234' });
  assert.match(version.headers.get('x-request-id'), /^[0-9a-f-]{36}$/);
  const echoed = await call(app.base, '/version',
    { headers: { 'x-request-id': 'trace-12345678' } });
  assert.equal(echoed.headers.get('x-request-id'), 'trace-12345678');
  const unsafe = await call(app.base, '/version',
    { headers: { 'x-request-id': 'bad id\twith tab' } });
  assert.notEqual(unsafe.headers.get('x-request-id'), 'bad id\twith tab');
});

test('Job তৈরি: অনুমতি, Content-Type, JSON, আকার ও যাচাই', async (t) => {
  const app = await start();
  t.after(() => app.shutdown('test'));
  const post = (opts) => call(app.base, '/api/jobs', { method: 'POST',
    ...opts });
  const good = json({ title: 'হোটেল Booking যাচাই', priority: 'high' });
  assert.equal((await post(good)).status, 401);
  assert.equal((await post({ ...good, token: 'wrong' })).status, 401);
  assert.equal((await post({ body: 'x', token: TOKEN })).status, 415);
  assert.equal((await post({ ...json(1), body: '{', token: TOKEN })).status,
    400);
  const huge = json({ title: 'x'.repeat(9000) });
  assert.equal((await post({ ...huge, token: TOKEN })).status, 413);
  const invalid = await post({ ...json({ title: 'ab', priority: 'urgent' }),
    token: TOKEN });
  assert.equal(invalid.status, 422);
  assert.equal(invalid.body.error.details.length, 2);
  const created = await post({ ...good, token: TOKEN });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.status, 'open');
  const list = await call(app.base, '/api/jobs');
  assert.deepEqual(list.body.data.map((job) => job.id), [1]);
});

test('Metrics: Token প্রয়োজন; Route-এর নাম Label-এ, আসল Path নয়', async (t) => {
  const app = await start();
  t.after(() => app.shutdown('test'));
  await call(app.base, '/api/jobs');
  await call(app.base, '/random/path/12345');
  assert.equal((await call(app.base, '/metrics')).status, 401);
  const { body, headers } = await call(app.base, '/metrics', { token: TOKEN });
  assert.match(headers.get('content-type'), /^text\/plain; version=0\.0\.4/);
  assert.match(body,
    /http_requests_total\{method="GET",route="\/api\/jobs",status="200"\} 1/);
  assert.match(body, /route="unmatched",status="404"\} 1/);
  assert.doesNotMatch(body, /12345/);
  assert.match(body, /^http_in_flight_requests 1$/m);
});

test('অপ্রত্যাশিত Error: Client পায় Request ID, Stack যায় Log-এ', async (t) => {
  const broken = { list: async () => { throw new Error('db exploded'); },
    ping: async () => true };
  const app = await start({ store: broken });
  t.after(() => app.shutdown('test'));
  const res = await call(app.base, '/api/jobs');
  assert.equal(res.status, 500);
  assert.equal(res.body.error.message, 'Server-এ সমস্যা');
  assert.doesNotMatch(JSON.stringify(res.body), /exploded/);
  const logged = app.lines.find((l) => l.event === 'http.unhandled');
  assert.equal(logged.requestId, res.body.error.requestId);
  assert.match(logged.stack, /db exploded/);
  const access = app.lines.find((l) => l.event === 'http.request'
    && l.status === 500);
  assert.equal(access.route, '/api/jobs');
});

test('Readiness: Dependency সাড়া না দিলে 503, Liveness তবু 200', async (t) => {
  const hanging = { list: async () => [], ping: () => new Promise(() => {}) };
  const app = await start({ store: hanging });
  t.after(() => app.shutdown('test'));
  const ready = await call(app.base, '/health/ready');
  assert.deepEqual([ready.status, ready.body],
    [503, { status: 'dependency-unavailable' }]);
  assert.equal((await call(app.base, '/health/live')).status, 200);
});
