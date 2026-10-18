import { DatabaseSync } from 'node:sqlite';

// Orchestrator-এর নিজস্ব টেকসই Log: প্রতিটি Saga-র অবস্থা, ইতিহাস ও Outbox।
// অবস্থা-বদল, ইতিহাস ও Event একই Transaction-এ লেখা হয়।
export const TERMINAL = new Set(['CONFIRMED', 'REJECTED', 'MANUAL_REVIEW']);

export function openSagaStore(path = ':memory:', now = () => new Date()) {
  const db = new DatabaseSync(path);
  db.exec(`CREATE TABLE IF NOT EXISTS sagas (id TEXT PRIMARY KEY,
      fingerprint TEXT NOT NULL, request TEXT NOT NULL,
      status TEXT NOT NULL, reason TEXT, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS saga_log (saga_id TEXT NOT NULL,
      status TEXT NOT NULL, reason TEXT, at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS outbox (id INTEGER PRIMARY KEY,
      saga_id TEXT NOT NULL, type TEXT NOT NULL, payload TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 0);`);
  const row = (r) => r && { ...r, request: JSON.parse(r.request) };
  const get = (id) => row(db.prepare('SELECT * FROM sagas WHERE id = ?').get(id));

  function inTransaction(fn) {
    db.exec('BEGIN IMMEDIATE');
    try {
      const result = fn();
      db.exec('COMMIT');
      return result;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  return {
    get,
    // নতুন হলে তৈরি; আগে থাকলে যা আছে তা-ই (Idempotency-র ভিত্তি)।
    start(id, fingerprint, request) {
      return inTransaction(() => {
        const existing = get(id);
        if (existing) return { created: false, saga: existing };
        const at = now().toISOString();
        db.prepare(`INSERT INTO sagas (id, fingerprint, request, status,
          updated_at) VALUES (?, ?, ?, 'STARTED', ?)`)
          .run(id, fingerprint, JSON.stringify(request), at);
        db.prepare('INSERT INTO saga_log VALUES (?, ?, NULL, ?)')
          .run(id, 'STARTED', at);
        return { created: true, saga: get(id) };
      });
    },
    transition(id, status, reason = null, event = null) {
      inTransaction(() => {
        const at = now().toISOString();
        db.prepare(`UPDATE sagas SET status = ?, reason = ?, updated_at = ?
          WHERE id = ?`).run(status, reason, at, id);
        db.prepare('INSERT INTO saga_log VALUES (?, ?, ?, ?)')
          .run(id, status, reason, at);
        if (event) {
          db.prepare(`INSERT INTO outbox (saga_id, type, payload)
            VALUES (?, ?, ?)`).run(id, event.type, JSON.stringify(event.payload));
        }
      });
    },
    history: (id) => db.prepare(
      'SELECT status, reason FROM saga_log WHERE saga_id = ? ORDER BY rowid')
      .all(id),
    unfinished: () => db.prepare('SELECT * FROM sagas').all().map(row)
      .filter((saga) => !TERMINAL.has(saga.status)),
    pendingEvents: () => db.prepare(
      'SELECT id, saga_id, type FROM outbox WHERE published = 0 ORDER BY id')
      .all(),
    markPublished: (id) => db.prepare(
      'UPDATE outbox SET published = 1 WHERE id = ?').run(id),
    close: () => db.close(),
  };
}
