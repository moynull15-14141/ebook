// Shopping Discount Calculator-এর Automated Test।  চালানোর Command (Project Folder থেকে):  node --test
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const loadScript = require('./load-script.js');

const { fn, printed } = loadScript(path.join(__dirname, '..', 'discount.js'));
const { toWholeNumber, getCouponPercent, calculateOrder } = fn;

test('toWholeNumber: সঠিক পূর্ণসংখ্যা গ্রহণ করে', () => {
  assert.equal(toWholeNumber('1500'), 1500);
  assert.equal(toWholeNumber('0'), 0);
});
test('toWholeNumber: আগে-পরের ফাঁকা জায়গা উপেক্ষা করে', () => assert.equal(toWholeNumber(' 25 '), 25));
test('toWholeNumber: ফাঁকা Text শূন্য নয়, null', () => {
  assert.equal(toWholeNumber(''), null);
  assert.equal(toWholeNumber('   '), null);
});
test('toWholeNumber: দশমিক ও সংখ্যা নয় এমন Text বাতিল', () => {
  assert.equal(toWholeNumber('2.5'), null);
  assert.equal(toWholeNumber('abc'), null);
});
test('toWholeNumber: ঋণাত্মক সংখ্যা বাতিল', () => assert.equal(toWholeNumber('-1'), null));
test('getCouponPercent: পরিচিত Code', () => {
  assert.equal(getCouponPercent(''), 0);
  assert.equal(getCouponPercent('SAVE10'), 10);
  assert.equal(getCouponPercent('SAVE20'), 20);
});
test('getCouponPercent: অচেনা Code-এ null', () => {
  assert.equal(getCouponPercent('FREE50'), null);
  assert.equal(getCouponPercent('save10'), null);
});
test('calculateOrder: SAVE10, সদস্য নয়', () => {
  assert.equal(calculateOrder('1500', '2', 'SAVE10', false), 'মোট 3000, ছাড় 300, Delivery 120, দিতে হবে 2820');
});
test('calculateOrder: Coupon-এর পর সদস্য-ছাড়', () => {
  assert.equal(calculateOrder('2500', '3', 'SAVE20', true), 'মোট 7500, ছাড় 1800, Delivery 0, দিতে হবে 5700');
});
test('calculateOrder: ছাড় নিকটতম পূর্ণ টাকায় আসে (42.5 থেকে 43)', () => {
  assert.equal(calculateOrder('850', '1', '', true), 'মোট 850, ছাড় 43, Delivery 120, দিতে হবে 927');
});
test('calculateOrder: Coupon-এ ছোট হাতের অক্ষর ও ফাঁকা জায়গা গৃহীত', () => {
  assert.equal(calculateOrder('1500', '2', '  save10 ', false), calculateOrder('1500', '2', 'SAVE10', false));
});
test('calculateOrder: SAVE20-এর ন্যূনতম সীমা (4999 ও 5000)', () => {
  assert.equal(calculateOrder('4999', '1', 'SAVE20', false), 'SAVE20-এর জন্য কমপক্ষে 5000 টাকার কেনাকাটা প্রয়োজন।');
  assert.equal(calculateOrder('5000', '1', 'SAVE20', false), 'মোট 5000, ছাড় 1000, Delivery 0, দিতে হবে 4000');
});
test('calculateOrder: ফ্রি Delivery-র সীমা (2999 ও 3000)', () => {
  assert.equal(calculateOrder('2999', '1', '', false), 'মোট 2999, ছাড় 0, Delivery 120, দিতে হবে 3119');
  assert.equal(calculateOrder('3000', '1', '', false), 'মোট 3000, ছাড় 0, Delivery 0, দিতে হবে 3000');
});
test('calculateOrder: পরিমাণ ১–১০০-এর বাইরে বা ভুল হলে বার্তা', () => {
  for (const q of ['0', '101', '2.5', '', 'abc']) assert.equal(calculateOrder('100', q, '', false), 'পরিমাণ ১ থেকে ১০০-এর মধ্যে হতে হবে।');
  assert.match(calculateOrder('100', '100', '', false), /^মোট 10000,/);
});
test('calculateOrder: ভুল দাম ও অচেনা Coupon-এ বার্তা', () => {
  assert.equal(calculateOrder('', '1', '', false), 'দাম সঠিক নয়।');
  assert.equal(calculateOrder('-5', '1', '', false), 'দাম সঠিক নয়।');
  assert.equal(calculateOrder('1200', '2', 'FREE50', false), 'Coupon Code সঠিক নয়।');
});
test('File চালালে ছয়টি উদাহরণের ফল দেখায়', () => {
  assert.equal(printed.length, 6);
  assert.equal(printed[1], 'মোট 7500, ছাড় 1800, Delivery 0, দিতে হবে 5700');
  assert.equal(printed[5], 'Coupon Code সঠিক নয়।');
});
