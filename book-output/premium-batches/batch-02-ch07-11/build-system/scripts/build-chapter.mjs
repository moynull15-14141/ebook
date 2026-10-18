// Builds one chapter: Markdown → HTML → PDF (headless Chrome), then the DOCX from the same HTML.
// Usage: node scripts/build-chapter.mjs <chapter-dir> [--pdf-only]
// The chapter folder must contain chapter.json (see templates/chapter.json).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { SYSTEM, tokens, book, rules, loadChapter, fontFaceCss, fill, findChrome, toBn, measures } from './lib/tokens.mjs';
import { blocks, inline, esc } from './lib/md.mjs';

const ch = loadChapter(process.argv[2]);
const md = fs.readFileSync(ch.md, 'utf8').replace(/\r\n/g, '\n');
const lines = md.split('\n');
const h1 = new RegExp(rules.titlePattern).exec(lines[0]);
if (!h1) throw new Error(`First line must match ${rules.titlePattern}`);
const [, chapNo, title] = h1;
const label = `${book.chapterWord} ${chapNo}`;

// One <section> per H2, classed from config/chapter-rules.json, so panels, exercises, solutions and MCQs
// are styled (and mapped to Word styles) by role rather than by position.
const opts = { codeBlocks: [] };
const sections = [];
for (const chunk of lines.slice(1).join('\n').split(/\n(?=## )/)) {
  const m = /^## (.+)\n/.exec(chunk);
  if (!m) { if (chunk.trim()) throw new Error('Content before the first H2 is not supported: ' + chunk.trim().slice(0, 60)); continue; }
  const heading = m[1].trim();
  const cls = rules.sectionClasses.find(r => new RegExp(r.match).test(heading))?.class ?? '';
  let html = blocks(chunk, opts);
  if (cls === 'mcq') html = html.replace(/<p><strong>প্রশ্ন [^<]*<\/strong>[\s\S]*?<\/p>\n<ul>[\s\S]*?<\/ul>/g, q => `<div class="mcq-item">${q}</div>`);
  if (cls === 'solutions') html = html.replace(/<p>(<strong>সমাধান [০-৯]+<\/strong>)/g, '<p class="sol">$1');
  if (cls === 'answers') html = html.replace(new RegExp(`<p>(<strong>${rules.mcq.quickKeyLabel}:</strong>)`), '<p class="quick-key">$1');
  sections.push({ heading, cls, html });
}
// Absolute image URLs for Chrome; make-docx.mjs reads the original relative path from data-src.
const absImages = html => html.replace(/<img src="([^"]+)"/g, (_, src) => `<img data-src="${src}" src="${pathToFileURL(path.resolve(ch.dir, src)).href}"`);
const bodyHtml = sections.map(s => `<section class="sec ${s.cls}">\n${absImages(s.html)}\n</section>`).join('\n');
const opener = `<header class="opener"><div class="chap-num">${chapNo.padStart(2, '০')}</div><p class="chap-label">${label}</p><h1>${inline(title)}</h1></header>`;

const css = fill(fs.readFileSync(path.join(SYSTEM, 'templates', 'book.css'), 'utf8').replace('/*__FONTS__*/', fontFaceCss()), { running: { left: book.runningTitle, right: `${label} · ${title}` } });
fs.writeFileSync(ch.html, `<!doctype html><html lang="bn"><head><meta charset="utf-8"><title>${label} — ${esc(title)} | ${book.runningTitle}</title><style>${css}</style></head><body>${opener}\n${bodyHtml}</body></html>`);

// ---------- PDF ----------
// Tagged PDF is Chrome's default and must stay on: its /ActualText spans are what make Bengali text copy correctly.
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'jsm-pdf-'));
try {
  execFileSync(findChrome(), ['--headless', '--disable-gpu', '--no-first-run', `--user-data-dir=${profile}`, '--no-pdf-header-footer',
    '--generate-pdf-document-outline', `--print-to-pdf=${ch.pdf}`, pathToFileURL(ch.html).href], { stdio: 'pipe', timeout: 240000 });
} finally {
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* temp folder may linger */ }
}
const pdfRaw = fs.readFileSync(ch.pdf, 'latin1');
const pages = Math.max(...[...pdfRaw.matchAll(/\/Type\s*\/Pages\b[^]*?\/Count\s+(\d+)/g)].map(m => +m[1]));

// ---------- statistics ----------
// Explanatory words: everything outside fenced code, with Markdown syntax, inline code and figures removed.
const prose = md.replace(/```[\s\S]*?```/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/``.+?``|`[^`]*`/g, ' ').replace(/^\s*\|?\s*:?-{2,}.*$/gm, ' ').replace(/[#>*|_]/g, ' ');
const words = prose.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w));
const data = {
  chapter: `${label} — ${title}`, number: chapNo, title, source: path.basename(ch.md), built: new Date().toISOString(), designSystem: tokens.version,
  pdfPages: pages, pdfBytes: fs.statSync(ch.pdf).size,
  words: { explanatory: words.length, bengali: words.filter(w => /[ঀ-৿]/.test(w)).length },
  sections: sections.map(s => ({ heading: s.heading, class: s.cls })), subsections: (md.match(/^### .+$/gm) ?? []).length,
  codeBlocks: opts.codeBlocks, tables: (md.match(/^\s*\|\s*:?-{2,}/gm) ?? []).length, callouts: (md.match(/^> \*\*/gm) ?? []).length,
  codeCharsPerLine: measures().codeCharsPerLine,
};
fs.writeFileSync(path.join(ch.work, 'build-data.json'), JSON.stringify(data, null, 2));
console.log(`PDF  ${path.relative(process.cwd(), ch.pdf)}  —  ${pages} pages (${toBn(pages)}), ${data.words.explanatory} explanatory words, ${sections.length} sections, ${opts.codeBlocks.length} code panels, ${data.tables} tables`);

if (!process.argv.includes('--pdf-only')) {
  execFileSync(process.execPath, [path.join(SYSTEM, 'scripts', 'make-docx.mjs'), ch.dir], { stdio: 'inherit' });
}
