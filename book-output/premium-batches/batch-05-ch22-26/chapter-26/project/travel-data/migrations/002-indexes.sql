-- প্রায়ই চলা Query-র জন্য Index: একজন গ্রাহকের লেনদেন সময়ের ক্রমে,
-- এবং শহর ধরে গ্রাহক।
CREATE INDEX ledger_customer_time ON ledger_entries (customer_id, created_at);
CREATE INDEX customers_city ON customers (city);
