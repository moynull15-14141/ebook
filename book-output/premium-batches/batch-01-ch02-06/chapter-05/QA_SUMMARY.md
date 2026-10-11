# QA Summary — Chapter 05

**Chapter:** অধ্যায় ৫ — Functions এবং Scope
**Status: PASS** — 9 of 9 automated gates passed
**Built with:** master design system 1.0.0; Node.js v22.16.0

## Deliverables

| File | Result |
| --- | --- |
| `chapter-05-premium.md` | 3615 explanatory words (code and inline code excluded); 25 sections |
| `chapter-05-premium.pdf` | 34 pages (A4); 1018 KB |
| `chapter-05-premium.docx` | 38 KB; structural validation passed |
| `project/invoice-calculator/` | Runnable project with README and tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings extracted from the chapter and executed | 33 run; 30 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log`, `node-examples.log` |
| JavaScript syntax (`node --check`), project and test file | passed | `qa-logs/syntax-checks.log` |
| Unit tests (`node --test`) | 14 passed, 0 failed | `qa-logs/unit-tests.log` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 34 pages) | 15 passed, 0 failed, 1 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 3018 of 3018 words intact | `qa-logs/typography-audit.log` |

Content: 35 source listings, 28 output panels, 2 error panels; 10 tables; 2 callouts; 12 exercises with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Warnings

- 3 code line(s) will wrap with a hanging indent: line 657 (76 chars, Bengali); line 677 (70 chars, Bengali); line 719 (77 chars, Bengali)
- pages with more than 33% empty space at the bottom: page 7 (34% empty); page 14 (34% empty); page 24 (33% empty)

## Visual inspection

Page 7 of 34 looked at by eye. All 34 pages passed the automated layout checks (no text outside the margins, no stranded heading, no blank or duplicate page). The DOCX was not opened in Word; it passed structural validation only.

## Not done

- No second-reader Bengali proofread.
- Browser behaviour was not tested: the project runs in Node.js and has no browser part. Listings marked "Browser Console ও Node.js" were executed in Node.js only.
- No test on macOS or Linux.
