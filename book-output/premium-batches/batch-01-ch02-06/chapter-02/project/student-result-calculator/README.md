# Student Result Calculator

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ২-এর Project।

তিনটি বিষয়ের নম্বর (Text হিসেবে) যাচাই করে মোট, গড়, Grade এবং উত্তীর্ণ হওয়ার অবস্থা বের করে।

> এটি একটি শিক্ষামূলক Project। Grade-এর সীমাগুলো উদাহরণ মাত্র; কোনো শিক্ষা বোর্ডের সরকারি নিয়ম নয়।

## চালানো

```bash
node result.js
```

## Test চালানো

```bash
node --check result.js
node --test
```

`node --test` শেষে `# pass 14` এবং `# fail 0` দেখানোর কথা। কোনো npm Package লাগে না।

## File

| File | কাজ |
| --- | --- |
| `result.js` | `toMark`, `getGrade`, `calculateResult` এবং তিনটি উদাহরণ |
| `tests/result.test.js` | ১৪টি Automated Test |
| `tests/load-script.js` | Test-এর জন্য File-টি আলাদা পরিবেশে চালানোর সহায়ক Code |
