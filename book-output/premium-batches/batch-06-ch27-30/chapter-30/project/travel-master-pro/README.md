# TravelMaster Pro — Full-Stack Capstone (অধ্যায় ৩০)

ভ্রমণ Package দেখা, Account তৈরি, Login, Booking, নিজের Booking দেখা ও বাতিল।
Node.js-এর অন্তর্নির্মিত `http`, `node:sqlite` ও `crypto` দিয়ে তৈরি; Runtime-এ কোনো npm Package নেই।

## প্রয়োজন

- Node.js 22.5 বা নতুন (`node:sqlite`)। QA-তে Node.js 22.16.0।
- Browser: যেকোনো আধুনিক Browser (QA-তে Chrome 155)।
- ঐচ্ছিক, শুধু `npm run typecheck`-এর জন্য: `npm install` (TypeScript ও `@types/node`;
  QA-তে TypeScript 6.0.2 ও `@types/node` 25.6.0)।

## চালানো

```bash
npm test            # ১৭টি Test (Validation, Domain, Auth, HTTP, Concurrency)
npm run demo        # HTTP দিয়ে প্রতিটি ব্যবসার নিয়ম
npm start           # http://127.0.0.1:3000, Database: data/travelmaster.db
npm run typecheck   # JSDoc Type, strict Mode (npm install-এর পরে)
```

Environment: `PORT` (Default 3000), `HOST` (127.0.0.1), `DB_PATH` (`data/travelmaster.db`;
`:memory:` দিলে Restart-এ মুছে যায়)।

## API

| Method | Path | Auth | ফল |
| --- | --- | --- | --- |
| GET | `/health` | না | 200 |
| GET | `/api/packages` | না | 200 Catalog |
| POST | `/api/register` | না | 201; ভুল Input 400; একই Email 409 |
| POST | `/api/login` | না | 200 Bearer Token (৩০ মিনিট); ভুল 401; বারবার ভুলে 429 |
| POST | `/api/logout` | হ্যাঁ | 200, Session বাতিল |
| POST | `/api/bookings` | হ্যাঁ | 201 নতুন; একই Key-তে 200; ভিন্ন অনুরোধে 409; আসন নেই 409 |
| GET | `/api/bookings` | হ্যাঁ | 200 নিজের Booking |
| PATCH | `/api/bookings/:id/cancel` | হ্যাঁ | 200; অন্যের বা অজানা 404 |

সব Response: `{ "data": ... }` অথবা `{ "error": { "code", "message", "details"? } }`।

## Requirement থেকে প্রমাণ

| Requirement | Code | Test |
| --- | --- | --- |
| Catalog: নাম, দাম, আসন | `service.listPackages` | `http.test.mjs` |
| Registration-এ নাম, Email, Password যাচাই | `validation.mjs` | `validation.test.mjs` |
| Login-এ স্বল্পমেয়াদি Token | `service.login`, `authenticate` | `auth.test.mjs` |
| দাম Server-এর Catalog থেকে | `service.createBooking` | `service.test.mjs`, Demo |
| Idempotency Key: আসন একবার কমে | UNIQUE (user_id, idempotency_key) | `service.test.mjs`, `http.test.mjs` |
| নিজের Booking; অন্যেরটিতে নয় | `WHERE user_id = ?` | `service.test.mjs`, `http.test.mjs` |
| বাতিলে একবারই আসন ফেরত | `cancelBooking` | `service.test.mjs` |
| Error-এ Password বা Stack নয় | `http.mjs` | `http.test.mjs` |
| Body-র সীমা, ভুল JSON 400 | `readJson` | `http.test.mjs` |
| মেয়াদ শেষে 401 | `authenticate` | `auth.test.mjs` |
| একসঙ্গে Booking-এ Overbooking নয় | শর্তযুক্ত UPDATE, CHECK, BEGIN IMMEDIATE | `concurrency.test.mjs` |
| Browser UI | `public/` | QA: Headless Chrome-এ ১৪টি যাচাই |

## যা নেই (জেনে-বুঝে)

- **Payment নেই।** Booking সরাসরি CONFIRMED; আসল প্রয়োগে PENDING_PAYMENT, Gateway-এর Webhook
  যাচাই, Refund ও Reconciliation লাগবে (অধ্যায় ২৯)।
- Email যাচাই (Verification Link) ও Password Reset নেই।
- Login-এর ভুলের হিসাব একটি Process-এর Memory-তে; একাধিক Instance-এ Redis বা Database লাগবে।
- Token Page-এর Memory-তে; Reload করলে আবার Login। Production-এ HttpOnly Cookie + CSRF সুরক্ষা।
- SQLite একটি Server-এ ভালো; একাধিক Server-এ PostgreSQL (অধ্যায় ২৬)।
- HTTPS, Reverse Proxy, Docker Image, CI ও Monitoring এখানে নেই; অধ্যায় ২৮-এর DeployReady দেখুন।
- **এই Server সরাসরি Internet-এ আসল Booking সেবা হিসেবে চালাবেন না।**
