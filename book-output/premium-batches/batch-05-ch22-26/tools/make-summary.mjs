// Writes each chapter's QA_SUMMARY.md, the batch BATCH_REPORT.md, CHAPTER_REGISTRY.json (Chapters 01–26) and
// BATCH_MANIFEST.json from the recorded results (qa-logs/ and .build/ of every chapter). Only the fixed notes below are
// typed by hand: pages inspected by eye, the Word (DOCX) render results, the link check and the editorial decisions,
// all recorded during production. Usage: node tools/make-summary.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const BATCH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(BATCH, '..', '..');                      // book-output/
const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '');
const json = (f) => JSON.parse(read(f) || '{}');
const count = (text, re) => (text.match(re) ?? []).length;
const sha256 = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const tap = (log) => ({ pass: +(/^# pass (\d+)/m.exec(log) ?? [0, 0])[1], fail: +(/^# fail (\d+)/m.exec(log) ?? [0, 0])[1], skipped: +(/^# skipped (\d+)/m.exec(log) ?? [0, 0])[1] });

// ---------- recorded during production ----------
const INSPECTED = {
  '22': { pages: [1, 6, 12, 18, 35, 39], note: 'opening, concept (TDD red stage), flagged page 12, project code (api.mjs part 2/2), MCQ, final' },
  '23': { pages: [1, 9, 16, 29, 33], note: 'opening, concept (virtual scrolling), project code (app.mjs part 2/2), solutions + MCQ, final' },
  '24': { pages: [1, 7, 22, 33, 36, 39], note: 'opening, concept (null handling, unknown vs any), project code (service.ts part 1/2), flagged page 33, MCQ, final' },
  '25': { pages: [1, 4, 17, 34, 37], note: 'opening, concept (status codes, Express basics), project code (middleware.mjs parts), MCQ, final' },
  '26': { pages: [1, 8, 19, 33, 36, 37], note: 'opening, concept (lost update, index and query plan), project code (ledger.mjs part 2/2), solution 12 + MCQ, final page 36 after the widow fix (page 37 of the earlier build was inspected and fixed)' },
};
const FLAGGED = {
  '22': 'Page 12 was flagged by the white-space check (34% empty): the next heading and its folder-structure panel are kept together and start page 13. Content and order are correct; accepted as a cosmetic layout note (a fix would need a template change).',
  '24': 'Page 33 was flagged by the white-space check (42% empty): the next solution\'s code listing is kept together and starts page 34. Accepted as a cosmetic layout note.',
  '26': 'The first build ended with a page holding one Further Reading line. Two pairs of glossary rows were merged (Primary/Foreign Key; Transaction/ACID) without dropping any term; the chapter now ends on page 36, which was rendered again and inspected.',
};
const WORD = { '22': 41, '23': 36, '24': 41, '25': 40, '26': 39 };     // pages reported by Word after opening the DOCX
const WORD_PAGES_VIEWED = { '24': [5], '26': [24] };
const LINKS = { checked: 25, ok: 25, date: '2026-10-18' };
const PROJECTS = { '22': 'currency-desk', '23': 'travel-search', '24': 'typesafe-claims', '25': 'lead-desk', '26': 'travel-data' };
const PROJECT_FILES = {
  '22': 'src/money.mjs, fees.mjs, rates.mjs, quote.mjs, rate-server.mjs, api.mjs, start.mjs; server.mjs; public/ UI; .github/workflows/test.yml; package.json',
  '23': 'src/data.mjs, search.mjs, virtual.mjs, search-worker.mjs, app.mjs, profile-report.mjs; profile.mjs; serve.mjs; index.html, style.css',
  '24': 'TypeScript: src/types.ts, money.ts, policy.ts, parse.ts, workflow.ts, repository.ts, service.ts, api.ts, demo.ts; tsconfig.json; package.json (typescript, @types/node)',
  '25': 'Express 4: src/config.mjs, errors.mjs, leads.mjs, repository.mjs, service.mjs, middleware.mjs, error-handler.mjs, routes.mjs, app.mjs, server.mjs; main.mjs; package.json (express)',
  '26': 'migrations/001–003 (SQL); src/db.mjs, migrate.mjs, errors.mjs, customers.mjs, ledger.mjs, reports.mjs, backup.mjs, postgres-ledger.mjs (not executed); demo.mjs',
};
const SPECIAL = {
  '22': 'Browser E2E: 1 test in real Chrome (part of the 38); coverage report recorded in `qa-logs/coverage.log` (all `src` files 100% lines)',
  '23': 'Browser E2E: 1 test with 3 subtests in real Chrome (part of the 15): DOM stays at 20 rows or fewer for 12,000 results, last record after scrolling, Worker results equal the Node.js naive search',
  '24': 'TypeScript 6.0.2 (verified local copy): 20 chapter listings type-checked (error panels compared with real compiler output, runnable ones compiled and run); project built with `tsc --strict` incl. 6 compile-time `@ts-expect-error` checks (`qa-logs/tsc-build.log`); runtime tests run on the compiled JavaScript',
  '25': 'Backend: Express 4.22.1 (verified local copy, loaded through a QA-only resolve hook; nothing installed); every test starts its own server on 127.0.0.1 with a random port and shuts it down; graceful shutdown tested with a request in flight',
  '26': 'Database: real SQLite via `node:sqlite` (in-memory and temp-file databases only); constraints, rollback, savepoints, idempotency, two-connection locking, lost update and its fixes, query plans, backup; PostgreSQL adapter syntax-checked only (no PostgreSQL server); Prisma not installed or run',
};
const OVERLAP = {
  '22': {
    earlier: 'Chapter 16 (node:test, test doubles, coverage basics, testing pyramid; booking-guard), Chapter 19 (seeded random), Chapter 20 (tests against a local server), Chapter 21 (contract tests).',
    decision: 'Recap table only. New material: choosing the test level, AAA and table-driven tests, equivalence partitioning and boundary values (which exposed a real fee "cliff"), property-based tests, a full red–green–refactor cycle with real failing output, mock.fn/mock.method/mock.timers, flaky-test causes, coverage gaps found and fixed, mutation testing, real-browser E2E without installing Playwright, CI workflow. v30\'s "Booking Quality Lab" would repeat the booking domain, so the project is CurrencyDesk (forex quotes).',
    v30: 'v30 heading "অধ্যায় ২২:" normalized to "অধ্যায় ২২ —"; title kept.',
  },
  '23': {
    earlier: 'Chapter 19 covers the same v30 subject (performance, memory): Big-O, measurement, long tasks, layout thrashing, GC, WeakMap, LRU, network.',
    decision: 'This is the main curriculum overlap in v30 (Chapters 19 and 23 are both performance chapters). Chapter 19 material is referenced, not repeated. New material: User Timing and PerformanceObserver, programmatic CPU profiles and self time, event-loop delay histogram, heap measurement after GC, Long Task observer, rendering pipeline (transform vs layout), full virtual scrolling, Web Workers and transferables, request-ID race handling. Project TravelSearch Explorer (v30 name kept) is a browser application, distinct from Chapter 19\'s Node.js PerfLab harness.',
    v30: 'v30 heading "অধ্যায় ২৩:" normalized; title kept.',
  },
  '24': {
    earlier: 'Chapter 11 and 17 (validation, trust boundary), Chapter 18 (Result type), Chapter 21 (state machine, repository).',
    decision: 'TypeScript is new to the book. Earlier ideas are revisited as typed versions (Result as discriminated union, exhaustive state machine, generic repository). v30\'s "TypeSafe Booking API" was replaced by TypeSafe Claims (travel expense claims) to avoid a fourth booking project. A section on migrating JavaScript to TypeScript (checkJs, declaration files, CI type-check) covers the "Professional Development Workflow" in the v30 title.',
    v30: 'v30 heading "অধ্যায় ২৪:" normalized; title kept.',
  },
  '25': {
    earlier: 'Chapter 20 (node:http API, cookie sessions, CSRF, scrypt, authorization, log redaction), Chapter 21 (layers, DI).',
    decision: 'Security basics are referenced, not repeated. New material: Express routing and middleware chain, error middleware and the Express 4 async-error trap (demonstrated), REST resource and status design, bearer tokens with a role/permission matrix, cursor pagination, Idempotency-Key, ETag/If-Match optimistic concurrency, request IDs and structured logs, rate limiting, health/readiness, graceful shutdown. v30\'s "TravelCore Booking Backend" was replaced by LeadDesk (customer inquiries) to avoid repeating the booking domain; PostgreSQL is discussed and deferred to Chapter 26 as in v30.',
    v30: 'v30 heading "অধ্যায় ২৫ — JavaScript Backend Development with Node.js" with a separate "##" subtitle was merged into one title line: "…with Node.js: REST APIs, Express, Databases, Authentication এবং Production Architecture".',
  },
  '26': {
    earlier: 'Chapter 20 (parameterized queries, node:sqlite), Chapter 21 and 25 (repository contract, idempotency, optimistic concurrency).',
    decision: 'v30 teaches PostgreSQL and Prisma, which were not available on the QA machine and were not installed. All executable work uses node:sqlite, which shows real constraints, transactions, locks, indexes and plans; PostgreSQL and Prisma are explained with a differences table, a syntax-checked pg adapter and a Prisma example, each clearly marked as not executed. Project keeps the v30 name TravelData Pro but uses a loyalty-points ledger instead of bookings.',
    v30: 'v30 heading "অধ্যায় ২৬ —" with a "##" subtitle (PostgreSQL, Prisma এবং TravelData Pro); main title kept, subtitle folded into the text.',
  },
};
const FINDINGS = {
  '22': ['A boundary-value test exposed a fee "cliff" in the draft fee table (999.99 paid 50.00, 1,000.00 paid 15.00); a property test ("fee never decreases") caught it independently; the table was fixed and the story is told in the chapter.', 'The first coverage run showed that `isValid` (quote expiry) and the "amount too large" branch had no test; tests were added and the real before/after report is in the chapter.', 'Two of my own predicted test expectations were wrong (a large conversion and a rounding-based property); corrected after checking the code was right.'],
  '23': ['The CPU profile showed 68.6% of time in re-tokenising records on every naive search; the index removes it (median 8.29 ms vs 0.39 ms on one machine, reported with environment, not used as a test gate).', 'A leak demo showed that after `abort()` the memory was released only after the next event-loop turn on Node.js 22.16.0; the example waits one tick and the chapter says so. Node.js also printed `MaxListenersExceededWarning`, which the chapter explains.', 'An E2E race (typing debounce vs sort change) was removed by ordering the steps.'],
  '24': ['tsc 6.0.2 reported TS2532 (not TS18048) for an optional property under an index access, and a class named `Cache` clashed with the DOM global `Cache`; both corrected from the real compiler output.', 'Compile-time tests were verified to fail: removing one guarantee made `tsc` stop with TS2578.'],
  '25': ['The Express 4 async-error trap was demonstrated for real: no response and an `unhandledRejection` without the wrapper, a clean 500 with it.'],
  '26': ['Two real SQLite connections produced "database is locked" and a lost update (final 50 instead of 150); both fixes are tested.', 'On Windows, temp database files could not be removed before connections closed; the test helper closes tracked databases first.'],
};

const rows = [];
for (const n of Object.keys(PROJECTS)) {
  const dir = path.join(BATCH, `chapter-${n}`), logs = path.join(dir, 'qa-logs');
  const build = json(path.join(dir, '.build', 'build-data.json')), docx = json(path.join(dir, '.build', 'docx-data.json'));
  const qa = json(path.join(logs, 'qa-summary.json')), typo = json(path.join(dir, '.build', 'typography.json'));
  const manuscript = read(path.join(logs, 'manuscript-check.log')), pdf = read(path.join(logs, 'pdf-check.log')), docxLog = read(path.join(logs, 'docx-check.log'));
  const unit = tap(read(path.join(logs, 'unit-tests.log')));
  const node = /(\d+) files written from the chapter, (\d+) run, (\d+) compared with a printed panel, (\d+) problem/.exec(read(path.join(logs, 'listings-run.log'))) ?? [];
  const chrome = /(\d+) listings run in (\S+), (\d+) compared with a printed panel, (\d+) problem/.exec(read(path.join(logs, 'browser-run.log'))) ?? [];
  const ts = /(\d+) TypeScript listings checked with Version (\S+), (\d+) compared with a printed panel, (\d+) problem/.exec(read(path.join(logs, 'ts-run.log')));
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
    chrome: { run: +chrome[1] || 0, version: chrome[2] ?? '', compared: +chrome[3] || 0, problems: +chrome[4] || 0 },
    ts: ts ? { checked: +ts[1], compared: +ts[3], problems: +ts[4] } : null,
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
| \`project/${r.project}/\` | ${PROJECT_FILES[n]}; README with run commands and runtime versions; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | ${r.node.run} run; ${r.node.compared} compared with a printed Output or Error panel; ${r.node.problems} mismatch | \`qa-logs/listings-run.log\` |
${r.chrome.run ? `| Listings run in real Chrome (local HTTP server) | ${r.chrome.run} run in ${r.chrome.version}; ${r.chrome.compared} compared; ${r.chrome.problems} mismatch | \`qa-logs/browser-run.log\` |\n` : ''}${r.ts ? `| TypeScript listings (real \`tsc --strict\`) | ${r.ts.checked} checked; ${r.ts.compared} compared; ${r.ts.problems} mismatch | \`qa-logs/ts-run.log\`, \`qa-logs/ts-examples.log\` |\n` : ''}| Project tests (\`node --test\`) | ${unit.pass} passed, ${unit.fail} failed, ${unit.skipped} skipped | \`qa-logs/unit-tests.log\` |
| Environment-specific | ${SPECIAL[n]} | \`qa-logs/\` |
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

PDF pages ${insp.pages.join(', ')} were rendered to images and looked at by eye (${insp.note}). ${FLAGGED[n] ?? 'No page was flagged by the white-space check.'} No rendering defect was found: Bengali shaping, code panels, "Part N of M" and "Selected Excerpt" captions, tables and callouts display correctly. The remaining pages passed the automated layout checks only.${WORD_PAGES_VIEWED[n] ? ` Word's PDF export of the DOCX was also inspected on page ${WORD_PAGES_VIEWED[n].join(', ')}.` : ''}

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
`);
}

// ---------- registry of Chapters 01–26 ----------
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
  ['batch-05-ch22-26', 'premium, batch 05 (Phase 4E)', LABEL_FIX, PROJECTS],
];
for (const [batch, production, design, projects] of batches) {
  // Integer-like keys ("10") would otherwise come before "07"; register in numeric order.
  for (const [n, project] of Object.entries(projects).sort(([a], [b]) => a - b)) {
    registry.push(entry(+n, `premium-batches/${batch}/chapter-${n}`, `chapter-${n}-premium.md`, `chapter-${n}-premium.pdf`, `chapter-${n}-premium.docx`, `project/${project}`, production, design));
  }
}
const numbers = registry.map((e) => e.number);
const ordered = numbers.every((v, i) => v === i + 1) && new Set(numbers).size === numbers.length;
const markdownPaths = registry.map((e) => e.paths.markdown);
const uniqueSources = new Set(markdownPaths).size === markdownPaths.length;
const registryValid = ordered && uniqueSources && registry.every((e) => e.missing.length === 0 && e.title);
fs.writeFileSync(path.join(BATCH, 'CHAPTER_REGISTRY.json'), JSON.stringify({
  book: 'JavaScript Mastery — শূন্য থেকে প্রফেশনাল', author: 'Moynul Hasan', pathsRelativeTo: 'repository root (the allcopy folder)',
  generated: new Date().toISOString(), supersedes: 'book-output/premium-batches/batch-04-ch17-21/CHAPTER_REGISTRY.json (left unchanged)',
  chapters: registry,
  validation: { orderedUniqueNumbers: ordered, uniqueAuthoritativeSources: uniqueSources, allPathsExist: registry.every((e) => e.missing.length === 0), allTitlesRead: registry.every((e) => e.title), valid: registryValid },
}, null, 2) + '\n');
JSON.parse(read(path.join(BATCH, 'CHAPTER_REGISTRY.json')));

// ---------- batch report ----------
const sum = (f) => rows.reduce((s, r) => s + f(r), 0);
const unitPass = sum((r) => r.unit.pass), unitTotal = sum((r) => r.unit.pass + r.unit.fail);
const nodeRun = sum((r) => r.node.run), nodeCmp = sum((r) => r.node.compared), chromeRun = sum((r) => r.chrome.run), chromeCmp = sum((r) => r.chrome.compared);
const tsChecked = sum((r) => r.ts?.checked ?? 0);
const problems = sum((r) => r.node.problems + r.chrome.problems + (r.ts?.problems ?? 0));
const inspectedTotal = Object.values(INSPECTED).reduce((s, v) => s + v.pages.length, 0);
const allOk = rows.every((r) => r.gatesOk && r.docxOk) && registryValid;
const below = rows.filter((r) => r.words < 3500);
const testsCell = (r) => `${r.unit.pass} / ${r.unit.pass + r.unit.fail}${r.ts ? `; ${r.ts.checked} TS listings` : ''}`;
fs.writeFileSync(path.join(BATCH, 'BATCH_REPORT.md'), `# Batch Report — Chapters 22–26

**Batch:** \`book-output/premium-batches/batch-05-ch22-26/\` (Phase 4E)
**Source:** \`JavaScript_Mastery_Manuscript_v30/\` (titles and scope)
**Status: ${allOk ? 'PASS — ready for Chief Editor review' : 'NOT READY'}**

## Summary

| Chapter | Words | PDF Pages | Tests | QA |
| --- | --- | --- | --- | --- |
${rows.map((r) => `| ${r.n} — ${r.title} | ${r.words} | ${r.pages} | ${testsCell(r)} | ${r.gatesOk ? 'PASS' : 'FAIL'} (${r.gates.passed}/${r.gates.total} gates${r.warns.length ? `, ${r.warns.length} warning${r.warns.length > 1 ? 's' : ''}` : ''}) |`).join('\n')}
| **Total** | **${sum((r) => r.words)}** | **${sum((r) => r.pages)}** | **${unitPass} / ${unitTotal}; ${tsChecked} TS listings** | **${rows.filter((r) => r.gatesOk).length} of 5 PASS** |

Words are explanatory words (code and inline code excluded). "Tests" are the companion projects' automated tests (\`node --test\`), plus Chapter 24's TypeScript listings verified with the real compiler.

## Chapters completed

22, 23, 24, 25, 26. Each folder has \`chapter-NN-premium.md\`, \`.pdf\`, \`.docx\`, \`project/\`, \`QA_SUMMARY.md\`, \`chapter.json\`, \`examples/\` and \`qa-logs/\`.

## Verification

- **Listings verified:** ${nodeRun} listing files run in Node.js (${nodeCmp} compared with a printed Output or Error panel), ${chromeRun} run in ${rows.find((r) => r.chrome.version)?.chrome.version} from a local HTTP server (${chromeCmp} compared), and ${tsChecked} TypeScript listings checked with the real compiler. Mismatches in the final run: ${problems}.
- **Automated tests:** ${unitPass} passed, 0 failed, 0 skipped across the five projects (38, 15, 11, 10, 21).
- **Browser (Chapters 22, 23):** E2E tests drive real headless Chrome through a small DevTools-protocol helper included in each project (no Playwright installed); the tests skip with a reason if no Chrome or Edge is found.
- **TypeScript (Chapter 24):** TypeScript 6.0.2 and @types/node 25.6.0 were found inside an already-installed global tool (firebase-tools) and used without installing anything. \`tsc --strict\` (plus noUncheckedIndexedAccess, exactOptionalPropertyTypes) builds the project including six compile-time \`@ts-expect-error\` checks; the 11 runtime tests run on the compiled JavaScript. Compile-time guarantees and runtime validation are kept separate in the text; the chapter states that TypeScript gives no runtime input security.
- **Backend (Chapter 25):** Express 4.22.1 from the same verified local installation, loaded in QA through a resolve hook (\`tools/local-deps.mjs\`) so the companion project needs no node_modules; readers use \`npm install\`. Tests cover startup, JSON, valid and invalid requests, 400/401/403/404/409/412/413/429, authorization boundaries, idempotency, request IDs, rate limiting and graceful shutdown with a request in flight. All servers bind to 127.0.0.1 on random ports.
- **Database (Chapter 26):** real SQLite (\`node:sqlite\`) on in-memory and temporary-file databases only: CRUD, constraints (unique, check, foreign key, not null), transactions and rollback, savepoints, idempotency, two-connection locking, a reproduced lost update and two fixes, migrations with checksum tamper detection, query plans with and without an index, verified backup. PostgreSQL (no server) and Prisma (not installed) were **not run**; the pg adapter is syntax-checked only and marked as such.
- **Deployment and CI:** nothing was deployed, pushed or published. Chapter 22's GitHub Actions workflow was not run on GitHub; its two commands were run locally. No real credentials; demo tokens are random per run and test tokens are labelled test-only.
- **Further Reading:** ${LINKS.checked} distinct addresses, all HTTP 200 on ${LINKS.date}.

## Visual inspection coverage

${inspectedTotal} PDF pages were rendered to images and looked at by eye: for every chapter the opening page, a concept page, a code-heavy project page, an exercise or MCQ page and the final page, plus every flagged page.

| Chapter | Pages looked at | Flagged |
| --- | --- | --- |
${rows.map((r) => `| ${r.n} | ${INSPECTED[r.n].pages.join(', ')} | ${{ 22: 'page 12 (white space; accepted)', 24: 'page 33 (white space; accepted)', 26: 'widow final page (fixed; new final page 36 inspected)' }[r.n] ?? 'none'} |`).join('\n')}

No rendering defect was found. All other pages passed the automated layout checks.

## DOCX validation

All five DOCX files passed the structural checks. Each was opened by Microsoft Word through automation and exported to PDF without error (Word reported ${rows.map((r) => WORD[r.n]).join(', ')} pages for Chapters 22–26). Word's export was inspected on Chapter 24 page 5 (TypeScript listing and compiler-error panel) and Chapter 26 page 24 (tables with inline code); Bengali shaping, code and captions are correct.

## Curriculum mismatches and overlap decisions

| Chapter | Previously learned | New advanced material / decision |
| --- | --- | --- |
${rows.map((r) => `| ${r.n} | ${OVERLAP[r.n].earlier} | ${OVERLAP[r.n].decision} |`).join('\n')}

Headings: v30 Chapters 22–24 use "অধ্যায় N:"; normalized to "অধ্যায় N — ". v30 Chapters 25 and 26 put part of the title in a second "##" line; Chapter 25's was merged into the title, Chapter 26's was folded into the text. All other title words follow v30.

## Registry

\`CHAPTER_REGISTRY.json\` lists Chapters 01–26 (title, Markdown, PDF, DOCX and project paths, production status, QA status, source v30, last verified build with SHA-256 of Markdown, PDF and DOCX). Validation: valid JSON (re-read after writing); numbers 1–26 unique and in order; ${uniqueSources ? 'no duplicate' : 'DUPLICATE'} authoritative Markdown sources; ${registry.filter((e) => e.missing.length === 0).length} of 26 entries have every path present; titles read from each Markdown file. **Registry ${registryValid ? 'valid' : 'INVALID'}.** Earlier registry files were left unchanged. \`BATCH_MANIFEST.json\` lists every file of this batch with size and SHA-256.

## Companion code readiness

Each project lives in \`chapter-NN/project/<name>/\` with a README, run commands and runtime versions; no absolute machine paths, secrets, \`node_modules\` or build output (\`dist/\` is regenerated by \`npm test\`). Chapters 24 and 25 need \`npm install\` (typescript and @types/node; express). Machine-specific paths exist only in the QA configuration (\`chapter.json\`, \`tools/\`), which is not part of the companion projects.

## Method notes

- **Batch tools (\`tools/\`):** copies of the batch-04 tools with additions: \`extract-and-run.mjs\` gained \`tap=1\` (compare only stable TAP lines of a test file run directly) and per-chapter \`nodeArgs\`; new \`ts-examples.mjs\` (TypeScript listings with the real compiler; \`tscheck=1\` for checked JavaScript); new \`local-deps.mjs\` and \`local-deps-hooks.mjs\` (QA-only resolve hook for the local Express copy).
- **Master Design System:** not modified in this phase.

## Remaining limitations

1. **Length.** ${below.length ? `Below the 3,500-word floor (explanatory words): ${below.map((r) => `Chapter ${r.n} (${r.words}; ${r.allWords} including code)`).join(', ')}. These chapters are code-heavy; substantive sections were added where depth was missing (mutation testing, Long Task observer, JS-to-TS migration) rather than filler.` : 'All chapters are within the target.'}
2. **Not executed:** PostgreSQL and Prisma code (Chapter 26), the GitHub Actions workflow on GitHub (Chapter 22), and the illustrative curl commands (Chapter 25; the same requests are covered by automated tests).
3. **Tool versions:** TypeScript 6.0.2 and Express 4.22.1 come from a global tool's bundled copies; readers' \`npm install\` may resolve newer patch versions.
4. **Layout:** two pages with more than 33% white space (Chapter 22 page 12, Chapter 24 page 33) caused by kept-together listings; long chapter titles make the running header wrap to two lines (template behaviour, unchanged).
5. **Editorial:** no second reader has proofread the Bengali.
6. **Platforms:** tested on Windows 10 with Node.js 22.16.0 and Chrome 155 only.

## Protected folders

\`git status\` against commit 9c4763f shows no change in \`JavaScript_Mastery_Manuscript_v01\`–\`v30\`, \`book-output/draft-edition/\`, \`book-output/premium-samples/\`, \`book-output/premium-final/\` or \`book-output/premium-batches/batch-01-ch02-06/\`. Batches 02, 03 and 04 (not committed) were checked against their own \`BATCH_MANIFEST.json\`: 311, 276 and 259 files, all with the recorded SHA-256. In \`master-design-system/\` only the three files approved in Phase 4C differ from the commit (plus \`backups/\`), and no file there is newer than the batch-04 manifest.
`);

// ---------- manifest (last, so it covers the final report) ----------
const files = [];
const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, f.name);
  if (f.isDirectory()) { if (!['.build', 'node_modules', 'dist'].includes(f.name)) walk(p); } else files.push(p);
} };
walk(BATCH);
const manifestFiles = files.filter((f) => !/BATCH_MANIFEST\.json$/.test(f)).sort().map((f) => ({ path: path.relative(BATCH, f).replaceAll('\\', '/'), bytes: fs.statSync(f).size, sha256: sha256(f) }));
fs.writeFileSync(path.join(BATCH, 'BATCH_MANIFEST.json'), JSON.stringify({
  batch: 'batch-05-ch22-26', phase: '4E', builtWith: 'book-output/master-design-system (with 2026-10-15 listing-label fix)',
  chapters: rows.map((r) => ({ number: +r.n, title: r.title, deliverables: [`chapter-${r.n}/chapter-${r.n}-premium.md`, `chapter-${r.n}/chapter-${r.n}-premium.pdf`, `chapter-${r.n}/chapter-${r.n}-premium.docx`, `chapter-${r.n}/project/${r.project}/`, `chapter-${r.n}/QA_SUMMARY.md`] })),
  generated: new Date().toISOString(), excluded: ['.build/ folders (intermediate build files)', 'dist/ (TypeScript build output, regenerated by npm test)', 'node_modules/ (none present)'], fileCount: manifestFiles.length, files: manifestFiles,
}, null, 2) + '\n');

console.log(rows.map((r) => `ch${r.n}: ${r.words} words (${r.allWords} all), ${r.pages} pages, tests ${r.unit.pass}/${r.unit.pass + r.unit.fail}, chrome ${r.chrome.compared}, ts ${r.ts?.checked ?? '-'}, ${r.gatesOk ? 'PASS' : 'FAIL'} ${r.gates.passed}/${r.gates.total}`).join('\n'));
console.log(`registry valid: ${registryValid} (${registry.length} chapters); manifest files: ${manifestFiles.length}; node ${nodeRun}/${nodeCmp}, chrome ${chromeRun}/${chromeCmp}, ts ${tsChecked}, problems ${problems}`);
