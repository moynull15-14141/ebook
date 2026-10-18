# QA Summary — Chapter 14

**Chapter:** অধ্যায় ১৪ — Advanced Functions, Closures, Higher-Order Patterns এবং Functional Programming
**Status: PASS** — 10 of 10 automated gates passed (last QA run 2026-10-15T10:47:38.465Z)
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/chapter-14.md` (title and scope); text rewritten for the premium edition
**Built with:** `book-output/master-design-system/` 1.0.0 (with the approved 2026-10-15 listing-label fix)

## Deliverables

| File | Result |
| --- | --- |
| `chapter-14-premium.md` | 3229 explanatory words (code and inline code excluded); 23 sections |
| `chapter-14-premium.pdf` | 31 pages (A4); 906 KB |
| `chapter-14-premium.docx` | 41 KB; structural validation passed; opened and exported by Microsoft Word (34 pages reported by Word) |
| `project/sales-function-lab/` | src/fp.mjs, sales.mjs, format.mjs; data/sales.mjs; report.mjs (Node.js); README; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | 26 run; 22 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log` |
| Listings marked Browser or Browser Console run in real Chrome (local HTTP server) | 22 run in Chrome/155.0.8059.40; 20 compared; 0 mismatch | `qa-logs/browser-run.log` |
| JavaScript syntax (`node --check`) | passed | `qa-logs/syntax-checks.log` |
| Project unit and integration tests (`node --test`) | 22 passed, 0 failed | `qa-logs/unit-tests.log` |
| Project browser tests | none: Node.js project (chapter listings still run in Chrome) | — |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 31 pages) | 13 passed, 0 failed, 0 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 2658 of 2658 words intact | `qa-logs/typography-audit.log` |

Content: 28 source listings, 22 output panels, 0 error panels; 8 tables; 1 callouts; 12 exercises with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Warnings

- 5 code line(s) will wrap with a hanging indent: line 387 (69 chars, Bengali); line 588 (71 chars, Bengali); line 678 (81 chars, Bengali); line 713 (72 chars, Bengali); line 722 (77 chars, Bengali)

## Visual inspection

PDF pages 1, 8, 17, 28, 31 of 31 were rendered to images and looked at by eye (opening, concept (currying), project code (sales.mjs parts 1-2), MCQ, final). No page was flagged by the white-space check. No rendering defect was found: Bengali shaping, code panels, "Part N of M" captions, tables and callouts display correctly. The remaining pages passed the automated layout checks only.

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
