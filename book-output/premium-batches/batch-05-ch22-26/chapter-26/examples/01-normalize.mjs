import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE flat (entry INTEGER, name TEXT, phone TEXT, points INTEGER);
  INSERT INTO flat VALUES (1, 'Rafi', '01711111111', 500),
    (2, 'Rafi', '01711111111', 300), (3, 'Mina', '01822222222', 400);`);

// গ্রাহক ফোন বদলালেন; একটি সারিতে হালনাগাদ হলো, অন্যটিতে নয়।
db.exec("UPDATE flat SET phone = '01799999999' WHERE entry = 1");
const phones = db.prepare(
  "SELECT DISTINCT phone FROM flat WHERE name = 'Rafi'").all();
console.log('একই Rafi-র ফোন:', phones.map((r) => r.phone).join(', '));

db.exec(`CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, phone TEXT);
  CREATE TABLE entries (id INTEGER PRIMARY KEY,
    customer_id INTEGER REFERENCES customers (id), points INTEGER);
  INSERT INTO customers VALUES (1, 'Rafi', '01711111111'),
    (2, 'Mina', '01822222222');
  INSERT INTO entries VALUES (1, 1, 500), (2, 1, 300), (3, 2, 400);
  UPDATE customers SET phone = '01799999999' WHERE id = 1;`);
const joined = db.prepare(`SELECT c.name, c.phone, SUM(e.points) AS total
  FROM customers c JOIN entries e ON e.customer_id = c.id
  GROUP BY c.id ORDER BY c.id`).all();
console.log(joined.map((r) => `${r.name} ${r.phone} ${r.total}`).join(' | '));
