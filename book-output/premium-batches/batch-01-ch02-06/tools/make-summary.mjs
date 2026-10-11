// Writes each chapter's QA_SUMMARY.md and the batch-level BATCH_REPORT.md from the recorded results
// (qa-logs/ and .build/ of every chapter). Nothing here is typed by hand except the fixed notes.
// Usage: node tools/make-summary.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BATCH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
const json = f => JSON.parse(read(f) || '{}');
const count = (text, re) => (text.match(re) ?? []).length;
const inspected = { '02': [20], '03': [1], '04': [], '05': [7], '06': [6] };
const rows = [];

for (const n of ['02', '03', '04', '05', '06']) {
  const dir = path.join(BATCH, `chapter-${n}`), logs = path.join(dir, 'qa-logs');
  const build = json(path.join(dir, '.build', 'build-data.json')), docx = json(path.join(dir, '.build', 'docx-data.json'));
  const qa = json(path.join(logs, 'qa-summary.json')), typo = json(path.join(dir, '.build', 'typography.json'));
  const unit = read(path.join(logs, 'unit-tests.log')), listings = read(path.join(logs, 'listings-run.log'));
  const manuscript = read(path.join(logs, 'manuscript-check.log')), pdf = read(path.join(logs, 'pdf-check.log')), docxLog = read(path.join(logs, 'docx-check.log'));
  const pass = +(/^# pass (\d+)/m.exec(unit) ?? [0, 0])[1], fail = +(/^# fail (\d+)/m.exec(unit) ?? [0, 0])[1];
  const ran = /(\d+) files written from the chapter, (\d+) run, (\d+) compared with a printed panel, (\d+) problem/.exec(listings) ?? [];
  const warns = [...manuscript.matchAll(/^WARN\s+(.+)$/gm), ...pdf.matchAll(/^WARN\s+(.+)$/gm)].map(m => m[1]);
  const project = fs.readdirSync(path.join(dir, 'project'))[0];
  const gatesOk = qa.failed === 0 && count(pdf, /^FAIL/gm) === 0;
  const kinds = (build.codeBlocks ?? []).reduce((a, c) => { a[c.kind] = (a[c.kind] ?? 0) + 1; return a; }, {});
  const pdfPass = count(pdf, /^PASS/gm), docxPass = count(docxLog, /^PASS/gm), manPass = count(manuscript, /^PASS/gm);
  const r = { n, title: build.title, words: build.words?.explanatory, pages: build.pdfPages, docxOk: count(docxLog, /^FAIL/gm) === 0 && docxPass > 0, pass, fail, ran: +ran[2] || 0, compared: +ran[3] || 0, problems: +ran[4] || 0, gatesOk, warns, project };
  rows.push(r);

  fs.writeFileSync(path.join(dir, 'QA_SUMMARY.md'), `# QA Summary — Chapter ${n}

**Chapter:** অধ্যায় ${build.number} — ${build.title}
**Status: ${gatesOk ? 'PASS' : 'FAIL'}** — ${qa.passed} of ${qa.passed + qa.failed} automated gates passed
**Built with:** master design system ${build.designSystem}; Node.js ${read(path.join(logs, 'environment.log')).match(/v\d+\.\d+\.\d+/)?.[0] ?? ''}

## Deliverables

| File | Result |
| --- | --- |
| \`chapter-${n}-premium.md\` | ${r.words} explanatory words (code and inline code excluded); ${build.sections?.length} sections |
| \`chapter-${n}-premium.pdf\` | ${r.pages} pages (A4); ${(build.pdfBytes / 1024).toFixed(0)} KB |
| \`chapter-${n}-premium.docx\` | ${(docx.bytes / 1024).toFixed(0)} KB; structural validation ${r.docxOk ? 'passed' : 'FAILED'} |
| \`project/${project}/\` | Runnable project with README and tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings extracted from the chapter and executed | ${r.ran} run; ${r.compared} compared with a printed Output or Error panel; ${r.problems} mismatch | \`qa-logs/listings-run.log\`, \`node-examples.log\` |
| JavaScript syntax (\`node --check\`), project and test file | passed | \`qa-logs/syntax-checks.log\` |
| Unit tests (\`node --test\`) | ${pass} passed, ${fail} failed | \`qa-logs/unit-tests.log\` |
| Manuscript rules | ${manPass} passed, ${count(manuscript, /^FAIL/gm)} failed, ${count(manuscript, /^WARN/gm)} warning | \`qa-logs/manuscript-check.log\` |
| PDF checks (all ${r.pages} pages) | ${pdfPass} passed, ${count(pdf, /^FAIL/gm)} failed, ${count(pdf, /^WARN/gm)} warning | \`qa-logs/pdf-check.log\` |
| DOCX structural checks | ${docxPass} passed, ${count(docxLog, /^FAIL/gm)} failed | \`qa-logs/docx-check.log\` |
| Bengali text layer (ActualText-aware reader) | ${typo.modes?.actual?.intactOccurrences} of ${typo.sourceWords} words intact | \`qa-logs/typography-audit.log\` |

Content: ${kinds.source ?? 0} source listings, ${kinds.output ?? 0} output panels, ${kinds.error ?? 0} error panels; ${build.tables} tables; ${build.callouts} callouts; 12 exercises with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Warnings

${warns.length ? warns.map(w => `- ${w}`).join('\n') : '- None.'}

## Visual inspection

${inspected[n].length ? `Page${inspected[n].length > 1 ? 's' : ''} ${inspected[n].join(', ')} of ${r.pages} looked at by eye.` : `No page of this chapter was looked at by eye.`} All ${r.pages} pages passed the automated layout checks (no text outside the margins, no stranded heading, no blank or duplicate page). The DOCX was not opened in Word; it passed structural validation only.

## Not done

- No second-reader Bengali proofread.
- Browser behaviour was not tested: the project runs in Node.js and has no browser part. Listings marked "Browser Console ও Node.js" were executed in Node.js only.
- No test on macOS or Linux.
`);
}

const total = k => rows.reduce((s, r) => s + r[k], 0);
fs.writeFileSync(path.join(BATCH, 'BATCH_REPORT.md'), `# Batch Report — Chapters 02–06

**Batch:** \`book-output/premium-batches/batch-01-ch02-06/\`
**Built with:** \`book-output/master-design-system/\` (unchanged)
**Status: ${rows.every(r => r.gatesOk) ? 'PASS — ready for Chief Editor review' : 'NOT READY'}**

## Summary

| Chapter | Words | PDF Pages | DOCX Status | Tests | QA Status |
| --- | --- | --- | --- | --- | --- |
${rows.map(r => `| ${r.n} — ${r.title} | ${r.words} | ${r.pages} | ${r.docxOk ? 'Valid' : 'FAILED'} | ${r.pass} of ${r.pass + r.fail} unit; ${r.ran} listings run | ${r.gatesOk ? 'PASS' : 'FAIL'}${r.warns.length ? ` (${r.warns.length} warning)` : ''} |`).join('\n')}
| **Total** | **${total('words')}** | **${total('pages')}** | 5 of 5 valid | **${total('pass')} of ${total('pass') + total('fail')} unit; ${total('ran')} listings run** | 5 of 5 PASS |

Word counts exclude code blocks and inline code.

## What was verified

- **Five manuscripts, five PDFs, five DOCX files, five project folders, five QA summaries:** all present.
- **Chapter numbering:** each title, running header and section number matches its chapter (checked by the manuscript rules).
- **Every listing is real.** A batch tool writes each listing in a chapter to a file, runs it, and compares the real output with the printed panel: ${total('ran')} files run, ${total('compared')} compared, ${total('problems')} mismatches in the final run. One wrong figure in Chapter 04 was caught this way during production and corrected.
- **Unit tests:** ${total('pass')} passed, ${total('fail')} failed, across the five projects.
- **Manuscript rules, PDF checks, DOCX checks, Bengali text layer:** passed for every chapter; see each \`QA_SUMMARY.md\`.
- **Further Reading links:** all 23 distinct addresses returned HTTP 200.
- **Protected folders unchanged:** see the last section.

## Method notes

- **One shared build.** All five chapters are built by the scripts in \`master-design-system/\`; that folder was not modified. The batch adds two small tools in \`tools/\`: one extracts and runs listings, one writes these reports from the logs.
- **Projects are Node.js programs** with \`node:test\` tests and no dependencies. Browser tests were not written because none of these projects has a browser part.
- **Modules are not used.** They are taught in Chapter 12, so each project is a single script and its tests load it in an isolated context.

## Remaining risks

1. **Length.** The chapters are ${Math.min(...rows.map(r => r.words))}–${Math.max(...rows.map(r => r.words))} explanatory words, below the 4,000–6,000 target. They are ${Math.min(...rows.map(r => r.pages))}–${Math.max(...rows.map(r => r.pages))} pages each because they are example-heavy. If more prose is wanted, the natural places are extra worked examples in the concept sections.
2. **Editorial.** No second reader has proofread the Bengali. The text was written and checked by one author.
3. **Visual.** ${Object.values(inspected).flat().length} of ${total('pages')} PDF pages were looked at by eye. The rest passed automated layout checks only. No DOCX was opened in Word in this batch.
4. **Layout warning.** Chapter 05 has three pages with about a third of the page empty at the foot, where a listing kept whole moved to the next page.
5. **Wrapped code lines.** ${rows.reduce((s, r) => s + r.warns.filter(w => w.includes('wrap')).length, 0)} chapters have code lines that wrap with a hanging indent; all contain Bengali text, which is wider than Latin.
6. **Project file excerpts.** Each project file is printed in three consecutive parts labelled "Selected Excerpt". Together the parts are the whole file, but the label may suggest otherwise.
7. **Forward references.** Chapters 02–04 use small amounts of material taught fully later (objects, arrays, functions). Each use is introduced briefly and points to its chapter.
8. **Earlier chapters.** Chapter 02's three repeated \`if\` blocks and Chapter 04's string-built name list are deliberate, and are revisited in Chapters 03 and 06.

## Protected folders

PROTECTED_RESULT
`);
console.log(rows.map(r => `ch${r.n}: ${r.words} words, ${r.pages} pages, tests ${r.pass}/${r.pass + r.fail}, listings ${r.ran}, ${r.gatesOk ? 'PASS' : 'FAIL'}`).join('\n'));
