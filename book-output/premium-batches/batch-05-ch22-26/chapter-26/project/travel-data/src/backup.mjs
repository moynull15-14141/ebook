import { existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

// চালু Database-এর একটি সামঞ্জস্যপূর্ণ Copy (VACUUM INTO), তারপর যাচাই:
// Backup খোলা যায়, ক্ষতিগ্রস্ত নয়, এবং প্রতিটি Table-এ সারির সংখ্যা মেলে।
export function backupTo(db, file) {
  if (existsSync(file)) {
    throw new Error(`${file} আগেই আছে; পুরোনো Backup মুছে যাবে না`);
  }
  db.prepare('VACUUM INTO ?').run(file);
  const copy = new DatabaseSync(file, { readOnly: true });
  try {
    const check = copy.prepare('PRAGMA integrity_check').get();
    const integrity = check.integrity_check;
    const counts = {};
    for (const table of ['customers', 'accounts', 'ledger_entries']) {
      const sql = `SELECT COUNT(*) AS n FROM ${table}`;
      const original = db.prepare(sql).get().n;
      const backedUp = copy.prepare(sql).get().n;
      if (original !== backedUp) {
        throw new Error(`${table}: ${original} বনাম ${backedUp} সারি`);
      }
      counts[table] = backedUp;
    }
    return { integrity, counts };
  } finally {
    copy.close();
  }
}
