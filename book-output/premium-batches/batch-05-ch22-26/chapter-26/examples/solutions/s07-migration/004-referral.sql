-- ঐচ্ছিক: পুরোনো সারি NULL থাকে, তাই কিছু ভাঙে না।
ALTER TABLE customers ADD COLUMN referred_by INTEGER
  REFERENCES customers (id) ON DELETE SET NULL;
CREATE INDEX customers_referred_by ON customers (referred_by);
