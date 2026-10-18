import { DatabaseSync } from 'node:sqlite';

// প্রতিটি সংযোগে একই Setting: Foreign Key চালু (SQLite-এ Default বন্ধ!),
// WAL Journal (পড়া ও লেখা একসঙ্গে), এবং ব্যস্ত থাকলে কতক্ষণ অপেক্ষা।
export function openDatabase(file = ':memory:', options = {}) {
  const { busyTimeoutMs = 2_000 } = options;
  const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys = ON');
  if (file !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL');
  }
  db.exec(`PRAGMA busy_timeout = ${Number(busyTimeoutMs)}`);
  return db;
}

// fn-এর সব কাজ একসঙ্গে সফল, নয়তো কিছুই নয় (Atomicity)।
// IMMEDIATE: শুরুতেই লেখার Lock, যাতে মাঝপথে অন্য Writer-এর সঙ্গে সংঘাত না হয়।
export function withTransaction(db, fn) {
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

// SQLite-এর Constraint Error-কে অর্থপূর্ণ Code-এ রূপান্তর।
export function constraintOf(error) {
  const message = String(error?.message ?? '');
  if (message.includes('UNIQUE constraint failed')) {
    return { code: 'UNIQUE', column: message.split(': ').at(-1) };
  }
  if (message.includes('CHECK constraint failed')) {
    return { code: 'CHECK', column: message.split(': ').at(-1) };
  }
  if (message.includes('FOREIGN KEY constraint failed')) {
    return { code: 'FOREIGN_KEY', column: null };
  }
  return null;
}
