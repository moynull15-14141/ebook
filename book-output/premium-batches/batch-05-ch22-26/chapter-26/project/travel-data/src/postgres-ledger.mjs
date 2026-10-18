// PostgreSQL-এর জন্য একই Ledger-এর চুক্তি (pg Driver, async)।
// এই বইয়ের QA-তে চালানো হয়নি: কোনো PostgreSQL Server ছিল না; শুধু Syntax যাচাই।
import pg from 'pg';

export const createPool = (connectionString) =>
  new pg.Pool({ connectionString, max: 10, idleTimeoutMillis: 30_000 });

// PostgreSQL-এর Error Code: 23505 Unique, 23514 Check, 23503 Foreign Key।
export function createPgLedger(pool) {
  async function run(key, steps) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [i, step] of steps.entries()) {
        await client.query(`INSERT INTO ledger_entries
          (customer_id, points, reason, idempotency_key, created_at)
          VALUES ($1, $2, $3, $4, now())`,
        [step.customerId, step.points, step.reason,
          key ? `${key}:${i}` : null]);
        const { rowCount } = await client.query(
          'UPDATE accounts SET balance = balance + $1 WHERE customer_id = $2',
          [step.points, step.customerId]);
        if (rowCount !== 1) {
          throw new Error('গ্রাহকের Account নেই');
        }
      }
      await client.query('COMMIT');
      return { duplicate: false };
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.code === '23505' && key) {
        return { duplicate: true };
      }
      throw error;
    } finally {
      client.release();
    }
  }

  return {
    earn: (customerId, points, reason, key) =>
      run(key, [{ customerId, points, reason }]),
    redeem: (customerId, points, reason, key) =>
      run(key, [{ customerId, points: -points, reason }]),
  };
}
