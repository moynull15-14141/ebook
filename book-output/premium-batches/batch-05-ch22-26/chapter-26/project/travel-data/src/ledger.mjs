import { withTransaction } from './db.mjs';
import { DataError, translate } from './errors.mjs';

const MESSAGES = {
  balance_not_negative: 'যথেষ্ট Point নেই',
  FOREIGN_KEY: 'গ্রাহক নেই',
};

// Ledger: প্রতিটি পরিবর্তন একটি নতুন সারি, কখনো মুছে বা বদলে নয় (Append-only)।
// balance তার যোগফলের একটি দ্রুত Copy, একই Transaction-এ হালনাগাদ।
export function createLedger(db, { now = () => new Date() } = {}) {
  const sql = {
    entry: db.prepare(`INSERT INTO ledger_entries
      (customer_id, points, reason, idempotency_key, created_at)
      VALUES (?, ?, ?, ?, ?)`),
    adjust: db.prepare(
      'UPDATE accounts SET balance = balance + ? WHERE customer_id = ?'),
    seen: db.prepare('SELECT 1 FROM ledger_entries WHERE idempotency_key = ?'),
    balance: db.prepare(
      'SELECT balance, tier FROM accounts WHERE customer_id = ?'),
    audit: db.prepare(`SELECT a.customer_id AS id, a.balance,
      COALESCE(SUM(e.points), 0) AS total
      FROM accounts a
      LEFT JOIN ledger_entries e ON e.customer_id = a.customer_id
      GROUP BY a.customer_id HAVING a.balance <> total`),
  };

  function post(customerId, points, reason, key) {
    sql.entry.run(customerId, points, reason, key, now().toISOString());
    if (sql.adjust.run(points, customerId).changes !== 1) {
      throw new DataError('NOT_FOUND', 'গ্রাহকের Account নেই');
    }
  }

  // একই key আগে দেখা গেলে কিছুই না করে duplicate: true (নিরাপদ Retry)।
  function run(key, steps) {
    if (!Number.isInteger(steps[0].points) || steps[0].points === 0) {
      throw new DataError('INVALID', 'Point শূন্য নয় এমন পূর্ণসংখ্যা');
    }
    try {
      return withTransaction(db, () => {
        if (key && sql.seen.get(`${key}:0`)) {
          return { duplicate: true };
        }
        steps.forEach((s, i) => post(s.customerId, s.points, s.reason,
          key ? `${key}:${i}` : null));
        return { duplicate: false };
      });
    } catch (error) {
      throw translate(error, MESSAGES);
    }
  }

  const earn = (customerId, points, reason, key) =>
    run(key, [{ customerId, points, reason }]);
  const redeem = (customerId, points, reason, key) =>
    run(key, [{ customerId, points: -points, reason }]);
  // এক গ্রাহক থেকে আরেকজনে: দুটি সারি, একটি Transaction—আধা-সম্পূর্ণ হয় না।
  const transfer = (from, to, points, key) => run(key, [
    { customerId: from, points: -points, reason: `transfer to ${to}` },
    { customerId: to, points, reason: `transfer from ${from}` },
  ]);

  const balanceOf = (customerId) => {
    const row = sql.balance.get(customerId);
    return row ? { ...row } : null;
  };
  // Invariant: প্রতিটি balance তার Ledger-এর যোগফলের সমান। মিল না থাকলে তালিকা।
  const audit = () => sql.audit.all().map((row) => ({ ...row }));

  return { earn, redeem, transfer, balanceOf, audit };
}
