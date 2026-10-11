# Final Technical QA Report — Chapter 01

**Chapter:** অধ্যায় ১ — JavaScript-এর জগতে প্রথম পদক্ষেপ
**Phase:** 3B final polish
**Date:** 11 October 2026
**Environment:** Windows 10 Pro (10.0.19045), Node.js v22.16.0, npm 10.9.2, Google Chrome 155 (headless), Python 3.13
**Design system:** 1.0.0

**Overall status: PASS.** 13 of 13 automated gates pass. Untested areas are listed in section 7.

Every result here comes from a command that was run. Raw output is in `qa-logs/`; the machine-readable summary is `qa-logs/qa-summary.json`.

## 1. One command

```
node master-design-system/scripts/qa-chapter.mjs premium-final/chapter-01
```

| # | Gate | Result | Log |
| --- | --- | --- | --- |
| 1–4 | JavaScript syntax (`node --check`), 4 files | 4 of 4 pass | `syntax-checks.log` |
| 5 | Unit tests (`node --test`) | 8 pass, 0 fail | `unit-tests.log` |
| 6 | Browser tests, real headless Chrome | 12 passed, 0 failed | `browser-tests.log` |
| 7 | Node.js examples and solutions | 18 of 18 behave as expected | `node-examples.log` |
| 8 | Web-page examples and browser solutions | 13 of 13 pass | `page-examples.log` |
| 9 | Manuscript rules | 26 rules pass, 1 warning | `manuscript-check.log` |
| 10 | Colour tokens | 26 contrast pairs pass | `tokens-check.log` |
| 11 | PDF checks | 16 pass | `pdf-check.log` |
| 12 | DOCX checks | 29 pass | `docx-check.log` |
| 13 | Bengali typography audit | 100% intact with ActualText | `typography-audit.log` |

## 2. Companion source code integrity

The Greeting App and every example were copied from the Phase 3A sample and compared file by file.

| File | Compared with Phase 3A |
| --- | --- |
| `project/interactive-greeting-app/app.js` | identical |
| `project/interactive-greeting-app/index.html` | identical |
| `project/interactive-greeting-app/style.css` | identical |
| `project/interactive-greeting-app/tests/greeting.test.js` | identical |
| `project/interactive-greeting-app/tests/browser/run-browser-tests.mjs` | identical |
| `project/interactive-greeting-app/README.md` | identical |

**No executable code was changed in Phase 3B.** All tests were rerun on the new copy.

## 3. Listings against real files

From `manuscript-check.log`:

- **23 complete listings** are character-for-character identical to a companion file.
- **4 selected excerpts** of `style.css`: each is a continuous piece of the real file.
- **3 fragments** (solutions 10, 11 and 12): every line exists in the tested combined solution.
- **54 lines of output and error text** are all present in the recorded run logs.
- All 30 source listings state where they run.
- Longest complete listing: 35 lines (limit 45). No code line over 82 characters.

The warning: 5 lines will wrap with a hanging indent. Four contain Bengali text, which is wider than Latin; one is the 82-character `<input>` line in `index.html`. They were left as written, because changing them would mean changing tested code for layout only.

## 4. Code presentation: what changed and why

| Change | Reason | Verified by |
| --- | --- | --- |
| `style.css` (100 lines) is shown as four labelled excerpts, each followed by its explanation, with the path of the full file | Long-listing policy; three pages of CSS in a JavaScript chapter | Excerpt check against the real file |
| Solutions 10–12 are labelled "যোগ করার অংশ (Fragment)" | They are lines to add, not complete files | Fragment check |
| PDF code font: Consolas → Source Code Pro | Open licence (SIL OFL 1.1) | Font audit; all fonts embedded |
| Code size 9.3 pt → 9 pt | Source Code Pro is wider; 84 characters now fit a line | No wrapped line under 80 characters |
| Long lines wrap with a hanging indent | A continuation must look like a continuation | Visual |

### A defect found and fixed during this phase

The first choice of open code font, Cascadia Mono, is a variable font. Chrome wrote it into the PDF as Type 3 outlines, and leading spaces vanished from the text layer: copied code lost its indentation. A new automated check caught it (0 of 83 indented lines preserved). With Source Code Pro, a static font, the result is **83 of 83 indented lines preserved**, and all fonts are standard embedded TrueType. The check is now permanent in `check-pdf.mjs`.

An earlier comparison test in this phase gave a wrong result because the browser's default style for `<code>` silently replaced the test font. It was detected by printing the font names actually used, and rerun correctly.

## 5. Copy and paste

Tested with the design system's PDF text reader, which emulates three kinds of extractor (`typography-audit.log`, `pdf-check.log`):

| Sample | Result |
| --- | --- |
| All Bengali words, reader that honours ActualText | 5,067 of 5,067 intact |
| All Bengali words, naive reader | 2,133 of 5,067 intact (42%) — the expected artifact, see the design report |
| Indented source lines | 83 of 83 returned with their leading spaces |
| All 23 section headings | present in the text layer |
| `app.js` listing, in the DOCX | every line present, character for character |

This is an emulation. **No PDF viewer was driven** to test real copy and paste; see section 7.

## 6. Requirements for the Greeting App

Unchanged from Phase 3A and re-verified by the same tests: semantic HTML, associated label, keyboard operation (Enter, Tab, Space), responsive layout at 360 px, `textContent` only, no inline handlers, trimming and empty-input handling, no dependencies, separate HTML/CSS/JavaScript, logic tests separate from browser tests.

## 7. Not tested

- **Real PDF viewers.** Copy and paste was not tried in Adobe Acrobat, Chrome's viewer, Edge, Firefox or a mobile reader.
- **Other browsers** for the app: Firefox, Safari and Edge were not run.
- **Real mobile devices and screen readers.**
- **macOS and Linux.** Terminal commands were verified in Windows PowerShell only (`terminal-commands-windows.log`, from Phase 3A).
- **Software installation steps.** The tools were already installed.
- **PDF/UA or PDF/A conformance** with a validator.

## 8. Reproducing these results

```
node master-design-system/scripts/build-chapter.mjs premium-final/chapter-01
node master-design-system/scripts/qa-chapter.mjs    premium-final/chapter-01
```

The DOCX is byte-for-byte reproducible (checked: two builds gave the same SHA-256). The PDF differs between builds only in Chrome's embedded timestamp.
