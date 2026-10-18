-- জরুরি অবস্থায়, Backup-এর পরে, একটি Transaction-এ:
UPDATE accounts SET balance = (
  SELECT COALESCE(SUM(points), 0) FROM ledger_entries e
  WHERE e.customer_id = accounts.customer_id
);
