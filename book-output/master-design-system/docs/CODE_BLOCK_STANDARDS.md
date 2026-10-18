# Code Block Standards

This is a programming book. A reader must be able to read a listing, type it, copy it and get the printed result. Every rule here exists for that.

## 1. Writing a code block

Use a fenced block with an info string:

````
```javascript run=node file=hello.js
console.log('Hello, JavaScript!');
```
````

| Key | Values | Required | Shown in the caption |
| --- | --- | --- | --- |
| language (first word) | `javascript`, `html`, `css`, `bash`, `json`, `sql`, `text`, … | yes | language name |
| `run=` | `node`, `browser`, `both` | yes, on every source listing | "চলবে: Node.js" / "চলবে: Browser" / "চলবে: Browser Console ও Node.js" |
| `file=` | file name the reader should use | when the code belongs in a file | file name |
| `kind=` | `output`, `error`, `terminal`, `structure` | for panels that are not source code | "Output", "Error Message", "Terminal", "Folder-এর কাঠামো" |
| `excerpt=` | path of the complete companion file | when showing a genuinely shortened part of a file | "নির্বাচিত অংশ (Selected Excerpt — Complete file in Companion Code)" |
| `part=N/M` (with `excerpt=`) | part number / total parts | when a complete file is split across consecutive listings (the parts together are the whole file; marker lines `// ...` join them) | "অংশ N / M (Part N of M)" |
| `fragment=` | path of the tested file the lines belong to | when showing lines to add to an existing file | "যোগ করার অংশ (Fragment)" |

## 2. The five panel types

| Panel | Use | Look |
| --- | --- | --- |
| Source | Code the reader writes | Light gray, caption with file, language and run target |
| Output | What the program prints | Cyan left edge, "Output" |
| Error message | What an error looks like | Red left edge, pale red caption, "Error Message" |
| Terminal | Commands the reader types | Navy left edge, "Terminal" |
| Folder structure | File trees | Gray left edge |

Each type has a text label, so the types remain distinct in grayscale.

## 3. Rules that are checked automatically

`check-manuscript.mjs` fails the chapter if any of these is broken.

1. **Every source listing is real.** A complete listing must be identical, character for character, to a file under the chapter's companion folders (`project/`, `examples/`). Write the file first, run it, then put it in the chapter.
2. **Every source listing says where it runs** (`run=`).
3. **Every Output and Error panel is copied from a run.** Each line must appear in a log under `qa-logs/`. Do not type expected output from memory.
4. **No line longer than 82 characters** (`code.maxLineChars`). At 9 pt, 84 monospace characters fit across the page.
5. **No complete listing longer than 45 lines** (`code.maxListingLines`). Use an excerpt (section 5).
6. **An excerpt must match its file.** Every part between `...` markers must be a continuous piece of the named file, in file order.
7. **A fragment must exist in its file.** Every code line must be present in the named, tested file.

`check-pdf.mjs` and `check-docx.py` add:

8. **Indentation survives copying from the PDF.** Every indented source line must come back from the PDF text layer with its leading spaces.
9. **No code outside the page margins** (no clipping).
10. **Every code line is in the DOCX character for character.**

## 4. Line length and wrapping

- Keep source lines at 80 characters or fewer by writing the code that way in the companion file. Do not reformat code only in the book: the listing would stop matching the file.
- A line that would still wrap (over 80 characters, or over 68 with Bengali text, which is wider) is set as a block with a **hanging indent**, so the continuation is visibly part of the same line. `check-manuscript.mjs` lists every such line as a warning.
- A wrapped line loses its leading spaces when copied from the PDF. That is one more reason to keep lines short.

## 5. Long files: the excerpt policy

When a file is longer than 45 lines, or most of it does not teach the chapter's subject:

1. Keep the **complete, runnable file** in the companion project.
2. State its **exact path** in the text.
3. Say how many lines the full file has, and that it is **not printed in full**.
4. Show only the parts worth teaching, each as its own small excerpt panel **followed directly by its explanation**.
5. Mark omitted parts inside the listing with a comment line in the file's own language: `/* ... */`, `// ...`, `<!-- ... -->` or `# ...`.
6. Tell the reader what happens without the full file, if the project still works.

Never present an abbreviated listing as if it were complete.

## 6. Syntax highlighting

| Token | Colour | Also |
| --- | --- | --- |
| Keyword | `color.synKeyword` | bold |
| String | `color.synString` | — |
| Comment | `color.synComment` | — |
| Number | `color.synNumber` | — |

Highlighting is a reading aid, never the only carrier of meaning. Keywords are bold so that structure is visible without colour. Supported languages: JavaScript, TypeScript, JSON, HTML, CSS, SQL, shell and YAML. Other languages are shown without colour.

## 7. Style of the code itself

- Two-space indentation. Single quotes for strings. A semicolon after every statement.
- `const` by default; `let` only when the value changes.
- Names in camelCase that say what the value is.
- Comments explain why, in Bengali where that helps the reader.
- No external dependencies unless the chapter is about that dependency.
- Use only constructs the reader has already met in this or an earlier chapter, or introduce them first.

## 8. Changing code after a chapter is built

Code is never edited in the Markdown alone.

1. Change the companion file.
2. Update or add its test.
3. Run `qa-chapter.mjs`; it reruns the tests and refreshes the logs.
4. Copy the changed file into the listing, and any changed output into its panel.
5. Record the change in the chapter's `CHANGELOG.md`.
