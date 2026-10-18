// Equivalence Partitioning: প্রতিটি শ্রেণি থেকে কয়েকটি প্রতিনিধি ইনপুট।
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAmount, formatAmount, convert, MoneyError,
} from '../src/money.mjs';

const valid = [
  ['0.01', 1], ['5', 500], ['5.5', 550], ['1,234.56', 123456],
  ['  250  ', 25000], ['1,000,000', 100000000],
];
const invalid = [
  '', 'abc', '-5', '1.234', '12,34', '1,2345', '.5', '1e3', null,
];

for (const [text, minor] of valid) {
  test(`বৈধ: ${JSON.stringify(text)} = ${minor} পয়সা`, () => {
    assert.equal(parseAmount(text), minor);
  });
}

test('অবৈধ শ্রেণি: প্রতিটিতে MoneyError', () => {
  for (const text of invalid) {
    assert.throws(() => parseAmount(text), MoneyError, String(text));
  }
});

test('formatAmount: হাজারের কমা, দুই দশমিক, ঋণাত্মক', () => {
  assert.equal(formatAmount(123456, 'BDT'), '1,234.56 BDT');
  assert.equal(formatAmount(5, 'USD'), '0.05 USD');
  assert.equal(formatAmount(-250, 'USD'), '-2.50 USD');
});

test('convert: BigInt-এ গুণ, অর্ধেক হলে ওপরে', () => {
  assert.equal(convert(10000, 121_450_000), 1214500);
  assert.equal(convert(1, 1_500_000), 2);
  assert.equal(convert(1, 1_499_999), 1);
  assert.equal(convert(9_000_000_000, 121_450_000), 1_093_050_000_000);
});
