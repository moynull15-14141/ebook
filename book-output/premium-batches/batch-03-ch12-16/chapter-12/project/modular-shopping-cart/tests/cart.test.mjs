// কার্টের নিয়মের (Domain) Test।  চালানোর Command (Project Folder থেকে):  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS, findProduct } from '../src/catalog.mjs';
import { formatTaka } from '../src/money.mjs';
import {
  emptyCart, addItem, setQuantity, removeItem, applyCoupon, cartLines, cartTotals,
  CartError, isCoupon, MAX_QUANTITY, DELIVERY_FEE, FREE_DELIVERY_FROM,
} from '../src/cart.mjs';

const isCartError = (message) => (error) => error instanceof CartError && error.name === 'CartError' && (!message || error.message === message);

test('catalog: চারটি পণ্য, অপরিবর্তনীয়; findProduct অচেনা id-তে null', () => {
  assert.equal(PRODUCTS.length, 4);
  assert.ok(Object.isFrozen(PRODUCTS) && PRODUCTS.every(Object.isFrozen));
  assert.equal(findProduct('backpack').price, 1850);
  assert.equal(findProduct('laptop'), null);
  assert.equal(findProduct(undefined), null);
});

test('formatTaka: হাজারের কমা', () => {
  assert.equal(formatTaka(1941), '1,941 টাকা');
  assert.equal(formatTaka(0), '0 টাকা');
});

test('emptyCart: প্রতিবার নতুন Object', () => {
  assert.deepEqual(emptyCart(), { items: [], coupon: null });
  assert.notEqual(emptyCart(), emptyCart());
});

test('addItem: নতুন পণ্য শেষে যোগ হয়; মূল কার্ট অপরিবর্তিত', () => {
  const start = emptyCart();
  const next = addItem(addItem(start, 'notebook'), 'pen-set', 2);
  assert.deepEqual(next.items, [{ id: 'notebook', quantity: 1 }, { id: 'pen-set', quantity: 2 }]);
  assert.deepEqual(start.items, []);
});

test('addItem: একই পণ্য আবার যোগ করলে পরিমাণ বাড়ে, ক্রম একই থাকে', () => {
  let cart = addItem(addItem(emptyCart(), 'notebook'), 'backpack');
  cart = addItem(cart, 'notebook', 3);
  assert.deepEqual(cart.items, [{ id: 'notebook', quantity: 4 }, { id: 'backpack', quantity: 1 }]);
});

test('addItem: সীমা পার হলে CartError, অচেনা পণ্যেও', () => {
  const nine = addItem(emptyCart(), 'notebook', 9);
  assert.equal(addItem(nine, 'notebook').items[0].quantity, 10);
  assert.throws(() => addItem(addItem(nine, 'notebook'), 'notebook'), isCartError(`পরিমাণ 0 থেকে ${MAX_QUANTITY}-এর মধ্যে পূর্ণসংখ্যা হতে হবে।`));
  assert.throws(() => addItem(emptyCart(), 'laptop'), isCartError('অজানা পণ্য: laptop'));
});

test('setQuantity: দশমিক, ঋণাত্মক, NaN, 11 বাতিল', () => {
  for (const bad of [1.5, -1, NaN, 11, '2']) {
    assert.throws(() => setQuantity(emptyCart(), 'notebook', bad), isCartError(), String(bad));
  }
});

test('setQuantity ও removeItem: 0 মানে সরানো; অন্য সারি অপরিবর্তিত', () => {
  const cart = addItem(addItem(emptyCart(), 'notebook', 2), 'calculator');
  assert.deepEqual(setQuantity(cart, 'notebook', 0).items, [{ id: 'calculator', quantity: 1 }]);
  assert.deepEqual(removeItem(cart, 'calculator').items, [{ id: 'notebook', quantity: 2 }]);
  assert.equal(setQuantity(cart, 'calculator', 5).items[0], cart.items[0]);
});

test('applyCoupon: বড়-ছোট হাতের অক্ষর ও ফাঁকা জায়গা নির্বিশেষে', () => {
  assert.equal(applyCoupon(emptyCart(), ' student10 ').coupon, 'STUDENT10');
  assert.equal(applyCoupon(emptyCart(), 'eid15').coupon, 'EID15');
});

test('applyCoupon: ভুল Coupon এবং উত্তরাধিকারসূত্রে পাওয়া Key বাতিল', () => {
  assert.throws(() => applyCoupon(emptyCart(), 'FREE100'), isCartError('Coupon "FREE100" সঠিক নয়।'));
  assert.throws(() => applyCoupon(emptyCart(), 'toString'), isCartError());
  assert.throws(() => applyCoupon(emptyCart(), '__proto__'), isCartError());
  assert.equal(isCoupon('TOSTRING'), false);
  assert.equal(isCoupon(null), false);
});

test('cartLines: নাম, দাম ও সারির মোট', () => {
  const lines = cartLines(addItem(emptyCart(), 'pen-set', 3));
  assert.deepEqual(lines, [{ id: 'pen-set', name: 'Pen Set', price: 250, quantity: 3, lineTotal: 750 }]);
});

test('cartTotals: ফাঁকা কার্টে সব শূন্য, Delivery-ও নেই', () => {
  assert.deepEqual(cartTotals(emptyCart()), { subtotal: 0, discount: 0, delivery: 0, total: 0 });
});

test('cartTotals: ছোট Order-এ Delivery যোগ হয়', () => {
  assert.deepEqual(cartTotals(addItem(emptyCart(), 'notebook', 2)), { subtotal: 240, discount: 0, delivery: DELIVERY_FEE, total: 300 });
});

test('cartTotals: 2000-এর ওপরে (2090) Delivery বিনামূল্যে, নিচে (1970) নয়', () => {
  const at2090 = addItem(addItem(emptyCart(), 'backpack'), 'notebook', 2);
  assert.equal(cartTotals(at2090).delivery, 0);
  const at1970 = addItem(addItem(emptyCart(), 'backpack'), 'notebook');
  assert.equal(cartTotals(at1970).delivery, DELIVERY_FEE);
  assert.equal(FREE_DELIVERY_FROM, 2000);
});

test('cartTotals: ঠিক 2000 টাকার সীমা (Pen Set 8টি)', () => {
  assert.equal(cartTotals(addItem(emptyCart(), 'pen-set', 8)).delivery, 0);
});

test('cartTotals: ছাড়ের পরের মূল্য দিয়ে Delivery ঠিক হয় (অধ্যায়ের উদাহরণ)', () => {
  const cart = applyCoupon(addItem(addItem(emptyCart(), 'notebook', 2), 'backpack'), 'STUDENT10');
  assert.deepEqual(cartTotals(cart), { subtotal: 2090, discount: 209, delivery: 60, total: 1941 });
});

test('cartTotals: ছাড় নিকটতম টাকায় রাউন্ড হয়', () => {
  const cart = applyCoupon(addItem(emptyCart(), 'notebook', 1), 'EID15');
  assert.equal(cartTotals(cart).discount, 18);
});

test('cartTotals: অচেনা Coupon-এ ছাড় শূন্য (সংরক্ষিত পুরোনো তথ্যের নিরাপত্তা)', () => {
  const cart = { items: [{ id: 'notebook', quantity: 1 }], coupon: 'OLD50' };
  assert.equal(cartTotals(cart).discount, 0);
});
