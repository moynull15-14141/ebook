-- গ্রাহক, তাঁর Loyalty Account, এবং প্রতিটি Point-এর লেনদেন (Ledger)।
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
    CONSTRAINT name_length CHECK (length(trim(name)) BETWEEN 2 AND 80),
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  phone TEXT NOT NULL UNIQUE
    CONSTRAINT phone_format CHECK (length(phone) = 11
      AND phone GLOB '01[3-9]*' AND phone NOT GLOB '*[^0-9]*'),
  city TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE accounts (
  customer_id INTEGER PRIMARY KEY REFERENCES customers (id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0
    CONSTRAINT balance_not_negative CHECK (balance >= 0)
);

CREATE TABLE ledger_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES customers (id),
  points INTEGER NOT NULL CONSTRAINT points_not_zero CHECK (points <> 0),
  reason TEXT NOT NULL,
  idempotency_key TEXT UNIQUE,
  created_at TEXT NOT NULL
);
