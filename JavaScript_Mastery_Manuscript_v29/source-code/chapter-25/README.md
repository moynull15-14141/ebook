# TravelCore Booking Backend (Chapter 25)

Node.js >=20, no third-party dependencies. Start with `npm start` and test with `npm test`.

## API
- `GET /health`
- `GET /api/packages`
- `POST /api/register` body `{ "email":"user@example.com", "password":"a strong password 123" }`
- `POST /api/login` (returns an HttpOnly `sid` cookie)
- `POST /api/logout`
- `GET /api/bookings` (requires cookie)
- `POST /api/bookings` body `{ "packageId":"cox", "travelers":2 }` (requires cookie)
- `PATCH /api/bookings/:id/cancel` (requires cookie)

## Important production limitations
In-memory data and sessions disappear on restart. This example is **not production-ready**. For production add PostgreSQL, migrations, atomic uniqueness, transaction isolation, rate limits, CSRF defense, TLS/reverse proxy, secret management, persistent sessions, request logging, monitoring and integration tests against the real database. Cookie `Secure` is only enabled with `NODE_ENV=production` and requires HTTPS. Node built-in HTTP server is used for dependency-free execution; an Express version is explained in the chapter.
