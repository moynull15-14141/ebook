// Writes the editable DOCX directly as OOXML from work/chapter.html — the same HTML the PDF is printed from,
// so both deliverables come from the one Markdown source. Run build.mjs first.
// Usage: node build/make-docx.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const WORK = path.join(HERE, 'work');
const OUT = path.join(ROOT, 'JavaScript_Mastery_Chapter_01_Premium.docx');
const BODY_FONT = 'Hind Siliguri', MONO_FONT = 'Consolas';
const BODY_W = 9524;   // A4 width minus 21 mm side margins, in twips
const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const toBn = n => String(n).replace(/[0-9]/g, d => BN_DIGITS[d]);

// ---------- 1. parse the restricted HTML into a tree ----------
const html = fs.readFileSync(path.join(WORK, 'chapter.html'), 'utf8');
const docTitle = /<title>([^<]*)<\/title>/.exec(html)[1];
const body = /<body>([\s\S]*)<\/body>/.exec(html)[1];
const VOID = new Set(['br', 'hr', 'img']);
function parse(src) {
  const root = { tag: 'root', attrs: {}, children: [] };
  const stack = [root];
  const re = /<(\/?)([a-zA-Z0-9]+)((?:\s+[a-zA-Z-]+="[^"]*")*)\s*>|([^<]+)/g;
  let m, consumed = 0;
  while ((m = re.exec(src))) {
    consumed += m[0].length;
    const top = stack[stack.length - 1];
    if (m[4] !== undefined) { top.children.push(m[4]); continue; }
    const tag = m[2].toLowerCase();
    if (m[1]) {
      if (top.tag !== tag) throw new Error(`Mismatched </${tag}>, open element is <${top.tag}>`);
      stack.pop(); continue;
    }
    const attrs = {};
    for (const a of m[3].matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) attrs[a[1]] = a[2];
    const node = { tag, attrs, children: [] };
    top.children.push(node);
    if (!VOID.has(tag)) stack.push(node);
  }
  if (consumed !== src.length) throw new Error(`HTML not fully tokenised: ${consumed} of ${src.length} characters`);
  if (stack.length !== 1) throw new Error(`Unclosed element <${stack[stack.length - 1].tag}>`);
  return root;
}
const tree = parse(body);
const elements = n => n.children.filter(c => typeof c !== 'string');
const hasClass = (n, c) => (n.attrs.class ?? '').split(/\s+/).includes(c);

// ---------- 2. inline content -> runs ----------
const SPAN_FMT = { k: { color: '1D4F9C', b: true }, s: { color: '0A6B4A' }, c: { color: '687385' }, n: { color: 'A3540A' } };
function segments(node, fmt = {}, out = []) {
  for (const ch of node.children) {
    if (typeof ch === 'string') { out.push({ text: ch, fmt }); continue; }
    if (ch.tag === 'br') { out.push({ br: true }); continue; }
    let f = fmt;
    if (ch.tag === 'strong') f = { ...fmt, b: true };
    else if (ch.tag === 'em') f = { ...fmt, b: true, color: '1D4F9C' };   // emphasis is bold blue, as in the PDF (no Bengali italic)
    else if (ch.tag === 'code') f = fmt.block ? fmt : { ...fmt, code: true };   // <pre><code> is a block, not inline code
    else if (ch.tag === 'span') f = { ...fmt, ...(SPAN_FMT[ch.attrs.class] ?? {}) };
    segments(ch, f, out);
  }
  return out;
}
// Text arrives already escaped with &amp; &lt; &gt; &quot;, all of which are valid XML entities.
const xmlText = t => t.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
const xmlEsc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Word draws Bengali from the run's ascii/hAnsi font slot, and Cascadia Mono has no Bengali glyphs.
// So each run is split by script and the Bengali pieces name the Bengali-capable font explicitly.
const BN_RUN = /([ঀ-৿।॥‌‍]+)/;
const BN_FONTS = `<w:rFonts w:ascii="${BODY_FONT}" w:hAnsi="${BODY_FONT}" w:cs="${BODY_FONT}"/>`;
function run(text, fmt = {}) {
  return xmlText(text).split(BN_RUN).filter(Boolean).map(piece => {
    const bn = BN_RUN.test(piece);
    const pr = (fmt.code ? '<w:rStyle w:val="InlineCode"/>' : '') + (bn ? BN_FONTS : '') + (fmt.b ? '<w:b/><w:bCs/>' : '') + (fmt.color ? `<w:color w:val="${fmt.color}"/>` : '');
    const parts = piece.split('\t').map(t => t ? `<w:t xml:space="preserve">${t}</w:t>` : '').join('<w:tab/>');
    return `<w:r>${pr ? `<w:rPr>${pr}</w:rPr>` : ''}${parts}</w:r>`;
  }).join('');
}
const runs = segs => segs.map(s => s.br ? '<w:r><w:br/></w:r>' : run(s.text, s.fmt)).join('');
const plain = node => segments(node).map(s => s.br ? ' ' : s.text).join('').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const para = (style, inner, extra = '') => `<w:p><w:pPr>${style ? `<w:pStyle w:val="${style}"/>` : ''}${extra}</w:pPr>${inner}</w:p>`;

// ---------- 3. blocks ----------
const stats = { headings: { 1: [], 2: [], 3: [] }, codeBlocks: 0, codeLines: 0, tables: 0, lists: 0, callouts: 0, images: 0, paragraphs: 0 };
const media = [];   // { name, data, rId }
const CALLOUT_STYLE = { note: 'CalloutNote', warn: 'CalloutWarn', tip: 'CalloutTip', remember: 'CalloutRemember', quote: 'CalloutNote' };
const CODE_STYLE = { source: 'Code', output: 'CodeOutput', error: 'CodeError', terminal: 'CodeTerminal', structure: 'Code' };

function table(node) {
  stats.tables++;
  const rows = [];
  (function collect(n) { for (const c of elements(n)) { if (c.tag === 'tr') rows.push(c); else collect(c); } })(node);
  const cols = Math.max(...rows.map(r => elements(r).length));
  // First column is usually a short label: give it a little less room when there are 3 columns.
  const widths = cols === 2 ? [0.3, 0.7] : cols === 3 ? [0.28, 0.36, 0.36] : Array(cols).fill(1 / cols);
  const grid = widths.map(w => `<w:gridCol w:w="${Math.round(BODY_W * w)}"/>`).join('');
  const border = s => `<w:${s} w:val="single" w:sz="4" w:space="0" w:color="CFD9E6"/>`;
  const trs = rows.map((r, ri) => {
    const cells = elements(r);
    const headRow = cells.every(c => c.tag === 'th');
    const tcs = cells.map((c, ci) => {
      const head = c.tag === 'th';
      const shade = head ? 'E9F0F8' : (ri % 2 === 0 ? 'F8FAFD' : '');
      return `<w:tc><w:tcPr><w:tcW w:w="${Math.round(BODY_W * widths[ci])}" w:type="dxa"/>${shade ? `<w:shd w:val="clear" w:color="auto" w:fill="${shade}"/>` : ''}</w:tcPr>${para('TableText', runs(segments(c, head ? { b: true, color: '12305F' } : {})))}</w:tc>`;
    }).join('');
    return `<w:tr><w:trPr><w:cantSplit/>${headRow ? '<w:tblHeader/>' : ''}</w:trPr>${tcs}</w:tr>`;
  }).join('');
  return `<w:tbl><w:tblPr><w:tblW w:w="${BODY_W}" w:type="dxa"/><w:tblBorders>${['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(border).join('')}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${trs}</w:tbl>${para('TableGap', '')}`;
}

function codeFigure(node) {
  stats.codeBlocks++;
  const kind = ['output', 'error', 'terminal', 'structure'].find(k => hasClass(node, k)) ?? 'source';
  const cap = elements(node).find(c => c.tag === 'figcaption');
  const pre = elements(node).find(c => c.tag === 'pre');
  const capText = cap ? elements(cap).map(s => plain(s)).join('  ·  ') : '';
  const lines = [[]];
  for (const s of segments(pre, { block: true })) {
    const pieces = s.text.split('\n');
    pieces.forEach((p, k) => { if (k > 0) lines.push([]); if (p) lines[lines.length - 1].push({ text: p, fmt: s.fmt }); });
  }
  stats.codeLines += lines.length;
  const style = CODE_STYLE[kind];
  // Consecutive paragraphs with identical borders and shading merge into one box in Word.
  const out = [para('CodeCaption', run(xmlEsc(capText)))];
  lines.forEach((l, k) => out.push(para(style, runs(l), k === lines.length - 1 ? '<w:spacing w:before="0" w:after="200"/>' : '')));
  return out.join('');
}

function imageFigure(node) {
  stats.images++;
  const img = elements(node).find(c => c.tag === 'img');
  const cap = elements(node).find(c => c.tag === 'figcaption');
  const file = path.resolve(ROOT, img.attrs['data-src']);
  const data = fs.readFileSync(file);
  if (data.toString('latin1', 1, 4) !== 'PNG') throw new Error('Only PNG figures are supported: ' + file);
  const pxW = data.readUInt32BE(16), pxH = data.readUInt32BE(20);
  const cx = Math.round(9.6 / 2.54 * 914400), cy = Math.round(cx * pxH / pxW);   // 96 mm wide, as in the PDF
  const id = media.length + 1, rId = `rIdImg${id}`, name = `image${id}.png`;
  media.push({ name, data, rId });
  const alt = img.attrs.alt ?? '';
  const drawing = `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${id}" name="Figure ${id}" descr="${alt}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name="${name}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:ln w="6350"><a:solidFill><a:srgbClr val="D3DBE7"/></a:solidFill></a:ln></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
  return para('Figure', drawing) + para('FigureCaption', runs(segments(cap)));
}

function list(node, style) {
  stats.lists++;
  const ordered = node.tag === 'ol';
  let n = parseInt(node.attrs.start ?? '1', 10);
  return elements(node).map(li => {
    stats.paragraphs++;
    // Ordered items carry their Bengali number as text (Word has no Bengali numbering format), with a hanging indent.
    if (ordered) return para(style ?? 'ListNumber', run(`${toBn(n++)}.\t`, { b: true, color: '12305F' }) + runs(segments(li)));
    // Inside a shaded box (panel or callout) the bullet is plain text, so the item keeps the box's own style.
    if (style) return para(style, run('•  ', { color: '08708A' }) + runs(segments(li)));
    return para('ListBullet', runs(segments(li)), '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>');
  }).join('');
}

function blocksXml(container, ctx = {}) {
  const out = [];
  const kids = container.children.filter(c => typeof c !== 'string' || c.trim());
  for (const n of kids) {
    if (typeof n === 'string') throw new Error('Unexpected loose text: ' + n.slice(0, 60));
    if (n.tag === 'header' && hasClass(n, 'opener')) {
      for (const c of elements(n)) {
        if (hasClass(c, 'chap-num')) continue;                 // decorative numeral, PDF only
        if (c.tag === 'p') out.push(para('ChapterLabel', runs(segments(c))));
        if (c.tag === 'h1') { stats.headings[1].push(plain(c)); out.push(para('Heading1', runs(segments(c)))); }
      }
      continue;
    }
    if (n.tag === 'section') {
      const panel = hasClass(n, 'panel');
      out.push(blocksXml(n, { ...ctx, panel }) + (panel ? para('TableGap', '') : '')); continue;
    }
    if (/^h[2-4]$/.test(n.tag)) {
      const lvl = +n.tag[1];
      stats.headings[lvl]?.push(plain(n));
      out.push(para(ctx.panel && lvl === 2 ? 'PanelHeading' : `Heading${lvl}`, runs(segments(n)))); continue;
    }
    if (n.tag === 'p') { stats.paragraphs++; out.push(para(ctx.callout ?? (ctx.panel ? 'PanelText' : 'Normal'), runs(segments(n)))); continue; }
    if (n.tag === 'figure') { out.push(hasClass(n, 'image') ? imageFigure(n) : codeFigure(n)); continue; }
    if (n.tag === 'table') { out.push(table(n)); continue; }
    if (n.tag === 'ul' || n.tag === 'ol') { out.push(list(n, ctx.callout ?? (ctx.panel ? 'PanelText' : undefined))); continue; }
    if (n.tag === 'blockquote') { stats.callouts++; out.push(para('TableGap', '') + blocksXml(n, { ...ctx, callout: CALLOUT_STYLE[n.attrs.class] ?? 'CalloutNote' }) + para('TableGap', '')); continue; }
    if (n.tag === 'hr') { out.push(para('Rule', '')); continue; }
    throw new Error(`Unhandled element <${n.tag}>`);
  }
  return out.join('');
}
const bodyXml = blocksXml(tree);

// ---------- 4. package parts ----------
const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"';
const HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const fonts = (f = BODY_FONT) => `<w:rFonts w:ascii="${f}" w:hAnsi="${f}" w:eastAsia="${f}" w:cs="${BODY_FONT}"/>`;
const sz = pt => `<w:sz w:val="${Math.round(pt * 2)}"/><w:szCs w:val="${Math.round(pt * 2)}"/>`;
const bold = '<w:b/><w:bCs/>';
const shd = fill => `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>`;
const pStyle = (id, name, ppr, rpr, extra = '') => `<w:style w:type="paragraph" w:styleId="${id}"${id === 'Normal' ? ' w:default="1"' : ''}><w:name w:val="${name}"/>${id === 'Normal' ? '' : '<w:basedOn w:val="Normal"/>'}${extra}<w:qFormat/><w:pPr>${ppr}</w:pPr><w:rPr>${rpr}</w:rPr></w:style>`;
const heading = (lvl, pt, color, ppr) => pStyle(`Heading${lvl}`, `heading ${lvl}`, `<w:keepNext/><w:keepLines/>${ppr}<w:outlineLvl w:val="${lvl - 1}"/>`, `${bold}<w:color w:val="${color}"/>${sz(pt)}`, '<w:next w:val="Normal"/>');
const box = (left, leftSz, line) => `<w:pBdr><w:top w:val="single" w:sz="4" w:space="4" w:color="${line}"/><w:left w:val="single" w:sz="${leftSz}" w:space="7" w:color="${left}"/><w:bottom w:val="single" w:sz="4" w:space="4" w:color="${line}"/><w:right w:val="single" w:sz="4" w:space="7" w:color="${line}"/></w:pBdr>`;
const codeStyle = (id, name, left, fill, line = 'D3DBE7') => pStyle(id, name, `<w:keepLines/>${box(left, 18, line)}${shd(fill)}<w:spacing w:before="0" w:after="0" w:line="264" w:lineRule="auto"/><w:ind w:left="170" w:right="150"/><w:contextualSpacing/><w:jc w:val="left"/>`, `${fonts(MONO_FONT)}<w:noProof/><w:color w:val="1E2A3B"/>${sz(9.3)}`);
const callout = (id, name, left, fill) => pStyle(id, name, `<w:keepLines/><w:pBdr><w:left w:val="single" w:sz="20" w:space="9" w:color="${left}"/></w:pBdr>${shd(fill)}<w:spacing w:before="0" w:after="0" w:line="300" w:lineRule="auto"/><w:ind w:left="220" w:right="160"/>`, sz(10.3));

const stylesXml = `${HEAD}<w:styles ${NS}>
<w:docDefaults><w:rPrDefault><w:rPr>${fonts()}<w:color w:val="1C2534"/>${sz(10.9)}<w:lang w:val="en-US" w:eastAsia="en-US" w:bidi="bn-BD"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="130" w:line="312" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
${pStyle('Normal', 'Normal', '', '')}
${pStyle('ChapterLabel', 'Chapter Label', '<w:keepNext/><w:spacing w:before="480" w:after="60"/>', `${bold}<w:color w:val="08708A"/><w:spacing w:val="14"/>${sz(11.6)}`)}
${heading(1, 25, '12305F', '<w:pBdr><w:bottom w:val="single" w:sz="12" w:space="14" w:color="12305F"/></w:pBdr><w:spacing w:before="0" w:after="400" w:line="320" w:lineRule="auto"/>')}
${heading(2, 15.2, '12305F', '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="0B93B3"/></w:pBdr><w:spacing w:before="420" w:after="150" w:line="320" w:lineRule="auto"/>')}
${heading(3, 12.1, '1D4F9C', '<w:spacing w:before="290" w:after="90" w:line="320" w:lineRule="auto"/>')}
${heading(4, 10.9, '12305F', '<w:spacing w:before="220" w:after="70"/>')}
${pStyle('PanelHeading', 'Panel Heading', `<w:keepNext/><w:pBdr><w:left w:val="single" w:sz="20" w:space="9" w:color="0B93B3"/></w:pBdr>${shd('F4F8FC')}<w:spacing w:before="200" w:after="0" w:line="300" w:lineRule="auto"/><w:ind w:left="220" w:right="160"/>`, `${bold}<w:color w:val="12305F"/>${sz(12.6)}`)}
${pStyle('PanelText', 'Panel Text', `<w:pBdr><w:left w:val="single" w:sz="20" w:space="9" w:color="0B93B3"/></w:pBdr>${shd('F4F8FC')}<w:spacing w:before="0" w:after="0" w:line="300" w:lineRule="auto"/><w:ind w:left="220" w:right="160"/>`, '')}
${pStyle('CodeCaption', 'Code Caption', `<w:keepNext/><w:keepLines/>${box('D3DBE7', 4, 'D3DBE7')}${shd('E8EDF4')}<w:spacing w:before="140" w:after="0" w:line="264" w:lineRule="auto"/><w:ind w:left="170" w:right="150"/><w:jc w:val="left"/>`, `${bold}<w:color w:val="55647C"/>${sz(7.6)}`)}
${codeStyle('Code', 'Code', 'D3DBE7', 'F6F8FB')}
${codeStyle('CodeOutput', 'Code Output', '0B93B3', 'FBFCFE')}
${codeStyle('CodeError', 'Code Error', 'C0392B', 'FDF7F6')}
${codeStyle('CodeTerminal', 'Code Terminal', '12305F', 'F1F4F9')}
${callout('CalloutNote', 'Callout Note', '0B93B3', 'E9F6FA')}
${callout('CalloutWarn', 'Callout Warning', 'C58A12', 'FDF5E4')}
${callout('CalloutTip', 'Callout Tip', '2F8F5B', 'EDF7F1')}
${callout('CalloutRemember', 'Callout Remember', '12305F', 'EEF3FA')}
${pStyle('ListBullet', 'List Bullet', '<w:spacing w:after="70"/>', '')}
${pStyle('ListNumber', 'List Number', '<w:tabs><w:tab w:val="left" w:pos="560"/></w:tabs><w:spacing w:after="70"/><w:ind w:left="560" w:hanging="400"/>', '')}
${pStyle('TableText', 'Table Text', '<w:spacing w:after="0" w:line="312" w:lineRule="auto"/>', sz(9.7))}
${pStyle('TableGap', 'Table Gap', '<w:spacing w:after="0" w:line="220" w:lineRule="exact"/>', sz(4))}
${pStyle('Figure', 'Figure', '<w:keepNext/><w:spacing w:before="200" w:after="60" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/>', '')}
${pStyle('FigureCaption', 'Figure Caption', '<w:spacing w:after="240"/><w:jc w:val="center"/>', `<w:color w:val="5A6678"/>${sz(8.8)}`)}
${pStyle('Rule', 'Rule', '<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="D6DFEB"/></w:pBdr><w:spacing w:before="160" w:after="240"/>', sz(4))}
${pStyle('Header', 'header', `<w:tabs><w:tab w:val="right" w:pos="${BODY_W}"/></w:tabs><w:spacing w:after="0"/>`, `<w:color w:val="7B8798"/>${sz(7.6)}`)}
${pStyle('Footer', 'footer', '<w:spacing w:after="0"/><w:jc w:val="center"/>', `<w:color w:val="5A6678"/>${sz(9.2)}`)}
<w:style w:type="character" w:styleId="InlineCode"><w:name w:val="Inline Code"/><w:qFormat/><w:rPr>${fonts(MONO_FONT)}<w:noProof/><w:color w:val="173F78"/>${sz(9.2)}${shd('EDF1F7')}</w:rPr></w:style>
</w:styles>`;

const numberingXml = `${HEAD}<w:numbering ${NS}>
<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="560" w:hanging="300"/></w:pPr><w:rPr><w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Segoe UI"/><w:color w:val="08708A"/></w:rPr></w:lvl></w:abstractNum>
<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
</w:numbering>`;

const runningLeft = 'JavaScript Mastery — শূন্য থেকে প্রফেশনাল';
const runningRight = `${plain(elements(elements(tree)[0]).find(c => c.tag === 'p'))} · ${stats.headings[1][0]}`;
const pageField = '<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r>';
const documentXml = `${HEAD}<w:document ${NS}><w:body>${bodyXml}<w:sectPr><w:headerReference w:type="default" r:id="rId4"/><w:headerReference w:type="first" r:id="rId6"/><w:footerReference w:type="default" r:id="rId5"/><w:footerReference w:type="first" r:id="rId7"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1417" w:right="1191" w:bottom="1361" w:left="1191" w:header="680" w:footer="624" w:gutter="0"/><w:titlePg/></w:sectPr></w:body></w:document>`;
const headerXml = `${HEAD}<w:hdr ${NS}>${para('Header', run(runningLeft) + '<w:r><w:tab/></w:r>' + run(xmlEsc(runningRight)))}</w:hdr>`;
const headerFirstXml = `${HEAD}<w:hdr ${NS}>${para('Header', '')}</w:hdr>`;
const footerXml = `${HEAD}<w:ftr ${NS}>${para('Footer', pageField)}</w:ftr>`;
const settingsXml = `${HEAD}<w:settings ${NS}><w:zoom w:percent="100"/><w:defaultTabStop w:val="720"/><w:characterSpacingControl w:val="doNotCompress"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>`;
const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const CT = 'application/vnd.openxmlformats-officedocument.wordprocessingml';
const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const rel = (id, type, target) => `<Relationship Id="${id}" Type="${REL}/${type}" Target="${target}"/>`;
const files = [
  ['[Content_Types].xml', `${HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="${CT}.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="${CT}.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="${CT}.numbering+xml"/><Override PartName="/word/settings.xml" ContentType="${CT}.settings+xml"/><Override PartName="/word/header1.xml" ContentType="${CT}.header+xml"/><Override PartName="/word/header2.xml" ContentType="${CT}.header+xml"/><Override PartName="/word/footer1.xml" ContentType="${CT}.footer+xml"/><Override PartName="/word/footer2.xml" ContentType="${CT}.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`],
  ['_rels/.rels', `${HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rel('rId1', 'officeDocument', 'word/document.xml')}<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>${rel('rId3', 'extended-properties', 'docProps/app.xml')}</Relationships>`],
  ['word/_rels/document.xml.rels', `${HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rel('rId1', 'styles', 'styles.xml')}${rel('rId2', 'numbering', 'numbering.xml')}${rel('rId3', 'settings', 'settings.xml')}${rel('rId4', 'header', 'header1.xml')}${rel('rId5', 'footer', 'footer1.xml')}${rel('rId6', 'header', 'header2.xml')}${rel('rId7', 'footer', 'footer2.xml')}${media.map(m => rel(m.rId, 'image', `media/${m.name}`)).join('')}</Relationships>`],
  ['word/document.xml', documentXml],
  ['word/styles.xml', stylesXml],
  ['word/numbering.xml', numberingXml],
  ['word/settings.xml', settingsXml],
  ['word/header1.xml', headerXml],
  ['word/header2.xml', headerFirstXml],
  ['word/footer1.xml', footerXml],
  ['word/footer2.xml', footerXml],
  ...media.map(m => [`word/media/${m.name}`, m.data]),
  ['docProps/core.xml', `${HEAD}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${docTitle}</dc:title><dc:creator>Moynul Hasan</dc:creator><dc:language>bn-BD</dc:language><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`],
  ['docProps/app.xml', `${HEAD}<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>JavaScript Mastery premium sample builder</Application></Properties>`],
];

// ---------- 5. minimal ZIP writer (deflate) ----------
function zip(entries) {
  const chunks = [], central = [];
  let offset = 0;
  for (const [name, content] of entries) {
    const nb = Buffer.from(name, 'utf8'), raw = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
    const comp = zlib.deflateRawSync(raw, { level: 9 }), crc = zlib.crc32(raw);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(8, 8);
    lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0x21, 12); lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(raw.length, 22); lh.writeUInt16LE(nb.length, 26); lh.writeUInt16LE(0, 28);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(8, 10);
    ch.writeUInt16LE(0, 12); ch.writeUInt16LE(0x21, 14); ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(raw.length, 24); ch.writeUInt16LE(nb.length, 28); ch.writeUInt32LE(offset, 42);
    chunks.push(lh, nb, comp); central.push(ch, nb);
    offset += 30 + nb.length + comp.length;
  }
  const cd = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, cd, end]);
}
fs.writeFileSync(OUT, zip(files));
fs.writeFileSync(path.join(WORK, 'docx-data.json'), JSON.stringify({ ...stats, bytes: fs.statSync(OUT).size }, null, 2));
console.log(`DOCX written: ${OUT} (${fs.statSync(OUT).size} bytes)`);
console.log(`H1: ${stats.headings[1].length} | H2: ${stats.headings[2].length} | H3: ${stats.headings[3].length} | code blocks: ${stats.codeBlocks} (${stats.codeLines} lines) | tables: ${stats.tables} | lists: ${stats.lists} | callouts: ${stats.callouts} | images: ${stats.images}`);
