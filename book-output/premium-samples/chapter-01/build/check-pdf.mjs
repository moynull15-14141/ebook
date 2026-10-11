// Structural checks on the PDF that need no external tool.
// Usage: node build/check-pdf.mjs [rendered-pages-dir]
// If a directory of page PNGs (from render-pages.ps1) is given, it also looks for blank and duplicate pages.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(ROOT, 'JavaScript_Mastery_Chapter_01_Premium.pdf');
const raw = fs.readFileSync(file, 'latin1');
let fail = 0;
const report = (ok, msg) => { if (!ok) fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); };

report(raw.startsWith('%PDF-'), `header: ${raw.slice(0, 8)}`);
report(/%%EOF\s*$/.test(raw), 'file ends with %%EOF (not truncated)');
const pages = Math.max(...[...raw.matchAll(/\/Type\s*\/Pages\b[^]*?\/Count\s+(\d+)/g)].map(m => +m[1]));
const pageObjs = (raw.match(/\/Type\s*\/Page\b(?!s)/g) || []).length;
report(pages === pageObjs, `page count: ${pages} (page objects: ${pageObjs})`);

// Each font descriptor must carry an embedded font program.
const descriptors = [...raw.matchAll(/<<[^<>]*\/Type\s*\/FontDescriptor[^<>]*>>/g)].map(m => m[0]);
const fonts = descriptors.map(d => ({ name: (/\/FontName\s*\/([^\s\/>]+)/.exec(d) ?? [])[1], embedded: /\/FontFile[23]?\s/.test(d) }));
for (const f of fonts) report(f.embedded, `font embedded: ${f.name}`);
report(fonts.length > 0, `font descriptors found: ${fonts.length}`);
const families = [...new Set(fonts.map(f => f.name.replace(/^[A-Z]{6}\+/, '')))];
report(families.every(n => /^(HindSiliguri|Consolas)/.test(n)), `only the intended families are used: ${families.join(', ')}`);
const toUnicode = (raw.match(/\/ToUnicode\s/g) || []).length;
report(toUnicode > 0, `text is real, selectable text (ToUnicode maps: ${toUnicode})`);
const outline = (raw.match(/\/Title\s*[(<]/g) || []).length;
console.log(`INFO  bookmark/outline entries: ${outline}`);
console.log(`INFO  size: ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);

const dir = process.argv[2];
if (dir && fs.existsSync(dir)) {
  const pngs = fs.readdirSync(dir).filter(f => f.endsWith('.png')).sort();
  const info = pngs.map(f => { const b = fs.readFileSync(path.join(dir, f)); return { f, size: b.length, hash: crypto.createHash('sha1').update(b).digest('hex') }; });
  report(pngs.length === pages, `rendered pages: ${pngs.length} of ${pages}`);
  const smallest = [...info].sort((a, b) => a.size - b.size)[0];
  // A blank A4 page with only header/footer renders to a very small PNG; real pages are far larger.
  const blank = info.filter(i => i.size < 25000);
  report(blank.length === 0, `no blank pages (smallest render: ${smallest.f}, ${(smallest.size / 1024).toFixed(0)} KB)${blank.length ? ' -> ' + blank.map(b => b.f).join(', ') : ''}`);
  report(new Set(info.map(i => i.hash)).size === info.length, 'no duplicate pages (all page renders differ)');
}
console.log(fail ? `\n${fail} check(s) failed` : '\nAll PDF checks passed');
process.exit(fail ? 1 : 0);
