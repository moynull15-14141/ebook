import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE bookings (id TEXT PRIMARY KEY, status TEXT NOT NULL);
  CREATE TABLE outbox (id INTEGER PRIMARY KEY, type TEXT, payload TEXT,
    published INTEGER NOT NULL DEFAULT 0);
  INSERT INTO bookings VALUES ('bk-1', 'PENDING');`);

// Business পরিবর্তন ও Outbox সারি একই Transaction-এ: দুটোই, নয়তো কোনোটিই নয়।
function confirm(id) {
  db.exec('BEGIN');
  try {
    db.prepare("UPDATE bookings SET status = 'CONFIRMED' WHERE id = ?").run(id);
    db.prepare('INSERT INTO outbox (type, payload) VALUES (?, ?)')
      .run('booking.confirmed', JSON.stringify({ bookingId: id }));
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

// Relay: আলাদা Worker; Publish সফল হলে তবেই published = 1।
function relay(publish) {
  const rows = db.prepare('SELECT * FROM outbox WHERE published = 0').all();
  for (const row of rows) {
    publish(row);
    db.prepare('UPDATE outbox SET published = 1 WHERE id = ?').run(row.id);
  }
}

const seen = new Set();
const consumer = (row) => {
  if (seen.has(row.id)) return console.log('  duplicate বাদ:', row.id);
  seen.add(row.id);
  console.log('  Email পাঠানো হলো:', row.type, row.payload);
};

confirm('bk-1');
console.log('১ম Relay: Publish-এর পরে, published লেখার আগেই Crash');
try {
  relay((row) => { consumer(row); throw new Error('Crash'); });
} catch (error) {
  console.log('  ', error.message);
}
console.log('২য় Relay (Restart): একই সারি আবার, Consumer Idempotent');
relay(consumer);
console.log('বাকি:', db.prepare(
  'SELECT COUNT(*) AS n FROM outbox WHERE published = 0').get().n);
