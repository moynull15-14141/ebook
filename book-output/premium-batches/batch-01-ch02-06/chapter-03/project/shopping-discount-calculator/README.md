# Shopping Discount Calculator

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ৩-এর Project।

দাম, পরিমাণ, Coupon এবং সদস্যপদ থেকে ছাড়, Delivery-র খরচ এবং পরিশোধযোগ্য টাকা হিসাব করে।

> এটি একটি শিক্ষামূলক Project; নিয়মগুলো উদাহরণ মাত্র। বাস্তব দোকানে মূল্যের চূড়ান্ত হিসাব Server-এ হতে হয়।

## চালানো

```bash
node discount.js
```

## Test চালানো

```bash
node --check discount.js
node --test
```

`node --test` শেষে `# pass 16` এবং `# fail 0` দেখানোর কথা। কোনো npm Package লাগে না।

## File

| File | কাজ |
| --- | --- |
| `discount.js` | `toWholeNumber`, `getCouponPercent`, `calculateOrder` এবং ছয়টি উদাহরণ |
| `tests/discount.test.js` | ১৬টি Automated Test, প্রতিটি সীমার মানসহ |
| `tests/load-script.js` | Test-এর জন্য File-টি আলাদা পরিবেশে চালানোর সহায়ক Code |
