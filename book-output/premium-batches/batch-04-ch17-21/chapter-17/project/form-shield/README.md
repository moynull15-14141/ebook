# FormShield

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ১৭-এর Project।

একটি Schema-ভিত্তিক Validation Engine (ES Module, DOM-মুক্ত): প্রতিটি ঘরের জন্য Normalization, ছোট নামযুক্ত নিয়ম এবং নিজস্ব বার্তা; সব ভুল একসঙ্গে। নিরাপত্তা: প্রতিটি ঘরের দৈর্ঘ্য Regex-এর আগে যাচাই (ReDoS প্রতিরোধ), Schema-র বাইরের ঘর বাদ (Mass Assignment প্রতিরোধ), `__proto__` ধরনের Key ফলে যায় না।

> এটি একটি শিক্ষামূলক Project। Browser-এর যাচাই শুধু সুবিধা; Server-এ একই Schema আবার চালাতে হবে।

## চালানো

```bash
node demo.mjs
node --test
```

`node --test` ২৪টি Test চালায় (`normalize` ৫, `rules` ১০, `engine` ৯); শেষে `# pass 24`, `# fail 0`। Node.js 22 বা নতুন সংস্করণ; কোনো npm Package লাগে না।

## File

| File | কাজ |
| --- | --- |
| `src/normalize.mjs` | `toAsciiDigits`, `cleanText`, `normalizePhone`, `normalizeEmail` |
| `src/patterns.mjs` | নামযুক্ত Regex (`PATTERNS`), `escapeRegExp` |
| `src/rules.mjs` | `required`, `length`, `matches`, `notIn`, `realDate`, `passwordPolicy` |
| `src/engine.mjs` | `validate(schema, input)`, `MAX_INPUT` |
| `signup-schema.mjs` | একটি Signup Form-এর Schema |
| `demo.mjs` | বৈধ ও অবৈধ ইনপুট এবং ১০ লক্ষ অক্ষরের ইনপুটের প্রদর্শনী |
