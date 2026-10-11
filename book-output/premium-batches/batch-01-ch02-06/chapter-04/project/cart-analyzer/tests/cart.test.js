// Cart Analyzer-এর Automated Test।  চালানোর Command (Project Folder থেকে):  node --test
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const loadScript = require('./load-script.js');

const { fn, printed } = loadScript(path.join(__dirname, '..', 'cart.js'));
const { isValidItem, analyzeCart, printReport } = fn;
const sample = [
  { name: 'Notebook', price: 120, quantity: 3 },
  { name: 'Pen', price: 15, quantity: 10 },
  { name: 'School Bag', price: 950, quantity: 1 },
  { name: 'Calculator', price: 650, quantity: 0 },
  { name: 'Water Bottle', price: 280, quantity: 2 },
];

test('isValidItem: সঠিক পণ্য গ্রহণ করে', () => assert.equal(isValidItem({ name: 'Pen', price: 15, quantity: 10 }), true));
test('isValidItem: শূন্য দাম বৈধ', () => assert.equal(isValidItem({ name: 'Gift', price: 0, quantity: 1 }), true));
test('isValidItem: ফাঁকা নাম বাতিল', () => assert.equal(isValidItem({ name: '   ', price: 15, quantity: 1 }), false));
test('isValidItem: ঋণাত্মক বা দশমিক দাম বাতিল', () => {
  assert.equal(isValidItem({ name: 'Pen', price: -1, quantity: 1 }), false);
  assert.equal(isValidItem({ name: 'Pen', price: 15.5, quantity: 1 }), false);
});
test('isValidItem: পরিমাণের সীমা ১ থেকে ১০০', () => {
  assert.equal(isValidItem({ name: 'Pen', price: 15, quantity: 1 }), true);
  assert.equal(isValidItem({ name: 'Pen', price: 15, quantity: 100 }), true);
  assert.equal(isValidItem({ name: 'Pen', price: 15, quantity: 0 }), false);
  assert.equal(isValidItem({ name: 'Pen', price: 15, quantity: 101 }), false);
  assert.equal(isValidItem({ name: 'Pen', price: 15, quantity: 2.5 }), false);
});
test('analyzeCart: মোট টাকা ও পরিমাণ', () => {
  const s = analyzeCart(sample, 500);
  assert.equal(s.total, 2020);
  assert.equal(s.units, 16);
});
test('analyzeCart: অগ্রহণযোগ্য পণ্য গোনে কিন্তু হিসাবে ধরে না', () => assert.equal(analyzeCart(sample, 500).skipped, 1));
test('analyzeCart: সবচেয়ে বড় অঙ্কের পণ্য', () => {
  const s = analyzeCart(sample, 500);
  assert.equal(s.highestName, 'School Bag');
  assert.equal(s.highestAmount, 950);
});
test('analyzeCart: সীমার সমান বা বেশি অঙ্কের নাম, কমা দিয়ে', () => assert.equal(analyzeCart(sample, 500).bigItems, 'School Bag, Water Bottle'));
test('analyzeCart: সীমার ঠিক সমান অঙ্কও ধরা হয়', () => {
  assert.equal(analyzeCart(sample, 950).bigItems, 'School Bag');
  assert.equal(analyzeCart(sample, 951).bigItems, '');
});
test('analyzeCart: ফাঁকা Cart-এ শূন্য, কোনো Error নয়', () => {
  const s = analyzeCart([], 500);
  assert.equal(JSON.stringify(s), JSON.stringify({ total: 0, units: 0, skipped: 0, highestName: '', highestAmount: 0, bigItems: '' }));
});
test('analyzeCart: সমান অঙ্কে প্রথম পণ্যটি থাকে', () => {
  const s = analyzeCart([{ name: 'A', price: 100, quantity: 2 }, { name: 'B', price: 200, quantity: 1 }], 0);
  assert.equal(s.highestName, 'A');
});
test('analyzeCart: সব পণ্য অগ্রহণযোগ্য হলে', () => {
  const s = analyzeCart([{ name: '', price: 10, quantity: 1 }, { name: 'X', price: 10, quantity: 0 }], 0);
  assert.equal(s.total, 0);
  assert.equal(s.skipped, 2);
});
test('analyzeCart: মূল Array বদলায় না', () => {
  const before = JSON.stringify(sample);
  analyzeCart(sample, 500);
  assert.equal(JSON.stringify(sample), before);
});
test('File চালালে পাঁচটি লাইন ও চারটি সারসংক্ষেপ দেখায়', () => {
  assert.equal(printed.length, 9);
  assert.equal(printed[0], '1. Notebook: 120 x 3 = 360');
  assert.equal(printed[5], 'মোট: 2020 টাকা, পরিমাণ: 16');
  assert.equal(printed[8], 'বাদ পড়েছে: 1টি');
  assert.equal(typeof printReport, 'function');
});
