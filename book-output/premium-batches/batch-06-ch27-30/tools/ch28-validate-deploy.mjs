// QA only (batch 06): validates chapter-28 deployment files without Docker or GitHub.
//  1. compose.yaml and .github/workflows/ci.yml parsed with two real YAML parsers (yaml 2.x and js-yaml, the
//     verified local copies inside firebase-tools; nothing installed) and checked structurally.
//  2. Every npm script / file the workflow calls exists.
//  3. Starts main.mjs in production mode on a free port and runs scripts/smoke.mjs against it.
//  4. Records whether a Docker daemon is reachable; docker build / compose up are reported NOT RUN otherwise.
// Usage: node tools/ch28-validate-deploy.mjs <chapter-28-dir>
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';

const ROOT = 'C:/Users/T/AppData/Roaming/npm/node_modules/firebase-tools/node_modules/';
const req = createRequire(`${ROOT}noop.js`);
const YAML = req('yaml');
const jsyaml = req('js-yaml');
const project = path.resolve(process.argv[2], 'project/deploy-ready');
const read = (rel) => fs.readFileSync(path.join(project, rel), 'utf8');
let failed = 0;
const check = (name, ok, detail = '') => { if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`); };

console.log(`yaml ${req('yaml/package.json').version}, js-yaml ${req('js-yaml/package.json').version}`);
// Files the design system cannot verify as listings (no code extension) are printed verbatim here, so the
// chapter's `cat` output panels for them are checked against this log.
for (const file of ['Dockerfile', '.dockerignore']) console.log(`----- cat ${file} -----
${read(file).trimEnd()}
----- end ${file} -----`);
for (const file of ['compose.yaml', '.github/workflows/ci.yml']) {
  const text = read(file);
  const doc = YAML.parseDocument(text);
  check(`${file}: parses with yaml (no errors, no warnings)`, doc.errors.length === 0 && doc.warnings.length === 0, doc.errors.map(String).join('; '));
  check(`${file}: js-yaml agrees on the same data`, JSON.stringify(jsyaml.load(text)) === JSON.stringify(doc.toJS()));
}

const compose = YAML.parse(read('compose.yaml'));
const api = compose.services?.api;
check('compose: services.api with build context', api?.build === '.');
check('compose: ports bound to 127.0.0.1 only', api.ports.every((p) => p.startsWith('127.0.0.1:')), api.ports.join(', '));
check('compose: secrets come from env_file, not inline values', api.env_file === '.env' && !('OPS_TOKEN' in api.environment));
const grace = parseInt(api.stop_grace_period, 10) * 1000;
const budget = Number(api.environment.DRAIN_DELAY_MS) + Number(api.environment.SHUTDOWN_TIMEOUT_MS);
check('compose: drain + shutdown timeout fit inside stop_grace_period', budget < grace, `${budget} ms < ${grace} ms`);
check('compose: hardening (read_only, cap_drop ALL, no-new-privileges)', api.read_only === true && api.cap_drop.includes('ALL') && api.security_opt.includes('no-new-privileges:true'));
check('.env.example exists and .env is not committed', fs.existsSync(path.join(project, '.env.example')) && !fs.existsSync(path.join(project, '.env')));

const ci = YAML.parse(read('.github/workflows/ci.yml'));
check('ci: triggers on push and pull_request', 'push' in ci.on && 'pull_request' in ci.on);
check('ci: least-privilege permissions (contents: read only)', JSON.stringify(ci.permissions) === '{"contents":"read"}');
check('ci: image job needs test job', ci.jobs.image.needs === 'test');
check('ci: every job has timeout-minutes', Object.values(ci.jobs).every((j) => Number.isInteger(j['timeout-minutes'])));
const pkg = JSON.parse(read('package.json'));
const runs = Object.values(ci.jobs).flatMap((j) => j.steps).map((s) => s.run).filter(Boolean).join('\n');
for (const script of [...runs.matchAll(/npm (?:run )?(\w+)/g)].map((m) => m[1])) {
  check(`ci: npm script "${script}" exists in package.json`, script === 'test' ? Boolean(pkg.scripts.test) : Boolean(pkg.scripts[script]));
}
for (const file of [...runs.matchAll(/node (\S+\.mjs)/g)].map((m) => m[1])) check(`ci: called file ${file} exists`, fs.existsSync(path.join(project, file)));
const actions = Object.values(ci.jobs).flatMap((j) => j.steps).map((s) => s.uses).filter(Boolean);
console.log(`INFO  actions referenced by tag (not SHA-pinned; the chapter says to pin by SHA in production): ${[...new Set(actions)].join(', ')}`);

// 3. production-mode start + smoke test
const port = 39128;
const token = 'qa-'.padEnd(32, 'x');
const env = { ...process.env, NODE_ENV: 'production', PORT: String(port), OPS_TOKEN: token, APP_VERSION: '1.0.0', GIT_SHA: 'qa' };
const child = spawn(process.execPath, ['main.mjs'], { cwd: project, env });
let out = '';
child.stdout.on('data', (d) => { out += d; });
for (let i = 0; i < 50 && !out.includes('server.started'); i++) await new Promise((r) => setTimeout(r, 100));
check('main.mjs starts in production mode and logs JSON', out.split('\n').filter(Boolean).every((l) => { try { JSON.parse(l); return true; } catch { return false; } }) && out.includes('"server.started"'));
check('startup log redacts OPS_TOKEN', !out.includes(token) && out.includes('[REDACTED]'));
const smoke = spawnSync(process.execPath, ['scripts/smoke.mjs', `http://127.0.0.1:${port}`], { cwd: project, env: { ...process.env, OPS_TOKEN: token }, encoding: 'utf8' });
console.log(smoke.stdout.trimEnd().split('\n').map((l) => `      ${l}`).join('\n'));
check('scripts/smoke.mjs passes against the running server', smoke.status === 0);
const noToken = spawnSync(process.execPath, ['scripts/smoke.mjs', `http://127.0.0.1:${port}`], { cwd: project, env: { ...process.env, OPS_TOKEN: '' }, encoding: 'utf8' });
check('smoke test fails (exit 1) when the token is missing', noToken.status === 1, noToken.stdout.split('\n').find((l) => l.startsWith('FAIL')));
child.kill();

// 4. Docker
const docker = spawnSync('docker', ['version', '--format', '{{.Server.Version}}'], { encoding: 'utf8' });
const daemon = docker.status === 0 && docker.stdout.trim();
console.log(daemon ? `INFO  Docker daemon ${daemon} reachable` : `NOT RUN  docker build / docker compose up: Docker daemon not reachable (${(docker.stderr || docker.error?.message || '').split('\n')[0].trim()})`);
console.log('NOT RUN  GitHub Actions workflow: validated as YAML and cross-checked only; it has not run on GitHub');
console.log(`${failed} failed`);
process.exit(failed ? 1 : 0);
