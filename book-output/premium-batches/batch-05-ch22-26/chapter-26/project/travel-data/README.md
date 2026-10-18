# TravelData Pro

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ২৬-এর Project।

একটি ভ্রমণ সংস্থার গ্রাহক ও Loyalty Point-এর Data Layer, Node.js-এর অন্তর্নির্মিত `node:sqlite` দিয়ে: Constraint-সহ Schema, Checksum-যাচাই করা Migration, Append-only Ledger (earn, redeem, transfer) Transaction ও Idempotency Key-সহ, Audit, Keyset Pagination, নিরাপদ খোঁজ, Report, Query Plan এবং যাচাই-করা Backup। কোনো npm Package লাগে না।

> **নোট:** শিক্ষামূলক Project। সব Test নিজস্ব Memory বা Temp Database তৈরি করে; কোনো আসল Database-এ যুক্ত হয় না। `src/postgres-ledger.mjs` একটি PostgreSQL (`pg`) সংস্করণ, যা এই বইয়ের QA-তে **চালানো হয়নি** (PostgreSQL Server ছিল না; শুধু `node --check` দিয়ে Syntax যাচাই)। ব্যবহার করতে `npm install pg` এবং একটি PostgreSQL Database ও Schema লাগবে।

## প্রয়োজন

Node.js 22.5 বা নতুন (`node:sqlite`; চালানোর সময় একটি "ExperimentalWarning" স্বাভাবিক)।

## চালানো

```bash
node --test
node demo.mjs
```

- `node --test`: ২১টি Test (`schema` ৬, `ledger` ৬, `concurrency` ৪, `queries` ৫); শেষে `# pass 21`, `# fail 0`।
- `node demo.mjs`: Operating System-এর Temp Folder-এ একটি নতুন Database (`travel-data-demo/travel.db`) তৈরি করে পুরো প্রবাহ দেখায়, এবং একটি Backup বানিয়ে যাচাই করে।

## File

| File | কাজ |
| --- | --- |
| `migrations/001-init.sql` | `customers`, `accounts`, `ledger_entries`, নামযুক্ত Constraint |
| `migrations/002-indexes.sql` | Index |
| `migrations/003-tier.sql` | নতুন Column ও Data Migration |
| `src/db.mjs` | `openDatabase` (Foreign Key, WAL, busy_timeout), `withTransaction`, `constraintOf` |
| `src/migrate.mjs` | Migration Runner (`schema_migrations`, Checksum) |
| `src/errors.mjs` | `DataError`, `translate` |
| `src/customers.mjs` | `create`, `byCity` (Keyset), `search` (LIKE Escape), `findByEmail` |
| `src/ledger.mjs` | `earn`, `redeem`, `transfer`, `balanceOf`, `audit` |
| `src/reports.mjs` | `topCustomers`, `monthlyPoints`, `planOf` |
| `src/backup.mjs` | `backupTo` (VACUUM INTO, integrity_check, সারি গণনা) |
| `src/postgres-ledger.mjs` | PostgreSQL সংস্করণ (চালানো হয়নি) |

## Error

`DataError`-এর `code`: `UNIQUE`, `CHECK`, `FOREIGN_KEY`, `NOT_FOUND`, `INVALID`; বার্তা ব্যবসার ভাষায় (যেমন "যথেষ্ট Point নেই")। ব্যর্থ প্রতিটি কাজ Rollback হয়: কোনো আধা-লেখা থাকে না।
