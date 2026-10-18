import test from 'node:test';
import assert from 'node:assert/strict';

function applyDiscount(priceMinor, percent) {
  if (!Number.isInteger(percent) || percent < 0 || percent > 50) {
    throw new RangeError('ছাড় ০ থেকে ৫০%');
  }
  return priceMinor - Math.round((priceMinor * percent) / 100);
}

const rows = [
  [10_000, 0, 10_000],
  [10_000, 10, 9_000],
  [999, 50, 499],
];

for (const [price, percent, expected] of rows) {
  test(`${price} পয়সায় ${percent}% ছাড়`, () => {
    // Arrange: টেবিলের সারি। Act:
    const result = applyDiscount(price, percent);
    // Assert:
    assert.equal(result, expected);
  });
}

test('৫০%-এর বেশি ছাড় প্রত্যাখ্যাত', () => {
  assert.throws(() => applyDiscount(10_000, 51), RangeError);
});
