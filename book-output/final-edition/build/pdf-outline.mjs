// Reads a PDF's outline (bookmarks): title, nesting level and 1-based page number of every entry, plus the page count.
// Uses the master design system's PDF object reader (read-only).
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SYSTEM = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'master-design-system');
const { openPdf } = await import(pathToFileURL(path.join(SYSTEM, 'scripts', 'lib', 'pdf-text.mjs')).href);

const utf16 = (hex) => { let s = ''; const h = hex.replace(/\s+/g, '').replace(/^FEFF/i, ''); for (let i = 0; i + 3 < h.length; i += 4) s += String.fromCharCode(parseInt(h.slice(i, i + 4), 16)); return s; };
export function readOutline(file) {
  const pdf = openPdf(file);
  const dict = (n) => pdf.objs.get(n).dict;
  const ref = (d, key) => +(new RegExp(`/${key}\\s+(\\d+) 0 R`).exec(d) ?? [])[1];
  const pageOrder = [];
  const walk = (n) => {
    const d = dict(n);
    if (/\/Type\s*\/Pages\b/.test(d)) { for (const k of /\/Kids\s*\[([^\]]*)\]/.exec(d)[1].matchAll(/(\d+) 0 R/g)) walk(+k[1]); return; }
    pageOrder.push(n);
  };
  walk(ref(dict(pdf.root), 'Pages'));
  const pageIndex = new Map(pageOrder.map((n, i) => [n, i + 1]));
  const items = [];
  const visit = (n, level) => {
    while (n) {
      const d = dict(n);
      const t = /\/Title\s*<([0-9A-Fa-f\s]+)>/.exec(d);
      const dest = /\/Dest\s*\[\s*(\d+) 0 R/.exec(d) ?? /\/D\s*\[\s*(\d+) 0 R/.exec(d);
      items.push({ title: t ? utf16(t[1]) : (/\/Title\s*\(([^)]*)\)/.exec(d)?.[1] ?? ''), level, page: dest ? pageIndex.get(+dest[1]) : null });
      const first = ref(d, 'First');
      if (first) visit(first, level + 1);
      n = ref(d, 'Next');
    }
  };
  const outlines = ref(dict(pdf.root), 'Outlines');
  if (outlines) visit(ref(dict(outlines), 'First'), 1);
  return { pages: pageOrder.length, items };
}

