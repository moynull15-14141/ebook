# Final Editorial Report — Chapter 01

**Chapter:** অধ্যায় ১ — JavaScript-এর জগতে প্রথম পদক্ষেপ
**Source of truth:** `chapter-01-final.md`
**Compared with:** `book-output/premium-samples/chapter-01/chapter-01-premium.md` (Phase 3A, not modified)
**Date:** 11 October 2026

**Overall status: PASS,** pending the Chief Editor's read-through. The Bengali has still not been proofread by a second person.

This phase polished the approved chapter. It was not rewritten.

## 1. Size

| Measure | Phase 3A | Phase 3B |
| --- | --- | --- |
| Explanatory words (code excluded) | 5,969 | 6,068 |
| Headings (H1–H3) | 66 | 66, identical |
| Sections (H2) | 23 | 23, identical |
| Code panels | 49 | 52 |
| Lines of code printed | 388 | 331 |
| Tables / callouts / figures | 12 / 10 / 1 | 12 / 10 / 1 |
| Exercises and solutions | 12 and 12 | 12 and 12 |
| MCQs | 10 × 4 options | 10 × 4 options |
| PDF pages | 38 | 38 |

The word count rose by 99: the text that introduces the CSS excerpts, four short lead-in labels and the quick answer key. No page target was applied. The page count is unchanged because space saved on the CSS listing went to clearer exercise, solution and MCQ layout.

## 2. Regression: what changed in the text

Measured by comparing the two Markdown files block by block.

| | Count |
| --- | --- |
| Prose blocks in Phase 3A | 257 |
| Unchanged in Phase 3B | 255 |
| Removed | 2 |
| Added | 13 |

**Removed (2):**

1. The sentence telling readers to type the whole CSS file. It was replaced; the instruction no longer applies.
2. The four-item bullet list explaining the CSS. Its four explanations were **kept word for word** and moved, one under each excerpt.

**Added (13):**

- 4 paragraphs introducing the CSS excerpts: the full file's length and path, how to get it, what happens without it, and a plain statement that the excerpts are not the complete file.
- 4 bold lead-in labels, one per excerpt.
- 4 explanation paragraphs (the moved text above).
- 1 quick answer key line before the MCQ explanations.

**Nothing else in the prose changed.** No explanation was deleted. No section was added, removed, renamed or reordered.

**Code panels:** 48 of the 49 Phase 3A panels are unchanged. The one changed panel is the 100-line CSS listing, now four excerpt panels. Three solution panels gained a "Fragment" label; their code is unchanged.

## 3. Editorial decisions applied

| Decision | Status | Evidence |
| --- | --- | --- |
| Formal address (আপনি, করুন, দেখুন, লিখুন) | Applied throughout | Automated: no informal pronoun; no informal imperative addressed to the reader |
| Neutral examples in a foundation chapter | Applied | Learner-focused examples; no forced theme |
| Educational value over page count | Applied | No explanation removed; no page target |
| Complete source in companion files | Applied | Full `style.css` in `project/`; path stated in the text |
| Open-licensed code font | Applied | See the design report |

Three sentences contain the informal verb "চালাও". Each is a quoted instruction addressed to the computer, for example "Node.js, `hello.js` File-এর Code চালাও।". They are deliberate and were left unchanged. The check reports them separately.

## 4. Mandatory editorial QA

| Check | Status | Evidence |
| --- | --- | --- |
| Content remains complete | PASS | 255 of 257 blocks unchanged; the other 2 accounted for above |
| Formal address consistent | PASS | Automated |
| No accidental deletion | PASS | Block comparison |
| No duplicate sections | PASS | Automated |
| Exercises and solutions match | PASS | Exercises numbered 1–12; solutions numbered 1–12 |
| Exactly 10 MCQs, four options each, with explanations | PASS | Automated; options ক খ গ ঘ in order on every question |
| Quick key matches the answer table | PASS | Automated: গকঘখগখগকঘক |
| Excerpts distinguished from complete files | PASS | 4 panels labelled "নির্বাচিত অংশ (Selected Excerpt)", 3 labelled "যোগ করার অংশ (Fragment)"; the text states the CSS is not complete |
| Required sections present | PASS | 14 of 14 |
| Numbered sections continuous | PASS | ১.১ to ১.২০ |

## 5. A point to review: the CSS excerpt and the print reader

The chapter now tells the reader to copy `style.css` from the companion source code. A reader with only the printed book and no access to the companion files cannot reproduce the styled page exactly. The text says so, and says the project works without the file.

This follows the approved long-listing policy, but it depends on a decision that has not been made: **how readers obtain the companion source code.** No download address is given anywhere in the book, and none was invented here. Until that is decided, the instruction is correct but incomplete for a print-only reader.

Options: publish the companion code at a stable address and print it on the copyright page; or add a short appendix with long files in full.

## 6. Remaining limitations

1. **No second-reader proofread.**
2. **Cross-references** to chapters 2, 3, 5, 16, 20 and 22 match the current contents list. Those chapters are not yet revised.
3. **Two statements are from general knowledge, not checked against a source in this task:** JavaScript's creation in 1995, and that the name's similarity to Java is historical.
4. **The claim that Firefox words error messages differently** was not verified by running Firefox.
5. **Reader address across the book.** This chapter uses আপনি. The other 29 chapters still mostly use তুমি and will be inconsistent until revised.

## 7. Recommendation

**Chapter 01 is recommended as the master reference for Chapters 02 to 30,** for structure, tone, code handling and layout, with two conditions:

1. A Bengali proofreader reads it first, so that any wording habits are corrected before they are copied 29 times.
2. The companion-code distribution question in section 5 is decided.

The length is a reference, not a target. Later chapters should follow the structure and the rules, not the page count.
