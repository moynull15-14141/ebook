# DeployReady — Travel Operations API (অধ্যায় ২৮)

একটি ছোট Travel Operations Job API, যাকে Production-এ নেওয়ার উপযোগী করে সাজানো:
Environment-ভিত্তিক Configuration, Structured Log, Prometheus Format-এ Metrics,
Liveness ও Readiness, Graceful Shutdown, Docker Image, Compose এবং CI Workflow।
**এটি আসল Booking বা Payment Backend নয়;** Data Memory-তে থাকে।

## প্রয়োজন

- Node.js 22 বা নতুন। কোনো npm Package লাগে না।
- Docker (ঐচ্ছিক): Image Build ও Compose-এর জন্য।

## চালানো

```bash
npm test                 # ১৪টি Test
npm run check            # Syntax ও Deploy File-এর স্থির যাচাই
npm start                # http://localhost:3000 (development)
npm run smoke -- http://127.0.0.1:3000
```

Production Mode-এ চালাতে:

```bash
NODE_ENV=production OPS_TOKEN=<কমপক্ষে ২৪ অক্ষর> PORT=8080 node main.mjs
```

Docker দিয়ে (Docker Desktop বা Engine চালু থাকলে):

```bash
cp .env.example .env     # তারপর .env-এ আসল OPS_TOKEN বসান
docker compose up --build
```

## Environment Variable

| নাম | Default | অর্থ |
| --- | --- | --- |
| `NODE_ENV` | development | development, test বা production |
| `PORT` | 3000 | 0 থেকে 65535 |
| `LOG_LEVEL` | info | debug, info, warn, error |
| `OPS_TOKEN` | (নেই) | `POST /api/jobs` ও `/metrics`-এর Bearer Token; Production-এ বাধ্যতামূলক, ≥ ২৪ অক্ষর |
| `SHUTDOWN_TIMEOUT_MS` | 10000 | চলমান অনুরোধ শেষ হওয়ার সর্বোচ্চ অপেক্ষা |
| `DRAIN_DELAY_MS` | 0 | Readiness 503 হওয়ার পর নতুন সংযোগ বন্ধের আগে অপেক্ষা |
| `APP_VERSION`, `GIT_SHA` | 0.0.0-dev, unknown | `/version` ও Log-এ Release-এর পরিচয় |

ভুল মান দিলে Process চালুই হয় না (Exit Code 1) এবং সব ভুল একসঙ্গে দেখায়।

## API

| Method | Path | Auth | ফল |
| --- | --- | --- | --- |
| GET | `/health/live` | না | 200 যতক্ষণ Process চলছে |
| GET | `/health/ready` | না | 200, অথবা Shutdown বা Dependency সমস্যায় 503 |
| GET | `/version` | না | Version ও Commit |
| GET | `/metrics` | হ্যাঁ* | Prometheus Text Format |
| GET | `/api/jobs` | না | Job-এর তালিকা |
| POST | `/api/jobs` | হ্যাঁ* | 201; ভুল Input-এ 422 |

\* `OPS_TOKEN` দেওয়া থাকলে। প্রতিটি Response-এ `x-request-id` Header থাকে।

## যা যাচাই হয়েছে, যা হয়নি

- `npm test`: Node.js 22.16.0-এ চালানো হয়েছে।
- `compose.yaml` ও `.github/workflows/ci.yml`: দুটি YAML Parser দিয়ে Parse ও কাঠামো যাচাই করা হয়েছে।
- Production Mode-এ Server চালিয়ে `scripts/smoke.mjs` চালানো হয়েছে।
- **চালানো হয়নি:** `docker build` ও `docker compose up` (QA-যন্ত্রে Docker Daemon চালু ছিল না),
  এবং GitHub Actions Workflow (GitHub-এ Push করা হয়নি)।

## Production-এর আগে যা বাকি

Persistent Database ও Migration, ব্যবহারকারীভিত্তিক Authentication, Rate Limiting,
TLS-যুক্ত Reverse Proxy, Secret Manager, Image Scanning ও SBOM, Action-গুলো Commit SHA দিয়ে Pin করা,
এবং Metrics Endpoint শুধু অভ্যন্তরীণ Network-এ রাখা।
