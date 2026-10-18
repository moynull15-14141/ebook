import { openDatabase } from '../../project/travel-data/src/db.mjs';
import { migrate } from '../../project/travel-data/src/migrate.mjs';
import { createCustomerStore } from '../../project/travel-data/src/customers.mjs';
import { createLedger } from '../../project/travel-data/src/ledger.mjs';

const db = openDatabase();
migrate(db);
const id = createCustomerStore(db).create({ name: 'Sara Islam', email: 's@e.com',
  phone: '01912345678', city: 'Bogura' });
const ledger = createLedger(db);
ledger.earn(id, 700, 'wrong tour');

function reverse(entryId) {
  const entry = db.prepare('SELECT * FROM ledger_entries WHERE id = ?')
    .get(entryId);
  return ledger.earn(entry.customer_id, -entry.points,
    `reversal of #${entryId}`, `reverse-${entryId}`);
}

reverse(1);
reverse(1);
const rows = db.prepare(
  'SELECT points, reason FROM ledger_entries ORDER BY id').all();
console.log(rows.map((r) => `${r.points} (${r.reason})`).join(' | '));
console.log(ledger.balanceOf(id).balance, ledger.audit().length);
