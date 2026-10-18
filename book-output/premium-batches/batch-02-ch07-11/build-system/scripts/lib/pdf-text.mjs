// Dependency-free PDF text reader for QA of Chrome/Skia-generated PDFs.
// It returns every glyph with its Unicode value (from ToUnicode), its position, its advance width,
// and the ActualText span it belongs to. On top of that it emulates three kinds of text extractor,
// so typography problems can be separated from text-extraction artifacts:
//
//   naive   — ToUnicode only; inserts a space whenever the next glyph starts to the right of where the
//             PREVIOUS glyph ended. Zero-width combining marks (ু, reph, …) make this fire inside words.
//   robust  — ToUnicode only; measures the gap from the right-most edge seen so far on the line.
//   actual  — honours /ActualText (as Acrobat-class readers do) and uses the robust gap rule.
//
// Scope: classic xref tables, FlateDecode streams, Type0/Identity-H fonts — what headless Chrome writes.
import fs from 'node:fs';
import zlib from 'node:zlib';

const mul = (m, n) => [m[0] * n[0] + m[1] * n[2], m[0] * n[1] + m[1] * n[3], m[2] * n[0] + m[3] * n[2], m[2] * n[1] + m[3] * n[3], m[4] * n[0] + m[5] * n[2] + n[4], m[4] * n[1] + m[5] * n[3] + n[5]];
const utf16 = hex => { let s = ''; const h = hex.replace(/\s+/g, '').replace(/^FEFF/i, ''); for (let i = 0; i + 3 < h.length; i += 4) s += String.fromCharCode(parseInt(h.slice(i, i + 4), 16)); return s; };

export function openPdf(file) {
  const raw = fs.readFileSync(file), s = raw.toString('latin1');
  const sx = +/startxref\s+(\d+)\s+%%EOF\s*$/.exec(s)[1];
  const head = /xref\s+(\d+)\s+(\d+)\s*\n/.exec(s.slice(sx, sx + 40));
  if (!head) throw new Error('Only classic xref tables are supported');
  const offsets = [], tableStart = sx + head[0].length;
  for (let i = 0; i < +head[2]; i++) { const line = s.slice(tableStart + i * 20, tableStart + i * 20 + 18); if (line[17] === 'n') offsets.push([+head[1] + i, +line.slice(0, 10)]); }
  const sorted = [...offsets].sort((a, b) => a[1] - b[1]);
  const objs = new Map();
  sorted.forEach(([num, off], k) => {
    const end = k + 1 < sorted.length ? sorted[k + 1][1] : sx;
    const body = s.slice(off, end).replace(/^\d+ 0 obj\s*/, '');
    const st = body.search(/stream\r?\n/);
    const dict = st >= 0 ? body.slice(0, st) : body.replace(/\s*endobj\s*$/, '');
    let data = null;
    if (st >= 0) {
      const len = +(/\/Length (\d+)/.exec(dict) ?? [])[1];
      const start = off + s.slice(off, end).search(/stream\r?\n/) + body.slice(st).match(/stream\r?\n/)[0].length;
      data = () => { const b = raw.subarray(start, start + len); return /FlateDecode/.test(dict) ? zlib.inflateSync(b) : b; };
    }
    objs.set(num, { dict, data });
  });
  const trailer = s.slice(sx - 0).length ? s.slice(s.lastIndexOf('trailer')) : '';
  return { objs, root: +/\/Root (\d+) 0 R/.exec(trailer)[1], bytes: raw.length };
}

// Raw value of a dictionary key, with balanced << >> and [ ].
function entry(dict, key) {
  const m = new RegExp(`/${key}(?![A-Za-z0-9])\\s*`).exec(dict);
  if (!m) return null;
  let i = m.index + m[0].length;
  const open = dict.startsWith('<<', i) ? '<<' : dict[i] === '[' ? '[' : null;
  if (!open) return (/^(\d+ 0 R|\/[^\s\/<>\[\]]+|[-\d.]+|<[0-9A-Fa-f\s]*>)/.exec(dict.slice(i)) ?? [null])[0];
  const close = open === '<<' ? '>>' : ']';
  let depth = 0, j = i;
  while (j < dict.length) {
    if (dict.startsWith(open, j)) { depth++; j += open.length; }
    else if (dict.startsWith(close, j)) { depth--; j += close.length; if (!depth) break; }
    else j++;
  }
  return dict.slice(i, j);
}
const resolve = (pdf, v) => { const m = v && /^(\d+) 0 R$/.exec(v.trim()); return m ? pdf.objs.get(+m[1]).dict : v; };
const refNum = v => +(/^(\d+) 0 R/.exec((v ?? '').trim()) ?? [])[1];

function loadFont(pdf, num) {
  const f = pdf.objs.get(num).dict, map = new Map(), widths = new Map();
  const tu = refNum(entry(f, 'ToUnicode'));
  if (tu) {
    const cm = pdf.objs.get(tu).data().toString('latin1');
    for (const blk of cm.matchAll(/beginbfchar([^]*?)endbfchar/g)) for (const m of blk[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f\s]*)>/g)) map.set(parseInt(m[1], 16), utf16(m[2]));
    for (const blk of cm.matchAll(/beginbfrange([^]*?)endbfrange/g)) {
      for (const m of blk[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(?:<([0-9A-Fa-f]+)>|\[([^\]]*)\])/g)) {
        const a = parseInt(m[1], 16), b = parseInt(m[2], 16);
        if (m[3]) { const base = parseInt(m[3].slice(-4), 16), pre = utf16(m[3].slice(0, -4)); for (let c = a; c <= b; c++) map.set(c, pre + String.fromCharCode(base + c - a)); }
        else [...m[4].matchAll(/<([0-9A-Fa-f]+)>/g)].forEach((d, k) => map.set(a + k, utf16(d[1])));
      }
    }
  }
  if (!/\/Subtype\s*\/Type0/.test(f)) {
    // Simple font. Chrome writes variable fonts as Type 3: glyph outlines stored in the PDF itself, one byte per code.
    const scale = Math.abs(parseFloat((entry(f, 'FontMatrix') ?? '[0.001').slice(1))) * 1000, first = +(entry(f, 'FirstChar') ?? 0);
    (entry(f, 'Widths') ?? '[]').slice(1, -1).trim().split(/\s+/).filter(Boolean).forEach((x, k) => widths.set(first + k, +x * scale));
    const d = resolve(pdf, entry(f, 'FontDescriptor')) ?? '', type3 = /\/Subtype\s*\/Type3/.test(f);
    return { name: (entry(d, 'FontName') ?? entry(f, 'BaseFont') ?? '/?').replace(/^\/(?:[A-Z]{6}\+)?/, ''), map, widths, dw: 0, simple: true, type3,
      embedded: type3 ? /\/CharProcs/.test(f) : /\/FontFile[23]?\s/.test(d), subtype: type3 ? '/Type3' : entry(f, 'Subtype') };
  }
  const desc = resolve(pdf, (entry(f, 'DescendantFonts') ?? '').replace(/^\[\s*|\s*\]$/g, '')) ?? '';
  const dw = +(entry(desc, 'DW') ?? 1000);
  const w = entry(desc, 'W');
  if (w) {
    const t = w.slice(1, -1).match(/\[[^\]]*\]|[-\d.]+/g) ?? [];
    for (let i = 0; i < t.length;) {
      const c = +t[i];
      if (t[i + 1]?.startsWith('[')) { t[i + 1].slice(1, -1).trim().split(/\s+/).forEach((x, k) => widths.set(c + k, +x)); i += 2; }
      else { for (let k = c; k <= +t[i + 1]; k++) widths.set(k, +t[i + 2]); i += 3; }
    }
  }
  const fd = resolve(pdf, entry(desc, 'FontDescriptor')) ?? '';
  return { name: (entry(f, 'BaseFont') ?? '').replace(/^\/(?:[A-Z]{6}\+)?/, ''), map, widths, dw, embedded: /\/FontFile[23]?\s/.test(fd), subtype: entry(desc, 'Subtype') };
}

const TOKEN = /\s+|%[^\n]*|<<|>>|\[|\]|<[0-9A-Fa-f\s]*>|\((?:\\.|[^\\()])*\)|\/[^\s<>\[\]()\/%]*|[+-]?(?:\d+\.?\d*|\.\d+)|[A-Za-z][A-Za-z0-9]*\*?|['"]/y;

function runContent(pdf, text, resources, ctm0, out, fonts, state) {
  const fontRes = resolve(pdf, entry(resources, 'Font')) ?? '', xoRes = resolve(pdf, entry(resources, 'XObject')) ?? '';
  const font = name => { const n = refNum(entry(fontRes, name)); if (!n) return null; if (!fonts.has(n)) fonts.set(n, loadFont(pdf, n)); return fonts.get(n); };
  let ctm = ctm0, tm = [1, 0, 0, 1, 0, 0], tlm = tm, cur = null, size = 0;
  const stack = [], marks = [], ops = [];
  TOKEN.lastIndex = 0;
  let pos = 0;
  while (pos < text.length) {
    TOKEN.lastIndex = pos;
    const m = TOKEN.exec(text);
    if (!m) { pos++; continue; }
    pos = TOKEN.lastIndex;
    const t = m[0];
    if (/^\s|^%/.test(t)) continue;
    if (!/^[A-Za-z'"]/.test(t)) { ops.push(t); continue; }
    const n = k => +ops[ops.length - k];
    const show = hex => {
      const h = hex.slice(1, -1).replace(/\s+/g, '');
      const step = cur?.simple ? 2 : 4;
      for (let i = 0; i + step - 1 < h.length; i += step) {
        const gid = parseInt(h.slice(i, i + step), 16), w = (cur?.widths.get(gid) ?? cur?.dw ?? 0) / 1000 * size;
        const trm = mul(tm, ctm), sx = Math.hypot(trm[0], trm[1]);
        const span = [...marks].reverse().find(k => k && k.actual !== undefined) ?? null;
        out.push({ font: cur?.name, gid, uni: cur?.map.get(gid) ?? '', x: trm[4], y: trm[5], size: size * sx, w: w * sx, span: span?.id ?? null, spanText: span?.actual ?? null });
        tm = mul([1, 0, 0, 1, w, 0], tm);
      }
    };
    switch (t) {
      case 'q': stack.push(ctm); break;
      case 'Q': ctm = stack.pop() ?? ctm; break;
      case 'cm': ctm = mul(ops.slice(-6).map(Number), ctm); break;
      case 'BT': tm = tlm = [1, 0, 0, 1, 0, 0]; break;
      case 'Tf': cur = font(ops[ops.length - 2].slice(1)); size = n(1); break;
      case 'Tm': tm = tlm = ops.slice(-6).map(Number); break;
      case 'Td': case 'TD': tlm = mul([1, 0, 0, 1, n(2), n(1)], tlm); tm = tlm; break;
      case 'Tj': show(ops[ops.length - 1]); break;
      case 'TJ': for (const o of ops.slice(ops.lastIndexOf('[') + 1, -1)) { if (o[0] === '<') show(o); else tm = mul([1, 0, 0, 1, -o / 1000 * size, 0], tm); } break;
      case 'BDC': { const k = ops.indexOf('/ActualText'); marks.push(k >= 0 ? { id: ++state.span, actual: ops[k + 1][0] === '<' ? utf16(ops[k + 1].slice(1, -1)) : ops[k + 1].slice(1, -1) } : null); break; }
      case 'BMC': marks.push(null); break;
      case 'EMC': marks.pop(); break;
      case 'Do': {
        const num = refNum(entry(xoRes, ops[ops.length - 1].slice(1))), xo = num && pdf.objs.get(num);
        if (xo && /\/Subtype\s*\/Form/.test(xo.dict)) {
          const mx = (entry(xo.dict, 'Matrix') ?? '[1 0 0 1 0 0]').slice(1, -1).trim().split(/\s+/).map(Number);
          runContent(pdf, xo.data().toString('latin1'), resolve(pdf, entry(xo.dict, 'Resources')) ?? resources, mul(mx, ctm), out, fonts, state);
        }
        break;
      }
    }
    ops.length = 0;
  }
}

/** Every glyph of every page, in content-stream order. */
export function readPages(file) {
  const pdf = openPdf(file), fonts = new Map(), pages = [];
  const walk = num => {
    const d = pdf.objs.get(num).dict;
    if (/\/Type\s*\/Pages\b/.test(d)) { for (const k of (entry(d, 'Kids') ?? '').matchAll(/(\d+) 0 R/g)) walk(+k[1]); return; }
    const glyphs = [], contents = entry(d, 'Contents') ?? '';
    const text = [...contents.matchAll(/(\d+) 0 R/g)].map(c => pdf.objs.get(+c[1]).data().toString('latin1')).join('\n');
    runContent(pdf, text, resolve(pdf, entry(d, 'Resources')) ?? '', [1, 0, 0, 1, 0, 0], glyphs, fonts, pages.state ??= { span: 0 });
    pages.push(glyphs);
  };
  walk(refNum(entry(pdf.objs.get(pdf.root).dict, 'Pages')));
  return { pages, fonts: [...fonts.values()], bytes: pdf.bytes };
}

/** Emulate a text extractor. mode: 'naive' | 'robust' | 'actual'. gap is the space threshold in em. */
export function extract(glyphs, mode = 'actual', gap = 0.15) {
  let out = '', prev = null, right = -Infinity, lastSpan = null;
  for (const g of glyphs) {
    const newLine = prev && (Math.abs(g.y - prev.y) > 0.6 * Math.max(g.size, prev.size) || g.x < prev.x - 3 * g.size);
    if (newLine) { out += '\n'; right = -Infinity; prev = null; }
    const edge = mode === 'naive' ? (prev ? prev.x + prev.w : -Infinity) : right;
    const piece = mode === 'actual' && g.span !== null ? (g.span === lastSpan ? '' : g.spanText) : g.uni;
    // A new ActualText span continues the same word unless there is a real gap; glyphs inside one span never split.
    const inside = mode === 'actual' && g.span !== null && g.span === lastSpan;
    if (prev && !inside && edge > -Infinity && g.x - edge > gap * g.size && !/\s$/.test(out) && !/^\s/.test(piece)) out += ' ';
    out += piece;
    lastSpan = g.span; prev = g; right = Math.max(right, g.x + g.w);
  }
  return out;
}
