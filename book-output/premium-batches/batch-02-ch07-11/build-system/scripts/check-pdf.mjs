// PDF quality gate for one chapter: file integrity, fonts, text layer, and page layout.
// Usage: node scripts/check-pdf.mjs <chapter-dir> [rendered-pages-dir]
// If a folder of page PNGs (from render-pages.ps1) is given, it also looks for blank and duplicate pages.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { tokens, loadChapter, measures } from './lib/tokens.mjs';
import { readPages, extract } from './lib/pdf-text.mjs';
import { fenceInfo } from './lib/md.mjs';

const ch = loadChapter(process.argv[2]);
const raw = fs.readFileSync(ch.pdf, 'latin1');
const md = fs.readFileSync(ch.md, 'utf8').replace(/\r\n/g, '\n');
let fails = 0, warns = 0;
const check = (ok, msg) => { if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); };
const warn = msg => { warns++; console.log(`WARN  ${msg}`); };
const info = msg => console.log(`INFO  ${msg}`);

// ---------- file ----------
check(raw.startsWith('%PDF-'), `header: ${raw.slice(0, 8)}`);
check(/%%EOF\s*$/.test(raw), 'file ends with %%EOF (not truncated)');
const { pages, fonts } = readPages(ch.pdf);
const pageObjs = (raw.match(/\/Type\s*\/Page\b(?!s)/g) ?? []).length;
check(pages.length === pageObjs && pages.length > 0, `page count: ${pages.length}`);
check(/\/StructTreeRoot/.test(raw) && /\/MarkInfo/.test(raw), 'tagged PDF (structure tree present) — required for correct Bengali copy and for screen readers');

// ---------- fonts ----------
const allowed = [...tokens.fonts.body.pdfNames, ...tokens.fonts.mono.pdfNames];
const names = [...new Set(fonts.map(f => `${f.name} ${f.subtype}`))];
check(fonts.every(f => f.embedded && !f.type3), `every font is an embedded font program, none is Type 3 (${fonts.length} fonts)${fonts.some(f => !f.embedded || f.type3) ? ' — ' + names.join(', ') : ''}`);
check(fonts.every(f => allowed.some(a => f.name.startsWith(a))), `only the design-system families are used: ${[...new Set(fonts.map(f => f.name))].join(', ')}`);
check(fonts.every(f => f.map.size > 0), 'every font has a ToUnicode map (text is selectable and searchable)');

// ---------- text layer ----------
const BN = /[ঀ-৿‌‍]+/g;
const canon = s => s.normalize('NFC').replace(/য়/g, 'য়').replace(/ড়/g, 'ড়').replace(/ঢ়/g, 'ঢ়');
const count = words => { const m = new Map(); for (const w of words) m.set(w, (m.get(w) ?? 0) + 1); return m; };
const text = canon(pages.map(p => extract(p, 'actual')).join('\n'));
const want = count((canon(md).match(BN) ?? []).filter(w => w.length > 1)), got = count(text.match(BN) ?? []);
let total = 0, intact = 0; for (const [w, n] of want) { total += n; intact += Math.min(n, got.get(w) ?? 0); }
check(intact === total, `Bengali text layer: ${intact} of ${total} source words recovered intact by an ActualText-aware reader`);
const h2 = (md.match(/^## .+$/gm) ?? []).map(h => canon(h.slice(3).trim().replace(/`/g, '')));
const flat = text.replace(/\s+/g, ' ');
const lost = h2.filter(h => !flat.includes(h));
check(lost.length === 0, `all ${h2.length} section headings are present in the PDF text${lost.length ? ' — missing: ' + lost.join(' | ') : ''}`);
// Indentation of code must survive copy and paste: indented source lines have to come back with their leading spaces.
const lines = new Set(text.split('\n').map(l => l.trimEnd()));
let indented = 0, kept = 0; const c = tokens.code;
for (const b of md.matchAll(/^```([\w-]+)([^\n]*)\n([\s\S]*?)\n```/gm)) {
  if (fenceInfo(b[2]).kind) continue;
  for (const l of b[3].split('\n')) {
    const len = [...l].length, bn = /[ঀ-৿]/.test(l);
    if (!/^ +\S/.test(l) || len > c.hangFromChars || (bn && len > c.hangFromChars - 12)) continue;   // wrapped lines are reported by check-manuscript
    indented++; if (lines.has(canon(l).trimEnd())) kept++;
  }
}
check(indented === 0 || kept / indented >= 0.99, `code indentation survives text extraction: ${kept} of ${indented} indented source lines come back exactly`);

// ---------- layout ----------
const pt = mm => mm * 72 / 25.4, P = tokens.page;
const H = pt(P.heightMm), W = pt(P.widthMm), top = H - pt(P.marginMm.top), bottom = pt(P.marginMm.bottom), left = pt(P.marginMm.left), right = W - pt(P.marginMm.right);
const stranded = [], clipped = [], sparse = [];
pages.forEach((g, i) => {
  const body = g.filter(x => x.y < top + 1 && x.y > bottom - 1 && x.uni.trim());
  if (!body.length) return;
  for (const x of body) if (x.x < left - 1.5 || x.x + x.w > right + 1.5) { clipped.push(`page ${i + 1} ("${x.uni}" at ${x.x.toFixed(0)}–${(x.x + x.w).toFixed(0)} pt)`); break; }
  const lowest = Math.min(...body.map(x => x.y));
  const last = body.filter(x => Math.abs(x.y - lowest) < 2);
  if (i < pages.length - 1 && Math.max(...last.map(x => x.size)) >= tokens.layout.headingMinPt) stranded.push(`page ${i + 1} ("${last.map(x => x.uni).join('').slice(0, 30)}")`);
  const empty = (lowest - bottom) / (top - bottom);
  if (i < pages.length - 1 && empty > tokens.layout.maxBottomWhitespace) sparse.push(`page ${i + 1} (${Math.round(empty * 100)}% empty)`);
});
check(clipped.length === 0, `no text outside the page margins (no clipped code or tables)${clipped.length ? ' — ' + clipped.slice(0, 5).join('; ') : ''}`);
check(stranded.length === 0, `no heading stranded at the bottom of a page${stranded.length ? ' — ' + stranded.join('; ') : ''}`);
if (sparse.length) warn(`pages with more than ${Math.round(tokens.layout.maxBottomWhitespace * 100)}% empty space at the bottom: ${sparse.join('; ')}`); else check(true, `no page (except the last) has more than ${Math.round(tokens.layout.maxBottomWhitespace * 100)}% empty space at the bottom`);
info(`size: ${(fs.statSync(ch.pdf).size / 1024).toFixed(0)} KB | bookmarks: ${(raw.match(/\/Title\s*[(<]/g) ?? []).length} | code line capacity: ${measures().codeCharsPerLine} characters`);

// ---------- rendered pages (optional) ----------
const dir = process.argv[3];
if (dir && fs.existsSync(dir)) {
  const pngs = fs.readdirSync(dir).filter(f => f.endsWith('.png')).sort().map(f => { const b = fs.readFileSync(path.join(dir, f)); return { f, size: b.length, hash: crypto.createHash('sha1').update(b).digest('hex') }; });
  check(pngs.length === pages.length, `rendered pages: ${pngs.length} of ${pages.length}`);
  const smallest = [...pngs].sort((a, b) => a.size - b.size)[0];
  check(pngs.every(p => p.size >= 25000), `no blank pages (smallest render: ${smallest?.f}, ${(smallest?.size / 1024).toFixed(0)} KB)`);
  check(new Set(pngs.map(p => p.hash)).size === pngs.length, 'no duplicate pages');
}
fs.writeFileSync(path.join(ch.work, 'pdf-check.json'), JSON.stringify({ pages: pages.length, fonts: fonts.map(f => ({ name: f.name, subtype: f.subtype, embedded: f.embedded })), bengaliWords: { total, intact }, indentation: { indented, kept }, stranded, clipped, sparse }, null, 2));
console.log(`\n${fails ? `${fails} FAILED` : 'All PDF checks passed'}${warns ? `, ${warns} warning(s)` : ''}`);
process.exit(fails ? 1 : 0);
