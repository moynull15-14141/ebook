import { mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase } from './src/db.mjs';
import { migrate } from './src/migrate.mjs';
import { createCustomerStore } from './src/customers.mjs';
import { createLedger } from './src/ledger.mjs';
import { topCustomers, monthlyPoints } from './src/reports.mjs';
import { backupTo } from './src/backup.mjs';

// শিক্ষামূলক Demo: Database File Operating System-এর Temp Folder-এ, প্রতিবার নতুন।
const dir = join(tmpdir(), 'travel-data-demo');
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir);
const db = openDatabase(join(dir, 'travel.db'));

console.log('Migration:', migrate(db).join(', '));
const customers = createCustomerStore(db);
const now = () => new Date('2026-10-18T10:00:00Z');
const ledger = createLedger(db, { now });
const rafi = customers.create({ name: 'Rafi Ahmed', email: 'rafi@example.com',
  phone: '01712345678', city: 'Dhaka' });
const mina = customers.create({ name: 'Mina Akter', email: 'mina@example.com',
  phone: '01812345678', city: 'Sylhet' });

ledger.earn(rafi, 6_000, "Cox's Bazar tour", 'trip-1001');
ledger.earn(rafi, 6_000, "Cox's Bazar tour", 'trip-1001');
ledger.transfer(rafi, mina, 1_500, 'family-77');
try {
  ledger.redeem(mina, 9_000, 'Free hotel night');
} catch (error) {
  console.log(`${error.code}: ${error.message}`);
}

console.log(topCustomers(db).map((c) => `${c.name} ${c.balance}`).join(' | '));
console.log(JSON.stringify(monthlyPoints(db, rafi)));
console.log('Audit:', ledger.audit().length === 0 ? 'balance ও Ledger মেলে' : 'অমিল!');
const { integrity, counts } = backupTo(db, join(dir, 'backup.db'));
console.log(`Backup: ${integrity}, ${JSON.stringify(counts)}`);
db.close();
