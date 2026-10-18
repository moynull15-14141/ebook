// বিক্রির নিয়ম ও Report-এর Test।  চালানোর Command (Project Folder থেকে):  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SaleError, validateSale, withTotal, inCategory, atLeast, sumBy,
  partitionValid, totalsByCategory, topSales, salesReport,
} from '../src/sales.mjs';
import { formatTaka, formatterFor } from '../src/format.mjs';
import { SALES } from '../data/sales.mjs';

// গভীরভাবে Freeze: কোনো Function ইনপুট বদলানোর চেষ্টা করলে Strict Mode-এ TypeError।
const deepFreeze = (rows) => Object.freeze(rows.map((row) => Object.freeze({ ...row })));
const good = { id: 'A1', category: 'Books', quantity: 2, unitPrice: 300 };

test('validateSale: বৈধ সারি trim করা, অপরিবর্তনীয় নতুন Object', () => {
  const input = { ...good, id: ' A1 ', category: ' Books ' };
  const sale = validateSale(input);
  assert.deepEqual(sale, good);
  assert.notEqual(sale, input);
  assert.ok(Object.isFrozen(sale));
});

test('validateSale: প্রতিটি নিয়মের নিজস্ব বার্তা', () => {
  const cases = [
    [{ ...good, id: '' }, 'id নেই'],
    [{ ...good, category: '  ' }, 'বিভাগ নেই'],
    [{ ...good, quantity: 0 }, 'পরিমাণ 1 বা বেশি পূর্ণসংখ্যা হতে হবে'],
    [{ ...good, quantity: 1.5 }, 'পরিমাণ 1 বা বেশি পূর্ণসংখ্যা হতে হবে'],
    [{ ...good, unitPrice: -1 }, 'দাম অঋণাত্মক সংখ্যা হতে হবে'],
    [{ ...good, unitPrice: '300' }, 'দাম অঋণাত্মক সংখ্যা হতে হবে'],
    [null, 'id নেই'],
  ];
  for (const [row, message] of cases) {
    assert.throws(() => validateSale(row), (e) => e instanceof SaleError && e.message === message, JSON.stringify(row));
  }
  assert.doesNotThrow(() => validateSale({ ...good, unitPrice: 0 }));
});

test('withTotal ও Curried সাহায্যকারী', () => {
  const sale = withTotal(validateSale(good));
  assert.equal(sale.total, 600);
  assert.equal(inCategory('Books')(sale), true);
  assert.equal(inCategory('Books', sale), true);
  assert.equal(atLeast(601)(sale), false);
  assert.equal(sumBy('total')([sale, sale]), 1200);
});

test('partitionValid: বৈধ ও বাদ আলাদা; সারির নম্বর 1 থেকে; ইনপুট অপরিবর্তিত', () => {
  const frozen = deepFreeze(SALES);
  const { valid, rejected } = partitionValid(frozen);
  assert.equal(valid.length, 6);
  assert.deepEqual(rejected, ['সারি 6: পরিমাণ 1 বা বেশি পূর্ণসংখ্যা হতে হবে', 'সারি 7: বিভাগ নেই']);
  assert.equal(frozen[6].category, ' ');
});

test('partitionValid: অপ্রত্যাশিত ত্রুটি চাপা পড়ে না', () => {
  const evil = { get id() { throw new TypeError('Bug'); } };
  assert.throws(() => partitionValid([evil]), TypeError);
});

test('totalsByCategory: বেশি আয় আগে; সমান আয়ে নাম ধরে', () => {
  const sales = [
    withTotal(validateSale({ id: '1', category: 'B', quantity: 1, unitPrice: 100 })),
    withTotal(validateSale({ id: '2', category: 'A', quantity: 1, unitPrice: 100 })),
    withTotal(validateSale({ id: '3', category: 'C', quantity: 2, unitPrice: 100 })),
  ];
  assert.deepEqual(totalsByCategory(sales).map((row) => row.category), ['C', 'A', 'B']);
});

test('topSales: Currying দুভাবেই একই; সমান মোটে ID ধরে; ইনপুট অপরিবর্তিত', () => {
  const { valid } = partitionValid(SALES);
  const frozen = Object.freeze([...valid]);
  assert.deepEqual(topSales(2)(frozen).map((s) => s.id), ['S2', 'S5']);
  assert.deepEqual(topSales(2, frozen), topSales(2)(frozen));
  assert.deepEqual(topSales(10, frozen).length, 6);
});

test('salesReport: নমুনা তথ্যের সম্পূর্ণ Report (অধ্যায়ের Output)', () => {
  const report = salesReport(deepFreeze(SALES));
  assert.equal(report.revenue, 7400);
  assert.deepEqual(report.byCategory, [
    { category: 'Electronics', count: 2, revenue: 4700 },
    { category: 'Books', count: 2, revenue: 1970 },
    { category: 'Stationery', count: 2, revenue: 730 },
  ]);
  assert.deepEqual(report.top, ['S2', 'S5', 'S1']);
  assert.equal(report.rejected.length, 2);
});

test('salesReport: ফাঁকা তালিকায় শূন্য ও ফাঁকা অংশ', () => {
  assert.deepEqual(salesReport([]), { revenue: 0, byCategory: [], top: [], rejected: [] });
});

test('salesReport: একই ইনপুটে একই ফল (Pure)', () => {
  assert.deepEqual(salesReport(SALES), salesReport(SALES));
});

test('format: দশমিক অনুযায়ী Formatter একবারই তৈরি (Memoization)', () => {
  assert.equal(formatTaka(7400), '7,400 টাকা');
  assert.equal(formatTaka(1234.5, 2), '1,234.50 টাকা');
  const sizeBefore = formatterFor.cacheSize();
  formatTaka(1);
  formatTaka(2, 2);
  assert.equal(formatterFor.cacheSize(), sizeBefore);
  assert.equal(formatterFor(0), formatterFor(0));
});

test('নমুনা তথ্য Report চালানোর পরও অপরিবর্তিত', () => {
  const before = JSON.stringify(SALES);
  salesReport(SALES);
  partitionValid(SALES);
  assert.equal(JSON.stringify(SALES), before);
});
