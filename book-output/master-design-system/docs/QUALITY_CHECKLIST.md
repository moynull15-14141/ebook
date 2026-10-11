# Quality Checklist

A chapter is signed off only when every automated gate passes and every manual item below has recorded evidence. Copy the manual section into the chapter's final QA report and fill it in.

## Part A — Automated gates

Run `node master-design-system/scripts/qa-chapter.mjs <chapter-folder>`. All must pass.

| Gate | Log | Must show |
| --- | --- | --- |
| Chapter tests | `qa-logs/*.log`, `syntax-checks.log` | Every command exits without error |
| Manuscript rules | `manuscript-check.log` | "All manuscript rules passed"; read any warning |
| Colour tokens | `tokens-check.log` | "All colour checks passed" |
| PDF | `pdf-check.log` | "All PDF checks passed"; read any warning |
| DOCX | `docx-check.log` | "All DOCX checks passed" |
| Bengali typography | `typography-audit.log` | 100% of words intact in `actual` mode |

Do not sign off on a partial run, and do not edit a log.

## Part B — Editorial review (a person must do this)

- [ ] Read the whole chapter once, start to finish, as a beginner would.
- [ ] Every term is explained before it is used.
- [ ] Each example introduces one new idea.
- [ ] No paragraph repeats an earlier one.
- [ ] Formal address throughout (the script checks pronouns and imperatives; a reader checks tone).
- [ ] Every exercise can be solved with what has been taught.
- [ ] Each solution answers its own exercise.
- [ ] Each MCQ has one clearly correct answer; each explanation is right.
- [ ] Cross-references to other chapters point to the right chapter.
- [ ] Every link in "আরও পড়ুন" was opened and shows the named page.
- [ ] A second Bengali reader has proofread the text. Record who and when.

## Part C — Technical review

- [ ] The project runs from a clean copy of the folder, following only the chapter's instructions.
- [ ] Every row of the "expected behaviour" table is covered by a test or by the manual checklist in the project README.
- [ ] Browser tests ran, and the browser and version are recorded.
- [ ] What was **not** tested is written down: other browsers, real devices, screen readers, other operating systems.
- [ ] Version numbers quoted in the chapter come from a run, or are deliberately absent.

## Part D — Visual inspection

Render the pages (`PDF_DOCX_BUILD_GUIDE.md`, section 2) and look at them. Record the page numbers inspected for each file.

Minimum pages to inspect in the PDF: the opening page; one page with a table; one with each panel type (source, output, error, terminal); one with a callout; the page where the longest listing breaks; one exercises page; one solutions page; one MCQ page; the answers page; the last page. Inspect the same kinds of page in the DOCX render.

On each page check:

- [ ] Bengali conjuncts and vowel signs are correctly formed.
- [ ] No text is clipped, overlapping or outside the margins.
- [ ] Code is readable and its indentation is right.
- [ ] No heading sits alone at the foot of a page.
- [ ] No table row or callout is split.
- [ ] Each MCQ is whole on one page.
- [ ] The running header and page number are present and correct.
- [ ] White space at the foot of the page is reasonable.

State plainly how many pages were inspected out of the total. Do not write "fully inspected" unless every page was.

## Part E — Copy and paste

- [ ] `check-pdf.mjs` reports all Bengali words intact and all indented code lines preserved.
- [ ] In each PDF viewer your readers are likely to use, copy one Bengali paragraph and one indented listing, paste them into a plain-text editor, and compare. Record the viewer, its version and the result.

The automated check emulates text extractors. It does not replace the manual test.

## Part F — Fonts and licences

- [ ] `pdf-check.log` lists only the design-system fonts, all embedded, none Type 3.
- [ ] No font file outside `fonts/` (with its licence) is distributed with the book.
- [ ] `FONT_AND_LICENSE_AUDIT.md` is current for every font in use.

## Part G — Regression (when revising an existing chapter)

- [ ] Compare the new Markdown with the previous version; list what was removed, added and changed.
- [ ] Confirm that removed material was redundant, or record where it moved.
- [ ] Companion code changes are listed, with the tests that cover them.
- [ ] The previous deliverables were not overwritten.

## Part H — Not covered by this system

Record these as open, not as passed, until someone does them:

- PDF/UA or PDF/A conformance checking with a validator.
- A screen-reader pass through the PDF.
- A printed proof on the final paper, in colour and in grayscale.
- CMYK conversion and prepress for offset printing.
- Legal review of font licences.

## Sign-off record

| Item | Value |
| --- | --- |
| Chapter | |
| Design system version | |
| Build date | |
| Automated gates passed | of |
| PDF pages inspected | of |
| DOCX pages inspected | of |
| Proofread by | |
| Open items | |
| Decision | PASS / PARTIAL / FAIL |
