// Assembles the complete manuscript of JavaScript Mastery from the 30 premium chapter Markdown files listed in
// FINAL_CHAPTER_REGISTRY.json. Deterministic: the same inputs always give the same output. The chapter source files
// are only read, never written. Every change made to chapter text in the assembled copy is an exact-match edit that
// must apply exactly once, and is logged in work/assembly-log.json.
// Output: ../JavaScript_Mastery_Complete_Manuscript.md and work/book.json (structure for the renderers).
// Usage: node build/assemble.mjs        (run from book-output/final-edition)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const BUILD = path.dirname(fileURLToPath(import.meta.url));
const FINAL = path.resolve(BUILD, '..');
const REPO = path.resolve(FINAL, '..', '..');
const WORK = path.join(BUILD, 'work');
fs.mkdirSync(WORK, { recursive: true });
const BN = (n) => String(n).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

const registry = JSON.parse(fs.readFileSync(path.join(FINAL, 'FINAL_CHAPTER_REGISTRY.json'), 'utf8'));
if (!registry.validation?.valid || registry.chapters.length !== 30) throw new Error('Registry is not valid or does not have 30 chapters');
registry.chapters.forEach((c, i) => { if (c.number !== i + 1) throw new Error(`Registry order broken at ${i + 1}`); });

// ---------- minimal, logged fixes to reader-facing text (assembled copy only) ----------
// "v30" is the internal name of the source manuscript; readers of the book do not know it.
const EDITS = {
  23: [['v30-এর অধ্যায় ১৯ ও ২৩—দুটিই Performance নিয়ে।', 'এই বইয়ের অধ্যায় ১৯ ও ২৩—দুটিই Performance নিয়ে।']],
  24: [['Booking নয়—v30-এর Booking API-র বদলে এই Domain বেছে নেওয়া হয়েছে', 'Booking নয়—এই Domain বেছে নেওয়া হয়েছে']],
  26: [['> **নোট:** v30-এর এই অধ্যায় PostgreSQL ও Prisma-কেন্দ্রিক।', '> **নোট:** এই অধ্যায়ের মূল পরিকল্পনা PostgreSQL ও Prisma-কেন্দ্রিক।'],
    ['v30-এর TravelData Pro-র নাম রাখা হয়েছে; Domain হিসেবে', 'Project-এর নাম TravelData Pro; Domain হিসেবে']],
  27: [['এটি v30-এর TravelLive Simulator-এর সব নিয়ম রাখে', 'এটি একটি in-memory TravelLive Simulator-এর সব নিয়ম রাখে']],
  30: [['> **নোট:** v30-এর Capstone-এ সব অবস্থা একটি Process-এর Memory-তে ছিল এবং Browser UI তৈরি বা পরীক্ষা করা হয়নি। এই Premium সংস্করণে TravelMaster Pro',
    '> **নোট:** এই Capstone-এর প্রথম পরিকল্পনায় সব অবস্থা একটি Process-এর Memory-তে ছিল এবং কোনো Browser UI ছিল না। এই বইয়ে TravelMaster Pro'],
  ['v30-এর নকশায় Logout Token যাচাই না করেই', 'প্রথম নকশায় Logout Token যাচাই না করেই']],
};
const log = [];
function applyEdits(n, md) {
  for (const [from, to] of EDITS[n] ?? []) {
    const count = md.split(from).length - 1;
    if (count !== 1) throw new Error(`Chapter ${n}: edit must match exactly once, matched ${count}: ${from.slice(0, 50)}`);
    md = md.replace(from, () => to);
    log.push({ chapter: n, kind: 'text', from, to });
  }
  return md;
}

// Short running titles: a long title would wrap the running header to two lines (known issue).
const RUNNING_MAX = 46;
function runningTitle(title) {
  if ([...title].length <= RUNNING_MAX) return title;
  // Cut at the last separator (comma, colon or " এবং ") that still fits.
  const cuts = [...title.matchAll(/,|:| এবং /g)].map((m) => m.index)
    .filter((i) => [...title.slice(0, i)].length <= RUNNING_MAX);
  return cuts.length ? title.slice(0, Math.max(...cuts)).trim()
    : `${[...title].slice(0, RUNNING_MAX - 1).join('')}…`;
}

const section = (md, re) => {
  const start = md.search(re);
  if (start < 0) return '';
  const rest = md.slice(start).replace(/^## .+\n/, '');
  const end = rest.search(/^## /m);
  return end < 0 ? rest : rest.slice(0, end);
};
const tableRows = (text) => text.split('\n').filter((l) => /^\s*\|/.test(l)).slice(2)
  .map((l) => l.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim()));

// ---------- chapters ----------
const chapters = [];
for (const entry of registry.chapters) {
  const src = path.join(REPO, entry.paths.markdown);
  const dir = path.dirname(src);
  let md = fs.readFileSync(src, 'utf8').replace(/\r\n/g, '\n');
  const sourceSha = sha(md);
  if (sourceSha !== entry.lastVerifiedBuild.markdownSha256) throw new Error(`Chapter ${entry.number}: source differs from the registry fingerprint`);
  md = applyEdits(entry.number, md);
  // Images: copy next to the manuscript and point the path there.
  md = md.replace(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/gm, (line, alt, rel) => {
    const from = path.resolve(dir, rel);
    const target = `assets/chapter-${String(entry.number).padStart(2, '0')}/${path.basename(rel)}`;
    fs.mkdirSync(path.join(FINAL, path.dirname(target)), { recursive: true });
    fs.copyFileSync(from, path.join(FINAL, target));
    log.push({ chapter: entry.number, kind: 'image-path', from: rel, to: target });
    return `![${alt}](${target})`;
  });
  const lines = md.split('\n');
  const h1 = /^# অধ্যায় (\S+) — (.+)$/.exec(lines[0]);
  if (!h1) throw new Error(`Chapter ${entry.number}: bad H1`);
  const h2 = [...md.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
  const glossary = tableRows(section(md, /^## \S+ গুরুত্বপূর্ণ পরিভাষা$/m)).map(([term, meaning]) => ({ term, meaning }));
  const reading = section(md, /^## \S+ আরও পড়ুন$/m).split('\n').filter((l) => /^- /.test(l)).map((l) => {
    const url = /`(https?:\/\/[^`]+)`/.exec(l)?.[1];
    return { line: l.slice(2), url };
  });
  if (!glossary.length || !reading.length) throw new Error(`Chapter ${entry.number}: glossary or reading list not found`);
  const projectDir = path.join(REPO, entry.paths.project);
  chapters.push({
    number: entry.number, label: `অধ্যায় ${h1[1]}`, title: h1[2], running: runningTitle(h1[2]),
    id: `ch${String(entry.number).padStart(2, '0')}`, source: entry.paths.markdown, sourceDir: path.relative(FINAL, dir).replaceAll('\\', '/'),
    sourceSha256: sourceSha, h2, glossary, reading, projectDir, project: path.basename(projectDir), md,
  });
  if (chapters.at(-1).running !== h1[2]) log.push({ chapter: entry.number, kind: 'running-title', from: h1[2], to: chapters.at(-1).running });
}

// ---------- back matter ----------
// Appendix A: glossary from every chapter's terminology table, merged by term.
const terms = new Map();
for (const c of chapters) {
  for (const { term, meaning } of c.glossary) {
    const key = term.replace(/[`*]/g, '').toLowerCase();
    const e = terms.get(key) ?? { term, meaning, chapters: [] };
    if (!e.chapters.includes(c.number)) e.chapters.push(c.number);
    terms.set(key, e);
  }
}
const glossary = [...terms.values()].sort((a, b) => a.term.replace(/[`*]/g, '').localeCompare(b.term.replace(/[`*]/g, ''), 'en', { sensitivity: 'base' }));
const glossaryMd = `# পরিশিষ্ট ক — পরিভাষা-কোষ

প্রতিটি অধ্যায়ের শেষের পরিভাষার সারণি এখানে একত্র করা হয়েছে, বর্ণানুক্রমে (ইংরেজি পরিভাষা আগে)। একই পরিভাষা একাধিক অধ্যায়ে থাকলে প্রথম অধ্যায়ের সংজ্ঞা দেওয়া হয়েছে, আর ডান কলামে সব অধ্যায়ের নম্বর। মোট ${BN(glossary.length)}টি পরিভাষা।

| পরিভাষা | অর্থ | অধ্যায় |
| --- | --- | --- |
${glossary.map((g) => `| ${g.term} | ${g.meaning} | ${g.chapters.map(BN).join(', ')} |`).join('\n')}
`;

// Appendix B: companion projects, read from each project folder.
function projectInfo(c) {
  const pkgFile = path.join(c.projectDir, 'package.json');
  const pkg = fs.existsSync(pkgFile) ? JSON.parse(fs.readFileSync(pkgFile, 'utf8')) : null;
  const files = fs.readdirSync(c.projectDir);
  const deps = Object.keys({ ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) });
  const hasTests = fs.existsSync(path.join(c.projectDir, 'tests')) || fs.existsSync(path.join(c.projectDir, 'test'))
    || files.some((f) => /\.test\.m?js$/.test(f));
  const run = [];
  if (pkg?.scripts?.test) run.push('`npm test`');
  else if (hasTests) run.push('`node --test`');
  if (files.includes('index.html')) run.push('Local Server-এ `index.html`');
  else if (pkg?.scripts?.start) run.push('`npm start`');
  return { deps, run: run.join('; ') || '`node` দিয়ে File চালান (README দেখুন)', type: files.includes('index.html') ? 'Browser' : 'Node.js' };
}
const projectsMd = `# পরিশিষ্ট খ — Companion Project-এর তালিকা

প্রতিটি অধ্যায়ের Project Companion Code-এ \`chapter-NN/project/<নাম>/\` Folder-এ, আর অধ্যায়ের উদাহরণ ও সমাধান \`chapter-NN/examples/\`-এ। প্রতিটি Project-এর README-তে বিস্তারিত চালানোর নিয়ম ও সীমাবদ্ধতা আছে।

| অধ্যায় | Project | ধরন | চালানো | npm Package |
| --- | --- | --- | --- | --- |
${chapters.map((c) => { const p = projectInfo(c); return `| ${BN(c.number)} | \`${c.project}\` | ${p.type} | ${p.run} | ${p.deps.length ? p.deps.map((d) => `\`${d}\``).join(', ') : 'নেই'} |`; }).join('\n')}
`;

// Appendix C: verification environment, from each chapter's recorded QA logs.
const unitPass = (c) => {
  const logFile = path.join(REPO, path.dirname(c.source), 'qa-logs', 'unit-tests.log');
  const m = fs.existsSync(logFile) ? /^# pass (\d+)/m.exec(fs.readFileSync(logFile, 'utf8')) : null;
  return m ? +m[1] : null;
};
const testCounts = chapters.map((c) => ({ n: c.number, pass: unitPass(c) }));
const knownTests = testCounts.filter((t) => t.pass !== null);
const verificationMd = `# পরিশিষ্ট গ — যাচাই-পরিবেশ

এই বইয়ের Code যে পরিবেশে চালিয়ে দেখা হয়েছে, এবং কী চালানো হয়নি—সংক্ষেপে।

| বিষয় | সংস্করণ বা অবস্থা |
| --- | --- |
| Operating System | Windows 10 Pro (x64) |
| Node.js | 22.16.0 |
| Browser | Google Chrome 155 (Headless, Chrome DevTools Protocol দিয়ে) |
| TypeScript | 6.0.2, @types/node 25.6.0 (অধ্যায় ২৪, ৩০) |
| npm Package (Install না করে, আগে থেকে থাকা কপি) | express 4.22.1 (অধ্যায় ২৫), ws 7.5.10 (অধ্যায় ২৭), yaml 2.8.3 ও js-yaml 3.14.2 (অধ্যায় ২৮-এর যাচাই) |
| Database | SQLite (Node.js-এর \`node:sqlite\`) |

**প্রতিটি অধ্যায়ের Project-এর স্বয়ংক্রিয় Test** (\`node --test\`, শেষ যাচাইয়ে পাস করা Test-এর সংখ্যা): ${knownTests.map((t) => `অধ্যায় ${BN(t.n)}: ${BN(t.pass)}`).join('; ')}। মোট ${BN(knownTests.reduce((s, t) => s + t.pass, 0))}টি।${knownTests.length < 30 ? ` বাকি অধ্যায়গুলোর Project-এর যাচাই অন্যভাবে (Listing চালানো ও Browser-এ পরীক্ষা) নথিভুক্ত।` : ''}

**চালানো হয়নি (সংশ্লিষ্ট অধ্যায়ে চিহ্নিত):** PostgreSQL ও Prisma-র Code (অধ্যায় ২৬); Socket.IO ও Redis (অধ্যায় ২৭; Redis-এর আচরণ in-memory অনুকরণে); \`docker build\`, \`docker compose up\` এবং GitHub Actions Workflow (অধ্যায় ২৮); কোনো আসল Payment Gateway (অধ্যায় ২৯, ৩০)। macOS, Linux, Firefox ও Safari-তে আলাদা পরীক্ষা করা হয়নি।
`;

// Appendix D: all further-reading entries, de-duplicated by address, in chapter order.
const seen = new Map();
for (const c of chapters) for (const r of c.reading) {
  const key = r.url ?? r.line;
  const e = seen.get(key) ?? { line: r.line, chapters: [] };
  e.chapters.push(c.number);
  seen.set(key, e);
}
const refsByFirst = new Map();
for (const e of seen.values()) {
  const first = e.chapters[0];
  refsByFirst.set(first, [...(refsByFirst.get(first) ?? []), e]);
}
const referencesMd = `# পরিশিষ্ট ঘ — তথ্যসূত্র ও আরও পড়ুন

প্রতিটি অধ্যায়ের "আরও পড়ুন" তালিকা একত্রে, প্রথম যে অধ্যায়ে এসেছে সেই অনুসারে সাজানো; একই ঠিকানা একাধিক অধ্যায়ে থাকলে শুধু একবার, বন্ধনীতে অন্য অধ্যায়গুলোর নম্বর। মোট ${BN(seen.size)}টি সূত্র। প্রকাশের সময় ঠিকানাগুলো বদলে থাকতে পারে।

${chapters.filter((c) => refsByFirst.has(c.number)).map((c) => `## অধ্যায় ${BN(c.number)}

${refsByFirst.get(c.number).map((e) => `- ${e.line}${e.chapters.length > 1 ? ` (অধ্যায় ${e.chapters.slice(1).map(BN).join(', ')}-এও)` : ''}`).join('\n')}`).join('\n\n')}
`;

// ---------- front matter and table of contents ----------
const front = fs.readFileSync(path.join(BUILD, 'frontmatter.md'), 'utf8').replace(/\r\n/g, '\n').trim();
const backParts = [
  { id: 'appendix-a', title: 'পরিশিষ্ট ক — পরিভাষা-কোষ', md: glossaryMd },
  { id: 'appendix-b', title: 'পরিশিষ্ট খ — Companion Project-এর তালিকা', md: projectsMd },
  { id: 'appendix-c', title: 'পরিশিষ্ট গ — যাচাই-পরিবেশ', md: verificationMd },
  { id: 'appendix-d', title: 'পরিশিষ্ট ঘ — তথ্যসূত্র ও আরও পড়ুন', md: referencesMd },
];
const tocMd = `# সূচিপত্র

${chapters.map((c) => `- **${c.label} — ${c.title}**\n${c.h2.map((h) => `  - ${h}`).join('\n')}`).join('\n')}
${backParts.map((b) => `- **${b.title}**`).join('\n')}
`;

const parts = [
  front,
  `<!-- jsm:part kind=toc id=toc -->\n${tocMd.trim()}`,
  ...chapters.map((c) => `<!-- jsm:part kind=chapter id=${c.id} n=${c.number} source=${c.source} -->\n${c.md.trim()}`),
  ...backParts.map((b) => `<!-- jsm:part kind=back id=${b.id} -->\n${b.md.trim()}`),
];
const manuscript = `${parts.join('\n\n')}\n`;
fs.writeFileSync(path.join(FINAL, 'JavaScript_Mastery_Complete_Manuscript.md'), manuscript);

// ---------- structure for the renderers ----------
const book = {
  generated: 'deterministic (no timestamp)', manuscript: 'JavaScript_Mastery_Complete_Manuscript.md', manuscriptSha256: sha(manuscript),
  chapters: chapters.map(({ md, projectDir, glossary: g, reading, ...c }) => ({ ...c, glossaryTerms: g.length, readingItems: reading.length })),
  back: backParts.map(({ md, ...b }) => b),
  counts: { chapters: chapters.length, glossaryTerms: glossary.length, references: seen.size, h2: chapters.reduce((s, c) => s + c.h2.length, 0) },
};
fs.writeFileSync(path.join(WORK, 'book.json'), JSON.stringify(book, null, 2) + '\n');
fs.writeFileSync(path.join(WORK, 'assembly-log.json'), JSON.stringify({ edits: log, rules: 'exact match, applied exactly once; chapter source files are never written' }, null, 2) + '\n');
const words = manuscript.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
console.log(`manuscript: ${chapters.length} chapters, ${book.counts.h2} sections, ${glossary.length} glossary terms, ${seen.size} references, ${manuscript.length} chars, ~${words} words outside code; ${log.length} logged changes`);
