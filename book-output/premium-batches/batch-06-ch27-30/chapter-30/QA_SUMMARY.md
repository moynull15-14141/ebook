# QA Summary — Chapter 30

**Chapter:** অধ্যায় ৩০ — JavaScript Professional Mastery, Full-Stack Capstone এবং Career Roadmap
**Status: PASS** — 11 of 11 automated gates passed (last QA run 2026-10-18T11:34:59.934Z)
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/chapter-30.md` (title and scope); text rewritten for the premium edition
**Built with:** `book-output/master-design-system/` 1.0.0 (with the approved 2026-10-15 listing-label fix; not modified in this phase)

## Deliverables

| File | Result |
| --- | --- |
| `chapter-30-premium.md` | 4257 explanatory words (code and inline code excluded; 10081 words including code); 28 sections |
| `chapter-30-premium.pdf` | 43 pages (A4); 1213 KB |
| `chapter-30-premium.docx` | 64 KB; structural validation passed; opened and exported by Microsoft Word (47 pages reported by Word) |
| `project/travel-master-pro/` | src/errors.mjs, validation.mjs, passwords.mjs, db.mjs (node:sqlite), service.mjs, http.mjs, server.mjs; public/index.html, app.mjs, styles.css; main.mjs; demo.mjs; tsconfig.json; package.json (typescript, @types/node as optional devDependencies); README with run commands, runtime versions and limitations; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | 14 run; 7 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log` |
| Project tests (`node --test`) | 17 passed, 0 failed, 0 skipped | `qa-logs/unit-tests.log` |
| Browser end-to-end (real headless Chrome) | 14 of 14 checks passed | `qa-logs/browser-e2e.log` |
| Environment-specific | TypeScript 6.0.2 + @types/node 25.6.0 (verified local copy): strict checkJs on 7 files, 0 errors, plus a control run that reports a deliberate error (`qa-logs/typecheck.log`); 4-thread concurrency test on one SQLite file; frontend E2E in real headless Chrome: 14 of 14 checks incl. double submit, CSP and 375 px width (`qa-logs/browser-e2e.log`) | `qa-logs/` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 43 pages) | 13 passed, 0 failed, 0 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 3520 of 3520 words intact | `qa-logs/typography-audit.log` |

Content: 31 source listings, 8 output panels, 0 error panels; 10 tables; 1 callouts; 12 exercises (beginner, intermediate, challenge) with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Curriculum overlap

| | |
| --- | --- |
| Previously learned | The whole book (capstone); in particular Chapters 17, 20, 22, 24, 25, 26, 28, 29. |
| Decision | v30's TravelMaster Pro requirements (FR1–FR8, non-functional list, API contract, rubric, 12-week roadmap, ADR) are preserved. Upgraded from v30's in-memory demo to node:sqlite with constraints and transactions, hashed session tokens, login rate limiting, a browser frontend tested in Chrome and a strict JSDoc type check. Payment, email verification and password reset are explicitly marked as not implemented. |
| v30 heading | v30 heading "অধ্যায় 30 —" (Latin digits) normalized to "অধ্যায় ৩০ —"; title kept. |

## Real findings during production

- Browser E2E found a real UX bug: a wrong password showed "Session expired"; the client now distinguishes 401 during login from 401 of an expired session.
- Browser E2E found a message race: the login handler's late "welcome" could overwrite a newer booking message; the message is now set before the bookings load.
- A strict type check of all `src/` files passed with zero errors; a control copy with one deliberate type error was rejected (TS2322), proving the check is live.
- Four worker threads booking the same package on one SQLite file produced exactly 20 bookings for 20 seats (20 SOLD_OUT), with seats ending at 0.

## Warnings

- 48 code line(s) will wrap with a hanging indent: line 82 (72 chars, Bengali); line 89 (73 chars, Bengali); line 99 (72 chars, Bengali); line 135 (82 chars); line 176 (74 chars, Bengali); line 185 (76 chars, Bengali); line 186 (78 chars, Bengali); line 193 (81 chars, Bengali); line 220 (81 chars, Bengali); line 234 (74 chars, Bengali); line 259 (69 chars, Bengali); line 274 (69 chars, Bengali); line 278 (73 chars, Bengali); line 410 (72 chars, Bengali); line 428 (78 chars, Bengali); line 524 (74 chars, Bengali); line 538 (80 chars, Bengali); line 602 (72 chars, Bengali); line 611 (75 chars, Bengali); line 647 (69 chars, Bengali); line 648 (73 chars, Bengali); line 649 (75 chars, Bengali); line 684 (75 chars, Bengali); line 710 (70 chars, Bengali); line 733 (73 chars, Bengali); line 759 (72 chars, Bengali); line 803 (71 chars, Bengali); line 866 (77 chars, Bengali); line 867 (74 chars, Bengali); line 874 (69 chars, Bengali); line 896 (76 chars, Bengali); line 919 (72 chars, Bengali); line 932 (69 chars, Bengali); line 993 (80 chars, Bengali); line 1005 (74 chars, Bengali); line 1006 (73 chars, Bengali); line 1018 (69 chars, Bengali); line 1070 (73 chars, Bengali); line 1092 (71 chars, Bengali); line 1147 (77 chars, Bengali); line 1160 (72 chars, Bengali); line 1287 (75 chars, Bengali); line 1307 (74 chars, Bengali); line 1313 (76 chars, Bengali); line 1314 (77 chars, Bengali); line 1315 (72 chars, Bengali); line 1440 (70 chars, Bengali); line 1466 (72 chars, Bengali)

## Visual inspection

PDF pages 1, 29, 43 were rendered to images and looked at by eye (opening, demo output and the honest feature table, final). No page was flagged by the white-space check. No rendering defect was found: Bengali shaping, code panels, "Part N of M" captions, tables and callouts display correctly; long titles make the running header wrap to two lines (template behaviour). The remaining pages passed the automated layout checks only. Word's PDF export of the DOCX was also inspected on page 20.

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
