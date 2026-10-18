# Batch Report — Chapters 17–21

**Batch:** `book-output/premium-batches/batch-04-ch17-21/` (Phase 4D)
**Source:** `JavaScript_Mastery_Manuscript_v30/` (titles and scope)
**Status: PASS — ready for Chief Editor review**

## Summary

| Chapter | Words | PDF Pages | Unit Tests | Browser Tests | QA |
| --- | --- | --- | --- | --- | --- |
| 17 — JavaScript Regular Expressions, Advanced Validation এবং Secure Input Processing | 3240 | 31 | 24 / 24 | 11 listings | PASS (10/10 gates, 2 warnings) |
| 18 — Functional Programming, Immutability এবং Advanced Data Transformation | 2952 | 33 | 22 / 22 | 8 listings | PASS (10/10 gates, 1 warning) |
| 19 — JavaScript Performance Optimization, Memory Management এবং Web Application Efficiency | 3621 | 29 | 20 / 20 | 9 listings | PASS (10/10 gates, 1 warning) |
| 20 — JavaScript Security Fundamentals, Web Application Security এবং Secure Coding Practices | 4298 | 41 | 24 / 24 | 7 listings; end-to-end 7 / 7 | PASS (11/11 gates, 1 warning) |
| 21 — JavaScript Design Patterns, Software Architecture এবং Scalable Application Structure | 3324 | 35 | 31 / 31 | 4 listings; end-to-end 14 / 14 | PASS (11/11 gates, 1 warning) |
| **Total** | **17435** | **169** | **121 / 121** | **39 listings; end-to-end 21 / 21** | **5 of 5 PASS** |

Words are explanatory words (code and inline code excluded). "Browser Tests" counts chapter listings run in real headless Chrome and compared with their printed panel, and the end-to-end checks of the two web-UI projects (Chapters 20 and 21) in Chrome. Chapter titles follow v30.

## Chapters completed

17, 18, 19, 20, 21. Each folder has `chapter-NN-premium.md`, `.pdf`, `.docx`, `project/`, `QA_SUMMARY.md`, `chapter.json`, `examples/` and `qa-logs/` (Chapters 20 and 21 also have `browser-e2e.mjs`).

## Verification

- **Listings verified:** 122 listing files run in Node.js (87 compared with a printed Output or Error panel) and 53 run in Chrome/155.0.8059.40 from a local HTTP server (39 compared). Mismatches in the final run: 0.
- **Automated tests:** 142 passed, 0 failed, 0 skipped: 121 project unit and integration tests and 21 end-to-end checks in real Chrome. No automated test calls a public API; Chapter 20's integration tests start the real server on 127.0.0.1 with a random port.
- **Security (Chapter 20):** every demonstration uses harmless local inputs; each topic is labelled as demonstration, recommended defence or production requirement; claims about XSS, encoding, CSP, HttpOnly, parameterized queries, authorization, CSRF and prototype pollution are backed by Node.js or Chrome tests. Not tested (and stated in the text): SameSite behaviour on genuine cross-site requests. SecureTrip is labelled as not production-ready.
- **Performance (Chapters 17 and 19):** measured results are printed with environment (Intel Core i5-6600, Windows 10, Node.js v22.16.0); two runs reported to show variance; correctness tests are separate from timing, and no timing threshold is used as a pass/fail gate anywhere in the batch.
- **Real findings fixed during production:** wrong predicted outputs replaced by real output after review (Chapter 17 matchAll index; Chapter 19 step counts and LRU evictions; Chapter 20 a LIKE search and CORS print format); a sticky-regex tokenizer resetting `lastIndex` (Chapter 17); `'toString' in values` in a test (Chapter 17); a ReDoS ratio distorted by first-call compile cost (Chapter 17, fixed with warm-up), and then a timing comparison inside that checked Output panel (replaced by printed measurements that are not compared, so no timing value gates QA); a test date that would have expired (Chapter 20); a DevTools `eval` probe that is exempt from CSP (dropped, not claimed); VisaFlow wasting IDs on failed creates and reusing IDs after reload (Chapter 21, found by the Chrome end-to-end check, fixed with regression tests); inherited names such as `toString` accepted as state-machine actions (Chapter 21, guarded with `Object.hasOwn`).
- **Further Reading:** 25 distinct addresses, all HTTP 200 on 2026-10-15.

## Visual inspection coverage

27 of 169 PDF pages were rendered to images and looked at by eye: for every chapter the opening page, a concept page, a code-heavy project page, an exercise or MCQ page and the final page, plus every flagged page.

| Chapter | Pages looked at | Flagged |
| --- | --- | --- |
| 17 | 1, 5, 9, 12, 16, 27, 31 | page 9 (white space; accepted) |
| 18 | 1, 8, 18, 30, 33 | none |
| 19 | 1, 5, 14, 26, 29 | widow final page (fixed; new final page 29 inspected) |
| 20 | 1, 9, 23, 38, 41 | none |
| 21 | 1, 8, 18, 32, 35 | none |

No rendering defect was found. All other pages passed the automated layout checks.

## DOCX validation

All five DOCX files passed the structural checks. Each was opened by Microsoft Word through automation and exported to PDF without error (Word reported 34, 36, 33, 45, 38 pages for Chapters 17–21). Word's export was inspected on Chapter 20 page 25 and Chapter 21 page 9: Bengali shaping, code, captions and callouts are correct; code lines containing Bengali get slightly taller line spacing in Word than in the PDF.

## Curriculum overlap decisions

| Chapter | Previously learned | New advanced material / decision |
| --- | --- | --- |
| 17 | Chapter 08 (regex basics, Unicode normalization, XSS) and Chapter 11 (trust boundary, ValidationError, collecting all errors). | One recap table (section 17.1); basic regex syntax is not re-taught. Depth goes to lookaround, named groups, sticky matching, Unicode and Bengali digits, normalize-validate-parse, ReDoS and a schema engine. Project FormShield is a reusable validation engine, not a repeat of Chapter 11's order validation. |
| 18 | Chapter 06–07 (array methods, spread, shallow vs deep copy), Chapter 10 (Promise.all) and Chapter 14 (pure functions, pipe/compose, currying, memoization). | Recap table; pipe/compose and currying only referenced. New material: referential transparency, structural sharing, updateIn/setIn, deep freeze, when mutation is acceptable, normalized state, flatMap, Map.groupBy and pivots, Map-index joins, stable multi-key sorting with Intl.Collator, Result type, batched async loading. Project LedgerFlow is an analytics pipeline, distinct from Chapter 14's sales-function-lab (different domain and techniques). |
| 19 | Chapter 10 and 14 (debounce, throttle, event loop), Chapter 14 (memoization), Chapter 12 (dynamic import), Chapter 17 (ReDoS timing), Chapter 18 (Map index joins). | Debounce/throttle and memoization only referenced. New material: Big-O verified by counting steps, measurement method (warm-up, repetitions, median/p95, dead-code elimination, environment), long tasks and chunking, layout thrashing, GC and leaks, WeakMap, LRU with TTL, network budget. Project PerfLab is a benchmark harness with correctness tests; no earlier project measures performance. |
| 20 | Chapter 08 (textContent vs innerHTML), Chapter 11 (form validation, trust boundary), Chapter 15 (fetch, storage), Chapter 17 (validation, ReDoS). | XSS basics and client validation recapped in one table; the chapter adds the mechanism (verified in Chrome), context-aware encoding, SQL injection, authN vs authZ/IDOR, password hashing, cookies, CSRF, CORS, CSP, prototype pollution, secrets, dependencies and logging. v30's browser-only SecureTrip "booking portal" was replaced by a local server-side SecureTrip API so that server-side validation, authorization and cookies can be shown and tested; it is labelled throughout as an educational demo that is not deployable. |
| 21 | Chapter 12 (ES modules), Chapter 13 (classes, composition vs inheritance; booking-lab), Chapter 16 (repository and service; booking-guard). | Repository/service recapped and extended (adapters, contract tests, composition root, DI of clock and ids). v30's "TravelFlow Booking Manager" would have repeated the booking domain of Chapters 13 and 16, so the project is VisaFlow, a visa-application workflow tracker, with a table-driven state machine, fee strategies with a decorator, an event bus, two repository adapters and an architecture test. |

Headings: v30 Chapter 19 ("Chapter 19 —") and Chapter 21 ("অধ্যায় ২১:") were normalized to "অধ্যায় N — "; all titles kept.

## Registry

`CHAPTER_REGISTRY.json` lists Chapters 01–21 (title, Markdown, PDF, DOCX and project paths, production status, QA status, source v30, last verified build with SHA-256 of PDF and DOCX). Validation: numbers 1–21 unique and in order; 21 of 21 entries have every path present; titles read from each Markdown file. **Registry valid.** Earlier registry files were left unchanged. `BATCH_MANIFEST.json` lists every file of this batch with size and SHA-256.

## Method notes

- **Batch tools (`tools/`)** are copies of the batch-03 tools, unchanged, plus this `make-summary.mjs`. The Chapter 20 and 21 end-to-end scripts use the same `cdp.mjs` with a default-configured Chrome.
- **Projects** need no npm packages; Chapter 20 uses Node.js's built-in `node:sqlite` (Node.js 22.5+, prints an ExperimentalWarning).

## Remaining limitations

1. **Length.** Below the 3,500-word floor (explanatory words): Chapter 17 (3240; 6052 including code), Chapter 18 (2952; 6753 including code), Chapter 21 (3324; 7053 including code). These chapters are code-heavy; content was judged complete without filler.
2. **Editorial.** No second reader has proofread the Bengali.
3. **Platforms.** Tested on Windows 10 with Node.js 22.16.0 and Chrome 155 only.
4. **Layout.** Chapter 17 page 9 has 37% white space (a kept-together listing); some code lines containing Bengali wrap with a hanging indent (none exceeds the 82-character limit).
5. **Security scope.** SecureTrip is an educational demo: no independent security review, no HTTPS, in-memory sessions; SameSite cross-site behaviour is documented, not tested.
6. **Benchmarks** are from one machine on one day; the chapter says so.

## Protected folders

`git status` against commit 9c4763f shows no change in `JavaScript_Mastery_Manuscript_v01`–`v30`, `book-output/draft-edition/`, `book-output/premium-samples/`, `book-output/premium-final/` or `book-output/premium-batches/batch-01-ch02-06/`. Batches 02 and 03 (not yet committed) were checked against their own `BATCH_MANIFEST.json`: 311 and 276 files, all with the recorded SHA-256. In `master-design-system/` only the three files approved in Phase 4C differ from the commit (plus `backups/`), and no file there is newer than the batch-03 manifest.
