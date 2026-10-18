// Report-এর Query: JOIN, GROUP BY, এবং Query Plan দেখার সাহায্যকারী।
export function topCustomers(db, limit = 5) {
  return db.prepare(`SELECT c.name, c.city, a.balance, a.tier
    FROM customers c JOIN accounts a ON a.customer_id = c.id
    ORDER BY a.balance DESC, c.id LIMIT ?`)
    .all(limit).map((row) => ({ ...row }));
}

export function monthlyPoints(db, customerId) {
  return db.prepare(`SELECT substr(created_at, 1, 7) AS month,
      SUM(CASE WHEN points > 0 THEN points ELSE 0 END) AS earned,
      SUM(CASE WHEN points < 0 THEN -points ELSE 0 END) AS spent
    FROM ledger_entries WHERE customer_id = ?
    GROUP BY month ORDER BY month`).all(customerId).map((row) => ({ ...row }));
}

// EXPLAIN QUERY PLAN: Database Query-টি কীভাবে চালাবে (Index, না পুরো Table)।
export function planOf(db, sql, ...params) {
  return db.prepare(`EXPLAIN QUERY PLAN ${sql}`).all(...params)
    .map((row) => row.detail);
}
