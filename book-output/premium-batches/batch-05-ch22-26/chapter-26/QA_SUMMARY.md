# QA Summary — Chapter 26

**Chapter:** অধ্যায় ২৬ — Advanced Database Integration, ORM, Query Optimization এবং Scalable Data Architecture
**Status: PASS** — 10 of 10 automated gates passed (last QA run 2026-10-18T06:39:07.844Z)
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/chapter-26.md` (title and scope); text rewritten for the premium edition
**Built with:** `book-output/master-design-system/` 1.0.0 (with the approved 2026-10-15 listing-label fix; not modified in this phase)

## Deliverables

| File | Result |
| --- | --- |
| `chapter-26-premium.md` | 3374 explanatory words (code and inline code excluded; 8127 words including code); 24 sections |
| `chapter-26-premium.pdf` | 36 pages (A4); 1116 KB |
| `chapter-26-premium.docx` | 51 KB; structural validation passed; opened and exported by Microsoft Word (39 pages reported by Word) |
| `project/travel-data/` | migrations/001–003 (SQL); src/db.mjs, migrate.mjs, errors.mjs, customers.mjs, ledger.mjs, reports.mjs, backup.mjs, postgres-ledger.mjs (not executed); demo.mjs; README with run commands and runtime versions; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | 19 run; 12 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log` |
| Project tests (`node --test`) | 21 passed, 0 failed, 0 skipped | `qa-logs/unit-tests.log` |
| Environment-specific | Database: real SQLite via `node:sqlite` (in-memory and temp-file databases only); constraints, rollback, savepoints, idempotency, two-connection locking, lost update and its fixes, query plans, backup; PostgreSQL adapter syntax-checked only (no PostgreSQL server); Prisma not installed or run | `qa-logs/` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 36 pages) | 13 passed, 0 failed, 0 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 2717 of 2717 words intact | `qa-logs/typography-audit.log` |

Content: 33 source listings, 12 output panels, 0 error panels; 8 tables; 2 callouts; 12 exercises (beginner, intermediate, challenge) with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Curriculum overlap

| | |
| --- | --- |
| Previously learned | Chapter 20 (parameterized queries, node:sqlite), Chapter 21 and 25 (repository contract, idempotency, optimistic concurrency). |
| Decision | v30 teaches PostgreSQL and Prisma, which were not available on the QA machine and were not installed. All executable work uses node:sqlite, which shows real constraints, transactions, locks, indexes and plans; PostgreSQL and Prisma are explained with a differences table, a syntax-checked pg adapter and a Prisma example, each clearly marked as not executed. Project keeps the v30 name TravelData Pro but uses a loyalty-points ledger instead of bookings. |
| v30 heading | v30 heading "অধ্যায় ২৬ —" with a "##" subtitle (PostgreSQL, Prisma এবং TravelData Pro); main title kept, subtitle folded into the text. |

## Real findings during production

- Two real SQLite connections produced "database is locked" and a lost update (final 50 instead of 150); both fixes are tested.
- On Windows, temp database files could not be removed before connections closed; the test helper closes tracked databases first.

## Warnings

- 33 code line(s) will wrap with a hanging indent: line 53 (82 chars); line 61 (70 chars, Bengali); line 147 (81 chars); line 271 (78 chars, Bengali); line 363 (73 chars, Bengali); line 417 (77 chars, Bengali); line 431 (70 chars, Bengali); line 461 (69 chars, Bengali); line 468 (74 chars, Bengali); line 487 (73 chars, Bengali); line 488 (70 chars, Bengali); line 501 (80 chars, Bengali); line 539 (78 chars, Bengali); line 583 (77 chars, Bengali); line 671 (80 chars, Bengali); line 703 (71 chars, Bengali); line 706 (72 chars, Bengali); line 726 (77 chars, Bengali); line 736 (80 chars, Bengali); line 748 (69 chars, Bengali); line 764 (78 chars, Bengali); line 775 (72 chars, Bengali); line 776 (76 chars, Bengali); line 792 (71 chars, Bengali); line 805 (82 chars, Bengali); line 817 (74 chars, Bengali); line 871 (83 chars, Bengali); line 897 (87 chars, Bengali); line 939 (79 chars, Bengali); line 948 (85 chars, Bengali); line 1084 (82 chars); line 1108 (82 chars); line 1113 (81 chars)

## Visual inspection

PDF pages 1, 8, 19, 33, 36, 37 were rendered to images and looked at by eye (opening, concept (lost update, index and query plan), project code (ledger.mjs part 2/2), solution 12 + MCQ, final page 36 after the widow fix (page 37 of the earlier build was inspected and fixed)). The first build ended with a page holding one Further Reading line. Two pairs of glossary rows were merged (Primary/Foreign Key; Transaction/ACID) without dropping any term; the chapter now ends on page 36, which was rendered again and inspected. No rendering defect was found: Bengali shaping, code panels, "Part N of M" and "Selected Excerpt" captions, tables and callouts display correctly. The remaining pages passed the automated layout checks only. Word's PDF export of the DOCX was also inspected on page 24.

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
