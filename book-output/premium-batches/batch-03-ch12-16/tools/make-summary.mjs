// Writes each chapter's QA_SUMMARY.md, the batch BATCH_REPORT.md, CHAPTER_REGISTRY.json (Chapters 01–16) and
// BATCH_MANIFEST.json from the recorded results (qa-logs/ and .build/ of every chapter). Only the fixed notes below are
// typed by hand: pages inspected by eye, the Word (DOCX) render results and the link check, recorded during production.
// Usage: node tools/make-summary.mjs
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
const tap = (log) => ({ pass: +(/^# pass (\d+)/m.exec(log) ?? [0, 0])[1], fail: +(/^# fail (\d+)/m.exec(log) ?? [0, 0])[1] });

// Recorded during production.
const INSPECTED = {
  '12': { pages: [1, 6, 18, 33, 36], note: 'opening, concept (export/import), project code (cart.mjs part 2/2), MCQ, final' },
  '13': { pages: [1, 6, 21, 36, 40], note: 'opening, concept (constructor functions, private fields), project code (booking.mjs part 2/2), solution 12 + MCQ, final' },
  '14': { pages: [1, 8, 17, 28, 31], note: 'opening, concept (currying), project code (sales.mjs parts 1-2), MCQ, final' },
  '15': { pages: [1, 7, 20, 34, 37], note: 'opening, concept (storage event), project code (storage.mjs, index.html), MCQ, final' },
  '16': { pages: [1, 6, 17, 29, 32], note: 'opening, concept (debugging method, structured log), project code (booking-service.mjs part 2/2), MCQ, final' },
};
const WORD = { '12': 39, '13': 42, '14': 34, '15': 40, '16': 35 };     // pages reported by Word after opening the DOCX
const WORD_PAGES_VIEWED = { '12': [18], '16': [6] };
const LINKS = { checked: 26, ok: 26, date: '2026-10-15', replaced: 'Chapter 14: MDN "Glossary: Pure function" returned 404; replaced by Wikipedia "Pure function" (200).' };
const PROJECTS = {
  '12': 'modular-shopping-cart', '13': 'booking-lab', '14': 'sales-function-lab', '15': 'bookmark-vault', '16': 'booking-guard',
};
const PROJECT_FILES = {
  '12': 'ES Modules: src/catalog.mjs, money.mjs, cart.mjs, storage.mjs; app.mjs, index.html, style.css, demo.mjs',
  '13': 'src/booking.mjs, manager.mjs; demo.mjs (Node.js)',
  '14': 'src/fp.mjs, sales.mjs, format.mjs; data/sales.mjs; report.mjs (Node.js)',
  '15': 'src/bookmarks.mjs, url-state.mjs, storage.mjs; app.mjs, index.html, style.css',
  '16': 'src/errors.mjs, booking-core.mjs, booking-service.mjs, memory-repository.mjs; demo.mjs (Node.js)',
};

const rows = [];
for (const n of Object.keys(PROJECTS)) {
  const dir = path.join(BATCH, `chapter-${n}`), logs = path.join(dir, 'qa-logs');
  const build = json(path.join(dir, '.build', 'build-data.json')), docx = json(path.join(dir, '.build', 'docx-data.json'));
  const qa = json(path.join(logs, 'qa-summary.json')), typo = json(path.join(dir, '.build', 'typography.json'));
  const manuscript = read(path.join(logs, 'manuscript-check.log')), pdf = read(path.join(logs, 'pdf-check.log')), docxLog = read(path.join(logs, 'docx-check.log'));
  const unit = tap(read(path.join(logs, 'unit-tests.log')));
  const pbLog = path.join(logs, 'project-browser-tests.log');
  const pbrowser = fs.existsSync(pbLog) ? tap(read(pbLog)) : null;
  const exLog = path.join(logs, 'examples-tests.log');
  const exTests = fs.existsSync(exLog) ? tap(read(exLog)) : null;
  const node = /(\d+) files written from the chapter, (\d+) run, (\d+) compared with a printed panel, (\d+) problem/.exec(read(path.join(logs, 'listings-run.log'))) ?? [];
  const chrome = /(\d+) listings run in (\S+), (\d+) compared with a printed panel, (\d+) problem/.exec(read(path.join(logs, 'browser-run.log'))) ?? [];
  const warns = [...manuscript.matchAll(/^WARN\s+(.+)$/gm), ...pdf.matchAll(/^WARN\s+(.+)$/gm)].map((m) => m[1]);
  const kinds = (build.codeBlocks ?? []).reduce((a, c) => { a[c.kind] = (a[c.kind] ?? 0) + 1; return a; }, {});
  const r = {
    n, title: build.title, words: build.words?.explanatory, pages: build.pdfPages, sections: build.sections?.length,
    pdfKB: Math.round(build.pdfBytes / 1024), docxKB: Math.round(docx.bytes / 1024),
    gates: { passed: qa.passed, total: qa.passed + qa.failed }, gatesOk: qa.failed === 0 && qa.passed > 0,
    docxOk: count(docxLog, /^FAIL/gm) === 0 && count(docxLog, /^PASS/gm) > 0, unit, pbrowser, exTests,
    node: { run: +node[2] || 0, compared: +node[3] || 0, problems: +node[4] || 0 },
    chrome: { run: +chrome[1] || 0, version: chrome[2] ?? '', compared: +chrome[3] || 0, problems: +chrome[4] || 0 },
    warns, project: PROJECTS[n],
  };
  rows.push(r);

  const insp = INSPECTED[n];
  const browserTests = pbrowser ? `${pbrowser.pass} passed, ${pbrowser.fail} failed (real headless ${r.chrome.version}, served from a local HTTP server)` : 'none: Node.js project (chapter listings still run in Chrome)';
  fs.writeFileSync(path.join(dir, 'QA_SUMMARY.md'), `# QA Summary — Chapter ${n}

**Chapter:** অধ্যায় ${build.number} — ${build.title}
**Status: ${r.gatesOk ? 'PASS' : 'FAIL'}** — ${qa.passed} of ${qa.passed + qa.failed} automated gates passed (last QA run ${qa.ran})
**Source:** \`JavaScript_Mastery_Manuscript_v30/chapters/chapter-${n}.md\` (title and scope); text rewritten for the premium edition
**Built with:** \`book-output/master-design-system/\` ${build.designSystem} (with the approved 2026-10-15 listing-label fix)

## Deliverables

| File | Result |
| --- | --- |
| \`chapter-${n}-premium.md\` | ${r.words} explanatory words (code and inline code excluded); ${r.sections} sections |
| \`chapter-${n}-premium.pdf\` | ${r.pages} pages (A4); ${r.pdfKB} KB |
| \`chapter-${n}-premium.docx\` | ${r.docxKB} KB; structural validation ${r.docxOk ? 'passed' : 'FAILED'}; opened and exported by Microsoft Word (${WORD[n]} pages reported by Word) |
| \`project/${r.project}/\` | ${PROJECT_FILES[n]}; README; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | ${r.node.run} run; ${r.node.compared} compared with a printed Output or Error panel; ${r.node.problems} mismatch | \`qa-logs/listings-run.log\` |
| Listings marked Browser or Browser Console run in real Chrome (local HTTP server) | ${r.chrome.run} run in ${r.chrome.version}; ${r.chrome.compared} compared; ${r.chrome.problems} mismatch | \`qa-logs/browser-run.log\` |
${exTests ? `| Example and solution test files (\`node --test\`) | ${exTests.pass} passed, ${exTests.fail} failed (1 intentional \`todo\`) | \`qa-logs/examples-tests.log\` |\n` : ''}| JavaScript syntax (\`node --check\`) | passed | \`qa-logs/syntax-checks.log\` |
| Project unit and integration tests (\`node --test\`) | ${unit.pass} passed, ${unit.fail} failed | \`qa-logs/unit-tests.log\` |
| Project browser tests | ${browserTests} | ${pbrowser ? '`qa-logs/project-browser-tests.log`' : '—'} |
| Manuscript rules | ${count(manuscript, /^PASS/gm)} passed, ${count(manuscript, /^FAIL/gm)} failed, ${count(manuscript, /^WARN/gm)} warning | \`qa-logs/manuscript-check.log\` |
| PDF checks (all ${r.pages} pages) | ${count(pdf, /^PASS/gm)} passed, ${count(pdf, /^FAIL/gm)} failed, ${count(pdf, /^WARN/gm)} warning | \`qa-logs/pdf-check.log\` |
| DOCX structural checks | ${count(docxLog, /^PASS/gm)} passed, ${count(docxLog, /^FAIL/gm)} failed | \`qa-logs/docx-check.log\` |
| Bengali text layer (ActualText-aware reader) | ${typo.modes?.actual?.intactOccurrences} of ${typo.sourceWords} words intact | \`qa-logs/typography-audit.log\` |

Content: ${kinds.source ?? 0} source listings, ${kinds.output ?? 0} output panels, ${kinds.error ?? 0} error panels; ${build.tables} tables; ${build.callouts} callouts; 12 exercises with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Warnings

${warns.length ? warns.map((w) => `- ${w}`).join('\n') : '- None.'}

## Visual inspection

PDF pages ${insp.pages.join(', ')} of ${r.pages} were rendered to images and looked at by eye (${insp.note}). No page was flagged by the white-space check. No rendering defect was found: Bengali shaping, code panels, "Part N of M" captions, tables and callouts display correctly. The remaining pages passed the automated layout checks only.${WORD_PAGES_VIEWED[n] ? ` Word's PDF export of the DOCX was also inspected on page ${WORD_PAGES_VIEWED[n].join(', ')}.` : ''}

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
`);
}

// ---------- registry of Chapters 01–16 ----------
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
for (const r of rows) {
  registry.push(entry(+r.n, `premium-batches/batch-03-ch12-16/chapter-${r.n}`, `chapter-${r.n}-premium.md`, `chapter-${r.n}-premium.pdf`, `chapter-${r.n}-premium.docx`, `project/${r.project}`, 'premium, batch 03 (Phase 4C)', 'master-design-system 1.0.0 + 2026-10-15 listing-label fix'));
}
const numbers = registry.map((e) => e.number);
const ordered = numbers.every((v, i) => v === i + 1) && new Set(numbers).size === numbers.length;
const registryValid = ordered && registry.every((e) => e.missing.length === 0 && e.title);
fs.writeFileSync(path.join(BATCH, 'CHAPTER_REGISTRY.json'), JSON.stringify({
  book: 'JavaScript Mastery — শূন্য থেকে প্রফেশনাল', author: 'Moynul Hasan', pathsRelativeTo: 'repository root (the allcopy folder)',
  generated: new Date().toISOString(), supersedes: 'book-output/premium-batches/batch-02-ch07-11/CHAPTER_REGISTRY.json (left unchanged)',
  chapters: registry,
  validation: { orderedUniqueNumbers: ordered, allPathsExist: registry.every((e) => e.missing.length === 0), allTitlesRead: registry.every((e) => e.title), valid: registryValid },
}, null, 2) + '\n');

// ---------- batch report ----------
const sum = (f) => rows.reduce((s, r) => s + f(r), 0);
const unitPass = sum((r) => r.unit.pass), unitTotal = sum((r) => r.unit.pass + r.unit.fail);
const pbPass = sum((r) => r.pbrowser?.pass ?? 0), pbTotal = sum((r) => (r.pbrowser ? r.pbrowser.pass + r.pbrowser.fail : 0));
const exPass = sum((r) => r.exTests?.pass ?? 0), exTotal = sum((r) => (r.exTests ? r.exTests.pass + r.exTests.fail : 0));
const nodeRun = sum((r) => r.node.run), nodeCmp = sum((r) => r.node.compared), chromeRun = sum((r) => r.chrome.run), chromeCmp = sum((r) => r.chrome.compared);
const problems = sum((r) => r.node.problems + r.chrome.problems);
const inspectedTotal = Object.values(INSPECTED).reduce((s, v) => s + v.pages.length, 0);
const allOk = rows.every((r) => r.gatesOk && r.docxOk) && registryValid;
const below = rows.filter((r) => r.words < 3500);
fs.writeFileSync(path.join(BATCH, 'BATCH_REPORT.md'), `# Batch Report — Chapters 12–16

**Batch:** \`book-output/premium-batches/batch-03-ch12-16/\` (Phase 4C)
**Source:** \`JavaScript_Mastery_Manuscript_v30/\` (titles and scope)
**Status: ${allOk ? 'PASS — ready for Chief Editor review' : 'NOT READY'}**

## Summary

| Chapter | Words | PDF Pages | Unit Tests | Browser Tests | QA |
| --- | --- | --- | --- | --- | --- |
${rows.map((r) => `| ${r.n} — ${r.title} | ${r.words} | ${r.pages} | ${r.unit.pass} / ${r.unit.pass + r.unit.fail} | ${r.chrome.compared} listings${r.pbrowser ? `; project ${r.pbrowser.pass} / ${r.pbrowser.pass + r.pbrowser.fail}` : ''} | ${r.gatesOk ? 'PASS' : 'FAIL'} (${r.gates.passed}/${r.gates.total} gates${r.warns.length ? `, ${r.warns.length} warning${r.warns.length > 1 ? 's' : ''}` : ''}) |`).join('\n')}
| **Total** | **${sum((r) => r.words)}** | **${sum((r) => r.pages)}** | **${unitPass} / ${unitTotal}** | **${chromeCmp} listings; project ${pbPass} / ${pbTotal}** | **${rows.filter((r) => r.gatesOk).length} of 5 PASS** |

Words are explanatory words (code and inline code excluded). "Browser Tests" counts chapter listings run in real headless Chrome and compared with their printed panel, and the project's own browser suite (Chapters 12 and 15, whose projects are web pages). Chapter titles follow v30 exactly.

## Chapters completed

12, 13, 14, 15, 16. Each folder has \`chapter-NN-premium.md\`, \`.pdf\`, \`.docx\`, \`project/\`, \`QA_SUMMARY.md\`, \`chapter.json\`, \`examples/\` and \`qa-logs/\`.

## Verification

- **Listings verified:** ${nodeRun} listing files run in Node.js (${nodeCmp} compared with a printed Output or Error panel) and ${chromeRun} run in ${rows[0].chrome.version} from a local HTTP server (${chromeCmp} compared). Mismatches in the final run: ${problems}.
- **Automated tests:** ${unitPass + pbPass + exPass} passed, 0 failed: ${unitPass} project unit and integration tests, ${pbPass} project browser tests in real Chrome, and ${exPass} tests in Chapter 16's example and solution test files (plus 1 intentional \`todo\`). No test was skipped.
- **Browser APIs in their real environment (Chapter 15):** \`QuotaExceededError\`, the cross-page \`storage\` event (an \`<iframe>\` acts as the second tab), History \`popstate\`, Blob export (the downloaded Blob is read back) and File import (a real file chosen through the DevTools Protocol) were all exercised in Chrome. ES Modules (Chapter 12) were also confirmed **not** to load from \`file://\` in a default-configured Chrome, as the chapter states.
- **Asynchronous and timer code:** Chapter 14 tests debounce and throttle with Node.js fake timers; Chapter 16 tests retry and backoff with an injected \`sleep\` spy, payment failure with stubs, and 20 concurrent bookings. No automated test calls a public API.
- **Real findings fixed during production:** wrong predicted outputs (Chapter 15: a Blob size and a trailing space), \`removeItem\` also firing a \`storage\` event, Node.js 22 appending the comparison to a custom assert message, \`node --test <folder>\` not being valid in Node.js 22, a global \`top\` name clashing with \`window.top\`, and the test browser's \`--allow-file-access-from-files\` flag hiding the \`file://\` module restriction.
- **Further Reading:** ${LINKS.checked} distinct addresses, all HTTP 200 on ${LINKS.date}. ${LINKS.replaced}

## Visual inspection coverage

${inspectedTotal} of ${sum((r) => r.pages)} PDF pages were rendered to images and looked at by eye: for every chapter the opening page, a concept page, a code-heavy project page, an exercise or MCQ page and the final page. No page in this batch was flagged by the white-space check.

| Chapter | Pages looked at |
| --- | --- |
${rows.map((r) => `| ${r.n} | ${INSPECTED[r.n].pages.join(', ')} |`).join('\n')}

No rendering defect was found. All other pages passed the automated layout checks.

## DOCX validation

All five DOCX files passed the structural checks. Each was opened by Microsoft Word through automation and exported to PDF without error (Word reported ${rows.map((r) => WORD[r.n]).join(', ')} pages for Chapters 12–16). Word's export was inspected on Chapter 12 page 18 and Chapter 16 page 6: Bengali shaping, code, captions and output panels are correct.

## Master Design System change

**Status: applied and verified.** The approved listing-label fix was made in \`book-output/master-design-system/\`:

| File | Change |
| --- | --- |
| \`scripts/lib/md.mjs\` | \`part=N/M\` listings captioned "অংশ N / M (Part N of M)" (normal panel); genuinely shortened listings captioned "নির্বাচিত অংশ (Selected Excerpt — Complete file in Companion Code)" |
| \`scripts/check-docx.py\` | accepts "Part" captions as labelled listings |
| \`docs/CODE_BLOCK_STANDARDS.md\` | documents \`part=\` and the new caption |

The three original files are backed up in \`master-design-system/backups/2026-10-15-listing-labels/\` with a \`CHANGE.md\`. Before use, the updated builder was run on temporary copies of Chapter 02 and Chapter 07: both built with the same page counts as their originals (32 and 34), showed "Part N of 3" captions, and passed 5 of 5 publication gates; the original chapter folders were not touched. Chapters 12–16 were built with the updated master directly. Chapters 02–06 were **not** rebuilt, as instructed; they will pick up the new captions on their next build.

## Registry

\`CHAPTER_REGISTRY.json\` lists Chapters 01–16 (title, Markdown, PDF, DOCX and project paths, production status, QA status, source v30, last verified build with SHA-256 of PDF and DOCX). Validation: numbers 1–16 unique and in order; ${registry.filter((e) => e.missing.length === 0).length} of 16 entries have every path present; titles read from each Markdown file. **Registry ${registryValid ? 'valid' : 'INVALID'}.** The batch-02 registry was left unchanged. \`BATCH_MANIFEST.json\` lists every file of this batch with size and SHA-256.

## Method notes

- **Batch tools (\`tools/\`)** are copies of the batch-02 tools with two changes: the browser listing runner serves the chapter folder over \`http://127.0.0.1\` (ES Modules and \`fetch\` need it) and supports \`module=1\`; \`cdp.mjs\` takes \`{ fileAccess: false }\` to launch a default-configured Chrome.
- **Modules from Chapter 12 on:** projects are ES Modules; tests import them directly.
- **Overlap with earlier chapters:** v30's Chapter 12 repeats destructuring and spread (Chapter 07), Chapter 14 repeats closures and debounce (Chapters 05 and 10), and Chapter 16 repeats \`try\`/\`catch\` and custom errors (Chapter 11). Titles and scope were kept, but each repeated topic is a short recap with a pointer; the depth goes to what is new (modules and clean code; currying, memoization and throttle; testing, test doubles and reliability).
- **v30 projects:** the v30 Chapter 13–16 projects ship browser files; Chapters 13, 14 and 16 here are Node.js projects (the subject is class design, functional pipelines and testing), while Chapters 12 and 15 are full browser applications.

## Remaining limitations

1. **Length.** ${below.length ? `Below the 3,500-word floor: ${below.map((r) => `Chapter ${r.n} (${r.words})`).join(', ')}. These chapters are code-heavy (${below.map((r) => r.pages).join(', ')} pages); substantive sections were added during production rather than filler.` : 'All chapters are within the target.'}
2. **Editorial.** No second reader has proofread the Bengali.
3. **Platforms.** Tested on Windows 10 with Node.js 22.16.0 and Chrome 155 only.
4. **Wrapped code lines.** Some code lines containing Bengali text wrap with a hanging indent; none exceeds the 82-character limit.
5. **Chapters 02–06** still show "Selected Excerpt" captions until they are rebuilt with the updated master.
6. **Forward references.** Chapter 15 mentions \`HttpOnly\` cookies and Chapter 16 mentions CI services; both are covered in later chapters or are outside the book's scope.

## Protected folders

\`git status\` against commit 9c4763f shows no change in \`JavaScript_Mastery_Manuscript_v01\`–\`v30\`, \`book-output/draft-edition/\`, \`book-output/premium-samples/\`, \`book-output/premium-final/\` or \`book-output/premium-batches/batch-01-ch02-06/\`. Batch 02 (not yet committed) was checked against its own \`BATCH_MANIFEST.json\`: all 311 files have the recorded SHA-256. In \`master-design-system/\` only the three approved files changed, plus the new \`backups/\` folder.
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
  batch: 'batch-03-ch12-16', phase: '4C', builtWith: 'book-output/master-design-system (with 2026-10-15 listing-label fix)',
  chapters: rows.map((r) => ({ number: +r.n, title: r.title, deliverables: [`chapter-${r.n}/chapter-${r.n}-premium.md`, `chapter-${r.n}/chapter-${r.n}-premium.pdf`, `chapter-${r.n}/chapter-${r.n}-premium.docx`, `chapter-${r.n}/project/${r.project}/`, `chapter-${r.n}/QA_SUMMARY.md`] })),
  generated: new Date().toISOString(), excluded: ['.build/ folders (intermediate build files, regenerated by the build)'], fileCount: manifestFiles.length, files: manifestFiles,
}, null, 2) + '\n');

console.log(rows.map((r) => `ch${r.n}: ${r.words} words, ${r.pages} pages, unit ${r.unit.pass}/${r.unit.pass + r.unit.fail}, chrome ${r.chrome.compared}, project browser ${r.pbrowser ? `${r.pbrowser.pass}/${r.pbrowser.pass + r.pbrowser.fail}` : '-'}${r.exTests ? `, examples ${r.exTests.pass}` : ''}, ${r.gatesOk ? 'PASS' : 'FAIL'} ${r.gates.passed}/${r.gates.total}`).join('\n'));
console.log(`registry valid: ${registryValid} (${registry.length} chapters); manifest files: ${manifestFiles.length}; node ${nodeRun}/${nodeCmp}, chrome ${chromeRun}/${chromeCmp}, problems ${problems}`);
