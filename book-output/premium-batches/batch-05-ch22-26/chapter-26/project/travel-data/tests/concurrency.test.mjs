// একই Database File-এ দুটি সংযোগ: Lock, এবং Lost Update কেন ঘটে ও কীভাবে ঠেকে।
import test from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { openDatabase, withTransaction } from '../src/db.mjs';
import { migrate } from '../src/migrate.mjs';
import { createCustomerStore } from '../src/customers.mjs';
import { tempDir, newCustomer } from './helpers.mjs';

function twoConnections(t) {
  const { dir, track } = tempDir(t);
  const file = join(dir, 'shared.db');
  const first = track(openDatabase(file, { busyTimeoutMs: 0 }));
  migrate(first);
  const id = newCustomer(createCustomerStore(first));
  const second = track(openDatabase(file, { busyTimeoutMs: 0 }));
  return { first, second, id };
}
const balance = (db, id) => db.prepare(
  'SELECT balance FROM accounts WHERE customer_id = ?').get(id).balance;
const SET = 'UPDATE accounts SET balance = ? WHERE customer_id = ?';

test('একজন লিখছেন: দ্বিতীয় Writer "database is locked" পান, পরে সফল', (t) => {
  const { first, second } = twoConnections(t);
  first.exec('BEGIN IMMEDIATE');
  assert.throws(() => second.exec('BEGIN IMMEDIATE'), /database is locked/);
  first.exec('COMMIT');
  second.exec('BEGIN IMMEDIATE');
  second.exec('COMMIT');
});

test('Lost Update: পড়ে, হিসাব করে, লেখা (দুই সংযোগে) একটি হালনাগাদ হারায়', (t) => {
  const { first, second, id } = twoConnections(t);
  const readA = balance(first, id);
  const readB = balance(second, id);
  first.prepare(SET).run(readA + 100, id);
  second.prepare(SET).run(readB + 50, id);
  assert.equal(balance(first, id), 50);
});

test('সমাধান: Database-এর ভেতরে হিসাব (balance = balance + ?), পরমাণু', (t) => {
  const { first, second, id } = twoConnections(t);
  const add = 'UPDATE accounts SET balance = balance + ? WHERE customer_id = ?';
  first.prepare(add).run(100, id);
  second.prepare(add).run(50, id);
  assert.equal(balance(first, id), 150);
});

test('সমাধান: পড়া ও লেখা একই IMMEDIATE Transaction-এ', (t) => {
  const { first, second, id } = twoConnections(t);
  withTransaction(first, () => {
    const current = balance(first, id);
    assert.throws(() => withTransaction(second, () => balance(second, id)),
      /database is locked/);
    first.prepare(SET).run(current + 100, id);
  });
  withTransaction(second, () => {
    const current = balance(second, id);
    second.prepare(SET).run(current + 50, id);
  });
  assert.equal(balance(first, id), 150);
});
