'use strict';
const assert = require('node:assert/strict');
const { calculateOrder } = require('./calculator');

assert.equal(calculateOrder({ price: 1500, quantity: 2 }).grandTotal, 3000);
assert.equal(calculateOrder({ price: 1500, quantity: 2, coupon: 'SAVE10' }).grandTotal, 2820);
assert.equal(calculateOrder({ price: 2500, quantity: 2, coupon: 'SAVE20', isMember: true }).grandTotal, 3800);
assert.equal(calculateOrder({ price: 1000, quantity: 1 }).grandTotal, 1120);
assert.throws(() => calculateOrder({ price: 1000, quantity: 1, coupon: 'SAVE20' }), /requires/);
assert.throws(() => calculateOrder({ price: -1, quantity: 1 }), /Price/);
assert.throws(() => calculateOrder({ price: 1, quantity: 0 }), /Quantity/);
assert.throws(() => calculateOrder({ price: 1, quantity: 1, coupon: 'UNKNOWN' }), /Unknown/);
console.log('8 tests passed');
