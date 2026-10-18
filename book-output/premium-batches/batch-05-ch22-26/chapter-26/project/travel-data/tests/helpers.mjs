// প্রতিটি Test-এর জন্য নতুন, আলাদা Database: Memory-তে, অথবা Temp Folder-এ File।
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase } from '../src/db.mjs';
import { migrate } from '../src/migrate.mjs';
import { createCustomerStore } from '../src/customers.mjs';
import { createLedger } from '../src/ledger.mjs';

export function memoryStore() {
  const db = openDatabase();
  migrate(db);
  return { db, customers: createCustomerStore(db), ledger: createLedger(db) };
}

// Temp Folder; Test শেষে আগে track করা Database বন্ধ, তারপর Folder মুছে ফেলা
// (Windows-এ খোলা File মোছা যায় না)।
export function tempDir(t) {
  const dir = mkdtempSync(join(tmpdir(), 'travel-data-test-'));
  const open = [];
  t.after(() => {
    open.forEach((db) => db.close());
    rmSync(dir, { recursive: true, force: true, maxRetries: 5 });
  });
  return { dir, track: (db) => open.push(db) && db };
}

let phone = 10_000_000;
export function newCustomer(customers, overrides = {}) {
  phone += 1;
  return customers.create({
    name: 'Test Customer', email: `c${phone}@example.com`,
    phone: `017${phone}`, city: 'Dhaka', ...overrides,
  });
}
