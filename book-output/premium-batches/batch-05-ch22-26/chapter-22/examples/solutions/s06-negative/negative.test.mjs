import test from 'node:test';
import assert from 'node:assert/strict';
import { formatAmount } from './format.mjs';

test('ধনাত্মক পরিমাণ', () => {
  assert.equal(formatAmount(123456, 'BDT'), '1,234.56 BDT');
});

test('ঋণাত্মক পরিমাণ (ফেরত টাকা)', () => {
  assert.equal(formatAmount(-250, 'USD'), '-2.50 USD');
});
