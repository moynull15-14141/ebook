// Property-based Test: হাজার হাজার Seed-যুক্ত এলোমেলো ইনপুটে একটি সাধারণ নিয়ম।
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAmount, formatAmount } from '../src/money.mjs';
import { feeFor, MAX_AMOUNT } from '../src/fees.mjs';

function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test('format তারপর parse: আগের মান ফেরত (Round-trip)', () => {
  const random = createRandom(22);
  for (let i = 0; i < 5_000; i += 1) {
    const minor = 1 + Math.floor(random() * MAX_AMOUNT);
    const text = formatAmount(minor, 'BDT').replace(' BDT', '');
    assert.equal(parseAmount(text), minor, text);
  }
});

test('Fee কখনো কমে না: বড় পরিমাণে Fee সমান বা বেশি', () => {
  let previous = 0;
  for (let minor = 1; minor <= MAX_AMOUNT; minor += 997) {
    const fee = feeFor(minor);
    assert.ok(fee >= previous, `${minor} পয়সায় Fee ${fee} < ${previous}`);
    previous = fee;
  }
});

test('Fee সব সময় 1% (পয়সায় পূর্ণ) থেকে 50 টাকা বা 2%-এর মধ্যে', () => {
  const random = createRandom(7);
  for (let i = 0; i < 5_000; i += 1) {
    const minor = 1 + Math.floor(random() * MAX_AMOUNT);
    const fee = feeFor(minor);
    assert.ok(fee >= Math.floor(minor / 100), `${minor}: ${fee}`);
    const ceiling = Math.max(5_000, Math.ceil(minor * 0.02));
    assert.ok(fee <= ceiling, `${minor}: ${fee}`);
  }
});
