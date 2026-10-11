// Inventory Dashboard-এর Automated Test।  চালানোর Command (Project Folder থেকে):  node --test
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const loadScript = require('./load-script.js');

const { fn, get, printed } = loadScript(path.join(__dirname, '..', 'inventory.js'));
const { changeStock } = fn;
const addProduct = get('addProduct'), removeProduct = get('removeProduct'), findProduct = get('findProduct');
const lowStock = get('lowStock'), totalValue = get('totalValue'), describe = get('describe');
const make = () => [
  { id: 'P1', name: 'Notebook', price: 120, stock: 40 },
  { id: 'P2', name: 'Pen', price: 15, stock: 3 },
  { id: 'P3', name: 'School Bag', price: 950, stock: 5 },
];
const json = v => JSON.stringify(v);

test('addProduct: নতুন পণ্যসহ নতুন Array', () => {
  const items = make();
  const added = addProduct(items, { id: 'P4', name: 'Calculator', price: 650, stock: 12 });
  assert.equal(added.length, 4);
  assert.equal(added[3].id, 'P4');
});
test('addProduct: মূল Array বদলায় না', () => {
  const items = make();
  const added = addProduct(items, { id: 'P4', name: 'X', price: 1, stock: 1 });
  assert.equal(items.length, 3);
  assert.notEqual(added, items);
});
test('removeProduct: নির্দিষ্ট id বাদ দেয়', () => assert.equal(json(removeProduct(make(), 'P2').map(p => p.id)), '["P1","P3"]'));
test('removeProduct: অচেনা id-তে সব থাকে; মূল Array বদলায় না', () => {
  const items = make();
  assert.equal(removeProduct(items, 'P9').length, 3);
  removeProduct(items, 'P1');
  assert.equal(items.length, 3);
});
test('findProduct: id দিয়ে খুঁজে পায়', () => assert.equal(findProduct(make(), 'P3').name, 'School Bag'));
test('findProduct: না পেলে undefined', () => assert.equal(findProduct(make(), 'P9'), undefined));
test('changeStock: মজুত কমায় ও বাড়ায়', () => {
  assert.equal(changeStock(make(), 'P1', -38)[0].stock, 2);
  assert.equal(changeStock(make(), 'P2', 7)[1].stock, 10);
});
test('changeStock: মজুত শূন্যের নিচে নামে না', () => {
  assert.equal(changeStock(make(), 'P1', -500)[0].stock, 0);
  assert.equal(changeStock(make(), 'P1', -40)[0].stock, 0);
});
test('changeStock: অন্য পণ্য ও অন্য তথ্য অপরিবর্তিত', () => {
  const changed = changeStock(make(), 'P1', -1);
  assert.equal(json(changed[1]), json(make()[1]));
  assert.equal(changed[0].name, 'Notebook');
  assert.equal(changed[0].price, 120);
});
test('changeStock: মূল Array ও তার Object বদলায় না', () => {
  const items = make(), before = json(items);
  const changed = changeStock(items, 'P1', -38);
  assert.equal(json(items), before);
  assert.notEqual(changed[0], items[0]);
  assert.equal(changed[1], items[1]);
});
test('changeStock: অচেনা id-তে কোনো পরিবর্তন নয়', () => assert.equal(json(changeStock(make(), 'P9', 5)), json(make())));
test('lowStock: Default সীমা ৫, সীমার সমান মানসহ', () => assert.equal(json(lowStock(make()).map(p => p.name)), '["Pen","School Bag"]'));
test('lowStock: নিজস্ব সীমা; না মিললে ফাঁকা Array', () => {
  assert.equal(json(lowStock(make(), 3).map(p => p.name)), '["Pen"]');
  assert.equal(lowStock(make(), 0).length, 0);
});
test('totalValue: দাম x মজুত-এর যোগফল; ফাঁকা তালিকায় 0', () => {
  assert.equal(totalValue(make()), 120 * 40 + 15 * 3 + 950 * 5);
  assert.equal(totalValue([]), 0);
});
test('describe: প্রতিটি পণ্যের এক লাইন', () => assert.equal(json(describe(make().slice(0, 1))), '["P1 Notebook: 40 x 120"]'));
test('File চালালে Dashboard দেখায় এবং শুরুর তালিকা অক্ষত থাকে', () => {
  assert.equal(printed.length, 8);
  assert.equal(printed[0], 'P1 Notebook: 2 x 120');
  assert.equal(printed[4], 'মোট মূল্য: 12790 টাকা');
  assert.equal(printed[5], 'মজুত কম: Notebook, School Bag');
  assert.equal(printed[7], 'শুরুর তালিকায় Notebook-এর মজুত: 40');
});
