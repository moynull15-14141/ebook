# User Directory API Explorer

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ১০-এর Project।

একটি Server থেকে User-দের তালিকা এনে খোঁজা ও সাজানোর Web Page। মূল বিষয় Network-এর বাস্তব পরিস্থিতি সামলানো: Loading অবস্থা, সময়সীমা, সাময়িক ত্রুটিতে Backoff-সহ আবার চেষ্টা, ব্যবহারকারীর ভাষায় ত্রুটির বার্তা, চলমান Request বাতিল, এবং পুরোনো সাড়া যেন নতুনটির ওপরে না বসে।

> এটি একটি শিক্ষামূলক Project। স্বাভাবিক অবস্থায় তথ্য আসে JSONPlaceholder Demo API (`https://jsonplaceholder.typicode.com/users`) থেকে; তথ্যগুলো কাল্পনিক।

## চালানো

Project Folder থেকে একটি Local Server চালান, তারপর Browser-এ `http://localhost:8000` খুলুন (Internet সংযোগ লাগবে):

```bash
python -m http.server 8000
```

## Test চালানো

```bash
node --check directory.js
node --test
node tests/browser-check.mjs
```

- `node --test` ১৮টি Test চালায়: কৃত্রিম `fetch` দিয়ে Unit Test, এবং `tests/mock-server.js`-এর Local Server দিয়ে আসল `fetch`-এর Integration Test। শেষে `# pass 18` এবং `# fail 0`।
- `node tests/browser-check.mjs` Local Server চালিয়ে আসল Headless Chrome বা Edge-এ Page খোলে, এবং Server-এর সাড়া নিয়ন্ত্রণ করে ১২টি আচরণ যাচাই করে: Loading, সফলতা, খোঁজা ও সাজানো, Retry, 404, পুনরুদ্ধার, সময়সীমা, ভাঙা তথ্য, Race Condition, নিরাপত্তা, ফাঁকা তালিকা এবং Console-এর ত্রুটি। শেষে `# pass 12` এবং `# fail 0`।

কোনো Test Internet বা Public API ব্যবহার করে না। Node.js 22 বা নতুন সংস্করণ লাগবে; Browser Test-এর জন্য Chrome বা Edge (অন্য জায়গায় থাকলে `CHROME_PATH`)। কোনো npm Package লাগে না।

## পরীক্ষার জন্য URL Parameter

`index.html?api=/api/users&timeout=400` লিখলে Page আসল API-র বদলে দেওয়া ঠিকানা থেকে তথ্য আনে, এবং সময়সীমা হয় ৪০০ মিলিসেকেন্ড। Browser Test এভাবেই Page-কে Local Server-এর দিকে পাঠায়।

## File

| File | কাজ |
| --- | --- |
| `index.html`, `style.css` | Page-এর গঠন ও চেহারা |
| `directory.js` | `normalizeUser`, `filterUsers`, `sortUsers`, `wait`, `fetchJson`, `fetchWithRetry`, `loadUsers`, `errorMessage` |
| `app.js` | Page, Event, Loading ও ত্রুটির অবস্থা, বাতিল এবং সর্বশেষ Request যাচাই |
| `tests/directory.test.js` | ১৮টি Unit ও Integration Test |
| `tests/mock-server.js` | পরীক্ষার জন্য নিয়ন্ত্রিত Local Server |
| `tests/browser-check.mjs` | ১২টি Browser Test |
| `tests/load-script.js`, `tests/cdp.mjs` | Test-এর সহায়ক Code |
