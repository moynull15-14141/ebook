// Verifies TypeScript listings (```typescript ... path=examples/....ts) with the real compiler.
// Run tools/extract-and-run.mjs first (it writes the files). For each listing:
//   followed by an Error panel  -> `tsc --strict --noEmit` must fail and every panel line must be in its output
//   followed by an Output panel -> compile, run the JavaScript with Node.js, compare stdout exactly
//   no panel                    -> must compile without errors
// The compiler is a verified local installation (no package is installed): set TSC and TS_TYPES, or the defaults
// below are used. Usage: node tools/ts-examples.mjs <chapter-dir>
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const GLOBAL = 'C:/Users/T/AppData/Roaming/npm/node_modules/firebase-tools/node_modules';
const TSC = process.env.TSC ?? `${GLOBAL}/typescript/bin/tsc`;
const TYPES = process.env.TS_TYPES ?? `${GLOBAL}/@types`;
const dir = path.resolve(process.argv[2]);
const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'chapter.json'), 'utf8'));
const md = fs.readFileSync(path.join(dir, cfg.source), 'utf8').replace(/\r\n/g, '\n');
const info = (s) => Object.fromEntries([...s.matchAll(/(\w+)=(\S+)/g)].map((m) => [m[1], m[2]]));
const blocks = [...md.matchAll(/^```([\w-]+)([^\n]*)\n([\s\S]*?)\n```/gm)]
  .map((m) => ({ lang: m[1], info: info(m[2]), code: m[3], index: m.index, raw: m[0], line: md.slice(0, m.index).split('\n').length }));
const FLAGS = ['--strict', '--target', 'es2022', '--module', 'es2022', '--moduleResolution', 'bundler',
  '--types', 'node', '--typeRoots', TYPES, '--skipLibCheck', '--pretty', 'false'];

const version = spawnSync(process.execPath, [TSC, '--version'], { encoding: 'utf8' }).stdout.trim();
const log = [`TypeScript compiler: ${version} (${TSC})`, ''];
let checked = 0, compared = 0, problems = 0;
blocks.forEach((b, i) => {
  const isTs = ['ts', 'typescript'].includes(b.lang);
  // tscheck=1 on a JavaScript listing: checked as JS (allowJs + checkJs), e.g. // @ts-check with JSDoc types
  if ((!isTs && !b.info.tscheck) || !b.info.path?.startsWith('examples/') || b.info.kind) return;
  const file = path.join(dir, b.info.path), cwd = path.dirname(file), name = path.basename(file);
  const next = blocks[i + 1];
  const gap = next ? md.slice(b.index + b.raw.length, next.index).trim() : 'x';
  const panel = next && (gap === '' || (!gap.includes('\n') && gap.endsWith(':'))) ? next : null;
  const out = path.join(dir, '.build', 'ts', path.dirname(b.info.path));
  const expectError = panel?.info.kind === 'error';
  const jsFlags = isTs ? [] : ['--allowJs', '--checkJs'];
  const tsc = spawnSync(process.execPath, [TSC, ...FLAGS, ...jsFlags, ...(expectError || !panel ? ['--noEmit'] : ['--outDir', out]), name],
    { cwd, encoding: 'utf8' });
  const tscOut = `${tsc.stdout}${tsc.stderr}`.trim();
  checked++;
  log.push(`===== tsc ${b.info.path} (exit code ${tsc.status}) =====`, tscOut);
  if (expectError) {
    compared++;
    const miss = panel.code.split('\n').map((l) => l.trim()).filter(Boolean).filter((l) => !tscOut.includes(l));
    if (tsc.status === 0 || miss.length) { problems++; console.log(`FAIL  ${b.info.path} (line ${b.line}): expected compile errors not seen: ${miss.join(' | ') || '(compiled without error)'}\n${tscOut}\n`); }
  } else if (tsc.status !== 0) {
    problems++; console.log(`FAIL  ${b.info.path} (line ${b.line}): does not compile\n${tscOut}\n`);
  } else if (panel?.info.kind === 'output') {
    compared++;
    fs.writeFileSync(path.join(out, 'package.json'), '{ "type": "module" }\n');
    const js = path.join(out, name.replace(/\.ts$/, '.js'));
    const run = spawnSync(process.execPath, [js], { cwd: out, encoding: 'utf8' });
    const stdout = run.stdout.replace(/\r\n/g, '\n').trimEnd();
    log.push(`----- node ${path.relative(dir, js)} (exit code ${run.status}) -----`, stdout, run.stderr.trim());
    if (run.status !== 0 || stdout !== panel.code.trimEnd()) { problems++; console.log(`FAIL  ${b.info.path} (line ${b.line}): output differs\n--- printed ---\n${panel.code}\n--- real ---\n${stdout}\n${run.stderr}\n`); }
  }
  log.push('');
});
fs.mkdirSync(path.join(dir, 'qa-logs'), { recursive: true });
fs.writeFileSync(path.join(dir, 'qa-logs', 'ts-examples.log'), log.join('\n'));
console.log(`${checked} TypeScript listings checked with ${version}, ${compared} compared with a printed panel, ${problems} problem(s)`);
process.exit(problems ? 1 : 0);
