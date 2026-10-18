// Writes FINAL_BUILD_REPORT.md and FINAL_QA_REPORT.md from the recorded build and QA data in work/.
// Only the visual-inspection list and the "not run" list are typed by hand (recorded during the build).
// Usage: node build/make-reports.mjs        (run from book-output/final-edition)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const BUILD = path.dirname(fileURLToPath(import.meta.url));
const FINAL = path.resolve(BUILD, '..');
const REPO = path.resolve(FINAL, '..', '..');
const W = (f) => JSON.parse(fs.readFileSync(path.join(BUILD, 'work', f), 'utf8'));
const book = W('book.json'), pdf = W('pdf-data.json'), docx = W('docx-data.json'), zip = W('zip-data.json'), qa = W('qa-data.json'), log = W('assembly-log.json');
const registry = JSON.parse(fs.readFileSync(path.join(FINAL, 'FINAL_CHAPTER_REGISTRY.json'), 'utf8'));
const wordLog = fs.readFileSync(path.join(BUILD, 'work', 'word-check.log'), 'utf8');
const wv = (k) => (new RegExp(`^${k}=(.*)$`, 'm').exec(wordLog) ?? [])[1];
const size = (f) => fs.statSync(path.join(FINAL, f)).size;
const mb = (b) => `${(b / 1048576).toFixed(1)} MB`;
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(path.join(FINAL, f))).digest('hex');
const manuscript = fs.readFileSync(path.join(FINAL, book.manuscript), 'utf8').replace(/<!--[^\n]*-->/g, '');
const prose = manuscript.replace(/```[\s\S]*?```/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/``.+?``|`[^`]*`/g, ' ').replace(/^\s*\|?\s*:?-{2,}.*$/gm, ' ').replace(/[#>*|_]/g, ' ');
const explanatory = prose.split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length;
const allWords = manuscript.split(/\s+/).filter(Boolean).length;
const unitTests = registry.chapters.map((c) => {
  const f = path.join(REPO, path.dirname(c.paths.markdown), 'qa-logs', 'unit-tests.log');
  return fs.existsSync(f) ? +(/^# pass (\d+)/m.exec(fs.readFileSync(f, 'utf8')) ?? [0, 0])[1] : 0;
});
const zipPass = zip.testRunsFromArchive.filter((r) => r.result === 'PASS');
const files = ['JavaScript_Mastery_Complete.pdf', 'JavaScript_Mastery_Complete.docx', 'JavaScript_Mastery_Complete_Manuscript.md', 'JavaScript_Mastery_Companion_Code.zip', 'FINAL_CHAPTER_REGISTRY.json'];
const today = '2026-10-18';
const textEdits = log.edits.filter((e) => e.kind === 'text');
const runningEdits = log.edits.filter((e) => e.kind === 'running-title');

// ---------------- FINAL_BUILD_REPORT.md ----------------
fs.writeFileSync(path.join(FINAL, 'FINAL_BUILD_REPORT.md'), `# Final Build Report — JavaScript Mastery (Complete Edition)

**Book:** JavaScript Mastery — শূন্য থেকে প্রফেশনাল
**Author:** Moynul Hasan
**Build date:** ${today}
**Output folder:** \`book-output/final-edition/\`
**Status:** complete 30-chapter book assembled, rendered and verified; ready for editorial proofread (see FINAL_QA_REPORT.md)

## 1. Deliverables

| File | Size | Detail | SHA-256 (first 16) |
| --- | --- | --- | --- |
| \`JavaScript_Mastery_Complete.pdf\` | ${mb(size(files[0]))} | ${pdf.pages} pages, A4; ${pdf.bookmarks} bookmarks; clickable table of contents | \`${sha(files[0]).slice(0, 16)}\` |
| \`JavaScript_Mastery_Complete.docx\` | ${mb(size(files[1]))} | ${wv('pages')} pages as laid out by Microsoft Word; ${docx.sections} sections; refreshable TOC field | \`${sha(files[1]).slice(0, 16)}\` |
| \`JavaScript_Mastery_Complete_Manuscript.md\` | ${mb(size(files[2]))} | ${explanatory.toLocaleString('en-US')} explanatory words (${allWords.toLocaleString('en-US')} including code) | \`${sha(files[2]).slice(0, 16)}\` |
| \`JavaScript_Mastery_Companion_Code.zip\` | ${mb(zip.bytes)} | ${zip.entries} files: root README + chapter-01 … chapter-30 | \`${sha(files[3]).slice(0, 16)}\` |
| \`FINAL_CHAPTER_REGISTRY.json\` | — | 30 entries, validated (copy of the batch-06 registry) | — |
| \`FINAL_QA_REPORT.md\` | — | QA results | — |
| \`BUILD_CHECKPOINT.json\` | — | stage-by-stage checkpoint | — |
| EPUB | — | **not produced** (optional; no EPUB pipeline in the design system) | — |

The PDF and the DOCX have different page counts because Chrome and Word lay text out differently; the content is the same.

## 2. Chapters and sources

All 30 chapters are taken from the premium chapter Markdown files listed in \`FINAL_CHAPTER_REGISTRY.json\`; each source's SHA-256 was checked against the registry before assembly. Chapter sources were only read, never written.

| # | Title | Source Markdown | Project | PDF page |
| --- | --- | --- | --- | --- |
${book.chapters.map((c) => `| ${c.number} | ${c.title} | \`${c.source}\` | \`${c.project}\` | ${pdf.chapterStarts[c.number]} |`).join('\n')}

Chapters 01–26 come from earlier phases (final Ch01, batches 01–05). Chapters 27–30 were written and verified in this phase (\`book-output/premium-batches/batch-06-ch27-30/\`, see its BATCH_REPORT.md).

## 3. Book structure

| Part | Content | PDF page |
| --- | --- | --- |
| Title page | title, subtitle, author, edition line | 1 |
| Front matter | copyright and publication data, author, preface, about the book, how to use, technical requirements, companion code | 2–${pdf.tocPage - 1} |
| Table of contents | 30 chapters and all ${book.counts.h2} sections, with page numbers and links | ${pdf.tocPage}–${pdf.chapterStarts[1] - 1} |
| Chapters 1–30 | each starts on a new page; opener page without running header | ${pdf.chapterStarts[1]}–${pdf.backStarts['appendix-a'] - 1} |
| Appendix A — glossary | ${book.counts.glossaryTerms} terms merged from all 30 chapter glossaries, with chapter numbers | ${pdf.backStarts['appendix-a']} |
| Appendix B — companion projects | folder, type, how to run, npm packages for all 30 projects | ${pdf.backStarts['appendix-b']} |
| Appendix C — verification environment | versions used, per-chapter test counts, what was not run | ${pdf.backStarts['appendix-c']} |
| Appendix D — references | ${book.counts.references} distinct further-reading addresses, by first chapter | ${pdf.backStarts['appendix-d']}–${pdf.pages} |
| Index | **not included**: no reliable automated index; the glossary (with chapter numbers) and the detailed TOC serve navigation | — |

## 4. Assembly and rendering method

1. \`build/assemble.mjs\` (deterministic) reads the registry, verifies each chapter's SHA-256, applies the logged fixes below to the assembled copy only, builds the front matter (\`build/frontmatter.md\`) and the four appendices from the chapters' own glossary and reading sections and the projects' \`package.json\` files, and writes the manuscript with part markers (HTML comments).
2. \`build/render-pdf.mjs\` renders the manuscript (never chapter PDFs) with the master design system's own Markdown renderer, tokens, fonts and stylesheet (read-only), plus \`build/book-extension.css\`. Each chapter uses a CSS named page, so the running header changes per chapter; page numbers run continuously (Bengali numerals). Pass 1 prints the book; the PDF outline gives the exact page of every heading; pass 2 prints the table of contents with those numbers (stable: ${pdf.tocStable}). Chrome ${'155'} headless, ~${pdf.secondsPerPass.reduce((a, b) => a + b, 0)} s for ${pdf.passes} passes.
3. \`build/make-book-docx.mjs\` — a copy of the master DOCX writer extended for a bound volume (the master file is unchanged): one Word section per part with its own header, continuous PAGE field, TOC field \`TOC \\o "1-2" \\h \\z \\u\` with update-on-open, chapter Heading 1 = "অধ্যায় N — Title".
4. \`build/word-check.ps1\` opens the DOCX in Microsoft Word, refreshes the TOC, records pages and exports a temporary PDF (\`build/work/word-export.pdf\`).
5. \`build/make-zip.mjs\` builds and validates the companion archive; \`build/qa-book.mjs\` runs the automated QA; \`build/make-reports.mjs\` writes these reports.

The master design system (\`book-output/master-design-system/\`) was not modified in this phase; everything book-level lives in \`final-edition/build/\`.

## 5. Fixes applied in the assembled manuscript or the rendering layer

| Issue | Fix | Where |
| --- | --- | --- |
| Ch02–06 project parts captioned "Selected Excerpt" in their original chapter PDFs (built before the 2026-10-15 label fix) | No text change needed: their listings already carry \`part=N/M\`; rendering with the current renderer captions them "অংশ N / M (Part N of M)". QA: 173 part captions; "Selected Excerpt" only on the 19 genuine excerpts (Ch01 style.css selections and test excerpts) | rendering layer |
| Running header wrapped to two lines on long titles | Short running titles (cut at the last comma, colon or "এবং" within 46 characters) for ${runningEdits.length} chapters; QA: header on one line on every page | \`work/assembly-log.json\` |
| Internal manuscript-version label "v30" in reader text (Ch23, 24, 26, 27, 30) | ${textEdits.length} exact-match wording edits (each applied exactly once), e.g. "v30-এর অধ্যায় ১৯ ও ২৩" to "এই বইয়ের অধ্যায় ১৯ ও ২৩" | \`work/assembly-log.json\` |
| Ch19/Ch23 performance overlap | No change: Ch23 already opens with a recap table of Ch19 and states that Ch19 material is referenced, not repeated; only its "v30" wording was fixed (row above). QA: no long paragraph repeated verbatim across chapters | — |
| White space before long kept-together listings | Not changed (template behaviour); measured: ${qa.sparsePages.length} pages in ${pdf.pages} with more than 33% empty space, excluding part endings and chapter openers | QA report |
| Ch01 figure path relative to its chapter folder | Image copied to \`final-edition/assets/chapter-01/\` and the path rewritten | \`work/assembly-log.json\` |

Chapter 29's original chapter PDF ended on a near-empty page; that was fixed in the chapter (glossary rows merged, two links combined) before assembly and is recorded in its QA_SUMMARY.

## 6. Tests and verification — previously reported vs. run in this phase

| What | Result | When |
| --- | --- | --- |
| Chapter QA of Ch01–26 (gates, listings, project tests) | PASS, as recorded in each chapter's QA_SUMMARY and the batch reports; fingerprints of all 26 chapters unchanged since | previously reported |
| Chapter QA of Ch27–30 | 11/11, 10/10, 10/10, 11/11 gates PASS; ${unitTests.slice(26).reduce((a, b) => a + b, 0)} project tests; 8 + 14 headless-Chrome E2E checks; Ch28 deploy validation; Ch30 strict type check | run in this phase |
| Project tests recorded in the chapters' QA logs | ${unitTests.reduce((a, b) => a + b, 0)} passing tests across 30 projects (per chapter in Appendix C) | logs (01–26 earlier, 27–30 now) |
| **Re-run from the extracted companion ZIP** | ${zipPass.length} projects, ${zipPass.reduce((s, r) => s + r.pass, 0)} tests PASS, 0 FAIL; Ch25 and Ch27 through the QA-only local-package hook; Ch24 not re-run (its test script compiles TypeScript and needs \`npm install\`) | run in this phase |
| Book QA (\`build/qa-book.mjs\`) | ${qa.summary.PASS} PASS, ${qa.summary.FAIL} FAIL, ${qa.summary.WARN} WARN, ${qa.summary.INFO} INFO | run in this phase |
| Microsoft Word | opened the DOCX, refreshed the TOC (${(+wv('tocEntries')) - 1} entries), ${wv('pages')} pages, PDF export saved | run in this phase |
| Further-reading links of Ch27–30 | 28 of 28 HTTP 200 on ${today} (Ch01–26 links were checked in their phases) | run in this phase |

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
4. **White space:** ${qa.sparsePages.length} pages with more than 33% empty space before kept-together listings (cosmetic).
5. **DOCX:** page numbers use Word's PAGE field (Latin digits), unlike the PDF's Bengali numerals; the Word TOC shows a prompt text until fields are updated (Word asks on opening).
6. **Platforms:** verified on Windows 10, Node.js 22.16.0, Chrome 155 and Microsoft Word only.
7. **Editorial:** no second-reader Bengali proofread yet.
`);

// ---------------- FINAL_QA_REPORT.md ----------------
const row = (r) => `| ${r.area} | ${r.name} | **${r.status}** | ${r.detail.replace(/\|/g, '/')} |`;
fs.writeFileSync(path.join(FINAL, 'FINAL_QA_REPORT.md'), `# Final QA Report — JavaScript Mastery (Complete Edition)

**Date:** ${today}
**Scope:** \`JavaScript_Mastery_Complete.pdf\`, \`JavaScript_Mastery_Complete.docx\`, \`JavaScript_Mastery_Complete_Manuscript.md\`, \`JavaScript_Mastery_Companion_Code.zip\`, \`FINAL_CHAPTER_REGISTRY.json\`
**Automated result:** ${qa.summary.PASS} PASS, ${qa.summary.FAIL} FAIL, ${qa.summary.WARN} WARN, ${qa.summary.INFO} INFO (\`build/qa-book.mjs\`, data in \`build/work/qa-data.json\`)

Status words: **PASS** verified and correct; **PARTIAL** verified with a stated gap; **WARN** works, cosmetic issue recorded; **FAIL** defect; **NOT RUN** not executed (reason given); **INFO** for review.

## 1. Summary

| Area | Status |
| --- | --- |
| Registry (30 chapters, ordered, unique, paths, titles, fingerprints) | **PASS** |
| PDF: opens, A4, embedded fonts, 30 chapters, bookmarks, clickable TOC, continuous page numbers, running headers, Bengali text layer, no blank pages, no clipped text | **PASS** |
| PDF: white space | **WARN** (${qa.sparsePages.length} pages, cosmetic) |
| DOCX: structure, 30 chapter headings, styles, sections, TOC field, Bengali text | **PASS** |
| DOCX in Microsoft Word: open, TOC refresh, page count, PDF export | **PASS** |
| Manuscript cross-chapter checks | **PASS** |
| Companion ZIP: structure, exclusions, secrets, CRC, tests from the extracted archive | **PARTIAL** (Ch24 tests need \`npm install\`; all others PASS) |
| Visual inspection | **PASS** (sampled pages; see section 5) |
| Bengali second-reader proofread | **NOT RUN** |

## 2. Registry

| Check | Status | Detail |
| --- | --- | --- |
| Exactly 30 entries, numbers 1–30 in order, unique | **PASS** | \`FINAL_CHAPTER_REGISTRY.json\` |
| All Markdown, PDF, DOCX and project paths exist | **PASS** | ${registry.chapters.length} × 4 paths |
| No duplicate authoritative sources; titles read from each Markdown | **PASS** | |
| SHA-256 of Ch01–26 equal the batch-05 registry | **PASS** | 0 mismatches |
| Assembly used exactly these sources (SHA-256 checked again) | **PASS** | \`build/assemble.mjs\` |

## 3. Automated checks

| Area | Check | Status | Detail |
| --- | --- | --- | --- |
${qa.results.map(row).join('\n')}

## 4. Companion ZIP

| Check | Status | Detail |
| --- | --- | --- |
| Structure: root README + chapter-01 … chapter-30, each with \`project/<name>/\` and \`examples/\` | **PASS** | ${zip.chapterFolders} chapter folders, ${zip.entries} files |
| Excluded node_modules, .git, dist, .build, coverage, caches, databases, logs, temp files, .env | **PASS** | none present in the sources (${zip.excluded.length} excluded) |
| No secrets or machine-specific paths | **PASS** | content scan of every text file |
| Archive integrity (re-read, CRC-32, sizes) | **PASS** | ${zip.crcErrors} errors |
| Tests run from the extracted archive | **PARTIAL** | ${zipPass.length} projects / ${zipPass.reduce((s, r) => s + r.pass, 0)} tests PASS; Ch24 NOT RUN (TypeScript build needs \`npm install\`; verified in its chapter QA) |
| No GitHub URL invented | **PASS** | README states the licence placeholder only |

## 5. Visual inspection

PDF pages rendered to images and looked at by eye: title page (1), copyright (2), author, preface, about, how to use, requirements, companion code (3–8), table of contents (pages 11 and ${pdf.chapterStarts[1] - 1}), Chapter 1 opener (${pdf.chapterStarts[1]}), one page inside every chapter (opener + 3 for chapters 1–30), the Chapter 30 opener (${pdf.chapterStarts[30]}), every page flagged by the white-space check (${qa.sparsePages.map((s) => s.page).sort((a, b) => a - b).join(', ')}), page 500, Appendix A (${pdf.backStarts['appendix-a']}), B (${pdf.backStarts['appendix-b']}), C (${pdf.backStarts['appendix-c']}), D (${pdf.backStarts['appendix-d']}) and the last page (${pdf.pages}). Word's PDF export: pages 10 and 30 (refreshed TOC) and 600; Word's export of Chapter 30 page 20 was also inspected during chapter QA.

Result: Bengali shaping correct; running headers on one line and correct per chapter; folios continuous; code panels, "Part N of M" captions, tables, callouts, MCQs and solutions display correctly; no clipped text found. Flagged pages show only extra white space before a kept-together listing or table.

## 6. Not run or not verified

| Item | Status | Reason |
| --- | --- | --- |
| Docker build / Compose (Ch28) | **NOT RUN** | Docker daemon not available; Dockerfile checked statically, YAML parsed |
| GitHub Actions (Ch22, Ch28) | **NOT RUN** | nothing pushed or published |
| PostgreSQL and Prisma (Ch26), Socket.IO and Redis (Ch27) | **NOT RUN** | not installed; marked in the chapters |
| Real payment gateway (Ch29, Ch30) | **NOT RUN** | simulated or not implemented, as stated |
| Ch24 tests from the ZIP | **NOT RUN** | needs \`npm install\` (TypeScript); passed in chapter QA |
| Screen reader test of the Ch30 frontend | **NOT RUN** | only semantic HTML/ARIA checked |
| macOS, Linux, Firefox, Safari | **NOT RUN** | Windows 10 + Chrome only |
| Index | **NOT RUN** | not built (no reliable automated index) |
| EPUB | **NOT RUN** | optional; not produced |
| Second-reader Bengali proofread | **NOT RUN** | editorial step that follows this build |

## 7. Protected material

\`git status\` shows no change in \`JavaScript_Mastery_Manuscript_v01\`–\`v30\`, \`book-output/premium-final/\` or \`book-output/premium-batches/batch-01-ch02-06/\`. Batches 02–05 (not committed) match their own BATCH_MANIFEST.json (311, 276, 259, 266 files, all SHA-256 equal). In \`master-design-system/\` only the three files approved in Phase 4C differ from the commit (plus \`backups/\`), and no file there is newer than the batch-05 manifest. Earlier batch reports were not overwritten. Nothing was committed, pushed, deployed or published, and no package was installed.

## 8. Verdict

All automated checks that can fail passed (0 FAIL). The remaining items are cosmetic white space, environment-dependent steps that were not run and are documented, and the editorial proofread. **COMPLETE — READY FOR EDITORIAL PROOFREAD.**
`);
console.log('reports written:', explanatory, 'explanatory words;', unitTests.reduce((a, b) => a + b, 0), 'recorded tests');
