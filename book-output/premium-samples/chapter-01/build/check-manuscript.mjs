// Cross-checks the manuscript against the real, executed files:
//   1. every source listing in the chapter must be identical to a file under project/ or examples/
//      (or be listed below as an intentional partial snippet);
//   2. every line of every Output / Error Message panel must appear in the recorded run logs (qa-logs/);
//   3. structural rules: 10 MCQs x 4 options, an answer row per MCQ, required sections present.
// Usage: node build/check-manuscript.mjs      (run the examples and tests first so qa-logs/ is current)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const md = fs.readFileSync(path.join(ROOT, 'chapter-01-premium.md'), 'utf8').replace(/\r\n/g, '\n');
const norm = s => s.replace(/\r\n/g, '\n').trimEnd();

const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (e.name === 'screenshots' ? [] : walk(path.join(dir, e.name))) : [path.join(dir, e.name)]);
const realFiles = [...walk(path.join(ROOT, 'project')), ...walk(path.join(ROOT, 'examples'))].filter(f => /\.(js|html|css)$/.test(f))
  .map(f => ({ rel: path.relative(ROOT, f).split(path.sep).join('/'), text: norm(fs.readFileSync(f, 'utf8')) }));
const logs = ['node-examples.log', 'page-examples.log', 'browser-tests.log', 'unit-tests.log', 'environment.log']
  .map(f => path.join(ROOT, 'qa-logs', f)).filter(f => fs.existsSync(f)).map(f => fs.readFileSync(f, 'utf8')).join('\n');

// Listings that are deliberately fragments to be added to an existing file (exercise solutions 10–12).
const PARTIAL = new Set(['const counter = document.querySelector', 'const resetButton = document.querySelector', 'function createGreeting(name, city)']);

const blocks = [...md.matchAll(/^```(\w+)([^\n]*)\n([\s\S]*?)\n```/gm)].map(m => ({ lang: m[1], info: m[2].trim(), code: m[3], line: md.slice(0, m.index).split('\n').length }));
let fail = 0;
const report = (ok, msg) => { if (!ok) fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); };

let identical = 0, partial = 0, missing = [];
for (const b of blocks.filter(b => !/kind=/.test(b.info))) {
  const hit = realFiles.find(f => f.text === norm(b.code));
  if (hit) { identical++; continue; }
  // a fragment counts only if every one of its code lines exists in a real, tested file
  const lines = b.code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
  const host = realFiles.find(f => lines.every(l => f.text.includes(l)));
  if ([...PARTIAL].some(p => b.code.includes(p)) && host) { partial++; continue; }
  missing.push(`line ${b.line}: ${b.info || b.lang}`);
}
report(missing.length === 0, `source listings: ${identical} identical to a real file, ${partial} partial snippets whose every line exists in a tested file, ${missing.length} unverified${missing.length ? ' -> ' + missing.join('; ') : ''}`);

let outLines = 0; const notFound = [];
for (const b of blocks.filter(b => /kind=(output|error)/.test(b.info))) {
  for (const l of b.code.split('\n').map(l => l.trimEnd()).filter(l => l.trim())) {
    outLines++;
    if (!logs.includes(l.trim())) notFound.push(`line ${b.line}: ${l.trim()}`);
  }
}
report(notFound.length === 0, `output/error panels: ${outLines} lines checked against recorded run logs, ${notFound.length} not found${notFound.length ? ' -> ' + notFound.join(' | ') : ''}`);

const runTagged = blocks.filter(b => !/kind=/.test(b.info));
report(runTagged.every(b => /run=(node|browser|both)/.test(b.info)), `every source listing states where it runs (${runTagged.length} listings)`);

const mcq = (md.match(/^\*\*প্রশ্ন [০-৯]+\.\*\*/gm) || []).length;
const opts = (md.match(/^- [কখগঘ]\) /gm) || []).length;
const answerRows = (md.match(/^\| [০-৯]+ \| [কখগঘ] \| .+\|$/gm) || []);
report(mcq === 10 && opts === 40, `MCQs: ${mcq} questions, ${opts} options`);
report(answerRows.length === 10, `MCQ answers with explanations: ${answerRows.length}`);
const key = answerRows.map(r => r.split('|')[2].trim()).join('');
report(new Set(key).size === 4, `answer key uses all four positions: ${key}`);

const required = ['শেখার লক্ষ্য', 'পূর্বশর্ত', 'এই অধ্যায় কেন গুরুত্বপূর্ণ', 'সাধারণ ভুল', 'Debugging নির্দেশিকা', 'পেশাদার অভ্যাস', 'Project: Interactive Greeting App', 'অনুশীলনী', 'অনুশীলনীর সমাধান', 'MCQ: নিজেকে যাচাই করুন', 'MCQ-এর উত্তর ও ব্যাখ্যা', 'অধ্যায়ের সারসংক্ষেপ', 'গুরুত্বপূর্ণ পরিভাষা', 'আরও পড়ুন'];
const h2 = (md.match(/^## .+$/gm) || []).map(h => h.slice(3).replace(/^[০-৯.]+\s*/, ''));
const absent = required.filter(r => !h2.includes(r));
report(absent.length === 0, `required sections present: ${required.length - absent.length} of ${required.length}${absent.length ? ' -> missing ' + absent.join(', ') : ''}`);
for (const lvl of ['প্রাথমিক স্তর', 'মধ্যম স্তর', 'চ্যালেঞ্জ স্তর']) report(md.includes(`### ${lvl}`), `exercise level present: ${lvl}`);
const solutions = (md.match(/^\*\*সমাধান [০-৯]+\*\*/gm) || []).length;
report(solutions === 12, `exercise solutions: ${solutions} of 12`);

// Consistent formal address: informal imperative/pronoun forms must not appear in prose.
const prose = md.replace(/```[\s\S]*?```/g, '');
const informal = prose.match(/(তুমি|তোমার|তোমাকে|তুই|করো[\s।,]|লিখো|দেখো[\s।,]|চালাও[\s।,])/g) || [];
// "চালাও" occurs once inside a quoted command meaning ("Node.js, ... চালাও") — report rather than hide it.
report(informal.filter(w => !/চালাও/.test(w)).length === 0, `informal address forms in prose: ${informal.length ? informal.join(' ') : 'none'}`);

console.log(fail ? `\n${fail} check(s) failed` : '\nAll manuscript checks passed');
process.exit(fail ? 1 : 0);
