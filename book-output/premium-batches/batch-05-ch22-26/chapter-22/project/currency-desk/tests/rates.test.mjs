// Test Double: mock.fn দিয়ে নকল fetch, নকল ঘড়ি, এবং mock.timers।
import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { createRateClient } from '../src/rates.mjs';

const reply = (status, body = {}) =>
  new Response(JSON.stringify(body), { status });
const ok = (rateMicro) => reply(200, { rateMicro });

test('Cache: TTL-এর মধ্যে দ্বিতীয় অনুরোধ Network-এ যায় না', async () => {
  let time = 0;
  const fetchFn = mock.fn(async () => ok(121_450_000));
  const rates = createRateClient(
    { baseUrl: 'http://x', fetchFn, now: () => time });
  await rates.getRate('USD', 'BDT');
  time = 59_999;
  await rates.getRate('USD', 'BDT');
  assert.equal(fetchFn.mock.callCount(), 1);
  time = 60_000;
  await rates.getRate('USD', 'BDT');
  assert.equal(fetchFn.mock.callCount(), 2);
  assert.equal(fetchFn.mock.calls[0].arguments[0], 'http://x/rates/USD-BDT');
});

test('Retry: 503 দুবার, তৃতীয়বার সফল; অপেক্ষা 100 ও 200 ms', async () => {
  const responses = [reply(503), reply(503), ok(8_234)];
  const fetchFn = mock.fn(async () => responses.shift());
  const sleep = mock.fn(async () => {});
  const rates = createRateClient({ baseUrl: 'http://x', fetchFn, sleep });
  assert.equal(await rates.getRate('BDT', 'USD'), 8_234);
  assert.deepEqual(sleep.mock.calls.map((c) => c.arguments[0]), [100, 200]);
});

test('Retry-যোগ্য নয় এমন Error (404) সঙ্গে সঙ্গে, একবারই', async () => {
  const fetchFn = mock.fn(async () => reply(404));
  const rates = createRateClient({ baseUrl: 'http://x', fetchFn });
  await assert.rejects(rates.getRate('USD', 'JPY'), { code: 'UNKNOWN_PAIR' });
  assert.equal(fetchFn.mock.callCount(), 1);
});

test('সব চেষ্টা ব্যর্থ: শেষ Error, cause-সহ', async () => {
  const fetchFn = mock.fn(async () => {
    throw new TypeError('fetch failed');
  });
  const rates = createRateClient(
    { baseUrl: 'http://x', fetchFn, sleep: async () => {} });
  await assert.rejects(rates.getRate('USD', 'BDT'), (error) => {
    assert.equal(error.code, 'NETWORK');
    assert.equal(error.cause.message, 'fetch failed');
    return true;
  });
  assert.equal(fetchFn.mock.callCount(), 3);
});

test('অবৈধ মুদ্রা ও অবৈধ হার', async () => {
  const fetchFn = mock.fn(async () => ok(-5));
  const rates = createRateClient({ baseUrl: 'http://x', fetchFn });
  await assert.rejects(rates.getRate('usd', 'BDT'), { code: 'BAD_CURRENCY' });
  await assert.rejects(rates.getRate('USD', 'USD'), { code: 'BAD_CURRENCY' });
  await assert.rejects(rates.getRate('USD', 'BDT'), { code: 'BAD_DATA' });
});

test('mock.timers: আসল setTimeout-এর অপেক্ষা ছাড়াই Default sleep', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const responses = [reply(500), ok(131_900_000)];
  const fetchFn = async () => responses.shift();
  const rates = createRateClient({ baseUrl: 'http://x', fetchFn });
  const pending = rates.getRate('EUR', 'BDT');
  await new Promise(setImmediate);
  t.mock.timers.tick(100);
  assert.equal(await pending, 131_900_000);
});
