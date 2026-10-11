// Invoice Calculator-এর Automated Test।  চালানোর Command (Project Folder থেকে):  node --test
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const loadScript = require('./load-script.js');

const { fn, get, printed } = loadScript(path.join(__dirname, '..', 'invoice.js'));
const { percentOf, calculateInvoice } = fn;
const formatTaka = get('formatTaka'), lineTotal = get('lineTotal');
const items = [
  { name: 'Notebook', pricePaisa: 12050, quantity: 3 },
  { name: 'Pen', pricePaisa: 1500, quantity: 10 },
  { name: 'School Bag', pricePaisa: 95000, quantity: 1 },
];
const same = (actual, expected) => assert.equal(JSON.stringify(actual), JSON.stringify(expected));

test('formatTaka: পয়সা থেকে দুই দশমিক ঘরের টাকা', () => {
  assert.equal(formatTaka(12050), '120.50 টাকা');
  assert.equal(formatTaka(100), '1.00 টাকা');
  assert.equal(formatTaka(5), '0.05 টাকা');
  assert.equal(formatTaka(0), '0.00 টাকা');
});
test('lineTotal: দাম x পরিমাণ', () => assert.equal(lineTotal({ pricePaisa: 12050, quantity: 3 }), 36150));
test('percentOf: সাধারণ শতাংশ', () => {
  assert.equal(percentOf(146150, 10), 14615);
  assert.equal(percentOf(1000, 0), 0);
  assert.equal(percentOf(1000, 100), 1000);
});
test('percentOf: নিকটতম পয়সায় আনে', () => {
  assert.equal(percentOf(131535, 5), 6577);
  assert.equal(percentOf(999, 10), 100);
  assert.equal(percentOf(994, 10), 99);
});
test('calculateInvoice: ছাড় ও করসহ', () => same(calculateInvoice(items, 10, 5), { subtotal: 146150, discount: 14615, tax: 6577, total: 138112 }));
test('calculateInvoice: Default Parameter-এ ছাড় ও কর শূন্য', () => same(calculateInvoice(items), { subtotal: 146150, discount: 0, tax: 0, total: 146150 }));
test('calculateInvoice: শুধু ছাড় দিলে কর শূন্য', () => same(calculateInvoice(items, 10), { subtotal: 146150, discount: 14615, tax: 0, total: 131535 }));
test('calculateInvoice: কর হিসাব হয় ছাড়ের পরের অঙ্কে', () => {
  const r = calculateInvoice([{ name: 'A', pricePaisa: 10000, quantity: 1 }], 10, 10);
  assert.equal(r.tax, 900);
  assert.equal(r.total, 9900);
});
test('calculateInvoice: ফাঁকা তালিকায় সব শূন্য', () => same(calculateInvoice([]), { subtotal: 0, discount: 0, tax: 0, total: 0 }));
test('calculateInvoice: undefined দিলে Default বসে', () => assert.equal(calculateInvoice(items, undefined, 5).discount, 0));
test('calculateInvoice: তালিকা বদলায় না (Pure)', () => {
  const before = JSON.stringify(items);
  calculateInvoice(items, 10, 5);
  assert.equal(JSON.stringify(items), before);
});
test('calculateInvoice: একই Argument-এ একই ফল', () => same(calculateInvoice(items, 10, 5), calculateInvoice(items, 10, 5)));
test('হিসাবের Function কিছু দেখায় না', () => {
  const count = printed.length;
  calculateInvoice(items, 10, 5); percentOf(100, 5); formatTaka(100);
  assert.equal(printed.length, count);
});
test('File চালালে সাতটি লাইন ও একটি Default-এর ফল দেখায়', () => {
  assert.equal(printed[0], 'Notebook x 3: 361.50 টাকা');
  assert.equal(printed[3], 'উপমোট: 1461.50 টাকা');
  assert.equal(printed[5], 'কর (5%): 65.77 টাকা');
  assert.equal(printed[6], 'সর্বমোট: 1381.12 টাকা');
  assert.equal(printed[7], '1461.50 টাকা');
});
