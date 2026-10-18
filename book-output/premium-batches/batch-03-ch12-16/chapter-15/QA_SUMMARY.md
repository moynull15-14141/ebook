# QA Summary — Chapter 15

**Chapter:** অধ্যায় ১৫ — JavaScript Browser APIs, Web Storage, Fetch, URL এবং Real-World Browser Applications
**Status: PASS** — 11 of 11 automated gates passed (last QA run 2026-10-15T10:44:29.615Z)
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/chapter-15.md` (title and scope); text rewritten for the premium edition
**Built with:** `book-output/master-design-system/` 1.0.0 (with the approved 2026-10-15 listing-label fix)

## Deliverables

| File | Result |
| --- | --- |
| `chapter-15-premium.md` | 3240 explanatory words (code and inline code excluded); 22 sections |
| `chapter-15-premium.pdf` | 37 pages (A4); 1102 KB |
| `chapter-15-premium.docx` | 46 KB; structural validation passed; opened and exported by Microsoft Word (40 pages reported by Word) |
| `project/bookmark-vault/` | src/bookmarks.mjs, url-state.mjs, storage.mjs; app.mjs, index.html, style.css; README; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | 18 run; 15 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log` |
| Listings marked Browser or Browser Console run in real Chrome (local HTTP server) | 21 run in Chrome/155.0.8059.40; 19 compared; 0 mismatch | `qa-logs/browser-run.log` |
| JavaScript syntax (`node --check`) | passed | `qa-logs/syntax-checks.log` |
| Project unit and integration tests (`node --test`) | 21 passed, 0 failed | `qa-logs/unit-tests.log` |
| Project browser tests | 14 passed, 0 failed (real headless Chrome/155.0.8059.40, served from a local HTTP server) | `qa-logs/project-browser-tests.log` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 37 pages) | 13 passed, 0 failed, 0 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 2552 of 2552 words intact | `qa-logs/typography-audit.log` |

Content: 37 source listings, 23 output panels, 0 error panels; 8 tables; 1 callouts; 12 exercises with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Warnings

- 19 code line(s) will wrap with a hanging indent: line 194 (71 chars, Bengali); line 210 (70 chars, Bengali); line 385 (75 chars, Bengali); line 534 (75 chars, Bengali); line 553 (76 chars, Bengali); line 582 (82 chars); line 596 (70 chars, Bengali); line 599 (82 chars); line 742 (75 chars, Bengali); line 749 (76 chars, Bengali); line 842 (74 chars, Bengali); line 911 (90 chars, Bengali); line 926 (84 chars, Bengali); line 942 (73 chars, Bengali); line 945 (69 chars, Bengali); line 966 (75 chars, Bengali); line 1144 (81 chars); line 1253 (85 chars, Bengali); line 1272 (82 chars)

## Visual inspection

PDF pages 1, 7, 20, 34, 37 of 37 were rendered to images and looked at by eye (opening, concept (storage event), project code (storage.mjs, index.html), MCQ, final). No page was flagged by the white-space check. No rendering defect was found: Bengali shaping, code panels, "Part N of M" captions, tables and callouts display correctly. The remaining pages passed the automated layout checks only.

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
