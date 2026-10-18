# Final Build Report — JavaScript Mastery (Complete Edition)

**Book:** JavaScript Mastery — শূন্য থেকে প্রফেশনাল
**Author:** Moynul Hasan
**Build date:** 2026-10-18
**Output folder:** `book-output/final-edition/`
**Status:** complete 30-chapter book assembled, rendered and verified; ready for editorial proofread (see FINAL_QA_REPORT.md)

## 1. Deliverables

| File | Size | Detail | SHA-256 (first 16) |
| --- | --- | --- | --- |
| `JavaScript_Mastery_Complete.pdf` | 31.5 MB | 1145 pages, A4; 1266 bookmarks; clickable table of contents | `9e1d26543073501a` |
| `JavaScript_Mastery_Complete.docx` | 1.3 MB | 1251 pages as laid out by Microsoft Word; 43 sections; refreshable TOC field | `72fae1812372e952` |
| `JavaScript_Mastery_Complete_Manuscript.md` | 2.5 MB | 119,057 explanatory words (232,576 including code) | `f9f131e8bc4d274e` |
| `JavaScript_Mastery_Companion_Code.zip` | 0.8 MB | 1023 files: root README + chapter-01 … chapter-30 | `0d8274bff3b642be` |
| `FINAL_CHAPTER_REGISTRY.json` | — | 30 entries, validated (copy of the batch-06 registry) | — |
| `FINAL_QA_REPORT.md` | — | QA results | — |
| `BUILD_CHECKPOINT.json` | — | stage-by-stage checkpoint | — |
| EPUB | — | **not produced** (optional; no EPUB pipeline in the design system) | — |

The PDF and the DOCX have different page counts because Chrome and Word lay text out differently; the content is the same.

## 2. Chapters and sources

All 30 chapters are taken from the premium chapter Markdown files listed in `FINAL_CHAPTER_REGISTRY.json`; each source's SHA-256 was checked against the registry before assembly. Chapter sources were only read, never written.

| # | Title | Source Markdown | Project | PDF page |
| --- | --- | --- | --- | --- |
| 1 | JavaScript-এর জগতে প্রথম পদক্ষেপ | `book-output/premium-final/chapter-01/chapter-01-final.md` | `interactive-greeting-app` | 24 |
| 2 | Variables, Data Types এবং Memory | `book-output/premium-batches/batch-01-ch02-06/chapter-02/chapter-02-premium.md` | `student-result-calculator` | 62 |
| 3 | Operators এবং Decision Making | `book-output/premium-batches/batch-01-ch02-06/chapter-03/chapter-03-premium.md` | `shopping-discount-calculator` | 95 |
| 4 | Loops এবং Iteration | `book-output/premium-batches/batch-01-ch02-06/chapter-04/chapter-04-premium.md` | `cart-analyzer` | 129 |
| 5 | Functions এবং Scope | `book-output/premium-batches/batch-01-ch02-06/chapter-05/chapter-05-premium.md` | `invoice-calculator` | 161 |
| 6 | Arrays এবং Data Processing | `book-output/premium-batches/batch-01-ch02-06/chapter-06/chapter-06-premium.md` | `inventory-dashboard` | 195 |
| 7 | Objects: Properties, Methods, Destructuring এবং Data Modeling | `book-output/premium-batches/batch-02-ch07-11/chapter-07/chapter-07-premium.md` | `student-management` | 228 |
| 8 | Strings এবং Modern Text Processing | `book-output/premium-batches/batch-02-ch07-11/chapter-08/chapter-08-premium.md` | `content-search-utility` | 263 |
| 9 | DOM Manipulation, Events এবং Interactive Web Applications | `book-output/premium-batches/batch-02-ch07-11/chapter-09/chapter-09-premium.md` | `task-manager` | 295 |
| 10 | Asynchronous JavaScript: Callbacks, Promises, async/await এবং Event Loop | `book-output/premium-batches/batch-02-ch07-11/chapter-10/chapter-10-premium.md` | `user-directory-explorer` | 336 |
| 11 | Error Handling, Debugging এবং Defensive Programming | `book-output/premium-batches/batch-02-ch07-11/chapter-11/chapter-11-premium.md` | `order-validation` | 377 |
| 12 | Modern JavaScript (ES6+), Modules এবং Clean Code Practices | `book-output/premium-batches/batch-03-ch12-16/chapter-12/chapter-12-premium.md` | `modular-shopping-cart` | 413 |
| 13 | Object-Oriented Programming (OOP): Classes, Prototypes, Inheritance এবং Encapsulation | `book-output/premium-batches/batch-03-ch12-16/chapter-13/chapter-13-premium.md` | `booking-lab` | 449 |
| 14 | Advanced Functions, Closures, Higher-Order Patterns এবং Functional Programming | `book-output/premium-batches/batch-03-ch12-16/chapter-14/chapter-14-premium.md` | `sales-function-lab` | 489 |
| 15 | JavaScript Browser APIs, Web Storage, Fetch, URL এবং Real-World Browser Applications | `book-output/premium-batches/batch-03-ch12-16/chapter-15/chapter-15-premium.md` | `bookmark-vault` | 520 |
| 16 | JavaScript Error Handling, Debugging, Testing এবং Software Reliability | `book-output/premium-batches/batch-03-ch12-16/chapter-16/chapter-16-premium.md` | `booking-guard` | 557 |
| 17 | JavaScript Regular Expressions, Advanced Validation এবং Secure Input Processing | `book-output/premium-batches/batch-04-ch17-21/chapter-17/chapter-17-premium.md` | `form-shield` | 589 |
| 18 | Functional Programming, Immutability এবং Advanced Data Transformation | `book-output/premium-batches/batch-04-ch17-21/chapter-18/chapter-18-premium.md` | `ledger-flow` | 620 |
| 19 | JavaScript Performance Optimization, Memory Management এবং Web Application Efficiency | `book-output/premium-batches/batch-04-ch17-21/chapter-19/chapter-19-premium.md` | `perf-lab` | 654 |
| 20 | JavaScript Security Fundamentals, Web Application Security এবং Secure Coding Practices | `book-output/premium-batches/batch-04-ch17-21/chapter-20/chapter-20-premium.md` | `secure-trip` | 683 |
| 21 | JavaScript Design Patterns, Software Architecture এবং Scalable Application Structure | `book-output/premium-batches/batch-04-ch17-21/chapter-21/chapter-21-premium.md` | `visa-flow` | 724 |
| 22 | JavaScript Testing Mastery: Unit Testing, Integration Testing, Mocking, TDD এবং E2E | `book-output/premium-batches/batch-05-ch22-26/chapter-22/chapter-22-premium.md` | `currency-desk` | 759 |
| 23 | JavaScript Performance Optimization, Memory Management, Profiling এবং Web Application Performance | `book-output/premium-batches/batch-05-ch22-26/chapter-23/chapter-23-premium.md` | `travel-search` | 798 |
| 24 | JavaScript থেকে TypeScript: Static Typing, Type Safety এবং Professional Development Workflow | `book-output/premium-batches/batch-05-ch22-26/chapter-24/chapter-24-premium.md` | `typesafe-claims` | 831 |
| 25 | JavaScript Backend Development with Node.js: REST APIs, Express, Databases, Authentication এবং Production Architecture | `book-output/premium-batches/batch-05-ch22-26/chapter-25/chapter-25-premium.md` | `lead-desk` | 870 |
| 26 | Advanced Database Integration, ORM, Query Optimization এবং Scalable Data Architecture | `book-output/premium-batches/batch-05-ch22-26/chapter-26/chapter-26-premium.md` | `travel-data` | 907 |
| 27 | Real-Time JavaScript Applications | `book-output/premium-batches/batch-06-ch27-30/chapter-27/chapter-27-premium.md` | `travel-live` | 944 |
| 28 | Professional JavaScript Deployment, Docker, CI/CD, Cloud Infrastructure এবং Production Monitoring | `book-output/premium-batches/batch-06-ch27-30/chapter-28/chapter-28-premium.md` | `deploy-ready` | 996 |
| 29 | Advanced JavaScript System Design, Microservices, Distributed Systems এবং Enterprise Architecture | `book-output/premium-batches/batch-06-ch27-30/chapter-29/chapter-29-premium.md` | `travel-saga` | 1039 |
| 30 | JavaScript Professional Mastery, Full-Stack Capstone এবং Career Roadmap | `book-output/premium-batches/batch-06-ch27-30/chapter-30/chapter-30-premium.md` | `travel-master-pro` | 1079 |

Chapters 01–26 come from earlier phases (final Ch01, batches 01–05). Chapters 27–30 were written and verified in this phase (`book-output/premium-batches/batch-06-ch27-30/`, see its BATCH_REPORT.md).

## 3. Book structure

| Part | Content | PDF page |
| --- | --- | --- |
| Title page | title, subtitle, author, edition line | 1 |
| Front matter | copyright and publication data, author, preface, about the book, how to use, technical requirements, companion code | 2–8 |
| Table of contents | 30 chapters and all 725 sections, with page numbers and links | 9–23 |
| Chapters 1–30 | each starts on a new page; opener page without running header | 24–1121 |
| Appendix A — glossary | 352 terms merged from all 30 chapter glossaries, with chapter numbers | 1122 |
| Appendix B — companion projects | folder, type, how to run, npm packages for all 30 projects | 1133 |
| Appendix C — verification environment | versions used, per-chapter test counts, what was not run | 1135 |
| Appendix D — references | 148 distinct further-reading addresses, by first chapter | 1136–1145 |
| Index | **not included**: no reliable automated index; the glossary (with chapter numbers) and the detailed TOC serve navigation | — |

## 4. Assembly and rendering method

1. `build/assemble.mjs` (deterministic) reads the registry, verifies each chapter's SHA-256, applies the logged fixes below to the assembled copy only, builds the front matter (`build/frontmatter.md`) and the four appendices from the chapters' own glossary and reading sections and the projects' `package.json` files, and writes the manuscript with part markers (HTML comments).
2. `build/render-pdf.mjs` renders the manuscript (never chapter PDFs) with the master design system's own Markdown renderer, tokens, fonts and stylesheet (read-only), plus `build/book-extension.css`. Each chapter uses a CSS named page, so the running header changes per chapter; page numbers run continuously (Bengali numerals). Pass 1 prints the book; the PDF outline gives the exact page of every heading; pass 2 prints the table of contents with those numbers (stable: true). Chrome 155 headless, ~70 s for 2 passes.
3. `build/make-book-docx.mjs` — a copy of the master DOCX writer extended for a bound volume (the master file is unchanged): one Word section per part with its own header, continuous PAGE field, TOC field `TOC \o "1-2" \h \z \u` with update-on-open, chapter Heading 1 = "অধ্যায় N — Title".
4. `build/word-check.ps1` opens the DOCX in Microsoft Word, refreshes the TOC, records pages and exports a temporary PDF (`build/work/word-export.pdf`).
5. `build/make-zip.mjs` builds and validates the companion archive; `build/qa-book.mjs` runs the automated QA; `build/make-reports.mjs` writes these reports.

The master design system (`book-output/master-design-system/`) was not modified in this phase; everything book-level lives in `final-edition/build/`.

## 5. Fixes applied in the assembled manuscript or the rendering layer

| Issue | Fix | Where |
| --- | --- | --- |
| Ch02–06 project parts captioned "Selected Excerpt" in their original chapter PDFs (built before the 2026-10-15 label fix) | No text change needed: their listings already carry `part=N/M`; rendering with the current renderer captions them "অংশ N / M (Part N of M)". QA: 173 part captions; "Selected Excerpt" only on the 19 genuine excerpts (Ch01 style.css selections and test excerpts) | rendering layer |
| Running header wrapped to two lines on long titles | Short running titles (cut at the last comma, colon or "এবং" within 46 characters) for 22 chapters; QA: header on one line on every page | `work/assembly-log.json` |
| Internal manuscript-version label "v30" in reader text (Ch23, 24, 26, 27, 30) | 7 exact-match wording edits (each applied exactly once), e.g. "v30-এর অধ্যায় ১৯ ও ২৩" to "এই বইয়ের অধ্যায় ১৯ ও ২৩" | `work/assembly-log.json` |
| Ch19/Ch23 performance overlap | No change: Ch23 already opens with a recap table of Ch19 and states that Ch19 material is referenced, not repeated; only its "v30" wording was fixed (row above). QA: no long paragraph repeated verbatim across chapters | — |
| White space before long kept-together listings | Not changed (template behaviour); measured: 8 pages in 1145 with more than 33% empty space, excluding part endings and chapter openers | QA report |
| Ch01 figure path relative to its chapter folder | Image copied to `final-edition/assets/chapter-01/` and the path rewritten | `work/assembly-log.json` |

Chapter 29's original chapter PDF ended on a near-empty page; that was fixed in the chapter (glossary rows merged, two links combined) before assembly and is recorded in its QA_SUMMARY.

## 6. Tests and verification — previously reported vs. run in this phase

| What | Result | When |
| --- | --- | --- |
| Chapter QA of Ch01–26 (gates, listings, project tests) | PASS, as recorded in each chapter's QA_SUMMARY and the batch reports; fingerprints of all 26 chapters unchanged since | previously reported |
| Chapter QA of Ch27–30 | 11/11, 10/10, 10/10, 11/11 gates PASS; 63 project tests; 8 + 14 headless-Chrome E2E checks; Ch28 deploy validation; Ch30 strict type check | run in this phase |
| Project tests recorded in the chapters' QA logs | 555 passing tests across 30 projects (per chapter in Appendix C) | logs (01–26 earlier, 27–30 now) |
| **Re-run from the extracted companion ZIP** | 29 projects, 544 tests PASS, 0 FAIL; Ch25 and Ch27 through the QA-only local-package hook; Ch24 not re-run (its test script compiles TypeScript and needs `npm install`) | run in this phase |
| Book QA (`build/qa-book.mjs`) | 40 PASS, 0 FAIL, 1 WARN, 1 INFO | run in this phase |
| Microsoft Word | opened the DOCX, refreshed the TOC (802 entries), 1251 pages, PDF export saved | run in this phase |
| Further-reading links of Ch27–30 | 28 of 28 HTTP 200 on 2026-10-18 (Ch01–26 links were checked in their phases) | run in this phase |

## 7. Fonts and licences

| Font | Use | Licence | Status |
| --- | --- | --- | --- |
| Hind Siliguri (Regular, Medium, SemiBold, Bold) | PDF body and headings; DOCX body font name | SIL Open Font License 1.1 | embedded as subsets in the PDF (TrueType); no Type 3 fonts |
| Source Code Pro (Regular, Bold) | PDF code | SIL Open Font License 1.1 | embedded as subsets in the PDF |
| Cascadia Mono | DOCX code font name | SIL Open Font License 1.1 (Microsoft) | not embedded: Word uses the reader's installed fonts (fallback if missing) |

## 8. Placeholders (to be completed before publication)

| Item | Placeholder in the book |
| --- | --- |
| ISBN | [প্রকাশকের কাছ থেকে প্রাপ্তব্য — এখনো নির্ধারিত হয়নি] |
| Publisher | [এখনো নির্ধারিত হয়নি] |
| First publication date | [এখনো নির্ধারিত হয়নি] |
| Companion code licence | [লেখক নির্ধারণ করবেন — এখনো নির্ধারিত হয়নি] (book and ZIP README) |

No ISBN, publisher, date, credential or GitHub address was invented. Author details are as supplied by the author (name, role, institution, city, phone). The preface and author paragraph were drafted for the author and should be approved by him.

## 9. Limitations

1. **Not executed anywhere in the book:** Docker build and Compose (no Docker daemon), GitHub Actions (nothing pushed), PostgreSQL and Prisma, Socket.IO, Redis, a real payment gateway. Each is marked in its chapter and in Appendix C.
2. **Payment, email verification and password reset** in the Chapter 30 capstone are not implemented (marked in the chapter and README).
3. **Index** not included; **EPUB** not produced.
4. **White space:** 8 pages with more than 33% empty space before kept-together listings (cosmetic).
5. **DOCX:** page numbers use Word's PAGE field (Latin digits), unlike the PDF's Bengali numerals; the Word TOC shows a prompt text until fields are updated (Word asks on opening).
6. **Platforms:** verified on Windows 10, Node.js 22.16.0, Chrome 155 and Microsoft Word only.
7. **Editorial:** no second-reader Bengali proofread yet.
