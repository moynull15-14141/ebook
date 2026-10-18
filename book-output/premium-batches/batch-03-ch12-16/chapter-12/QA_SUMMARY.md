# QA Summary — Chapter 12

**Chapter:** অধ্যায় ১২ — Modern JavaScript (ES6+), Modules এবং Clean Code Practices
**Status: PASS** — 11 of 11 automated gates passed (last QA run 2026-10-15T10:43:36.555Z)
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/chapter-12.md` (title and scope); text rewritten for the premium edition
**Built with:** `book-output/master-design-system/` 1.0.0 (with the approved 2026-10-15 listing-label fix)

## Deliverables

| File | Result |
| --- | --- |
| `chapter-12-premium.md` | 3320 explanatory words (code and inline code excluded); 23 sections |
| `chapter-12-premium.pdf` | 36 pages (A4); 1053 KB |
| `chapter-12-premium.docx` | 44 KB; structural validation passed; opened and exported by Microsoft Word (39 pages reported by Word) |
| `project/modular-shopping-cart/` | ES Modules: src/catalog.mjs, money.mjs, cart.mjs, storage.mjs; app.mjs, index.html, style.css, demo.mjs; README; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | 33 run; 21 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log` |
| Listings marked Browser or Browser Console run in real Chrome (local HTTP server) | 14 run in Chrome/155.0.8059.40; 8 compared; 0 mismatch | `qa-logs/browser-run.log` |
| JavaScript syntax (`node --check`) | passed | `qa-logs/syntax-checks.log` |
| Project unit and integration tests (`node --test`) | 24 passed, 0 failed | `qa-logs/unit-tests.log` |
| Project browser tests | 12 passed, 0 failed (real headless Chrome/155.0.8059.40, served from a local HTTP server) | `qa-logs/project-browser-tests.log` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 36 pages) | 13 passed, 0 failed, 0 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 2577 of 2577 words intact | `qa-logs/typography-audit.log` |

Content: 46 source listings, 22 output panels, 1 error panels; 8 tables; 2 callouts; 12 exercises with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Warnings

- 11 code line(s) will wrap with a hanging indent: line 554 (79 chars, Bengali); line 578 (87 chars, Bengali); line 588 (87 chars, Bengali); line 611 (82 chars); line 621 (69 chars, Bengali); line 635 (82 chars); line 668 (75 chars, Bengali); line 824 (70 chars, Bengali); line 884 (76 chars, Bengali); line 899 (84 chars, Bengali); line 1178 (88 chars, Bengali)

## Visual inspection

PDF pages 1, 6, 18, 33, 36 of 36 were rendered to images and looked at by eye (opening, concept (export/import), project code (cart.mjs part 2/2), MCQ, final). No page was flagged by the white-space check. No rendering defect was found: Bengali shaping, code panels, "Part N of M" captions, tables and callouts display correctly. The remaining pages passed the automated layout checks only. Word's PDF export of the DOCX was also inspected on page 18.

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
