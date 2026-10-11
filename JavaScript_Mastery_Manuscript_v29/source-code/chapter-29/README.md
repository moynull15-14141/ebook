# TravelSaga — Educational Distributed Transaction Simulator

Requires Node.js >=20. No npm install required.

```bash
node --test
node demo.mjs
```

**Scope:** Single-process, in-memory saga orchestration. Not real microservices, a distributed broker, durable outbox, or production payment integration. Money is represented in integer minor units. Real deployment requires transactional persistence, per-key distributed locking/unique constraints, reliable event publication, retries with backoff, dead-letter queues, monitoring, and reconciliation. This example deliberately keeps those as architectural exercises.
