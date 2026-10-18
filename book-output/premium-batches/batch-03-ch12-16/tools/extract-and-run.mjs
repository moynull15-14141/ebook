// Turns the listings of a chapter into real files, runs them, and checks the real output against the
// Output / Error panels printed in the chapter. The Markdown is written once; this keeps it honest.
//
//   ```javascript run=node file=a.js path=examples/01-a.js          -> writes examples/01-a.js and runs it
//   ```javascript run=node file=app.js excerpt=project/x/app.js part=1/3   -> parts are joined into project/x/app.js
//   ```text kind=output  (directly after a listing)                -> must equal the real stdout exactly
//   ```text kind=error   (directly after a listing)                -> every line must occur in the real error output
//
// Usage: node tools/extract-and-run.mjs <chapter-dir> [--write]
//   --write  replaces mismatching Output panels in the Markdown with the real output (review the diff afterwards)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const dir = path.resolve(process.argv[2]);
const write = process.argv.includes('--write');
const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'chapter.json'), 'utf8'));
const mdFile = path.join(dir, cfg.source);
let md = fs.readFileSync(mdFile, 'utf8').replace(/\r\n/g, '\n');
const MARK = /^\s*\/\* \.\.\. \*\/\s*$|^\s*\/\/ \.\.\.\s*$|^\s*<!-- \.\.\. -->\s*$|^\s*# \.\.\.\s*$/;
const info = s => Object.fromEntries([...s.matchAll(/(\w+)=(\S+)/g)].map(a => [a[1], a[2]]));
const blocks = [...md.matchAll(/^```([\w-]+)([^\n]*)\n([\s\S]*?)\n```/gm)].map(m => ({ lang: m[1], info: info(m[2]), code: m[3], index: m.index, raw: m[0], line: md.slice(0, m.index).split('\n').length }));

// ---------- 1. extract ----------
const files = new Map();   // rel path -> { text, lastBlock }
let problems = 0;
blocks.forEach((b, i) => {
  if (b.info.kind) return;
  const rel = b.info.path ?? (b.info.part ? b.info.excerpt : null);
  if (!rel) { if (!b.info.fragment && !b.info.excerpt) { problems++; console.log(`FAIL  line ${b.line}: source listing has no path=`); } return; }
  if (b.info.part) {
    const body = b.code.split('\n').filter(l => !MARK.test(l)).join('\n').replace(/^\n+|\n+$/g, '');
    const f = files.get(rel) ?? { text: '', lastBlock: i };
    f.text += (f.text ? '\n\n' : '') + body; f.lastBlock = i; files.set(rel, f);
  } else files.set(rel, { text: b.code, lastBlock: i });
});
for (const [rel, f] of files) {
  const abs = path.join(dir, rel), text = f.text + '\n';
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  if (!fs.existsSync(abs) || fs.readFileSync(abs, 'utf8') !== text) fs.writeFileSync(abs, text);
}

// ---------- 2. run and compare ----------
const log = [];
let ran = 0, compared = 0;
const edits = [];
for (const [rel, f] of files) {
  const b = blocks[f.lastBlock];
  if (!/\.(js|mjs)$/.test(rel) || !['node', 'both'].includes(b.info.run) || b.info.norun) continue;
  const abs = path.join(dir, rel);
  const r = spawnSync(process.execPath, [path.basename(abs)], { cwd: path.dirname(abs), encoding: 'utf8', timeout: 20000 });
  const clean = s => (s ?? '').replace(/\r\n/g, '\n').split(path.dirname(abs) + path.sep).join('').split('file:///' + path.dirname(abs).split(path.sep).join('/') + '/').join('');
  const out = clean(r.stdout).trimEnd(), err = clean(r.stderr).trimEnd();
  ran++;
  log.push(`===== ${rel}  (exit code ${r.status}) =====\n${[out, err].filter(Boolean).join('\n')}\n`);
  const next = blocks[f.lastBlock + 1];
  const between = next ? md.slice(b.index + b.raw.length, next.index).trim() : 'x';
  const panel = next && between === '' ? next : null;
  const expectFail = rel.includes('/errors/') || panel?.info.kind === 'error';
  if ((r.status !== 0) !== expectFail) { problems++; console.log(`FAIL  ${rel} (line ${b.line}): exit code ${r.status}, expected ${expectFail ? 'an error' : 'success'}\n      ${err.split('\n').slice(0, 6).join('\n      ')}`); continue; }
  if (panel?.info.kind === 'output') {
    compared++;
    if (panel.code.trimEnd() !== out) {
      if (write) { edits.push([panel, out]); console.log(`WROTE ${rel}: Output panel on line ${panel.line} replaced with the real output`); }
      else { problems++; console.log(`FAIL  ${rel} (line ${b.line}): Output panel differs from the real output\n--- printed in the chapter ---\n${panel.code}\n--- real ---\n${out}\n`); }
    }
  } else if (panel?.info.kind === 'error') {
    compared++;
    const all = out + '\n' + err, miss = panel.code.split('\n').map(l => l.trim()).filter(Boolean).filter(l => !all.includes(l));
    if (miss.length) { problems++; console.log(`FAIL  ${rel} (line ${b.line}): Error panel lines not in the real output: ${miss.join(' | ')}\n--- real ---\n${all}\n`); }
  }
}
if (edits.length) {
  for (const [panel, out] of edits.sort((a, b) => b[0].index - a[0].index)) md = md.slice(0, panel.index) + panel.raw.replace(panel.code, () => out) + md.slice(panel.index + panel.raw.length);
  fs.writeFileSync(mdFile, md);
}
fs.mkdirSync(path.join(dir, 'qa-logs'), { recursive: true });
fs.writeFileSync(path.join(dir, 'qa-logs', 'node-examples.log'), log.join('\n'));
console.log(`${files.size} files written from the chapter, ${ran} run, ${compared} compared with a printed panel, ${problems} problem(s)`);
process.exit(problems ? 1 : 0);
