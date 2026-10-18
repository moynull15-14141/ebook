# QA Summary — Chapter 18

**Chapter:** অধ্যায় ১৮ — Functional Programming, Immutability এবং Advanced Data Transformation
**Status: PASS** — 10 of 10 automated gates passed (last QA run 2026-10-15T11:47:36.049Z)
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/chapter-18.md` (title and scope); text rewritten for the premium edition
**Built with:** `book-output/master-design-system/` 1.0.0 (with the approved 2026-10-15 listing-label fix; not modified in this phase)

## Deliverables

| File | Result |
| --- | --- |
| `chapter-18-premium.md` | 2952 explanatory words (code and inline code excluded; 6753 words including code); 23 sections |
| `chapter-18-premium.pdf` | 33 pages (A4); 971 KB |
| `chapter-18-premium.docx` | 43 KB; structural validation passed; opened and exported by Microsoft Word (36 pages reported by Word) |
| `project/ledger-flow/` | src/immutable.mjs, validate.mjs, transform.mjs, load.mjs; data/sample.mjs; report.mjs (Node.js); README with run commands; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | 29 run; 24 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log` |
| Listings marked Browser or Browser Console run in real Chrome (local HTTP server) | 11 run in Chrome/155.0.8059.40; 8 compared; 0 mismatch | `qa-logs/browser-run.log` |
| JavaScript syntax (`node --check`) | passed | `qa-logs/syntax-checks.log` |
| Project unit and integration tests (`node --test`) | 22 passed, 0 failed, 0 skipped | `qa-logs/unit-tests.log` |
| Project end-to-end in Chrome | none: Node.js project (chapter listings still run in Chrome) | — |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 33 pages) | 13 passed, 0 failed, 0 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 2517 of 2517 words intact | `qa-logs/typography-audit.log` |

Content: 31 source listings, 24 output panels, 0 error panels; 6 tables; 0 callouts; 12 exercises (beginner, intermediate, challenge) with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Curriculum overlap

| | |
| --- | --- |
| Previously learned | Chapter 06–07 (array methods, spread, shallow vs deep copy), Chapter 10 (Promise.all) and Chapter 14 (pure functions, pipe/compose, currying, memoization). |
| Decision | Recap table; pipe/compose and currying only referenced. New material: referential transparency, structural sharing, updateIn/setIn, deep freeze, when mutation is acceptable, normalized state, flatMap, Map.groupBy and pivots, Map-index joins, stable multi-key sorting with Intl.Collator, Result type, batched async loading. Project LedgerFlow is an analytics pipeline, distinct from Chapter 14's sales-function-lab (different domain and techniques). |
| v30 heading | v30 title kept. |

## Warnings

- 19 code line(s) will wrap with a hanging indent: line 138 (81 chars); line 203 (81 chars); line 204 (81 chars); line 220 (82 chars); line 277 (81 chars); line 413 (72 chars, Bengali); line 438 (81 chars, Bengali); line 440 (72 chars, Bengali); line 495 (71 chars, Bengali); line 571 (75 chars, Bengali); line 600 (82 chars); line 654 (82 chars); line 730 (71 chars, Bengali); line 748 (79 chars, Bengali); line 835 (81 chars); line 852 (82 chars, Bengali); line 1057 (82 chars); line 1081 (82 chars); line 1133 (82 chars)

## Visual inspection

PDF pages 1, 8, 18, 30, 33 of 33 were rendered to images and looked at by eye (opening, concept (reduce into Map, grouping), project code (transform.mjs part 2/2), MCQ, final). No page was flagged by the white-space check. No rendering defect was found: Bengali shaping, code panels, "Part N of M" captions, tables and callouts display correctly. The remaining pages passed the automated layout checks only.

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
