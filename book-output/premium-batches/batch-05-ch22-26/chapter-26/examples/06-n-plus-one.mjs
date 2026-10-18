import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
  CREATE TABLE entries (customer_id INTEGER, points INTEGER);`);
for (let id = 1; id <= 50; id += 1) {
  db.prepare('INSERT INTO customers VALUES (?, ?)').run(id, `Guest ${id}`);
  db.prepare('INSERT INTO entries VALUES (?, ?), (?, ?)').run(id, 100, id, 50);
}

let queries = 0;
const run = (sql, ...params) => {
  queries += 1;
  return db.prepare(sql).all(...params);
};

const slow = run('SELECT id, name FROM customers').map((c) => ({
  ...c,
  total: run('SELECT SUM(points) AS t FROM entries WHERE customer_id = ?',
    c.id)[0].t,
}));
const nPlusOne = queries;

queries = 0;
const fast = run(`SELECT c.id, c.name, SUM(e.points) AS total
  FROM customers c JOIN entries e ON e.customer_id = c.id GROUP BY c.id`);
console.log(`N+1: ${nPlusOne}টি Query, JOIN: ${queries}টি Query`);
const totals = (rows) => JSON.stringify(rows.map((r) => r.total));
console.log(totals(slow) === totals(fast));
