# QA Summary — Chapter 03

**Chapter:** অধ্যায় ৩ — Operators এবং Decision Making
**Status: PASS** — 9 of 9 automated gates passed
**Built with:** master design system 1.0.0; Node.js v22.16.0

## Deliverables

| File | Result |
| --- | --- |
| `chapter-03-premium.md` | 3271 explanatory words (code and inline code excluded); 25 sections |
| `chapter-03-premium.pdf` | 33 pages (A4); 1168 KB |
| `chapter-03-premium.docx` | 39 KB; structural validation passed |
| `project/shopping-discount-calculator/` | Runnable project with README and tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings extracted from the chapter and executed | 31 run; 30 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log`, `node-examples.log` |
| JavaScript syntax (`node --check`), project and test file | passed | `qa-logs/syntax-checks.log` |
| Unit tests (`node --test`) | 16 passed, 0 failed | `qa-logs/unit-tests.log` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 33 pages) | 16 passed, 0 failed, 0 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 2946 of 2946 words intact | `qa-logs/typography-audit.log` |

Content: 33 source listings, 30 output panels, 0 error panels; 12 tables; 3 callouts; 12 exercises with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Warnings

- 1 code line(s) will wrap with a hanging indent: line 756 (86 chars, Bengali)

## Visual inspection

Page 1 of 33 looked at by eye. All 33 pages passed the automated layout checks (no text outside the margins, no stranded heading, no blank or duplicate page). The DOCX was not opened in Word; it passed structural validation only.

## Not done

- No second-reader Bengali proofread.
- Browser behaviour was not tested: the project runs in Node.js and has no browser part. Listings marked "Browser Console ও Node.js" were executed in Node.js only.
- No test on macOS or Linux.
