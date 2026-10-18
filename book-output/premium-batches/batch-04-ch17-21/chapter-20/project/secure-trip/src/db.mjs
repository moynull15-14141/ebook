import { DatabaseSync } from 'node:sqlite';

const TRIP = `SELECT id, owner_id AS ownerId, package_id AS packageId,
  travelers, start_date AS startDate, note, total FROM trips`;

export function createDatabase(file = ':memory:') {
  const db = new DatabaseSync(file);
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL,
      hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('customer', 'admin')));
    CREATE TABLE trips (
      id TEXT PRIMARY KEY, owner_id INTEGER NOT NULL REFERENCES users (id),
      package_id TEXT NOT NULL, travelers INTEGER NOT NULL,
      start_date TEXT NOT NULL, note TEXT NOT NULL, total INTEGER NOT NULL);
  `);
  // প্রতিটি Query Parameterized: মান আলাদা যায়, SQL-এর লেখার অংশ হয় না।
  const sql = {
    addUser: db.prepare('INSERT INTO users (email, hash, role) VALUES (?, ?, ?)'),
    userByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
    addTrip: db.prepare('INSERT INTO trips VALUES (?, ?, ?, ?, ?, ?, ?)'),
    tripById: db.prepare(`${TRIP} WHERE id = ?`),
    tripsOf: db.prepare(`${TRIP} WHERE owner_id = ? ORDER BY rowid`),
    allTrips: db.prepare(`${TRIP} ORDER BY rowid`),
  };
  const plain = (row) => (row ? { ...row } : null);
  return {
    addUser: (email, hash, role) =>
      Number(sql.addUser.run(email, hash, role).lastInsertRowid),
    userByEmail: (email) => plain(sql.userByEmail.get(email)),
    addTrip: (t) => sql.addTrip.run(t.id, t.ownerId, t.packageId,
      t.travelers, t.startDate, t.note, t.total),
    tripById: (id) => plain(sql.tripById.get(id)),
    tripsFor: (user) => (user.role === 'admin'
      ? sql.allTrips.all()
      : sql.tripsOf.all(user.id)).map(plain),
  };
}
