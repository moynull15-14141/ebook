// Enforces the manuscript rules of the design system on one chapter (config/chapter-rules.json).
// It cross-checks the Markdown against the real, executed companion files and the recorded run logs.
// Usage: node scripts/check-manuscript.mjs <chapter-dir>      exit code 1 if any rule FAILs
import fs from 'node:fs';
import path from 'node:path';
import { tokens, rules, loadChapter, fromBn, measures } from './lib/tokens.mjs';
import { fenceInfo } from './lib/md.mjs';

const ch = loadChapter(process.argv[2]);
const md = fs.readFileSync(ch.md, 'utf8').replace(/\r\n/g, '\n');
const norm = s => s.replace(/\r\n/g, '\n').trimEnd();
let fails = 0, warns = 0;
const pass = msg => console.log(`PASS  ${msg}`);
const fail = msg => { fails++; console.log(`FAIL  ${msg}`); };
const warn = msg => { warns++; console.log(`WARN  ${msg}`); };
const check = (ok, msg) => ok ? pass(msg) : fail(msg);

// ---------- companion files and logs ----------
const walk = dir => !fs.existsSync(dir) ? [] : fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (['screenshots', 'node_modules', '.build'].includes(e.name) ? [] : walk(path.join(dir, e.name))) : [path.join(dir, e.name)]);
const real = (ch.companion ?? []).flatMap(d => walk(path.join(ch.dir, d))).filter(f => /\.(js|mjs|ts|html|css|json|sql|sh|ya?ml)$/.test(f)).map(f => ({ rel: path.relative(ch.dir, f).split(path.sep).join('/'), text: norm(fs.readFileSync(f, 'utf8')) }));
const logs = walk(ch.logs).filter(f => f.endsWith('.log')).map(f => fs.readFileSync(f, 'utf8')).join('\n');

// ---------- structure ----------
const title = new RegExp(rules.titlePattern).exec(md.split('\n')[0]);
check(!!title, `title line matches the pattern${title ? `: অধ্যায় ${title[1]} — ${title[2]}` : ''}`);
check(!title || fromBn(title[1]) === ch.number, `chapter number in the title matches chapter.json (${ch.number})`);
const h2 = (md.match(/^## .+$/gm) ?? []).map(h => h.slice(3).trim());
const bare = h2.map(h => h.replace(/^[০-৯.]+\s*/, ''));
const missing = rules.requiredSections.filter(r => !bare.includes(r)).concat(rules.requiredSectionPatterns.filter(p => !h2.some(h => new RegExp(p).test(h))));
check(missing.length === 0, `required sections present: ${rules.requiredSections.length + rules.requiredSectionPatterns.length - missing.length} of ${rules.requiredSections.length + rules.requiredSectionPatterns.length}${missing.length ? ' — missing: ' + missing.join(', ') : ''}`);
const dupH2 = h2.filter((h, i) => h2.indexOf(h) !== i);
check(dupH2.length === 0, `no duplicate sections${dupH2.length ? ': ' + dupH2.join(', ') : ''}`);
const numbered = h2.map(h => /^([০-৯]+)\.([০-৯]+) /.exec(h)).filter(Boolean).map(m => [fromBn(m[1]), fromBn(m[2])]);
check(numbered.every(([c, s], i) => c === ch.number && s === i + 1), `numbered sections run ${ch.number}.1 to ${ch.number}.${numbered.length} without gaps`);
const section = pattern => { const i = md.search(new RegExp(`^## .*${pattern}.*$`, 'm')); if (i < 0) return ''; const rest = md.slice(i + 3); const j = rest.search(/^## /m); return j < 0 ? rest : rest.slice(0, j); };

// ---------- exercises, solutions, MCQs ----------
const ex = section('অনুশীলনী$'), sol = section('অনুশীলনীর সমাধান$');
for (const lvl of rules.exerciseLevels) check(ex.includes(`### ${lvl}`), `exercise level present: ${lvl}`);
const exNums = (ex.match(/^(\d+)\. /gm) ?? []).map(n => parseInt(n, 10));
const solNums = (sol.match(new RegExp(rules.solutionPattern, 'gm')) ?? []).map(s => fromBn(/[০-৯]+/.exec(s)[0]));
check(exNums.length > 0 && exNums.every((n, i) => n === i + 1), `exercises are numbered 1 to ${exNums.length} without gaps`);
check(JSON.stringify(exNums) === JSON.stringify(solNums), `every exercise has a solution with the same number (${solNums.length} of ${exNums.length})`);
const q = rules.mcq, mcqSec = section('MCQ: '), ansSec = section('MCQ-এর উত্তর');
const questions = mcqSec.split(new RegExp(`(?=${q.questionPattern})`, 'm')).filter(b => new RegExp(q.questionPattern).test(b));
check(questions.length === q.questions, `MCQs: ${questions.length} of exactly ${q.questions} questions`);
const badOpts = questions.map((b, i) => [i + 1, (b.match(new RegExp(`^- [${q.optionLabels}]\\) `, 'gm')) ?? []).map(o => o[2]).join('')]).filter(([, o]) => o !== q.optionLabels);
check(badOpts.length === 0, `each MCQ has the ${q.optionsPerQuestion} options ${[...q.optionLabels].join(', ')} in order${badOpts.length ? ' — wrong: ' + badOpts.map(b => `Q${b[0]} (${b[1]})`).join(', ') : ''}`);
const rows = [...ansSec.matchAll(new RegExp(`^\\| ([০-৯]+) \\| ([${q.optionLabels}]) \\| (.+?) \\|$`, 'gm'))];
check(rows.length === q.questions && rows.every((r, i) => fromBn(r[1]) === i + 1 && r[3].trim().length > 15), `answer table: ${rows.length} rows, each with an explanation`);
const quick = new RegExp(`\\*\\*${q.quickKeyLabel}:\\*\\* (.+)`).exec(ansSec);
const quickPairs = quick ? [...quick[1].matchAll(new RegExp(`([০-৯]+)[–-]([${q.optionLabels}])`, 'g'))].map(m => m[1] + m[2]).join(' ') : '';
check(quickPairs === rows.map(r => r[1] + r[2]).join(' '), `quick answer key matches the answer table (${rows.map(r => r[2]).join('')})`);
check(new Set(rows.map(r => r[2])).size >= 3, 'correct answers are spread over at least three option positions');

// ---------- code listings ----------
const blocks = [...md.matchAll(/^```([\w-]+)([^\n]*)\n([\s\S]*?)\n```/gm)].map(m => ({ lang: m[1], info: fenceInfo(m[2]), code: m[3], line: md.slice(0, m.index).split('\n').length }));
const source = blocks.filter(b => !b.info.kind);
const untagged = source.filter(b => !rules.runTargets.includes(b.info.run));
check(untagged.length === 0, `every source listing states where it runs (${source.length} listings)${untagged.length ? ' — missing on lines ' + untagged.map(b => b.line).join(', ') : ''}`);
const badKind = blocks.filter(b => b.info.kind && !rules.listingKinds.includes(b.info.kind));
check(badKind.length === 0, `every non-source panel has a known kind${badKind.length ? ' — lines ' + badKind.map(b => b.line).join(', ') : ''}`);

const MARK = /^\s*\/\* \.\.\. \*\/\s*$|^\s*\/\/ \.\.\.\s*$|^\s*<!-- \.\.\. -->\s*$|^\s*# \.\.\.\s*$/;
let identical = 0, excerpts = 0, fragments = 0; const bad = [];
for (const b of source) {
  const where = `line ${b.line} (${b.info.file ?? b.lang})`;
  if (b.info.excerpt) {
    // Selected excerpt: every chunk between "..." markers must be a contiguous piece of the named file, in file order.
    const file = real.find(f => f.rel === b.info.excerpt);
    if (!file) { bad.push(`${where}: excerpt file not found: ${b.info.excerpt}`); continue; }
    const chunks = b.code.split('\n').reduce((acc, l) => { if (MARK.test(l)) acc.push([]); else acc[acc.length - 1].push(l); return acc; }, [[]]).map(c => c.join('\n').trim()).filter(Boolean);
    let pos = 0, ok = b.code.split('\n').some(l => MARK.test(l));
    for (const c of chunks) { const k = file.text.indexOf(c, pos); if (k < 0) { ok = false; break; } pos = k + c.length; }
    ok ? excerpts++ : bad.push(`${where}: excerpt does not match ${b.info.excerpt} (or has no "..." marker)`);
  } else if (b.info.fragment) {
    // Fragment to add to an existing file: every code line must exist in the named, tested file.
    const file = real.find(f => f.rel === b.info.fragment);
    const lines = b.code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
    file && lines.every(l => file.text.includes(l)) ? fragments++ : bad.push(`${where}: fragment lines not all found in ${b.info.fragment}`);
  } else if (real.some(f => f.text === norm(b.code))) identical++;
  else bad.push(`${where}: listing is not identical to any companion file (mark it excerpt= or fragment= if that is intended)`);
}
check(bad.length === 0, `source listings verified against companion files: ${identical} complete and identical, ${excerpts} selected excerpt(s), ${fragments} fragment(s)${bad.length ? '\n      ' + bad.join('\n      ') : ''}`);

const c = tokens.code, fits = measures().codeCharsPerLine;
const long = source.filter(b => !b.info.excerpt && b.code.split('\n').length > c.maxListingLines);
check(long.length === 0, `long-listing policy: no complete listing over ${c.maxListingLines} lines (longest is ${Math.max(...source.map(b => b.code.split('\n').length))})${long.length ? ' — ' + long.map(b => `line ${b.line}: ${b.code.split('\n').length} lines`).join('; ') : ''}`);
const wide = [], wraps = [];
for (const b of blocks) b.code.split('\n').forEach((l, k) => {
  const len = [...l].length, bn = /[ঀ-৿]/.test(l);
  if (!bn && len > c.maxLineChars) wide.push(`line ${b.line + k + 1}: ${len} chars`);
  else if (len > c.hangFromChars || (bn && len > c.hangFromChars - 12)) wraps.push(`line ${b.line + k + 1} (${len} chars${bn ? ', Bengali' : ''})`);
});
check(wide.length === 0, `no code line longer than ${c.maxLineChars} characters (${fits} fit on a line at ${tokens.type.codePt} pt)${wide.length ? ' — ' + wide.join('; ') : ''}`);
if (wraps.length) warn(`${wraps.length} code line(s) will wrap with a hanging indent: ${wraps.join('; ')}`); else pass('no code line needs to wrap');

let outLines = 0; const notFound = [];
for (const b of blocks.filter(b => ['output', 'error'].includes(b.info.kind))) for (const l of b.code.split('\n').map(l => l.trim()).filter(Boolean)) { outLines++; if (!logs.includes(l)) notFound.push(`line ${b.line}: ${l}`); }
check(notFound.length === 0, `output and error panels: ${outLines} lines, all found in the recorded run logs${notFound.length ? ' — not found: ' + notFound.join(' | ') : ''}`);

const images = [...md.matchAll(/^!\[[^\]]*\]\(([^)]+)\)/gm)].map(m => m[1]);
check(images.every(p => fs.existsSync(path.join(ch.dir, p))), `figure files exist (${images.length})`);

// ---------- language ----------
const prose = md.replace(/```[\s\S]*?```/g, '').replace(/``.+?``|`[^`]*`/g, '');
const pronouns = rules.informalAddress.filter(w => new RegExp(`(^|[^\\u0980-\\u09FF])${w}(?![\\u0980-\\u09FF])`, 'm').test(prose));
check(pronouns.length === 0, `formal address: no informal pronouns${pronouns.length ? ' — found ' + pronouns.join(', ') : ''}`);
const verbRe = new RegExp(`(^|[^\\u0980-\\u09FF])(${rules.informalVerbEndings.join('|')})(?![\\u0980-\\u09FF])`, 'g');
const unquoted = prose.replace(/"[^"\n]*"/g, ' ');
const verbs = [...unquoted.matchAll(verbRe)].map(m => m[2]), quotedVerbs = [...prose.matchAll(verbRe)].length - verbs.length;
check(verbs.length === 0, `formal address: no informal imperative verbs addressed to the reader${verbs.length ? ' — found ' + verbs.join(', ') : ''}${quotedVerbs ? ` (${quotedVerbs} inside quoted instructions to the computer, allowed)` : ''}`);
const placeholders = rules.placeholderTerms.filter(t => prose.includes(t));
check(placeholders.length === 0, `no placeholder or draft markers${placeholders.length ? ' — found ' + placeholders.join(', ') : ''}`);
const badChars = [...new Set(md.match(/[←-⇿✓✔✖•■-◿\u{1F300}-\u{1FAFF}]/gu) ?? [])];
check(badChars.length === 0, `no characters missing from the book fonts (arrows, emoji, symbols)${badChars.length ? ' — found ' + badChars.join(' ') : ''}`);

console.log(`\n${fails ? `${fails} FAILED` : 'All manuscript rules passed'}${warns ? `, ${warns} warning(s)` : ''}`);
process.exit(fails ? 1 : 0);
