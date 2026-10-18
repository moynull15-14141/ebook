// Builds JavaScript_Mastery_Companion_Code.zip from the 30 registry chapters: chapter-NN/project/<name>/ and
// chapter-NN/examples/, plus a root README.md. Deterministic (fixed timestamps, sorted entries).
// Excluded: node_modules, .git, dist, .build, coverage, caches, runtime databases, logs, temp files, .env (but
// .env.example is kept). Then validates the archive: re-reads every entry, checks CRC-32 and sizes, extracts it to a
// temporary folder and runs the automated tests of every project that needs no npm install.
// Usage: node build/make-zip.mjs        (run from book-output/final-edition)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const BUILD = path.dirname(fileURLToPath(import.meta.url));
const FINAL = path.resolve(BUILD, '..');
const REPO = path.resolve(FINAL, '..', '..');
const OUT = path.join(FINAL, 'JavaScript_Mastery_Companion_Code.zip');
const ROOT = 'JavaScript_Mastery_Companion_Code';
const registry = JSON.parse(fs.readFileSync(path.join(FINAL, 'FINAL_CHAPTER_REGISTRY.json'), 'utf8'));
const book = JSON.parse(fs.readFileSync(path.join(BUILD, 'work', 'book.json'), 'utf8'));
const BN = (n) => String(n).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);

const EXCLUDE_DIR = new Set(['node_modules', '.git', 'dist', '.build', 'coverage', '.cache', '.nyc_output', 'tmp']);
const EXCLUDE_FILE = (name) => name === '.env' || /\.(db|db-wal|db-shm|sqlite|log|tmp)$/i.test(name) || ['Thumbs.db', '.DS_Store', 'desktop.ini'].includes(name);
const SECRET = /BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|xox[bp]-[A-Za-z0-9-]+/;
const MACHINE_PATH = /[A-Z]:[\\/](Users|MoynullHasan)[\\/]/i;

const entries = [];
const excluded = [];
function addTree(src, dest) {
  for (const e of fs.readdirSync(src, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const from = path.join(src, e.name), to = `${dest}/${e.name}`;
    if (e.isDirectory()) {
      if (EXCLUDE_DIR.has(e.name)) { excluded.push(to); continue; }
      addTree(from, to);
    } else {
      if (EXCLUDE_FILE(e.name)) { excluded.push(to); continue; }
      const data = fs.readFileSync(from);
      if (data.length < 2e6 && !/\.(png|jpe?g|ico|woff2?)$/i.test(e.name)) {
        const text = data.toString('utf8');
        if (SECRET.test(text)) throw new Error(`Secret-like content in ${from}`);
        if (MACHINE_PATH.test(text)) throw new Error(`Machine-specific path in ${from}`);
      }
      entries.push({ name: to, data });
    }
  }
}

const projects = [];
for (const c of registry.chapters) {
  const nn = String(c.number).padStart(2, '0');
  const chapterDir = path.dirname(path.join(REPO, c.paths.markdown));
  const projectDir = path.join(REPO, c.paths.project);
  const name = path.basename(projectDir);
  addTree(projectDir, `${ROOT}/chapter-${nn}/project/${name}`);
  if (fs.existsSync(path.join(chapterDir, 'examples'))) addTree(path.join(chapterDir, 'examples'), `${ROOT}/chapter-${nn}/examples`);
  const pkgFile = path.join(projectDir, 'package.json');
  const pkg = fs.existsSync(pkgFile) ? JSON.parse(fs.readFileSync(pkgFile, 'utf8')) : null;
  projects.push({ number: c.number, nn, name, title: c.title, pkg, deps: Object.keys({ ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) }) });
}

// ---------- root README ----------
const readme = `# JavaScript Mastery — শূন্য থেকে প্রফেশনাল: Companion Code

লেখক: Moynul Hasan

এই Archive-এ বইয়ের ৩০টি অধ্যায়ের সব Project ও উদাহরণ আছে। বইয়ে যে Path দেখানো (যেমন \`project/travel-live/src/gateway.mjs\` বা \`examples/02-sse-basic.mjs\`), তা সংশ্লিষ্ট \`chapter-NN/\` Folder থেকে হুবহু একই। উদাহরণের File-গুলো \`../project/...\` দিয়ে Project-এর Code Import করে, তাই Folder-এর গঠন বদলাবেন না।

## প্রয়োজন

| বিষয় | প্রয়োজন |
| --- | --- |
| Node.js | 22.5 বা নতুন (অধ্যায় ২৬, ২৭-এর Outbox, ২৯ ও ৩০-এ \`node:sqlite\`); অন্য অধ্যায় 20+ |
| Browser | আধুনিক Chrome, Edge বা Firefox; Browser Project Local HTTP Server থেকে খুলুন |
| TypeScript | অধ্যায় ২৪-এ প্রয়োজন, অধ্যায় ৩০-এ ঐচ্ছিক (\`npm install\` করলে আসে) |
| Database | আলাদা Server লাগে না (SQLite Node.js-এর অন্তর্নির্মিত); অধ্যায় ২৬-এর PostgreSQL Adapter ঐচ্ছিক, চালানো হয়নি |
| বাইরের npm Package | শুধু: অধ্যায় ২৪ (typescript, @types/node), ২৫ (express), ২৭ (ws), ৩০ (ঐচ্ছিক typescript, @types/node) |
| Docker | ঐচ্ছিক (অধ্যায় ২৮); যাচাইয়ে Docker Build চালানো হয়নি |

## চালানো

1. সংশ্লিষ্ট \`chapter-NN/project/<নাম>/\` Folder-এ যান এবং সেখানকার README পড়ুন।
2. \`package.json\`-এ Dependency থাকলে আগে \`npm install\`।
3. Test: \`npm test\` (বা \`node --test\`)। Browser Project: Folder-এ \`npx serve\` বা \`python -m http.server 8000\` চালিয়ে Browser-এ খুলুন।

## Project-এর তালিকা

| অধ্যায় | Folder | npm Package |
| --- | --- | --- |
${projects.map((p) => `| ${p.number} — ${p.title} | \`chapter-${p.nn}/project/${p.name}/\` | ${p.deps.length ? p.deps.join(', ') : '—'} |`).join('\n')}

## যাচাই-পরিবেশ

সব Code Windows 10, Node.js 22.16.0 ও Chrome 155-এ চালিয়ে দেখা হয়েছে। চালানো হয়নি: PostgreSQL ও Prisma (অধ্যায় ২৬), Socket.IO ও Redis (অধ্যায় ২৭), Docker Build ও GitHub Actions (অধ্যায় ২৮), কোনো আসল Payment Gateway (অধ্যায় ২৯, ৩০)। বিস্তারিত বইয়ের পরিশিষ্ট গ-তে।

## License

[লেখক নির্ধারণ করবেন — এখনো নির্ধারিত হয়নি]

এই Code শিক্ষামূলক। প্রতিটি README-তে লেখা আছে কোন অংশ Production-এর জন্য যথেষ্ট নয়। কোনো Secret বা আসল Credential এখানে নেই; Demo Token ও Test Token স্পষ্টভাবে চিহ্নিত।
`;
entries.unshift({ name: `${ROOT}/README.md`, data: Buffer.from(readme, 'utf8') });

// ---------- write the ZIP (stored timestamps fixed for reproducibility) ----------
function zip(list) {
  const chunks = [], central = [];
  let offset = 0;
  for (const { name, data } of list) {
    const nb = Buffer.from(name, 'utf8'), comp = zlib.deflateRawSync(data, { level: 9 }), crc = zlib.crc32(data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(8, 8);
    lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0x5c21, 12); lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(nb.length, 26); lh.writeUInt16LE(0, 28);
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6); cd.writeUInt16LE(0x0800, 8); cd.writeUInt16LE(8, 10);
    cd.writeUInt16LE(0, 12); cd.writeUInt16LE(0x5c21, 14); cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(comp.length, 20); cd.writeUInt32LE(data.length, 24); cd.writeUInt16LE(nb.length, 28); cd.writeUInt32LE(offset, 42);
    chunks.push(lh, nb, comp); central.push(cd, nb);
    offset += 30 + nb.length + comp.length;
  }
  const dir = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(list.length, 8); end.writeUInt16LE(list.length, 10);
  end.writeUInt32LE(dir.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, dir, end]);
}
fs.writeFileSync(OUT, zip(entries));

// ---------- validate: read back every entry from the central directory ----------
const buf = fs.readFileSync(OUT);
const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
const count = buf.readUInt16LE(eocd + 10), cdOffset = buf.readUInt32LE(eocd + 16);
const extracted = [];
let pos = cdOffset, crcErrors = 0;
for (let i = 0; i < count; i++) {
  const nameLen = buf.readUInt16LE(pos + 28), extraLen = buf.readUInt16LE(pos + 30), commentLen = buf.readUInt16LE(pos + 32);
  const crc = buf.readUInt32LE(pos + 16), csize = buf.readUInt32LE(pos + 20), usize = buf.readUInt32LE(pos + 24), local = buf.readUInt32LE(pos + 42);
  const name = buf.toString('utf8', pos + 46, pos + 46 + nameLen);
  const lnl = buf.readUInt16LE(local + 26), lel = buf.readUInt16LE(local + 28);
  const data = zlib.inflateRawSync(buf.subarray(local + 30 + lnl + lel, local + 30 + lnl + lel + csize));
  if (data.length !== usize || zlib.crc32(data) !== crc) crcErrors++;
  extracted.push({ name, data });
  pos += 46 + nameLen + extraLen + commentLen;
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jsm-zip-'));
for (const { name, data } of extracted) {
  const target = path.join(tmp, ...name.split('/'));
  if (!target.startsWith(tmp)) throw new Error(`Unsafe path in archive: ${name}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, data);
}
const chapterFolders = new Set(extracted.map((e) => e.name.split('/')[1]).filter((n) => /^chapter-\d\d$/.test(n)));

// ---------- re-run project tests from the extracted archive (projects without npm dependencies) ----------
const runs = [];
const HOOKED = new Set(['express', 'ws']);
const LOCAL_DEPS = 'file:///D:/MoynullHasan/ebook/allcopy/book-output/premium-batches/batch-06-ch27-30/tools/local-deps.mjs';
for (const p of projects) {
  const dir = path.join(tmp, ROOT, `chapter-${p.nn}`, 'project', p.name);
  const hasTests = ['tests', 'test'].some((t) => fs.existsSync(path.join(dir, t))) || fs.readdirSync(dir).some((f) => /\.test\.m?js$/.test(f));
  if (!hasTests) { runs.push({ chapter: p.number, project: p.name, result: 'no automated tests in project (verified by chapter listings / browser QA)' }); continue; }
  // Runtime packages (express, ws) come from the verified local copies through the QA-only resolve hook, exactly as
  // in the chapter QA; nothing is installed. A test script that compiles TypeScript first cannot run without npm install.
  const runtime = Object.keys(p.pkg?.dependencies ?? {});
  const needsTsc = /\btsc\b/.test(p.pkg?.scripts?.test ?? '');
  if (needsTsc || runtime.some((d) => !HOOKED.has(d))) { runs.push({ chapter: p.number, project: p.name, result: `NOT RUN here: test script needs npm install (${p.deps.join(', ')}); covered by the chapter QA` }); continue; }
  const args = runtime.length ? ['--import', LOCAL_DEPS, '--test'] : ['--test'];
  const r = spawnSync(process.execPath, args, { cwd: dir, encoding: 'utf8', timeout: 300000 });
  const pass = +(/^# pass (\d+)/m.exec(r.stdout) ?? [0, 0])[1], fail = +(/^# fail (\d+)/m.exec(r.stdout) ?? [0, 0])[1];
  if (pass + fail === 0) { runs.push({ chapter: p.number, project: p.name, result: 'NOT RUN here: no JavaScript tests run without the build step (npm install, then npm test); covered by the chapter QA' }); continue; }
  runs.push({ chapter: p.number, project: p.name, result: r.status === 0 && fail === 0 ? 'PASS' : 'FAIL', pass, fail, ...(runtime.length ? { via: 'QA-only local-deps hook (express/ws local copies)' } : {}) });
}
try { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); } catch { /* temp may linger on Windows */ }

const data = {
  zip: path.basename(OUT), bytes: buf.length, entries: count, crcErrors, chapterFolders: chapterFolders.size,
  excluded, uncompressedBytes: extracted.reduce((s, e) => s + e.data.length, 0), testRunsFromArchive: runs,
};
fs.writeFileSync(path.join(BUILD, 'work', 'zip-data.json'), JSON.stringify(data, null, 2) + '\n');
const passed = runs.filter((r) => r.result === 'PASS');
console.log(`ZIP ${data.zip}: ${(buf.length / 1048576).toFixed(2)} MB, ${count} files, ${chapterFolders.size} chapter folders, CRC errors ${crcErrors}, excluded ${excluded.length}`);
console.log(`tests from extracted archive: ${passed.length} projects PASS (${passed.reduce((s, r) => s + r.pass, 0)} tests), ${runs.filter((r) => r.result === 'FAIL').length} FAIL, ${runs.filter((r) => r.result.startsWith('NOT RUN')).length} need npm install, ${runs.filter((r) => r.result.startsWith('no automated')).length} without node tests`);
for (const r of runs.filter((x) => x.result !== 'PASS')) console.log(`  ch${r.chapter} ${r.project}: ${r.result}${r.fail ? ` (${r.fail} failed)` : ''}`);
