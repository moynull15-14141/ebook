# QA Summary — Chapter 17

**Chapter:** অধ্যায় ১৭ — JavaScript Regular Expressions, Advanced Validation এবং Secure Input Processing
**Status: PASS** — 10 of 10 automated gates passed (last QA run 2026-10-15T11:51:08.773Z)
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/chapter-17.md` (title and scope); text rewritten for the premium edition
**Built with:** `book-output/master-design-system/` 1.0.0 (with the approved 2026-10-15 listing-label fix; not modified in this phase)

## Deliverables

| File | Result |
| --- | --- |
| `chapter-17-premium.md` | 3240 explanatory words (code and inline code excluded; 6052 words including code); 24 sections |
| `chapter-17-premium.pdf` | 31 pages (A4); 974 KB |
| `chapter-17-premium.docx` | 44 KB; structural validation passed; opened and exported by Microsoft Word (34 pages reported by Word) |
| `project/form-shield/` | src/normalize.mjs, patterns.mjs, rules.mjs, engine.mjs; signup-schema.mjs, demo.mjs (Node.js); README with run commands; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | 29 run; 23 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log` |
| Listings marked Browser or Browser Console run in real Chrome (local HTTP server) | 16 run in Chrome/155.0.8059.40; 11 compared; 0 mismatch | `qa-logs/browser-run.log` |
| JavaScript syntax (`node --check`) | passed | `qa-logs/syntax-checks.log` |
| Project unit and integration tests (`node --test`) | 24 passed, 0 failed, 0 skipped | `qa-logs/unit-tests.log` |
| Project end-to-end in Chrome | none: Node.js project (chapter listings still run in Chrome) | — |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 31 pages) | 12 passed, 0 failed, 1 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 2852 of 2852 words intact | `qa-logs/typography-audit.log` |

Content: 29 source listings, 23 output panels, 0 error panels; 7 tables; 1 callouts; 12 exercises (beginner, intermediate, challenge) with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Curriculum overlap

| | |
| --- | --- |
| Previously learned | Chapter 08 (regex basics, Unicode normalization, XSS) and Chapter 11 (trust boundary, ValidationError, collecting all errors). |
| Decision | One recap table (section 17.1); basic regex syntax is not re-taught. Depth goes to lookaround, named groups, sticky matching, Unicode and Bengali digits, normalize-validate-parse, ReDoS and a schema engine. Project FormShield is a reusable validation engine, not a repeat of Chapter 11's order validation. |
| v30 heading | v30 title kept. |

## Specific verification notes

- The ReDoS listing (section 17.9) warms up, then prints measured times for 16 to 24 characters; it has no compared Output panel, so no timing value is a pass/fail gate. The chapter shows one real run labelled with its environment (Windows 10, Node.js 22.16.0) and states how a second run differed (0.44 vs 0.58 ms at 16 characters; 110.09 vs 111.46 ms at 24).

## Warnings

- 23 code line(s) will wrap with a hanging indent: line 95 (82 chars); line 243 (74 chars, Bengali); line 248 (93 chars, Bengali); line 278 (74 chars, Bengali); line 287 (89 chars, Bengali); line 312 (81 chars); line 339 (70 chars, Bengali); line 341 (76 chars, Bengali); line 491 (74 chars, Bengali); line 506 (74 chars, Bengali); line 520 (82 chars); line 558 (75 chars, Bengali); line 582 (69 chars, Bengali); line 621 (94 chars, Bengali); line 627 (82 chars, Bengali); line 631 (106 chars, Bengali); line 634 (91 chars, Bengali); line 672 (81 chars); line 776 (82 chars); line 791 (74 chars, Bengali); line 822 (84 chars, Bengali); line 941 (79 chars, Bengali); line 951 (81 chars)
- pages with more than 33% empty space at the bottom: page 9 (37% empty)

## Visual inspection

PDF pages 1, 5, 9, 12, 16, 27, 31 of 31 were rendered to images and looked at by eye (opening, concept (lookaround, regex methods), flagged page 9, ReDoS measurements (page 12), project code (patterns.mjs, rules.mjs), MCQ, final). Page 9 was flagged by the white-space check (37% empty at the bottom). Cause: the next listing is kept together and moves to page 10, leaving its one-line lead-in at the foot of page 9. Content and order are correct; accepted as a cosmetic layout note (fixing it would need a template change, which this phase does not allow). No rendering defect was found: Bengali shaping, code panels, "Part N of M" captions, tables and callouts display correctly. The remaining pages passed the automated layout checks only.

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
