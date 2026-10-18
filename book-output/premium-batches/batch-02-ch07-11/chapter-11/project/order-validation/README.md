# OrderGuard — Order Validation

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ১১-এর Project।

একটি ছোট দোকানের Order Form: গ্রাহকের নাম, Email, পণ্য ও পরিমাণ যাচাই করে একটি কৃত্রিম Server-এ Order পাঠায়। তিন শ্রেণির ত্রুটি আলাদাভাবে সামলায়: ব্যবহারকারীর ভুল তথ্য (`ValidationError`, প্রতিটি ঘরের নিচে বার্তা), Server-এর প্রত্যাখ্যান বা Network বিচ্ছিন্নতা (`ServiceError` বা `network`, সাধারণ বার্তা), এবং Program-এর অপ্রত্যাশিত ভুল (নিরাপদ বার্তা, Console-এ পুরো বিবরণ)।

> এটি একটি শিক্ষামূলক Project। কোনো আসল Server বা টাকা লেনদেন নেই; Order-এর ইতিহাস ও স্টক শুধু Page খোলা থাকা পর্যন্ত থাকে।

## চালানো

`index.html` Browser-এ খুলুন (Double Click)।

- `index.html?offline=1` — Network বিচ্ছিন্নতার অভিনয়।
- `index.html?delay=1000` — কৃত্রিম Server-এর দেরি (মিলিসেকেন্ড; স্বাভাবিক 300)।

## Test চালানো

```bash
node --check order-validation.js
node --test
node tests/browser-check.mjs
```

- `node --test` ১৬টি Unit Test চালায়; শেষে `# pass 16` এবং `# fail 0`।
- `node tests/browser-check.mjs` আসল Headless Chrome বা Edge-এ Page খুলে ১২টি আচরণ যাচাই করে; শেষে `# pass 12` এবং `# fail 0`। Node.js 22 বা নতুন সংস্করণ এবং Chrome বা Edge লাগবে (অন্য জায়গায় থাকলে `CHROME_PATH`)।

কোনো npm Package লাগে না।

## File

| File | কাজ |
| --- | --- |
| `index.html`, `style.css` | Form, বার্তার জায়গা, ইতিহাস ও চেহারা |
| `order-validation.js` | `ValidationError`, `ServiceError`, `parseQuantity`, `formatTaka`, `validateOrder`, `createDemoServer`, `placeOrder` |
| `app.js` | Form-এর Submit, ঘরের বার্তা, Button-এর অবস্থা, ইতিহাস |
| `tests/order-validation.test.js` | ১৬টি Unit Test |
| `tests/browser-check.mjs` | ১২টি Browser Test |
| `tests/load-script.js`, `tests/cdp.mjs` | Test-এর সহায়ক Code |
