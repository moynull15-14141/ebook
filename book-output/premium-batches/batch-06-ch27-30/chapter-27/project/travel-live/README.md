# TravelLive — Real-Time Booking Status (অধ্যায় ২৭)

Booking-এর অবস্থা (PENDING, CONFIRMED, CANCELLED) বদলালে গ্রাহক ও Agent-এর Screen-এ
তা সঙ্গে সঙ্গে দেখা যায়: WebSocket (মূল পথ) এবং Server-Sent Events (বিকল্প পথ)।

## প্রয়োজন

- Node.js 22 বা নতুন (অন্তর্নির্মিত `WebSocket` Client, `fetch`, `node:test`)
- একটি Package: `ws` (WebSocket Server)। `npm install` চালান।
- Browser Dashboard-এর জন্য যেকোনো আধুনিক Browser

## চালানো

```bash
npm install
npm test          # ১৮টি Test: Domain, Client State, HTTP, SSE, WebSocket
npm run demo      # এক Process-এ পুরো প্রবাহ, Console-এ ফলাফল
npm start         # http://localhost:3027
```

Browser-এ খুলুন: `http://localhost:3027/#token-rafi:bk-1,bk-2`
(`#`-এর পরের অংশ Server-এ যায় না)। অন্য Terminal থেকে Agent হিসেবে অবস্থা বদলান:

```bash
curl -X POST http://localhost:3027/api/bookings/bk-1/status \
  -H "Authorization: Bearer token-agent" -H "Content-Type: application/json" \
  -d "{\"status\":\"CONFIRMED\"}"
```

## Protocol (WebSocket, Path `/live`)

| Client পাঠায় | Server উত্তর দেয় |
| --- | --- |
| `{"type":"auth","token":"..."}` (৩ সেকেন্ডের মধ্যে) | `auth.ok`, নয়তো Close 4401 |
| `{"type":"subscribe","bookingId","afterSequence","requestId"}` | `ack` (ok, mode), তারপর `event`-গুলো বা `snapshot` |
| `{"type":"unsubscribe","bookingId"}` | `ack` |

Close Code: 4401 Auth, 4429 Rate Limit, 1009 Message খুব বড় (৪ KB-র বেশি)।
Origin তালিকার বাইরে হলে Upgrade-এ 403। Ping প্রতি ৩০ সেকেন্ডে; Pong না এলে Connection বন্ধ।

## HTTP API

| Method | Path | কাজ |
| --- | --- | --- |
| GET | `/health` | অবস্থা |
| POST | `/api/bookings` | নতুন Booking (`{"title"}`) |
| GET | `/api/bookings/:id` | Snapshot |
| POST | `/api/bookings/:id/status` | অবস্থা-বদল (`{"status"}`) |
| GET | `/api/bookings/:id/stream` | SSE Stream (`Last-Event-ID` দিয়ে Replay) |

## সীমাবদ্ধতা (জেনে-বুঝে রাখা)

- Demo Token স্থির (`token-agent`, `token-rafi`, `token-mina`)। আসল প্রয়োগে Login ও মেয়াদযুক্ত Session।
- সব অবস্থা একটি Process-এর Memory-তে; Restart-এ মুছে যায়। একাধিক Instance-এর জন্য
  Database, Outbox ও Broker (Redis/NATS/Kafka) লাগবে — অধ্যায় ২৭.৯ দেখুন।
- `ws://` শুধু Local-এ; Production-এ TLS (`wss://`) Reverse Proxy-র পেছনে।
- Socket.IO ব্যবহার করা হয়নি; `examples/09-socketio-design.mjs` শুধু নকশা, চালানো হয়নি।

## যাচাই

QA-তে `ws` 7.5.10 ব্যবহার হয়েছে (Code `WebSocket.Server` API ব্যবহার করে, যা ৭ ও ৮ দুই সংস্করণেই আছে)।
Browser Dashboard আসল Headless Chrome-এ চালিয়ে দেখা হয়েছে: সংযোগ, Live Update,
জোর করে বিচ্ছিন্ন, স্বয়ংক্রিয় পুনঃসংযোগ এবং বাদ পড়া Event-এর Replay।
