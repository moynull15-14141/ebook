# Batch Report — Chapters 07–11

**Batch:** `book-output/premium-batches/batch-02-ch07-11/` (Phase 4B)
**Source:** `JavaScript_Mastery_Manuscript_v30/` (titles and scope)
**Status: PASS — ready for Chief Editor review**

## Summary

| Chapter | Words | PDF Pages | Unit Tests | Browser Tests | QA |
| --- | --- | --- | --- | --- | --- |
| 07 — Objects: Properties, Methods, Destructuring এবং Data Modeling | 3462 | 34 | 16 / 16 | 26 listings | PASS (10/10 gates, 1 warning) |
| 08 — Strings এবং Modern Text Processing | 3591 | 32 | 16 / 16 | 24 listings | PASS (10/10 gates, 1 warning) |
| 09 — DOM Manipulation, Events এবং Interactive Web Applications | 3690 | 41 | 16 / 16 | 21 listings; project 17 / 17 | PASS (11/11 gates, 1 warning) |
| 10 — Asynchronous JavaScript: Callbacks, Promises, async/await এবং Event Loop | 3469 | 41 | 18 / 18 | 28 listings; project 12 / 12 | PASS (11/11 gates, 2 warnings) |
| 11 — Error Handling, Debugging এবং Defensive Programming | 3227 | 36 | 16 / 16 | 22 listings; project 12 / 12 | PASS (11/11 gates, 2 warnings) |
| **Total** | **17439** | **184** | **82 / 82** | **121 listings; project 41 / 41** | **5 of 5 PASS** |

Words are explanatory words (code blocks and inline code excluded). "Browser Tests" counts chapter listings run in real headless Chrome and compared with their printed panel, and the project's own browser test suite (Chapters 09–11, whose projects have a web page).

## Chapters completed

07, 08, 09, 10, 11. Each folder has `chapter-NN-premium.md`, `.pdf`, `.docx`, `project/`, `QA_SUMMARY.md`, `chapter.json`, `examples/` and `qa-logs/`.

## Verification

- **Listings verified:** 122 listing files run in Node.js (117 compared with a printed Output or Error panel) and 123 run in Chrome/155.0.8059.40 (121 compared). Mismatches in the final run: 0. During production the tools caught real errors and they were corrected: wrong predicted outputs in Chapter 08 (word count, positions, a truncated excerpt), invisible Unicode in two output panels, an emoji the book fonts cannot draw, and a literal Tab that DOCX cannot hold as text.
- **Automated tests:** 123 passed, 0 failed: 82 unit and integration tests (`node --test`) and 41 project browser tests in real Chrome. No test was skipped.
- **Asynchronous code (Chapter 10):** resolved and rejected promises, `async`/`await`, loading and error states, timeouts, cancellation, retry with backoff and a race condition are tested with a mock `fetch` and a local `node:http` server with scripted replies (delays, 404, 503, broken JSON). No automated test calls a public API. The one public-API listing in the chapter is marked not run and its output is not printed.
- **Failed or skipped tests:** none in the final run.
- **Further Reading:** all 25 distinct addresses returned HTTP 200 on 2026-10-15.

## Visual inspection coverage

29 of 184 PDF pages were rendered to images and looked at by eye: for every chapter the opening page, a concept page, a code-heavy project page, an exercise or MCQ page and the final page, plus every page flagged by the automated white-space check.

| Chapter | Pages looked at |
| --- | --- |
| 07 | 1, 8, 20, 31, 34 |
| 08 | 1, 4, 18, 29, 32 |
| 09 | 1, 10, 22, 37, 41 |
| 10 | 1, 3, 24, 36, 37, 41 |
| 11 | 1, 3, 7, 8, 17, 28, 32, 36 |

No rendering defect was found. All other pages passed the automated layout checks (no text outside the margins, no stranded heading, no blank or duplicate page).

## DOCX validation

All five DOCX files passed the structural checks (headings, captions, every code line character for character, tables, MCQ styles, Bengali words). Each was also opened by Microsoft Word through automation and exported to PDF without error (Word reported 37, 35, 44, 43, 39 pages for Chapters 07–11). Word's export was inspected by eye on Chapter 09 pages 1 and 24 and Chapter 11 page 18: Bengali shaping in prose and code, captions and syntax colours are correct.

## Registry

`CHAPTER_REGISTRY.json` lists Chapters 01–11 with title, Markdown, PDF, DOCX and project paths, production status, QA status, source manuscript (v30) and last verified build. Validation: numbers 1–11 unique and in order; 11 of 11 entries have every path present on disk; titles read from each Markdown file. **Registry valid.** Chapters 01–06 were read, not modified. `BATCH_MANIFEST.json` lists every file of this batch with size and SHA-256.

## Method notes

- **Build system.** `build-system/` is a copy of the master design system with one visible change: listings split with `part=N/M` are captioned "অংশ N / M (Part N of M)", not "Selected Excerpt" (see `BUILD_SYSTEM_CHANGES.md`). The master was not modified.
- **Batch tools (`tools/`).** `extract-and-run.mjs` (from batch 01) writes and runs every listing. New in this batch: `cdp.mjs`, a small Chrome DevTools Protocol client on Node.js 22's built-in WebSocket; `run-browser-listings.mjs`, which runs listings in real headless Chrome, with `page=`, `click=`, `steps=` (click, type, key) and `wait=`; and this report generator. No npm package was installed.
- **No modules yet.** Modules are taught in Chapter 12, so each project uses plain scripts loaded in order. Unit tests load them in an isolated `vm` context.
- **Title.** Every chapter title matches v30. v30's Chapter 09–11 projects ship empty `index.html`/`style.css` files and ES-module code; the premium projects were written fresh as plain scripts with complete pages.

## Remaining limitations

1. **Length.** Chapters are 3227–3690 explanatory words. Below the 3,500-word floor of the 3,500–5,500 target: Chapter 07 (3462, 34 pages), Chapter 10 (3469, 41 pages), Chapter 11 (3227, 36 pages). These chapters are code-heavy; the explanation is complete, and more prose would mean extra worked examples rather than filler.
2. **White space.** Four pages have about a third of the page empty where a listing kept whole moved to the next page: Chapter 10 page 36; Chapter 11 pages 3, 7 and 28.
3. **Wrapped code lines.** Every chapter has some code lines that wrap with a hanging indent; nearly all contain Bengali text, which is wider than Latin. None exceeds the 82-character limit.
4. **Editorial.** No second reader has proofread the Bengali.
5. **Platforms.** Tested on Windows 10 with Node.js 22.16.0 and Chrome 155 only; not on macOS, Linux, Firefox or Safari.
6. **Forward references.** Chapter 11 uses `class ... extends Error` before classes are taught (Chapter 13); the pattern is introduced briefly with a pointer.
7. **Batch 01 captions.** Chapters 02–06 still label their project parts "Selected Excerpt"; merging this batch's `md.mjs` change into the master would fix that on their next rebuild.

## Protected folders

Checked with `git status` against commit 9c4763f: no change in `JavaScript_Mastery_Manuscript_v01`–`v30`, `book-output/draft-edition/`, `book-output/premium-samples/`, `book-output/premium-final/`, `book-output/premium-batches/batch-01-ch02-06/` or `book-output/master-design-system/` (589 tracked files, 0 modified, 0 added).
