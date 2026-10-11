# Build Report — JavaScript Mastery, Draft Edition

**Book:** JavaScript Mastery — শূন্য থেকে প্রফেশনাল
**Author:** Moynul Hasan
**Edition:** First complete Draft Edition (not the final expanded premium edition)
**Built:** 11 October 2026
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/` (30 Markdown files, read-only; last modified 06:01 the same day and unchanged by this build)

## 1. Deliverables

| File | Size | Pages | Status |
|---|---|---|---|
| `JavaScript_Mastery_Draft_Edition.pdf` | 7.8 MB | 261 (A4) | Built and checked |
| `JavaScript_Mastery_Draft_Edition.docx` | 353 KB | 232 (A4, as laid out by Word) | Built and checked |
| `BUILD_REPORT.md` | — | — | This file |

The two files have different page counts because they are laid out by different engines with different spacing. The content is the same.

## 2. What the book contains

1. Title page (title, subtitle, edition line, author name and role)
2. Copyright, draft notice, disclaimer, trademark and software notes
3. ভূমিকা (preface) — 2 pages
4. লেখক পরিচিতি (author page)
5. সূচিপত্র (table of contents) with page numbers
6. Chapters 1–30, each starting on a new page

Totals across the 30 chapters: 449 code blocks, 44 tables, 102 lists. The author page adds one more table.

### Author details added

Entered exactly as supplied: Moynul Hasan; IT Officer, M&N Holidays; Computer Science and Engineering (CSE), Daffodil International University; Bogura, Bangladesh; phone 01745334044. They appear on the title page (name and role), the copyright page (name, address, phone) and the author page (all five). The university name was corrected from the typed "daffodin international univartsity". Whether the CSE entry is a completed degree or ongoing study was not stated, so no degree title or year is claimed.

## 3. Changes made to the reader-facing copy

No chapter was rewritten, shortened or expanded. Every change is recorded in `build/work/build-data.json` (`log` array) with the exact before and after text.

| Change | Count |
|---|---|
| Editorial status banners removed (the "RECONSTRUCTED DRAFT" blockquote at the top of chapters) | 34 lines |
| Trailing "Editorial note" lines removed | 4 |
| ZIP references reworded to "Companion Source Code" with the `source-code/chapter-NN/` path | 13 |
| Internal production notes removed (sentences about final typesetting or appendix plans) | 7 |
| Internal provenance note removed (chapter 14) | 1 |
| Obsolete package reference reworded (chapter 17) | 1 |
| Chapter headings standardised to "অধ্যায় N — Title" | 6 |
| Section numbers converted from Latin to Bengali numerals (chapter 30) | 15 |

Each wording edit had to match its source sentence exactly once or the build stops, so nothing was changed by accident. After clean-up, a scan of all chapters for "ZIP", "ChatGPT" and "Reconstructed" found 0 remaining occurrences.

## 4. Typography

- **Bengali:** Nirmala UI, shaped by Chrome (PDF) and Word (DOCX). Conjuncts and vowel signs were checked visually on rendered pages.
- **Latin text:** Segoe UI. **Code:** Cascadia Mono, with syntax colouring for JavaScript, TypeScript, HTML, SQL and shell.
- **PDF:** running header, Bengali page numbers, clickable table of contents and a bookmark outline (about 700 entries).
- **DOCX:** real Word styles (Heading 1–3, Code, Inline Code, Table Text and others), so the look can be changed by editing a style. The table of contents is a live Word field.

## 5. Checks performed

**PDF**
- Page count matches the sum of the separately measured parts: expected 261, actual 261. This confirms that the table-of-contents page numbers point to the right pages.
- Valid PDF header and end-of-file marker.
- Seven pages rendered to images and inspected: cover, copyright, author page, table of contents, a code-heavy page from chapter 1, chapter 15 opening, chapter 30 opening.

**DOCX**
- ZIP integrity (CRC) passed; all XML parts are well-formed; no undefined styles are used.
- 32 top-level headings: preface, author page and 30 chapter headings, numbered 1 to 30 in order.
- 0 occurrences of "EDITORIAL STATUS", "RECONSTRUCTED", "Editorial note", "ZIP" or the TOC placeholder.
- Opened in Microsoft Word without errors: 232 pages, about 53,900 words, 45 tables. Table of contents updated and saved (32 entries with page numbers).
- Rendered to PDF through Word and five pages inspected: title page, table of contents, chapter 1 (two pages), a chapter 15 page with a table, numbered list and code.

**Not checked**
- The books were not read page by page. Visual checks covered the sample pages listed above, not all 261 / 232 pages.
- The code examples were not executed or technically reviewed as part of this build.
- The PDF text was not extracted and compared against the source word by word; no PDF text-extraction tool is installed. Completeness rests on the build reading all 30 files, the page-count match and the DOCX text checks, which come from the same assembled content.

## 6. Limitations and unresolved issues

1. **Draft content.** The chapters are the reconstructed v30 drafts. The status banners were removed from the reader copy, but the text is still unreviewed draft material. The copyright page says so.
2. **Chapter length is uneven.** Chapter 1 is 5 pages; most others are 7–12. Nothing was added to even this out.
3. **Mixed address forms.** Some chapters address the reader as "তুমি", chapter 30 uses "আপনি". Left as written.
4. **Mixed heading language.** Some sections have English titles ("Exercises", "Knowledge Check"), others Bengali. Left as written.
5. **Duplicate-looking chapter topics.** Chapters 19 and 23 both cover performance, and chapters 11 and 16 both cover error handling and debugging. This is in the source and needs an editorial decision.
6. **No diagrams or images.** The source has none; one Mermaid flowchart is shown as its source text.
7. **Companion source code is referenced but not bundled.** The book points to `source-code/chapter-NN/`, which exists in the v30 manuscript folder. It is not packaged with these two files.
8. **DOCX numbered lists use Latin digits** (1., 2., 3.), while the PDF footer uses Bengali page numbers and the DOCX footer uses Latin ones.
9. **DOCX fonts depend on the reader's computer.** Nirmala UI ships with Windows 8 and later. On a machine without it, Bengali may fall back to another font. Fonts are embedded in the PDF, so it is not affected.
10. **Long code lines wrap** in both files, as noted in the preface.
11. **ISBN, publisher and price** are not on the copyright page; none were supplied.

## 7. Technical notes

- No Pandoc, LaTeX or LibreOffice is installed. The PDF is rendered by headless Google Chrome from generated HTML; the DOCX is written directly as OOXML by a Node script.
- Microsoft Word on this machine reports "Product Activation Failed". It opens and saves files, but automated PDF export from Word hung repeatedly. Word is therefore used only to update the table of contents and for a separate check render, each under a time limit.
- First DOCX attempt had a defect: Bengali text rendered as empty boxes. Cause: Word takes Bengali glyphs from the run's main font slot, and Segoe UI has none. Fixed by tagging every Bengali run with Nirmala UI, then confirmed on re-rendered pages.

## 8. How to rebuild

From `book-output/draft-edition/build/`:

```
node build.mjs                                    # PDF + Word-oriented HTML (about 2 minutes)
node make-docx.mjs                                # DOCX
powershell -File finalize-docx.ps1                # update the DOCX table of contents in Word
python -I check-docx.py ..\JavaScript_Mastery_Draft_Edition.docx
```

Front matter text and author details are in `build/frontmatter.mjs`. Page styling is in `build/book.css` (PDF) and the style block of `build/make-docx.mjs` (DOCX). Intermediate files are in `build/work/`.
