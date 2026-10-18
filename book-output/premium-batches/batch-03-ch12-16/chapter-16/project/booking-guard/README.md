# BookingGuard

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ১৬-এর Project।

একটি অনুষ্ঠানের আসন Booking Service (Node.js), নির্ভরযোগ্যতার জন্য তৈরি: সব ভুল একসঙ্গে যাচাই, Payment-এর সাময়িক ত্রুটিতে Backoff-সহ Retry, চূড়ান্ত ব্যর্থতায় সংরক্ষিত আসন ফেরত (Compensation), একই অনুরোধ-ID-তে একবারই Payment (Idempotency), Email ব্যর্থ হলেও Booking অক্ষত, এবং Structured Log। প্রতিটি বাইরের নির্ভরতা—Repository, Payment, Notifier, Clock, Sleep, Logger—Inject করা।

> এটি একটি শিক্ষামূলক Project; Repository Memory-তে, Payment ও Email কৃত্রিম।

## চালানো

```bash
node demo.mjs
node --test
node --test --experimental-test-coverage
```

`node --test` ২৪টি Test চালায়: `tests/core.test.mjs` (Unit ও Boundary, ৭টি), `tests/errors.test.mjs` (৪টি), `tests/service.test.mjs` (Integration: Fake Repository, Stub Payment, Mock Notifier, Spy Sleep, ১৩টি)। শেষে `# pass 24`, `# fail 0`। Node.js 22 বা নতুন সংস্করণ লাগবে; কোনো npm Package লাগে না।

## File

| File | কাজ |
| --- | --- |
| `src/errors.mjs` | `AppError`, `ValidationError`, `SoldOutError`, `PaymentError` |
| `src/booking-core.mjs` | `validateRequest`, `priceFor` (Pure) |
| `src/booking-service.mjs` | `createBookingService`: `book`, `cancel` |
| `src/memory-repository.mjs` | Database-এর Fake: `reserve`, `release`, `save`, `find` |
| `demo.mjs` | Retry, Idempotency, Email-ব্যর্থতা, Sold Out ও যাচাইয়ের প্রদর্শনী |
