# QA Summary — Chapter 10

**Chapter:** অধ্যায় ১০ — Asynchronous JavaScript: Callbacks, Promises, async/await এবং Event Loop
**Status: PASS** — 11 of 11 automated gates passed (last QA run 2026-10-15T05:26:39.819Z)
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/chapter-10.md` (scope and title); text rewritten for the premium edition
**Built with:** `../build-system/` (copy of the master design system 1.0.0; changes listed in `../BUILD_SYSTEM_CHANGES.md`)

## Deliverables

| File | Result |
| --- | --- |
| `chapter-10-premium.md` | 3469 explanatory words (code and inline code excluded); 23 sections |
| `chapter-10-premium.pdf` | 41 pages (A4); 1132 KB |
| `chapter-10-premium.docx` | 47 KB; structural validation passed; opened and exported by Microsoft Word (43 pages reported by Word) |
| `project/user-directory-explorer/` | directory.js, app.js, index.html, style.css; README; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | 32 run; 31 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log`, `node-examples.log` |
| Listings marked Browser or Browser Console run in real Chrome | 28 run in Chrome/155.0.8059.40; 28 compared; 0 mismatch | `qa-logs/browser-run.log`, `browser-listings.log` |
| JavaScript syntax (`node --check`), project and test file | passed | `qa-logs/syntax-checks.log` |
| Unit tests (`node --test`) | 18 passed, 0 failed | `qa-logs/unit-tests.log` |
| Project browser tests | 12 passed, 0 failed (real headless Chrome/155.0.8059.40) | `qa-logs/project-browser-tests.log` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 41 pages) | 12 passed, 0 failed, 1 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 3163 of 3163 words intact | `qa-logs/typography-audit.log` |

Content: 38 source listings, 30 output panels, 1 error panels; 8 tables; 1 callouts; 12 exercises with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Warnings

- 18 code line(s) will wrap with a hanging indent: line 344 (77 chars, Bengali); line 393 (72 chars, Bengali); line 420 (74 chars, Bengali); line 425 (81 chars, Bengali); line 430 (72 chars, Bengali); line 433 (75 chars, Bengali); line 517 (73 chars, Bengali); line 620 (75 chars, Bengali); line 621 (74 chars, Bengali); line 710 (69 chars, Bengali); line 819 (77 chars, Bengali); line 876 (71 chars, Bengali); line 908 (69 chars, Bengali); line 1265 (75 chars, Bengali); line 1315 (80 chars, Bengali); line 1412 (71 chars, Bengali); line 1413 (77 chars, Bengali); line 1437 (74 chars, Bengali)
- pages with more than 33% empty space at the bottom: page 36 (38% empty)

## Visual inspection

PDF pages 1, 3, 24, 36, 37, 41 of 41 were rendered to images and looked at by eye (opening, concept (event loop), project code (directory.js), flagged page 36, solution 12 + MCQ start, final). No rendering defect was found: Bengali shaping, code panels, part captions, tables and callouts display correctly. Page 36 confirms the automated warning: about a third of the page is empty because the next solution listing is kept whole. The remaining pages passed the automated layout checks only.

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
- The live JSONPlaceholder API is not used by any automated test. It was opened once by hand in Chrome on 2026-10-15 (10 users shown).
