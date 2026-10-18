# QA Summary — Chapter 22

**Chapter:** অধ্যায় ২২ — JavaScript Testing Mastery: Unit Testing, Integration Testing, Mocking, TDD এবং E2E
**Status: PASS** — 11 of 11 automated gates passed (last QA run 2026-10-18T06:36:05.197Z)
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/chapter-22.md` (title and scope); text rewritten for the premium edition
**Built with:** `book-output/master-design-system/` 1.0.0 (with the approved 2026-10-15 listing-label fix; not modified in this phase)

## Deliverables

| File | Result |
| --- | --- |
| `chapter-22-premium.md` | 3585 explanatory words (code and inline code excluded; 8288 words including code); 26 sections |
| `chapter-22-premium.pdf` | 39 pages (A4); 1225 KB |
| `chapter-22-premium.docx` | 52 KB; structural validation passed; opened and exported by Microsoft Word (41 pages reported by Word) |
| `project/currency-desk/` | src/money.mjs, fees.mjs, rates.mjs, quote.mjs, rate-server.mjs, api.mjs, start.mjs; server.mjs; public/ UI; .github/workflows/test.yml; package.json; README with run commands and runtime versions; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | 28 run; 15 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log` |
| Listings run in real Chrome (local HTTP server) | 2 run in Chrome/155.0.8059.80; 2 compared; 0 mismatch | `qa-logs/browser-run.log` |
| Project tests (`node --test`) | 38 passed, 0 failed, 0 skipped | `qa-logs/unit-tests.log` |
| Environment-specific | Browser E2E: 1 test in real Chrome (part of the 38); coverage report recorded in `qa-logs/coverage.log` (all `src` files 100% lines) | `qa-logs/` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 39 pages) | 12 passed, 0 failed, 1 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 3170 of 3170 words intact | `qa-logs/typography-audit.log` |

Content: 38 source listings, 14 output panels, 2 error panels; 7 tables; 1 callouts; 12 exercises (beginner, intermediate, challenge) with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Curriculum overlap

| | |
| --- | --- |
| Previously learned | Chapter 16 (node:test, test doubles, coverage basics, testing pyramid; booking-guard), Chapter 19 (seeded random), Chapter 20 (tests against a local server), Chapter 21 (contract tests). |
| Decision | Recap table only. New material: choosing the test level, AAA and table-driven tests, equivalence partitioning and boundary values (which exposed a real fee "cliff"), property-based tests, a full red–green–refactor cycle with real failing output, mock.fn/mock.method/mock.timers, flaky-test causes, coverage gaps found and fixed, mutation testing, real-browser E2E without installing Playwright, CI workflow. v30's "Booking Quality Lab" would repeat the booking domain, so the project is CurrencyDesk (forex quotes). |
| v30 heading | v30 heading "অধ্যায় ২২:" normalized to "অধ্যায় ২২ —"; title kept. |

## Real findings during production

- A boundary-value test exposed a fee "cliff" in the draft fee table (999.99 paid 50.00, 1,000.00 paid 15.00); a property test ("fee never decreases") caught it independently; the table was fixed and the story is told in the chapter.
- The first coverage run showed that `isValid` (quote expiry) and the "amount too large" branch had no test; tests were added and the real before/after report is in the chapter.
- Two of my own predicted test expectations were wrong (a large conversion and a rounding-based property); corrected after checking the code was right.

## Warnings

- 25 code line(s) will wrap with a hanging indent: line 110 (74 chars, Bengali); line 151 (83 chars, Bengali); line 367 (70 chars, Bengali); line 370 (93 chars, Bengali); line 422 (76 chars, Bengali); line 462 (73 chars, Bengali); line 463 (73 chars, Bengali); line 503 (79 chars, Bengali); line 526 (72 chars, Bengali); line 539 (80 chars, Bengali); line 601 (77 chars, Bengali); line 637 (74 chars, Bengali); line 670 (73 chars, Bengali); line 698 (72 chars, Bengali); line 791 (74 chars, Bengali); line 813 (74 chars, Bengali); line 830 (75 chars, Bengali); line 845 (75 chars, Bengali); line 864 (76 chars, Bengali); line 877 (77 chars, Bengali); line 920 (75 chars, Bengali); line 963 (70 chars, Bengali); line 964 (75 chars, Bengali); line 1186 (75 chars, Bengali); line 1343 (75 chars, Bengali)
- pages with more than 33% empty space at the bottom: page 12 (34% empty)

## Visual inspection

PDF pages 1, 6, 12, 18, 35, 39 were rendered to images and looked at by eye (opening, concept (TDD red stage), flagged page 12, project code (api.mjs part 2/2), MCQ, final). Page 12 was flagged by the white-space check (34% empty): the next heading and its folder-structure panel are kept together and start page 13. Content and order are correct; accepted as a cosmetic layout note (a fix would need a template change). No rendering defect was found: Bengali shaping, code panels, "Part N of M" and "Selected Excerpt" captions, tables and callouts display correctly. The remaining pages passed the automated layout checks only.

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
