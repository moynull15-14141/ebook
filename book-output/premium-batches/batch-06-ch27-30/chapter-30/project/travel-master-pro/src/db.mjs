// @ts-check
import { DatabaseSync } from 'node:sqlite';

// Schema-ই শেষ পাহারাদার: Code-এ Bug থাকলেও seats কখনো ঋণাত্মক নয়,
// আর একই ব্যবহারকারীর একই idempotency_key দুটি Booking হতে পারে না।
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_bdt INTEGER NOT NULL CHECK (price_bdt > 0),
  seats INTEGER NOT NULL CHECK (seats >= 0));
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  package_id TEXT NOT NULL REFERENCES packages(id),
  travelers INTEGER NOT NULL CHECK (travelers BETWEEN 1 AND 10),
  total_bdt INTEGER NOT NULL CHECK (total_bdt > 0),
  status TEXT NOT NULL CHECK (status IN ('CONFIRMED', 'CANCELLED')),
  idempotency_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (user_id, idempotency_key));
CREATE INDEX IF NOT EXISTS bookings_by_user ON bookings (user_id, id);
CREATE TABLE IF NOT EXISTS audit_events (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL,
  user_id INTEGER,
  detail TEXT NOT NULL,
  at TEXT NOT NULL);`;

export const SEED_PACKAGES = [
  ['BT-4D', 'Bandarban Trek, ৪ দিন', 12_500, 12],
  ['CXB-3D', "Cox's Bazar Beach, ৩ দিন", 9_800, 20],
  ['SYL-2D', 'Sylhet চা-বাগান, ২ দিন', 6_500, 2],
  ['SDB-3D', 'Sundarbans Boat Safari, ৩ দিন', 15_500, 8],
];

/** @param {string} [path] */
export function openDatabase(path = ':memory:') {
  const db = new DatabaseSync(path);
  db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  if (path !== ':memory:') db.exec('PRAGMA journal_mode = WAL;');
  db.exec(SCHEMA);
  const insert = db.prepare(`INSERT OR IGNORE INTO packages
    (id, name, price_bdt, seats) VALUES (?, ?, ?, ?)`);
  for (const row of SEED_PACKAGES) insert.run(...row);
  return db;
}

/**
 * BEGIN IMMEDIATE: লেখার Lock শুরুতেই, তাই দুটি সংযোগ একই সঙ্গে
 * "আসন আছে" দেখে দুজনেই বিক্রি করতে পারে না।
 * @template T
 * @param {DatabaseSync} db
 * @param {() => T} work
 * @returns {T}
 */
export function transaction(db, work) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = work();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
