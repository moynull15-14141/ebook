# Task Manager

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ৯-এর Project।

একটি Browser-ভিত্তিক কাজের তালিকা: Task যোগ, সম্পন্ন চিহ্নিত, নাম বদলানো, মোছা, খোঁজা, ছাঁকা এবং `localStorage`-এ সংরক্ষণ। তথ্যের নিয়ম (`task-core.js`) DOM থেকে আলাদা, তাই সেগুলো Node.js-এ Test করা যায়।

> এটি একটি শিক্ষামূলক Project। তথ্য শুধু এই Browser-এ থাকে; Server নেই।

## চালানো

`index.html` Browser-এ খুলুন (Double Click)। কিছু Browser `file://` থেকে খোলা Page-এর Storage আলাদাভাবে সামলায়; সমস্যা হলে Project Folder থেকে একটি Local Server চালান:

```bash
python -m http.server 8000
```

তারপর Browser-এ `http://localhost:8000` খুলুন।

## Test চালানো

```bash
node --check task-core.js
node --test
node tests/browser-check.mjs
```

- `node --test` তথ্যের নিয়মের ১৬টি Unit Test চালায়; শেষে `# pass 16` এবং `# fail 0` দেখানোর কথা।
- `node tests/browser-check.mjs` আসল Headless Chrome বা Edge-এ `index.html` খুলে লেখা, Click ও Key দিয়ে ১৭টি আচরণ যাচাই করে; শেষে `# pass 17` এবং `# fail 0`। Node.js 22 বা নতুন সংস্করণ এবং Chrome বা Edge লাগবে; Browser অন্য জায়গায় থাকলে `CHROME_PATH` Environment Variable-এ তার পথ দিন।

কোনো npm Package লাগে না।

## File

| File | কাজ |
| --- | --- |
| `index.html` | Page-এর গঠন: Form, খোঁজা, ছাঁকনি, তালিকা |
| `style.css` | চেহারা |
| `task-core.js` | `checkTitle`, `addTask`, `renameTask`, `toggleTask`, `deleteTask`, `clearDone`, `visibleTasks`, `countTasks`, `parseStored` |
| `app.js` | DOM, Event Delegation, `localStorage` এবং `render` |
| `tests/task-core.test.js` | ১৬টি Unit Test |
| `tests/load-script.js` | Unit Test-এর জন্য File-টি আলাদা পরিবেশে চালানোর সহায়ক Code |
| `tests/browser-check.mjs` | ১৭টি Browser Test |
| `tests/cdp.mjs` | Chrome DevTools Protocol দিয়ে Browser চালানোর ছোট সহায়ক Code |
