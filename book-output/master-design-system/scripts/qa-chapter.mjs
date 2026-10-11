// Runs the whole quality gate for one chapter and saves every log under <chapter>/qa-logs/.
//   1. the chapter's own tests, as declared in chapter.json ("tests")
//   2. manuscript rules   3. colour tokens   4. PDF checks   5. DOCX checks   6. Bengali typography audit
// Usage: node scripts/qa-chapter.mjs <chapter-dir> [--skip-tests] [--pages <rendered-pages-dir>]
// Build first:  node scripts/build-chapter.mjs <chapter-dir>
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { SYSTEM, loadChapter } from './lib/tokens.mjs';

const ch = loadChapter(process.argv[2]);
const args = process.argv.slice(3);
const pagesDir = args.includes('--pages') ? path.resolve(args[args.indexOf('--pages') + 1]) : null;
const results = [];
function step(name, cmd, cwd, logName) {
  const exe = cmd[0] === 'node' ? process.execPath : cmd[0];
  const r = spawnSync(exe, cmd.slice(1), { cwd, encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, timeout: 300000 });
  const out = (r.stdout ?? '') + (r.stderr ?? '') + (r.error ? `\n${r.error.message}` : '');
  if (logName) fs.writeFileSync(path.join(ch.logs, logName), `$ ${cmd.join(' ')}   (in ${path.relative(ch.dir, cwd) || '.'})\n\n${out}`);
  const ok = r.status === 0;
  const tail = out.trim().split('\n').filter(l => l.trim()).pop() ?? '';
  results.push({ name, ok, exit: r.status, log: logName ?? null, summary: tail.slice(0, 110) });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(30)} ${tail.slice(0, 90)}`);
}
const S = f => path.join(SYSTEM, 'scripts', f);

// Record the tool versions the results were produced with (the chapter may quote them in an Output panel).
const ver = cmd => (spawnSync(cmd, { shell: true, encoding: 'utf8' }).stdout ?? '').trim();
fs.writeFileSync(path.join(ch.logs, 'environment.log'), `$ node --version\n${ver('node --version')}\n$ npm --version\n${ver('npm --version')}\nplatform: ${process.platform} ${process.arch}\n`);

if (!args.includes('--skip-tests')) {
  const syntax = [];
  for (const t of ch.tests ?? []) {
    if (t.log) step(t.name, t.cmd, path.join(ch.dir, t.cwd), t.log);
    else { const r = spawnSync(process.execPath, t.cmd.slice(1), { cwd: path.join(ch.dir, t.cwd), encoding: 'utf8' }); syntax.push(`${r.status === 0 ? 'OK  ' : 'FAIL'}  ${t.cmd.join(' ')}   (in ${t.cwd})${r.stderr ? '\n' + r.stderr : ''}`); results.push({ name: t.name, ok: r.status === 0, exit: r.status, log: 'syntax-checks.log', summary: '' }); console.log(`${r.status === 0 ? 'PASS' : 'FAIL'}  ${t.name}`); }
  }
  if (syntax.length) fs.writeFileSync(path.join(ch.logs, 'syntax-checks.log'), syntax.join('\n') + '\n');
}
step('manuscript rules', ['node', S('check-manuscript.mjs'), ch.dir], ch.dir, 'manuscript-check.log');
step('colour tokens', ['node', S('check-tokens.mjs')], ch.dir, 'tokens-check.log');
step('PDF checks', ['node', S('check-pdf.mjs'), ch.dir, ...(pagesDir ? [pagesDir] : [])], ch.dir, 'pdf-check.log');
step('DOCX checks', ['python', '-I', S('check-docx.py'), ch.dir], ch.dir, 'docx-check.log');
step('Bengali typography audit', ['node', S('check-typography.mjs'), ch.pdf, ch.md, '--json', path.join(ch.work, 'typography.json')], ch.dir, 'typography-audit.log');

const failed = results.filter(r => !r.ok);
fs.writeFileSync(path.join(ch.logs, 'qa-summary.json'), JSON.stringify({ chapter: ch.number, ran: new Date().toISOString(), passed: results.length - failed.length, failed: failed.length, results }, null, 2));
console.log(`\n${results.length - failed.length} of ${results.length} gates passed${failed.length ? ' — FAILED: ' + failed.map(f => f.name).join(', ') : ''}`);
process.exit(failed.length ? 1 : 0);
