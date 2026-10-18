# QA Summary — Chapter 29

**Chapter:** অধ্যায় ২৯ — Advanced JavaScript System Design, Microservices, Distributed Systems এবং Enterprise Architecture
**Status: PASS** — 10 of 10 automated gates passed (last QA run 2026-10-18T11:37:47.977Z)
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/chapter-29.md` (title and scope); text rewritten for the premium edition
**Built with:** `book-output/master-design-system/` 1.0.0 (with the approved 2026-10-15 listing-label fix; not modified in this phase)

## Deliverables

| File | Result |
| --- | --- |
| `chapter-29-premium.md` | 4363 explanatory words (code and inline code excluded; 9268 words including code); 26 sections |
| `chapter-29-premium.pdf` | 40 pages (A4); 1030 KB |
| `chapter-29-premium.docx` | 60 KB; structural validation passed; opened and exported by Microsoft Word (44 pages reported by Word) |
| `project/travel-saga/` | src/services/http-util.mjs, inventory.mjs, payment.mjs; src/http-client.mjs, saga-store.mjs (node:sqlite), orchestrator.mjs, system.mjs; demo.mjs; README with run commands, runtime versions and limitations; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | 19 run; 12 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log` |
| Project tests (`node --test`) | 14 passed, 0 failed, 0 skipped | `qa-logs/unit-tests.log` |
| Environment-specific | Two real HTTP participant services on random ports, orchestrator with a SQLite saga log; crash recovery tested at two crash points with a real database file; failure-lab demo logged (`qa-logs/demo.log`) | `qa-logs/` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 40 pages) | 12 passed, 0 failed, 1 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 3745 of 3745 words intact | `qa-logs/typography-audit.log` |

Content: 27 source listings, 13 output panels, 0 error panels; 7 tables; 1 callouts; 12 exercises (beginner, intermediate, challenge) with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Curriculum overlap

| | |
| --- | --- |
| Previously learned | Chapter 25 (Idempotency-Key), Chapter 26 (transactions), Chapter 27 (outbox, backoff), Chapter 28 (health, metrics). |
| Decision | New: capacity planning with Little's Law, modular monolith, bounded contexts, saga orchestration vs choreography, key + fingerprint idempotency, CAP with a partition simulation, circuit breaker, bulkhead, inbox, crash recovery. v30's in-memory TravelSaga is rebuilt with real HTTP participants and a durable SQLite saga log; name kept. |
| v30 heading | v30 heading kept; "Learning Outcomes" section renamed to the book's standard headings. |

## Real findings during production

- The first test run failed six saga tests with "ভুল Field: bookingId": the test IDs were shorter than the validator's 3-character minimum (a test bug, not a code bug); IDs fixed. The chapter tells the story.
- One demo scenario hit validation (seats > 9) instead of "sold out"; the scenario was corrected.

## Warnings

- 51 code line(s) will wrap with a hanging indent: line 62 (82 chars, Bengali); line 76 (74 chars, Bengali); line 77 (69 chars, Bengali); line 107 (71 chars, Bengali); line 110 (70 chars, Bengali); line 128 (70 chars, Bengali); line 142 (76 chars, Bengali); line 196 (71 chars, Bengali); line 197 (70 chars, Bengali); line 198 (76 chars, Bengali); line 199 (80 chars, Bengali); line 200 (74 chars, Bengali); line 208 (72 chars, Bengali); line 256 (73 chars, Bengali); line 282 (71 chars, Bengali); line 290 (77 chars, Bengali); line 337 (69 chars, Bengali); line 338 (80 chars, Bengali); line 467 (78 chars, Bengali); line 468 (69 chars, Bengali); line 516 (72 chars, Bengali); line 551 (80 chars, Bengali); line 576 (76 chars, Bengali); line 591 (82 chars); line 638 (82 chars); line 677 (82 chars); line 678 (81 chars); line 682 (75 chars, Bengali); line 751 (70 chars, Bengali); line 762 (74 chars, Bengali); line 772 (76 chars, Bengali); line 799 (81 chars); line 831 (77 chars, Bengali); line 892 (70 chars, Bengali); line 895 (75 chars, Bengali); line 896 (70 chars, Bengali); line 927 (76 chars, Bengali); line 937 (82 chars, Bengali); line 950 (69 chars, Bengali); line 969 (77 chars, Bengali); line 978 (73 chars, Bengali); line 1097 (77 chars, Bengali); line 1100 (70 chars, Bengali); line 1130 (80 chars, Bengali); line 1171 (78 chars, Bengali); line 1172 (77 chars, Bengali); line 1181 (77 chars, Bengali); line 1203 (72 chars, Bengali); line 1204 (71 chars, Bengali); line 1250 (70 chars, Bengali); line 1283 (72 chars, Bengali)
- pages with more than 33% empty space at the bottom: page 3 (43% empty); page 6 (35% empty)

## Visual inspection

PDF pages 1, 3, 6, 24, 40, 41 were rendered to images and looked at by eye (opening, flagged pages 3 and 6, demo output, final page 40 after the widow fix (page 41 of the earlier build was inspected and fixed)). Pages 3 (43% empty) and 6 (35% empty) were flagged: kept-together listings start the next page. Accepted as cosmetic. The first build also ended with a page holding two Further Reading entries; four pairs of glossary rows were merged (no term dropped) and the two AWS links were combined in one entry; the chapter now ends on page 40, rendered again and inspected. No rendering defect was found: Bengali shaping, code panels, "Part N of M" captions, tables and callouts display correctly; long titles make the running header wrap to two lines (template behaviour). The remaining pages passed the automated layout checks only.

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
