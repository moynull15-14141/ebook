# TravelLive — Chapter 27

Educational event-driven booking simulator. **Not** a real WebSocket or Socket.IO server.

Run with Node.js >=20:

```bash
node --test
node demo.mjs
```

The simulation covers owner authorization, event sequence, replay, bounded history, event deduplication, subscription/unsubscription, transition validation, and reconnect delay. Network integration, authentication middleware, durable database/outbox, Redis adapter, browser UI, and multi-node scaling remain unimplemented and untested.
