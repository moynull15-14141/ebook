// যাচাই ও রূপান্তরের Test; প্রতিটি ইনপুট Deep Freeze করা, তাই কোনো Mutation সঙ্গে সঙ্গে ধরা পড়ে।
// চালানোর Command (Project Folder থেকে):  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { deepFreeze } from '../src/immutable.mjs';
import { validateOrder } from '../src/validate.mjs';
import {
  indexBy, flattenOrders, joinLines, pivotRegionMonth, topCustomers, applyRefund, totalOf,
} from '../src/transform.mjs';

const PRODUCTS = deepFreeze([{ sku: 'B1', price: 120 }, { sku: 'B3', price: 900 }]);
const CUSTOMERS = deepFreeze([
  { id: 'C1', name: 'সারা', region: 'Dhaka' },
  { id: 'C2', name: 'অনিক', region: 'Dhaka' },
  { id: 'C3', name: 'রফিক', region: 'Bogura' },
]);
const raw = (overrides = {}) => ({ id: 'O1', customer: 'C1', date: '2026-01-05', items: [{ sku: 'B1', qty: 2 }], ...overrides });
const orders = () => deepFreeze([
  validateOrder(raw()).value,
  validateOrder(raw({ id: 'O2', customer: 'C3', date: '2026-02-01', items: [{ sku: 'B3', qty: 1 }, { sku: 'B1', qty: 3 }] })).value,
]);

test('validateOrder: বৈধ Order পরিষ্কার, প্রতিটি পণ্যে refunded 0', () => {
  const result = validateOrder(deepFreeze(raw({ id: ' O9 ', customer: ' C1 ' })));
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, { id: 'O9', customer: 'C1', date: '2026-01-05', items: [{ sku: 'B1', qty: 2, refunded: 0 }] });
});

test('validateOrder: প্রতিটি ব্যর্থতার নিজস্ব কারণ', () => {
  const cases = [
    [raw({ id: '' }), 'Order ID নেই'],
    [raw({ customer: ' ' }), 'O1: গ্রাহক নেই'],
    [raw({ date: '2026-13-01' }), 'O1: তারিখ YYYY-MM-DD নয়'],
    [raw({ date: '2026-02-30x' }), 'O1: তারিখ YYYY-MM-DD নয়'],
    [raw({ items: [] }), 'O1: কোনো পণ্য নেই'],
    [raw({ items: [{ sku: 'B1', qty: 0 }] }), 'O1: পণ্যের তথ্য ভুল'],
    [raw({ items: [{ sku: 'B1', qty: 1.5 }] }), 'O1: পণ্যের তথ্য ভুল'],
    [null, 'Order ID নেই'],
  ];
  for (const [input, error] of cases) {
    assert.deepEqual(validateOrder(input), { ok: false, error }, JSON.stringify(input));
  }
});

test('indexBy: Key থেকে সারি', () => {
  assert.equal(indexBy(PRODUCTS, 'sku').get('B3').price, 900);
  assert.equal(indexBy(PRODUCTS, 'sku').size, 2);
});

test('flattenOrders: প্রতিটি পণ্য একটি সারি, মাস ও নিট পরিমাণসহ', () => {
  const lines = flattenOrders(orders());
  assert.equal(lines.length, 3);
  assert.deepEqual(lines[1], { order: 'O2', customer: 'C3', month: '2026-02', sku: 'B3', qty: 1 });
});

test('joinLines: অঞ্চল, নাম, টাকা যোগ; অচেনা পণ্য ও গ্রাহক আলাদা তালিকায়', () => {
  const lines = deepFreeze([
    ...flattenOrders(orders()),
    { order: 'O7', customer: 'C1', month: '2026-01', sku: 'B9', qty: 1 },
    { order: 'O8', customer: 'C9', month: '2026-01', sku: 'B1', qty: 1 },
  ]);
  const { joined, unmatched } = joinLines(lines, PRODUCTS, CUSTOMERS);
  assert.equal(joined.length, 3);
  assert.deepEqual(unmatched, ['O7:B9', 'O8:C9']);
  assert.equal(joined[0].amount, 240);
  assert.equal(joined[0].region, 'Dhaka');
});

test('pivotRegionMonth: অঞ্চল × মাস, মাস ক্রমে; Invariant: ঘরের যোগফল = মোট', () => {
  const { joined } = joinLines(flattenOrders(orders()), PRODUCTS, CUSTOMERS);
  const pivot = pivotRegionMonth(joined);
  assert.deepEqual(pivot, { Dhaka: { '2026-01': 240 }, Bogura: { '2026-02': 1260 } });
  const cells = Object.values(pivot).flatMap((months) => Object.values(months));
  assert.equal(cells.reduce((a, b) => a + b, 0), totalOf(joined));
});

test('pivotRegionMonth: মাসগুলো ইনপুটের ক্রম নির্বিশেষে সাজানো', () => {
  const rows = deepFreeze([
    { region: 'R', month: '2026-03', amount: 1 },
    { region: 'R', month: '2026-01', amount: 2 },
  ]);
  assert.deepEqual(Object.keys(pivotRegionMonth(rows).R), ['2026-01', '2026-03']);
});

test('topCustomers: মোট বেশি আগে; সমান হলে বাংলা নামের ক্রমে; সংখ্যা সীমিত', () => {
  const rows = deepFreeze([
    { customerName: 'সারা', amount: 500 },
    { customerName: 'অনিক', amount: 500 },
    { customerName: 'রফিক', amount: 900 },
    { customerName: 'সারা', amount: 0 },
  ]);
  assert.deepEqual(topCustomers(rows).map((c) => c.name), ['রফিক', 'অনিক', 'সারা']);
  assert.equal(topCustomers(rows, 1).length, 1);
});

test('applyRefund: শুধু সেই Order নতুন; অন্য Order ও পণ্য একই Object; মূল অক্ষত', () => {
  const before = orders();
  const after = applyRefund(before, { orderId: 'O2', sku: 'B1', qty: 2 });
  assert.equal(after[1].items[1].refunded, 2);
  assert.equal(before[1].items[1].refunded, 0);
  assert.equal(after[0], before[0]);
  assert.equal(after[1].items[0], before[1].items[0]);
  assert.equal(flattenOrders(after).find((l) => l.order === 'O2' && l.sku === 'B1').qty, 1);
});

test('applyRefund: ধাপে ধাপে ফেরত জমে; বিক্রির বেশি নয়', () => {
  const once = applyRefund(orders(), { orderId: 'O2', sku: 'B1', qty: 2 });
  const twice = applyRefund(once, { orderId: 'O2', sku: 'B1', qty: 1 });
  assert.equal(twice[1].items[1].refunded, 3);
  assert.throws(() => applyRefund(twice, { orderId: 'O2', sku: 'B1', qty: 1 }), /ফেরত 1টি সম্ভব নয়; বিক্রি 3, আগে ফেরত 3/);
});

test('applyRefund: অচেনা Order বা পণ্য, শূন্য বা দশমিক পরিমাণ বাতিল', () => {
  assert.throws(() => applyRefund(orders(), { orderId: 'X', sku: 'B1', qty: 1 }), /X\/B1 পাওয়া যায়নি/);
  assert.throws(() => applyRefund(orders(), { orderId: 'O1', sku: 'B3', qty: 1 }), RangeError);
  assert.throws(() => applyRefund(orders(), { orderId: 'O1', sku: 'B1', qty: 0 }), RangeError);
  assert.throws(() => applyRefund(orders(), { orderId: 'O1', sku: 'B1', qty: 1.5 }), RangeError);
});

test('পুরো Pipeline একই ইনপুটে একই ফল (Referential Transparency)', () => {
  const run = () => pivotRegionMonth(joinLines(flattenOrders(orders()), PRODUCTS, CUSTOMERS).joined);
  assert.deepEqual(run(), run());
});
