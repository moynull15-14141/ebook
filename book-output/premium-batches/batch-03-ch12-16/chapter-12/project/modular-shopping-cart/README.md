# Modular Shopping Cart

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ১২-এর Project।

একটি ছোট Stationery দোকানের কার্ট, ES Module দিয়ে গঠিত: পণ্যের তালিকা, কার্টে যোগ, পরিমাণ (০–১০), Coupon (`STUDENT10`, `EID15`), ছাড়ের পরের মূল্য ২০০০ টাকা বা বেশি হলে বিনামূল্যে Delivery, এবং `localStorage`-এ সংরক্ষণ।

> এটি একটি শিক্ষামূলক Project। কোনো Checkout বা লেনদেন নেই।

## গঠন

| File | স্তর | কাজ |
| --- | --- | --- |
| `src/catalog.mjs` | Domain | পণ্যের অপরিবর্তনীয় তালিকা, `findProduct` |
| `src/money.mjs` | Domain | `formatTaka` |
| `src/cart.mjs` | Domain | `emptyCart`, `addItem`, `setQuantity`, `removeItem`, `applyCoupon`, `cartLines`, `cartTotals`, `CartError` |
| `src/storage.mjs` | Adapter | `createCartStore(storage)`: যাচাইসহ load ও save |
| `app.mjs` | UI | DOM, Event Delegation, বার্তা |
| `demo.mjs` | — | Node.js-এ কার্টের নিয়মের প্রদর্শনী |

Domain File-গুলো DOM বা Storage-এর কিছু জানে না, তাই Node.js-এ সরাসরি চলে।

## চালানো

Module Script `file://` থেকে লোড হয় না; Project Folder থেকে একটি Local Server চালান:

```bash
python -m http.server 8000
```

তারপর Browser-এ `http://localhost:8000`।

## Test চালানো

```bash
node demo.mjs
node --test
node tests/browser-check.mjs
```

- `node --test`: ২৪টি Test (`tests/cart.test.mjs` ১৮টি, `tests/storage.test.mjs` ৬টি); শেষে `# pass 24`, `# fail 0`।
- `node tests/browser-check.mjs`: একটি Local Server (`tests/static-server.mjs`) চালিয়ে আসল Headless Chrome বা Edge-এ ১২টি আচরণ যাচাই করে, সঙ্গে দেখায় যে সাধারণ Chrome-এ `file://` থেকে Module লোড হয় না। Node.js 22+ এবং Chrome বা Edge লাগবে (অন্য জায়গায় থাকলে `CHROME_PATH`)।

কোনো npm Package লাগে না।
