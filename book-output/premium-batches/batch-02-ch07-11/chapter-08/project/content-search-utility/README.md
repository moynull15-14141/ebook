# Content Search Utility

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ৮-এর Project।

বাংলা, ইংরেজি এবং মেশানো লেখার জন্য একটি সহায়ক: শব্দ ও অক্ষর গণনা (Code Point এবং চোখে দেখা অক্ষর), Slug, শব্দ না কেটে সারাংশ, সবচেয়ে বেশি ব্যবহৃত শব্দ, এবং বড়-ছোট হাতের অক্ষর নির্বিশেষে খুঁজে `[ ]` দিয়ে চিহ্নিত করা। সব তুলনার আগে লেখা Unicode NFC-তে আনা হয়।

> এটি একটি শিক্ষামূলক Project। খোঁজা আক্ষরিক: বানানভেদ বা শব্দের রূপভেদ ধরে না। কোনো HTML তৈরি হয় না।

## চালানো

```bash
node text-tools.js
```

Node.js 18 বা নতুন সংস্করণ লাগবে (`Intl.Segmenter` এবং Unicode Regex-এর জন্য)।

## Test চালানো

```bash
node --check text-tools.js
node --test
```

`node --test` শেষে `# pass 16` এবং `# fail 0` দেখানোর কথা। কোনো npm Package লাগে না।

## File

| File | কাজ |
| --- | --- |
| `text-tools.js` | `normalizeText`, `toWords`, `countCharacters`, `makeSlug`, `makeExcerpt`, `topWords`, `findAll`, `highlight` |
| `tests/text-tools.test.js` | ১৬টি Automated Test |
| `tests/load-script.js` | Test-এর জন্য File-টি আলাদা পরিবেশে চালানোর সহায়ক Code |
