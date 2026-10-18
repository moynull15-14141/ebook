# LedgerFlow

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ১৮-এর Project।

একটি Order Ledger থেকে Report (Node.js, ES Module): মাসিক File Asynchronous ভাবে দলে দলে আনা (সর্বোচ্চ ২টি একসঙ্গে, একটির ব্যর্থতায় বাকিগুলো চলে), Result Type দিয়ে Order যাচাই, `flatMap` দিয়ে পণ্য-সারি, `Map` Index দিয়ে পণ্য ও গ্রাহকের সঙ্গে Join, অঞ্চল × মাস Pivot, শীর্ষ গ্রাহক (বাংলা নামের নিয়মে), এবং Structural Sharing-সহ Immutable Refund।

> এটি একটি শিক্ষামূলক Project; তথ্য `data/sample.mjs`-এ নমুনা।

## চালানো

```bash
node report.mjs
node --test
```

`node --test` ২২টি Test চালায় (`immutable` ৬, `transform` ১২, `load` ৪); প্রতিটি ইনপুট Deep Freeze করা, তাই কোনো Function ইনপুট বদলালে Test সঙ্গে সঙ্গে ব্যর্থ হয়। শেষে `# pass 22`, `# fail 0`। Node.js 22 বা নতুন সংস্করণ (`Map.groupBy`-এর জন্য ২১+); কোনো npm Package লাগে না।

## File

| File | কাজ |
| --- | --- |
| `src/immutable.mjs` | `updateIn`, `setIn`, `deepFreeze` |
| `src/validate.mjs` | Result Type (`ok`, `fail`), `validateOrder` |
| `src/transform.mjs` | `indexBy`, `flattenOrders`, `joinLines`, `pivotRegionMonth`, `topCustomers`, `applyRefund`, `totalOf` |
| `src/load.mjs` | `loadInBatches` |
| `data/sample.mjs` | পণ্য, গ্রাহক, তিন মাসের Order, কৃত্রিম Loader |
| `report.mjs` | পুরো Pipeline ও Invariant যাচাই |
