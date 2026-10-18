import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE tours (
  code TEXT PRIMARY KEY,
  price INTEGER NOT NULL CONSTRAINT price_positive CHECK (price > 0),
  days INTEGER NOT NULL CONSTRAINT days_range CHECK (days BETWEEN 1 AND 30))`);

const tries = [
  ['SJK-2', 6500, 2], ['SJK-2', 7000, 3], ['KTA-0', 0, 2], ['LNG-31', 9000, 31],
];
for (const row of tries) {
  try {
    db.prepare('INSERT INTO tours VALUES (?, ?, ?)').run(...row);
    console.log(`${row[0]}: যোগ হয়েছে`);
  } catch (error) {
    console.log(`${row[0]}: ${error.message}`);
  }
}
