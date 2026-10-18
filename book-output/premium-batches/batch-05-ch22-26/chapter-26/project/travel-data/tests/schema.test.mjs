// Schema ও Migration: Constraint-গুলো Database নিজে প্রয়োগ করে কি না।
import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, appendFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase } from '../src/db.mjs';
import { migrate } from '../src/migrate.mjs';
import { memoryStore, newCustomer, tempDir } from './helpers.mjs';

test('Migration: ক্রমে একবার; দ্বিতীয়বার কিছুই নয়', () => {
  const db = openDatabase();
  assert.deepEqual(migrate(db), ['001-init.sql', '002-indexes.sql', '003-tier.sql']);
  assert.deepEqual(migrate(db), []);
  const versions = db.prepare('SELECT version FROM schema_migrations ORDER BY 1')
    .all().map((r) => r.version);
  assert.deepEqual(versions, ['001', '002', '003']);
});

test('চলে যাওয়া Migration বদলালে থামে', (t) => {
  const { dir } = tempDir(t);
  cpSync(fileURLToPath(new URL('../migrations/', import.meta.url)), dir, { recursive: true });
  const db = openDatabase();
  migrate(db, dir);
  appendFileSync(join(dir, '002-indexes.sql'), '\n-- পরে যোগ করা মন্তব্য\n');
  assert.throws(() => migrate(db, dir), /002-indexes.sql চলার পরে বদলানো হয়েছে/);
});

test('UNIQUE (ছোট-বড় হাতের পার্থক্য ছাড়া), CHECK, NOT NULL', () => {
  const { customers } = memoryStore();
  newCustomer(customers, { email: 'rafi@example.com' });
  assert.throws(() => newCustomer(customers, { email: 'RAFI@Example.com' }),
    { code: 'UNIQUE', message: 'এই Email-এ আগেই একজন গ্রাহক আছেন' });
  assert.throws(() => newCustomer(customers, { phone: '0171234567x' }), { code: 'CHECK' });
  assert.throws(() => newCustomer(customers, { name: ' x ' }), { code: 'CHECK' });
  assert.throws(() => newCustomer(customers, { city: null }), /NOT NULL/);
});

test('Foreign Key চালু: অস্তিত্বহীন গ্রাহকের লেনদেন প্রত্যাখ্যাত', () => {
  const { db, ledger } = memoryStore();
  assert.equal(db.prepare('PRAGMA foreign_keys').get().foreign_keys, 1);
  assert.throws(() => ledger.earn(404, 100, 'ghost'), { code: 'FOREIGN_KEY' });
});

test('ব্যর্থ create-এ গ্রাহক বা Account কোনোটিই থেকে যায় না', () => {
  const { db, customers } = memoryStore();
  assert.throws(() => newCustomer(customers, { name: 'x' }));
  const count = (table) => db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;
  assert.deepEqual([count('customers'), count('accounts')], [0, 0]);
});

test('Data Migration: tier বিদ্যমান balance থেকে', (t) => {
  const { dir } = tempDir(t);
  cpSync(fileURLToPath(new URL('../migrations/', import.meta.url)), dir, { recursive: true });
  rmSync(join(dir, '003-tier.sql'));
  const db = openDatabase();
  migrate(db, dir);
  db.exec(`INSERT INTO customers (name, email, phone, city) VALUES
    ('A A', 'a@e.com', '01711111111', 'D'), ('B B', 'b@e.com', '01722222222', 'D'),
    ('C C', 'c@e.com', '01733333333', 'D');
    INSERT INTO accounts VALUES (1, 300), (2, 7000), (3, 25000);`);
  migrate(db);
  const tiers = db.prepare('SELECT tier FROM accounts ORDER BY customer_id').all();
  assert.deepEqual(tiers.map((r) => r.tier), ['silver', 'gold', 'platinum']);
});
