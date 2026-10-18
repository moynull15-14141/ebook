# LeadDesk API

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ২৫-এর Project।

একটি ভ্রমণ সংস্থার গ্রাহক-জিজ্ঞাসা (Lead) ব্যবস্থাপনার REST API (Express 4): Layered Architecture (Route, Service, Domain, Repository), Bearer Token ও Role-ভিত্তিক Authorization, Cursor Pagination ও Filter, `Idempotency-Key`, `ETag`/`If-Match` Optimistic Concurrency, Request ID, Structured Log, Rate Limit, Health/Readiness এবং Graceful Shutdown।

> **সতর্কতা:** শিক্ষামূলক Demo, Production-প্রস্তুত নয়। তথ্য Memory-তে; Token স্থির ও মেয়াদহীন; HTTPS নেই; Server শুধু `127.0.0.1`-এ। Internet-এ Deploy করবেন না।

## প্রয়োজন

- Node.js 22 বা নতুন।
- Express (`npm install`)। এই বইয়ের QA-তে Express 4.22.1 দিয়ে Test করা হয়েছে।

## চালানো

```bash
npm install
npm test
npm start
```

- `npm test`: ১০টি Test (`api` ৪, `reliability` ৪, `shutdown` ২); প্রতিটি Test নিজের Server চালায়, এলোমেলো Port-এ; শেষে `# pass 10`, `# fail 0`।
- `npm start`: `http://127.0.0.1:3025`। `API_TOKENS` না দিলে তিনটি নতুন এলোমেলো Demo Token Terminal-এ দেখায়। Ctrl+C-এ Graceful Shutdown।

## Environment

| Variable | অর্থ | Default |
| --- | --- | --- |
| `PORT` | Port | 3025 |
| `API_TOKENS` | `id:role:token,...` (role = agent বা manager; Token অন্তত ২৪ অক্ষর) | প্রতি চালানোয় নতুন Demo Token |
| `RATE_LIMIT` | প্রতি ব্যবহারকারী প্রতি মিনিটে অনুরোধ | 60 |
| `SHUTDOWN_GRACE_MS` | বন্ধের সময় চলমান অনুরোধের জন্য অপেক্ষা | 5000 |

## API

| Method ও পথ | কাজ | সফল Status |
| --- | --- | --- |
| `GET /health`, `GET /ready` | Liveness, Readiness (Token ছাড়া) | 200 (বন্ধের সময় `/ready` 503) |
| `POST /v1/leads` | তৈরি (`Idempotency-Key` ঐচ্ছিক) | 201 (Replay হলে 200) |
| `GET /v1/leads?status=&limit=&after=` | তালিকা, Cursor Pagination | 200 |
| `GET /v1/leads/:id` | একটি (`ETag` Header) | 200 |
| `PATCH /v1/leads/:id` | `status` বা `assignee` (`If-Match` ঐচ্ছিক) | 200 |
| `DELETE /v1/leads/:id` | মুছে ফেলা (Manager) | 204 |

সব Error একই আকারে: `{ "error": { "code", "message", "details", "requestId" } }`; Status 400, 401, 403, 404, 409, 412, 413, 429 বা 500।
