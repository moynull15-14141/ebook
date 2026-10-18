// Query Plan, Pagination, খোঁজ, Report এবং Backup।
import test from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { openDatabase } from '../src/db.mjs';
import { topCustomers, monthlyPoints, planOf } from '../src/reports.mjs';
import { backupTo } from '../src/backup.mjs';
import { memoryStore, newCustomer, tempDir } from './helpers.mjs';

const LEDGER_QUERY = `SELECT points FROM ledger_entries
  WHERE customer_id = ? ORDER BY created_at`;

test('Index থাকলে SEARCH, Index মুছলে পুরো Table SCAN ও আলাদা সাজানো', () => {
  const { db } = memoryStore();
  const withIndex = planOf(db, LEDGER_QUERY, 1).join(' | ');
  assert.match(withIndex,
    /SEARCH ledger_entries USING INDEX ledger_customer_time/);
  db.exec('DROP INDEX ledger_customer_time');
  const without = planOf(db, LEDGER_QUERY, 1).join(' | ');
  assert.match(without, /SCAN ledger_entries/);
  assert.match(without, /USE TEMP B-TREE FOR ORDER BY/);
});

test('Keyset Pagination ও শহর ধরে খোঁজ', () => {
  const { customers } = memoryStore();
  for (let i = 0; i < 5; i += 1) {
    newCustomer(customers, { city: i % 2 ? 'Sylhet' : 'Dhaka' });
  }
  const first = customers.byCity('Dhaka', { limit: 2 });
  assert.deepEqual(first.map((c) => c.id), [1, 3]);
  const next = customers.byCity('Dhaka', { after: first.at(-1).id, limit: 2 });
  assert.deepEqual(next.map((c) => c.id), [5]);
});

test('খোঁজে % ও _ সাধারণ অক্ষর; Parameter-এ SQL নিরাপদ', () => {
  const { customers } = memoryStore();
  newCustomer(customers, { name: '100% Tours Ltd' });
  newCustomer(customers, { name: 'Rafi_Travels' });
  newCustomer(customers, { name: "O'Brien Rahman" });
  assert.deepEqual(customers.search('%').map((c) => c.name), ['100% Tours Ltd']);
  assert.deepEqual(customers.search('_').map((c) => c.name), ['Rafi_Travels']);
  assert.deepEqual(customers.search("O'B").map((c) => c.name), ["O'Brien Rahman"]);
  assert.equal(customers.findByEmail("' OR '1'='1"), null);
});

test('Report: শীর্ষ গ্রাহক ও মাসিক হিসাব', () => {
  const { db, customers, ledger } = memoryStore();
  const [a, b] = [newCustomer(customers, { name: 'Alpha One' }),
    newCustomer(customers, { name: 'Beta Two' })];
  ledger.earn(a, 300, 'x');
  ledger.earn(b, 900, 'x');
  ledger.redeem(b, 100, 'y');
  assert.deepEqual(topCustomers(db).map((c) => [c.name, c.balance]),
    [['Beta Two', 800], ['Alpha One', 300]]);
  const [month] = monthlyPoints(db, b);
  assert.deepEqual([month.earned, month.spent], [900, 100]);
});

test('Backup: সামঞ্জস্যপূর্ণ Copy, যাচাই, এবং পরের পরিবর্তন থেকে স্বাধীন', (t) => {
  const { dir, track } = tempDir(t);
  const { db, customers, ledger } = memoryStore();
  const id = newCustomer(customers);
  ledger.earn(id, 250, 'tour');
  const file = join(dir, 'backup.db');
  assert.deepEqual(backupTo(db, file),
    { integrity: 'ok', counts: { customers: 1, accounts: 1, ledger_entries: 1 } });
  ledger.earn(id, 50, 'later');
  const copy = track(openDatabase(file));
  assert.equal(copy.prepare('SELECT balance FROM accounts').get().balance, 250);
  assert.throws(() => backupTo(db, file), /আগেই আছে/);
});
