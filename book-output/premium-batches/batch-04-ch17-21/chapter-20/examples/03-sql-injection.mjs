import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE trips (id INTEGER, owner TEXT, place TEXT);
  INSERT INTO trips VALUES (1, 'rafi', 'Sylhet'), (2, 'mina', 'Cox'),
    (3, 'sara', 'Bogura');`);

const owner = "rafi' OR '1'='1";

// শিক্ষামূলক প্রদর্শন: লেখা জোড়া লাগানো (এভাবে করবেন না)।
const query = `SELECT id FROM trips WHERE owner = '${owner}'`;
const unsafe = db.prepare(query).all();
// প্রস্তাবিত প্রতিরক্ষা: Parameter; মান কখনো SQL-এর লেখা হয় না।
const safe = db.prepare('SELECT id FROM trips WHERE owner = ?').all(owner);

console.log(query);
console.log('জোড়া লাগানো:', unsafe.map((row) => row.id).join(', '));
console.log('Parameterized:', safe.length, 'টি সারি');
