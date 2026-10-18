// Transaction: সব একসঙ্গে, নয়তো কিছুই নয়; Idempotency; Invariant।
import test from 'node:test';
import assert from 'node:assert/strict';
import { memoryStore, newCustomer } from './helpers.mjs';

const entries = (db) => db.prepare('SELECT COUNT(*) AS n FROM ledger_entries').get().n;

test('earn ও redeem: balance ও Ledger একসঙ্গে বদলায়', () => {
  const { customers, ledger } = memoryStore();
  const id = newCustomer(customers);
  ledger.earn(id, 500, 'tour');
  ledger.redeem(id, 200, 'gift');
  assert.equal(ledger.balanceOf(id).balance, 300);
  assert.deepEqual(ledger.audit(), []);
});

test('যথেষ্ট Point না থাকলে Rollback: কোনো সারি থেকে যায় না', () => {
  const { db, customers, ledger } = memoryStore();
  const id = newCustomer(customers);
  ledger.earn(id, 100, 'tour');
  assert.throws(() => ledger.redeem(id, 101, 'too much'),
    { code: 'CHECK', message: 'যথেষ্ট Point নেই' });
  assert.equal(entries(db), 1);
  assert.equal(ledger.balanceOf(id).balance, 100);
});

test('transfer পরমাণু: ব্যর্থ হলে দুই পক্ষই অপরিবর্তিত', () => {
  const { db, customers, ledger } = memoryStore();
  const [a, b] = [newCustomer(customers), newCustomer(customers)];
  ledger.earn(a, 1_000, 'tour');
  assert.throws(() => ledger.transfer(a, b, 5_000), { code: 'CHECK' });
  const both = () => [ledger.balanceOf(a).balance, ledger.balanceOf(b).balance];
  assert.deepEqual(both(), [1_000, 0]);
  assert.throws(() => ledger.transfer(a, 999, 100), { code: 'FOREIGN_KEY' });
  assert.equal(ledger.balanceOf(a).balance, 1_000);
  assert.equal(entries(db), 1);
  ledger.transfer(a, b, 400);
  assert.deepEqual(both(), [600, 400]);
});

test('Idempotency Key: একই Key দ্বিতীয়বার কিছুই করে না', () => {
  const { db, customers, ledger } = memoryStore();
  const id = newCustomer(customers);
  assert.deepEqual(ledger.earn(id, 500, 'tour', 'trip-1'), { duplicate: false });
  assert.deepEqual(ledger.earn(id, 500, 'tour', 'trip-1'), { duplicate: true });
  assert.equal(ledger.balanceOf(id).balance, 500);
  assert.equal(entries(db), 1);
});

test('অবৈধ Point: শূন্য, ভগ্নাংশ', () => {
  const { customers, ledger } = memoryStore();
  const id = newCustomer(customers);
  for (const points of [0, 1.5, Number.NaN]) {
    assert.throws(() => ledger.earn(id, points, 'x'), { code: 'INVALID' });
  }
});

test('Property: ৫০০টি এলোমেলো কাজের পর balance সব সময় Ledger-এর যোগফল', () => {
  const { customers, ledger } = memoryStore();
  const ids = [newCustomer(customers), newCustomer(customers), newCustomer(customers)];
  let seed = 26;
  const random = () => {
    seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
    return seed / 2_147_483_648;
  };
  for (let i = 0; i < 500; i += 1) {
    const [a, b] = [ids[Math.floor(random() * 3)], ids[Math.floor(random() * 3)]];
    const points = 1 + Math.floor(random() * 300);
    const action = Math.floor(random() * 3);
    try {
      if (action === 0) ledger.earn(a, points, 'r');
      if (action === 1) ledger.redeem(a, points, 'r');
      if (action === 2 && a !== b) ledger.transfer(a, b, points);
    } catch (error) {
      assert.equal(error.code, 'CHECK');
    }
  }
  assert.deepEqual(ledger.audit(), []);
  assert.ok(ids.every((id) => ledger.balanceOf(id).balance >= 0));
});
