# Batch Report — Chapters 22–26

**Batch:** `book-output/premium-batches/batch-05-ch22-26/` (Phase 4E)
**Source:** `JavaScript_Mastery_Manuscript_v30/` (titles and scope)
**Status: PASS — ready for Chief Editor review**

## Summary

| Chapter | Words | PDF Pages | Tests | QA |
| --- | --- | --- | --- | --- |
| 22 — JavaScript Testing Mastery: Unit Testing, Integration Testing, Mocking, TDD এবং E2E | 3585 | 39 | 38 / 38 | PASS (11/11 gates, 2 warnings) |
| 23 — JavaScript Performance Optimization, Memory Management, Profiling এবং Web Application Performance | 3430 | 33 | 15 / 15 | PASS (10/10 gates, 1 warning) |
| 24 — JavaScript থেকে TypeScript: Static Typing, Type Safety এবং Professional Development Workflow | 3090 | 39 | 11 / 11; 20 TS listings | PASS (10/10 gates, 2 warnings) |
| 25 — JavaScript Backend Development with Node.js: REST APIs, Express, Databases, Authentication এবং Production Architecture | 3388 | 37 | 10 / 10 | PASS (9/9 gates, 1 warning) |
| 26 — Advanced Database Integration, ORM, Query Optimization এবং Scalable Data Architecture | 3374 | 36 | 21 / 21 | PASS (10/10 gates, 1 warning) |
| **Total** | **16867** | **184** | **95 / 95; 20 TS listings** | **5 of 5 PASS** |

Words are explanatory words (code and inline code excluded). "Tests" are the companion projects' automated tests (`node --test`), plus Chapter 24's TypeScript listings verified with the real compiler.

## Chapters completed

22, 23, 24, 25, 26. Each folder has `chapter-NN-premium.md`, `.pdf`, `.docx`, `project/`, `QA_SUMMARY.md`, `chapter.json`, `examples/` and `qa-logs/`.

## Verification

- **Listings verified:** 83 listing files run in Node.js (48 compared with a printed Output or Error panel), 12 run in Chrome/155.0.8059.80 from a local HTTP server (9 compared), and 20 TypeScript listings checked with the real compiler. Mismatches in the final run: 0.
- **Automated tests:** 95 passed, 0 failed, 0 skipped across the five projects (38, 15, 11, 10, 21).
- **Browser (Chapters 22, 23):** E2E tests drive real headless Chrome through a small DevTools-protocol helper included in each project (no Playwright installed); the tests skip with a reason if no Chrome or Edge is found.
- **TypeScript (Chapter 24):** TypeScript 6.0.2 and @types/node 25.6.0 were found inside an already-installed global tool (firebase-tools) and used without installing anything. `tsc --strict` (plus noUncheckedIndexedAccess, exactOptionalPropertyTypes) builds the project including six compile-time `@ts-expect-error` checks; the 11 runtime tests run on the compiled JavaScript. Compile-time guarantees and runtime validation are kept separate in the text; the chapter states that TypeScript gives no runtime input security.
- **Backend (Chapter 25):** Express 4.22.1 from the same verified local installation, loaded in QA through a resolve hook (`tools/local-deps.mjs`) so the companion project needs no node_modules; readers use `npm install`. Tests cover startup, JSON, valid and invalid requests, 400/401/403/404/409/412/413/429, authorization boundaries, idempotency, request IDs, rate limiting and graceful shutdown with a request in flight. All servers bind to 127.0.0.1 on random ports.
- **Database (Chapter 26):** real SQLite (`node:sqlite`) on in-memory and temporary-file databases only: CRUD, constraints (unique, check, foreign key, not null), transactions and rollback, savepoints, idempotency, two-connection locking, a reproduced lost update and two fixes, migrations with checksum tamper detection, query plans with and without an index, verified backup. PostgreSQL (no server) and Prisma (not installed) were **not run**; the pg adapter is syntax-checked only and marked as such.
- **Deployment and CI:** nothing was deployed, pushed or published. Chapter 22's GitHub Actions workflow was not run on GitHub; its two commands were run locally. No real credentials; demo tokens are random per run and test tokens are labelled test-only.
- **Further Reading:** 25 distinct addresses, all HTTP 200 on 2026-10-18.

## Visual inspection coverage

28 PDF pages were rendered to images and looked at by eye: for every chapter the opening page, a concept page, a code-heavy project page, an exercise or MCQ page and the final page, plus every flagged page.

| Chapter | Pages looked at | Flagged |
| --- | --- | --- |
| 22 | 1, 6, 12, 18, 35, 39 | page 12 (white space; accepted) |
| 23 | 1, 9, 16, 29, 33 | none |
| 24 | 1, 7, 22, 33, 36, 39 | page 33 (white space; accepted) |
| 25 | 1, 4, 17, 34, 37 | none |
| 26 | 1, 8, 19, 33, 36, 37 | widow final page (fixed; new final page 36 inspected) |

No rendering defect was found. All other pages passed the automated layout checks.

## DOCX validation

All five DOCX files passed the structural checks. Each was opened by Microsoft Word through automation and exported to PDF without error (Word reported 41, 36, 41, 40, 39 pages for Chapters 22–26). Word's export was inspected on Chapter 24 page 5 (TypeScript listing and compiler-error panel) and Chapter 26 page 24 (tables with inline code); Bengali shaping, code and captions are correct.

## Curriculum mismatches and overlap decisions

| Chapter | Previously learned | New advanced material / decision |
| --- | --- | --- |
| 22 | Chapter 16 (node:test, test doubles, coverage basics, testing pyramid; booking-guard), Chapter 19 (seeded random), Chapter 20 (tests against a local server), Chapter 21 (contract tests). | Recap table only. New material: choosing the test level, AAA and table-driven tests, equivalence partitioning and boundary values (which exposed a real fee "cliff"), property-based tests, a full red–green–refactor cycle with real failing output, mock.fn/mock.method/mock.timers, flaky-test causes, coverage gaps found and fixed, mutation testing, real-browser E2E without installing Playwright, CI workflow. v30's "Booking Quality Lab" would repeat the booking domain, so the project is CurrencyDesk (forex quotes). |
| 23 | Chapter 19 covers the same v30 subject (performance, memory): Big-O, measurement, long tasks, layout thrashing, GC, WeakMap, LRU, network. | This is the main curriculum overlap in v30 (Chapters 19 and 23 are both performance chapters). Chapter 19 material is referenced, not repeated. New material: User Timing and PerformanceObserver, programmatic CPU profiles and self time, event-loop delay histogram, heap measurement after GC, Long Task observer, rendering pipeline (transform vs layout), full virtual scrolling, Web Workers and transferables, request-ID race handling. Project TravelSearch Explorer (v30 name kept) is a browser application, distinct from Chapter 19's Node.js PerfLab harness. |
| 24 | Chapter 11 and 17 (validation, trust boundary), Chapter 18 (Result type), Chapter 21 (state machine, repository). | TypeScript is new to the book. Earlier ideas are revisited as typed versions (Result as discriminated union, exhaustive state machine, generic repository). v30's "TypeSafe Booking API" was replaced by TypeSafe Claims (travel expense claims) to avoid a fourth booking project. A section on migrating JavaScript to TypeScript (checkJs, declaration files, CI type-check) covers the "Professional Development Workflow" in the v30 title. |
| 25 | Chapter 20 (node:http API, cookie sessions, CSRF, scrypt, authorization, log redaction), Chapter 21 (layers, DI). | Security basics are referenced, not repeated. New material: Express routing and middleware chain, error middleware and the Express 4 async-error trap (demonstrated), REST resource and status design, bearer tokens with a role/permission matrix, cursor pagination, Idempotency-Key, ETag/If-Match optimistic concurrency, request IDs and structured logs, rate limiting, health/readiness, graceful shutdown. v30's "TravelCore Booking Backend" was replaced by LeadDesk (customer inquiries) to avoid repeating the booking domain; PostgreSQL is discussed and deferred to Chapter 26 as in v30. |
| 26 | Chapter 20 (parameterized queries, node:sqlite), Chapter 21 and 25 (repository contract, idempotency, optimistic concurrency). | v30 teaches PostgreSQL and Prisma, which were not available on the QA machine and were not installed. All executable work uses node:sqlite, which shows real constraints, transactions, locks, indexes and plans; PostgreSQL and Prisma are explained with a differences table, a syntax-checked pg adapter and a Prisma example, each clearly marked as not executed. Project keeps the v30 name TravelData Pro but uses a loyalty-points ledger instead of bookings. |

Headings: v30 Chapters 22–24 use "অধ্যায় N:"; normalized to "অধ্যায় N — ". v30 Chapters 25 and 26 put part of the title in a second "##" line; Chapter 25's was merged into the title, Chapter 26's was folded into the text. All other title words follow v30.

## Registry

`CHAPTER_REGISTRY.json` lists Chapters 01–26 (title, Markdown, PDF, DOCX and project paths, production status, QA status, source v30, last verified build with SHA-256 of Markdown, PDF and DOCX). Validation: valid JSON (re-read after writing); numbers 1–26 unique and in order; no duplicate authoritative Markdown sources; 26 of 26 entries have every path present; titles read from each Markdown file. **Registry valid.** Earlier registry files were left unchanged. `BATCH_MANIFEST.json` lists every file of this batch with size and SHA-256.

## Companion code readiness

Each project lives in `chapter-NN/project/<name>/` with a README, run commands and runtime versions; no absolute machine paths, secrets, `node_modules` or build output (`dist/` is regenerated by `npm test`). Chapters 24 and 25 need `npm install` (typescript and @types/node; express). Machine-specific paths exist only in the QA configuration (`chapter.json`, `tools/`), which is not part of the companion projects.

## Method notes

- **Batch tools (`tools/`):** copies of the batch-04 tools with additions: `extract-and-run.mjs` gained `tap=1` (compare only stable TAP lines of a test file run directly) and per-chapter `nodeArgs`; new `ts-examples.mjs` (TypeScript listings with the real compiler; `tscheck=1` for checked JavaScript); new `local-deps.mjs` and `local-deps-hooks.mjs` (QA-only resolve hook for the local Express copy).
- **Master Design System:** not modified in this phase.

## Remaining limitations

1. **Length.** Below the 3,500-word floor (explanatory words): Chapter 23 (3430; 7024 including code), Chapter 24 (3090; 7957 including code), Chapter 25 (3388; 8038 including code), Chapter 26 (3374; 8127 including code). These chapters are code-heavy; substantive sections were added where depth was missing (mutation testing, Long Task observer, JS-to-TS migration) rather than filler.
2. **Not executed:** PostgreSQL and Prisma code (Chapter 26), the GitHub Actions workflow on GitHub (Chapter 22), and the illustrative curl commands (Chapter 25; the same requests are covered by automated tests).
3. **Tool versions:** TypeScript 6.0.2 and Express 4.22.1 come from a global tool's bundled copies; readers' `npm install` may resolve newer patch versions.
4. **Layout:** two pages with more than 33% white space (Chapter 22 page 12, Chapter 24 page 33) caused by kept-together listings; long chapter titles make the running header wrap to two lines (template behaviour, unchanged).
5. **Editorial:** no second reader has proofread the Bengali.
6. **Platforms:** tested on Windows 10 with Node.js 22.16.0 and Chrome 155 only.

## Protected folders

`git status` against commit 9c4763f shows no change in `JavaScript_Mastery_Manuscript_v01`–`v30`, `book-output/draft-edition/`, `book-output/premium-samples/`, `book-output/premium-final/` or `book-output/premium-batches/batch-01-ch02-06/`. Batches 02, 03 and 04 (not committed) were checked against their own `BATCH_MANIFEST.json`: 311, 276 and 259 files, all with the recorded SHA-256. In `master-design-system/` only the three files approved in Phase 4C differ from the commit (plus `backups/`), and no file there is newer than the batch-04 manifest.
