import test from 'node:test';
import assert from 'node:assert/strict';
import { serveJson } from '../src/services/http-util.mjs';
import { callJson, createBreaker, HttpError } from '../src/http-client.mjs';

async function flaky(responses) {
  let calls = 0;
  const server = await serveJson(() => {
    const next = responses[Math.min(calls, responses.length - 1)];
    calls += 1;
    return next;
  });
  return { ...server, calls: () => calls };
}

test('5xx-এ Retry, তারপর সফল', async (t) => {
  const svc = await flaky([[503, {}], [503, {}], [200, { ok: true }]]);
  t.after(svc.close);
  const result = await callJson(svc.url, { retries: 2, random: () => 0 });
  assert.deepEqual(result, { status: 200, ok: true });
  assert.equal(svc.calls(), 3);
});

test('4xx-এ Retry নয়; Retry শেষে শেষ Error', async (t) => {
  const bad = await flaky([[402, { error: 'DECLINED' }]]);
  const down = await flaky([[503, { error: 'UNAVAILABLE' }]]);
  t.after(async () => { await bad.close(); await down.close(); });
  await assert.rejects(callJson(bad.url, { retries: 3 }),
    (e) => e instanceof HttpError && e.status === 402 && !e.retryable);
  assert.equal(bad.calls(), 1);
  await assert.rejects(callJson(down.url, { retries: 2, random: () => 0 }),
    { status: 503 });
  assert.equal(down.calls(), 3);
});

test('Timeout: ধীর উত্তরের জন্য অনন্তকাল অপেক্ষা নয়', async (t) => {
  const slow = await serveJson(() => [200, {}, 300]);
  t.after(slow.close);
  const started = Date.now();
  await assert.rejects(callJson(slow.url, { timeoutMs: 50, retries: 0 }),
    { name: 'TimeoutError' });
  assert.ok(Date.now() - started < 250);
});

test('Circuit Breaker: closed, open, half-open, closed', async (t) => {
  let now = 0;
  const breaker = createBreaker({ failureThreshold: 2, resetMs: 1000,
    now: () => now });
  const svc = await flaky([[503, {}], [503, {}], [200, { ok: 1 }]]);
  t.after(svc.close);
  const call = () => callJson(svc.url, { retries: 0, breaker });
  await assert.rejects(call(), { status: 503 });
  await assert.rejects(call(), { status: 503 });
  assert.equal(breaker.state, 'open');
  await assert.rejects(call(), { code: 'CIRCUIT_OPEN' });
  assert.equal(svc.calls(), 2); // খোলা অবস্থায় Network-এ যায়ই না
  now = 1000;
  assert.equal(breaker.state, 'half-open');
  assert.deepEqual(await call(), { status: 200, ok: 1 });
  assert.equal(breaker.state, 'closed');
});
