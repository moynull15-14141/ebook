# Chapter Layout Template

Every chapter follows this structure. A ready-to-fill file is in `templates/chapter-template.md`. Chapter 01 in `premium-final/chapter-01/` is the worked example.

## 1. Chapter folder

```
<chapter-folder>/
├── chapter.json            settings for the build and the tests
├── chapter-NN-final.md     the manuscript — the only file edited by hand
├── project/                the chapter's main project, complete and runnable, with its tests
├── examples/               every smaller example and exercise solution, as real files
├── qa-logs/                written by qa-chapter.mjs
└── .build/                 intermediate files; safe to delete
```

`chapter.json` (copy `templates/chapter.json`):

| Key | Meaning |
| --- | --- |
| `number` | Chapter number |
| `source` | Manuscript file name |
| `outputBase` | Name of the PDF and DOCX, without extension |
| `companion` | Folders that hold the real code (`project`, `examples`) |
| `tests` | Commands that `qa-chapter.mjs` runs; give a `log` name to keep the output |

## 2. Required structure

The order is fixed. Headings marked "exact" are matched by `check-manuscript.mjs`.

| # | Heading | Level | Notes |
| --- | --- | --- | --- |
| 1 | `# অধ্যায় N — Title` | H1 | First line of the file |
| 2 | `## শেখার লক্ষ্য` (exact) | H2 | 5 to 8 objectives, each a thing the reader will be able to do. Tinted panel |
| 3 | `## পূর্বশর্ত` (exact) | H2 | What the reader needs, including earlier chapters. Tinted panel |
| 4 | `## এই অধ্যায় কেন গুরুত্বপূর্ণ` (exact) | H2 | Two to four paragraphs. No code |
| 5 | `## N.1 …` to `## N.k …` | H2 | Concept sections, in learning order. Each: explanation, example, output, walkthrough |
| 6 | `## N.x সাধারণ ভুল` (exact) | H2 | Table: mistake, what the reader sees, fix |
| 7 | `## N.x Debugging নির্দেশিকা` (exact) | H2 | Where to look, how to read the message, a numbered checklist |
| 8 | `## N.x পেশাদার অভ্যাস` (exact) | H2 | Short list of practices, each with its reason |
| 9 | `## N.x Project: Name` | H2 | See section 4 |
| 10 | `## N.x অনুশীলনী` (exact) | H2 | Three levels |
| 11 | `## N.x অনুশীলনীর সমাধান` (exact) | H2 | One per exercise |
| 12 | `## N.x MCQ: নিজেকে যাচাই করুন` (exact) | H2 | 10 questions |
| 13 | `## N.x MCQ-এর উত্তর ও ব্যাখ্যা` (exact) | H2 | Quick key, then the table |
| 14 | `## N.x অধ্যায়ের সারসংক্ষেপ` (exact) | H2 | Bullets, then one sentence on the next chapter |
| 15 | `## N.x গুরুত্বপূর্ণ পরিভাষা` (exact) | H2 | Table of terms introduced in this chapter |
| 16 | `## N.x আরও পড়ুন` (exact) | H2 | Official documentation only; every link opened and checked |

Numbered sections must run `N.1`, `N.2`, … with no gaps, in Bengali numerals.

## 3. A concept section

1. One or two paragraphs that say what the idea is and why it is needed.
2. A complete, runnable example with its `run=` target.
3. The real output, in an Output panel.
4. A walkthrough of each important part: a table for the parts of one line, a bullet list for a longer listing.
5. A callout only if there is a real warning or tip.

Introduce a term before relying on it. Introduce one new idea per example.

## 4. The project section

| Order | Subsection | Content |
| --- | --- | --- |
| 1 | Opening paragraph and figure | What the reader will build; a screenshot of the finished result |
| 2 | `### Project-এর চাহিদা` | Requirements as a list |
| 3 | `### File-এর কাঠামো` | Folder tree (`kind=structure`) |
| 4 | One H3 per file | The file, complete if it is 45 lines or fewer, otherwise excerpts with the path of the full file |
| 5 | `### Code-এর ধাপে ধাপে ব্যাখ্যা` | Walkthrough of the main logic |
| 6 | `### চালানো এবং প্রত্যাশিত আচরণ` | How to run it; table of actions and expected results |
| 7 | `### সমস্যা হলে যা দেখবেন` | Troubleshooting table: symptom, cause, fix |
| 8 | `### এই Project-এর সীমাবদ্ধতা` | What it does not do, and that it is a teaching project |

Every row of the expected-behaviour table must be covered by an automated test or listed in the project README's manual checklist.

Use neutral, beginner-friendly examples in the foundation chapters. From the middle of the book, use practical business examples where they teach better: e-commerce, travel booking, student management, dashboards, inventory, API applications. Do not force one theme on every chapter.

## 5. Length

There is no page target. Include what the reader needs to understand and complete the chapter, and nothing repeated. As a reference only, Chapter 01 is about 6,000 explanatory words and 38 PDF pages. If a chapter grows much beyond that, look first for repeated explanation and for long listings that should be excerpts.

## 6. Markdown dialect

Supported, and nothing else:

- ATX headings `#`, `##`, `###`
- Paragraphs; `**bold**`; `*emphasis*`; `` `inline code` ``
- Flat bullet lists (`- `) and numbered lists (`1. `). No nested lists.
- Fenced code blocks with an info string (`CODE_BLOCK_STANDARDS.md`)
- Pipe tables
- Callout blockquotes with one of the four labels
- One-line figures `![caption](path.png)`

Not supported: links (write the address as inline code), HTML, nested lists, footnotes, H4 and deeper. Keep to the dialect so the PDF and DOCX stay identical in content.

## 7. Before you call a chapter done

Run:

```
node master-design-system/scripts/build-chapter.mjs <chapter-folder>
node master-design-system/scripts/qa-chapter.mjs    <chapter-folder>
```

Then complete `QUALITY_CHECKLIST.md`.
