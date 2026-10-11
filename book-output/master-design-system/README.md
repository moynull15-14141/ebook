# JavaScript Mastery — Master Book Design System

Version 1.0.0. One set of tokens, templates and scripts that builds and checks every chapter of **JavaScript Mastery — শূন্য থেকে প্রফেশনাল** as a PDF and a DOCX from a single Markdown file.

## Folder map

| Folder | Contents |
| --- | --- |
| `config/` | `design-tokens.json` (every size, colour and font), `chapter-rules.json` (what a chapter must contain), `book.json` (title and chapter list) |
| `templates/` | `book.css` (the PDF stylesheet, filled from the tokens), `chapter-template.md`, `chapter.json` |
| `scripts/` | Build and check commands; `lib/` holds the shared Markdown converter, token loader and PDF text reader |
| `fonts/` | Open-licensed font files kept with their licence, so the build does not depend on what happens to be installed |
| `docs/` | The eight standards documents listed below |

## Build one chapter

Run from `book-output/`:

```
node master-design-system/scripts/build-chapter.mjs premium-final/chapter-01
node master-design-system/scripts/qa-chapter.mjs    premium-final/chapter-01
```

The first command writes the PDF and the DOCX. The second runs the chapter's own tests and every quality gate, and saves the logs in the chapter's `qa-logs/` folder. Full details are in `docs/PDF_DOCX_BUILD_GUIDE.md`.

## Documents

| Document | Read it when |
| --- | --- |
| `docs/DESIGN_SYSTEM.md` | You need the overall rules: page, palette, hierarchy, accessibility |
| `docs/TYPOGRAPHY_RULES.md` | You are choosing or changing fonts, sizes or Bengali text handling |
| `docs/CODE_BLOCK_STANDARDS.md` | You are writing or reviewing a code listing |
| `docs/TABLE_AND_CALLOUT_STANDARDS.md` | You are writing a table, note, warning, exercise or MCQ |
| `docs/CHAPTER_LAYOUT_TEMPLATE.md` | You are starting or restructuring a chapter |
| `docs/PDF_DOCX_BUILD_GUIDE.md` | You are building, checking or adding a chapter |
| `docs/FONT_AND_LICENSE_AUDIT.md` | You are distributing the book or changing a font |
| `docs/QUALITY_CHECKLIST.md` | You are signing off a chapter |

## How the rules are enforced

The standards are not advice. Each rule that can be tested is tested by a script, and a chapter is not finished until `qa-chapter.mjs` reports every gate as passed. Rules that need human judgement are listed in `docs/QUALITY_CHECKLIST.md` with the evidence to record.

## Status

Chapter 01 is built and checked with this system. Chapters 02 to 30 have not been started. Binding all chapters into one volume with front matter and a table of contents is not implemented yet.
