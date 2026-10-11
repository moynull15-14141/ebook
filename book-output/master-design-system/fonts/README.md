# Fonts kept with the design system

Only open-licensed fonts are kept here, each in its own folder with its licence text. The build looks in these folders first, then in the folders named by the `JSM_FONT_DIRS` environment variable, then in the system font folders.

| Folder | Font | Files | Licence | Origin |
| --- | --- | --- | --- | --- |
| `source-code-pro/` | Source Code Pro 2.030 | `SourceCodePro-Regular.ttf`, `SourceCodePro-Bold.ttf` | SIL Open Font License 1.1 (`OFL.txt`) | Unmodified copies of the files shipped with pgAdmin 4 on this computer; licence text downloaded from `adobe-fonts/source-code-pro` |

Copyright: © Adobe, with Reserved Font Name 'Source'. The files are unmodified.

Hind Siliguri (body) and Cascadia Mono (DOCX code) are not kept here; they are installed on the build computer.

Rules:

1. Never place a proprietary font file in this folder.
2. Every font folder must contain the font's own licence text.
3. Record every addition in `docs/FONT_AND_LICENSE_AUDIT.md`, with the checks listed there.

Checksums and the full audit are in `docs/FONT_AND_LICENSE_AUDIT.md`.
