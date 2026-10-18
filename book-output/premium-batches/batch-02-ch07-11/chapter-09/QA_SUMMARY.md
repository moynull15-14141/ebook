# QA Summary — Chapter 09

**Chapter:** অধ্যায় ৯ — DOM Manipulation, Events এবং Interactive Web Applications
**Status: PASS** — 11 of 11 automated gates passed (last QA run 2026-10-15T05:14:48.445Z)
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/chapter-09.md` (scope and title); text rewritten for the premium edition
**Built with:** `../build-system/` (copy of the master design system 1.0.0; changes listed in `../BUILD_SYSTEM_CHANGES.md`)

## Deliverables

| File | Result |
| --- | --- |
| `chapter-09-premium.md` | 3690 explanatory words (code and inline code excluded); 24 sections |
| `chapter-09-premium.pdf` | 41 pages (A4); 1163 KB |
| `chapter-09-premium.docx` | 47 KB; structural validation passed; opened and exported by Microsoft Word (44 pages reported by Word) |
| `project/task-manager/` | task-core.js, app.js, index.html, style.css; README; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | 3 run; 2 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log`, `node-examples.log` |
| Listings marked Browser or Browser Console run in real Chrome | 21 run in Chrome/155.0.8059.40; 21 compared; 0 mismatch | `qa-logs/browser-run.log`, `browser-listings.log` |
| JavaScript syntax (`node --check`), project and test file | passed | `qa-logs/syntax-checks.log` |
| Unit tests (`node --test`) | 16 passed, 0 failed | `qa-logs/unit-tests.log` |
| Project browser tests | 17 passed, 0 failed (real headless Chrome/155.0.8059.40) | `qa-logs/project-browser-tests.log` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 41 pages) | 13 passed, 0 failed, 0 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 3035 of 3035 words intact | `qa-logs/typography-audit.log` |

Content: 39 source listings, 20 output panels, 1 error panels; 8 tables; 3 callouts; 12 exercises with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Warnings

- 9 code line(s) will wrap with a hanging indent: line 714 (69 chars, Bengali); line 873 (75 chars, Bengali); line 930 (79 chars, Bengali); line 957 (72 chars, Bengali); line 972 (76 chars, Bengali); line 986 (79 chars, Bengali); line 1057 (70 chars, Bengali); line 1069 (83 chars, Bengali); line 1283 (80 chars, Bengali)

## Visual inspection

PDF pages 1, 10, 22, 37, 41 of 41 were rendered to images and looked at by eye (opening, concept (bubbling), project code (task-core.js), solution 12 + MCQ start, final). No rendering defect was found: Bengali shaping, code panels, part captions, tables and callouts display correctly. The remaining pages passed the automated layout checks only. Word's PDF export of the DOCX was also inspected on pages 1, 24.

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
