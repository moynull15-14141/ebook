import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE outbox (id INTEGER PRIMARY KEY, type TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  state TEXT NOT NULL DEFAULT 'pending');
  INSERT INTO outbox (type) VALUES ('booking.confirmed'), ('poison.event');`);

// প্রতিটি ব্যর্থতায় attempts বাড়ে; ৩ বারের পরে 'dead' (মানুষ দেখবেন)।
function relay(publish, maxAttempts = 3) {
  const rows = db.prepare(
    "SELECT * FROM outbox WHERE state = 'pending' ORDER BY id").all();
  for (const row of rows) {
    try {
      publish(row);
      db.prepare("UPDATE outbox SET state = 'sent' WHERE id = ?").run(row.id);
    } catch {
      const attempts = row.attempts + 1;
      const state = attempts >= maxAttempts ? 'dead' : 'pending';
      db.prepare('UPDATE outbox SET attempts = ?, state = ? WHERE id = ?')
        .run(attempts, state, row.id);
    }
  }
}

let brokerUp = false;
const publish = (row) => {
  if (!brokerUp || row.type === 'poison.event') throw new Error('fail');
};
for (const round of [1, 2, 3]) {
  if (round === 2) brokerUp = true; // Broker দ্বিতীয় দফায় ফিরে এল
  relay(publish);
  const rows = db.prepare('SELECT id, attempts, state FROM outbox').all();
  console.log(`দফা ${round}:`,
    rows.map((r) => `${r.id}:${r.state}/${r.attempts}`).join(' '));
}
