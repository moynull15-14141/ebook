# QA Summary — Chapter 23

**Chapter:** অধ্যায় ২৩ — JavaScript Performance Optimization, Memory Management, Profiling এবং Web Application Performance
**Status: PASS** — 10 of 10 automated gates passed (last QA run 2026-10-18T06:36:21.619Z)
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/chapter-23.md` (title and scope); text rewritten for the premium edition
**Built with:** `book-output/master-design-system/` 1.0.0 (with the approved 2026-10-15 listing-label fix; not modified in this phase)

## Deliverables

| File | Result |
| --- | --- |
| `chapter-23-premium.md` | 3430 explanatory words (code and inline code excluded; 7024 words including code); 21 sections |
| `chapter-23-premium.pdf` | 33 pages (A4); 1000 KB |
| `chapter-23-premium.docx` | 47 KB; structural validation passed; opened and exported by Microsoft Word (36 pages reported by Word) |
| `project/travel-search/` | src/data.mjs, search.mjs, virtual.mjs, search-worker.mjs, app.mjs, profile-report.mjs; profile.mjs; serve.mjs; index.html, style.css; README with run commands and runtime versions; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | 16 run; 11 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log` |
| Listings run in real Chrome (local HTTP server) | 10 run in Chrome/155.0.8059.80; 7 compared; 0 mismatch | `qa-logs/browser-run.log` |
| Project tests (`node --test`) | 15 passed, 0 failed, 0 skipped | `qa-logs/unit-tests.log` |
| Environment-specific | Browser E2E: 1 test with 3 subtests in real Chrome (part of the 15): DOM stays at 20 rows or fewer for 12,000 results, last record after scrolling, Worker results equal the Node.js naive search | `qa-logs/` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 33 pages) | 13 passed, 0 failed, 0 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 2808 of 2808 words intact | `qa-logs/typography-audit.log` |

Content: 30 source listings, 14 output panels, 0 error panels; 7 tables; 1 callouts; 12 exercises (beginner, intermediate, challenge) with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Curriculum overlap

| | |
| --- | --- |
| Previously learned | Chapter 19 covers the same v30 subject (performance, memory): Big-O, measurement, long tasks, layout thrashing, GC, WeakMap, LRU, network. |
| Decision | This is the main curriculum overlap in v30 (Chapters 19 and 23 are both performance chapters). Chapter 19 material is referenced, not repeated. New material: User Timing and PerformanceObserver, programmatic CPU profiles and self time, event-loop delay histogram, heap measurement after GC, Long Task observer, rendering pipeline (transform vs layout), full virtual scrolling, Web Workers and transferables, request-ID race handling. Project TravelSearch Explorer (v30 name kept) is a browser application, distinct from Chapter 19's Node.js PerfLab harness. |
| v30 heading | v30 heading "অধ্যায় ২৩:" normalized; title kept. |

## Real findings during production

- The CPU profile showed 68.6% of time in re-tokenising records on every naive search; the index removes it (median 8.29 ms vs 0.39 ms on one machine, reported with environment, not used as a test gate).
- A leak demo showed that after `abort()` the memory was released only after the next event-loop turn on Node.js 22.16.0; the example waits one tick and the chapter says so. Node.js also printed `MaxListenersExceededWarning`, which the chapter explains.
- An E2E race (typing debounce vs sort change) was removed by ordering the steps.

## Warnings

- 24 code line(s) will wrap with a hanging indent: line 55 (82 chars); line 210 (97 chars, Bengali); line 211 (91 chars, Bengali); line 250 (76 chars, Bengali); line 251 (88 chars, Bengali); line 275 (91 chars, Bengali); line 330 (79 chars, Bengali); line 333 (83 chars, Bengali); line 354 (72 chars, Bengali); line 355 (69 chars, Bengali); line 369 (71 chars, Bengali); line 451 (69 chars, Bengali); line 490 (76 chars, Bengali); line 509 (72 chars, Bengali); line 560 (77 chars, Bengali); line 593 (82 chars, Bengali); line 625 (73 chars, Bengali); line 681 (69 chars, Bengali); line 682 (71 chars, Bengali); line 727 (79 chars, Bengali); line 738 (72 chars, Bengali); line 764 (75 chars, Bengali); line 796 (71 chars, Bengali); line 974 (82 chars)

## Visual inspection

PDF pages 1, 9, 16, 29, 33 were rendered to images and looked at by eye (opening, concept (virtual scrolling), project code (app.mjs part 2/2), solutions + MCQ, final). No page was flagged by the white-space check. No rendering defect was found: Bengali shaping, code panels, "Part N of M" and "Selected Excerpt" captions, tables and callouts display correctly. The remaining pages passed the automated layout checks only.

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
