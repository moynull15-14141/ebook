# QA Summary — Chapter 25

**Chapter:** অধ্যায় ২৫ — JavaScript Backend Development with Node.js: REST APIs, Express, Databases, Authentication এবং Production Architecture
**Status: PASS** — 9 of 9 automated gates passed (last QA run 2026-10-18T06:37:08.800Z)
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/chapter-25.md` (title and scope); text rewritten for the premium edition
**Built with:** `book-output/master-design-system/` 1.0.0 (with the approved 2026-10-15 listing-label fix; not modified in this phase)

## Deliverables

| File | Result |
| --- | --- |
| `chapter-25-premium.md` | 3388 explanatory words (code and inline code excluded; 8038 words including code); 24 sections |
| `chapter-25-premium.pdf` | 37 pages (A4); 1262 KB |
| `chapter-25-premium.docx` | 50 KB; structural validation passed; opened and exported by Microsoft Word (40 pages reported by Word) |
| `project/lead-desk/` | Express 4: src/config.mjs, errors.mjs, leads.mjs, repository.mjs, service.mjs, middleware.mjs, error-handler.mjs, routes.mjs, app.mjs, server.mjs; main.mjs; package.json (express); README with run commands and runtime versions; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | 19 run; 9 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log` |
| Project tests (`node --test`) | 10 passed, 0 failed, 0 skipped | `qa-logs/unit-tests.log` |
| Environment-specific | Backend: Express 4.22.1 (verified local copy, loaded through a QA-only resolve hook; nothing installed); every test starts its own server on 127.0.0.1 with a random port and shuts it down; graceful shutdown tested with a request in flight | `qa-logs/` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 37 pages) | 13 passed, 0 failed, 0 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 2565 of 2565 words intact | `qa-logs/typography-audit.log` |

Content: 29 source listings, 9 output panels, 0 error panels; 10 tables; 2 callouts; 12 exercises (beginner, intermediate, challenge) with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Curriculum overlap

| | |
| --- | --- |
| Previously learned | Chapter 20 (node:http API, cookie sessions, CSRF, scrypt, authorization, log redaction), Chapter 21 (layers, DI). |
| Decision | Security basics are referenced, not repeated. New material: Express routing and middleware chain, error middleware and the Express 4 async-error trap (demonstrated), REST resource and status design, bearer tokens with a role/permission matrix, cursor pagination, Idempotency-Key, ETag/If-Match optimistic concurrency, request IDs and structured logs, rate limiting, health/readiness, graceful shutdown. v30's "TravelCore Booking Backend" was replaced by LeadDesk (customer inquiries) to avoid repeating the booking domain; PostgreSQL is discussed and deferred to Chapter 26 as in v30. |
| v30 heading | v30 heading "অধ্যায় ২৫ — JavaScript Backend Development with Node.js" with a separate "##" subtitle was merged into one title line: "…with Node.js: REST APIs, Express, Databases, Authentication এবং Production Architecture". |

## Real findings during production

- The Express 4 async-error trap was demonstrated for real: no response and an `unhandledRejection` without the wrapper, a clean 500 with it.

## Warnings

- 38 code line(s) will wrap with a hanging indent: line 205 (85 chars, Bengali); line 297 (73 chars, Bengali); line 313 (88 chars, Bengali); line 334 (78 chars, Bengali); line 371 (78 chars, Bengali); line 388 (78 chars, Bengali); line 403 (76 chars, Bengali); line 404 (78 chars, Bengali); line 429 (73 chars, Bengali); line 437 (77 chars, Bengali); line 438 (75 chars, Bengali); line 455 (82 chars, Bengali); line 466 (80 chars, Bengali); line 486 (70 chars, Bengali); line 503 (72 chars, Bengali); line 563 (71 chars, Bengali); line 612 (74 chars, Bengali); line 655 (87 chars, Bengali); line 666 (72 chars, Bengali); line 668 (70 chars, Bengali); line 669 (73 chars, Bengali); line 675 (69 chars, Bengali); line 677 (79 chars, Bengali); line 679 (74 chars, Bengali); line 698 (75 chars, Bengali); line 760 (71 chars, Bengali); line 761 (77 chars, Bengali); line 791 (69 chars, Bengali); line 827 (88 chars, Bengali); line 842 (81 chars, Bengali); line 846 (83 chars, Bengali); line 876 (82 chars, Bengali); line 1048 (81 chars); line 1206 (82 chars); line 1237 (81 chars); line 1257 (81 chars); line 1278 (82 chars); line 1280 (82 chars)

## Visual inspection

PDF pages 1, 4, 17, 34, 37 were rendered to images and looked at by eye (opening, concept (status codes, Express basics), project code (middleware.mjs parts), MCQ, final). No page was flagged by the white-space check. No rendering defect was found: Bengali shaping, code panels, "Part N of M" and "Selected Excerpt" captions, tables and callouts display correctly. The remaining pages passed the automated layout checks only.

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
