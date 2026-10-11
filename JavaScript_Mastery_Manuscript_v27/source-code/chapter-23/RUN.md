# TravelSearch Explorer — Chapter 23

Run automated tests with `node --test core.test.mjs` (Node.js 20+ recommended). Syntax-check with `node --check core.mjs` and `node --check app.mjs`.

Serve this folder locally: `python -m http.server 8000`, then open `http://localhost:8000`. The application uses ES Modules, so opening `index.html` directly as a file may not work.

The 12,000 trips are deterministic, fictional data. The UI implements fixed-row-height virtualization, debounced search, and local performance timing. It is not a complete accessible virtualized list implementation; production apps need keyboard focus management, screen-reader semantics, responsive variable-height handling, and cross-browser testing.
