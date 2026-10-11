# Design QA Report — Chapter 01 Premium Sample

**Files:** `JavaScript_Mastery_Chapter_01_Premium.pdf`, `JavaScript_Mastery_Chapter_01_Premium.docx`
**Date:** 11 October 2026

**Overall status: PASS for the PDF, PARTIAL for the DOCX.** The DOCX is correct and readable but simpler than the PDF, and its fonts are not embedded.

This is an interior design sample. It has no cover, by instruction.

## 1. Deliverables

| File | Size | Pages | Built by |
| --- | --- | --- | --- |
| PDF | 1.07 MB | 38 (A4) | Headless Chrome, from `build/work/chapter.html` |
| DOCX | 99 KB | 40 (A4, as rendered by Word) | `build/make-docx.mjs`, direct OOXML, from the same HTML |

Both come from the single Markdown source, `chapter-01-premium.md`. The page counts differ because Chrome and Word lay text out differently.

## 2. Design system

| Element | Choice |
| --- | --- |
| Page | A4, margins 25 / 21 / 24 / 21 mm, white |
| Body font | Hind Siliguri 10.9 pt, line height 1.74. One family for Bengali and Latin, so mixed sentences sit evenly |
| Code font | Consolas 9.3 pt, line height 1.52 |
| Headings | Deep navy `#12305F`; H2 has a short cyan underline; H3 is royal blue `#1D4F9C` |
| Accent | Cyan `#0B93B3`, used only for rules, markers and labels |
| Chapter opener | Small cyan chapter label, large navy title, pale oversized numeral, navy rule |
| Opening panels | Learning objectives and prerequisites in tinted panels with a cyan edge |
| Code panels | Caption bar with file name, language and where the code runs; light grey body |
| Output panels | Cyan left edge, "Output" label |
| Error panels | Red left edge, pale red caption, "Error Message" label |
| Terminal panels | Navy left edge, "Terminal" label |
| Callouts | Four kinds: note (cyan), warning (amber), tip (green), remember (navy) |
| Tables | Tinted header row, hairline borders, light zebra rows |
| Running header | Book title left, chapter title right; none on the opening page |
| Page number | Centred at the foot, Bengali numerals in the PDF |
| Emphasis | Semi-bold blue. Hind Siliguri has no italic, and a slanted Bengali face reads poorly |

## 3. PDF checks

### Automated (all 38 pages)

`node build/check-pdf.mjs build/work/pdf-pages`, output saved in `qa-logs/pdf-check.log`.

| Check | Result |
| --- | --- |
| Valid header and `%%EOF` (not truncated) | PASS |
| Page count: 38, matching 38 page objects | PASS |
| All 6 fonts embedded as font programs (4 Hind Siliguri weights, Consolas, Consolas Bold) | PASS |
| No unintended fallback font | PASS |
| Text is real, selectable text (6 ToUnicode maps) | PASS |
| All 38 pages rendered to images | PASS |
| No blank pages (smallest page render is 38 KB) | PASS |
| No duplicate pages | PASS |
| Bookmark outline present (67 entries) | Information |

Two defects were found by these checks during the build and fixed:

1. **A fallback font.** The arrow character in "Terminal → New Terminal" was missing from Hind Siliguri and silently rendered in Arial Bold. The text now uses ">".
2. **A font that was not embedded.** Cascadia Mono, the first choice for code, is a variable font and Chrome did not embed it as a font program. Code now uses Consolas, which embeds correctly.

### Visual inspection

Pages rendered to PNG with the Windows PDF engine and looked at one by one.

- **Final build:** pages 1, 14, 24, 25, 31 and 35.
- **Earlier builds with the same layout** (before the code-font change and small spacing fixes): pages 5, 8, 13, 20, 22, 23 and 38.

That is 13 of 38 pages. The other 25 were covered only by the automated checks above.

| Criterion | Status | Observation |
| --- | --- | --- |
| Bengali renders correctly | PASS | Conjuncts and vowel signs are correctly shaped on every inspected page (for example শূন্য, প্রফেশনাল, গুরুত্বপূর্ণ, দৃষ্টিপ্রতিবন্ধী) |
| Chapter heading and sections present | PASS | Opener on page 1; all 23 sections confirmed in the outline and by the DOCX structural check |
| Code blocks readable | PASS | 9.3 pt monospace; syntax colour for keywords, strings, numbers and comments |
| No clipped or overlapping text | PASS on inspected pages | Long lines wrap inside the panel; the longest source line is 86 characters |
| Tables not broken | PASS | Rows do not split across pages; the header row repeats |
| No blank or duplicate pages | PASS | Automated, all pages |
| Final page not truncated | PASS | Page 38 ends with the last Further Reading entry |
| No random page breaks | PARTIAL | See section 5 |

## 4. DOCX checks

### Automated

`python -I build/check-docx.py …`, output saved in `qa-logs/docx-check.log`. 18 of 18 checks pass:

- ZIP integrity; 14 package parts, all XML well-formed; every relationship target exists; no undefined styles.
- One Heading 1; 23 of 23 H2 sections; 42 of 42 H3 subsections.
- 49 of 49 code blocks have a caption; 388 of 388 code lines present; 12 of 12 tables; the figure image is embedded.
- 10 MCQs and 40 options present.
- The `app.js` listing is identical, line for line, to the real project file.
- No placeholder text.

### Opened in Microsoft Word

Word opened the file and exported it to PDF (40 pages). Word's alerts were switched off for automation, so a repair prompt would not have been shown; the structural checks above are the evidence that the package is sound. Pages 12, 26 and 40 of the final build, and pages 1, 9 and 25 of an earlier build, were inspected.

| Criterion | Status | Observation |
| --- | --- | --- |
| Opens in Word | PASS | Opened and exported by Word |
| Bengali renders correctly | PASS | Correct shaping in body, headings, tables, code and the running header |
| Editable structure | PASS | Real styles: Heading 1 to 3, Code, Code Output, Code Error, Code Terminal, four Callout styles, Table Text, Inline Code |
| Code readable | PASS | Monospace, shaded, with a caption line |
| Matches the PDF design | PARTIAL | See section 5 |

## 5. Known imperfections

**PDF**

1. **Some pages end with white space.** A code or output panel of up to 16 lines is kept whole, so it sometimes moves to the next page. On page 14 this leaves roughly the bottom eighth of the page empty.
2. **Long listings run across pages.** The CSS file (100 lines) starts on page 23, fills page 24 and ends at the foot of page 25. The panel has no closing border at the page break.
3. **Bengali inside code panels** uses the body font, because Consolas has no Bengali glyphs. It is clear but not monospaced.
4. **Colour is designed for screen and digital print.** No CMYK conversion or print-shop proof was made.

**DOCX**

5. **Fonts are not embedded.** The file names Hind Siliguri and Consolas. On a computer without Hind Siliguri, Word will substitute another Bengali font and the layout will shift. The PDF does not have this problem.
6. **No decorative opener numeral**, and callouts and panels have square corners.
7. **Page numbers are Latin digits** (the PDF uses Bengali). Numbered lists do use Bengali numerals, written as text because Word has no Bengali numbering format.
8. **A list directly after a code block sits slightly close to it** (seen on page 26).
9. **The source code panel's left edge is grey**, not coloured, so it is less distinct from the page than in the PDF.

**Both**

10. **Not every page was looked at.** See the page lists above.
11. **No test print was made.** Sizes were judged on screen renders only.

## 6. Acceptance summary

| PDF and DOCX criterion | PDF | DOCX |
| --- | --- | --- |
| File exists | PASS | PASS |
| Page count reported | PASS (38) | PASS (40 in Word) |
| Opens or passes structural validation | PASS | PASS |
| Bengali renders correctly | PASS | PASS |
| Chapter heading and all sections present | PASS | PASS |
| Code blocks readable | PASS | PASS |
| No clipped or overlapping text | PASS on inspected pages | PASS on inspected pages |
| Tables not broken | PASS | PASS on inspected pages |
| No blank or duplicate pages | PASS (all pages, automated) | Not checked automatically |
| Final page not truncated | PASS | PASS |
| Fonts verified as embedded | PASS | Not embedded (by design of the format here) |

## 7. Rebuilding

From `book-output/premium-samples/chapter-01/`:

```
node build/build.mjs            # Markdown -> HTML -> PDF
node build/make-docx.mjs        # same HTML -> DOCX
node build/check-pdf.mjs
python -I build/check-docx.py JavaScript_Mastery_Chapter_01_Premium.docx chapter-01-premium.md
node build/check-manuscript.mjs
```

The build needs Node.js 22 or later, Chrome or Edge, and the Hind Siliguri and Consolas font files installed. It stops with an error if a font file is missing, so it cannot quietly fall back to another font.

## 8. Recommendations before scaling

1. **Print one copy** of this sample on the intended paper size and check body and code sizes on paper.
2. **Decide the trim size.** A4 suits a workbook; a smaller trade size would need shorter code lines (about 70 characters).
3. **Decide whether long listings belong in the chapter** or in an appendix with only key excerpts in the text.
4. **Choose whether DOCX is a real deliverable or only an editing copy.** If it must match the PDF closely, fonts should be embedded and the Word styles refined.
5. **Confirm font licences for commercial print.** Hind Siliguri is under the SIL Open Font License. Consolas ships with Windows and Office; check its terms for a printed book, or replace it with an openly licensed monospace font.
