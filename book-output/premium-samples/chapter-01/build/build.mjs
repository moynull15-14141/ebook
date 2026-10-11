// Premium sample builder for Chapter 01.
// Reads the authoritative Markdown (../chapter-01-premium.md), writes work/chapter.html,
// and prints it to PDF with headless Chrome. make-docx.mjs turns the same HTML into the DOCX.
// Usage: node build/build.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { blocks, inline, esc, toBn } from './md.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const WORK = path.join(HERE, 'work');
const SRC = path.join(ROOT, 'chapter-01-premium.md');
const PDF = path.join(ROOT, 'JavaScript_Mastery_Chapter_01_Premium.pdf');
const BOOK = 'JavaScript Mastery — শূন্য থেকে প্রফেশনাল';
fs.mkdirSync(WORK, { recursive: true });

const CHROME = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(p => fs.existsSync(p));
if (!CHROME) throw new Error('Chrome or Edge not found; set CHROME_PATH.');

// ---------- fonts: locate the real files so the PDF never depends on a silent fallback ----------
const FONT_DIRS = [path.join(process.env.LOCALAPPDATA ?? '', 'Microsoft/Windows/Fonts'), 'C:/Windows/Fonts', path.join(os.homedir(), 'Library/Fonts'), '/Library/Fonts', '/usr/share/fonts', path.join(os.homedir(), '.fonts')];
const findFont = file => FONT_DIRS.map(d => path.join(d, file)).find(p => fs.existsSync(p));
const fontFace = (family, weight, file) => {
  const p = findFont(file);
  if (!p) throw new Error(`Required font file not found: ${file}`);
  return `@font-face { font-family: "${family}"; font-weight: ${weight}; src: url("${pathToFileURL(p).href}"); }`;
};
const fontCss = [
  fontFace('Book', 400, 'HindSiliguri-Regular.ttf'), fontFace('Book', 500, 'HindSiliguri-Medium.ttf'),
  fontFace('Book', 600, 'HindSiliguri-SemiBold.ttf'), fontFace('Book', 700, 'HindSiliguri-Bold.ttf'),
  fontFace('Mono', 400, 'consola.ttf'), fontFace('Mono', 700, 'consolab.ttf'),   // static fonts: Chrome embeds them as real font programs
].join('\n');

// ---------- markdown -> html ----------
const md = fs.readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n');
const lines = md.split('\n');
const h1 = /^# (\S+) ([০-৯]+) — (.+)$/.exec(lines[0]);
if (!h1) throw new Error('First line must be "# অধ্যায় N — Title"');
const [, chapWord, chapNo, title] = h1;
const bodyMd = lines.slice(1).join('\n');

// One <section> per H2 so panels (objectives, prerequisites) can be styled as a unit.
const PANELS = { 'শেখার লক্ষ্য': 'panel objectives', 'পূর্বশর্ত': 'panel prerequisites' };
const opts = { codeBlocks: [] };
const sections = [];
let current = null;
for (const chunk of bodyMd.split(/\n(?=## )/)) {
  const m = /^## (.+)\n/.exec(chunk);
  if (!m) { if (chunk.trim()) throw new Error('Content before the first H2 is not supported: ' + chunk.slice(0, 60)); continue; }
  current = { heading: m[1].trim(), html: blocks(chunk, opts) };
  sections.push(current);
}
// Absolute image URLs so the HTML renders from work/; make-docx.mjs reads the original relative path.
const withAbsImages = html => html.replace(/<img src="([^"]+)"/g, (_, src) => `<img data-src="${src}" src="${pathToFileURL(path.resolve(ROOT, src)).href}"`);
const sectionClass = h => PANELS[h] ?? (/MCQ: /.test(h) ? 'mcq' : '');
const bodyHtml = sections.map(s => `<section class="sec ${sectionClass(s.heading)}">\n${withAbsImages(s.html)}\n</section>`).join('\n');
const opener = `<header class="opener"><div class="chap-num">${chapNo.padStart(2, '০')}</div><p class="chap-label">${chapWord} ${chapNo}</p><h1>${inline(title)}</h1></header>`;

const css = fs.readFileSync(path.join(HERE, 'book.css'), 'utf8')
  .replace('/*__FONTS__*/', fontCss)
  .replaceAll('__RUNNING_LEFT__', BOOK)
  .replaceAll('__RUNNING_RIGHT__', `${chapWord} ${chapNo} · ${title}`);
const html = `<!doctype html><html lang="bn"><head><meta charset="utf-8"><title>${chapWord} ${chapNo} — ${esc(title)} | ${BOOK}</title><style>${css}</style></head><body>${opener}\n${bodyHtml}</body></html>`;
const htmlFile = path.join(WORK, 'chapter.html');
fs.writeFileSync(htmlFile, html);

// ---------- pdf ----------
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ch01-pdf-'));
try {
  execFileSync(CHROME, ['--headless', '--disable-gpu', '--no-first-run', `--user-data-dir=${profile}`, '--no-pdf-header-footer',
    '--generate-pdf-document-outline', `--print-to-pdf=${PDF}`, pathToFileURL(htmlFile).href], { stdio: 'pipe', timeout: 180000 });
} finally {
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* temp folder may linger */ }
}
const pdfRaw = fs.readFileSync(PDF, 'latin1');
const pages = Math.max(...[...pdfRaw.matchAll(/\/Type\s*\/Pages\b[^]*?\/Count\s+(\d+)/g)].map(m => +m[1]));
const fontsInPdf = [...new Set([...pdfRaw.matchAll(/\/FontName\s*\/([^\s\/]+)/g)].map(m => m[1].replace(/^[A-Z]{6}\+/, '')))];
const embedded = (pdfRaw.match(/\/FontFile[23]?\b/g) || []).length;

// ---------- statistics ----------
// Explanatory words: everything outside fenced code, with Markdown syntax and inline code removed.
const prose = md.replace(/```[\s\S]*?```/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/``.+?``|`[^`]*`/g, ' ')
  .replace(/^\s*\|?\s*:?-{2,}.*$/gm, ' ').replace(/[#>*|_]/g, ' ');
const words = prose.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w));
const data = {
  chapter: `${chapWord} ${chapNo} — ${title}`, built: new Date().toISOString(), pdfPages: pages, pdfBytes: fs.statSync(PDF).size,
  fontsInPdf, embeddedFontFiles: embedded,
  words: { explanatory: words.length, bengali: words.filter(w => /[\u0980-\u09FF]/.test(w)).length },
  sections: sections.map(s => s.heading),
  subsections: (md.match(/^### .+$/gm) || []).length,
  codeBlocks: opts.codeBlocks, tables: (md.match(/^\s*\|\s*:?-{2,}/gm) || []).length,
  callouts: (md.match(/^> \*\*/gm) || []).length,
  mcqs: (md.match(/^\*\*প্রশ্ন [০-৯]+\.\*\*/gm) || []).length,
  mcqOptions: (md.match(/^- [কখগঘ]\) /gm) || []).length,
};
fs.writeFileSync(path.join(WORK, 'build-data.json'), JSON.stringify(data, null, 2));
console.log(`PDF written: ${PDF}`);
console.log(`Pages: ${toBn(pages)} (${pages}) | words: ${data.words.explanatory} | sections: ${data.sections.length} | code blocks: ${opts.codeBlocks.length} | tables: ${data.tables} | MCQs: ${data.mcqs} (${data.mcqOptions} options)`);
console.log(`Fonts named in PDF: ${fontsInPdf.join(', ')} | embedded font programs: ${embedded}`);
