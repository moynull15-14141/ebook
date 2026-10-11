# QA Summary — Chapter 02

**Chapter:** অধ্যায় ২ — Variables, Data Types এবং Memory
**Status: PASS** — 9 of 9 automated gates passed
**Built with:** master design system 1.0.0; Node.js v22.16.0

## Deliverables

| File | Result |
| --- | --- |
| `chapter-02-premium.md` | 3662 explanatory words (code and inline code excluded); 23 sections |
| `chapter-02-premium.pdf` | 32 pages (A4); 1194 KB |
| `chapter-02-premium.docx` | 39 KB; structural validation passed |
| `project/student-result-calculator/` | Runnable project with README and tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings extracted from the chapter and executed | 33 run; 32 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log`, `node-examples.log` |
| JavaScript syntax (`node --check`), project and test file | passed | `qa-logs/syntax-checks.log` |
| Unit tests (`node --test`) | 14 passed, 0 failed | `qa-logs/unit-tests.log` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 32 pages) | 16 passed, 0 failed, 0 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 3192 of 3192 words intact | `qa-logs/typography-audit.log` |

Content: 35 source listings, 30 output panels, 2 error panels; 10 tables; 4 callouts; 12 exercises with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Warnings

- 1 code line(s) will wrap with a hanging indent: line 772 (81 chars, Bengali)

## Visual inspection

Page 20 of 32 looked at by eye. All 32 pages passed the automated layout checks (no text outside the margins, no stranded heading, no blank or duplicate page). The DOCX was not opened in Word; it passed structural validation only.

## Not done

- No second-reader Bengali proofread.
- Browser behaviour was not tested: the project runs in Node.js and has no browser part. Listings marked "Browser Console ও Node.js" were executed in Node.js only.
- No test on macOS or Linux.
