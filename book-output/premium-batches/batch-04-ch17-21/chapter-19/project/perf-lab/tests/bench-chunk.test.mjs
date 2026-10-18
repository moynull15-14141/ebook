// Harness ও টুকরোয় কাজের Test। সময় আসল ঘড়ি থেকে নয়, কৃত্রিম ঘড়ি থেকে,
// তাই ফল নিশ্চিত। Benchmark-এর গতি কখনো Pass/Fail শর্ত নয়।
// চালানোর Command (Project Folder থেকে):  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { summarize, bench, environment } from '../src/bench.mjs';
import { processInChunks } from '../src/chunk.mjs';

test('summarize: Median, p95, সর্বনিম্ন, সংখ্যা', () => {
  const stats = summarize([10, 11, 10, 12, 11, 10, 95, 11, 10, 12]);
  assert.deepEqual(stats, { median: 11, p95: 95, min: 10, runs: 10 });
});

test('bench: কৃত্রিম ঘড়িতে Warm-up বাদ দিয়ে পরিমাপ', () => {
  let time = 0;
  let calls = 0;
  const durations = [100, 100, 5, 1, 4, 2, 3, 9, 7, 6, 8, 10];
  const fn = () => {
    time += durations[calls];
    calls += 1;
    return calls;
  };
  const result = bench(fn, { warmup: 2, runs: 10, now: () => time });
  assert.equal(calls, 12);
  assert.equal(result.median, 6);
  assert.equal(result.p95, 10);
  assert.equal(result.min, 1);
  assert.equal(result.opsPerSec, 1000 / 6);
  assert.equal(result.sinkType, 'number');
});

test('environment: Node.js সংস্করণ ও Platform', () => {
  const env = environment();
  assert.equal(env.node, process.version);
  assert.match(env.date, /^\d{4}-\d{2}-\d{2}$/);
});

test('processInChunks: ফল ও ক্রম সাধারণ map-এর মতো', async () => {
  const items = Array.from({ length: 2500 }, (_, i) => i);
  const results = await processInChunks(items, (n) => n * n, {
    size: 1000,
    yieldFn: async () => {},
  });
  assert.deepEqual(results, items.map((n) => n * n));
});

test('processInChunks: টুকরো - 1 বার বিরতি; ফাঁকা তালিকায় কোনো বিরতি নেই', async () => {
  let pauses = 0;
  const yieldFn = async () => {
    pauses += 1;
  };
  await processInChunks(Array(2500).fill(1), (n) => n, { size: 1000, yieldFn });
  assert.equal(pauses, 2);
  pauses = 0;
  assert.deepEqual(await processInChunks([], (n) => n, { yieldFn }), []);
  assert.equal(pauses, 0);
});

test('processInChunks: অবৈধ size-এ RangeError', async () => {
  for (const size of [0, -5, 2.5]) {
    await assert.rejects(processInChunks([1], (n) => n, { size }), RangeError);
  }
});
