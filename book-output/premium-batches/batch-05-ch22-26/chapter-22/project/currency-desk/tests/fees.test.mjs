// Boundary Value Analysis: প্রতিটি সীমার ঠিক নিচে, ঠিক ওপরে ও ঠিক সীমায়।
import test from 'node:test';
import assert from 'node:assert/strict';
import { feeFor, MAX_AMOUNT } from '../src/fees.mjs';

const cases = [
  ['সবচেয়ে ছোট বৈধ', 1, 5_000],
  ['প্রথম স্তরের শেষ (999.99)', 99_999, 5_000],
  ['দ্বিতীয় স্তরের শুরু (1,000.00)', 100_000, 5_000],
  ['1.5% যেখানে ন্যূনতমকে ছাড়ায় (3,333.34)', 333_334, 5_000],
  ['তার পরের পয়সা (3,333.67)', 333_367, 5_001],
  ['দ্বিতীয় স্তরের শেষ (9,999.99)', 999_999, 15_000],
  ['তৃতীয় স্তরের শুরু (10,000.00)', 1_000_000, 15_000],
  ['সর্বোচ্চ (500,000.00)', MAX_AMOUNT, 500_000],
];

for (const [name, minor, fee] of cases) {
  test(`Fee: ${name}`, () => {
    assert.equal(feeFor(minor), fee);
  });
}

test('সীমার বাইরে: 0, ঋণাত্মক, সর্বোচ্চের এক পয়সা বেশি, ভগ্নাংশ', () => {
  for (const minor of [0, -1, MAX_AMOUNT + 1, 1.5, Number.NaN]) {
    assert.throws(() => feeFor(minor), RangeError, String(minor));
  }
});
