# TravelSearch Explorer

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ২৩-এর Project।

১২,০০০টি কাল্পনিক ভ্রমণ-প্যাকেজের খোঁজার Page: Inverted Index দিয়ে শব্দের শুরু ধরে খোঁজ, দাম বা Rating-এ সাজানো, Web Worker-এ খোঁজ, এবং Virtual Scrolling (DOM-এ সর্বোচ্চ প্রায় ২০টি সারি)। সঙ্গে একটি Node.js Profiling Lab (User Timing ও CPU Profile)। কোনো npm Package লাগে না।

> **নোট:** শিক্ষামূলক Demo। তথ্য কাল্পনিক; Virtual List সমান-উচ্চতার সারি ধরে নেয় এবং পূর্ণ Accessibility (Keyboard চলাচল, `aria-rowcount`) দেয় না।

## প্রয়োজন

- Node.js 22 বা নতুন (`node:inspector/promises`, `toSorted`)।
- E2E Test-এর জন্য Chrome বা Edge (না থাকলে কারণসহ Skip; অন্য জায়গায় থাকলে `CHROME_PATH`)।

## চালানো

```bash
node --test
node profile.mjs
node serve.mjs
```

- `node --test`: ১৫টি Test (`search` ৫, `virtual` ৬, `e2e` ৪: একটি Parent ও তিনটি Subtest); শেষে `# pass 15`, `# fail 0`। কোনো Test সময় মাপে না।
- `node profile.mjs`: সরল ও Index-ভিত্তিক খোঁজের Median সময় এবং CPU Profile-এর Self Time। সংখ্যা যন্ত্রভেদে বদলায়; এটি Test নয়।
- `node serve.mjs`: `http://127.0.0.1:8023/` (অন্য Port-এর জন্য `PORT`)। Module Worker `file://` থেকে চলে না, তাই Server লাগে।

## File

| File | কাজ |
| --- | --- |
| `src/data.mjs` | Seed-যুক্ত তথ্য (`generateRecords`, `createRandom`) |
| `src/search.mjs` | `naiveSearch`, `buildIndex`, `indexedSearch` |
| `src/virtual.mjs` | `visibleRange`, `offsetOf` |
| `src/search-worker.mjs` | Web Worker: Index ও খোঁজ |
| `src/app.mjs` | UI: Debounce, `requestId`, Virtual List |
| `src/profile-report.mjs` | CPU Profile থেকে Self Time |
| `profile.mjs` | Profiling Lab |
| `serve.mjs` | স্থানীয় Static Server (127.0.0.1) |
| `tests/` | `search`, `virtual`, `e2e`, `support/browser.mjs` |

## Error ও সীমার আচরণ

- Static Server Project Folder-এর বাইরের পথ এবং অজানা File-এর ধরনে 404 দেয়।
- পুরোনো খোঁজের ধীর উত্তর (`requestId` পুরোনো) উপেক্ষিত।
- ফাঁকা তালিকা, ঋণাত্মক `scrollTop` ও তালিকার শেষের বাইরে Scroll নিরাপদে সামলানো হয় (`virtual.test.mjs`)।
