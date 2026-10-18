# QA Summary — Chapter 21

**Chapter:** অধ্যায় ২১ — JavaScript Design Patterns, Software Architecture এবং Scalable Application Structure
**Status: PASS** — 11 of 11 automated gates passed (last QA run 2026-10-15T11:48:19.367Z)
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/chapter-21.md` (title and scope); text rewritten for the premium edition
**Built with:** `book-output/master-design-system/` 1.0.0 (with the approved 2026-10-15 listing-label fix; not modified in this phase)

## Deliverables

| File | Result |
| --- | --- |
| `chapter-21-premium.md` | 3324 explanatory words (code and inline code excluded; 7053 words including code); 23 sections |
| `chapter-21-premium.pdf` | 35 pages (A4); 951 KB |
| `chapter-21-premium.docx` | 47 KB; structural validation passed; opened and exported by Microsoft Word (38 pages reported by Word) |
| `project/visa-flow/` | src/domain/ (errors, fees, workflow, application), src/app/ (events, ids, service), src/infra/ (memory and storage repositories), src/ui/view.mjs, src/main.mjs; demo.mjs; index.html, style.css; README with run commands; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | 25 run; 15 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log` |
| Listings marked Browser or Browser Console run in real Chrome (local HTTP server) | 5 run in Chrome/155.0.8059.40; 4 compared; 0 mismatch | `qa-logs/browser-run.log` |
| JavaScript syntax (`node --check`) | passed | `qa-logs/syntax-checks.log` |
| Project unit and integration tests (`node --test`) | 31 passed, 0 failed, 0 skipped | `qa-logs/unit-tests.log` |
| Project end-to-end in Chrome | 14 of 14 checks passed (real headless Chrome/155.0.8059.40, project served from 127.0.0.1) | `qa-logs/browser-e2e.log` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 35 pages) | 13 passed, 0 failed, 0 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 2690 of 2690 words intact | `qa-logs/typography-audit.log` |

Content: 30 source listings, 15 output panels, 0 error panels; 10 tables; 2 callouts; 12 exercises (beginner, intermediate, challenge) with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Curriculum overlap

| | |
| --- | --- |
| Previously learned | Chapter 12 (ES modules), Chapter 13 (classes, composition vs inheritance; booking-lab), Chapter 16 (repository and service; booking-guard). |
| Decision | Repository/service recapped and extended (adapters, contract tests, composition root, DI of clock and ids). v30's "TravelFlow Booking Manager" would have repeated the booking domain of Chapters 13 and 16, so the project is VisaFlow, a visa-application workflow tracker, with a table-driven state machine, fee strategies with a decorator, an event bus, two repository adapters and an architecture test. |
| v30 heading | v30 heading "অধ্যায় ২১:" normalized to "অধ্যায় ২১ —"; title kept; project renamed and re-scoped as described. |

## Specific verification notes

- The VisaFlow end-to-end check in Chrome found two real bugs that the unit tests had missed: failed creates consumed IDs, and the browser ID sequence restarted from the item count (which could reissue an existing ID and overwrite an application). Both were fixed (Factory takes `newId`, `sequenceAfter`), regression tests were added, and the chapter describes the finding.

## Warnings

- 27 code line(s) will wrap with a hanging indent: line 299 (72 chars, Bengali); line 312 (74 chars, Bengali); line 333 (71 chars, Bengali); line 341 (75 chars, Bengali); line 355 (69 chars, Bengali); line 410 (78 chars, Bengali); line 411 (75 chars, Bengali); line 415 (76 chars, Bengali); line 418 (79 chars, Bengali); line 426 (75 chars, Bengali); line 451 (73 chars, Bengali); line 480 (76 chars, Bengali); line 486 (71 chars, Bengali); line 500 (76 chars, Bengali); line 517 (70 chars, Bengali); line 547 (78 chars, Bengali); line 548 (72 chars, Bengali); line 568 (74 chars, Bengali); line 569 (71 chars, Bengali); line 616 (74 chars, Bengali); line 623 (78 chars, Bengali); line 646 (71 chars, Bengali); line 739 (72 chars, Bengali); line 1031 (81 chars); line 1066 (82 chars); line 1103 (81 chars); line 1166 (75 chars, Bengali)

## Visual inspection

PDF pages 1, 8, 18, 32, 35 of 35 were rendered to images and looked at by eye (opening, concept (state machine, layers), project code (main.mjs part 2/2), solution 12 + MCQ, final). No page was flagged by the white-space check. No rendering defect was found: Bengali shaping, code panels, "Part N of M" captions, tables and callouts display correctly. The remaining pages passed the automated layout checks only. Word's PDF export of the DOCX was also inspected on page 9.

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
