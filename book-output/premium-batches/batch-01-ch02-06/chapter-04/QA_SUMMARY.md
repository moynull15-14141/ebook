# QA Summary — Chapter 04

**Chapter:** অধ্যায় ৪ — Loops এবং Iteration
**Status: PASS** — 9 of 9 automated gates passed
**Built with:** master design system 1.0.0; Node.js v22.16.0

## Deliverables

| File | Result |
| --- | --- |
| `chapter-04-premium.md` | 3267 explanatory words (code and inline code excluded); 24 sections |
| `chapter-04-premium.pdf` | 32 pages (A4); 1015 KB |
| `chapter-04-premium.docx` | 38 KB; structural validation passed |
| `project/cart-analyzer/` | Runnable project with README and tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings extracted from the chapter and executed | 29 run; 28 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log`, `node-examples.log` |
| JavaScript syntax (`node --check`), project and test file | passed | `qa-logs/syntax-checks.log` |
| Unit tests (`node --test`) | 15 passed, 0 failed | `qa-logs/unit-tests.log` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 32 pages) | 16 passed, 0 failed, 0 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 2852 of 2852 words intact | `qa-logs/typography-audit.log` |

Content: 32 source listings, 29 output panels, 0 error panels; 12 tables; 2 callouts; 12 exercises with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Warnings

- 2 code line(s) will wrap with a hanging indent: line 692 (70 chars, Bengali); line 693 (85 chars, Bengali)

## Visual inspection

No page of this chapter was looked at by eye. All 32 pages passed the automated layout checks (no text outside the margins, no stranded heading, no blank or duplicate page). The DOCX was not opened in Word; it passed structural validation only.

## Not done

- No second-reader Bengali proofread.
- Browser behaviour was not tested: the project runs in Node.js and has no browser part. Listings marked "Browser Console ও Node.js" were executed in Node.js only.
- No test on macOS or Linux.
