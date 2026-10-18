// Builds (and optionally checks) every chapter listed in config/book.json with the same templates and tokens.
// Usage: node scripts/build-book.mjs [--qa] [--only 1,2,5]
// Each chapter is built as its own PDF and DOCX. Binding all chapters into one volume with front matter and a
// table of contents is not implemented yet; see docs/PDF_DOCX_BUILD_GUIDE.md, "Complete book".
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { SYSTEM, book } from './lib/tokens.mjs';

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',').map(Number) : null;
const run = (script, dir, extra = []) => spawnSync(process.execPath, [path.join(SYSTEM, 'scripts', script), dir, ...extra], { stdio: 'inherit' }).status === 0;
const report = [];
for (const c of book.chapters) {
  if (only && !only.includes(c.number)) continue;
  const dir = path.resolve(SYSTEM, 'config', c.dir);
  console.log(`\n=== Chapter ${c.number} — ${path.relative(process.cwd(), dir)} ===`);
  const built = run('build-chapter.mjs', dir);
  const qa = built && args.includes('--qa') ? run('qa-chapter.mjs', dir) : null;
  report.push({ chapter: c.number, built, qa });
}
console.log('\nSummary');
for (const r of report) console.log(`  chapter ${String(r.chapter).padStart(2)}: build ${r.built ? 'ok' : 'FAILED'}${r.qa === null ? '' : `, QA ${r.qa ? 'passed' : 'FAILED'}`}`);
process.exit(report.every(r => r.built && r.qa !== false) ? 0 : 1);
