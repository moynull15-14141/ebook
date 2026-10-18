import { openDatabase } from '../../project/travel-master-pro/src/db.mjs';

// Catalog-এ দামের সীমা, শুধু খালি আসনের Package, এবং Keyset Pagination।
// সব মান Parameter-এ (?), তাই SQL Injection-এর সুযোগ নেই।
function listPackages(db, { maxPrice = Number.MAX_SAFE_INTEGER,
  onlyAvailable = false, limit = 2, after = '' } = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new RangeError('limit: ১-৫০');
  }
  const rows = db.prepare(`SELECT id, price_bdt AS price, seats FROM packages
    WHERE price_bdt <= ? AND (? = 0 OR seats > 0) AND id > ?
    ORDER BY id LIMIT ?`)
    .all(maxPrice, onlyAvailable ? 1 : 0, after, limit + 1)
    .map((row) => ({ ...row }));
  const page = rows.slice(0, limit);
  return { page, next: rows.length > limit ? page.at(-1).id : null };
}

const db = openDatabase();
db.exec("UPDATE packages SET seats = 0 WHERE id = 'SYL-2D'");
let cursor = '';
do {
  const { page, next } = listPackages(db, { maxPrice: 13_000,
    onlyAvailable: true, limit: 1, after: cursor });
  console.log(page.map((p) => `${p.id} ${p.price}`).join(' | '),
    next ? `(পরের পাতা: ${next}-এর পর)` : '(শেষ)');
  cursor = next;
} while (cursor);
