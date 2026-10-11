# PDF and DOCX Build Guide

## 1. What you need

| Tool | Used for | Notes |
| --- | --- | --- |
| Node.js 22 or later | All build and check scripts | No npm packages are used |
| Google Chrome or Microsoft Edge | Printing the PDF; the chapter's browser tests | Found automatically; set `CHROME_PATH` otherwise |
| Python 3 | `check-docx.py` | Standard library only |
| Hind Siliguri (4 weights) | Body font | Must be installed, or its files placed in `fonts/` |
| Source Code Pro (Regular, Bold) | Code font in the PDF | Kept in `fonts/source-code-pro/` with its licence |
| Cascadia Mono | Code font named in the DOCX | Needed only to view the DOCX as designed |
| Microsoft Word (optional) | Rendering the DOCX to check it by eye | Not needed to build |

Nothing is downloaded during a build. The build stops with a clear message if a font file is missing.

## 2. Commands

Run every command from `book-output/`.

### Build one chapter

```
node master-design-system/scripts/build-chapter.mjs premium-final/chapter-01
```

Writes `<outputBase>.pdf` and `<outputBase>.docx` into the chapter folder, and intermediate files into its `.build/` folder. Add `--pdf-only` to skip the DOCX.

### Check one chapter

```
node master-design-system/scripts/qa-chapter.mjs premium-final/chapter-01
```

Runs, in order: the chapter's own tests from `chapter.json`; manuscript rules; colour tokens; PDF checks; DOCX checks; the Bengali typography audit. Logs go to the chapter's `qa-logs/`, with a machine-readable `qa-summary.json`. The exit code is 0 only if every gate passes.

Options: `--skip-tests` skips the chapter's own tests; `--pages <folder>` adds blank-page and duplicate-page checks using rendered page images.

### Individual checks

```
node   master-design-system/scripts/check-manuscript.mjs  <chapter-folder>
node   master-design-system/scripts/check-pdf.mjs         <chapter-folder> [rendered-pages-folder]
python -I master-design-system/scripts/check-docx.py      <chapter-folder>
node   master-design-system/scripts/check-tokens.mjs
node   master-design-system/scripts/check-typography.mjs  <file.pdf> <source.md>
node   master-design-system/scripts/pdf-to-text.mjs       <file.pdf> [--mode actual|robust|naive] [--page N]
```

### Render pages for visual inspection (Windows)

```
powershell -File master-design-system\scripts\render-pages.ps1 -Pdf <file.pdf> -OutDir <folder> -Pages (1..60) -Width 820
powershell -File master-design-system\scripts\render-docx.ps1  -Docx <copy.docx> -Pdf <out.pdf> -Log <log.txt>
```

`render-pages.ps1` uses the PDF engine built into Windows. `render-docx.ps1` asks Word to save a DOCX as PDF, which can then be rendered the same way.

**Word automation is unreliable on this machine.** Run `render-docx.ps1` on a copy of the DOCX, in a separate process with a time limit, and end the Word process if the limit is reached. Never automate Word against the deliverable itself.

### Build every chapter

```
node master-design-system/scripts/build-book.mjs            # build all chapters in config/book.json
node master-design-system/scripts/build-book.mjs --qa       # build and check
node master-design-system/scripts/build-book.mjs --only 1,2 # selected chapters
```

## 3. How a build works

```
chapter-NN-final.md
      │  scripts/lib/md.mjs            Markdown → HTML, one <section> per H2
      ▼
.build/chapter.html  ◄── templates/book.css + config/design-tokens.json
      │
      ├── headless Chrome ───────────► <outputBase>.pdf   (tagged, fonts embedded)
      └── scripts/make-docx.mjs ─────► <outputBase>.docx  (OOXML written directly, same tokens)
```

Both files come from the same HTML, so their content cannot drift apart. Their page breaks differ, because Chrome and Word lay text out differently.

The DOCX is byte-for-byte reproducible from the same source. The PDF is not: Chrome writes the creation time into it.

## 4. Adding a chapter

1. Create the folder, for example `premium-final/chapter-02/`.
2. Copy `templates/chapter.json` and `templates/chapter-template.md` into it; rename the Markdown file and set `number`, `source` and `outputBase`.
3. Write the companion code and its tests under `project/` and `examples/`. Run them.
4. Write the chapter, copying listings from the real files and output from the real runs.
5. List the test commands in `chapter.json`.
6. Add the chapter to `config/book.json`.
7. Build, run the checks, and complete `QUALITY_CHECKLIST.md`.

Do not copy the scripts into the chapter folder. All chapters use the one set in `master-design-system/scripts/`.

## 5. What each gate checks

| Gate | Fails when |
| --- | --- |
| Chapter tests | Any command in `chapter.json` exits with an error |
| Manuscript rules | A required section is missing or duplicated; exercises and solutions do not match; MCQs are not 10 × 4; a listing differs from its file; an output line is not in a log; a line or listing is too long; informal address or a placeholder is found |
| Colour tokens | A text/background pair is below its contrast minimum; a tint is too dark for grayscale |
| PDF | The file is truncated or untagged; a font is not embedded, is Type 3, or is not a design-system family; a Bengali word is not recovered intact; a section heading is missing; code indentation is lost; text lies outside the margins; a heading is stranded at the foot of a page |
| DOCX | The package or its XML is damaged; a style is undefined; headings, code lines, tables, MCQs, solutions or callouts do not match the Markdown; a Bengali word is missing |
| Typography audit | Informational: reports how three kinds of extractor read the Bengali text |

A warning does not fail the build. Read it and decide.

## 6. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Required font file not found` | Font not installed and not in `fonts/` | Install it, add it to `fonts/<name>/` with its licence, or set `JSM_FONT_DIRS` |
| `Unknown design token in template` | A double-brace placeholder in `book.css` has no token | Add the token or correct the name |
| `Blockquote must start with a known callout label` | A blockquote without one of the four labels | Add the label or use a normal paragraph |
| `listing is not identical to any companion file` | The code in the chapter differs from the real file | Copy the file again, or mark the block `excerpt=` or `fragment=` |
| PDF check: font is Type 3 | A variable font, or a weight with no real font face | Use a static font with real Regular and Bold files |
| PDF check: indentation lost | Usually the same cause as above | As above |
| Word shows a different code font | Cascadia Mono is not installed on that computer | Install it, or change `fonts.mono.docxFamily` and rebuild |
| Word render never finishes | Word automation has stalled | End the hidden Word process; rerun on a copy with a time limit |

## 7. Complete book

Not implemented yet. `build-book.mjs` builds each chapter as its own file. A single bound volume still needs:

1. Front matter: title page, copyright page, preface, author page. The text exists in the Draft Edition build and needs restyling with these tokens.
2. A table of contents with page numbers across chapters.
3. Continuous page numbering, and a running header that changes with each chapter.
4. A decision on trim size and inner margin for print.

Until then, the complete readable book is the Draft Edition in `book-output/draft-edition/`, which uses the earlier, simpler design.
