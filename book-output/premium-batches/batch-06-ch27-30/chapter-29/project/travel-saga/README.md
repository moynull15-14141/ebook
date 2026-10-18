# TravelSaga — Booking Orchestrator (অধ্যায় ২৯)

একটি Booking-এ দুটি আলাদা Service জড়িত: **Inventory** (আসন) ও **Payment** (টাকা)।
একটি Database Transaction দুটিকে একসঙ্গে ধরতে পারে না, তাই **Saga**: প্রতিটি ধাপ
নিজের Service-এ, আর পরের ধাপ ব্যর্থ হলে আগেরটির **Compensation** (Refund, আসন ছাড়া)।

## প্রয়োজন

- Node.js 22.5 বা নতুন (`node:sqlite`, `fetch`, `node:test`)। কোনো npm Package লাগে না।

## চালানো

```bash
npm test      # ১৪টি Test
npm run demo  # সাতটি পরিস্থিতি: সফল, Duplicate, Conflict, প্রত্যাখ্যান,
              # সাময়িক 503, আসন শেষ, অনিশ্চিত Payment
```

`node:sqlite` একটি "ExperimentalWarning" দেখায়; এটি স্বাভাবিক।

## গঠন

| File | কাজ |
| --- | --- |
| `src/services/inventory.mjs` | আলাদা HTTP Service; `reservationId` দিয়ে Idempotent |
| `src/services/payment.mjs` | আলাদা HTTP Service (অনুকরণ); `chargeId` দিয়ে Idempotent |
| `src/http-client.mjs` | Timeout, Retry (Backoff + Jitter), Circuit Breaker |
| `src/saga-store.mjs` | Orchestrator-এর SQLite Log: অবস্থা, ইতিহাস, Outbox |
| `src/orchestrator.mjs` | Saga: Validation, Idempotency, ধাপ, Compensation, Resume |
| `src/system.mjs` | সব একসঙ্গে চালু (Demo ও Test-এর জন্য) |

## Failure Lab

| পরীক্ষা | কীভাবে | প্রত্যাশা |
| --- | --- | --- |
| Payment প্রত্যাখ্যাত | `payment.faults.decline.add('Karim')` | REJECTED, আসন ফেরত, টাকা কাটা নেই |
| আসন শেষ | আসনের চেয়ে বেশি চাওয়া | REJECTED (SOLD_OUT), Payment ডাকা হয় না |
| সাময়িক 503 | `inventory.faults.failNext = 1` | Retry-তে সফল |
| অনিশ্চিত Payment | `payment.faults.delayMs = 300` | Refund ও আসন ফেরত (PAYMENT_UNCERTAIN) |
| একই অনুরোধ একসঙ্গে পাঁচবার | `Promise.all` | একবারই টাকা কাটা |
| একই ID, ভিন্ন দাম | `amount` বদলে আবার | IDEMPOTENCY_CONFLICT |
| Compensation ব্যর্থ | মাঝপথে Inventory বন্ধ | MANUAL_REVIEW |
| Orchestrator Crash | `hooks.after` থেকে Throw, তারপর নতুন Orchestrator-এ `resume()` | CONFIRMED, একবারই কাটা |

## সীমাবদ্ধতা

- Service-গুলো একই Node.js Process-এ, আলাদা Port-এ চলে; আসল Deployment-এ আলাদা Process বা Container।
- Inventory ও Payment-এর Data Memory-তে; শুধু Orchestrator-এর Log টেকসই (SQLite)।
- Payment একটি অনুকরণ, আসল Payment Gateway নয়।
- Outbox-এর Event প্রকাশের Relay ও Broker নেই (অনুশীলনী ১১ দেখুন)।
- একাধিক Orchestrator Instance-এর মধ্যে Single-flight নেই; তার জন্য Database Lock বা Lease লাগবে।
- Reconciliation Worker (Payment Gateway-এর সঙ্গে নিয়মিত মিলিয়ে দেখা) নেই।
