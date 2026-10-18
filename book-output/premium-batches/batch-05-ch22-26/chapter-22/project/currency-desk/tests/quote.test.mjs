// Coverage যে ফাঁক দেখিয়েছিল তার Test: Quote-এর মেয়াদ, এবং খুব বড় পরিমাণ।
import test from 'node:test';
import assert from 'node:assert/strict';
import { createQuoteService } from '../src/quote.mjs';
import { parseAmount, MoneyError } from '../src/money.mjs';

test('Quote 60 সেকেন্ড বৈধ, তারপর নয় (নকল ঘড়ি)', async () => {
  let time = 1_000;
  const service = createQuoteService({
    rates: { getRate: async () => 121_450_000 },
    newId: () => 'Q-1',
    now: () => time,
  });
  const quote = await service.quote({ from: 'USD', to: 'BDT', amount: '10' });
  assert.equal(quote.expiresAt, 61_000);
  time = 60_999;
  assert.equal(service.isValid(quote), true);
  time = 61_000;
  assert.equal(service.isValid(quote), false);
});

test('অবৈধ পরিমাণে Rate Server-এ যাওয়াই হয় না', async () => {
  let calls = 0;
  const service = createQuoteService({
    rates: { getRate: async () => { calls += 1; return 1; } },
    newId: () => 'Q-1',
  });
  await assert.rejects(service.quote({ from: 'USD', to: 'BDT', amount: 'x' }),
    MoneyError);
  assert.equal(calls, 0);
});

test('Safe Integer-এর বাইরের পরিমাণে MoneyError', () => {
  assert.throws(() => parseAmount('99999999999999999'), /খুব বড়/);
});
