// localStorage Adapter-এর Test; Browser ছাড়া, একটি নকল Storage দিয়ে।  চালানোর Command:  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { createCartStore } from '../src/storage.mjs';
import { addItem, applyCoupon, emptyCart } from '../src/cart.mjs';

// Map-ভিত্তিক নকল Storage: localStorage-এর মতো সব কিছু লেখা হিসেবে রাখে।
function fakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  };
}

test('save তারপর load: একই কার্ট ফিরে আসে, নির্দিষ্ট Key-তে', () => {
  const storage = fakeStorage();
  const store = createCartStore(storage);
  const cart = applyCoupon(addItem(emptyCart(), 'calculator', 2), 'EID15');
  assert.equal(store.save(cart), true);
  assert.ok(storage.data.has('jsm-ch12-cart'));
  assert.deepEqual(store.load(), cart);
});

test('কিছু সংরক্ষিত না থাকলে ফাঁকা কার্ট', () => {
  assert.deepEqual(createCartStore(fakeStorage()).load(), emptyCart());
});

test('ভাঙা JSON বা ভুল গঠনে ফাঁকা কার্ট', () => {
  for (const raw of ['{oops', '[]', '42', '{"items":"x","coupon":null}', 'null']) {
    assert.deepEqual(createCartStore(fakeStorage({ 'jsm-ch12-cart': raw })).load(), emptyCart(), raw);
  }
});

test('অচেনা পণ্য, ভুল পরিমাণ বা অচেনা Coupon থাকলে পুরো সংরক্ষিত কার্ট বাতিল', () => {
  const bad = [
    { items: [{ id: 'laptop', quantity: 1 }], coupon: null },
    { items: [{ id: 'notebook', quantity: 0 }], coupon: null },
    { items: [{ id: 'notebook', quantity: 11 }], coupon: null },
    { items: [{ id: 'notebook', quantity: 1 }], coupon: 'OLD50' },
  ];
  for (const cart of bad) {
    assert.deepEqual(createCartStore(fakeStorage({ 'jsm-ch12-cart': JSON.stringify(cart) })).load(), emptyCart(), JSON.stringify(cart));
  }
});

test('Storage ত্রুটি দিলে: load ফাঁকা কার্ট, save false; Program থামে না', () => {
  const broken = { getItem: () => { throw new Error('SecurityError'); }, setItem: () => { throw new Error('QuotaExceededError'); } };
  const store = createCartStore(broken);
  assert.deepEqual(store.load(), emptyCart());
  assert.equal(store.save(emptyCart()), false);
});

test('নিজস্ব Key দিলে আলাদা কার্ট', () => {
  const storage = fakeStorage();
  createCartStore(storage, 'a').save(addItem(emptyCart(), 'notebook'));
  assert.deepEqual(createCartStore(storage, 'b').load(), emptyCart());
  assert.equal(createCartStore(storage, 'a').load().items.length, 1);
});
