# Sales Function Lab

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ১৪-এর Project।

বিক্রির তালিকা থেকে Report (Node.js): অবৈধ সারি কারণসহ বাদ, মোট আয়, বিভাগভিত্তিক আয় ও শীর্ষ বিক্রি। পুরো হিসাব Pure Function-এর Pipeline; Side Effect শুধু `report.mjs`-এ। সঙ্গে একটি ছোট Functional সরঞ্জামের Module (`pipe`, `compose`, `curry`, `memoize`, `once`, `debounce`, `throttle`)।

> এটি একটি শিক্ষামূলক Project; তথ্য `data/sales.mjs`-এ নমুনা।

## চালানো

```bash
node report.mjs
node --test
```

`node --test` ২২টি Test চালায় (`tests/fp.test.mjs` ১০টি, `tests/sales.test.mjs` ১২টি); শেষে `# pass 22`, `# fail 0`। Debounce ও Throttle-এর Test Node.js-এর `mock.timers` (Fake Timer) দিয়ে, তাই আসল সময়ের অপেক্ষা নেই। Node.js 22 বা নতুন সংস্করণ লাগবে; কোনো npm Package লাগে না।

## File

| File | কাজ |
| --- | --- |
| `src/fp.mjs` | Functional সরঞ্জাম |
| `src/sales.mjs` | `validateSale`, `withTotal`, `inCategory`, `atLeast`, `sumBy`, `partitionValid`, `totalsByCategory`, `topSales`, `salesReport` |
| `src/format.mjs` | `formatTaka`; Memoized `formatterFor` |
| `data/sales.mjs` | আটটি নমুনা বিক্রি, দুটি ইচ্ছাকৃতভাবে অবৈধ |
| `report.mjs` | Report ছাপা |
