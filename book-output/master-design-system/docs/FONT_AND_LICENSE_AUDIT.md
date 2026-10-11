# Font and Licence Audit

Audit date: 11 October 2026. This is a record of what was checked and how. It is not legal advice; confirm with the licence texts before commercial release.

## 1. Fonts in use

| Font | Used in | Licence | Embedded | Source of the file |
| --- | --- | --- | --- | --- |
| Hind Siliguri — Regular, Medium, SemiBold, Bold | PDF and DOCX body | SIL Open Font License 1.1 | PDF: yes, subset. DOCX: no | Installed on this computer (user fonts) |
| Source Code Pro — Regular, Bold | PDF code | SIL Open Font License 1.1 | PDF: yes, subset | `fonts/source-code-pro/`, copied from a pgAdmin 4 installation on this computer |
| Cascadia Mono | DOCX code (named only) | SIL Open Font License 1.1 | No | Installed with Windows / Windows Terminal |

No proprietary font is embedded in or bundled with any deliverable.

## 2. Evidence for each licence

### Hind Siliguri

- **In the font file** (name table, read with a script): copyright "Copyright (c) 2015 Indian Type Foundry"; licence "This Font Software is licensed under the SIL Open Font License, Version 1.1"; embedding permission field `fsType = 0` (installable embedding).
- **Upstream**, checked online: the `OFL.txt` in the Google Fonts repository (`google/fonts`, `ofl/hindsiliguri`) carries the same copyright line and SIL OFL 1.1. No Reserved Font Name is declared.

### Source Code Pro

- **In the font file:** copyright "Copyright 2010, 2012 Adobe Systems Incorporated … with Reserved Font Name 'Source'"; licence SIL OFL 1.1; `fsType = 0`. Version 2.030.
- **Upstream**, downloaded: the licence file from `adobe-fonts/source-code-pro` is saved verbatim as `fonts/source-code-pro/OFL.txt`. It states SIL OFL 1.1 and the Reserved Font Name 'Source'.
- **File checksums (SHA-256):**
  - `SourceCodePro-Regular.ttf` — `6e5dd0494f63d85970156cd54b6ac568b82a392d135db08bbf5cc3048d489aa9`
  - `SourceCodePro-Bold.ttf` — `839f42df29a5a83470888b9a3aa4064fc1bc35e6616bb542226d89086f019ec5`

### Cascadia Mono

- **In the font file:** licence URL field points to the SIL OFL; the licence description field is Microsoft's general product wording; `fsType = 0`.
- **Upstream**, checked online: the `LICENSE` in `microsoft/cascadia-code` states SIL OFL 1.1 with Reserved Font Name "Cascadia Code".
- It is only named in the DOCX. It is not embedded and not bundled.

## 3. What the OFL allows, in practice

- Using the fonts to make a book, and selling that book. Documents made with the fonts are not covered by the licence.
- Embedding the fonts in a PDF.
- Redistributing the font files, provided the copyright notice and the licence travel with them. That is why `OFL.txt` sits beside the Source Code Pro files.
- Not allowed: selling the font files on their own, or releasing a modified version under a Reserved Font Name. The files here are unmodified.

## 4. Fonts considered and rejected

| Font | Decision | Reason, with the test result |
| --- | --- | --- |
| Consolas | Rejected (used in the Phase 3A sample) | Proprietary Microsoft font. It embeds correctly, but the brief requires a clearly open licence |
| Cascadia Mono, for the PDF | Rejected | It is a variable font. Chrome writes it as Type 3 outlines: in a controlled test only 6 of 12 space glyphs reached the text layer and 0 of 2 indented lines kept their indentation. Copied code would lose its indentation |
| Source Code Pro, for the PDF | Chosen | Static font. Same test: 12 of 12 space glyphs, 2 of 2 indented lines, text identical to the source. Regular and Bold both embed as TrueType |
| JetBrains Mono | Not available | Open licence confirmed upstream (SIL OFL 1.1, no Reserved Font Name), but it is not on this computer and nothing was downloaded without approval |
| Noto Sans Bengali, for body text | Rejected | Open licence, but in the extraction test it kept 31.5% of words intact under a naive extractor against 42.2% for Hind Siliguri, and 99.5% against 100% with ActualText |
| Nirmala UI, Kalpurush, Siyam Rupali | Not used | Proprietary, or licence not verified |

## 5. Why the PDF and DOCX name different code fonts

A PDF carries its fonts. A DOCX, as built here, does not: Word draws text with fonts installed on the reader's computer. Source Code Pro is not installed on this computer, so a DOCX that named it could not be checked here and would show a substitute font for most readers. Cascadia Mono is installed with current Windows and Windows Terminal and has the same open licence, so the DOCX names it.

To make them match, install Source Code Pro (the two files in `fonts/source-code-pro/`), set `fonts.mono.docxFamily` to `Source Code Pro` and `fonts.mono.docxAdvanceEm` to `0.6` in `config/design-tokens.json`, and rebuild. This was not done because installing software on this computer needs approval.

## 6. DOCX font installation note

For anyone opening a chapter DOCX:

1. **Hind Siliguri** — required. Without it Word substitutes another Bengali font and line breaks and page counts change. It is free from Google Fonts. Install the Regular, Medium, SemiBold and Bold files.
2. **Cascadia Mono** — for code. It ships with Windows 11 and Windows Terminal. Without it Word substitutes another monospace font; the code stays correct, but its width changes.

Embedding fonts inside the DOCX is technically possible and the OFL permits it. It is not done here because the result could not be verified on a computer that already has the fonts installed.

## 7. Open decisions for the publisher

1. **Approve installing or downloading a single code font for both formats.** Either install the Source Code Pro files already in `fonts/`, or approve downloading JetBrains Mono. Until then the PDF and DOCX use two different open code fonts.
2. **Keep or remove the bundled font files.** `fonts/source-code-pro/` makes the build reproducible. If you prefer not to keep font files in the project, delete the folder and set `JSM_FONT_DIRS` to wherever the fonts are installed.
3. **Have the licences reviewed** before commercial release. The evidence above is what was found; it is not a legal opinion.
4. **Commercial printing** may require all fonts as standard embedded fonts. That condition is met: the PDF contains six embedded TrueType fonts and no Type 3 font.

## 8. Rule for any future font

Before a font is used in a deliverable:

1. Read the licence from the font file's own name table and from its upstream source. Both must agree.
2. Confirm it is a static font with real files for every weight the design uses.
3. Run the embedding and extraction test; require standard embedding, intact Bengali text and preserved code indentation.
4. Record the result in this document.
5. If the files are kept in `fonts/`, keep the licence text beside them.
