# TypeSafe Booking API — Chapter 24

Requires Node.js 20+ and npm. In this folder run `npm install`, `npm run build`, `npm test`. The package contains a transport-agnostic API adapter (`handleRequest`) and a typed domain/service layer; it does **not** start a network HTTP server. A later chapter adds Express and a database. In-memory state is not durable; do not use for real bookings or payments.
