# Booking Management Lab

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ১৩-এর Project।

Class দিয়ে তৈরি একটি Booking ব্যবস্থার মূল অংশ (Node.js): `Booking` Parent Class, `FlightBooking` ও `HotelBooking` Child Class, এবং `BookingManager`। Private Field দিয়ে অবস্থা সুরক্ষিত, Polymorphism দিয়ে মোট হিসাব, Composition দিয়ে Notifier, এবং `toJSON` ও Static `fromJSON` দিয়ে সংরক্ষণ ও পুনরুদ্ধার।

> এটি একটি শিক্ষামূলক Project; তারিখ, প্রাপ্যতা বা লেনদেন নেই।

## চালানো

```bash
node demo.mjs
node --test
```

`node --test` ২০টি Test চালায় (`tests/booking.test.mjs` ১২টি, `tests/manager.test.mjs` ৮টি); শেষে `# pass 20`, `# fail 0`। Node.js 22 বা নতুন সংস্করণ লাগবে; কোনো npm Package লাগে না।

## File

| File | কাজ |
| --- | --- |
| `src/booking.mjs` | `BookingError`, `Booking`, `FlightBooking`, `HotelBooking`, `restoreBooking` |
| `src/manager.mjs` | `BookingManager`: `add`, `find`, `cancel`, `confirmedRevenue`, `revenueByType`, `list`, `toJSON`, `fromJSON` |
| `demo.mjs` | তিনটি Booking, একটি বাতিল, আয়, সংরক্ষণ ও পুনরুদ্ধার |
