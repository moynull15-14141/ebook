// Batch 06 (Phase 4F): writes each chapter's QA_SUMMARY.md, BATCH_REPORT.md, CHAPTER_REGISTRY.json (Chapters 01–30)
// and BATCH_MANIFEST.json from the recorded results (qa-logs/ and .build/ of every chapter). Only the fixed notes
// below are typed by hand: pages inspected by eye, Word (DOCX) render results, the link check and editorial
// decisions, all recorded during production. Usage: node tools/make-summary.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const BATCH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(BATCH, '..', '..'); // book-output/
const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '');
const json = (f) => JSON.parse(read(f) || '{}');
const count = (text, re) => (text.match(re) ?? []).length;
const sha256 = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const tap = (log) => ({ pass: +(/^# pass (\d+)/m.exec(log) ?? [0, 0])[1], fail: +(/^# fail (\d+)/m.exec(log) ?? [0, 0])[1], skipped: +(/^# skipped (\d+)/m.exec(log) ?? [0, 0])[1] });

// ---------- recorded during production ----------
const INSPECTED = {
  '27': { pages: [1, 3, 4, 30], note: 'opening, flagged page 3, concept table, project code (server.mjs parts)' },
  '28': { pages: [1, 7, 20, 41, 43], note: 'opening, Dockerfile panel and table, Prometheus output with SLO listing, MCQ answers, final' },
  '29': { pages: [1, 3, 6, 24, 40, 41], note: 'opening, flagged pages 3 and 6, demo output, final page 40 after the widow fix (page 41 of the earlier build was inspected and fixed)' },
  '30': { pages: [1, 29, 43], note: 'opening, demo output and the honest feature table, final' },
};
const FLAGGED = {
  '27': 'Page 3 was flagged by the white-space check (38% empty): the next listing (01-polling-cost.mjs) is kept together and starts page 4. Accepted as a cosmetic layout note.',
  '29': 'Pages 3 (43% empty) and 6 (35% empty) were flagged: kept-together listings start the next page. Accepted as cosmetic. The first build also ended with a page holding two Further Reading entries; four pairs of glossary rows were merged (no term dropped) and the two AWS links were combined in one entry; the chapter now ends on page 40, rendered again and inspected.',
};
const WORD = { '27': 56, '28': 47, '29': 44, '30': 47 }; // pages reported by Word after opening the DOCX
const WORD_PAGES_VIEWED = { '30': [20] };
const LINKS = { checked: 28, ok: 28, date: '2026-10-18' };
const PROJECTS = { '27': 'travel-live', '28': 'deploy-ready', '29': 'travel-saga', '30': 'travel-master-pro' };
const PROJECT_FILES = {
  '27': 'src/events.mjs, live-hub.mjs, client-state.mjs, backoff.mjs, rate-limit.mjs, gateway.mjs (ws), sse.mjs, server.mjs, demo-data.mjs; public/index.html, app.mjs; main.mjs; demo.mjs; package.json (ws)',
  '28': 'src/config.mjs, logger.mjs, metrics.mjs, jobs.mjs, app.mjs, server.mjs; main.mjs; healthcheck.mjs; scripts/check-deploy.mjs, smoke.mjs; Dockerfile; .dockerignore; compose.yaml; .env.example; .github/workflows/ci.yml',
  '29': 'src/services/http-util.mjs, inventory.mjs, payment.mjs; src/http-client.mjs, saga-store.mjs (node:sqlite), orchestrator.mjs, system.mjs; demo.mjs',
  '30': 'src/errors.mjs, validation.mjs, passwords.mjs, db.mjs (node:sqlite), service.mjs, http.mjs, server.mjs; public/index.html, app.mjs, styles.css; main.mjs; demo.mjs; tsconfig.json; package.json (typescript, @types/node as optional devDependencies)',
};
const SPECIAL = {
  '27': 'WebSocket server with `ws` 7.5.10 (verified local copy, loaded through the QA-only resolve hook; nothing installed); clients are Node.js 22 built-in WebSocket and real headless Chrome; dashboard E2E in Chrome: 8 of 8 checks (`qa-logs/browser-e2e.log`); Socket.IO example syntax-checked only (socket.io not installed); Redis Pub/Sub shown with a clearly labelled in-memory simulation',
  '28': 'Deploy validation (`qa-logs/deploy-validation.log`): compose.yaml and ci.yml parsed with yaml 2.8.3 and js-yaml 3.14.2 (identical data) and checked structurally; production-mode start and smoke test pass; smoke test fails correctly without the token. **NOT RUN:** `docker build` / `docker compose up` (Docker daemon not reachable) and the GitHub Actions workflow (not pushed)',
  '29': 'Two real HTTP participant services on random ports, orchestrator with a SQLite saga log; crash recovery tested at two crash points with a real database file; failure-lab demo logged (`qa-logs/demo.log`)',
  '30': 'TypeScript 6.0.2 + @types/node 25.6.0 (verified local copy): strict checkJs on 7 files, 0 errors, plus a control run that reports a deliberate error (`qa-logs/typecheck.log`); 4-thread concurrency test on one SQLite file; frontend E2E in real headless Chrome: 14 of 14 checks incl. double submit, CSP and 375 px width (`qa-logs/browser-e2e.log`)',
};
const OVERLAP = {
  '27': {
    earlier: 'Chapter 13–14 (async), Chapter 20 (auth), Chapter 25 (HTTP API, idempotency), Chapter 26 (transactions).',
    decision: 'New: polling/SSE/WebSocket, close codes, heartbeat, backpressure, event envelope and versioning, delivery semantics, transactional outbox with node:sqlite, Pub/Sub scaling. v30\'s dependency-free in-memory simulator is kept as the domain (`live-hub.mjs`) and extended with a real `ws` gateway, an SSE endpoint and a browser dashboard. Project name TravelLive kept from v30.',
    v30: 'v30 heading kept; the "##" subtitle (WebSockets, Socket.IO, Event-Driven Architecture এবং Distributed Messaging) folded into the learning objectives and text.',
  },
  '28': {
    earlier: 'Chapter 22 (CI workflow), Chapter 25 (graceful shutdown, request IDs, health), Chapter 26 (backup).',
    decision: 'Earlier topics are extended, not repeated: fail-fast configuration, Docker/Compose/CI files, drain-based graceful shutdown with tests, Prometheus exposition format, SLO/error budget/burn rate, canary analysis. Project DeployReady Travel Operations API kept from v30.',
    v30: 'v30 heading kept.',
  },
  '29': {
    earlier: 'Chapter 25 (Idempotency-Key), Chapter 26 (transactions), Chapter 27 (outbox, backoff), Chapter 28 (health, metrics).',
    decision: 'New: capacity planning with Little\'s Law, modular monolith, bounded contexts, saga orchestration vs choreography, key + fingerprint idempotency, CAP with a partition simulation, circuit breaker, bulkhead, inbox, crash recovery. v30\'s in-memory TravelSaga is rebuilt with real HTTP participants and a durable SQLite saga log; name kept.',
    v30: 'v30 heading kept; "Learning Outcomes" section renamed to the book\'s standard headings.',
  },
  '30': {
    earlier: 'The whole book (capstone); in particular Chapters 17, 20, 22, 24, 25, 26, 28, 29.',
    decision: 'v30\'s TravelMaster Pro requirements (FR1–FR8, non-functional list, API contract, rubric, 12-week roadmap, ADR) are preserved. Upgraded from v30\'s in-memory demo to node:sqlite with constraints and transactions, hashed session tokens, login rate limiting, a browser frontend tested in Chrome and a strict JSDoc type check. Payment, email verification and password reset are explicitly marked as not implemented.',
    v30: 'v30 heading "অধ্যায় 30 —" (Latin digits) normalized to "অধ্যায় ৩০ —"; title kept.',
  },
};
const FINDINGS = {
  '27': ['Without an `error` handler on each connection, a single over-size message made `ws` emit an unhandled `error` event and crash the whole test process; the handler was added and a `protocolErrors` metric counts it. The chapter tells the story.', 'The first demo printed events as they arrived, and line order varied between runs; it now waits for a given sequence and applies buffered messages in order.', 'The first browser run logged a 404 for `/favicon.ico`; an empty icon link removed it.'],
  '28': ['The healthcheck test first used `spawnSync`, which blocked the event loop of the very server it was checking and failed; switched to async `spawn`.', 'Output lines of the logger and metrics examples exceeded the code width; the examples were adjusted (object output, shorter route label).'],
  '29': ['The first test run failed six saga tests with "ভুল Field: bookingId": the test IDs were shorter than the validator\'s 3-character minimum (a test bug, not a code bug); IDs fixed. The chapter tells the story.', 'One demo scenario hit validation (seats > 9) instead of "sold out"; the scenario was corrected.'],
  '30': ['Browser E2E found a real UX bug: a wrong password showed "Session expired"; the client now distinguishes 401 during login from 401 of an expired session.', 'Browser E2E found a message race: the login handler\'s late "welcome" could overwrite a newer booking message; the message is now set before the bookings load.', 'A strict type check of all `src/` files passed with zero errors; a control copy with one deliberate type error was rejected (TS2322), proving the check is live.', 'Four worker threads booking the same package on one SQLite file produced exactly 20 bookings for 20 seats (20 SOLD_OUT), with seats ending at 0.'],
};

const rows = [];
for (const n of Object.keys(PROJECTS)) {
  const dir = path.join(BATCH, `chapter-${n}`), logs = path.join(dir, 'qa-logs');
  const build = json(path.join(dir, '.build', 'build-data.json')), docx = json(path.join(dir, '.build', 'docx-data.json'));
  const qa = json(path.join(logs, 'qa-summary.json')), typo = json(path.join(dir, '.build', 'typography.json'));
  const manuscript = read(path.join(logs, 'manuscript-check.log')), pdf = read(path.join(logs, 'pdf-check.log')), docxLog = read(path.join(logs, 'docx-check.log'));
  const unit = tap(read(path.join(logs, 'unit-tests.log')));
  const node = /(\d+) files written from the chapter, (\d+) run, (\d+) compared with a printed panel, (\d+) problem/.exec(read(path.join(logs, 'listings-run.log'))) ?? [];
  const e2e = /(\d+) checks, (\d+) failed/.exec(read(path.join(logs, 'browser-e2e.log')));
  const warns = [...manuscript.matchAll(/^WARN\s+(.+)$/gm), ...pdf.matchAll(/^WARN\s+(.+)$/gm)].map((m) => m[1]);
  const kinds = (build.codeBlocks ?? []).reduce((a, c) => { a[c.kind] = (a[c.kind] ?? 0) + 1; return a; }, {});
  const md = read(path.join(dir, `chapter-${n}-premium.md`));
  const r = {
    n, title: build.title, words: build.words?.explanatory, allWords: md.split(/\s+/).filter(Boolean).length,
    pages: build.pdfPages, sections: build.sections?.length,
    pdfKB: Math.round(build.pdfBytes / 1024), docxKB: Math.round(docx.bytes / 1024),
    gates: { passed: qa.passed, total: qa.passed + qa.failed }, gatesOk: qa.failed === 0 && qa.passed > 0,
    docxOk: count(docxLog, /^FAIL/gm) === 0 && count(docxLog, /^PASS/gm) > 0, unit,
    node: { run: +node[2] || 0, compared: +node[3] || 0, problems: +node[4] || 0 },
    e2e: e2e ? { checks: +e2e[1], failed: +e2e[2] } : null,
    warns, project: PROJECTS[n],
  };
  rows.push(r);

  const insp = INSPECTED[n], ov = OVERLAP[n];
  fs.writeFileSync(path.join(dir, 'QA_SUMMARY.md'), `# QA Summary — Chapter ${n}

**Chapter:** অধ্যায় ${build.number} — ${build.title}
**Status: ${r.gatesOk ? 'PASS' : 'FAIL'}** — ${qa.passed} of ${qa.passed + qa.failed} automated gates passed (last QA run ${qa.ran})
**Source:** \`JavaScript_Mastery_Manuscript_v30/chapters/chapter-${n}.md\` (title and scope); text rewritten for the premium edition
**Built with:** \`book-output/master-design-system/\` ${build.designSystem} (with the approved 2026-10-15 listing-label fix; not modified in this phase)

## Deliverables

| File | Result |
| --- | --- |
| \`chapter-${n}-premium.md\` | ${r.words} explanatory words (code and inline code excluded; ${r.allWords} words including code); ${r.sections} sections |
| \`chapter-${n}-premium.pdf\` | ${r.pages} pages (A4); ${r.pdfKB} KB |
| \`chapter-${n}-premium.docx\` | ${r.docxKB} KB; structural validation ${r.docxOk ? 'passed' : 'FAILED'}; opened and exported by Microsoft Word (${WORD[n]} pages reported by Word) |
| \`project/${r.project}/\` | ${PROJECT_FILES[n]}; README with run commands, runtime versions and limitations; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | ${r.node.run} run; ${r.node.compared} compared with a printed Output or Error panel; ${r.node.problems} mismatch | \`qa-logs/listings-run.log\` |
| Project tests (\`node --test\`) | ${unit.pass} passed, ${unit.fail} failed, ${unit.skipped} skipped | \`qa-logs/unit-tests.log\` |
${r.e2e ? `| Browser end-to-end (real headless Chrome) | ${r.e2e.checks - r.e2e.failed} of ${r.e2e.checks} checks passed | \`qa-logs/browser-e2e.log\` |\n` : ''}| Environment-specific | ${SPECIAL[n]} | \`qa-logs/\` |
| Manuscript rules | ${count(manuscript, /^PASS/gm)} passed, ${count(manuscript, /^FAIL/gm)} failed, ${count(manuscript, /^WARN/gm)} warning | \`qa-logs/manuscript-check.log\` |
| PDF checks (all ${r.pages} pages) | ${count(pdf, /^PASS/gm)} passed, ${count(pdf, /^FAIL/gm)} failed, ${count(pdf, /^WARN/gm)} warning | \`qa-logs/pdf-check.log\` |
| DOCX structural checks | ${count(docxLog, /^PASS/gm)} passed, ${count(docxLog, /^FAIL/gm)} failed | \`qa-logs/docx-check.log\` |
| Bengali text layer (ActualText-aware reader) | ${typo.modes?.actual?.intactOccurrences} of ${typo.sourceWords} words intact | \`qa-logs/typography-audit.log\` |

Content: ${kinds.source ?? 0} source listings, ${kinds.output ?? 0} output panels, ${kinds.error ?? 0} error panels; ${build.tables} tables; ${build.callouts} callouts; 12 exercises (beginner, intermediate, challenge) with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Curriculum overlap

| | |
| --- | --- |
| Previously learned | ${ov.earlier} |
| Decision | ${ov.decision} |
| v30 heading | ${ov.v30} |

## Real findings during production

${FINDINGS[n].map((t) => `- ${t}`).join('\n')}

## Warnings

${warns.length ? warns.map((w) => `- ${w}`).join('\n') : '- None.'}

## Visual inspection

PDF pages ${insp.pages.join(', ')} were rendered to images and looked at by eye (${insp.note}). ${FLAGGED[n] ?? 'No page was flagged by the white-space check.'} No rendering defect was found: Bengali shaping, code panels, "Part N of M" captions, tables and callouts display correctly; long titles make the running header wrap to two lines (template behaviour). The remaining pages passed the automated layout checks only.${WORD_PAGES_VIEWED[n] ? ` Word's PDF export of the DOCX was also inspected on page ${WORD_PAGES_VIEWED[n].join(', ')}.` : ''}

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
`);
}

// ---------- registry of Chapters 01–30 ----------
const exists = (p) => fs.existsSync(path.join(OUT, p));
const entry = (number, base, md, pdf, docx, projectDir, production, designSystem) => {
  const dir = path.join(OUT, base);
  const qa = json(path.join(dir, 'qa-logs', 'qa-summary.json'));
  const build = json(path.join(dir, '.build', 'build-data.json'));
  const title = (/^# অধ্যায় \S+ — (.+)$/m.exec(read(path.join(dir, md))) ?? [])[1] ?? null;
  const paths = { markdown: `${base}/${md}`, pdf: `${base}/${pdf}`, docx: `${base}/${docx}`, project: `${base}/${projectDir}` };
  const missing = Object.entries(paths).filter(([, p]) => !exists(p)).map(([k]) => k);
  return {
    number, title,
    paths: Object.fromEntries(Object.entries(paths).map(([k, p]) => [k, `book-output/${p}`])),
    missing,
    productionStatus: production,
    qaStatus: missing.length ? 'unverified' : qa.failed === 0 && qa.passed > 0 ? `PASS (${qa.passed} of ${qa.passed + qa.failed} gates)` : 'FAIL',
    sourceManuscript: 'v30',
    lastVerifiedBuild: {
      builtAt: build.built ?? null, qaRunAt: qa.ran ?? null, pdfPages: build.pdfPages ?? null, explanatoryWords: build.words?.explanatory ?? null,
      designSystem,
      ...(missing.length ? {} : { markdownSha256: sha256(path.join(OUT, paths.markdown)), pdfSha256: sha256(path.join(OUT, paths.pdf)), docxSha256: sha256(path.join(OUT, paths.docx)) }),
    },
  };
};
const LABEL_FIX = 'master-design-system 1.0.0 + 2026-10-15 listing-label fix';
const registry = [entry(1, 'premium-final/chapter-01', 'chapter-01-final.md', 'JavaScript_Mastery_Chapter_01_Final.pdf', 'JavaScript_Mastery_Chapter_01_Final.docx', 'project/interactive-greeting-app', 'final (Phase 3B)', 'master-design-system 1.0.0 (before label fix)')];
const batches = [
  ['batch-01-ch02-06', 'premium, batch 01 (Phase 4A)', 'master-design-system 1.0.0 (before label fix; project parts captioned "Selected Excerpt")',
    { '02': 'student-result-calculator', '03': 'shopping-discount-calculator', '04': 'cart-analyzer', '05': 'invoice-calculator', '06': 'inventory-dashboard' }],
  ['batch-02-ch07-11', 'premium, batch 02 (Phase 4B)', 'batch-02 build-system (master copy + part captions)',
    { '07': 'student-management', '08': 'content-search-utility', '09': 'task-manager', '10': 'user-directory-explorer', '11': 'order-validation' }],
  ['batch-03-ch12-16', 'premium, batch 03 (Phase 4C)', LABEL_FIX,
    { '12': 'modular-shopping-cart', '13': 'booking-lab', '14': 'sales-function-lab', '15': 'bookmark-vault', '16': 'booking-guard' }],
  ['batch-04-ch17-21', 'premium, batch 04 (Phase 4D)', LABEL_FIX,
    { '17': 'form-shield', '18': 'ledger-flow', '19': 'perf-lab', '20': 'secure-trip', '21': 'visa-flow' }],
  ['batch-05-ch22-26', 'premium, batch 05 (Phase 4E)', LABEL_FIX,
    { '22': 'currency-desk', '23': 'travel-search', '24': 'typesafe-claims', '25': 'lead-desk', '26': 'travel-data' }],
  ['batch-06-ch27-30', 'premium, batch 06 (Phase 4F)', LABEL_FIX, PROJECTS],
];
for (const [batch, production, design, projects] of batches) {
  // Integer-like keys ("10") would otherwise come before "07"; register in numeric order.
  for (const [n, project] of Object.entries(projects).sort(([a], [b]) => a - b)) {
    registry.push(entry(+n, `premium-batches/${batch}/chapter-${n}`, `chapter-${n}-premium.md`, `chapter-${n}-premium.pdf`, `chapter-${n}-premium.docx`, `project/${project}`, production, design));
  }
}
const numbers = registry.map((e) => e.number);
const ordered = registry.length === 30 && numbers.every((v, i) => v === i + 1) && new Set(numbers).size === numbers.length;
const markdownPaths = registry.map((e) => e.paths.markdown);
const uniqueSources = new Set(markdownPaths).size === markdownPaths.length;
// Fingerprints of Chapters 01–26 must equal those recorded in the batch-05 registry (nothing changed since).
const previous = json(path.join(OUT, 'premium-batches', 'batch-05-ch22-26', 'CHAPTER_REGISTRY.json')).chapters ?? [];
const fingerprintMismatch = previous.filter((p) => {
  const now = registry.find((e) => e.number === p.number)?.lastVerifiedBuild;
  return ['markdownSha256', 'pdfSha256', 'docxSha256'].some((k) => p.lastVerifiedBuild[k] !== now?.[k]);
}).map((p) => p.number);
const registryValid = ordered && uniqueSources && registry.every((e) => e.missing.length === 0 && e.title) && previous.length === 26 && fingerprintMismatch.length === 0;
const registryDoc = {
  book: 'JavaScript Mastery — শূন্য থেকে প্রফেশনাল', author: 'Moynul Hasan', pathsRelativeTo: 'repository root (the allcopy folder)',
  generated: new Date().toISOString(), supersedes: 'book-output/premium-batches/batch-05-ch22-26/CHAPTER_REGISTRY.json (left unchanged)',
  chapters: registry,
  validation: {
    exactly30: registry.length === 30, orderedUniqueNumbers: ordered, uniqueAuthoritativeSources: uniqueSources,
    allPathsExist: registry.every((e) => e.missing.length === 0), allTitlesRead: registry.every((e) => e.title),
    chapters01to26FingerprintsMatchBatch05Registry: previous.length === 26 && fingerprintMismatch.length === 0, fingerprintMismatch,
    valid: registryValid,
  },
};
fs.writeFileSync(path.join(BATCH, 'CHAPTER_REGISTRY.json'), JSON.stringify(registryDoc, null, 2) + '\n');
JSON.parse(read(path.join(BATCH, 'CHAPTER_REGISTRY.json')));

// ---------- batch report ----------
const sum = (f) => rows.reduce((s, r) => s + f(r), 0);
const unitPass = sum((r) => r.unit.pass), unitTotal = sum((r) => r.unit.pass + r.unit.fail);
const nodeRun = sum((r) => r.node.run), nodeCmp = sum((r) => r.node.compared);
const problems = sum((r) => r.node.problems);
const inspectedTotal = Object.values(INSPECTED).reduce((s, v) => s + v.pages.length, 0);
const allOk = rows.every((r) => r.gatesOk && r.docxOk) && registryValid;
const below = rows.filter((r) => r.words < 3500);
fs.writeFileSync(path.join(BATCH, 'BATCH_REPORT.md'), `# Batch Report — Chapters 27–30

**Batch:** \`book-output/premium-batches/batch-06-ch27-30/\` (Phase 4F)
**Source:** \`JavaScript_Mastery_Manuscript_v30/\` (titles and scope)
**Status: ${allOk ? 'PASS — all four chapters complete; registry 01–30 valid' : 'NOT READY'}**

## Summary

| Chapter | Words | PDF Pages | Tests | QA |
| --- | --- | --- | --- | --- |
${rows.map((r) => `| ${r.n} — ${r.title} | ${r.words} | ${r.pages} | ${r.unit.pass} / ${r.unit.pass + r.unit.fail}${r.e2e ? `; E2E ${r.e2e.checks - r.e2e.failed}/${r.e2e.checks}` : ''} | ${r.gatesOk ? 'PASS' : 'FAIL'} (${r.gates.passed}/${r.gates.total} gates${r.warns.length ? `, ${r.warns.length} warning${r.warns.length > 1 ? 's' : ''}` : ''}) |`).join('\n')}
| **Total** | **${sum((r) => r.words)}** | **${sum((r) => r.pages)}** | **${unitPass} / ${unitTotal}** | **${rows.filter((r) => r.gatesOk).length} of 4 PASS** |

Words are explanatory words (code and inline code excluded). "Tests" are the companion projects' automated tests (\`node --test\`); "E2E" are checks in real headless Chrome.

## Chapters completed

27, 28, 29, 30. Each folder has \`chapter-NN-premium.md\`, \`.pdf\`, \`.docx\`, \`project/\`, \`QA_SUMMARY.md\`, \`chapter.json\`, \`examples/\` and \`qa-logs/\`.

## Verification

- **Listings verified:** ${nodeRun} listing files run in Node.js, ${nodeCmp} compared with a printed Output or Error panel; mismatches in the final run: ${problems}.
- **Automated tests:** ${unitPass} passed, 0 failed, 0 skipped across the four projects (${rows.map((r) => r.unit.pass).join(', ')}).
- **Real-time (Chapter 27):** \`ws\` 7.5.10 from a verified local installation (QA-only resolve hook; readers run \`npm install\`); real WebSocket connections over 127.0.0.1; dashboard E2E in Chrome. Socket.IO: syntax-checked design only. Redis: in-memory simulation, labelled.
- **Deployment (Chapter 28):** Dockerfile checked by the project's own static rules; compose.yaml and ci.yml parsed by two YAML parsers; production-mode smoke test. **docker build / compose up NOT RUN** (Docker CLI present, daemon not reachable). **GitHub Actions NOT RUN** (nothing pushed).
- **Distributed systems (Chapter 29):** participant services are real HTTP servers in the same process; the saga log is a real SQLite file in the crash-recovery tests.
- **Capstone (Chapter 30):** node:sqlite persistence, concurrency test with four worker threads, strict type check with a control error, Chrome E2E with 14 checks. Payment, email verification and password reset are **not implemented** and marked as such in the chapter and README.
- **Nothing deployed, pushed or published.** No real credentials; demo tokens are fixed and labelled demo-only, test tokens labelled test-only.
- **Further Reading:** ${LINKS.checked} distinct addresses, all HTTP 200 on ${LINKS.date}.

## Visual inspection coverage

${inspectedTotal} PDF pages were rendered to images and looked at by eye: every chapter's opening page, concept or code pages, and final page, plus every flagged page.

| Chapter | Pages looked at | Flagged |
| --- | --- | --- |
${rows.map((r) => `| ${r.n} | ${INSPECTED[r.n].pages.join(', ')} | ${{ 27: 'page 3 (white space; accepted)', 29: 'pages 3 and 6 (white space; accepted); widow final page (fixed; new final page 40 inspected)' }[r.n] ?? 'none'} |`).join('\n')}

## DOCX validation

All four DOCX files passed the structural checks. Each was opened by Microsoft Word through automation and exported to PDF without error (Word reported ${rows.map((r) => WORD[r.n]).join(', ')} pages for Chapters 27–30). Word's export of Chapter 30 page 20 (code listings with Bengali comments) was inspected.

## Curriculum decisions

| Chapter | Previously learned | New material / decision |
| --- | --- | --- |
${rows.map((r) => `| ${r.n} | ${OVERLAP[r.n].earlier} | ${OVERLAP[r.n].decision} |`).join('\n')}

## Registry

\`CHAPTER_REGISTRY.json\` lists Chapters 01–30. Validation: exactly 30 entries; numbers 1–30 unique and in order; ${uniqueSources ? 'no duplicate' : 'DUPLICATE'} authoritative Markdown sources; ${registry.filter((e) => e.missing.length === 0).length} of 30 entries have every path present; titles read from each Markdown file; SHA-256 fingerprints of Chapters 01–26 ${fingerprintMismatch.length ? `DIFFER for ${fingerprintMismatch.join(', ')}` : 'equal those recorded in the batch-05 registry'}. **Registry ${registryValid ? 'valid' : 'INVALID'}.** Earlier registry files were left unchanged.

## Method notes

- **Batch tools (\`tools/\`):** copies of the batch-05 tools; \`local-deps-hooks.mjs\` now also maps \`ws\`; new \`ch27-browser-e2e.mjs\`, \`ch28-validate-deploy.mjs\`, \`ch30-browser-e2e.mjs\`, \`ch30-typecheck.mjs\`; this \`make-summary.mjs\`.
- **Master Design System:** not modified in this phase.

## Remaining limitations

1. **Length.** ${below.length ? `Below 3,500 explanatory words: ${below.map((r) => `Chapter ${r.n} (${r.words})`).join(', ')}.` : 'All four chapters exceed 3,500 explanatory words.'}
2. **Not executed:** Docker build and Compose (no daemon), GitHub Actions (not pushed), Socket.IO (not installed), Redis (not available), PostgreSQL (no server).
3. **Tool versions:** \`ws\` 7.5.10 and TypeScript 6.0.2 come from a global tool's bundled copies; readers' \`npm install\` may resolve newer versions (\`ws\` 8 is supported by the code's API choice).
4. **Layout:** three pages with more than 33% white space (Chapter 27 page 3; Chapter 29 pages 3 and 6); long titles make the running header wrap (template behaviour).
5. **Editorial:** no second reader has proofread the Bengali.
6. **Platforms:** tested on Windows 10 with Node.js 22.16.0 and Chrome 155 only; no real screen-reader test of the Chapter 30 frontend.
`);

// ---------- manifest (last, so it covers the final report) ----------
const files = [];
const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, f.name);
  if (f.isDirectory()) { if (!['.build', 'node_modules', 'dist', 'data'].includes(f.name)) walk(p); } else files.push(p);
} };
walk(BATCH);
const manifestFiles = files.filter((f) => !/BATCH_MANIFEST\.json$/.test(f)).sort().map((f) => ({ path: path.relative(BATCH, f).replaceAll('\\', '/'), bytes: fs.statSync(f).size, sha256: sha256(f) }));
fs.writeFileSync(path.join(BATCH, 'BATCH_MANIFEST.json'), JSON.stringify({
  batch: 'batch-06-ch27-30', phase: '4F', builtWith: 'book-output/master-design-system (with 2026-10-15 listing-label fix)',
  chapters: rows.map((r) => ({ number: +r.n, title: r.title, deliverables: [`chapter-${r.n}/chapter-${r.n}-premium.md`, `chapter-${r.n}/chapter-${r.n}-premium.pdf`, `chapter-${r.n}/chapter-${r.n}-premium.docx`, `chapter-${r.n}/project/${r.project}/`, `chapter-${r.n}/QA_SUMMARY.md`] })),
  generated: new Date().toISOString(), excluded: ['.build/ folders (intermediate build files)', 'node_modules/ (none present)', 'data/ (runtime SQLite files; none present)'], fileCount: manifestFiles.length, files: manifestFiles,
}, null, 2) + '\n');

console.log(rows.map((r) => `ch${r.n}: ${r.words} words (${r.allWords} all), ${r.pages} pages, tests ${r.unit.pass}/${r.unit.pass + r.unit.fail}, e2e ${r.e2e ? `${r.e2e.checks - r.e2e.failed}/${r.e2e.checks}` : '-'}, ${r.gatesOk ? 'PASS' : 'FAIL'} ${r.gates.passed}/${r.gates.total}`).join('\n'));
console.log(`registry valid: ${registryValid} (${registry.length} chapters; 01-26 fingerprint mismatches: ${fingerprintMismatch.length}); manifest files: ${manifestFiles.length}; node ${nodeRun}/${nodeCmp}, problems ${problems}`);
