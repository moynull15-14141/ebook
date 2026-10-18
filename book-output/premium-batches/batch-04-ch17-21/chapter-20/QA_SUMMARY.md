# QA Summary — Chapter 20

**Chapter:** অধ্যায় ২০ — JavaScript Security Fundamentals, Web Application Security এবং Secure Coding Practices
**Status: PASS** — 11 of 11 automated gates passed (last QA run 2026-10-15T11:48:07.438Z)
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/chapter-20.md` (title and scope); text rewritten for the premium edition
**Built with:** `book-output/master-design-system/` 1.0.0 (with the approved 2026-10-15 listing-label fix; not modified in this phase)

## Deliverables

| File | Result |
| --- | --- |
| `chapter-20-premium.md` | 4298 explanatory words (code and inline code excluded; 8972 words including code); 25 sections |
| `chapter-20-premium.pdf` | 41 pages (A4); 1194 KB |
| `chapter-20-premium.docx` | 59 KB; structural validation passed; opened and exported by Microsoft Word (45 pages reported by Word) |
| `project/secure-trip/` | node:http + node:sqlite API (src/app.mjs, http.mjs, passwords.mjs, sessions.mjs, validate.mjs, db.mjs, limiter.mjs, log.mjs, start.mjs), server.mjs; public/ UI; README with run commands; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | 22 run; 13 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log` |
| Listings marked Browser or Browser Console run in real Chrome (local HTTP server) | 7 run in Chrome/155.0.8059.40; 7 compared; 0 mismatch | `qa-logs/browser-run.log` |
| JavaScript syntax (`node --check`) | passed | `qa-logs/syntax-checks.log` |
| Project unit and integration tests (`node --test`) | 24 passed, 0 failed, 0 skipped | `qa-logs/unit-tests.log` |
| Project end-to-end in Chrome | 7 of 7 checks passed (real headless Chrome/155.0.8059.40, project served from 127.0.0.1) | `qa-logs/browser-e2e.log` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 41 pages) | 13 passed, 0 failed, 0 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 3283 of 3283 words intact | `qa-logs/typography-audit.log` |

Content: 35 source listings, 14 output panels, 1 error panels; 11 tables; 4 callouts; 12 exercises (beginner, intermediate, challenge) with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Curriculum overlap

| | |
| --- | --- |
| Previously learned | Chapter 08 (textContent vs innerHTML), Chapter 11 (form validation, trust boundary), Chapter 15 (fetch, storage), Chapter 17 (validation, ReDoS). |
| Decision | XSS basics and client validation recapped in one table; the chapter adds the mechanism (verified in Chrome), context-aware encoding, SQL injection, authN vs authZ/IDOR, password hashing, cookies, CSRF, CORS, CSP, prototype pollution, secrets, dependencies and logging. v30's browser-only SecureTrip "booking portal" was replaced by a local server-side SecureTrip API so that server-side validation, authorization and cookies can be shown and tested; it is labelled throughout as an educational demo that is not deployable. |
| v30 heading | v30 title kept; project name kept, scope changed as described. |

## Specific verification notes

- Each topic is labelled as an educational demonstration, a recommended defence, or a production requirement; a table in section 20.12 lists what SecureTrip does and what a production system would still need. SecureTrip binds to 127.0.0.1 only and keeps data in memory.
- Demonstrations use harmless local inputs: a flag set by `onerror`, an in-memory SQLite database, and a prototype-pollution demo that deletes the polluted property afterwards.
- Verified by test: XSS via innerHTML (`<img onerror>` runs, `<script>` does not) and its prevention with textContent; CSP blocking inline script and inline handlers (Chrome); HttpOnly cookie invisible to document.cookie (Chrome); parameterized query vs concatenation; per-object authorization (404 for other users' trips); server-side price; CSRF token and Origin checks; body size/type limits; login rate limit; log redaction; prototype pollution and the safe merge.
- Not verified by test, and said so in the text: that browsers withhold SameSite cookies on real cross-site requests (needs two domains). An eval() probe through DevTools was dropped because DevTools evaluation is exempt from CSP.
- The chapter states that client-side validation is not security, and that SecureTrip is not production-ready (no independent review or penetration test).

## Warnings

- 34 code line(s) will wrap with a hanging indent: line 80 (71 chars, Bengali); line 88 (69 chars, Bengali); line 89 (71 chars, Bengali); line 90 (72 chars, Bengali); line 140 (70 chars, Bengali); line 183 (69 chars, Bengali); line 246 (82 chars); line 318 (72 chars, Bengali); line 358 (81 chars); line 475 (73 chars, Bengali); line 546 (72 chars, Bengali); line 547 (69 chars, Bengali); line 548 (78 chars, Bengali); line 563 (74 chars, Bengali); line 574 (69 chars, Bengali); line 621 (74 chars, Bengali); line 623 (82 chars); line 667 (76 chars, Bengali); line 671 (70 chars, Bengali); line 733 (76 chars, Bengali); line 755 (73 chars, Bengali); line 779 (75 chars, Bengali); line 782 (80 chars, Bengali); line 803 (72 chars, Bengali); line 821 (70 chars, Bengali); line 870 (71 chars, Bengali); line 883 (74 chars, Bengali); line 908 (71 chars, Bengali); line 955 (82 chars, Bengali); line 966 (72 chars, Bengali); line 967 (74 chars, Bengali); line 1000 (69 chars, Bengali); line 1031 (70 chars, Bengali); line 1257 (81 chars)

## Visual inspection

PDF pages 1, 9, 23, 38, 41 of 41 were rendered to images and looked at by eye (opening, concept (password, cookies, CSRF), project code (app.mjs part 3/4), MCQ, final). No page was flagged by the white-space check. No rendering defect was found: Bengali shaping, code panels, "Part N of M" captions, tables and callouts display correctly. The remaining pages passed the automated layout checks only. Word's PDF export of the DOCX was also inspected on page 25.

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
