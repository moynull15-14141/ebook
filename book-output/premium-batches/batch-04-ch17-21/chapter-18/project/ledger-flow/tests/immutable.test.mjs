// Immutable সাহায্যকারীর Test।  চালানোর Command (Project Folder থেকে):  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { updateIn, setIn, deepFreeze } from '../src/immutable.mjs';

const state = () => deepFreeze({
  user: { name: 'Sara', address: { city: 'Bogura' } },
  orders: [{ id: 'O1', items: [{ qty: 2 }, { qty: 1 }] }, { id: 'O2', items: [] }],
});

test('setIn: Object-এর Path; Frozen মূল অক্ষত; বদলের পথের বাইরে Structural Sharing', () => {
  const before = state();
  const after = setIn(before, ['user', 'address', 'city'], 'Dhaka');
  assert.equal(after.user.address.city, 'Dhaka');
  assert.equal(before.user.address.city, 'Bogura');
  assert.equal(after.orders, before.orders);
  assert.notEqual(after.user, before.user);
});

test('updateIn: Array-র Index-সহ Path; অন্য Order ও পণ্য একই Object', () => {
  const before = state();
  const after = updateIn(before, ['orders', 0, 'items', 1, 'qty'], (n) => n + 5);
  assert.equal(after.orders[0].items[1].qty, 6);
  assert.ok(Array.isArray(after.orders) && Array.isArray(after.orders[0].items));
  assert.equal(after.orders[1], before.orders[1]);
  assert.equal(after.orders[0].items[0], before.orders[0].items[0]);
});

test('একই মান বসালে কোনো নতুন Object নয় (পরিবর্তন === দিয়ে শনাক্তযোগ্য)', () => {
  const before = state();
  assert.equal(setIn(before, ['user', 'name'], 'Sara'), before);
  assert.equal(updateIn(before, ['orders', 0, 'items', 0, 'qty'], (n) => n), before);
});

test('অস্তিত্বহীন Path-এ নতুন শাখা তৈরি হয়', () => {
  const after = setIn(state(), ['user', 'phone', 'mobile'], '017');
  assert.deepEqual(after.user.phone, { mobile: '017' });
});

test('deepFreeze: সব স্তর Frozen; Strict Mode-এ বদলানোর চেষ্টা TypeError', () => {
  const frozen = state();
  assert.ok(Object.isFrozen(frozen.orders[0].items[0]));
  assert.throws(() => { frozen.orders[0].items.push({}); }, TypeError);
  assert.throws(() => { frozen.user.address.city = 'X'; }, TypeError);
});

test('deepFreeze: Primitive ও null নিরাপদ, একই মান ফেরত', () => {
  assert.equal(deepFreeze(5), 5);
  assert.equal(deepFreeze(null), null);
});
