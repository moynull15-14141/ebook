import { DatabaseSync } from 'node:sqlite';

// Inbox: Consumer-এর দিকে Deduplication। Event-এর ID-তে PRIMARY KEY, আর
// কাজ ও Inbox-এর সারি একই Transaction-এ; তাই Duplicate কখনো দুবার নয়।
const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE inbox (event_id TEXT PRIMARY KEY);
  CREATE TABLE loyalty (customer TEXT PRIMARY KEY, points INTEGER);
  INSERT INTO loyalty VALUES ('Rahim', 0);`);

function onBookingConfirmed(event) {
  db.exec('BEGIN');
  try {
    db.prepare('INSERT INTO inbox VALUES (?)').run(event.id);
    db.prepare('UPDATE loyalty SET points = points + ? WHERE customer = ?')
      .run(event.seats * 100, event.customer);
    db.exec('COMMIT');
    return 'processed';
  } catch (error) {
    db.exec('ROLLBACK');
    if (error.code === 'ERR_SQLITE_ERROR' && /UNIQUE/.test(error.message)) {
      return 'duplicate';
    }
    throw error;
  }
}

const event = { id: 'evt-trip-101', customer: 'Rahim', seats: 2 };
for (const delivery of [1, 2, 3]) {
  console.log(`Delivery ${delivery}:`, onBookingConfirmed(event));
}
console.log({ ...db.prepare('SELECT * FROM loyalty').get() });
