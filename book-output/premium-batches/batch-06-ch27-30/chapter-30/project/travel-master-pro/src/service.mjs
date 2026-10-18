// @ts-check
import { createHash, randomBytes } from 'node:crypto';
import { AppError } from './errors.mjs';
import { transaction } from './db.mjs';
import { hashPassword, verifyPassword, DUMMY_HASH } from './passwords.mjs';
import { validateRegistration, validateBooking } from './validation.mjs';

/** @typedef {import('node:sqlite').DatabaseSync} Database */
/** @typedef {{ id: number, name: string, email: string }} User */

/** @param {string} token */
const sha256 = (token) => createHash('sha256').update(token).digest('hex');

/** @param {any} row */
const toBooking = (row) => ({ id: row.id, packageId: row.package_id,
  travelers: row.travelers, totalBdt: row.total_bdt, status: row.status,
  createdAt: row.created_at });

/**
 * Domain Service: সব ব্যবসার নিয়ম এখানে; HTTP-র কিছু জানে না।
 * @param {{ db: Database, now?: () => number, tokenTtlMs?: number,
 *   maxFailedLogins?: number }} options
 */
export function createTravelService({ db, now = Date.now,
  tokenTtlMs = 30 * 60_000, maxFailedLogins = 5 }) {
  /** @type {Map<string, { count: number, since: number }>} */
  const failures = new Map();
  const iso = () => new Date(now()).toISOString();

  /**
   * @param {string} type
   * @param {number | null} userId
   * @param {object} detail
   */
  const audit = (type, userId, detail) => db.prepare(
    'INSERT INTO audit_events (type, user_id, detail, at) VALUES (?, ?, ?, ?)')
    .run(type, userId, JSON.stringify(detail), iso());

  /** @param {any} input @returns {User} */
  function register(input) {
    const { name, email, password } = validateRegistration(input);
    const passwordHash = hashPassword(password);
    try {
      const { lastInsertRowid } = db.prepare(`INSERT INTO users
        (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)`)
        .run(name, email, passwordHash, iso());
      audit('user.registered', Number(lastInsertRowid), {});
      return { id: Number(lastInsertRowid), name, email };
    } catch (error) {
      if (/UNIQUE/.test(String(error))) {
        throw new AppError('EMAIL_TAKEN', 'এই Email আগেই নিবন্ধিত');
      }
      throw error;
    }
  }

  /** @param {any} input */
  function login(input) {
    const email = typeof input?.email === 'string'
      ? input.email.trim().toLowerCase() : '';
    const password = typeof input?.password === 'string' ? input.password : '';
    const recent = failures.get(email);
    if (recent && recent.count >= maxFailedLogins
      && now() - recent.since < 15 * 60_000) {
      throw new AppError('TOO_MANY_ATTEMPTS', 'কিছুক্ষণ পরে চেষ্টা করুন');
    }
    /** @type {any} */
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    // অজানা Email-এও একই Hash-যাচাই: সময় দেখে কিছু বোঝা যায় না।
    const ok = verifyPassword(password, user?.password_hash ?? DUMMY_HASH);
    if (!user || !ok) {
      const entry = recent && now() - recent.since < 15 * 60_000
        ? recent : { count: 0, since: now() };
      failures.set(email, { ...entry, count: entry.count + 1 });
      audit('login.failed', user?.id ?? null, {});
      throw new AppError('UNAUTHORIZED', 'Email বা Password ভুল');
    }
    failures.delete(email);
    // Database-এ শুধু Token-এর Hash: Database ফাঁস হলেও Token ব্যবহারযোগ্য নয়।
    const token = randomBytes(32).toString('base64url');
    const expiresAt = now() + tokenTtlMs;
    db.prepare('INSERT INTO sessions VALUES (?, ?, ?)')
      .run(sha256(token), user.id, expiresAt);
    audit('login.succeeded', user.id, {});
    return { token, expiresAt: new Date(expiresAt).toISOString(),
      user: { id: user.id, name: user.name, email: user.email } };
  }

  /** @param {string | undefined} token @returns {User} */
  function authenticate(token) {
    /** @type {any} */
    const row = token && db.prepare(`SELECT u.id, u.name, u.email,
      s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?`).get(sha256(token));
    if (!row || row.expires_at <= now()) {
      throw new AppError('UNAUTHORIZED', 'Login প্রয়োজন');
    }
    return { id: row.id, name: row.name, email: row.email };
  }

  /** @param {string | undefined} token */
  function logout(token) {
    const user = authenticate(token);
    db.prepare('DELETE FROM sessions WHERE token_hash = ?')
      .run(sha256(/** @type {string} */ (token)));
    audit('logout', user.id, {});
  }

  function listPackages() {
    return db.prepare('SELECT id, name, price_bdt AS priceBdt, seats '
      + 'FROM packages ORDER BY id').all().map((row) => ({ ...row }));
  }

  /** @param {number} userId @param {any} input */
  function createBooking(userId, input) {
    const { packageId, travelers, idempotencyKey } = validateBooking(input);
    return transaction(db, () => {
      /** @type {any} */
      const existing = db.prepare(`SELECT * FROM bookings
        WHERE user_id = ? AND idempotency_key = ?`).get(userId, idempotencyKey);
      if (existing) {
        if (existing.package_id !== packageId
          || existing.travelers !== travelers) {
          throw new AppError('KEY_CONFLICT',
            'একই idempotencyKey, কিন্তু ভিন্ন অনুরোধ');
        }
        return { booking: toBooking(existing), replayed: true };
      }
      // শর্তযুক্ত UPDATE: যাচাই ও কমানো একটি Statement-এ, তাই Race নেই।
      const { changes } = db.prepare(`UPDATE packages SET seats = seats - ?
        WHERE id = ? AND seats >= ?`).run(travelers, packageId, travelers);
      if (changes === 0) {
        const found = db.prepare('SELECT 1 FROM packages WHERE id = ?')
          .get(packageId);
        throw found ? new AppError('SOLD_OUT', 'যথেষ্ট আসন নেই')
          : new AppError('NOT_FOUND', 'Package পাওয়া যায়নি');
      }
      // দাম সব সময় Server-এর Catalog থেকে; Client-এর পাঠানো দাম উপেক্ষিত।
      /** @type {any} */
      const pkg = db.prepare('SELECT price_bdt FROM packages WHERE id = ?')
        .get(packageId);
      const { lastInsertRowid } = db.prepare(`INSERT INTO bookings
        (user_id, package_id, travelers, total_bdt, status, idempotency_key,
        created_at) VALUES (?, ?, ?, ?, 'CONFIRMED', ?, ?)`)
        .run(userId, packageId, travelers, pkg.price_bdt * travelers,
          idempotencyKey, iso());
      audit('booking.created', userId, { bookingId: Number(lastInsertRowid) });
      const row = db.prepare('SELECT * FROM bookings WHERE id = ?')
        .get(lastInsertRowid);
      return { booking: toBooking(row), replayed: false };
    });
  }

  /** @param {number} userId */
  function listBookings(userId) {
    return db.prepare('SELECT * FROM bookings WHERE user_id = ? ORDER BY id')
      .all(userId).map(toBooking);
  }

  /** @param {number} userId @param {number} bookingId */
  function cancelBooking(userId, bookingId) {
    return transaction(db, () => {
      /** @type {any} */
      const row = db.prepare(`SELECT * FROM bookings
        WHERE id = ? AND user_id = ?`).get(bookingId, userId);
      // অন্যের Booking-ও "পাওয়া যায়নি": অস্তিত্বের তথ্যও ফাঁস নয়।
      if (!row) throw new AppError('NOT_FOUND', 'Booking পাওয়া যায়নি');
      if (row.status === 'CANCELLED') return toBooking(row); // একবারই ফেরত
      db.prepare("UPDATE bookings SET status = 'CANCELLED' WHERE id = ?")
        .run(bookingId);
      db.prepare('UPDATE packages SET seats = seats + ? WHERE id = ?')
        .run(row.travelers, row.package_id);
      audit('booking.cancelled', userId, { bookingId });
      return toBooking({ ...row, status: 'CANCELLED' });
    });
  }

  return { register, login, authenticate, logout, listPackages,
    createBooking, listBookings, cancelBooking };
}
