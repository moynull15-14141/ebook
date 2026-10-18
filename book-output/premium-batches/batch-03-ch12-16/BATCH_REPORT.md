# Batch Report — Chapters 12–16

**Batch:** `book-output/premium-batches/batch-03-ch12-16/` (Phase 4C)
**Source:** `JavaScript_Mastery_Manuscript_v30/` (titles and scope)
**Status: PASS — ready for Chief Editor review**

## Summary

| Chapter | Words | PDF Pages | Unit Tests | Browser Tests | QA |
| --- | --- | --- | --- | --- | --- |
| 12 — Modern JavaScript (ES6+), Modules এবং Clean Code Practices | 3320 | 36 | 24 / 24 | 8 listings; project 12 / 12 | PASS (11/11 gates, 1 warning) |
| 13 — Object-Oriented Programming (OOP): Classes, Prototypes, Inheritance এবং Encapsulation | 3230 | 40 | 20 / 20 | 20 listings | PASS (10/10 gates, 1 warning) |
| 14 — Advanced Functions, Closures, Higher-Order Patterns এবং Functional Programming | 3229 | 31 | 22 / 22 | 20 listings | PASS (10/10 gates, 1 warning) |
| 15 — JavaScript Browser APIs, Web Storage, Fetch, URL এবং Real-World Browser Applications | 3240 | 37 | 21 / 21 | 19 listings; project 14 / 14 | PASS (11/11 gates, 1 warning) |
| 16 — JavaScript Error Handling, Debugging, Testing এবং Software Reliability | 3474 | 32 | 24 / 24 | 8 listings | PASS (11/11 gates, 1 warning) |
| **Total** | **16493** | **176** | **111 / 111** | **75 listings; project 26 / 26** | **5 of 5 PASS** |

Words are explanatory words (code and inline code excluded). "Browser Tests" counts chapter listings run in real headless Chrome and compared with their printed panel, and the project's own browser suite (Chapters 12 and 15, whose projects are web pages). Chapter titles follow v30 exactly.

## Chapters completed

12, 13, 14, 15, 16. Each folder has `chapter-NN-premium.md`, `.pdf`, `.docx`, `project/`, `QA_SUMMARY.md`, `chapter.json`, `examples/` and `qa-logs/`.

## Verification

- **Listings verified:** 119 listing files run in Node.js (94 compared with a printed Output or Error panel) and 88 run in Chrome/155.0.8059.40 from a local HTTP server (75 compared). Mismatches in the final run: 0.
- **Automated tests:** 155 passed, 0 failed: 111 project unit and integration tests, 26 project browser tests in real Chrome, and 18 tests in Chapter 16's example and solution test files (plus 1 intentional `todo`). No test was skipped.
- **Browser APIs in their real environment (Chapter 15):** `QuotaExceededError`, the cross-page `storage` event (an `<iframe>` acts as the second tab), History `popstate`, Blob export (the downloaded Blob is read back) and File import (a real file chosen through the DevTools Protocol) were all exercised in Chrome. ES Modules (Chapter 12) were also confirmed **not** to load from `file://` in a default-configured Chrome, as the chapter states.
- **Asynchronous and timer code:** Chapter 14 tests debounce and throttle with Node.js fake timers; Chapter 16 tests retry and backoff with an injected `sleep` spy, payment failure with stubs, and 20 concurrent bookings. No automated test calls a public API.
- **Real findings fixed during production:** wrong predicted outputs (Chapter 15: a Blob size and a trailing space), `removeItem` also firing a `storage` event, Node.js 22 appending the comparison to a custom assert message, `node --test <folder>` not being valid in Node.js 22, a global `top` name clashing with `window.top`, and the test browser's `--allow-file-access-from-files` flag hiding the `file://` module restriction.
- **Further Reading:** 26 distinct addresses, all HTTP 200 on 2026-10-15. Chapter 14: MDN "Glossary: Pure function" returned 404; replaced by Wikipedia "Pure function" (200).

## Visual inspection coverage

25 of 176 PDF pages were rendered to images and looked at by eye: for every chapter the opening page, a concept page, a code-heavy project page, an exercise or MCQ page and the final page. No page in this batch was flagged by the white-space check.

| Chapter | Pages looked at |
| --- | --- |
| 12 | 1, 6, 18, 33, 36 |
| 13 | 1, 6, 21, 36, 40 |
| 14 | 1, 8, 17, 28, 31 |
| 15 | 1, 7, 20, 34, 37 |
| 16 | 1, 6, 17, 29, 32 |

No rendering defect was found. All other pages passed the automated layout checks.

## DOCX validation

All five DOCX files passed the structural checks. Each was opened by Microsoft Word through automation and exported to PDF without error (Word reported 39, 42, 34, 40, 35 pages for Chapters 12–16). Word's export was inspected on Chapter 12 page 18 and Chapter 16 page 6: Bengali shaping, code, captions and output panels are correct.

## Master Design System change

**Status: applied and verified.** The approved listing-label fix was made in `book-output/master-design-system/`:

| File | Change |
| --- | --- |
| `scripts/lib/md.mjs` | `part=N/M` listings captioned "অংশ N / M (Part N of M)" (normal panel); genuinely shortened listings captioned "নির্বাচিত অংশ (Selected Excerpt — Complete file in Companion Code)" |
| `scripts/check-docx.py` | accepts "Part" captions as labelled listings |
| `docs/CODE_BLOCK_STANDARDS.md` | documents `part=` and the new caption |

The three original files are backed up in `master-design-system/backups/2026-10-15-listing-labels/` with a `CHANGE.md`. Before use, the updated builder was run on temporary copies of Chapter 02 and Chapter 07: both built with the same page counts as their originals (32 and 34), showed "Part N of 3" captions, and passed 5 of 5 publication gates; the original chapter folders were not touched. Chapters 12–16 were built with the updated master directly. Chapters 02–06 were **not** rebuilt, as instructed; they will pick up the new captions on their next build.

## Registry

`CHAPTER_REGISTRY.json` lists Chapters 01–16 (title, Markdown, PDF, DOCX and project paths, production status, QA status, source v30, last verified build with SHA-256 of PDF and DOCX). Validation: numbers 1–16 unique and in order; 16 of 16 entries have every path present; titles read from each Markdown file. **Registry valid.** The batch-02 registry was left unchanged. `BATCH_MANIFEST.json` lists every file of this batch with size and SHA-256.

## Method notes

- **Batch tools (`tools/`)** are copies of the batch-02 tools with two changes: the browser listing runner serves the chapter folder over `http://127.0.0.1` (ES Modules and `fetch` need it) and supports `module=1`; `cdp.mjs` takes `{ fileAccess: false }` to launch a default-configured Chrome.
- **Modules from Chapter 12 on:** projects are ES Modules; tests import them directly.
- **Overlap with earlier chapters:** v30's Chapter 12 repeats destructuring and spread (Chapter 07), Chapter 14 repeats closures and debounce (Chapters 05 and 10), and Chapter 16 repeats `try`/`catch` and custom errors (Chapter 11). Titles and scope were kept, but each repeated topic is a short recap with a pointer; the depth goes to what is new (modules and clean code; currying, memoization and throttle; testing, test doubles and reliability).
- **v30 projects:** the v30 Chapter 13–16 projects ship browser files; Chapters 13, 14 and 16 here are Node.js projects (the subject is class design, functional pipelines and testing), while Chapters 12 and 15 are full browser applications.

## Remaining limitations

1. **Length.** Below the 3,500-word floor: Chapter 12 (3320), Chapter 13 (3230), Chapter 14 (3229), Chapter 15 (3240), Chapter 16 (3474). These chapters are code-heavy (36, 40, 31, 37, 32 pages); substantive sections were added during production rather than filler.
2. **Editorial.** No second reader has proofread the Bengali.
3. **Platforms.** Tested on Windows 10 with Node.js 22.16.0 and Chrome 155 only.
4. **Wrapped code lines.** Some code lines containing Bengali text wrap with a hanging indent; none exceeds the 82-character limit.
5. **Chapters 02–06** still show "Selected Excerpt" captions until they are rebuilt with the updated master.
6. **Forward references.** Chapter 15 mentions `HttpOnly` cookies and Chapter 16 mentions CI services; both are covered in later chapters or are outside the book's scope.

## Protected folders

`git status` against commit 9c4763f shows no change in `JavaScript_Mastery_Manuscript_v01`–`v30`, `book-output/draft-edition/`, `book-output/premium-samples/`, `book-output/premium-final/` or `book-output/premium-batches/batch-01-ch02-06/`. Batch 02 (not yet committed) was checked against its own `BATCH_MANIFEST.json`: all 311 files have the recorded SHA-256. In `master-design-system/` only the three approved files changed, plus the new `backups/` folder.
