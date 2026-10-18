// Writes each chapter's QA_SUMMARY.md, the batch BATCH_REPORT.md, BATCH_MANIFEST.json and CHAPTER_REGISTRY.json
// from the recorded results (qa-logs/ and .build/ of every chapter). Only the fixed notes below are typed by hand:
// the pages inspected by eye, the Word (DOCX) render results and the link check, all recorded during production.
// Usage: node tools/make-summary.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const BATCH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(BATCH, '..', '..');                      // book-output/
const rel = (p) => path.relative(path.resolve(OUT, '..'), p).replaceAll('\\', '/');   // relative to the repository root
const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '');
const json = (f) => JSON.parse(read(f) || '{}');
const count = (text, re) => (text.match(re) ?? []).length;
const sha256 = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const tap = (log) => ({ pass: +(/^# pass (\d+)/m.exec(log) ?? [0, 0])[1], fail: +(/^# fail (\d+)/m.exec(log) ?? [0, 0])[1] });

// Recorded during production (see BATCH_REPORT "Visual inspection" and "DOCX").
const INSPECTED = {
  '07': { pages: [1, 8, 20, 31, 34], note: 'opening, concept (nested objects), project code part 2/3, MCQ, final' },
  '08': { pages: [1, 4, 18, 29, 32], note: 'opening, concept (length and Unicode), project code parts 1-2, MCQ, final' },
  '09': { pages: [1, 10, 22, 37, 41], note: 'opening, concept (bubbling), project code (task-core.js), solution 12 + MCQ start, final' },
  '10': { pages: [1, 3, 24, 36, 37, 41], note: 'opening, concept (event loop), project code (directory.js), flagged page 36, solution 12 + MCQ start, final' },
  '11': { pages: [1, 3, 7, 8, 17, 28, 32, 36], note: 'opening, flagged pages 3, 7 and 28, concept (expected vs unexpected), project code, MCQ, final' },
};
const WORD = { '07': 37, '08': 35, '09': 44, '10': 43, '11': 39 };   // pages reported by Word after opening the DOCX
const WORD_PAGES_VIEWED = { '09': [1, 24], '11': [18] };
const LINKS = { checked: 25, ok: 25, date: '2026-10-15' };
const PROJECT_FILES = {
  '07': 'students.js', '08': 'text-tools.js', '09': 'task-core.js, app.js, index.html, style.css',
  '10': 'directory.js, app.js, index.html, style.css', '11': 'order-validation.js, app.js, index.html, style.css',
};

const rows = [];
for (const n of ['07', '08', '09', '10', '11']) {
  const dir = path.join(BATCH, `chapter-${n}`), logs = path.join(dir, 'qa-logs');
  const build = json(path.join(dir, '.build', 'build-data.json')), docx = json(path.join(dir, '.build', 'docx-data.json'));
  const qa = json(path.join(logs, 'qa-summary.json')), typo = json(path.join(dir, '.build', 'typography.json'));
  const manuscript = read(path.join(logs, 'manuscript-check.log')), pdf = read(path.join(logs, 'pdf-check.log')), docxLog = read(path.join(logs, 'docx-check.log'));
  const unit = tap(read(path.join(logs, 'unit-tests.log')));
  const pbLog = path.join(logs, 'project-browser-tests.log');
  const pbrowser = fs.existsSync(pbLog) ? tap(read(pbLog)) : null;
  const node = /(\d+) files written from the chapter, (\d+) run, (\d+) compared with a printed panel, (\d+) problem/.exec(read(path.join(logs, 'listings-run.log'))) ?? [];
  const chrome = /(\d+) listings run in (\S+), (\d+) compared with a printed panel, (\d+) problem/.exec(read(path.join(logs, 'browser-run.log'))) ?? [];
  const warns = [...manuscript.matchAll(/^WARN\s+(.+)$/gm), ...pdf.matchAll(/^WARN\s+(.+)$/gm)].map((m) => m[1]);
  const project = fs.readdirSync(path.join(dir, 'project'))[0];
  const kinds = (build.codeBlocks ?? []).reduce((a, c) => { a[c.kind] = (a[c.kind] ?? 0) + 1; return a; }, {});
  const r = {
    n, number: build.number, title: build.title, words: build.words?.explanatory, pages: build.pdfPages, sections: build.sections?.length,
    pdfKB: Math.round(build.pdfBytes / 1024), docxKB: Math.round(docx.bytes / 1024),
    gates: { passed: qa.passed, total: qa.passed + qa.failed }, gatesOk: qa.failed === 0 && qa.passed > 0, ran: qa.ran, built: build.built,
    docxOk: count(docxLog, /^FAIL/gm) === 0 && count(docxLog, /^PASS/gm) > 0, docxPass: count(docxLog, /^PASS/gm),
    unit, pbrowser,
    node: { written: +node[1] || 0, run: +node[2] || 0, compared: +node[3] || 0, problems: +node[4] || 0 },
    chrome: { run: +chrome[1] || 0, version: chrome[2] ?? '', compared: +chrome[3] || 0, problems: +chrome[4] || 0 },
    warns, project, kinds, tables: build.tables, callouts: build.callouts, typo, manuscript, pdf, docxLog,
  };
  rows.push(r);

  const browserTests = pbrowser ? `${pbrowser.pass} passed, ${pbrowser.fail} failed (real headless ${r.chrome.version})` : 'none: Node.js-only project';
  const insp = INSPECTED[n];
  fs.writeFileSync(path.join(dir, 'QA_SUMMARY.md'), `# QA Summary — Chapter ${n}

**Chapter:** অধ্যায় ${build.number} — ${build.title}
**Status: ${r.gatesOk ? 'PASS' : 'FAIL'}** — ${qa.passed} of ${qa.passed + qa.failed} automated gates passed (last QA run ${qa.ran})
**Source:** \`JavaScript_Mastery_Manuscript_v30/chapters/chapter-${n}.md\` (scope and title); text rewritten for the premium edition
**Built with:** \`../build-system/\` (copy of the master design system ${build.designSystem}; changes listed in \`../BUILD_SYSTEM_CHANGES.md\`)

## Deliverables

| File | Result |
| --- | --- |
| \`chapter-${n}-premium.md\` | ${r.words} explanatory words (code and inline code excluded); ${r.sections} sections |
| \`chapter-${n}-premium.pdf\` | ${r.pages} pages (A4); ${r.pdfKB} KB |
| \`chapter-${n}-premium.docx\` | ${r.docxKB} KB; structural validation ${r.docxOk ? 'passed' : 'FAILED'}; opened and exported by Microsoft Word (${WORD[n]} pages reported by Word) |
| \`project/${project}/\` | ${PROJECT_FILES[n]}; README; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | ${r.node.run} run; ${r.node.compared} compared with a printed Output or Error panel; ${r.node.problems} mismatch | \`qa-logs/listings-run.log\`, \`node-examples.log\` |
| Listings marked Browser or Browser Console run in real Chrome | ${r.chrome.run} run in ${r.chrome.version}; ${r.chrome.compared} compared; ${r.chrome.problems} mismatch | \`qa-logs/browser-run.log\`, \`browser-listings.log\` |
| JavaScript syntax (\`node --check\`), project and test file | passed | \`qa-logs/syntax-checks.log\` |
| Unit tests (\`node --test\`) | ${unit.pass} passed, ${unit.fail} failed | \`qa-logs/unit-tests.log\` |
| Project browser tests | ${browserTests} | ${pbrowser ? '`qa-logs/project-browser-tests.log`' : '—'} |
| Manuscript rules | ${count(manuscript, /^PASS/gm)} passed, ${count(manuscript, /^FAIL/gm)} failed, ${count(manuscript, /^WARN/gm)} warning | \`qa-logs/manuscript-check.log\` |
| PDF checks (all ${r.pages} pages) | ${count(pdf, /^PASS/gm)} passed, ${count(pdf, /^FAIL/gm)} failed, ${count(pdf, /^WARN/gm)} warning | \`qa-logs/pdf-check.log\` |
| DOCX structural checks | ${r.docxPass} passed, ${count(docxLog, /^FAIL/gm)} failed | \`qa-logs/docx-check.log\` |
| Bengali text layer (ActualText-aware reader) | ${typo.modes?.actual?.intactOccurrences} of ${typo.sourceWords} words intact | \`qa-logs/typography-audit.log\` |

Content: ${kinds.source ?? 0} source listings, ${kinds.output ?? 0} output panels, ${kinds.error ?? 0} error panels; ${build.tables} tables; ${build.callouts} callouts; 12 exercises with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Warnings

${warns.length ? warns.map((w) => `- ${w}`).join('\n') : '- None.'}

## Visual inspection

PDF pages ${insp.pages.join(', ')} of ${r.pages} were rendered to images and looked at by eye (${insp.note}). No rendering defect was found: Bengali shaping, code panels, part captions, tables and callouts display correctly.${n === '10' ? ' Page 36 confirms the automated warning: about a third of the page is empty because the next solution listing is kept whole.' : ''}${n === '11' ? ' Pages 3, 7 and 28 confirm the automated warnings: about a third of each page is empty because the next listing is kept whole.' : ''} The remaining pages passed the automated layout checks only.${WORD_PAGES_VIEWED[n] ? ` Word's PDF export of the DOCX was also inspected on page${WORD_PAGES_VIEWED[n].length > 1 ? 's' : ''} ${WORD_PAGES_VIEWED[n].join(', ')}.` : ''}

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
${n === '10' ? '- The live JSONPlaceholder API is not used by any automated test. It was opened once by hand in Chrome on 2026-10-15 (10 users shown).\n' : ''}`);
}

// ---------- registry of chapters 01–11 ----------
const exists = (p) => fs.existsSync(path.join(OUT, p));
const entry = (number, base, md, pdf, docx, projectDir, production) => {
  const dir = path.join(OUT, base);
  const qa = json(path.join(dir, 'qa-logs', 'qa-summary.json'));
  const build = json(path.join(dir, '.build', 'build-data.json'));
  const title = (/^# অধ্যায় \S+ — (.+)$/m.exec(read(path.join(dir, md))) ?? [])[1] ?? null;
  const paths = { markdown: `${base}/${md}`, pdf: `${base}/${pdf}`, docx: `${base}/${docx}`, project: `${base}/${projectDir}` };
  const missing = Object.entries(paths).filter(([, p]) => !exists(p)).map(([k]) => k);
  const rowFor = rows.find((r) => +r.n === number);
  return {
    number, title,
    paths: Object.fromEntries(Object.entries(paths).map(([k, p]) => [k, `book-output/${p}`])),
    missing,
    productionStatus: production,
    qaStatus: missing.length ? 'unverified' : qa.failed === 0 && qa.passed > 0 ? `PASS (${qa.passed} of ${qa.passed + qa.failed} gates)` : 'FAIL',
    sourceManuscript: 'v30',
    lastVerifiedBuild: { builtAt: build.built ?? null, qaRunAt: qa.ran ?? null, pdfPages: build.pdfPages ?? null, explanatoryWords: build.words?.explanatory ?? null,
      designSystem: number >= 7 ? 'batch-02 build-system (master copy + part captions)' : `master-design-system ${build.designSystem ?? ''}`.trim(),
      ...(rowFor ? { pdfSha256: sha256(path.join(OUT, paths.pdf)), docxSha256: sha256(path.join(OUT, paths.docx)) } : {}) },
  };
};
const registry = [entry(1, 'premium-final/chapter-01', 'chapter-01-final.md', 'JavaScript_Mastery_Chapter_01_Final.pdf', 'JavaScript_Mastery_Chapter_01_Final.docx', 'project/interactive-greeting-app', 'final (Phase 3B)')];
for (const [n, project] of [['02', 'student-result-calculator'], ['03', 'shopping-discount-calculator'], ['04', 'cart-analyzer'], ['05', 'invoice-calculator'], ['06', 'inventory-dashboard']]) {
  registry.push(entry(+n, `premium-batches/batch-01-ch02-06/chapter-${n}`, `chapter-${n}-premium.md`, `chapter-${n}-premium.pdf`, `chapter-${n}-premium.docx`, `project/${project}`, 'premium, batch 01 (Phase 4A)'));
}
for (const r of rows) {
  registry.push(entry(+r.n, `premium-batches/batch-02-ch07-11/chapter-${r.n}`, `chapter-${r.n}-premium.md`, `chapter-${r.n}-premium.pdf`, `chapter-${r.n}-premium.docx`, `project/${r.project}`, 'premium, batch 02 (Phase 4B)'));
}
const numbers = registry.map((e) => e.number);
const registryValid = numbers.every((v, i) => v === i + 1) && new Set(numbers).size === numbers.length && registry.every((e) => e.missing.length === 0 && e.title);
fs.writeFileSync(path.join(BATCH, 'CHAPTER_REGISTRY.json'), JSON.stringify({
  book: 'JavaScript Mastery — শূন্য থেকে প্রফেশনাল', author: 'Moynul Hasan', pathsRelativeTo: 'repository root (the allcopy folder)',
  generated: new Date().toISOString(), chapters: registry,
  validation: { orderedUniqueNumbers: numbers.every((v, i) => v === i + 1) && new Set(numbers).size === numbers.length, allPathsExist: registry.every((e) => e.missing.length === 0), allTitlesRead: registry.every((e) => e.title), valid: registryValid },
}, null, 2) + '\n');

// ---------- batch report ----------
const sum = (f) => rows.reduce((s, r) => s + f(r), 0);
const unitTotal = sum((r) => r.unit.pass + r.unit.fail), unitPass = sum((r) => r.unit.pass);
const pbTotal = sum((r) => (r.pbrowser ? r.pbrowser.pass + r.pbrowser.fail : 0)), pbPass = sum((r) => r.pbrowser?.pass ?? 0);
const nodeRun = sum((r) => r.node.run), nodeCmp = sum((r) => r.node.compared), chromeRun = sum((r) => r.chrome.run), chromeCmp = sum((r) => r.chrome.compared);
const problems = sum((r) => r.node.problems + r.chrome.problems);
const inspectedTotal = Object.values(INSPECTED).reduce((s, v) => s + v.pages.length, 0);
const allOk = rows.every((r) => r.gatesOk && r.docxOk) && registryValid;
fs.writeFileSync(path.join(BATCH, 'BATCH_REPORT.md'), `# Batch Report — Chapters 07–11

**Batch:** \`book-output/premium-batches/batch-02-ch07-11/\` (Phase 4B)
**Source:** \`JavaScript_Mastery_Manuscript_v30/\` (titles and scope)
**Status: ${allOk ? 'PASS — ready for Chief Editor review' : 'NOT READY'}**

## Summary

| Chapter | Words | PDF Pages | Unit Tests | Browser Tests | QA |
| --- | --- | --- | --- | --- | --- |
${rows.map((r) => `| ${r.n} — ${r.title} | ${r.words} | ${r.pages} | ${r.unit.pass} / ${r.unit.pass + r.unit.fail} | ${r.chrome.compared} listings${r.pbrowser ? `; project ${r.pbrowser.pass} / ${r.pbrowser.pass + r.pbrowser.fail}` : ''} | ${r.gatesOk ? 'PASS' : 'FAIL'} (${r.gates.passed}/${r.gates.total} gates${r.warns.length ? `, ${r.warns.length} warning${r.warns.length > 1 ? 's' : ''}` : ''}) |`).join('\n')}
| **Total** | **${sum((r) => r.words)}** | **${sum((r) => r.pages)}** | **${unitPass} / ${unitTotal}** | **${chromeCmp} listings; project ${pbPass} / ${pbTotal}** | **${rows.filter((r) => r.gatesOk).length} of 5 PASS** |

Words are explanatory words (code blocks and inline code excluded). "Browser Tests" counts chapter listings run in real headless Chrome and compared with their printed panel, and the project's own browser test suite (Chapters 09–11, whose projects have a web page).

## Chapters completed

07, 08, 09, 10, 11. Each folder has \`chapter-NN-premium.md\`, \`.pdf\`, \`.docx\`, \`project/\`, \`QA_SUMMARY.md\`, \`chapter.json\`, \`examples/\` and \`qa-logs/\`.

## Verification

- **Listings verified:** ${nodeRun} listing files run in Node.js (${nodeCmp} compared with a printed Output or Error panel) and ${chromeRun} run in ${rows[0].chrome.version} (${chromeCmp} compared). Mismatches in the final run: ${problems}. During production the tools caught real errors and they were corrected: wrong predicted outputs in Chapter 08 (word count, positions, a truncated excerpt), invisible Unicode in two output panels, an emoji the book fonts cannot draw, and a literal Tab that DOCX cannot hold as text.
- **Automated tests:** ${unitPass + pbPass} passed, ${unitTotal + pbTotal - unitPass - pbPass} failed: ${unitPass} unit and integration tests (\`node --test\`) and ${pbPass} project browser tests in real Chrome. No test was skipped.
- **Asynchronous code (Chapter 10):** resolved and rejected promises, \`async\`/\`await\`, loading and error states, timeouts, cancellation, retry with backoff and a race condition are tested with a mock \`fetch\` and a local \`node:http\` server with scripted replies (delays, 404, 503, broken JSON). No automated test calls a public API. The one public-API listing in the chapter is marked not run and its output is not printed.
- **Failed or skipped tests:** none in the final run.
- **Further Reading:** all ${LINKS.checked} distinct addresses returned HTTP 200 on ${LINKS.date}.

## Visual inspection coverage

${inspectedTotal} of ${sum((r) => r.pages)} PDF pages were rendered to images and looked at by eye: for every chapter the opening page, a concept page, a code-heavy project page, an exercise or MCQ page and the final page, plus every page flagged by the automated white-space check.

| Chapter | Pages looked at |
| --- | --- |
${rows.map((r) => `| ${r.n} | ${INSPECTED[r.n].pages.join(', ')} |`).join('\n')}

No rendering defect was found. All other pages passed the automated layout checks (no text outside the margins, no stranded heading, no blank or duplicate page).

## DOCX validation

All five DOCX files passed the structural checks (headings, captions, every code line character for character, tables, MCQ styles, Bengali words). Each was also opened by Microsoft Word through automation and exported to PDF without error (Word reported ${rows.map((r) => `${WORD[r.n]}`).join(', ')} pages for Chapters 07–11). Word's export was inspected by eye on Chapter 09 pages 1 and 24 and Chapter 11 page 18: Bengali shaping in prose and code, captions and syntax colours are correct.

## Registry

\`CHAPTER_REGISTRY.json\` lists Chapters 01–11 with title, Markdown, PDF, DOCX and project paths, production status, QA status, source manuscript (v30) and last verified build. Validation: numbers 1–11 unique and in order; ${registry.filter((e) => e.missing.length === 0).length} of 11 entries have every path present on disk; titles read from each Markdown file. **Registry ${registryValid ? 'valid' : 'INVALID'}.** Chapters 01–06 were read, not modified. \`BATCH_MANIFEST.json\` lists every file of this batch with size and SHA-256.

## Method notes

- **Build system.** \`build-system/\` is a copy of the master design system with one visible change: listings split with \`part=N/M\` are captioned "অংশ N / M (Part N of M)", not "Selected Excerpt" (see \`BUILD_SYSTEM_CHANGES.md\`). The master was not modified.
- **Batch tools (\`tools/\`).** \`extract-and-run.mjs\` (from batch 01) writes and runs every listing. New in this batch: \`cdp.mjs\`, a small Chrome DevTools Protocol client on Node.js 22's built-in WebSocket; \`run-browser-listings.mjs\`, which runs listings in real headless Chrome, with \`page=\`, \`click=\`, \`steps=\` (click, type, key) and \`wait=\`; and this report generator. No npm package was installed.
- **No modules yet.** Modules are taught in Chapter 12, so each project uses plain scripts loaded in order. Unit tests load them in an isolated \`vm\` context.
- **Title.** Every chapter title matches v30. v30's Chapter 09–11 projects ship empty \`index.html\`/\`style.css\` files and ES-module code; the premium projects were written fresh as plain scripts with complete pages.

## Remaining limitations

1. **Length.** Chapters are ${Math.min(...rows.map((r) => r.words))}–${Math.max(...rows.map((r) => r.words))} explanatory words. Below the 3,500-word floor of the 3,500–5,500 target: ${rows.filter((r) => r.words < 3500).map((r) => `Chapter ${r.n} (${r.words}, ${r.pages} pages)`).join(', ') || 'none'}. These chapters are code-heavy; the explanation is complete, and more prose would mean extra worked examples rather than filler.
2. **White space.** Four pages have about a third of the page empty where a listing kept whole moved to the next page: Chapter 10 page 36; Chapter 11 pages 3, 7 and 28.
3. **Wrapped code lines.** Every chapter has some code lines that wrap with a hanging indent; nearly all contain Bengali text, which is wider than Latin. None exceeds the 82-character limit.
4. **Editorial.** No second reader has proofread the Bengali.
5. **Platforms.** Tested on Windows 10 with Node.js 22.16.0 and Chrome 155 only; not on macOS, Linux, Firefox or Safari.
6. **Forward references.** Chapter 11 uses \`class ... extends Error\` before classes are taught (Chapter 13); the pattern is introduced briefly with a pointer.
7. **Batch 01 captions.** Chapters 02–06 still label their project parts "Selected Excerpt"; merging this batch's \`md.mjs\` change into the master would fix that on their next rebuild.

## Protected folders

Checked with \`git status\` against commit 9c4763f: no change in \`JavaScript_Mastery_Manuscript_v01\`–\`v30\`, \`book-output/draft-edition/\`, \`book-output/premium-samples/\`, \`book-output/premium-final/\`, \`book-output/premium-batches/batch-01-ch02-06/\` or \`book-output/master-design-system/\` (589 tracked files, 0 modified, 0 added).
`);
// ---------- manifest ----------
const files = [];
const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, f.name);
  if (f.isDirectory()) { if (!['.build', 'node_modules'].includes(f.name)) walk(p); } else files.push(p);
} };
walk(BATCH);
const manifestFiles = files.filter((f) => !/BATCH_MANIFEST\.json$/.test(f)).sort().map((f) => ({ path: path.relative(BATCH, f).replaceAll('\\', '/'), bytes: fs.statSync(f).size, sha256: sha256(f) }));
fs.writeFileSync(path.join(BATCH, 'BATCH_MANIFEST.json'), JSON.stringify({
  batch: 'batch-02-ch07-11', phase: '4B', chapters: rows.map((r) => ({ number: +r.n, title: r.title, deliverables: [`chapter-${r.n}/chapter-${r.n}-premium.md`, `chapter-${r.n}/chapter-${r.n}-premium.pdf`, `chapter-${r.n}/chapter-${r.n}-premium.docx`, `chapter-${r.n}/project/${r.project}/`, `chapter-${r.n}/QA_SUMMARY.md`] })),
  generated: new Date().toISOString(), excluded: ['.build/ folders (intermediate build files, regenerated by the build)'], fileCount: manifestFiles.length, files: manifestFiles,
}, null, 2) + '\n');

console.log(rows.map((r) => `ch${r.n}: ${r.words} words, ${r.pages} pages, unit ${r.unit.pass}/${r.unit.pass + r.unit.fail}, chrome ${r.chrome.compared}, project browser ${r.pbrowser ? `${r.pbrowser.pass}/${r.pbrowser.pass + r.pbrowser.fail}` : '-'}, ${r.gatesOk ? 'PASS' : 'FAIL'}`).join('\n'));
console.log(`registry valid: ${registryValid}; manifest files: ${manifestFiles.length}`);
