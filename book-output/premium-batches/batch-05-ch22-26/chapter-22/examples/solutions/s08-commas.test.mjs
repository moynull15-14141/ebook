import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAmount, formatAmount }
  from '../../project/currency-desk/src/money.mjs';

test('কমা থাকুক বা না থাকুক, একই মান', () => {
  let seed = 8;
  for (let i = 0; i < 2_000; i += 1) {
    seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
    const minor = 1 + (seed % 50_000_000);
    const withCommas = formatAmount(minor, 'X').replace(' X', '');
    const plain = withCommas.replaceAll(',', '');
    assert.equal(parseAmount(plain), parseAmount(withCommas));
  }
});
