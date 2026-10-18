# PerfLab

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ১৯-এর Project।

একটি ছোট Performance Toolkit (Node.js, ES Module): Warm-up, পুনরাবৃত্তি, Median ও p95-সহ Benchmark Harness; একই কাজের ধীর ও দ্রুত Algorithm-জোড়া; আকার, মেয়াদ ও পরিসংখ্যানসহ LRU Cache; এবং দীর্ঘ কাজ টুকরোয় ভাগের সাহায্যকারী।

> এটি একটি শিক্ষামূলক Project। Harness পরিসংখ্যানগত তাৎপর্য যাচাই করে না; পূর্ণাঙ্গ কাজের জন্য প্রতিষ্ঠিত Benchmark Library ব্যবহার করুন।

## চালানো

```bash
node --test
node run-bench.mjs
```

`node --test` ২০টি Test চালায় (`algorithms` ৮, `lru` ৬, `bench-chunk` ৬); শেষে `# pass 20`, `# fail 0`। কোনো Test সময়ের ওপর নির্ভর করে না: Algorithm-জোড়ার ফল Seed-যুক্ত এলোমেলো ইনপুটে মেলানো হয়, আর Harness ও Cache-এর সময় আসে কৃত্রিম ঘড়ি থেকে।

`node run-bench.mjs` আসল সময় মাপে এবং `results/benchmark-report.md`-এ পরিবেশসহ Report লেখে। সংখ্যা যন্ত্র ও মুহূর্তভেদে বদলায়; তুলনা করুন অনুপাত, একক সংখ্যা নয়। Benchmark Test-এর অংশ নয়, এবং কখনো Pass/Fail শর্ত নয়।

Node.js 20 বা নতুন সংস্করণ (`toSorted`-এর জন্য); কোনো npm Package লাগে না।

## File

| File | কাজ |
| --- | --- |
| `src/bench.mjs` | `summarize`, `bench`, `environment` |
| `src/algorithms.mjs` | `uniqueNested`/`uniqueSet`, `commonNested`/`commonSet`, `indexOfLinear`/`indexOfBinary` |
| `src/lru.mjs` | `LruCache` (limit, ttlMs, now, stats) |
| `src/chunk.mjs` | `processInChunks` |
| `src/random.mjs` | `createRandom` (Seed-যুক্ত, নিরাপত্তার কাজে নয়), `randomInts` |
| `run-bench.mjs` | Benchmark চালিয়ে Report লেখে |
| `results/benchmark-report.md` | লেখার সময়ের একটি আসল Report |

## Error Handling

- `LruCache`-এ অবৈধ `limit` এবং `processInChunks`-এ অবৈধ `size` হলে `RangeError`।
- Algorithm-গুলো সংখ্যার Array ধরে নেয়; `indexOfBinary`-র ইনপুট ছোট থেকে বড় সাজানো হতে হবে।
