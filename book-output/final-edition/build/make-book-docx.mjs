// Whole-book DOCX for the final edition: a copy of master-design-system/scripts/make-docx.mjs (the master file is
// not modified), extended for a bound volume: one Word section per part (title page, front matter, table of contents,
// each chapter, each appendix), each with its own running header; continuous page numbers; a real, refreshable Word
// TOC field (TOC \o "1-2" \h \z \u); chapter headings carry the chapter number ("অধ্যায় N — Title").
// Input: build/work/book.html (the same HTML the PDF is printed from). Output: ../JavaScript_Mastery_Complete.docx
// Usage: node build/make-book-docx.mjs        (run from book-output/final-edition, after render-pdf.mjs)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';

const BUILD = path.dirname(fileURLToPath(import.meta.url));
const FINAL = path.resolve(BUILD, '..');
const SYSTEM = path.resolve(FINAL, '..', 'master-design-system');
const { tokens, book, toBn, measures } = await import(pathToFileURL(path.join(SYSTEM, 'scripts', 'lib', 'tokens.mjs')).href);
const bookData = JSON.parse(fs.readFileSync(path.join(BUILD, 'work', 'book.json'), 'utf8'));

const ch = { html: path.join(BUILD, 'work', 'book.html'), dir: FINAL, docx: path.join(FINAL, 'JavaScript_Mastery_Complete.docx'), work: path.join(BUILD, 'work') };
const T = tokens.type, C = Object.fromEntries(Object.entries(tokens.color).map(([k, v]) => [k, v.slice(1).toUpperCase()]));
// Word can only use fonts installed on the reader's computer, so the DOCX may name a different code font
// from the PDF (fonts.mono.docxFamily). See docs/FONT_AND_LICENSE_AUDIT.md.
const BODY_FONT = tokens.fonts.body.family, MONO_FONT = tokens.fonts.mono.docxFamily ?? tokens.fonts.mono.family;
const twip = mm => Math.round(mm * 1440 / 25.4);
const P = tokens.page, BODY_W = twip(P.widthMm - P.marginMm.left - P.marginMm.right);
const CHAR_TW = T.codePt * (tokens.fonts.mono.docxAdvanceEm ?? tokens.fonts.mono.advanceEm) * 20;   // width of one monospace character, in twips

// ---------- 1. parse the restricted HTML into a tree ----------
const html = fs.readFileSync(ch.html, 'utf8');
const docTitle = /<title>([^<]*)<\/title>/.exec(html)[1];
const body = /<body>([\s\S]*)<\/body>/.exec(html)[1];
const VOID = new Set(['br', 'hr', 'img', 'col']);
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
const find = (n, tag) => elements(n).find(c => c.tag === tag);

// ---------- 2. inline content -> runs ----------
const SPAN_FMT = { k: { color: C.synKeyword, b: true }, s: { color: C.synString }, c: { color: C.synComment }, n: { color: C.synNumber } };
function segments(node, fmt = {}, out = []) {
  for (const c of node.children) {
    if (typeof c === 'string') { out.push({ text: c, fmt }); continue; }
    if (c.tag === 'br') { out.push({ br: true }); continue; }
    let f = fmt;
    if (c.tag === 'strong') f = { ...fmt, b: true };
    else if (c.tag === 'em') f = { ...fmt, b: true, color: C.blue };          // emphasis is bold blue, as in the PDF
    else if (c.tag === 'code') f = fmt.block ? fmt : { ...fmt, code: true };  // <pre><code> is a block, not inline code
    else if (c.tag === 'span') f = { ...fmt, ...(SPAN_FMT[c.attrs.class] ?? {}) };
    segments(c, f, out);
  }
  return out;
}
// Text arrives already escaped with &amp; &lt; &gt; &quot;, all of which are valid XML entities.
const xmlText = t => t.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
const xmlEsc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Word draws Bengali from the run's ascii/hAnsi font slot, and the code font has no Bengali glyphs.
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
const GAP = para('BlockGap', '');

// ---------- 3. blocks ----------
const stats = { headings: { 1: [], 2: [], 3: [] }, codeBlocks: 0, codeLines: 0, hangingLines: 0, excerpts: 0, tables: 0, lists: 0, callouts: 0, images: 0, mcqItems: 0, solutions: 0, paragraphs: 0 };
const media = [];
const CALLOUT_STYLE = { note: 'CalloutNote', warn: 'CalloutWarn', tip: 'CalloutTip', remember: 'CalloutRemember' };
const CODE_STYLE = { source: 'Code', output: 'CodeOutput', error: 'CodeError', terminal: 'CodeTerminal', structure: 'CodeStructure' };

function table(node) {
  stats.tables++;
  const rows = [];
  (function collect(n) { for (const c of elements(n)) { if (c.tag === 'tr') rows.push(c); else if (c.tag !== 'colgroup') collect(c); } })(node);
  const cg = find(node, 'colgroup');
  const pct = cg ? elements(cg).map(c => parseFloat(/width:([\d.]+)%/.exec(c.attrs.style)[1])) : Array(elements(rows[0]).length).fill(100 / elements(rows[0]).length);
  const widths = pct.map(p => Math.round(BODY_W * p / 100));
  const border = s => `<w:${s} w:val="single" w:sz="4" w:space="0" w:color="${C.tableBorder}"/>`;
  const trs = rows.map((r, ri) => {
    const cells = elements(r), headRow = cells.every(c => c.tag === 'th');
    const tcs = cells.map((c, ci) => {
      const head = c.tag === 'th';
      const shade = head ? C.tableHeadBg : (ri % 2 === 0 ? C.tableZebra : '');
      const bottom = head ? `<w:tcBorders><w:bottom w:val="single" w:sz="8" w:space="0" w:color="${C.navy}"/></w:tcBorders>` : '';
      return `<w:tc><w:tcPr><w:tcW w:w="${widths[ci]}" w:type="dxa"/>${bottom}${shade ? `<w:shd w:val="clear" w:color="auto" w:fill="${shade}"/>` : ''}</w:tcPr>${para('TableText', runs(segments(c, head ? { b: true, color: C.navy } : {})))}</w:tc>`;
    }).join('');
    return `<w:tr><w:trPr><w:cantSplit/>${headRow ? '<w:tblHeader/>' : ''}</w:trPr>${tcs}</w:tr>`;
  }).join('');
  return `<w:tbl><w:tblPr><w:tblW w:w="${BODY_W}" w:type="dxa"/><w:tblBorders>${['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(border).join('')}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${widths.map(w => `<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>${trs}</w:tbl>${GAP}`;
}

function codeFigure(node) {
  stats.codeBlocks++;
  if (hasClass(node, 'excerpt')) stats.excerpts++;
  const kind = Object.keys(CODE_STYLE).find(k => hasClass(node, k)) ?? 'source';
  const cap = find(node, 'figcaption');
  const lineNodes = elements(find(find(node, 'pre'), 'code')).filter(c => hasClass(c, 'ln'));
  stats.codeLines += lineNodes.length;
  // Consecutive paragraphs with identical borders and shading merge into one box in Word.
  const out = [para('CodeCaption', run(xmlEsc(elements(cap).map(plain).join('  ·  '))))];
  lineNodes.forEach((ln, k) => {
    let extra = '';
    if (ln.attrs['data-hang']) {
      // Same hanging indent as the PDF: a wrapped continuation starts further right than the line itself.
      stats.hangingLines++;
      const h = Math.round(+ln.attrs['data-hang'] * CHAR_TW);
      extra += `<w:ind w:left="${170 + h}" w:right="150" w:hanging="${h}"/>`;
    }
    out.push(para(CODE_STYLE[kind], runs(segments(ln, { block: true })), extra));
  });
  // An unbordered gap paragraph ends the box; without it Word merges this panel with a following Output panel.
  return out.join('') + GAP;
}

function imageFigure(node) {
  stats.images++;
  const img = find(node, 'img'), cap = find(node, 'figcaption');
  const file = path.resolve(ch.dir, img.attrs['data-src']);
  const data = fs.readFileSync(file);
  if (data.toString('latin1', 1, 4) !== 'PNG') throw new Error('Only PNG figures are supported: ' + file);
  const cx = Math.round(tokens.layout.figureWidthMm / 25.4 * 914400), cy = Math.round(cx * data.readUInt32BE(20) / data.readUInt32BE(16));
  const id = media.length + 1, rId = `rIdImg${id}`, name = `image${id}.png`;
  media.push({ name, data, rId });
  const A = 'http://schemas.openxmlformats.org/drawingml/2006/main';
  const drawing = `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${id}" name="Figure ${id}" descr="${img.attrs.alt ?? ''}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="${A}" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="${A}"><a:graphicData uri="${A.replace('main', 'picture')}"><pic:pic xmlns:pic="${A.replace('main', 'picture')}"><pic:nvPicPr><pic:cNvPr id="${id}" name="${name}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:ln w="6350"><a:solidFill><a:srgbClr val="${C.codeBorder}"/></a:solidFill></a:ln></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
  return para('Figure', drawing) + para('FigureCaption', runs(segments(cap)));
}

function list(node, ctx) {
  stats.lists++;
  const items = elements(node);
  let n = parseInt(node.attrs.start ?? '1', 10);
  const boxed = ctx.callout ?? (ctx.panel ? 'PanelText' : null);
  return items.map((li, k) => {
    stats.paragraphs++;
    const body = runs(segments(li));
    // MCQ options carry their own ক) খ) labels: no bullet, and they stay with the question.
    if (ctx.mcq) return para('McqOption', body, k < items.length - 1 ? '<w:keepNext/>' : '');
    // Ordered items carry their Bengali number as text (Word has no Bengali numbering format), with a hanging indent.
    if (node.tag === 'ol') return para(boxed ?? 'ListNumber', run(`${toBn(n++)}.\t`, { b: true, color: C.navy }) + body);
    // Inside a shaded box the bullet is plain text, so the item keeps the box's own style.
    if (boxed) return para(boxed, run('•  ', { color: C.cyanDark }) + body);
    return para('ListBullet', body, '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>');
  }).join('');
}

// ---------- book: sections, title page, table of contents ----------
const sections = [];
const headerTexts = new Map();
function sectionEnd(node) {
  let header = null, footer = true, titlePg = false;
  if (hasClass(node, 'chapter')) {
    const c = bookData.chapters.find((x) => x.number === +node.attrs['data-chapter']);
    header = `${c.label} · ${c.running}`;
    titlePg = true;
  } else if (hasClass(node, 'copyright') || hasClass(node, 'title')) {
    footer = false;
  } else if (hasClass(node, 'back')) {
    header = bookData.back.find((b) => hasClass(node, b.id)).title;
  } else if (hasClass(node, 'toc')) {
    header = 'সূচিপত্র';
  } else {
    header = '';
  }
  sections.push({ header, footer, titlePg });
  return `<w:p><w:pPr><w:sectPr>@@SECT${sections.length - 1}@@</w:sectPr></w:pPr></w:p>`;
}
function titlePage(node) {
  const texts = [];
  (function walk(n) { for (const c of elements(n)) { if (['h1', 'p'].includes(c.tag)) texts.push({ tag: c.tag, cls: c.attrs.class ?? '', node: c }); else walk(c); } })(node);
  const style = { 'tp-series': 'Subtitle', 'tp-sub': 'Subtitle', 'tp-author': 'TitleAuthor', 'tp-edition': 'Normal' };
  const out = texts.map((t) => (t.tag === 'h1' ? para('Title', runs(segments(t.node))) : para(style[t.cls] ?? 'Normal', runs(segments(t.node)))));
  stats.headings[1].push(plain(texts.find((t) => t.tag === 'h1').node));
  return out.join('') + sectionEnd({ attrs: { class: 'title' } });
}
function tocField() {
  const field = '<w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \\o "1-2" \\h \\z \\u </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r>'
    + run('সূচিপত্র তৈরি বা হালনাগাদ করতে এখানে Right-click করে Update Field বেছে নিন (Word Document খোলার সময়ও জিজ্ঞাসা করে)।')
    + '<w:r><w:fldChar w:fldCharType="end"/></w:r>';
  return para('TOCHeading', run('সূচিপত্র')) + para('Normal', field) + sectionEnd({ attrs: { class: 'toc' } });
}

function blocksXml(container, ctx = {}) {
  const out = [];
  for (const n of container.children.filter(c => typeof c !== 'string' || c.trim())) {
    if (typeof n === 'string') throw new Error('Unexpected loose text: ' + n.slice(0, 60));
    if (n.tag === 'div' && hasClass(n, 'title-page')) { out.push(titlePage(n)); continue; }
    if (n.tag === 'div' && hasClass(n, 'toc-page')) { out.push(tocField()); continue; }
    if (n.tag === 'div' && (hasClass(n, 'matter') || hasClass(n, 'chapter'))) { out.push(blocksXml(n, ctx) + sectionEnd(n)); continue; }
    if (n.tag === 'div' && (hasClass(n, 'chapter-start') || hasClass(n, 'chapter-body'))) { out.push(blocksXml(n, ctx)); continue; }
    if (n.tag === 'h1') { stats.headings[1].push(plain(n)); out.push(para('Heading1', runs(segments(n)))); continue; }
    if (n.tag === 'header' && hasClass(n, 'opener')) {
      // Book edition: "অধ্যায় N — Title" in one Heading 1, so the Word table of contents shows the chapter number.
      const label = elements(n).find((c) => c.tag === 'p'), h = elements(n).find((c) => c.tag === 'h1');
      stats.headings[1].push(`${plain(label)} — ${plain(h)}`);
      out.push(para('Heading1', runs(segments(label)) + run(' — ') + runs(segments(h))));
      continue;
    }
    if (n.tag === 'section') {
      const role = ['panel', 'exercises', 'solutions', 'mcq', 'answers', 'project'].find(r => hasClass(n, r));
      out.push(blocksXml(n, { ...ctx, panel: role === 'panel', role }) + (role === 'panel' ? GAP : '')); continue;
    }
    if (n.tag === 'div' && hasClass(n, 'mcq-item')) { stats.mcqItems++; out.push(blocksXml(n, { ...ctx, mcq: true })); continue; }
    if (/^h[2-4]$/.test(n.tag)) {
      const lvl = +n.tag[1];
      stats.headings[lvl]?.push(plain(n));
      out.push(para(ctx.panel && lvl === 2 ? 'PanelHeading' : (ctx.role === 'exercises' && lvl === 3 ? 'ExerciseLevel' : `Heading${lvl}`), runs(segments(n)))); continue;
    }
    if (n.tag === 'p') {
      stats.paragraphs++;
      let style = ctx.callout ?? (ctx.panel ? 'PanelText' : 'Normal');
      if (ctx.mcq) style = 'McqQuestion';
      else if (hasClass(n, 'sol')) { style = 'SolutionLabel'; stats.solutions++; }
      else if (hasClass(n, 'quick-key')) style = 'QuickKey';
      out.push(para(style, runs(segments(n)))); continue;
    }
    if (n.tag === 'figure') { out.push(hasClass(n, 'image') ? imageFigure(n) : codeFigure(n)); continue; }
    if (n.tag === 'table') { out.push(table(n)); continue; }
    if (n.tag === 'ul' || n.tag === 'ol') { out.push(list(n, ctx)); continue; }
    if (n.tag === 'blockquote') { stats.callouts++; out.push(GAP + blocksXml(n, { ...ctx, callout: CALLOUT_STYLE[n.attrs.class] }) + GAP); continue; }
    if (n.tag === 'hr') { out.push(para('Rule', '')); continue; }
    throw new Error(`Unhandled element <${n.tag}${n.attrs.class ? ` class="${n.attrs.class}"` : ''}>`);
  }
  return out.join('');
}
const bodyXml = blocksXml(tree);

// ---------- 4. styles (from the design tokens) ----------
const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"';
const HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const fonts = (f = BODY_FONT) => `<w:rFonts w:ascii="${f}" w:hAnsi="${f}" w:eastAsia="${f}" w:cs="${BODY_FONT}"/>`;
const sz = pt => `<w:sz w:val="${Math.round(pt * 2)}"/><w:szCs w:val="${Math.round(pt * 2)}"/>`;
const bold = '<w:b/><w:bCs/>';
const shd = fill => `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>`;
const line = v => Math.round(v * 240);   // Word line spacing in 240ths of a line
const pStyle = (id, name, ppr, rpr, extra = '') => `<w:style w:type="paragraph" w:styleId="${id}"${id === 'Normal' ? ' w:default="1"' : ''}><w:name w:val="${name}"/>${id === 'Normal' ? '' : '<w:basedOn w:val="Normal"/>'}${extra}<w:qFormat/><w:pPr>${ppr}</w:pPr><w:rPr>${rpr}</w:rPr></w:style>`;
const heading = (lvl, pt, color, ppr) => pStyle(`Heading${lvl}`, `heading ${lvl}`, `<w:keepNext/><w:keepLines/>${ppr}<w:outlineLvl w:val="${lvl - 1}"/>`, `${bold}<w:color w:val="${color}"/>${sz(pt)}`, '<w:next w:val="Normal"/>');
const box = (left, leftSz, lineColor) => `<w:pBdr><w:top w:val="single" w:sz="4" w:space="4" w:color="${lineColor}"/><w:left w:val="single" w:sz="${leftSz}" w:space="7" w:color="${left}"/><w:bottom w:val="single" w:sz="4" w:space="4" w:color="${lineColor}"/><w:right w:val="single" w:sz="4" w:space="7" w:color="${lineColor}"/></w:pBdr>`;
const codeStyle = (id, name, left, leftSz, fill) => pStyle(id, name, `<w:keepLines/>${box(left, leftSz, C.codeBorder)}${shd(fill)}<w:spacing w:before="0" w:after="0" w:line="${line(1.1)}" w:lineRule="auto"/><w:ind w:left="170" w:right="150"/><w:contextualSpacing/><w:jc w:val="left"/>`, `${fonts(MONO_FONT)}<w:noProof/><w:color w:val="${C.codeInk}"/>${sz(T.codePt)}`);
const callout = (id, name, left, fill, kind = 'single') => pStyle(id, name, `<w:keepLines/><w:pBdr><w:left w:val="${kind}" w:sz="20" w:space="9" w:color="${left}"/></w:pBdr>${shd(fill)}<w:spacing w:before="0" w:after="0" w:line="${line(1.25)}" w:lineRule="auto"/><w:ind w:left="220" w:right="160"/>`, sz(T.calloutPt));
const panel = `<w:pBdr><w:left w:val="single" w:sz="20" w:space="9" w:color="${C.cyan}"/></w:pBdr>${shd(C.panelBg)}`;

const stylesXml = `${HEAD}<w:styles ${NS}>
<w:docDefaults><w:rPrDefault><w:rPr>${fonts()}<w:color w:val="${C.ink}"/>${sz(T.bodyPt)}<w:lang w:val="en-US" w:eastAsia="en-US" w:bidi="bn-BD"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:widowControl/><w:spacing w:after="130" w:line="${line(1.3)}" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
${pStyle('Normal', 'Normal', '', '')}
${pStyle('ChapterLabel', 'Chapter Label', '<w:keepNext/><w:spacing w:before="480" w:after="60"/>', `${bold}<w:color w:val="${C.cyanDark}"/><w:spacing w:val="14"/>${sz(T.chapterLabelPt)}`)}
${heading(1, T.h1Pt, C.navy, `<w:pBdr><w:bottom w:val="single" w:sz="12" w:space="14" w:color="${C.navy}"/></w:pBdr><w:spacing w:before="0" w:after="400" w:line="${line(1.33)}" w:lineRule="auto"/>`)}
${heading(2, T.h2Pt, C.navy, `<w:pBdr><w:bottom w:val="single" w:sz="8" w:space="4" w:color="${C.cyan}"/></w:pBdr><w:spacing w:before="420" w:after="150" w:line="${line(1.33)}" w:lineRule="auto"/>`)}
${heading(3, T.h3Pt, C.blue, `<w:spacing w:before="290" w:after="90" w:line="${line(1.33)}" w:lineRule="auto"/>`)}
${heading(4, T.bodyPt, C.navy, '<w:spacing w:before="220" w:after="70"/>')}
${pStyle('ExerciseLevel', 'Exercise Level', `<w:keepNext/><w:keepLines/><w:pBdr><w:left w:val="single" w:sz="20" w:space="8" w:color="${C.cyan}"/></w:pBdr><w:spacing w:before="320" w:after="110"/><w:ind w:left="200"/><w:outlineLvl w:val="2"/>`, `${bold}<w:color w:val="${C.navy}"/>${sz(T.h3Pt)}`, '<w:next w:val="Normal"/>')}
${pStyle('PanelHeading', 'Panel Heading', `<w:keepNext/>${panel}<w:spacing w:before="200" w:after="0" w:line="${line(1.25)}" w:lineRule="auto"/><w:ind w:left="220" w:right="160"/><w:outlineLvl w:val="1"/>`, `${bold}<w:color w:val="${C.navy}"/>${sz(T.panelHeadingPt)}`)}
${pStyle('PanelText', 'Panel Text', `${panel}<w:spacing w:before="0" w:after="0" w:line="${line(1.25)}" w:lineRule="auto"/><w:ind w:left="220" w:right="160"/>`, '')}
${pStyle('CodeCaption', 'Code Caption', `<w:keepNext/><w:keepLines/>${box(C.codeBorder, 4, C.codeBorder)}${shd(C.captionBg)}<w:spacing w:before="140" w:after="0" w:line="${line(1.1)}" w:lineRule="auto"/><w:ind w:left="170" w:right="150"/><w:jc w:val="left"/>`, `${bold}<w:color w:val="${C.captionInk}"/>${sz(T.captionPt)}`)}
${codeStyle('Code', 'Code', C.codeBorder, 4, C.codeBg)}
${codeStyle('CodeOutput', 'Code Output', C.cyan, 18, C.outputBg)}
${codeStyle('CodeError', 'Code Error', C.errorEdge, 18, C.errorBg)}
${codeStyle('CodeTerminal', 'Code Terminal', C.navy, 18, C.terminalBg)}
${codeStyle('CodeStructure', 'Code Structure', C.structureEdge, 18, C.codeBg)}
${callout('CalloutNote', 'Callout Note', C.cyan, C.noteBg)}
${callout('CalloutWarn', 'Callout Warning', C.warnEdge, C.warnBg, 'double')}
${callout('CalloutTip', 'Callout Tip', C.tipEdge, C.tipBg)}
${callout('CalloutRemember', 'Callout Remember', C.navy, C.rememberBg)}
${pStyle('ListBullet', 'List Bullet', '<w:spacing w:after="70"/>', '')}
${pStyle('ListNumber', 'List Number', '<w:tabs><w:tab w:val="left" w:pos="560"/></w:tabs><w:spacing w:after="70"/><w:ind w:left="560" w:hanging="400"/>', '')}
${pStyle('McqQuestion', 'MCQ Question', `<w:keepNext/><w:keepLines/><w:pBdr><w:left w:val="single" w:sz="12" w:space="10" w:color="${C.rule}"/></w:pBdr><w:spacing w:before="200" w:after="40"/><w:ind w:left="240"/>`, '')}
${pStyle('McqOption', 'MCQ Option', `<w:keepLines/><w:pBdr><w:left w:val="single" w:sz="12" w:space="10" w:color="${C.rule}"/></w:pBdr><w:spacing w:after="20"/><w:ind w:left="240"/>`, '')}
${pStyle('SolutionLabel', 'Solution Label', `<w:keepNext/><w:pBdr><w:top w:val="single" w:sz="4" w:space="8" w:color="${C.rule}"/></w:pBdr><w:spacing w:before="280" w:after="110"/>`, '')}
${pStyle('QuickKey', 'Quick Answer Key', `<w:keepLines/>${box(C.panelBorder, 4, C.panelBorder)}${shd(C.panelBg)}<w:spacing w:before="60" w:after="200"/><w:ind w:left="170" w:right="150"/>`, '')}
${pStyle('TableText', 'Table Text', `<w:spacing w:after="0" w:line="${line(1.25)}" w:lineRule="auto"/>`, sz(T.tablePt))}
${pStyle('BlockGap', 'Block Gap', '<w:spacing w:after="0" w:line="220" w:lineRule="exact"/>', sz(4))}
${pStyle('Figure', 'Figure', '<w:keepNext/><w:spacing w:before="200" w:after="60" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/>', '')}
${pStyle('FigureCaption', 'Figure Caption', '<w:spacing w:after="240"/><w:jc w:val="center"/>', `<w:color w:val="${C.muted}"/>${sz(T.figureCaptionPt)}`)}
${pStyle('Rule', 'Rule', `<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="${C.rule}"/></w:pBdr><w:spacing w:before="160" w:after="240"/>`, sz(4))}
${pStyle('Header', 'header', `<w:tabs><w:tab w:val="right" w:pos="${BODY_W}"/></w:tabs><w:spacing w:after="0"/>`, `<w:color w:val="${C.running}"/>${sz(T.runningPt)}`)}
${pStyle('Footer', 'footer', '<w:spacing w:after="0"/><w:jc w:val="center"/>', `<w:color w:val="${C.muted}"/>${sz(T.folioPt)}`)}
${pStyle('Title', 'Title', '<w:spacing w:before="3600" w:after="200"/>', `${bold}<w:color w:val="${C.navy}"/>${sz(40)}`)}
${pStyle('Subtitle', 'Subtitle', '<w:spacing w:after="240"/>', `${bold}<w:color w:val="${C.cyanDark}"/>${sz(16)}`)}
${pStyle('TitleAuthor', 'Title Author', '<w:spacing w:before="2400" w:after="120"/>', `${bold}<w:color w:val="${C.navy}"/>${sz(16)}`)}
${pStyle('TOCHeading', 'TOC Heading', `<w:pBdr><w:bottom w:val="single" w:sz="12" w:space="8" w:color="${C.navy}"/></w:pBdr><w:spacing w:before="0" w:after="300"/>`, `${bold}<w:color w:val="${C.navy}"/>${sz(T.h2Pt)}`)}
${pStyle('TOC1', 'toc 1', `<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="${BODY_W}"/></w:tabs><w:spacing w:before="160" w:after="20"/>`, `${bold}<w:color w:val="${C.navy}"/>${sz(10.2)}`)}
${pStyle('TOC2', 'toc 2', `<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="${BODY_W}"/></w:tabs><w:spacing w:after="0"/><w:ind w:left="400"/>`, sz(8.8))}
<w:style w:type="character" w:styleId="InlineCode"><w:name w:val="Inline Code"/><w:qFormat/><w:rPr>${fonts(MONO_FONT)}<w:noProof/><w:color w:val="${C.inlineCodeInk}"/>${sz(+(T.bodyPt * T.inlineCodeEm).toFixed(1))}${shd(C.inlineCodeBg)}</w:rPr></w:style>
</w:styles>`;

const numberingXml = `${HEAD}<w:numbering ${NS}>
<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="560" w:hanging="300"/></w:pPr><w:rPr><w:rFonts w:ascii="${BODY_FONT}" w:hAnsi="${BODY_FONT}" w:cs="${BODY_FONT}"/><w:color w:val="${C.cyanDark}"/></w:rPr></w:lvl></w:abstractNum>
<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
</w:numbering>`;

// ---------- 5. package ----------
const pageField = '<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r>';
const m = P.marginMm;
// Header parts: one empty header, and one per distinct running-header text.
const headerParts = [{ file: 'header0.xml', rId: 'rIdH0', xml: para('Header', '') }];
const headerFor = (text) => {
  if (text === null) return 'rIdH0';
  if (!headerTexts.has(text)) {
    const k = headerParts.length;
    headerParts.push({ file: `header${k}.xml`, rId: `rIdH${k}`, xml: para('Header', run(book.runningTitle) + (text ? '<w:r><w:tab/></w:r>' + run(xmlEsc(text)) : '')) });
    headerTexts.set(text, `rIdH${k}`);
  }
  return headerTexts.get(text);
};
const sectPr = ({ header, footer, titlePg }) => `<w:headerReference w:type="default" r:id="${headerFor(header)}"/><w:headerReference w:type="first" r:id="${titlePg ? 'rIdH0' : headerFor(header)}"/>`
  + `<w:footerReference w:type="default" r:id="${footer ? 'rIdF1' : 'rIdF0'}"/><w:footerReference w:type="first" r:id="${footer ? 'rIdF1' : 'rIdF0'}"/>`
  + `<w:type w:val="nextPage"/><w:pgSz w:w="${twip(P.widthMm)}" w:h="${twip(P.heightMm)}"/><w:pgMar w:top="${twip(m.top)}" w:right="${twip(m.right)}" w:bottom="${twip(m.bottom)}" w:left="${twip(m.left)}" w:header="${twip(m.top - P.headerGapMm - 6)}" w:footer="${twip(m.bottom - P.footerGapMm - 7)}" w:gutter="0"/>${titlePg ? '<w:titlePg/>' : ''}`;
let docBody = bodyXml.replace(/@@SECT(\d+)@@/g, (_, k) => sectPr(sections[+k]));
// The last section's properties belong at the end of the body, not in a paragraph.
const lastPara = docBody.lastIndexOf('<w:p><w:pPr><w:sectPr>');
docBody = docBody.slice(0, lastPara) + docBody.slice(lastPara).replace(/^<w:p><w:pPr>(<w:sectPr>[\s\S]*<\/w:sectPr>)<\/w:pPr><\/w:p>$/, '$1');
const documentXml = `${HEAD}<w:document ${NS}><w:body>${docBody}</w:body></w:document>`;
const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const CT = 'application/vnd.openxmlformats-officedocument.wordprocessingml';
// A fixed timestamp keeps the build reproducible: the same source always produces the same bytes.
const stamp = '2026-01-01T00:00:00Z';
const rel = (id, type, target) => `<Relationship Id="${id}" Type="${REL}/${type}" Target="${target}"/>`;
const files = [
  ['[Content_Types].xml', `${HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="${CT}.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="${CT}.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="${CT}.numbering+xml"/><Override PartName="/word/settings.xml" ContentType="${CT}.settings+xml"/>${headerParts.map((h) => `<Override PartName="/word/${h.file}" ContentType="${CT}.header+xml"/>`).join('')}<Override PartName="/word/footer0.xml" ContentType="${CT}.footer+xml"/><Override PartName="/word/footer1.xml" ContentType="${CT}.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`],
  ['_rels/.rels', `${HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rel('rId1', 'officeDocument', 'word/document.xml')}<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>${rel('rId3', 'extended-properties', 'docProps/app.xml')}</Relationships>`],
  ['word/_rels/document.xml.rels', `${HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rel('rId1', 'styles', 'styles.xml')}${rel('rId2', 'numbering', 'numbering.xml')}${rel('rId3', 'settings', 'settings.xml')}${headerParts.map((h) => rel(h.rId, 'header', h.file)).join('')}${rel('rIdF0', 'footer', 'footer0.xml')}${rel('rIdF1', 'footer', 'footer1.xml')}${media.map(x => rel(x.rId, 'image', `media/${x.name}`)).join('')}</Relationships>`],
  ['word/document.xml', documentXml],
  ['word/styles.xml', stylesXml],
  ['word/numbering.xml', numberingXml],
  ['word/settings.xml', `${HEAD}<w:settings ${NS}><w:zoom w:percent="100"/><w:defaultTabStop w:val="720"/><w:updateFields w:val="true"/><w:characterSpacingControl w:val="doNotCompress"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>`],
  ...headerParts.map((h) => [`word/${h.file}`, `${HEAD}<w:hdr ${NS}>${h.xml}</w:hdr>`]),
  ['word/footer0.xml', `${HEAD}<w:ftr ${NS}>${para('Footer', '')}</w:ftr>`],
  ['word/footer1.xml', `${HEAD}<w:ftr ${NS}>${para('Footer', pageField)}</w:ftr>`],
  ...media.map(x => [`word/media/${x.name}`, x.data]),
  ['docProps/core.xml', `${HEAD}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${docTitle}</dc:title><dc:creator>${xmlEsc(book.author)}</dc:creator><dc:language>${book.language}</dc:language><dcterms:created xsi:type="dcterms:W3CDTF">${stamp}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${stamp}</dcterms:modified></cp:coreProperties>`],
  ['docProps/app.xml', `${HEAD}<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>JavaScript Mastery design system ${tokens.version}</Application></Properties>`],
];

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
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6); cd.writeUInt16LE(0x0800, 8); cd.writeUInt16LE(8, 10);
    cd.writeUInt16LE(0, 12); cd.writeUInt16LE(0x21, 14); cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(comp.length, 20); cd.writeUInt32LE(raw.length, 24); cd.writeUInt16LE(nb.length, 28); cd.writeUInt32LE(offset, 42);
    chunks.push(lh, nb, comp); central.push(cd, nb);
    offset += 30 + nb.length + comp.length;
  }
  const dir = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(dir.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, dir, end]);
}
fs.writeFileSync(ch.docx, zip(files));
fs.writeFileSync(path.join(ch.work, 'docx-data.json'), JSON.stringify({ ...stats, sections: sections.length, headerParts: headerParts.length, fonts: [BODY_FONT, MONO_FONT], bytes: fs.statSync(ch.docx).size, codeCharsPerLine: measures().codeCharsPerLine }, null, 2));
console.log(`DOCX ${path.relative(process.cwd(), ch.docx)}  —  H1 ${stats.headings[1].length}, H2 ${stats.headings[2].length}, H3 ${stats.headings[3].length}, ${stats.codeBlocks} code panels (${stats.codeLines} lines, ${stats.excerpts} excerpt), ${stats.tables} tables, ${stats.mcqItems} MCQs, ${stats.solutions} solutions, ${stats.images} figure`);
