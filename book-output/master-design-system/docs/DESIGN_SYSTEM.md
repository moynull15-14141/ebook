# Design System

The single definition of how **JavaScript Mastery — শূন্য থেকে প্রফেশনাল** looks. Values live in `config/design-tokens.json`; this document explains them and states the rules. If this document and the tokens file disagree, the tokens file is what the build uses, and this document must be corrected.

## 1. Principles

1. **Clarity before decoration.** Nothing is added to a page unless it helps the reader find, read or run something.
2. **One source.** A chapter is one Markdown file. The PDF and the DOCX are both generated from it.
3. **Tokens, not numbers.** No colour or size is typed into a template or script. Add a token, then use it.
4. **Every listing is real.** Code in the book is identical to a file that was executed.
5. **Meaning never depends on colour alone.** Every coloured element also has a text label or a shape.
6. **Rules are checked by scripts** wherever a script can check them.

## 2. Page

| Property | Value | Token |
| --- | --- | --- |
| Size | A4, 210 × 297 mm | `page.size` |
| Margins | top 25, right 21, bottom 24, left 21 mm | `page.marginMm` |
| Text block | 168 × 248 mm | derived |
| Running header | 5.5 mm above the text block | `page.headerGapMm` |
| Page number | 6 mm below the text block | `page.footerGapMm` |

Margins are equal left and right because the book is currently built for screen and single-sided print. A bound, double-sided edition needs a wider inner margin; change `page.marginMm` once, for the whole book.

## 3. Colour palette

| Role | Colour | Token |
| --- | --- | --- |
| Body text | `#1C2534` | `color.ink` |
| H1, H2, table headers | Deep navy `#12305F` | `color.navy` |
| H3, emphasis | Royal blue `#1D4F9C` | `color.blue` |
| Rules, markers, panel edges | Cyan `#0B93B3` | `color.cyan` |
| Small labels on white | Dark cyan `#08708A` | `color.cyanDark` |
| Captions, page number | `#5A6678` | `color.muted` |
| Code panel background | Soft gray `#F6F8FB` | `color.codeBg` |
| Page | White | — |

Rules:

- **Colour is for hierarchy and usability only.** No decorative colour.
- **Body-size text must reach a contrast ratio of 7:1; every other text 4.5:1.** `scripts/check-tokens.mjs` fails the build otherwise. The lowest ratio in version 1.0.0 is 4.55:1 (running header).
- **Tinted backgrounds must print lighter than 20% gray**, so black text stays clear in grayscale. Also checked by `check-tokens.mjs`.
- **Do not add a colour for a single chapter.** A new role needs a new token and a line in this table.

## 4. Typography scale

| Element | Size | Weight | Token |
| --- | --- | --- | --- |
| Chapter title (H1) | 25 pt | 700 | `type.h1Pt` |
| Section (H2) | 15.2 pt | 700 | `type.h2Pt` |
| Subsection (H3) | 12.1 pt | 600 | `type.h3Pt` |
| Panel heading | 12.6 pt | 700 | `type.panelHeadingPt` |
| Body | 10.9 pt, line height 1.74 | 400 | `type.bodyPt`, `type.bodyLine` |
| Callout | 10.3 pt | 400 | `type.calloutPt` |
| Table | 9.7 pt | 400 | `type.tablePt` |
| Code | 9 pt, line height 1.55 | 400 | `type.codePt`, `type.codeLine` |
| Figure caption | 8.8 pt | 500 | `type.figureCaptionPt` |
| Code caption, running header | 7.6 pt | 600 / 500 | `type.captionPt`, `type.runningPt` |
| Page number | 9.2 pt | 500 | `type.folioPt` |

Fonts and Bengali rules are in `TYPOGRAPHY_RULES.md`.

## 5. Heading hierarchy

- **H1** — once per chapter: `# অধ্যায় N — Title`. Rendered as a small chapter label plus the title.
- **H2** — sections. Numbered `N.1`, `N.2`, … in Bengali numerals, except the three opening sections.
- **H3** — subsections. Not numbered.
- **No H4.** If a subsection needs subdivisions, use a bold lead-in paragraph or split the section.
- A heading is never the last line on a page (checked by `check-pdf.mjs`).

## 6. Chapter opening

1. Chapter label (`অধ্যায় ১`), cyan, 11.6 pt.
2. Title, navy, 25 pt, at most 132 mm wide so it does not run into the numeral.
3. Oversized pale numeral at the top right (PDF only; decorative, not read by screen readers).
4. Navy rule.
5. Two tinted panels: learning objectives and prerequisites.
6. "Why this chapter matters".

The first page has no running header.

## 7. Running header and page number

- Left: `JavaScript Mastery — শূন্য থেকে প্রফেশনাল`. Right: `অধ্যায় N · chapter title`.
- Page number centred at the foot, in Bengali numerals in the PDF.
- Both come from `config/book.json` and the chapter title; they are never typed by hand.

## 8. Components

| Component | Standard |
| --- | --- |
| Code, output, error and terminal panels | `CODE_BLOCK_STANDARDS.md` |
| Tables, callouts, exercises, solutions, MCQs | `TABLE_AND_CALLOUT_STANDARDS.md` |
| Chapter structure and project walkthrough | `CHAPTER_LAYOUT_TEMPLATE.md` |

## 9. Page-break rules

| Rule | How it is applied | Checked by |
| --- | --- | --- |
| A heading stays with the content that follows | `break-after: avoid` | `check-pdf.mjs`: no stranded heading |
| Paragraphs keep at least 3 lines together at a page edge | `orphans: 3; widows: 3` | visual |
| A code panel of up to 16 lines is never split | `code.keepTogetherLines` | visual |
| A longer panel may split, keeping at least 2 lines on each side | `orphans: 2; widows: 2` on code | visual |
| A table row is never split; the header row repeats | `break-inside: avoid`; `thead` repeats | `check-docx.py` for Word |
| A callout, a panel and a figure are never split | `break-inside: avoid` | visual |
| An MCQ and its four options stay together | `.mcq-item` | visual |
| A list never starts a page separated from its lead-in | `break-before: avoid` | visual |
| No page except the last is more than 33% empty | `layout.maxBottomWhitespace` | `check-pdf.mjs` (warning) |
| No forced page breaks inside a chapter | none are used | review |

Keeping blocks whole costs white space. With these settings Chapter 01 has no page more than 29% empty. If a chapter exceeds the 33% limit, shorten or split the block that caused it; do not lower the type size.

## 10. Accessibility

- **Tagged PDF.** Chrome's tagged output must stay enabled. It gives screen readers the reading order and gives every Bengali cluster its correct text. `check-pdf.mjs` fails if the structure tree is missing.
- **Real headings.** PDF bookmarks and Word heading styles come from the same H1–H3.
- **Contrast.** Section 3.
- **No colour-only meaning.** Callouts carry a bold text label; panels carry a caption; the warning callout also has a double edge rule.
- **Figures have a caption that describes them.** The caption text is also the image's alternative text.
- **Language.** The PDF and DOCX are marked Bengali (`bn`).
- Not done: a full PDF/UA conformance check. See `QUALITY_CHECKLIST.md`.

## 11. Print and digital

- **Digital PDF:** RGB colour, fonts embedded, text selectable, bookmarks included.
- **Grayscale print:** supported by design (section 3). Print one test page per new component.
- **Commercial offset print:** not prepared. It needs CMYK conversion, bleed, crop marks and a printer's proof. Treat this as a separate production step.

## 12. DOCX style mapping

| Element | Word style |
| --- | --- |
| Chapter label / title | `Chapter Label` / `Heading 1` |
| Section / subsection | `Heading 2` / `Heading 3` |
| Opening panel heading / text | `Panel Heading` / `Panel Text` |
| Body paragraph | `Normal` |
| Lists | `List Bullet`, `List Number` |
| Code caption | `Code Caption` |
| Code, output, error, terminal, folder structure | `Code`, `Code Output`, `Code Error`, `Code Terminal`, `Code Structure` |
| Inline code | `Inline Code` (character style) |
| Callouts | `Callout Note`, `Callout Warning`, `Callout Tip`, `Callout Remember` |
| Exercise level heading | `Exercise Level` |
| Solution label | `Solution Label` |
| MCQ question / option | `MCQ Question` / `MCQ Option` |
| Quick answer key | `Quick Answer Key` |
| Table text | `Table Text` |
| Figure / caption | `Figure` / `Figure Caption` |

Known, accepted differences from the PDF: no oversized opener numeral; square corners; page numbers in Latin digits; pagination differs. The DOCX names a different code font from the PDF for the reason given in `FONT_AND_LICENSE_AUDIT.md`.

## 13. Changing the design

1. Change the token in `config/design-tokens.json`.
2. Rebuild a chapter and run `qa-chapter.mjs`.
3. Update the table in this document.
4. Raise `version` in the tokens file and note the change in the chapter's `CHANGELOG.md`.

Never edit a generated PDF or DOCX by hand; the next build will discard the change.
