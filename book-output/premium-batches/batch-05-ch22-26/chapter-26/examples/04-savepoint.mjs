import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE gifts (name TEXT NOT NULL CHECK (length(name) >= 3));`);

const imported = [];
db.exec('BEGIN');
for (const name of ['Tea Garden Pass', 'X', 'Boat Ride']) {
  db.exec('SAVEPOINT item');
  try {
    db.prepare('INSERT INTO gifts VALUES (?)').run(name);
    db.exec('RELEASE item');
    imported.push(name);
  } catch {
    db.exec('ROLLBACK TO item');
    db.exec('RELEASE item');
  }
}
db.exec('COMMIT');
const saved = db.prepare('SELECT name FROM gifts').all().map((r) => r.name);
console.log(imported.length, saved.join(', '));
