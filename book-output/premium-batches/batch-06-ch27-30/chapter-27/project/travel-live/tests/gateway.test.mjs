// আসল WebSocket সংযোগ (localhost): Auth, অনুমতি, Replay, সীমা ও Heartbeat।
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import WebSocket from 'ws';
import { startServer, openClient, login, api, ORIGIN } from './helpers.mjs';

const ack = (id) => (m) => m.type === 'ack' && m.requestId === id;

test('Auth-এর পরে নিজের Booking-এ Subscribe এবং Live Event', async (t) => {
  const app = await startServer();
  t.after(app.close);
  const rafi = await login(app.host, 'token-rafi');
  rafi.send({ type: 'subscribe', bookingId: 'bk-1', requestId: 'a' });
  assert.deepEqual(await rafi.next(ack('a')),
    { type: 'ack', requestId: 'a', ok: true, mode: 'replay' });
  const created = await rafi.next((m) => m.type === 'event');
  assert.equal(created.event.type, 'booking.created');
  await api(app.host, '/api/bookings/bk-1/status', { token: 'token-agent',
    method: 'POST', body: { status: 'CONFIRMED' } });
  const live = await rafi.next((m) => m.event?.sequence === 2);
  assert.equal(live.event.payload.status, 'CONFIRMED');
  rafi.socket.close();
});

test('অন্যের Booking-এ Subscribe নিষেধ', async (t) => {
  const app = await startServer();
  t.after(app.close);
  const mina = await login(app.host, 'token-mina');
  mina.send({ type: 'subscribe', bookingId: 'bk-1', requestId: 'x' });
  assert.deepEqual(await mina.next(ack('x')),
    { type: 'ack', requestId: 'x', ok: false, code: 'FORBIDDEN' });
  assert.equal(app.hub.subscriberCount('bk-1'), 0);
  mina.socket.close();
});

test('Auth ছাড়া বা ভুল Token: Close Code 4401', async (t) => {
  const app = await startServer({ authTimeoutMs: 100 });
  t.after(app.close);
  const early = openClient(app.host);
  await early.opened;
  early.send({ type: 'subscribe', bookingId: 'bk-1' });
  assert.deepEqual(await early.closed, { code: 4401, reason: 'auth required' });
  const silent = openClient(app.host);
  assert.deepEqual(await silent.closed, { code: 4401, reason: 'auth timeout' });
  const wrong = openClient(app.host);
  await wrong.opened;
  wrong.send({ type: 'auth', token: 'guess' });
  assert.deepEqual(await wrong.closed, { code: 4401, reason: 'invalid token' });
});

test('পুনঃসংযোগে শুধু বাদ পড়া Event Replay হয়', async (t) => {
  const app = await startServer();
  t.after(app.close);
  app.hub.changeStatus('agent-1', 'bk-1', 'CONFIRMED');
  app.hub.changeStatus('agent-1', 'bk-1', 'CANCELLED');
  const rafi = await login(app.host, 'token-rafi');
  rafi.send({ type: 'subscribe', bookingId: 'bk-1', requestId: 'r',
    afterSequence: 1 });
  await rafi.next(ack('r'));
  await rafi.next((m) => m.event?.sequence === 3);
  const seqs = rafi.messages.filter((m) => m.type === 'event')
    .map((m) => m.event.sequence);
  assert.deepEqual(seqs, [2, 3]);
  rafi.socket.close();
});

test('অনুমতি বাতিল হলে Server নিজেই Unsubscribe করে', async (t) => {
  const app = await startServer();
  t.after(app.close);
  const rafi = await login(app.host, 'token-rafi');
  rafi.send({ type: 'subscribe', bookingId: 'bk-1', requestId: 'r' });
  await rafi.next(ack('r'));
  app.hub.revokeUser('u-rafi');
  assert.deepEqual(await rafi.next((m) => m.type === 'unsubscribed'),
    { type: 'unsubscribed', bookingId: 'bk-1', reason: 'FORBIDDEN' });
  rafi.socket.close();
});

test('অচেনা Origin-এর Upgrade: 403', async (t) => {
  const app = await startServer();
  t.after(app.close);
  const tryOrigin = (origin) => new Promise((resolve) => {
    const req = http.request(`http://${app.host}/live`, { headers: {
      Connection: 'Upgrade', Upgrade: 'websocket', Origin: origin,
      'Sec-WebSocket-Version': '13',
      'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==' } });
    req.on('upgrade', (res, socket) => { socket.destroy(); resolve(101); });
    req.on('response', (res) => resolve(res.statusCode));
    req.end();
  });
  assert.equal(await tryOrigin('https://evil.example'), 403);
  assert.equal(await tryOrigin(ORIGIN), 101);
  assert.equal(app.gateway.metrics.rejectedOrigins, 1);
});

test('বড় Message (1009), অবৈধ JSON ও Rate Limit (4429)', async (t) => {
  const app = await startServer();
  t.after(app.close);
  const big = await login(app.host, 'token-rafi');
  big.socket.send('x'.repeat(5000));
  assert.equal((await big.closed).code, 1009);
  assert.equal(app.gateway.metrics.protocolErrors, 1);
  const noisy = await login(app.host, 'token-rafi');
  noisy.socket.send('{not json');
  assert.equal((await noisy.next((m) => m.type === 'error')).code,
    'BAD_JSON');
  for (let i = 0; i < 40; i += 1) noisy.send({ type: 'ping' });
  assert.deepEqual(await noisy.closed, { code: 4429, reason: 'rate limit' });
});

test('Heartbeat: Pong না দেওয়া Client বিচ্ছিন্ন হয়', async (t) => {
  const app = await startServer({ heartbeatMs: 50 });
  t.after(app.close);
  const zombie = new WebSocket(`ws://${app.host}/live`);
  zombie.pong = () => {}; // মৃত Client-এর ভান: Ping-এর উত্তর দেয় না
  await new Promise((resolve) => zombie.once('open', resolve));
  const code = await new Promise((resolve) => zombie.once('close', resolve));
  assert.equal(code, 1006);
  while (app.gateway.metrics.connections > 0) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
});
