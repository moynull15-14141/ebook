# Batch Report — Chapters 02–06

**Batch:** `book-output/premium-batches/batch-01-ch02-06/`
**Built with:** `book-output/master-design-system/` (unchanged)
**Status: PASS — ready for Chief Editor review**

## Summary

| Chapter | Words | PDF Pages | DOCX Status | Tests | QA Status |
| --- | --- | --- | --- | --- | --- |
| 02 — Variables, Data Types এবং Memory | 3662 | 32 | Valid | 14 of 14 unit; 33 listings run | PASS (1 warning) |
| 03 — Operators এবং Decision Making | 3271 | 33 | Valid | 16 of 16 unit; 31 listings run | PASS (1 warning) |
| 04 — Loops এবং Iteration | 3267 | 32 | Valid | 15 of 15 unit; 29 listings run | PASS (1 warning) |
| 05 — Functions এবং Scope | 3615 | 34 | Valid | 14 of 14 unit; 33 listings run | PASS (2 warning) |
| 06 — Arrays এবং Data Processing | 3317 | 33 | Valid | 16 of 16 unit; 32 listings run | PASS (1 warning) |
| **Total** | **17132** | **164** | 5 of 5 valid | **75 of 75 unit; 158 listings run** | 5 of 5 PASS |

Word counts exclude code blocks and inline code.

## What was verified

- **Five manuscripts, five PDFs, five DOCX files, five project folders, five QA summaries:** all present.
- **Chapter numbering:** each title, running header and section number matches its chapter (checked by the manuscript rules).
- **Every listing is real.** A batch tool writes each listing in a chapter to a file, runs it, and compares the real output with the printed panel: 158 files run, 151 compared, 0 mismatches in the final run. One wrong figure in Chapter 04 was caught this way during production and corrected.
- **Unit tests:** 75 passed, 0 failed, across the five projects.
- **Manuscript rules, PDF checks, DOCX checks, Bengali text layer:** passed for every chapter; see each `QA_SUMMARY.md`.
- **Further Reading links:** all 23 distinct addresses returned HTTP 200.
- **Protected folders unchanged:** see the last section.

## Method notes

- **One shared build.** All five chapters are built by the scripts in `master-design-system/`; that folder was not modified. The batch adds two small tools in `tools/`: one extracts and runs listings, one writes these reports from the logs.
- **Projects are Node.js programs** with `node:test` tests and no dependencies. Browser tests were not written because none of these projects has a browser part.
- **Modules are not used.** They are taught in Chapter 12, so each project is a single script and its tests load it in an isolated context.

## Remaining risks

1. **Length.** The chapters are 3267–3662 explanatory words, below the 4,000–6,000 target. They are 32–34 pages each because they are example-heavy. If more prose is wanted, the natural places are extra worked examples in the concept sections.
2. **Editorial.** No second reader has proofread the Bengali. The text was written and checked by one author.
3. **Visual.** 4 of 164 PDF pages were looked at by eye. The rest passed automated layout checks only. No DOCX was opened in Word in this batch.
4. **Layout warning.** Chapter 05 has three pages with about a third of the page empty at the foot, where a listing kept whole moved to the next page.
5. **Wrapped code lines.** 5 chapters have code lines that wrap with a hanging indent; all contain Bengali text, which is wider than Latin.
6. **Project file excerpts.** Each project file is printed in three consecutive parts labelled "Selected Excerpt". Together the parts are the whole file, but the label may suggest otherwise.
7. **Forward references.** Chapters 02–04 use small amounts of material taught fully later (objects, arrays, functions). Each use is introduced briefly and points to its chapter.
8. **Earlier chapters.** Chapter 02's three repeated `if` blocks and Chapter 04's string-built name list are deliberate, and are revisited in Chapters 03 and 06.

## Protected folders

Checksums of all 331 files in `master-design-system/`, `premium-final/`, `premium-samples/` and `draft-edition/` are identical before and after this batch.

The newest file time in `JavaScript_Mastery_Manuscript_v30/` is unchanged; v01–v29 were not opened.
