-- নতুন Column, Default-সহ (পুরোনো সারিও বৈধ থাকে), এবং বিদ্যমান তথ্য থেকে
-- মান পূরণ (Data Migration)।
ALTER TABLE accounts ADD COLUMN tier TEXT NOT NULL DEFAULT 'silver'
  CONSTRAINT tier_known CHECK (tier IN ('silver', 'gold', 'platinum'));

UPDATE accounts SET tier = CASE
  WHEN balance >= 20000 THEN 'platinum'
  WHEN balance >= 5000 THEN 'gold'
  ELSE 'silver'
END;
