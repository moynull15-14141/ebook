# Inventory Dashboard

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ৬-এর Project।

পণ্যের তালিকায় যোগ, বাদ, মজুত বদলানো, খোঁজা, কম মজুতের তালিকা এবং মোট মূল্য। প্রতিটি কাজ মূল তালিকা না বদলে নতুন তালিকা ফেরত দেয়।

> এটি একটি শিক্ষামূলক Project। তথ্য সংরক্ষণ করা হয় না, এবং পণ্যের তথ্য যাচাই করা হয় না।

## চালানো

```bash
node inventory.js
```

## Test চালানো

```bash
node --check inventory.js
node --test
```

`node --test` শেষে `# pass 16` এবং `# fail 0` দেখানোর কথা। কোনো npm Package লাগে না।

## File

| File | কাজ |
| --- | --- |
| `inventory.js` | `addProduct`, `removeProduct`, `findProduct`, `changeStock`, `lowStock`, `totalValue`, `describe`, `printDashboard` |
| `tests/inventory.test.js` | ১৬টি Automated Test, মূল তালিকা অক্ষত থাকার যাচাইসহ |
| `tests/load-script.js` | Test-এর জন্য File-টি আলাদা পরিবেশে চালানোর সহায়ক Code |
