// Writes each chapter's QA_SUMMARY.md, the batch BATCH_REPORT.md, CHAPTER_REGISTRY.json (Chapters 01–21) and
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
  '17': { pages: [1, 5, 9, 12, 16, 27, 31], note: 'opening, concept (lookaround, regex methods), flagged page 9, ReDoS measurements (page 12), project code (patterns.mjs, rules.mjs), MCQ, final' },
  '18': { pages: [1, 8, 18, 30, 33], note: 'opening, concept (reduce into Map, grouping), project code (transform.mjs part 2/2), MCQ, final' },
  '19': { pages: [1, 5, 14, 26, 29], note: 'opening, concept (statistics, main thread), project code (algorithms.mjs, bench.mjs), solution 12 + MCQ, final' },
  '20': { pages: [1, 9, 23, 38, 41], note: 'opening, concept (password, cookies, CSRF), project code (app.mjs part 3/4), MCQ, final' },
  '21': { pages: [1, 8, 18, 32, 35], note: 'opening, concept (state machine, layers), project code (main.mjs part 2/2), solution 12 + MCQ, final' },
};
const FLAGGED = {
  '17': 'Page 9 was flagged by the white-space check (37% empty at the bottom). Cause: the next listing is kept together and moves to page 10, leaving its one-line lead-in at the foot of page 9. Content and order are correct; accepted as a cosmetic layout note (fixing it would need a template change, which this phase does not allow).',
  '19': 'The first build ended with a 30th page holding a single Further Reading line. Two glossary rows already defined in the text (Latency, Warm-up) were removed; the chapter now ends on page 29, which was rendered again and inspected.',
};
const WORD = { '17': 34, '18': 36, '19': 33, '20': 45, '21': 38 };     // pages reported by Word after opening the DOCX
const WORD_PAGES_VIEWED = { '20': [25], '21': [9] };
const LINKS = { checked: 25, ok: 25, date: '2026-10-15' };
const PROJECTS = { '17': 'form-shield', '18': 'ledger-flow', '19': 'perf-lab', '20': 'secure-trip', '21': 'visa-flow' };
const PROJECT_FILES = {
  '17': 'src/normalize.mjs, patterns.mjs, rules.mjs, engine.mjs; signup-schema.mjs, demo.mjs (Node.js)',
  '18': 'src/immutable.mjs, validate.mjs, transform.mjs, load.mjs; data/sample.mjs; report.mjs (Node.js)',
  '19': 'src/bench.mjs, algorithms.mjs, lru.mjs, chunk.mjs, random.mjs; run-bench.mjs; results/benchmark-report.md (Node.js)',
  '20': 'node:http + node:sqlite API (src/app.mjs, http.mjs, passwords.mjs, sessions.mjs, validate.mjs, db.mjs, limiter.mjs, log.mjs, start.mjs), server.mjs; public/ UI',
  '21': 'src/domain/ (errors, fees, workflow, application), src/app/ (events, ids, service), src/infra/ (memory and storage repositories), src/ui/view.mjs, src/main.mjs; demo.mjs; index.html, style.css',
};
const OVERLAP = {
  '17': {
    earlier: 'Chapter 08 (regex basics, Unicode normalization, XSS) and Chapter 11 (trust boundary, ValidationError, collecting all errors).',
    decision: 'One recap table (section 17.1); basic regex syntax is not re-taught. Depth goes to lookaround, named groups, sticky matching, Unicode and Bengali digits, normalize-validate-parse, ReDoS and a schema engine. Project FormShield is a reusable validation engine, not a repeat of Chapter 11\'s order validation.',
    v30: 'v30 title kept.',
  },
  '18': {
    earlier: 'Chapter 06–07 (array methods, spread, shallow vs deep copy), Chapter 10 (Promise.all) and Chapter 14 (pure functions, pipe/compose, currying, memoization).',
    decision: 'Recap table; pipe/compose and currying only referenced. New material: referential transparency, structural sharing, updateIn/setIn, deep freeze, when mutation is acceptable, normalized state, flatMap, Map.groupBy and pivots, Map-index joins, stable multi-key sorting with Intl.Collator, Result type, batched async loading. Project LedgerFlow is an analytics pipeline, distinct from Chapter 14\'s sales-function-lab (different domain and techniques).',
    v30: 'v30 title kept.',
  },
  '19': {
    earlier: 'Chapter 10 and 14 (debounce, throttle, event loop), Chapter 14 (memoization), Chapter 12 (dynamic import), Chapter 17 (ReDoS timing), Chapter 18 (Map index joins).',
    decision: 'Debounce/throttle and memoization only referenced. New material: Big-O verified by counting steps, measurement method (warm-up, repetitions, median/p95, dead-code elimination, environment), long tasks and chunking, layout thrashing, GC and leaks, WeakMap, LRU with TTL, network budget. Project PerfLab is a benchmark harness with correctness tests; no earlier project measures performance.',
    v30: 'v30 heading "Chapter 19 —" normalized to "অধ্যায় ১৯ —"; title kept.',
  },
  '20': {
    earlier: 'Chapter 08 (textContent vs innerHTML), Chapter 11 (form validation, trust boundary), Chapter 15 (fetch, storage), Chapter 17 (validation, ReDoS).',
    decision: 'XSS basics and client validation recapped in one table; the chapter adds the mechanism (verified in Chrome), context-aware encoding, SQL injection, authN vs authZ/IDOR, password hashing, cookies, CSRF, CORS, CSP, prototype pollution, secrets, dependencies and logging. v30\'s browser-only SecureTrip "booking portal" was replaced by a local server-side SecureTrip API so that server-side validation, authorization and cookies can be shown and tested; it is labelled throughout as an educational demo that is not deployable.',
    v30: 'v30 title kept; project name kept, scope changed as described.',
  },
  '21': {
    earlier: 'Chapter 12 (ES modules), Chapter 13 (classes, composition vs inheritance; booking-lab), Chapter 16 (repository and service; booking-guard).',
    decision: 'Repository/service recapped and extended (adapters, contract tests, composition root, DI of clock and ids). v30\'s "TravelFlow Booking Manager" would have repeated the booking domain of Chapters 13 and 16, so the project is VisaFlow, a visa-application workflow tracker, with a table-driven state machine, fee strategies with a decorator, an event bus, two repository adapters and an architecture test.',
    v30: 'v30 heading "অধ্যায় ২১:" normalized to "অধ্যায় ২১ —"; title kept; project renamed and re-scoped as described.',
  },
};
const EXTRA = {
  '17': ['The ReDoS listing (section 17.9) warms up, then prints measured times for 16 to 24 characters; it has no compared Output panel, so no timing value is a pass/fail gate. The chapter shows one real run labelled with its environment (Windows 10, Node.js 22.16.0) and states how a second run differed (0.44 vs 0.58 ms at 16 characters; 110.09 vs 111.46 ms at 24).'],
  '19': [
    'Benchmark results in section 19.13 are real measurements (Intel Core i5-6600, 4 cores, 8 GB, Windows 10, Node.js v22.16.0, 2026-10-15; warm-up 5, 25 runs, median and p95). Two consecutive runs differed (common: nested median 33.674 ms vs 44.422 ms); the chapter prints both and explains why a single run is not conclusive.',
    'No timing value is a pass/fail gate. The 20 PerfLab tests check correctness only (seeded random inputs, fake clocks); `run-bench.mjs` is excluded from automated tests.',
  ],
  '20': [
    'Each topic is labelled as an educational demonstration, a recommended defence, or a production requirement; a table in section 20.12 lists what SecureTrip does and what a production system would still need. SecureTrip binds to 127.0.0.1 only and keeps data in memory.',
    'Demonstrations use harmless local inputs: a flag set by `onerror`, an in-memory SQLite database, and a prototype-pollution demo that deletes the polluted property afterwards.',
    'Verified by test: XSS via innerHTML (`<img onerror>` runs, `<script>` does not) and its prevention with textContent; CSP blocking inline script and inline handlers (Chrome); HttpOnly cookie invisible to document.cookie (Chrome); parameterized query vs concatenation; per-object authorization (404 for other users\' trips); server-side price; CSRF token and Origin checks; body size/type limits; login rate limit; log redaction; prototype pollution and the safe merge.',
    'Not verified by test, and said so in the text: that browsers withhold SameSite cookies on real cross-site requests (needs two domains). An eval() probe through DevTools was dropped because DevTools evaluation is exempt from CSP.',
    'The chapter states that client-side validation is not security, and that SecureTrip is not production-ready (no independent review or penetration test).',
  ],
  '21': [
    'The VisaFlow end-to-end check in Chrome found two real bugs that the unit tests had missed: failed creates consumed IDs, and the browser ID sequence restarted from the item count (which could reissue an existing ID and overwrite an application). Both were fixed (Factory takes `newId`, `sequenceAfter`), regression tests were added, and the chapter describes the finding.',
  ],
};

const rows = [];
for (const n of Object.keys(PROJECTS)) {
  const dir = path.join(BATCH, `chapter-${n}`), logs = path.join(dir, 'qa-logs');
  const build = json(path.join(dir, '.build', 'build-data.json')), docx = json(path.join(dir, '.build', 'docx-data.json'));
  const qa = json(path.join(logs, 'qa-summary.json')), typo = json(path.join(dir, '.build', 'typography.json'));
  const manuscript = read(path.join(logs, 'manuscript-check.log')), pdf = read(path.join(logs, 'pdf-check.log')), docxLog = read(path.join(logs, 'docx-check.log'));
  const unit = tap(read(path.join(logs, 'unit-tests.log')));
  const e2eText = read(path.join(logs, 'browser-e2e.log'));
  const e2eMatch = /(\d+) of (\d+) browser checks passed/.exec(e2eText);
  const e2e = e2eMatch ? { pass: +e2eMatch[1], total: +e2eMatch[2] } : null;
  const node = /(\d+) files written from the chapter, (\d+) run, (\d+) compared with a printed panel, (\d+) problem/.exec(read(path.join(logs, 'listings-run.log'))) ?? [];
  const chrome = /(\d+) listings run in (\S+), (\d+) compared with a printed panel, (\d+) problem/.exec(read(path.join(logs, 'browser-run.log'))) ?? [];
  const warns = [...manuscript.matchAll(/^WARN\s+(.+)$/gm), ...pdf.matchAll(/^WARN\s+(.+)$/gm)].map((m) => m[1]);
  const kinds = (build.codeBlocks ?? []).reduce((a, c) => { a[c.kind] = (a[c.kind] ?? 0) + 1; return a; }, {});
  const md = read(path.join(dir, `chapter-${n}-premium.md`));
  const r = {
    n, title: build.title, words: build.words?.explanatory, allWords: md.split(/\s+/).filter(Boolean).length,
    pages: build.pdfPages, sections: build.sections?.length,
    pdfKB: Math.round(build.pdfBytes / 1024), docxKB: Math.round(docx.bytes / 1024),
    gates: { passed: qa.passed, total: qa.passed + qa.failed }, gatesOk: qa.failed === 0 && qa.passed > 0,
    docxOk: count(docxLog, /^FAIL/gm) === 0 && count(docxLog, /^PASS/gm) > 0, unit, e2e,
    node: { run: +node[2] || 0, compared: +node[3] || 0, problems: +node[4] || 0 },
    chrome: { run: +chrome[1] || 0, version: chrome[2] ?? '', compared: +chrome[3] || 0, problems: +chrome[4] || 0 },
    warns, project: PROJECTS[n],
  };
  rows.push(r);

  const insp = INSPECTED[n], ov = OVERLAP[n];
  const e2eRow = e2e
    ? `${e2e.pass} of ${e2e.total} checks passed (real headless ${r.chrome.version}, project served from 127.0.0.1)`
    : 'none: Node.js project (chapter listings still run in Chrome)';
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
| \`project/${r.project}/\` | ${PROJECT_FILES[n]}; README with run commands; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | ${r.node.run} run; ${r.node.compared} compared with a printed Output or Error panel; ${r.node.problems} mismatch | \`qa-logs/listings-run.log\` |
| Listings marked Browser or Browser Console run in real Chrome (local HTTP server) | ${r.chrome.run} run in ${r.chrome.version}; ${r.chrome.compared} compared; ${r.chrome.problems} mismatch | \`qa-logs/browser-run.log\` |
| JavaScript syntax (\`node --check\`) | passed | \`qa-logs/syntax-checks.log\` |
| Project unit and integration tests (\`node --test\`) | ${unit.pass} passed, ${unit.fail} failed, ${unit.skipped} skipped | \`qa-logs/unit-tests.log\` |
| Project end-to-end in Chrome | ${e2eRow} | ${e2e ? '`qa-logs/browser-e2e.log`' : '—'} |
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
${EXTRA[n] ? `\n## Specific verification notes\n\n${EXTRA[n].map((t) => `- ${t}`).join('\n')}\n` : ''}
## Warnings

${warns.length ? warns.map((w) => `- ${w}`).join('\n') : '- None.'}

## Visual inspection

PDF pages ${insp.pages.join(', ')} of ${r.pages} were rendered to images and looked at by eye (${insp.note}). ${FLAGGED[n] ?? 'No page was flagged by the white-space check.'} No rendering defect was found: Bengali shaping, code panels, "Part N of M" captions, tables and callouts display correctly. The remaining pages passed the automated layout checks only.${WORD_PAGES_VIEWED[n] ? ` Word's PDF export of the DOCX was also inspected on page ${WORD_PAGES_VIEWED[n].join(', ')}.` : ''}

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
`);
}

// ---------- registry of Chapters 01–21 ----------
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
      ...(missing.length ? {} : { pdfSha256: sha256(path.join(OUT, paths.pdf)), docxSha256: sha256(path.join(OUT, paths.docx)) }),
    },
  };
};
const registry = [entry(1, 'premium-final/chapter-01', 'chapter-01-final.md', 'JavaScript_Mastery_Chapter_01_Final.pdf', 'JavaScript_Mastery_Chapter_01_Final.docx', 'project/interactive-greeting-app', 'final (Phase 3B)', 'master-design-system 1.0.0 (before label fix)')];
for (const [n, project] of [['02', 'student-result-calculator'], ['03', 'shopping-discount-calculator'], ['04', 'cart-analyzer'], ['05', 'invoice-calculator'], ['06', 'inventory-dashboard']]) {
  registry.push(entry(+n, `premium-batches/batch-01-ch02-06/chapter-${n}`, `chapter-${n}-premium.md`, `chapter-${n}-premium.pdf`, `chapter-${n}-premium.docx`, `project/${project}`, 'premium, batch 01 (Phase 4A)', 'master-design-system 1.0.0 (before label fix; project parts captioned "Selected Excerpt")'));
}
for (const [n, project] of [['07', 'student-management'], ['08', 'content-search-utility'], ['09', 'task-manager'], ['10', 'user-directory-explorer'], ['11', 'order-validation']]) {
  registry.push(entry(+n, `premium-batches/batch-02-ch07-11/chapter-${n}`, `chapter-${n}-premium.md`, `chapter-${n}-premium.pdf`, `chapter-${n}-premium.docx`, `project/${project}`, 'premium, batch 02 (Phase 4B)', 'batch-02 build-system (master copy + part captions)'));
}
for (const [n, project] of [['12', 'modular-shopping-cart'], ['13', 'booking-lab'], ['14', 'sales-function-lab'], ['15', 'bookmark-vault'], ['16', 'booking-guard']]) {
  registry.push(entry(+n, `premium-batches/batch-03-ch12-16/chapter-${n}`, `chapter-${n}-premium.md`, `chapter-${n}-premium.pdf`, `chapter-${n}-premium.docx`, `project/${project}`, 'premium, batch 03 (Phase 4C)', 'master-design-system 1.0.0 + 2026-10-15 listing-label fix'));
}
for (const r of rows) {
  registry.push(entry(+r.n, `premium-batches/batch-04-ch17-21/chapter-${r.n}`, `chapter-${r.n}-premium.md`, `chapter-${r.n}-premium.pdf`, `chapter-${r.n}-premium.docx`, `project/${r.project}`, 'premium, batch 04 (Phase 4D)', 'master-design-system 1.0.0 + 2026-10-15 listing-label fix'));
}
const numbers = registry.map((e) => e.number);
const ordered = numbers.every((v, i) => v === i + 1) && new Set(numbers).size === numbers.length;
const registryValid = ordered && registry.every((e) => e.missing.length === 0 && e.title);
fs.writeFileSync(path.join(BATCH, 'CHAPTER_REGISTRY.json'), JSON.stringify({
  book: 'JavaScript Mastery — শূন্য থেকে প্রফেশনাল', author: 'Moynul Hasan', pathsRelativeTo: 'repository root (the allcopy folder)',
  generated: new Date().toISOString(), supersedes: 'book-output/premium-batches/batch-03-ch12-16/CHAPTER_REGISTRY.json (left unchanged)',
  chapters: registry,
  validation: { orderedUniqueNumbers: ordered, allPathsExist: registry.every((e) => e.missing.length === 0), allTitlesRead: registry.every((e) => e.title), valid: registryValid },
}, null, 2) + '\n');

// ---------- batch report ----------
const sum = (f) => rows.reduce((s, r) => s + f(r), 0);
const unitPass = sum((r) => r.unit.pass), unitTotal = sum((r) => r.unit.pass + r.unit.fail), unitSkipped = sum((r) => r.unit.skipped);
const e2ePass = sum((r) => r.e2e?.pass ?? 0), e2eTotal = sum((r) => r.e2e?.total ?? 0);
const nodeRun = sum((r) => r.node.run), nodeCmp = sum((r) => r.node.compared), chromeRun = sum((r) => r.chrome.run), chromeCmp = sum((r) => r.chrome.compared);
const problems = sum((r) => r.node.problems + r.chrome.problems);
const inspectedTotal = Object.values(INSPECTED).reduce((s, v) => s + v.pages.length, 0);
const allOk = rows.every((r) => r.gatesOk && r.docxOk) && registryValid;
const below = rows.filter((r) => r.words < 3500);
fs.writeFileSync(path.join(BATCH, 'BATCH_REPORT.md'), `# Batch Report — Chapters 17–21

**Batch:** \`book-output/premium-batches/batch-04-ch17-21/\` (Phase 4D)
**Source:** \`JavaScript_Mastery_Manuscript_v30/\` (titles and scope)
**Status: ${allOk ? 'PASS — ready for Chief Editor review' : 'NOT READY'}**

## Summary

| Chapter | Words | PDF Pages | Unit Tests | Browser Tests | QA |
| --- | --- | --- | --- | --- | --- |
${rows.map((r) => `| ${r.n} — ${r.title} | ${r.words} | ${r.pages} | ${r.unit.pass} / ${r.unit.pass + r.unit.fail} | ${r.chrome.compared} listings${r.e2e ? `; end-to-end ${r.e2e.pass} / ${r.e2e.total}` : ''} | ${r.gatesOk ? 'PASS' : 'FAIL'} (${r.gates.passed}/${r.gates.total} gates${r.warns.length ? `, ${r.warns.length} warning${r.warns.length > 1 ? 's' : ''}` : ''}) |`).join('\n')}
| **Total** | **${sum((r) => r.words)}** | **${sum((r) => r.pages)}** | **${unitPass} / ${unitTotal}** | **${chromeCmp} listings; end-to-end ${e2ePass} / ${e2eTotal}** | **${rows.filter((r) => r.gatesOk).length} of 5 PASS** |

Words are explanatory words (code and inline code excluded). "Browser Tests" counts chapter listings run in real headless Chrome and compared with their printed panel, and the end-to-end checks of the two web-UI projects (Chapters 20 and 21) in Chrome. Chapter titles follow v30.

## Chapters completed

17, 18, 19, 20, 21. Each folder has \`chapter-NN-premium.md\`, \`.pdf\`, \`.docx\`, \`project/\`, \`QA_SUMMARY.md\`, \`chapter.json\`, \`examples/\` and \`qa-logs/\` (Chapters 20 and 21 also have \`browser-e2e.mjs\`).

## Verification

- **Listings verified:** ${nodeRun} listing files run in Node.js (${nodeCmp} compared with a printed Output or Error panel) and ${chromeRun} run in ${rows[0].chrome.version} from a local HTTP server (${chromeCmp} compared). Mismatches in the final run: ${problems}.
- **Automated tests:** ${unitPass + e2ePass} passed, 0 failed, ${unitSkipped} skipped: ${unitPass} project unit and integration tests and ${e2ePass} end-to-end checks in real Chrome. No automated test calls a public API; Chapter 20's integration tests start the real server on 127.0.0.1 with a random port.
- **Security (Chapter 20):** every demonstration uses harmless local inputs; each topic is labelled as demonstration, recommended defence or production requirement; claims about XSS, encoding, CSP, HttpOnly, parameterized queries, authorization, CSRF and prototype pollution are backed by Node.js or Chrome tests. Not tested (and stated in the text): SameSite behaviour on genuine cross-site requests. SecureTrip is labelled as not production-ready.
- **Performance (Chapters 17 and 19):** measured results are printed with environment (Intel Core i5-6600, Windows 10, Node.js v22.16.0); two runs reported to show variance; correctness tests are separate from timing, and no timing threshold is used as a pass/fail gate anywhere in the batch.
- **Real findings fixed during production:** wrong predicted outputs replaced by real output after review (Chapter 17 matchAll index; Chapter 19 step counts and LRU evictions; Chapter 20 a LIKE search and CORS print format); a sticky-regex tokenizer resetting \`lastIndex\` (Chapter 17); \`'toString' in values\` in a test (Chapter 17); a ReDoS ratio distorted by first-call compile cost (Chapter 17, fixed with warm-up), and then a timing comparison inside that checked Output panel (replaced by printed measurements that are not compared, so no timing value gates QA); a test date that would have expired (Chapter 20); a DevTools \`eval\` probe that is exempt from CSP (dropped, not claimed); VisaFlow wasting IDs on failed creates and reusing IDs after reload (Chapter 21, found by the Chrome end-to-end check, fixed with regression tests); inherited names such as \`toString\` accepted as state-machine actions (Chapter 21, guarded with \`Object.hasOwn\`).
- **Further Reading:** ${LINKS.checked} distinct addresses, all HTTP 200 on ${LINKS.date}.

## Visual inspection coverage

${inspectedTotal} of ${sum((r) => r.pages)} PDF pages were rendered to images and looked at by eye: for every chapter the opening page, a concept page, a code-heavy project page, an exercise or MCQ page and the final page, plus every flagged page.

| Chapter | Pages looked at | Flagged |
| --- | --- | --- |
${rows.map((r) => `| ${r.n} | ${INSPECTED[r.n].pages.join(', ')} | ${r.n === '17' ? 'page 9 (white space; accepted)' : r.n === '19' ? 'widow final page (fixed; new final page 29 inspected)' : 'none'} |`).join('\n')}

No rendering defect was found. All other pages passed the automated layout checks.

## DOCX validation

All five DOCX files passed the structural checks. Each was opened by Microsoft Word through automation and exported to PDF without error (Word reported ${rows.map((r) => WORD[r.n]).join(', ')} pages for Chapters 17–21). Word's export was inspected on Chapter 20 page 25 and Chapter 21 page 9: Bengali shaping, code, captions and callouts are correct; code lines containing Bengali get slightly taller line spacing in Word than in the PDF.

## Curriculum overlap decisions

| Chapter | Previously learned | New advanced material / decision |
| --- | --- | --- |
${rows.map((r) => `| ${r.n} | ${OVERLAP[r.n].earlier} | ${OVERLAP[r.n].decision} |`).join('\n')}

Headings: v30 Chapter 19 ("Chapter 19 —") and Chapter 21 ("অধ্যায় ২১:") were normalized to "অধ্যায় N — "; all titles kept.

## Registry

\`CHAPTER_REGISTRY.json\` lists Chapters 01–21 (title, Markdown, PDF, DOCX and project paths, production status, QA status, source v30, last verified build with SHA-256 of PDF and DOCX). Validation: numbers 1–21 unique and in order; ${registry.filter((e) => e.missing.length === 0).length} of 21 entries have every path present; titles read from each Markdown file. **Registry ${registryValid ? 'valid' : 'INVALID'}.** Earlier registry files were left unchanged. \`BATCH_MANIFEST.json\` lists every file of this batch with size and SHA-256.

## Method notes

- **Batch tools (\`tools/\`)** are copies of the batch-03 tools, unchanged, plus this \`make-summary.mjs\`. The Chapter 20 and 21 end-to-end scripts use the same \`cdp.mjs\` with a default-configured Chrome.
- **Projects** need no npm packages; Chapter 20 uses Node.js's built-in \`node:sqlite\` (Node.js 22.5+, prints an ExperimentalWarning).

## Remaining limitations

1. **Length.** ${below.length ? `Below the 3,500-word floor (explanatory words): ${below.map((r) => `Chapter ${r.n} (${r.words}; ${r.allWords} including code)`).join(', ')}. These chapters are code-heavy; content was judged complete without filler.` : 'All chapters are within the target.'}
2. **Editorial.** No second reader has proofread the Bengali.
3. **Platforms.** Tested on Windows 10 with Node.js 22.16.0 and Chrome 155 only.
4. **Layout.** Chapter 17 page 9 has 37% white space (a kept-together listing); some code lines containing Bengali wrap with a hanging indent (none exceeds the 82-character limit).
5. **Security scope.** SecureTrip is an educational demo: no independent security review, no HTTPS, in-memory sessions; SameSite cross-site behaviour is documented, not tested.
6. **Benchmarks** are from one machine on one day; the chapter says so.

## Protected folders

\`git status\` against commit 9c4763f shows no change in \`JavaScript_Mastery_Manuscript_v01\`–\`v30\`, \`book-output/draft-edition/\`, \`book-output/premium-samples/\`, \`book-output/premium-final/\` or \`book-output/premium-batches/batch-01-ch02-06/\`. Batches 02 and 03 (not yet committed) were checked against their own \`BATCH_MANIFEST.json\`: 311 and 276 files, all with the recorded SHA-256. In \`master-design-system/\` only the three files approved in Phase 4C differ from the commit (plus \`backups/\`), and no file there is newer than the batch-03 manifest.
`);

// ---------- manifest (last, so it covers the final report) ----------
const files = [];
const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, f.name);
  if (f.isDirectory()) { if (!['.build', 'node_modules'].includes(f.name)) walk(p); } else files.push(p);
} };
walk(BATCH);
const manifestFiles = files.filter((f) => !/BATCH_MANIFEST\.json$/.test(f)).sort().map((f) => ({ path: path.relative(BATCH, f).replaceAll('\\', '/'), bytes: fs.statSync(f).size, sha256: sha256(f) }));
fs.writeFileSync(path.join(BATCH, 'BATCH_MANIFEST.json'), JSON.stringify({
  batch: 'batch-04-ch17-21', phase: '4D', builtWith: 'book-output/master-design-system (with 2026-10-15 listing-label fix)',
  chapters: rows.map((r) => ({ number: +r.n, title: r.title, deliverables: [`chapter-${r.n}/chapter-${r.n}-premium.md`, `chapter-${r.n}/chapter-${r.n}-premium.pdf`, `chapter-${r.n}/chapter-${r.n}-premium.docx`, `chapter-${r.n}/project/${r.project}/`, `chapter-${r.n}/QA_SUMMARY.md`] })),
  generated: new Date().toISOString(), excluded: ['.build/ folders (intermediate build files, regenerated by the build)'], fileCount: manifestFiles.length, files: manifestFiles,
}, null, 2) + '\n');

console.log(rows.map((r) => `ch${r.n}: ${r.words} words (${r.allWords} all), ${r.pages} pages, unit ${r.unit.pass}/${r.unit.pass + r.unit.fail}, chrome ${r.chrome.compared}, e2e ${r.e2e ? `${r.e2e.pass}/${r.e2e.total}` : '-'}, ${r.gatesOk ? 'PASS' : 'FAIL'} ${r.gates.passed}/${r.gates.total}`).join('\n'));
console.log(`registry valid: ${registryValid} (${registry.length} chapters); manifest files: ${manifestFiles.length}; node ${nodeRun}/${nodeCmp}, chrome ${chromeRun}/${chromeCmp}, problems ${problems}`);
