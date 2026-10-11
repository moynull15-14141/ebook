# Final Design QA Report — Chapter 01

**Files:** `JavaScript_Mastery_Chapter_01_Final.pdf`, `JavaScript_Mastery_Chapter_01_Final.docx`
**Date:** 11 October 2026
**Design system:** 1.0.0 (`book-output/master-design-system/`)

**Overall status: PASS for the PDF. PASS with documented dependencies for the DOCX.**

## 1. Deliverables

| File | Size | Pages | Fonts |
| --- | --- | --- | --- |
| PDF | about 1.2 MB | 38 (A4) | Hind Siliguri ×4 weights, Source Code Pro Regular and Bold — all embedded TrueType |
| DOCX | 98 KB | 39 (A4, as rendered by Word) | Names Hind Siliguri and Cascadia Mono; not embedded |

Both are generated from `chapter-01-final.md` through the same HTML and the same design tokens.

## 2. Bengali typography audit

A previous review reported forms such as "ভু ল", "নতু ন", "পরিবর্ত ন" and "নির্দে শনা". This was investigated as a controlled test, not by editing words.

### What was checked

| Step | Finding |
| --- | --- |
| Source Markdown | "ভুল" occurs 48 times, "নতুন" 19 times. None of the split forms occurs anywhere. **The source text is correct.** |
| Rendered pages | Conjuncts and vowel signs are correctly formed on every page inspected, in both files. **There is no visible spacing error.** |
| PDF internals | Chrome positions each glyph separately and wraps every Bengali cluster in an `/ActualText` span holding the original characters. The PDF is tagged. |
| Text extraction, three emulated readers | See the table below |

### Measured result

| Kind of reader | Bengali words recovered intact | "ভুল" | "নতুন" |
| --- | --- | --- | --- |
| Honours `/ActualText` (the standard for tagged PDF) | 5,067 of 5,067 (100%) | intact | intact |
| Ignores it, measures the gap from the right-most glyph | 2,171 of 5,067 (42.9%) | mostly intact | intact |
| Ignores it, measures the gap from the previous glyph (naive) | 2,133 of 5,067 (42.1%) | "ভু ল" appears | "নতু ন" appears |

### Cause

**PDF text extraction, not typography and not the source.** Two mechanisms, both confirmed in the glyph data:

1. **Zero-width vowel signs.** ু, ঁ and ৃ are marks with an advance width of 0, placed under the preceding letter. A naive reader measures the distance from that mark to the next letter, sees a gap, and inserts a space. The audit counts where its false breaks fall: 44 after ু, 28 after ঁ, 4 after ৃ.
2. **Visual glyph order.** Signs such as ি and ে are drawn before their consonant, and conjuncts are single combined glyphs. A reader that ignores `ActualText` returns them in drawing order, which breaks the word. This is why "পরিবর্তন" and "নির্দেশনা" fail in both simple modes even without a spurious space.

### What was done

- **Nothing was changed in the manuscript**, because nothing is wrong in it.
- **The correct text is already in the PDF**, in `ActualText`. That is the standards-based remedy, and it is what makes copying work in readers that follow the standard.
- **A font change was tested and rejected.** Noto Sans Bengali scored worse than Hind Siliguri under every reader (31.5% against 42.2% naive; 99.5% against 100% with ActualText).
- **A permanent gate was added.** `check-pdf.mjs` fails a chapter unless 100% of Bengali words are intact with an ActualText-aware reader, and unless the PDF is tagged.

### Before and after

| | Phase 3A PDF | Phase 3B PDF |
| --- | --- | --- |
| Intact with ActualText | 4,998 of 4,998 | 5,067 of 5,067 |
| Intact, naive reader | 42.0% | 42.1% |

The numbers barely move, which is the point: the 3A file was already correct. What changed is that the behaviour is now understood, measured and guarded.

### Limit of this finding

The audit emulates readers. It does not prove how any particular application behaves. Copy and paste must still be tried by hand in the viewers readers will use.

## 3. Fonts

| Check | Result |
| --- | --- |
| Fonts in the PDF | HindSiliguri-Regular, -Medium, -SemiBold, -Bold; SourceCodePro-Regular, -Bold |
| All embedded as standard font programs | Yes, 6 of 6 |
| Any Type 3 font | None |
| Any fallback font | None |
| Licences | All SIL OFL 1.1, verified in the font files and against upstream; see `master-design-system/docs/FONT_AND_LICENSE_AUDIT.md` |

The Phase 3A sample used Consolas, a proprietary font. It has been replaced.

**DOCX fonts are a dependency, not embedded.** Hind Siliguri must be installed to see the DOCX as designed; Cascadia Mono is used for code if present. The installation note is in the font audit, section 6. The DOCX names a different code font from the PDF; the reason is in section 5 of the same document.

## 4. Layout refinements in this phase

| Area | Phase 3A | Phase 3B |
| --- | --- | --- |
| Exercises | Plain numbered list | Level headings with a cyan bar; one continuous numbering |
| Solutions | Bold paragraph | Boxed "সমাধান N" tab with a rule above; cannot be mistaken for an exercise |
| MCQs | Question and bullet list; could split across pages | Each question with its four options in one unsplittable block with a left rule |
| MCQ answers | Table only | One-line quick key, then the table |
| Tables | Automatic widths | Widths computed from content, identical in PDF and DOCX; navy rule under the header |
| Long CSS listing | 100 lines over three pages | Four labelled excerpts, each with its explanation |
| Warning callout | Tint only | Tint plus a double edge rule, distinct in grayscale |
| Long code lines | Wrapped to the left edge | Hanging indent |
| Code keywords | Colour and semi-bold | Colour and true bold face |
| Running header colour | 3.65:1 contrast | 4.55:1 |
| Stranded headings | Not checked | Checked on every page: none |
| White space at page foot | Not measured | Measured on every page: maximum 29% (limit 33%) |
| DOCX code panels | Adjacent panels merged | Separated |

## 5. PDF checks

### Automated, all 38 pages (`qa-logs/pdf-check.log`, 16 of 16 pass)

Valid header and end marker; 38 pages; tagged; all fonts embedded and none Type 3; only design-system families; every font has a ToUnicode map; Bengali text layer 100% intact; all 23 section headings present; 83 of 83 indented code lines preserved; no text outside the margins; no stranded heading; no page over 33% empty; 38 pages rendered; no blank page; no duplicate page.

### Visual inspection

Pages were rendered with the Windows PDF engine and looked at individually.

- **Final layout:** pages 1, 6, 14, 23, 24, 28, 33 and 36 — **8 of 38**.
- **Earlier iterations in this phase** (before the last spacing adjustments): pages 12, 24, 29, 31 and 34.

These cover: the opener; a table; source, output, error and terminal panels; a warning callout; the excerpt panels; the page where the HTML listing continues; exercises; solutions; fragments; MCQs; the answer key and table.

| Criterion | Status | Note |
| --- | --- | --- |
| Bengali glyph rendering | PASS | Correct on all inspected pages |
| No clipped code | PASS | Automated on all pages; confirmed on inspected pages |
| No broken tables | PASS | Rows whole, header repeats |
| No unintended blank pages | PASS | Automated, all pages |
| Sections present | PASS | Automated |
| Fonts verified | PASS | Section 3 |
| Copy and paste | PASS by emulation | Not tried in a real viewer |

## 6. DOCX checks

### Automated (`qa-logs/docx-check.log`, 29 of 29 pass)

Package and XML integrity; no undefined styles; only design-system fonts named; one Heading 1; 23 of 23 H2 and 42 of 42 H3 as Word headings; exercise levels styled; 52 of 52 code panels captioned; 331 of 331 code lines present character for character; 7 excerpt and fragment labels; 12 of 12 tables, each with a repeating header and unsplittable rows; 10 MCQ questions and 40 options in their styles; 12 solutions; all callouts styled; every Bengali word of the source present; running header correct; no placeholder text.

### Opened in Word and rendered (39 pages)

- **Final build:** pages 1, 31 and 37 — **3 of 39**.
- **Before the panel-gap fix:** pages 6, 24, 31 and 35.

| Criterion | Status | Note |
| --- | --- | --- |
| Opens and renders | PASS | Opened and exported by Word |
| Editable, with semantic styles | PASS | 33 named styles; headings are real Word headings |
| Bengali not corrupted | PASS | Automated word comparison and visual |
| Code readable | PASS | Monospace, shaded, captioned |
| Tables usable | PASS | Fixed widths, header repeats |
| Visual match with the PDF | PARTIAL | See section 7 |

## 7. Known imperfections

**PDF**

1. **White space at the foot of some pages.** Code panels of up to 16 lines are kept whole. The emptiest pages are 12 (29%), 21 (26%) and 31 (22%).
2. **Five code lines wrap.** They are set with a hanging indent. Four contain Bengali text; one is an 82-character HTML line.
3. **Bengali inside code** is drawn in the body font and is not monospaced.
4. **RGB only.** No CMYK conversion or printed proof.

**DOCX**

5. **Fonts are not embedded.** See section 3.
6. **Inline code looks heavier than in the PDF.** Word draws Cascadia Mono, a variable font, slightly bolder than Source Code Pro.
7. **Page numbers are Latin digits;** the PDF uses Bengali.
8. **No oversized opener numeral;** square corners on panels.
9. **Solution labels are bold text with a rule above,** not the boxed tab of the PDF.

**Both**

10. **Most pages were not looked at by eye:** 8 of 38 in the PDF and 3 of 39 in the DOCX on the final layout. Every page of the PDF passed the automated layout checks.
11. **No printed proof,** in colour or grayscale. Grayscale behaviour is designed and calculated (`tokens-check.log`), not observed on paper.
12. **No PDF/UA validation.**

## 8. Quality gates

| Gate | PDF | DOCX |
| --- | --- | --- |
| File opens | PASS | PASS |
| Structural validation | PASS | PASS |
| All sections present | PASS | PASS |
| Bengali rendering | PASS | PASS |
| Code readable, not clipped | PASS | PASS |
| Tables intact | PASS | PASS |
| No blank or duplicate pages | PASS | not checked automatically |
| Fonts | PASS, embedded and open-licensed | PARTIAL, dependencies documented |
| Text selectable, copy correct | PASS by emulation | not applicable |
| Visual inspection coverage | 8 of 38 pages | 3 of 39 pages |
