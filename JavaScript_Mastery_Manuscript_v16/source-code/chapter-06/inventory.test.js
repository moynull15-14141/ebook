const assert = require('node:assert/strict');
const { test } = require('node:test');
const I = require('./inventory');
const base = [
  { id: '1', name: 'Mouse', category: 'Tech', price: 100.25, stock: 10 },
  { id: '2', name: 'Pen', category: 'Office', price: 2.5, stock: 2 },
  { id: '3', name: 'Keyboard', category: 'Tech', price: 500, stock: 0 }
];
test('validate and normalize product', () => assert.deepEqual(I.validateProduct({ id: ' x ', name: ' Pen ', category: 'Office', price: '5.25', stock: '3' }), { id: 'x', name: 'Pen', category: 'Office', price: 5.25, stock: 3 }));
test('reject negative stock', () => assert.throws(() => I.validateProduct({ id: 'x', name: 'X', category: 'A', price: 1, stock: -1 })));
test('reject fractional stock', () => assert.throws(() => I.validateProduct({ id: 'x', name: 'X', category: 'A', price: 1, stock: 1.2 })));
test('reject fractional cents', () => assert.throws(() => I.validateProduct({ id: 'x', name: 'X', category: 'A', price: 1.234, stock: 1 })));
test('add immutably', () => { const next = I.addProduct(base, { id: '4', name: 'Book', category: 'Office', price: 25, stock: 2 }); assert.equal(next.length, 4); assert.equal(base.length, 3); });
test('duplicate ID fails', () => assert.throws(() => I.addProduct(base, base[0])));
test('update stock immutably', () => { const next = I.updateStock(base, '1', -2); assert.equal(next[0].stock, 8); assert.equal(base[0].stock, 10); });
test('cannot oversell', () => assert.throws(() => I.updateStock(base, '2', -3)));
test('missing product fails', () => assert.throws(() => I.updateStock(base, 'missing', 1)));
test('remove product', () => assert.deepEqual(I.removeProduct(base, '2').map(x => x.id), ['1', '3']));
test('filter by name', () => assert.deepEqual(I.filterProducts(base, { query: 'mou' }).map(x => x.id), ['1']));
test('filter low stock', () => assert.deepEqual(I.filterProducts(base, { lowStockOnly: true }).map(x => x.id), ['2', '3']));
test('sort does not mutate', () => { const next = I.sortProducts(base, 'price', 'desc'); assert.deepEqual(next.map(x => x.id), ['3', '1', '2']); assert.equal(base[0].id, '1'); });
test('summarize in cents', () => assert.deepEqual(I.summarize(base), { productCount: 3, totalUnits: 12, totalValueCents: 100750, lowStockCount: 2 }));
test('category summary', () => assert.deepEqual(I.categorySummary(base), [{ category: 'Tech', units: 10, products: 2 }, { category: 'Office', units: 2, products: 1 }]));
test('empty inventory', () => assert.deepEqual(I.summarize([]), { productCount: 0, totalUnits: 0, totalValueCents: 0, lowStockCount: 0 }));
