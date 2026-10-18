# Listing-label fix (2026-10-15, Phase 4C, approved)

Backups in this folder are the files as they were before the change.

| File | Change |
| --- | --- |
| `scripts/lib/md.mjs` | A listing with `part=N/M` is captioned "অংশ N / M (Part N of M)" and drawn as a normal code panel (not the dashed excerpt style). A genuinely shortened listing is captioned "নির্বাচিত অংশ (Selected Excerpt — Complete file in Companion Code)". |
| `scripts/check-docx.py` | Accepts "Part" captions as labelled listings. |
| `docs/CODE_BLOCK_STANDARDS.md` | Documents `part=` and the new excerpt caption. |

Chapters already built (01–11) are not rebuilt by this change.
