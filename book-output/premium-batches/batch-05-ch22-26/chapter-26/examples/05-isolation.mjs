import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'isolation-'));
const file = join(dir, 'demo.db');
const writer = new DatabaseSync(file);
writer.exec(`PRAGMA journal_mode = WAL;
  CREATE TABLE accounts (id INTEGER PRIMARY KEY, balance INTEGER);
  INSERT INTO accounts VALUES (1, 100);`);
const reader = new DatabaseSync(file);
const read = (db) =>
  db.prepare('SELECT balance FROM accounts WHERE id = 1').get().balance;

reader.exec('BEGIN');
console.log('Reader শুরুতে:', read(reader));
writer.exec('UPDATE accounts SET balance = 900 WHERE id = 1');
console.log('Writer-এর COMMIT-এর পরে, Reader এখনো:', read(reader));
reader.exec('COMMIT');
console.log('Reader-এর নতুন Transaction:', read(reader));

reader.close();
writer.close();
rmSync(dir, { recursive: true, force: true });
