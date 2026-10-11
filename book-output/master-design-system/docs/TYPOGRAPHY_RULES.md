# Typography Rules

## 1. Fonts

| Use | PDF | DOCX | Licence |
| --- | --- | --- | --- |
| Body, headings, tables, captions (Bengali and Latin) | Hind Siliguri, weights 400 / 500 / 600 / 700 | Hind Siliguri | SIL OFL 1.1 |
| Code | Source Code Pro, Regular and Bold | Cascadia Mono | SIL OFL 1.1 (both) |

Why these, with the evidence, is in `FONT_AND_LICENSE_AUDIT.md`.

Rules:

1. **One family for Bengali and Latin body text.** Hind Siliguri contains both scripts, so English terms inside Bengali sentences share the same weight and baseline. Do not mix in a separate Latin body font.
2. **Code fonts must be static, not variable.** A variable font, or a bold that the browser has to synthesise, is written into the PDF as Type 3 outlines. That removes leading spaces from the text layer, so indentation is lost when a reader copies code. `check-pdf.mjs` fails on any Type 3 font.
3. **Only real font faces.** Code uses Regular and Bold only; `font-synthesis: none` is set so a missing weight can never be faked.
4. **No silent fallback.** The build stops if a required font file is missing.
5. **Bengali text inside code** (comments, strings, output) is drawn in Hind Siliguri, because code fonts have no Bengali glyphs. It is legible but not monospaced. Do not align columns with Bengali text in code.

## 2. Emphasis

- **Bold** (`**text**`): weight 600. Use for a term at the point it is defined, and for labels.
- **Emphasis** (`*text*`): weight 600 in royal blue. Hind Siliguri has no italic, and a mechanically slanted Bengali face is hard to read, so emphasis is never italic.
- Do not use underlining, capitals or letter-spacing for emphasis in running text.

## 3. Bengali text rules

1. **Unicode only**, in NFC form. No legacy (ANSI / Bijoy) encoded text.
2. **Formal address throughout:** আপনি, আপনার, করুন, দেখুন, লিখুন, চেষ্টা করুন. Never তুমি or তোমার. `check-manuscript.mjs` fails on informal pronouns and on informal imperatives addressed to the reader. An informal verb inside a quoted instruction to the computer (for example: "Node.js, File-টি চালাও।") is allowed and is counted separately.
3. **Technical terms stay in English** with a capital letter when used as a term: JavaScript, Browser, Console, Variable, Function, DOM, Event, API, String. Introduce each with a Bengali explanation on first use and list it in the chapter's key-terms table.
4. **Bengali case endings join an English word with a hyphen:** `Browser-এ`, `File-টি`, `Function-এর`.
5. **Numerals:** Bengali numerals in prose, section numbers and page numbers; Latin numerals inside code, file names, versions and anything the reader types.
6. **Punctuation:** the danda (।) ends a sentence. Use the em dash (—) without spaces for an aside; the en dash (–) for ranges and pairs. Use straight quotation marks (" ") in prose.
7. **Only characters the fonts contain.** Arrows, check marks, emoji and geometric symbols are not in Hind Siliguri and would be drawn in a fallback font. `check-manuscript.mjs` fails on them. Write menu paths with `>`: **File > Open Folder**.

## 4. Spacing

| Setting | Value |
| --- | --- |
| Body line height | 1.74 (Bengali vowel signs and conjuncts need more room than Latin text) |
| Paragraph gap | 0.68 em, no first-line indent |
| Alignment | Left, ragged right. Justified text opens rivers in mixed Bengali and English lines |
| Table line height | 1.56 |
| Code line height | 1.55 |

Do not reduce the body line height to save pages.

## 5. Copy, paste and search in the PDF

This was investigated in detail for Chapter 01. The conclusions are rules for the whole book.

**What a PDF stores.** Chrome positions every glyph separately. Bengali is drawn with reordered and combined glyphs: a vowel sign such as ি is drawn before its consonant, and signs such as ু are zero-width marks placed under the previous glyph. To let readers copy the right text, Chrome wraps each such cluster in an `/ActualText` span that holds the original characters.

**What that means for readers.**

| Reader or tool | Result |
| --- | --- |
| Honours `/ActualText` (the standard behaviour for tagged PDF) | Bengali copies exactly. Measured: 5,046 of 5,046 words intact in Chapter 01 |
| Ignores `/ActualText` and rebuilds text from glyph positions | Spaces appear inside words after ু, ঁ and ৃ ("ভু ল", "নতু ন"), and reordered vowel signs come out in the wrong place. Measured with a naive extractor: 42% of words intact |

These artifacts are not visible on the page and are not errors in the manuscript. They are a property of how simple extraction tools read any Bengali PDF.

**Rules.**

1. **Never disable PDF tagging.** It is what makes the text correct.
2. **`check-pdf.mjs` must report 100% of Bengali words intact** with an ActualText-aware reader.
3. **Do not "fix" the manuscript in response to an extraction report.** Run `scripts/check-typography.mjs` first; it shows which kind of extractor produced the report.
4. **Font choice affects simple extractors.** In the same test Hind Siliguri kept 42.2% of words intact under a naive extractor and Noto Sans Bengali 31.5%. Re-run the test before changing the body font.
5. **Code indentation must survive copying.** `check-pdf.mjs` checks that every indented source line comes back with its leading spaces.

Run the audit at any time:

```
node master-design-system/scripts/check-typography.mjs <file.pdf> <source.md>
node master-design-system/scripts/pdf-to-text.mjs <file.pdf> --mode actual --page 12
```

## 6. Known limits

- The audit emulates extractors; it does not drive Adobe Acrobat, a browser's PDF viewer or a mobile reader. Test copy and paste by hand in the viewers your readers use and record the result (see `QUALITY_CHECKLIST.md`).
- The DOCX does not embed fonts. See `FONT_AND_LICENSE_AUDIT.md` for the installation note.
