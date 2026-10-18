# Bookmark Vault

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ১৫-এর Project।

ডেভেলপারদের Link-এর একটি ব্যক্তিগত ভান্ডার, Browser API-র বাস্তব ব্যবহার দেখাতে: `URL` দিয়ে যাচাই (শুধু `http:`/`https:`), খোঁজা ও ছাঁকনি URL-এ (History API), তালিকা `localStorage`-এ, অর্ধেক লেখা Form `sessionStorage`-এ, অন্য Tab-এর সঙ্গে `storage` Event দিয়ে সমন্বয়, Blob দিয়ে JSON Export এবং File দিয়ে Import।

> এটি একটি শিক্ষামূলক Project; তথ্য শুধু এই Browser-এ থাকে।

## চালানো

Module Script ও `crypto.randomUUID`-এর জন্য Local Server লাগে:

```bash
python -m http.server 8000
```

তারপর Browser-এ `http://localhost:8000`।

## Test চালানো

```bash
node --test
node tests/browser-check.mjs
```

- `node --test`: ২১টি Node.js Test (`tests/bookmarks.test.mjs` ১৬টি, `tests/url-state.test.mjs` ৫টি); শেষে `# pass 21`, `# fail 0`।
- `node tests/browser-check.mjs`: Local Server (`tests/static-server.mjs`) চালিয়ে আসল Headless Chrome বা Edge-এ ১৪টি আচরণ যাচাই করে, যার মধ্যে আছে Export-এর Blob-এর বিষয়বস্তু, DevTools Protocol দিয়ে আসল File বাছাই করে Import, এবং একটি `<iframe>` দিয়ে দ্বিতীয় Tab-এর `storage` Event। Node.js 22+ এবং Chrome বা Edge লাগবে (অন্য জায়গায় থাকলে `CHROME_PATH`)।

কোনো npm Package লাগে না।

## File

| File | কাজ |
| --- | --- |
| `src/bookmarks.mjs` | যাচাই, তালিকার কাজ, ছাঁকনি, Import ও Export (Pure; Node.js-এ চলে) |
| `src/url-state.mjs` | ছাঁকনি থেকে URL এবং URL থেকে ছাঁকনি |
| `src/storage.mjs` | `localStorage` Adapter |
| `app.mjs` | DOM, Event, History, sessionStorage, storage Event, Blob, File |
