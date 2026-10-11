import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { createApp } from '../src/app.mjs';

async function withServer(fn, options = {}) {
  const app = createApp(options);
  const server = createServer(app.handler).listen(0, '127.0.0.1');
  await once(server, 'listening');
  try { await fn(`http://127.0.0.1:${server.address().port}`, app); }
  finally { await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve())); }
}

test('liveness and readiness', async () => withServer(async base => {
  assert.equal((await fetch(base + '/health/live')).status, 200);
  assert.equal((await fetch(base + '/health/ready')).status, 200);
}));
test('create and list jobs', async () => withServer(async base => {
  const created = await fetch(base + '/api/jobs', { method: 'POST', body: JSON.stringify({ title: 'Review booking' }) });
  assert.equal(created.status, 201);
  assert.ok(created.headers.get('x-request-id'));
  const body = await created.json();
  assert.equal(body.job.status, 'queued');
  const list = await (await fetch(base + '/api/jobs')).json();
  assert.equal(list.jobs.length, 1);
}));
test('reject malformed JSON', async () => withServer(async base => {
  const r = await fetch(base + '/api/jobs', { method: 'POST', body: '{' });
  assert.equal(r.status, 400);
}));
test('reject invalid title', async () => withServer(async base => {
  const r = await fetch(base + '/api/jobs', { method: 'POST', body: JSON.stringify({ title: 'x' }) });
  assert.equal(r.status, 422);
}));
test('capacity limit', async () => withServer(async base => {
  const post = () => fetch(base + '/api/jobs', { method: 'POST', body: JSON.stringify({ title: 'Valid job' }) });
  assert.equal((await post()).status, 201);
  assert.equal((await post()).status, 429);
}, { maxItems: 1 }));
test('draining disables readiness and writes but keeps liveness', async () => withServer(async (base, app) => {
  app.drain();
  assert.equal((await fetch(base + '/health/ready')).status, 503);
  assert.equal((await fetch(base + '/health/live')).status, 200);
  assert.equal((await fetch(base + '/api/jobs')).status, 503);
}));
test('metrics counters and uptime', async () => withServer(async base => {
  await fetch(base + '/missing');
  const r = await fetch(base + '/metrics');
  const m = await r.json();
  assert.ok(m.requests >= 2);
  assert.ok(m.errors >= 1);
  assert.ok(m.uptimeMs >= 0);
}));
test('404 unknown endpoint', async () => withServer(async base => {
  assert.equal((await fetch(base + '/unknown')).status, 404);
}));
