# QA Summary — Chapter 11

**Chapter:** অধ্যায় ১১ — Error Handling, Debugging এবং Defensive Programming
**Status: PASS** — 11 of 11 automated gates passed (last QA run 2026-10-15T05:34:51.342Z)
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/chapter-11.md` (scope and title); text rewritten for the premium edition
**Built with:** `../build-system/` (copy of the master design system 1.0.0; changes listed in `../BUILD_SYSTEM_CHANGES.md`)

## Deliverables

| File | Result |
| --- | --- |
| `chapter-11-premium.md` | 3227 explanatory words (code and inline code excluded); 22 sections |
| `chapter-11-premium.pdf` | 36 pages (A4); 1046 KB |
| `chapter-11-premium.docx` | 44 KB; structural validation passed; opened and exported by Microsoft Word (39 pages reported by Word) |
| `project/order-validation/` | order-validation.js, app.js, index.html, style.css; README; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | 25 run; 24 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log`, `node-examples.log` |
| Listings marked Browser or Browser Console run in real Chrome | 22 run in Chrome/155.0.8059.40; 22 compared; 0 mismatch | `qa-logs/browser-run.log`, `browser-listings.log` |
| JavaScript syntax (`node --check`), project and test file | passed | `qa-logs/syntax-checks.log` |
| Unit tests (`node --test`) | 16 passed, 0 failed | `qa-logs/unit-tests.log` |
| Project browser tests | 12 passed, 0 failed (real headless Chrome/155.0.8059.40) | `qa-logs/project-browser-tests.log` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 36 pages) | 12 passed, 0 failed, 1 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 3026 of 3026 words intact | `qa-logs/typography-audit.log` |

Content: 32 source listings, 22 output panels, 3 error panels; 8 tables; 2 callouts; 12 exercises with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Warnings

- 16 code line(s) will wrap with a hanging indent: line 101 (69 chars, Bengali); line 293 (69 chars, Bengali); line 512 (70 chars, Bengali); line 552 (80 chars, Bengali); line 575 (84 chars, Bengali); line 586 (75 chars, Bengali); line 597 (74 chars, Bengali); line 604 (76 chars, Bengali); line 624 (71 chars, Bengali); line 668 (81 chars); line 744 (79 chars, Bengali); line 772 (81 chars, Bengali); line 789 (82 chars); line 795 (81 chars, Bengali); line 809 (69 chars, Bengali); line 1198 (69 chars, Bengali)
- pages with more than 33% empty space at the bottom: page 3 (35% empty); page 7 (34% empty); page 28 (33% empty)

## Visual inspection

PDF pages 1, 3, 7, 8, 17, 28, 32, 36 of 36 were rendered to images and looked at by eye (opening, flagged pages 3, 7 and 28, concept (expected vs unexpected), project code, MCQ, final). No rendering defect was found: Bengali shaping, code panels, part captions, tables and callouts display correctly. Pages 3, 7 and 28 confirm the automated warnings: about a third of each page is empty because the next listing is kept whole. The remaining pages passed the automated layout checks only. Word's PDF export of the DOCX was also inspected on page 18.

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
