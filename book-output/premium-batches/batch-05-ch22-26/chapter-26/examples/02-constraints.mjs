import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`PRAGMA foreign_keys = ON;
  CREATE TABLE customers (id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE);
  CREATE TABLE accounts (
    customer_id INTEGER PRIMARY KEY REFERENCES customers (id),
    balance INTEGER NOT NULL
      CONSTRAINT balance_not_negative CHECK (balance >= 0));
  INSERT INTO customers VALUES (1, 'rafi@example.com');
  INSERT INTO accounts VALUES (1, 100);`);

const attempts = [
  "INSERT INTO customers VALUES (2, 'RAFI@example.com')",
  'INSERT INTO customers (id) VALUES (3)',
  'UPDATE accounts SET balance = balance - 500 WHERE customer_id = 1',
  'INSERT INTO accounts VALUES (99, 0)',
];
for (const sql of attempts) {
  try {
    db.exec(sql);
  } catch (error) {
    console.log(error.message);
  }
}
