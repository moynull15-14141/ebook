# Changelog — Chapter 01

## Phase 3B — Final polish (11 October 2026)

Built with design system 1.0.0. The Phase 3A sample in `book-output/premium-samples/chapter-01/` was not modified; its three deliverables have the same checksums as before this phase.

### Content

- **Changed:** the 100-line `style.css` listing is now four labelled selected excerpts, each followed by its explanation. The text gives the full file's path, says the excerpts are not the complete file, and explains that the project works without it. The four explanations are the Phase 3A wording, unchanged.
- **Added:** a one-line quick answer key before the MCQ explanations.
- **Added:** "Fragment" labels on the three solution listings that show lines to add to an existing file (solutions 10, 11 and 12).
- **Unchanged:** every other paragraph, heading, table, callout, exercise, solution and MCQ. 255 of 257 prose blocks are identical to Phase 3A.

### Code

- **No executable code changed.** `app.js`, `index.html`, `style.css`, both test files and the project README are identical to Phase 3A.
- All tests were rerun on this copy: 8 unit tests, 12 browser tests, 18 Node.js examples, 13 page checks.

### Typography and fonts

- **Code font in the PDF:** Consolas (proprietary) → Source Code Pro (SIL OFL 1.1), Regular and Bold.
- **Code font named in the DOCX:** Consolas → Cascadia Mono (SIL OFL 1.1).
- **Code size:** 9.3 pt → 9 pt, so that 84 characters fit a line in the wider font.
- **Keywords** now use a real bold face.
- **Body font** unchanged: Hind Siliguri. Confirmed as the better choice by an extraction test against Noto Sans Bengali.
- **Bengali text-spacing reports investigated:** confirmed to be text-extraction artifacts, not visible errors and not source errors. No words were changed.

### Layout

- **Exercises:** level headings with a cyan bar.
- **Solutions:** each opens with a boxed "সমাধান N" label under a rule.
- **MCQs:** each question and its four options form one block that cannot split across pages.
- **Tables:** column widths computed from content, the same in PDF and DOCX; navy rule under the header.
- **Warning callouts:** double edge rule, so they are distinct in grayscale.
- **Long code lines:** wrap with a hanging indent.
- **Running header:** darker, to reach 4.5:1 contrast.
- **DOCX:** adjacent code and output panels no longer merge; exercise, solution and MCQ styles added.

### Quality gates added

- Bengali text layer must be 100% intact with an ActualText-aware reader.
- Code indentation must survive text extraction.
- No Type 3 fonts; only design-system font families.
- No heading stranded at the foot of a page; no text outside the margins; white space at the page foot measured.
- Excerpts and fragments must match their companion file.
- Exercise and solution numbers must match; the quick answer key must match the answer table.
- Colour contrast and grayscale checks on the design tokens.

### Fixed during this phase

- **Code indentation lost on copy.** The first open font tried, Cascadia Mono, is a variable font; Chrome wrote it as Type 3 outlines and dropped leading spaces from the text layer. Caught by the new indentation check, fixed by switching to a static font.
- **A misleading font test.** An early comparison silently used the browser's default code font. Detected by printing the font names in the test PDF; rerun correctly.

### Build

- The chapter is now built by the shared scripts in `book-output/master-design-system/`; it has no build scripts of its own.
- The DOCX build is byte-for-byte reproducible.

## Phase 3A — Premium sample (11 October 2026)

- Chapter rewritten and expanded from the v30 draft: 480 → 5,969 explanatory words; 20 numbered sections; 12 exercises with solutions; 10 MCQs.
- Interactive Greeting App written, with 8 unit tests and 12 browser tests.
- First premium PDF (38 pages) and DOCX.
- Location: `book-output/premium-samples/chapter-01/`.
