# TravelData Pro — Chapter 26

`node --test` runs 9 dependency-free educational tests. `node demo.mjs` runs the simulation.

`prisma/schema.prisma` is a **PostgreSQL/Prisma design example**, not connected to the simulation. To use a real database, install packages, configure `DATABASE_URL`, run Prisma migrations, and implement a repository using generated Prisma client. A PostgreSQL integration test has **not** been run.

The in-memory simulation is single-process synchronous; it does **not** provide cross-process transactions, real isolation, persistence, or production security.
