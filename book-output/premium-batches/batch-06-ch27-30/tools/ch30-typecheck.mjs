// QA only (batch 06): runs the project's `npm run typecheck` equivalent (tsc -p tsconfig.json: checkJs + strict on
// src/**/*.mjs with JSDoc types) using the verified local TypeScript inside firebase-tools; nothing is installed.
// Also proves the check is live: a copy of src with one deliberate type error must fail.
// Usage: node tools/ch30-typecheck.mjs <chapter-30-dir>
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const GLOBAL = 'C:/Users/T/AppData/Roaming/npm/node_modules/firebase-tools/node_modules';
const TSC = process.env.TSC ?? `${GLOBAL}/typescript/bin/tsc`;
const TYPES = process.env.TS_TYPES ?? `${GLOBAL}/@types`;
const project = path.resolve(process.argv[2], 'project/travel-master-pro');
const run = (dir) => spawnSync(process.execPath, [TSC, '-p', path.join(dir, 'tsconfig.json'), '--typeRoots', TYPES, '--pretty', 'false'], { encoding: 'utf8' });

console.log(spawnSync(process.execPath, [TSC, '--version'], { encoding: 'utf8' }).stdout.trim(),
  `| @types/node ${JSON.parse(fs.readFileSync(`${TYPES}/node/package.json`, 'utf8')).version}`);
const files = fs.readdirSync(path.join(project, 'src')).filter((f) => f.endsWith('.mjs'));
const real = run(project);
console.log(`${real.status === 0 ? 'PASS' : 'FAIL'}  strict checkJs on ${files.length} files in src/: exit ${real.status}${real.stdout ? `\n${real.stdout}` : ''}`);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tmp-tsc-'));
fs.cpSync(path.join(project, 'src'), path.join(tmp, 'src'), { recursive: true });
fs.copyFileSync(path.join(project, 'tsconfig.json'), path.join(tmp, 'tsconfig.json'));
const target = path.join(tmp, 'src', 'validation.mjs');
fs.writeFileSync(target, fs.readFileSync(target, 'utf8').replace('return { packageId, travelers, idempotencyKey };',
  'return { packageId, travelers: String(travelers), idempotencyKey };'));
const broken = run(tmp);
fs.rmSync(tmp, { recursive: true, force: true });
const caught = broken.status !== 0 && /TS2322/.test(broken.stdout);
console.log(`${caught ? 'PASS' : 'FAIL'}  control: a deliberate type error is reported (${broken.stdout.trim().split('\n')[0].replace(/^.*src[\\/]/, 'src/')})`);
process.exit(real.status === 0 && caught ? 0 : 1);
