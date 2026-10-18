# VisaFlow

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ২১-এর Project।

একটি ভ্রমণ সংস্থার Visa আবেদনের Workflow Tracker, স্তরভিত্তিক Architecture-এ: Domain (Factory, Fee-র Strategy ও Decorator, State Machine), Application (Service, Event Bus), Infrastructure (Memory ও Web Storage Repository), UI, এবং দুটি Composition Root (Browser-এর `src/main.mjs`, Node.js-এর `demo.mjs`)। কোনো npm Package লাগে না।

> **নোট:** এটি একটি শিক্ষামূলক Demo। Fee কাল্পনিক; Authentication, Authorization, Server বা ভাগ করা Database নেই; `localStorage`-এর তথ্য ব্যবহারকারী নিজেই বদলাতে পারেন।

## চালানো

```bash
node --test
node demo.mjs
python -m http.server 8000
```

- `node --test` ৩১টি Test: `domain` ৮, `service` ৯, `repositories` ৯ (দুটি Adapter-এ একই Contract Test), `architecture` ৫ (স্তরের Import-এর নিয়ম)। শেষে `# pass 31`, `# fail 0`।
- `node demo.mjs` Memory Repository দিয়ে পুরো Workflow চালিয়ে Console-এ দেখায়।
- Browser UI-র জন্য যেকোনো Static Server (ES Module `file://` থেকে চলে না), তারপর `http://localhost:8000`। তথ্য `localStorage`-এ `visaflow:` Prefix-এ থাকে।

Node.js 20 বা নতুন (`toSorted`, `structuredClone`, `import.meta.dirname`-এর জন্য 20.11+)।

## স্তর ও নির্ভরতা

| Folder | দায়িত্ব | Import করতে পারে |
| --- | --- | --- |
| `src/domain` | `createApplication`, `FEE_POLICIES`, `withExpress`, `WORKFLOW`, `applyAction`, `DomainError` | শুধু domain |
| `src/app` | `createVisaService`, `createEventBus`, `createSequence`, `sequenceAfter` | domain, app |
| `src/infra` | `createMemoryRepository`, `createStorageRepository` | শুধু infra |
| `src/ui` | `renderApplications`, `renderSummary` | domain, ui |
| `src/main.mjs`, `demo.mjs` | Composition Root | সব |

`tests/architecture.test.mjs` এই নিয়ম প্রতিটি File-এর `import` পড়ে যাচাই করে।

## Error Handling

- Domain-এর প্রতিটি নিয়মভঙ্গে `DomainError`, নির্দিষ্ট `code`-সহ: `INVALID_APPLICANT`, `INVALID_COUNTRY`, `UNKNOWN_TYPE`, `INVALID_TRAVELERS`, `INVALID_TRANSITION`, `NOT_FOUND`।
- ব্যর্থ কাজ কিছুই সংরক্ষণ করে না, কোনো Event পাঠায় না, এবং কোনো ID খরচ করে না।
- একটি Event Subscriber-এর Error অন্য Subscriber-দের থামায় না (`onError`-এ যায়)।
- Web Storage-এ ভাঙা JSON বা অন্য Prefix-এর Key উপেক্ষিত।
