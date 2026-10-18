# Student Management System

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ৭-এর Project।

শিক্ষার্থীদের তথ্য যোগ, যাচাই, নম্বর বদলানো, মোছা, খোঁজা এবং সারসংক্ষেপ। প্রতিটি কাজ মূল তালিকা না বদলে নতুন তালিকা ফেরত দেয়।

> এটি একটি শিক্ষামূলক Project। তথ্য সংরক্ষণ করা হয় না; উদাহরণের ফোন নম্বরগুলো কাল্পনিক।

## চালানো

```bash
node students.js
```

## Test চালানো

```bash
node --check students.js
node --test
```

`node --test` শেষে `# pass 16` এবং `# fail 0` দেখানোর কথা। কোনো npm Package লাগে না।

## File

| File | কাজ |
| --- | --- |
| `students.js` | `gradeFor`, `validateStudent`, `addStudent`, `updateMarks`, `removeStudent`, `searchStudents`, `summarize`, `formatStudent` |
| `tests/students.test.js` | ১৬টি Automated Test |
| `tests/load-script.js` | Test-এর জন্য File-টি আলাদা পরিবেশে চালানোর সহায়ক Code |
