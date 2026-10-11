# TravelMaster Pro — Chapter 30 Capstone (Educational)

Node.js 20+; no npm dependencies or network install required.

```bash
npm test
npm run check
npm run demo
npm start
```

API: `GET /health`, `GET /api/packages`, `POST /api/register`, `POST /api/login`, `POST /api/logout`, `POST /api/bookings`, `GET /api/bookings`, `PATCH /api/bookings/:id/cancel`.

`POST /api/register`: `{"name":"Demo User","email":"demo@example.com","password":"long-password-123"}`.
`POST /api/login`: `{"email":"demo@example.com","password":"long-password-123"}` returns a bearer token. Include `Authorization: Bearer <token>` on protected endpoints.
`POST /api/bookings`: `{"packageId":"BT-4D","travelers":2,"idempotencyKey":"unique-key-001"}`.

**Not production ready:** in-memory state resets on restart, sessions are not durable, booking operations are single-process only, no payment gateway, no real inventory DB, no persistent audit log, no rate limiter or full operational hardening. No live external integrations.
