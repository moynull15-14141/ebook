import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE accounts (id INTEGER PRIMARY KEY,
  balance INTEGER NOT NULL CHECK (balance >= 0));
  INSERT INTO accounts VALUES (1, 300), (2, 0);`);
const add = db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?');
const balances = () => db.prepare('SELECT balance FROM accounts ORDER BY id')
  .all().map((r) => r.balance).join(' / ');

function transferUnsafe(from, to, points) {
  add.run(points, to);
  add.run(-points, from);
}

function transferSafe(from, to, points) {
  db.exec('BEGIN');
  try {
    add.run(points, to);
    add.run(-points, from);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

for (const transfer of [transferUnsafe, transferSafe]) {
  db.exec('UPDATE accounts SET balance = CASE id WHEN 1 THEN 300 ELSE 0 END');
  try {
    transfer(1, 2, 500);
  } catch (error) {
    console.log(`${transfer.name}: ${error.message} | ${balances()}`);
  }
}
