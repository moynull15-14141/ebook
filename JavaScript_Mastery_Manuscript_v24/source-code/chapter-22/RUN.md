# Booking Quality Lab

Requires Node.js 20+ for the built-in test runner and `structuredClone`.

Run unit/integration tests: `npm test` or `node --test booking.test.mjs`.
Run coverage: `npm run test:coverage`.
To view the demo, serve this directory over HTTP (for example `python -m http.server 8000`) and open `http://localhost:8000`.

This is a browser-only educational app, not a production booking service. Browser E2E scenarios are documented in Chapter 22, but Playwright is not installed and those tests have not been executed. Notification failure after repository save illustrates the need for transactional outbox patterns in production.
