# QA Summary — Chapter 27

**Chapter:** অধ্যায় ২৭ — Real-Time JavaScript Applications
**Status: PASS** — 11 of 11 automated gates passed (last QA run 2026-10-18T10:55:56.765Z)
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/chapter-27.md` (title and scope); text rewritten for the premium edition
**Built with:** `book-output/master-design-system/` 1.0.0 (with the approved 2026-10-15 listing-label fix; not modified in this phase)

## Deliverables

| File | Result |
| --- | --- |
| `chapter-27-premium.md` | 5390 explanatory words (code and inline code excluded; 11798 words including code); 25 sections |
| `chapter-27-premium.pdf` | 52 pages (A4); 1470 KB |
| `chapter-27-premium.docx` | 74 KB; structural validation passed; opened and exported by Microsoft Word (56 pages reported by Word) |
| `project/travel-live/` | src/events.mjs, live-hub.mjs, client-state.mjs, backoff.mjs, rate-limit.mjs, gateway.mjs (ws), sse.mjs, server.mjs, demo-data.mjs; public/index.html, app.mjs; main.mjs; demo.mjs; package.json (ws); README with run commands, runtime versions and limitations; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | 24 run; 17 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log` |
| Project tests (`node --test`) | 18 passed, 0 failed, 0 skipped | `qa-logs/unit-tests.log` |
| Browser end-to-end (real headless Chrome) | 8 of 8 checks passed | `qa-logs/browser-e2e.log` |
| Environment-specific | WebSocket server with `ws` 7.5.10 (verified local copy, loaded through the QA-only resolve hook; nothing installed); clients are Node.js 22 built-in WebSocket and real headless Chrome; dashboard E2E in Chrome: 8 of 8 checks (`qa-logs/browser-e2e.log`); Socket.IO example syntax-checked only (socket.io not installed); Redis Pub/Sub shown with a clearly labelled in-memory simulation | `qa-logs/` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 52 pages) | 12 passed, 0 failed, 1 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 4407 of 4407 words intact | `qa-logs/typography-audit.log` |

Content: 40 source listings, 18 output panels, 0 error panels; 7 tables; 2 callouts; 12 exercises (beginner, intermediate, challenge) with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Curriculum overlap

| | |
| --- | --- |
| Previously learned | Chapter 13–14 (async), Chapter 20 (auth), Chapter 25 (HTTP API, idempotency), Chapter 26 (transactions). |
| Decision | New: polling/SSE/WebSocket, close codes, heartbeat, backpressure, event envelope and versioning, delivery semantics, transactional outbox with node:sqlite, Pub/Sub scaling. v30's dependency-free in-memory simulator is kept as the domain (`live-hub.mjs`) and extended with a real `ws` gateway, an SSE endpoint and a browser dashboard. Project name TravelLive kept from v30. |
| v30 heading | v30 heading kept; the "##" subtitle (WebSockets, Socket.IO, Event-Driven Architecture এবং Distributed Messaging) folded into the learning objectives and text. |

## Real findings during production

- Without an `error` handler on each connection, a single over-size message made `ws` emit an unhandled `error` event and crash the whole test process; the handler was added and a `protocolErrors` metric counts it. The chapter tells the story.
- The first demo printed events as they arrived, and line order varied between runs; it now waits for a given sequence and applies buffered messages in order.
- The first browser run logged a 404 for `/favicon.ico`; an empty icon link removed it.

## Warnings

- 56 code line(s) will wrap with a hanging indent: line 80 (74 chars, Bengali); line 81 (72 chars, Bengali); line 96 (81 chars, Bengali); line 108 (78 chars, Bengali); line 147 (77 chars, Bengali); line 168 (74 chars, Bengali); line 208 (76 chars, Bengali); line 259 (82 chars, Bengali); line 308 (70 chars, Bengali); line 344 (69 chars, Bengali); line 364 (79 chars, Bengali); line 397 (71 chars, Bengali); line 409 (71 chars, Bengali); line 437 (74 chars, Bengali); line 491 (74 chars, Bengali); line 508 (72 chars, Bengali); line 530 (79 chars, Bengali); line 546 (74 chars, Bengali); line 549 (72 chars, Bengali); line 556 (73 chars, Bengali); line 579 (78 chars, Bengali); line 627 (72 chars, Bengali); line 648 (81 chars); line 712 (70 chars, Bengali); line 720 (72 chars, Bengali); line 785 (72 chars, Bengali); line 798 (72 chars, Bengali); line 803 (72 chars, Bengali); line 824 (70 chars, Bengali); line 830 (72 chars, Bengali); line 835 (70 chars, Bengali); line 875 (72 chars, Bengali); line 923 (75 chars, Bengali); line 952 (74 chars, Bengali); line 962 (79 chars, Bengali); line 1064 (70 chars, Bengali); line 1134 (71 chars, Bengali); line 1157 (69 chars, Bengali); line 1211 (72 chars, Bengali); line 1258 (81 chars, Bengali); line 1281 (73 chars, Bengali); line 1304 (73 chars, Bengali); line 1312 (77 chars, Bengali); line 1319 (76 chars, Bengali); line 1333 (76 chars, Bengali); line 1346 (75 chars, Bengali); line 1406 (80 chars, Bengali); line 1447 (69 chars, Bengali); line 1451 (69 chars, Bengali); line 1561 (76 chars, Bengali); line 1562 (81 chars); line 1632 (77 chars, Bengali); line 1714 (76 chars, Bengali); line 1758 (72 chars, Bengali); line 1801 (69 chars, Bengali); line 1808 (71 chars, Bengali)
- pages with more than 33% empty space at the bottom: page 3 (38% empty)

## Visual inspection

PDF pages 1, 3, 4, 30 were rendered to images and looked at by eye (opening, flagged page 3, concept table, project code (server.mjs parts)). Page 3 was flagged by the white-space check (38% empty): the next listing (01-polling-cost.mjs) is kept together and starts page 4. Accepted as a cosmetic layout note. No rendering defect was found: Bengali shaping, code panels, "Part N of M" captions, tables and callouts display correctly; long titles make the running header wrap to two lines (template behaviour). The remaining pages passed the automated layout checks only.

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
