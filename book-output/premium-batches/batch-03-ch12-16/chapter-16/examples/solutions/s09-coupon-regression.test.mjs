import { test } from 'node:test';
import assert from 'node:assert/strict';

// সংশোধিত সংস্করণ: Coupon আগে থেকে থাকলে আবার প্রয়োগ হয় না।
function applyCoupon(order, code) {
  if (order.coupons.includes(code)) {
    return order;
  }
  const coupons = [...order.coupons, code];
  return { ...order, coupons, total: order.total - 100 };
}

test('Regression: একই Coupon দুবার প্রয়োগে ছাড় একবার', () => {
  const order = { total: 1000, coupons: [] };
  const twice = applyCoupon(applyCoupon(order, 'SAVE100'), 'SAVE100');
  assert.equal(twice.total, 900);
});
