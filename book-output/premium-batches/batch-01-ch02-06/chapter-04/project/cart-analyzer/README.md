# Cart Analyzer

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ৪-এর Project।

একটি Cart-এর সব পণ্য Loop দিয়ে ঘুরে মোট টাকা, মোট পরিমাণ, সবচেয়ে বড় অঙ্কের পণ্য এবং একটি সীমার বেশি অঙ্কের পণ্যগুলো বের করে।

> এটি একটি শিক্ষামূলক Project। ছাড়, Delivery এবং Text থেকে রূপান্তর এখানে নেই।

## চালানো

```bash
node cart.js
```

## Test চালানো

```bash
node --check cart.js
node --test
```

`node --test` শেষে `# pass 15` এবং `# fail 0` দেখানোর কথা। কোনো npm Package লাগে না।

## File

| File | কাজ |
| --- | --- |
| `cart.js` | `isValidItem`, `analyzeCart`, `printReport` এবং একটি নমুনা Cart |
| `tests/cart.test.js` | ১৫টি Automated Test |
| `tests/load-script.js` | Test-এর জন্য File-টি আলাদা পরিবেশে চালানোর সহায়ক Code |
