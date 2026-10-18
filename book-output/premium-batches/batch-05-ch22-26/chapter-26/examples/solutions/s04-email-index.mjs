import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE customers (id INTEGER PRIMARY KEY, email TEXT, name TEXT)');
const QUERY = 'SELECT * FROM customers WHERE email = ?';
const plan = () => db.prepare(`EXPLAIN QUERY PLAN ${QUERY}`)
  .all('a@b.c').map((row) => row.detail).join('');

console.log(plan());
db.exec('CREATE UNIQUE INDEX customers_email ON customers (email)');
console.log(plan());
