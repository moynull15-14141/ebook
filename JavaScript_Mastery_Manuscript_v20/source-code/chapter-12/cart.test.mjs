import test from 'node:test';
import assert from 'node:assert/strict';
import {addItem, updateQuantity, removeItem, summarizeCart, restoreCart, money} from './cart.mjs';

test('add a product without mutating input', () => { const original = []; const next = addItem(original, 'book'); assert.equal(original.length, 0); assert.deepEqual(next, [{id:'book',quantity:1}]); });
test('merge quantities', () => assert.equal(addItem([{id:'book',quantity:2}], 'book', 3)[0].quantity, 5));
test('reject invalid quantity', () => assert.throws(() => addItem([], 'book', 0), RangeError));
test('reject unknown product', () => assert.throws(() => addItem([], 'fake')));
test('update quantity', () => assert.equal(updateQuantity([{id:'book',quantity:2}], 'book', 4)[0].quantity, 4));
test('quantity zero removes', () => assert.deepEqual(updateQuantity([{id:'book',quantity:2}], 'book', 0), []));
test('remove item', () => assert.deepEqual(removeItem([{id:'book',quantity:1}], 'book'), []));
test('calculate totals', () => { const s=summarizeCart([{id:'book',quantity:2},{id:'mouse',quantity:1}]); assert.equal(s.subtotal,2900); assert.equal(s.total,2900); assert.equal(s.count,3); });
test('calculate discount', () => assert.equal(summarizeCart([{id:'book',quantity:2}],undefined,10).total,1530));
test('reject invalid discount', () => assert.throws(() => summarizeCart([],undefined,110), RangeError));
test('recover invalid storage', () => assert.deepEqual(restoreCart('{broken'), []));
test('filter tampered storage', () => assert.deepEqual(restoreCart(JSON.stringify([{id:'fake',quantity:1},{id:'book',quantity:2}])),[{id:'book',quantity:2}]));
test('format BDT', () => assert.equal(money(25),'৳25.00'));
