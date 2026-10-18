import test from 'node:test';
import assert from 'node:assert/strict';
import { formatAmount } from './format.mjs';

test('পয়সা থেকে হাজারের কমা ও দুই দশমিক', () => {
  assert.equal(formatAmount(123456, 'BDT'), '1,234.56 BDT');
  assert.equal(formatAmount(5, 'USD'), '0.05 USD');
});
