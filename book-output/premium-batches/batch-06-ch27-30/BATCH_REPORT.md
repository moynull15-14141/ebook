# Batch Report — Chapters 27–30

**Batch:** `book-output/premium-batches/batch-06-ch27-30/` (Phase 4F)
**Source:** `JavaScript_Mastery_Manuscript_v30/` (titles and scope)
**Status: PASS — all four chapters complete; registry 01–30 valid**

## Summary

| Chapter | Words | PDF Pages | Tests | QA |
| --- | --- | --- | --- | --- |
| 27 — Real-Time JavaScript Applications | 5390 | 52 | 18 / 18; E2E 8/8 | PASS (11/11 gates, 2 warnings) |
| 28 — Professional JavaScript Deployment, Docker, CI/CD, Cloud Infrastructure এবং Production Monitoring | 4946 | 43 | 14 / 14 | PASS (10/10 gates, 1 warning) |
| 29 — Advanced JavaScript System Design, Microservices, Distributed Systems এবং Enterprise Architecture | 4363 | 40 | 14 / 14 | PASS (10/10 gates, 2 warnings) |
| 30 — JavaScript Professional Mastery, Full-Stack Capstone এবং Career Roadmap | 4257 | 43 | 17 / 17; E2E 14/14 | PASS (11/11 gates, 1 warning) |
| **Total** | **18956** | **178** | **63 / 63** | **4 of 4 PASS** |

Words are explanatory words (code and inline code excluded). "Tests" are the companion projects' automated tests (`node --test`); "E2E" are checks in real headless Chrome.

## Chapters completed

27, 28, 29, 30. Each folder has `chapter-NN-premium.md`, `.pdf`, `.docx`, `project/`, `QA_SUMMARY.md`, `chapter.json`, `examples/` and `qa-logs/`.

## Verification

- **Listings verified:** 73 listing files run in Node.js, 46 compared with a printed Output or Error panel; mismatches in the final run: 0.
- **Automated tests:** 63 passed, 0 failed, 0 skipped across the four projects (18, 14, 14, 17).
- **Real-time (Chapter 27):** `ws` 7.5.10 from a verified local installation (QA-only resolve hook; readers run `npm install`); real WebSocket connections over 127.0.0.1; dashboard E2E in Chrome. Socket.IO: syntax-checked design only. Redis: in-memory simulation, labelled.
- **Deployment (Chapter 28):** Dockerfile checked by the project's own static rules; compose.yaml and ci.yml parsed by two YAML parsers; production-mode smoke test. **docker build / compose up NOT RUN** (Docker CLI present, daemon not reachable). **GitHub Actions NOT RUN** (nothing pushed).
- **Distributed systems (Chapter 29):** participant services are real HTTP servers in the same process; the saga log is a real SQLite file in the crash-recovery tests.
- **Capstone (Chapter 30):** node:sqlite persistence, concurrency test with four worker threads, strict type check with a control error, Chrome E2E with 14 checks. Payment, email verification and password reset are **not implemented** and marked as such in the chapter and README.
- **Nothing deployed, pushed or published.** No real credentials; demo tokens are fixed and labelled demo-only, test tokens labelled test-only.
- **Further Reading:** 28 distinct addresses, all HTTP 200 on 2026-10-18.

## Visual inspection coverage

18 PDF pages were rendered to images and looked at by eye: every chapter's opening page, concept or code pages, and final page, plus every flagged page.

| Chapter | Pages looked at | Flagged |
| --- | --- | --- |
| 27 | 1, 3, 4, 30 | page 3 (white space; accepted) |
| 28 | 1, 7, 20, 41, 43 | none |
| 29 | 1, 3, 6, 24, 40, 41 | pages 3 and 6 (white space; accepted); widow final page (fixed; new final page 40 inspected) |
| 30 | 1, 29, 43 | none |

## DOCX validation

All four DOCX files passed the structural checks. Each was opened by Microsoft Word through automation and exported to PDF without error (Word reported 56, 47, 44, 47 pages for Chapters 27–30). Word's export of Chapter 30 page 20 (code listings with Bengali comments) was inspected.

## Curriculum decisions

| Chapter | Previously learned | New material / decision |
| --- | --- | --- |
| 27 | Chapter 13–14 (async), Chapter 20 (auth), Chapter 25 (HTTP API, idempotency), Chapter 26 (transactions). | New: polling/SSE/WebSocket, close codes, heartbeat, backpressure, event envelope and versioning, delivery semantics, transactional outbox with node:sqlite, Pub/Sub scaling. v30's dependency-free in-memory simulator is kept as the domain (`live-hub.mjs`) and extended with a real `ws` gateway, an SSE endpoint and a browser dashboard. Project name TravelLive kept from v30. |
| 28 | Chapter 22 (CI workflow), Chapter 25 (graceful shutdown, request IDs, health), Chapter 26 (backup). | Earlier topics are extended, not repeated: fail-fast configuration, Docker/Compose/CI files, drain-based graceful shutdown with tests, Prometheus exposition format, SLO/error budget/burn rate, canary analysis. Project DeployReady Travel Operations API kept from v30. |
| 29 | Chapter 25 (Idempotency-Key), Chapter 26 (transactions), Chapter 27 (outbox, backoff), Chapter 28 (health, metrics). | New: capacity planning with Little's Law, modular monolith, bounded contexts, saga orchestration vs choreography, key + fingerprint idempotency, CAP with a partition simulation, circuit breaker, bulkhead, inbox, crash recovery. v30's in-memory TravelSaga is rebuilt with real HTTP participants and a durable SQLite saga log; name kept. |
| 30 | The whole book (capstone); in particular Chapters 17, 20, 22, 24, 25, 26, 28, 29. | v30's TravelMaster Pro requirements (FR1–FR8, non-functional list, API contract, rubric, 12-week roadmap, ADR) are preserved. Upgraded from v30's in-memory demo to node:sqlite with constraints and transactions, hashed session tokens, login rate limiting, a browser frontend tested in Chrome and a strict JSDoc type check. Payment, email verification and password reset are explicitly marked as not implemented. |

## Registry

`CHAPTER_REGISTRY.json` lists Chapters 01–30. Validation: exactly 30 entries; numbers 1–30 unique and in order; no duplicate authoritative Markdown sources; 30 of 30 entries have every path present; titles read from each Markdown file; SHA-256 fingerprints of Chapters 01–26 equal those recorded in the batch-05 registry. **Registry valid.** Earlier registry files were left unchanged.

## Method notes

- **Batch tools (`tools/`):** copies of the batch-05 tools; `local-deps-hooks.mjs` now also maps `ws`; new `ch27-browser-e2e.mjs`, `ch28-validate-deploy.mjs`, `ch30-browser-e2e.mjs`, `ch30-typecheck.mjs`; this `make-summary.mjs`.
- **Master Design System:** not modified in this phase.

## Remaining limitations

1. **Length.** All four chapters exceed 3,500 explanatory words.
2. **Not executed:** Docker build and Compose (no daemon), GitHub Actions (not pushed), Socket.IO (not installed), Redis (not available), PostgreSQL (no server).
3. **Tool versions:** `ws` 7.5.10 and TypeScript 6.0.2 come from a global tool's bundled copies; readers' `npm install` may resolve newer versions (`ws` 8 is supported by the code's API choice).
4. **Layout:** three pages with more than 33% white space (Chapter 27 page 3; Chapter 29 pages 3 and 6); long titles make the running header wrap (template behaviour).
5. **Editorial:** no second reader has proofread the Bengali.
6. **Platforms:** tested on Windows 10 with Node.js 22.16.0 and Chrome 155 only; no real screen-reader test of the Chapter 30 frontend.
