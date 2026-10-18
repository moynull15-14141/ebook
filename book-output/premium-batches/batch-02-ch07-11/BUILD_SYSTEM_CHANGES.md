# Build system used for this batch

`build-system/` is a copy of `book-output/master-design-system/` (config, templates, scripts, fonts). The approved master was not modified. Three changes were made to the copy:

| File | Change | Reason |
| --- | --- | --- |
| `scripts/lib/md.mjs` | A listing with `part=N/M` is captioned "অংশ N / M (Part N of M)" and drawn as a normal code panel. A genuinely abbreviated listing keeps the excerpt style, now captioned "নির্বাচিত অংশ (Selected Excerpt — Complete file available in Companion Code)". | Phase 4B rule: parts that together form a complete file must not be called excerpts. |
| `scripts/check-docx.py` | Accepts "Part" captions as labelled listings. | Follows from the change above. |
| `config/book.json` | Lists Chapters 07–11. | `build-book.mjs` builds the chapters of this batch. |

Every other file is byte-identical to the master. Recommendation: merge the `md.mjs` change into the master design system after review, so Chapters 02–06 can be relabelled on their next rebuild.
