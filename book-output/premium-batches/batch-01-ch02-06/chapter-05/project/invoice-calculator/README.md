# Invoice Calculator

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ৫-এর Project।

পণ্যের তালিকা থেকে উপমোট, ছাড়, কর এবং সর্বমোট হিসাব করে। সব অঙ্ক পয়সায় (পূর্ণসংখ্যায়) রাখা হয়।

> এটি একটি শিক্ষামূলক Project। করের হার উদাহরণমূলক, এবং পণ্যের তথ্য যাচাই করা হয় না।

## চালানো

```bash
node invoice.js
```

## Test চালানো

```bash
node --check invoice.js
node --test
```

`node --test` শেষে `# pass 14` এবং `# fail 0` দেখানোর কথা। কোনো npm Package লাগে না।

## File

| File | কাজ |
| --- | --- |
| `invoice.js` | `formatTaka`, `lineTotal`, `percentOf`, `calculateInvoice`, `printInvoice` |
| `tests/invoice.test.js` | ১৪টি Automated Test |
| `tests/load-script.js` | Test-এর জন্য File-টি আলাদা পরিবেশে চালানোর সহায়ক Code |
