# CurrencyDesk

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ২২-এর Project।

একটি ভ্রমণ সংস্থার মুদ্রা-বিনিময় Counter-এর Quote Service (Node.js, ES Module, কোনো npm Package নয়): পরিমাণ যাচাই, স্তরভিত্তিক Fee, Rate Provider থেকে হার (Cache ও Retry-সহ), Quote-এর মেয়াদ, HTTP API এবং একটি ছোট Browser UI। Project-এর মূল বিষয় তার ৩৮টি Test: Unit, Table-driven ও Boundary, Mock (`mock.fn`, `mock.timers`), Property-based, Integration (স্থানীয় HTTP Server) এবং আসল Browser-এ End-to-end।

> **নোট:** শিক্ষামূলক Demo। হারগুলো কাল্পনিক; Server শুধু `127.0.0.1`-এ চলে; বাস্তব অর্থ-লেনদেনের নিয়ন্ত্রণ (Authentication, Audit, আইনি অনুমোদন) নেই।

## প্রয়োজন

- Node.js 22 বা নতুন (`node:test`-এর `mock.timers`, Coverage)।
- End-to-end Test-এর জন্য Chrome বা Edge। না থাকলে সেই Test কারণসহ Skip হয়; অন্য জায়গায় Browser থাকলে `CHROME_PATH` Environment Variable দিন।

## চালানো

```bash
node --test
node --test --experimental-test-coverage
node server.mjs
```

অথবা `npm test`, `npm run coverage`, `npm start` (কোনো Dependency Install লাগে না)। `node --test` শেষে `# pass 38`, `# fail 0`। `node server.mjs` একটি স্থানীয় ঠিকানা দেখায়; Browser-এ খুলে Quote দেখুন; বন্ধ করতে Ctrl+C।

## File

| File | কাজ |
| --- | --- |
| `src/money.mjs` | পয়সায় হিসাব: `parseAmount`, `formatAmount`, `convert` (BigInt) |
| `src/fees.mjs` | স্তরভিত্তিক Fee, `MAX_AMOUNT` |
| `src/rates.mjs` | Rate Client: Cache, Retry, `RateError` |
| `src/quote.mjs` | Quote Service, মেয়াদ |
| `src/rate-server.mjs` | স্থানীয় নকল Rate Provider (`controls.failNext`) |
| `src/api.mjs` | HTTP API (`POST /api/quotes`) ও Static File |
| `src/start.mjs` | দুই Server জোড়া লাগানো (`startDesk`) |
| `tests/*.test.mjs` | money, fees, rates, property, quote, integration, e2e |
| `tests/support/browser.mjs` | ছোট DevTools Protocol Client (E2E) |
| `.github/workflows/test.yml` | GitHub Actions CI (এই বইয়ের QA-তে GitHub-এ চালানো হয়নি) |

## Error ও HTTP Status

| অবস্থা | Status |
| --- | --- |
| Quote তৈরি | 201 |
| অবৈধ পরিমাণ, সীমার বাইরে, অবৈধ মুদ্রা, ভাঙা JSON | 400 |
| অজানা মুদ্রা-জোড়া | 404 |
| Rate Provider-এর সমস্যা (Retry-র পরেও) | 502 |
| অপ্রত্যাশিত Error | 500, সাধারণ বার্তা |
