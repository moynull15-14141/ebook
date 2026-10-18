import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer, api } from './helpers.mjs';

test('Health, Static Page ও Auth', async (t) => {
  const app = await startServer();
  t.after(app.close);
  assert.deepEqual(await api(app.host, '/health'),
    { status: 200, body: { data: { status: 'ok' } } });
  const page = await fetch(`http://${app.host}/`);
  assert.match(await page.text(), /<title>TravelLive<\/title>/);
  const anonymous = await api(app.host, '/api/bookings/bk-1');
  assert.equal(anonymous.status, 401);
  assert.equal(anonymous.body.error.code, 'UNAUTHORIZED');
});

test('Booking API: তৈরি, অনুমতি, অবস্থা-বদল ও ভুল Input', async (t) => {
  const app = await startServer();
  t.after(app.close);
  const created = await api(app.host, '/api/bookings', { token: 'token-mina',
    method: 'POST', body: { title: 'Rangamati' } });
  assert.deepEqual(created, { status: 201, body: { data: {
    bookingId: 'bk-3', title: 'Rangamati', status: 'PENDING', sequence: 1 } } });
  const status = (token, s) => api(app.host, '/api/bookings/bk-3/status',
    { token, method: 'POST', body: { status: s } });
  assert.equal((await status('token-rafi', 'CANCELLED')).status, 403);
  assert.equal((await status('token-mina', 'CONFIRMED')).status, 403);
  assert.equal((await status('token-agent', 'CONFIRMED')).status, 200);
  assert.equal((await status('token-agent', 'PENDING')).status, 409);
  const bad = await api(app.host, '/api/bookings', { token: 'token-mina',
    method: 'POST', body: '{oops' });
  assert.equal(bad.status, 400);
  const huge = await api(app.host, '/api/bookings', { token: 'token-mina',
    method: 'POST', body: { title: 'x'.repeat(2000) } });
  assert.equal(huge.status, 413);
});

test('SSE: Last-Event-ID থেকে Replay, তারপর Live Event', async (t) => {
  const app = await startServer();
  t.after(app.close);
  app.hub.changeStatus('agent-1', 'bk-1', 'CONFIRMED');
  const controller = new AbortController();
  const res = await fetch(`http://${app.host}/api/bookings/bk-1/stream`, {
    headers: { Authorization: 'Bearer token-rafi', 'Last-Event-ID': '1' },
    signal: controller.signal });
  assert.equal(res.headers.get('content-type'),
    'text/event-stream; charset=utf-8');
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let text = '';
  while (!text.includes('id: 2')) text += (await reader.read()).value;
  app.hub.changeStatus('u-rafi', 'bk-1', 'CANCELLED');
  while (!text.includes('id: 3')) text += (await reader.read()).value;
  controller.abort();
  const ids = [...text.matchAll(/^id: (\d+)$/gm)].map((m) => Number(m[1]));
  assert.deepEqual(ids, [2, 3]);
  assert.match(text, /^retry: 3000$/m);
  const other = await fetch(`http://${app.host}/api/bookings/bk-1/stream`, {
    headers: { Authorization: 'Bearer token-mina' } });
  assert.equal(other.status, 403);
});
