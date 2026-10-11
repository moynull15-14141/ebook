// Writes the editable DOCX directly as OOXML (no Word needed to build it).
// Input: work/book-word.html, the Word-oriented HTML produced by build.mjs.
// Usage: node make-docx.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.join(HERE, 'work');
const OUT = path.resolve(HERE, '..', 'JavaScript_Mastery_Draft_Edition.docx');
const BN_FONT = 'Nirmala UI', LATIN_FONT = 'Segoe UI', MONO_FONT = 'Cascadia Mono';
const BODY_W = 9752;   // A4 width minus left/right margins, in twips

// ---------- 1. parse the restricted HTML into a tree ----------
const html = fs.readFileSync(path.join(WORK, 'book-word.html'), 'utf8');
const body = /<body>([\s\S]*)<\/body>/.exec(html)[1];
const VOID = new Set(['br', 'hr']);
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

// ---------- 2. inline content -> runs ----------
const SPAN_FMT = { k: { color: '0B4F9C', b: true }, s: { color: '0F7B3F' }, c: { color: '6B7280', i: true }, n: { color: 'B45309' } };
function segments(node, fmt = {}, out = []) {
  for (const ch of node.children) {
    if (typeof ch === 'string') { out.push({ text: ch, fmt }); continue; }
    if (ch.tag === 'br') { out.push({ br: true }); continue; }
    let f = fmt;
    if (ch.tag === 'strong') f = { ...fmt, b: true };
    else if (ch.tag === 'em') f = { ...fmt, i: true };
    else if (ch.tag === 'code') f = { ...fmt, code: true };
    else if (ch.tag === 'span') f = { ...fmt, ...(SPAN_FMT[ch.attrs.class] ?? {}) };
    segments(ch, f, out);
  }
  return out;
}
// Text arrives already escaped with &amp; &lt; &gt; &quot;, all of which are valid XML entities.
const xmlText = t => t.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
// Word draws Bengali from the run's ascii/hAnsi font slot (not the complex-script slot), and neither
// Segoe UI nor Cascadia Mono has Bengali glyphs. So each run is split by script and the Bengali
// pieces name the Bengali font explicitly — the same encoding Word itself writes.
const BN_RUN = /([ঀ-৿।॥‌‍]+)/;
const BN_FONTS = `<w:rFonts w:ascii="${BN_FONT}" w:hAnsi="${BN_FONT}" w:cs="${BN_FONT}"/>`;
function run(text, fmt = {}) {
  return xmlText(text).split(BN_RUN).filter(Boolean).map(piece => {
    const bn = BN_RUN.test(piece);
    const pr = (fmt.code ? '<w:rStyle w:val="InlineCode"/>' : '') + (bn ? BN_FONTS : '') + (fmt.b ? '<w:b/><w:bCs/>' : '') + (fmt.i ? '<w:i/><w:iCs/>' : '') + (fmt.color ? `<w:color w:val="${fmt.color}"/>` : '');
    const parts = piece.split('\t').map(t => t ? `<w:t xml:space="preserve">${t}</w:t>` : '').join('<w:tab/>');
    return `<w:r>${pr ? `<w:rPr>${pr}</w:rPr>` : ''}${parts}</w:r>`;
  }).join('');
}
const runs = segs => segs.map(s => s.br ? '<w:r><w:br/></w:r>' : run(s.text, s.fmt)).join('');
const plain = node => segments(node).map(s => s.br ? ' ' : s.text).join('').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
const para = (style, inner, extra = '') => `<w:p><w:pPr>${style ? `<w:pStyle w:val="${style}"/>` : ''}${extra}</w:pPr>${inner}</w:p>`;

// ---------- 3. blocks ----------
const P_STYLE = { subtitle: 'ChapterSubtitle', meta: 'ChapterMeta', 'w-title': 'CoverTitle', 'w-sub': 'CoverSubtitle', 'w-tag': 'CoverTagline', 'w-ed': 'CoverEdition', 'w-author': 'CoverAuthor', 'w-copy': 'CopyrightText', 'toc-head': 'TocHeading' };
const stats = { headings1: [], chapters: 0, codeBlocks: 0, codeLines: 0, tables: 0, lists: 0, paragraphs: 0 };
const nums = [];           // extra numbering instances for ordered lists
const BREAK = '<w:pageBreakBefore/>';
let pendingBreak = false;  // set by a page-break container, consumed by the next paragraph
const takeBreak = own => { const b = own || pendingBreak; pendingBreak = false; return b ? BREAK : ''; };
const hasBreak = n => /page-break-before:\s*always/.test(n.attrs.style ?? '');

function tocField(titles) {
  const out = [];
  titles.forEach((t, k) => {
    const begin = k === 0 ? '<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \\o "1-1" \\h \\z \\u </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r>' : '';
    out.push(para('TOC1', begin + run(t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))));
  });
  out.push('<w:p><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>');
  return out.join('');
}

function table(node) {
  stats.tables++;
  const rows = [];
  (function collect(n) { for (const c of n.children) if (typeof c !== 'string') { if (c.tag === 'tr') rows.push(c); else collect(c); } })(node);
  const cols = Math.max(...rows.map(r => r.children.filter(c => typeof c !== 'string').length));
  const grid = Array.from({ length: cols }, () => `<w:gridCol w:w="${Math.floor(BODY_W / cols)}"/>`).join('');
  const border = s => `<w:${s} w:val="single" w:sz="4" w:space="0" w:color="CDD6E4"/>`;
  const trs = rows.map((r, ri) => {
    const cells = r.children.filter(c => typeof c !== 'string');
    const headRow = cells.every(c => c.tag === 'th');
    const tcs = cells.map(c => {
      const align = /text-align:\s*(center|right)/.exec(c.attrs.style ?? '');
      const head = c.tag === 'th';
      const segs = segments(c, head ? { b: true, color: '1B3A7A' } : {});
      return `<w:tc><w:tcPr>${head ? '<w:shd w:val="clear" w:color="auto" w:fill="E9EFFB"/>' : (ri % 2 === 0 ? '<w:shd w:val="clear" w:color="auto" w:fill="F8FAFD"/>' : '')}</w:tcPr>${para('TableText', runs(segs), align ? `<w:jc w:val="${align[1]}"/>` : '')}</w:tc>`;
    }).join('');
    return `<w:tr><w:trPr><w:cantSplit/>${headRow ? '<w:tblHeader/>' : ''}</w:trPr>${tcs}</w:tr>`;
  }).join('');
  return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>${['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(border).join('')}</w:tblBorders><w:tblCellMar><w:top w:w="50" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="50" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${trs}</w:tbl>${para('TableGap', '')}`;
}

function codeBlock(node) {
  stats.codeBlocks++;
  const lines = [[]];
  for (const s of segments(node)) {
    const pieces = s.text.split('\n');
    pieces.forEach((p, k) => { if (k > 0) lines.push([]); if (p) lines[lines.length - 1].push({ text: p, fmt: s.fmt }); });
  }
  stats.codeLines += lines.length;
  // Consecutive paragraphs with identical borders/shading merge into one box in Word.
  return lines.map((l, k) => para('Code', runs(l), k === lines.length - 1 ? '<w:spacing w:before="0" w:after="180"/>' : '')).join('');
}

function list(node, quote) {
  stats.lists++;
  let numId = 1;
  if (node.tag === 'ol') { numId = nums.length + 2; nums.push({ numId, start: parseInt(node.attrs.start ?? '1', 10) }); }
  return node.children.filter(c => typeof c !== 'string').map(li => {
    stats.paragraphs++;
    if (li.attrs.class === 'task') return para(quote ? 'Quote' : 'TaskItem', runs(segments(li)));
    return para(quote ? 'Quote' : 'ListParagraph', runs(segments(li)), `<w:numPr><w:ilvl w:val="0"/><w:numId w:val="${numId}"/></w:numPr>`);
  }).join('');
}

function blocksXml(container, quote = false) {
  const out = [];
  const kids = container.children.filter(c => typeof c !== 'string' || c.trim());
  for (let i = 0; i < kids.length; i++) {
    const n = kids[i];
    if (typeof n === 'string') throw new Error('Unexpected loose text: ' + n.slice(0, 60));
    const cls = n.attrs.class;
    if (n.tag === 'div') { if (hasBreak(n)) pendingBreak = true; out.push(blocksXml(n, quote)); continue; }
    if (n.tag === 'p' && cls === 'chap-label' && kids[i + 1]?.tag === 'h1') {
      // One real heading per chapter ("অধ্যায় ১ — Title") so Word's TOC and Navigation Pane are meaningful.
      const h = kids[++i];
      const label = plain(n);
      stats.headings1.push(`${label} — ${plain(h)}`); stats.chapters++;
      out.push(para('Heading1', run(`${segments(n).map(s => s.text).join('')} — `) + runs(segments(h)), takeBreak(hasBreak(n) || hasBreak(h))));
      continue;
    }
    if (/^h[1-4]$/.test(n.tag)) {
      if (n.tag === 'h1') stats.headings1.push(plain(n));
      out.push(para(`Heading${n.tag[1]}`, runs(segments(n)), takeBreak(hasBreak(n)))); continue;
    }
    if (n.tag === 'p') {
      stats.paragraphs++;
      if (plain(n).trim() === 'TOC_PLACEHOLDER') { out.push('\u0001TOC\u0001'); continue; }
      out.push(para(quote ? 'Quote' : (P_STYLE[cls] ?? 'Normal'), runs(segments(n)), takeBreak(hasBreak(n)))); continue;
    }
    if (n.tag === 'pre') { out.push(codeBlock(n)); continue; }
    if (n.tag === 'table') { out.push(table(n)); continue; }
    if (n.tag === 'ul' || n.tag === 'ol') { out.push(list(n, quote)); continue; }
    if (n.tag === 'blockquote') { out.push(blocksXml(n, true)); continue; }
    if (n.tag === 'hr') { out.push(para('Rule', '')); continue; }
    throw new Error(`Unhandled element <${n.tag}>`);
  }
  return out.join('');
}
let bodyXml = blocksXml(tree);
bodyXml = bodyXml.replace('\u0001TOC\u0001', tocField(stats.headings1));
if (bodyXml.includes('\u0001')) throw new Error('TOC placeholder was not replaced exactly once');

// ---------- 4. package parts ----------
const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
const HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const fonts = (latin = LATIN_FONT) => `<w:rFonts w:ascii="${latin}" w:hAnsi="${latin}" w:eastAsia="${latin}" w:cs="${BN_FONT}"/>`;
const sz = pt => `<w:sz w:val="${pt * 2}"/><w:szCs w:val="${pt * 2}"/>`;
const bold = '<w:b/><w:bCs/>';
const pStyle = (id, name, ppr, rpr, extra = '') => `<w:style w:type="paragraph" w:styleId="${id}"${id === 'Normal' ? ' w:default="1"' : ''}><w:name w:val="${name}"/>${id === 'Normal' ? '' : '<w:basedOn w:val="Normal"/>'}${extra}<w:qFormat/><w:pPr>${ppr}</w:pPr><w:rPr>${rpr}</w:rPr></w:style>`;
const heading = (lvl, pt, color, ppr) => pStyle(`Heading${lvl}`, `heading ${lvl}`, `<w:keepNext/><w:keepLines/>${ppr}<w:outlineLvl w:val="${lvl - 1}"/>`, `${bold}<w:color w:val="${color}"/>${sz(pt)}`, '<w:next w:val="Normal"/>');
const codeBorder = '<w:pBdr><w:top w:val="single" w:sz="4" w:space="3" w:color="DBE2EE"/><w:left w:val="single" w:sz="18" w:space="6" w:color="F0B429"/><w:bottom w:val="single" w:sz="4" w:space="3" w:color="DBE2EE"/><w:right w:val="single" w:sz="4" w:space="6" w:color="DBE2EE"/></w:pBdr>';

const stylesXml = `${HEAD}<w:styles ${NS}>
<w:docDefaults><w:rPrDefault><w:rPr>${fonts()}<w:color w:val="1D2433"/>${sz(10.5)}<w:lang w:val="en-US" w:eastAsia="en-US" w:bidi="bn-BD"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="336" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
${pStyle('Normal', 'Normal', '', '')}
${heading(1, 21, '1B3A7A', '<w:pBdr><w:bottom w:val="single" w:sz="12" w:space="6" w:color="1B3A7A"/></w:pBdr><w:spacing w:before="120" w:after="280" w:line="300" w:lineRule="auto"/>')}
${heading(2, 14, '1B3A7A', '<w:pBdr><w:left w:val="single" w:sz="24" w:space="6" w:color="F0B429"/></w:pBdr><w:spacing w:before="340" w:after="130" w:line="288" w:lineRule="auto"/><w:ind w:left="120"/>')}
${heading(3, 11.5, '284F9E', '<w:spacing w:before="250" w:after="90" w:line="288" w:lineRule="auto"/>')}
${heading(4, 10.5, '1B3A7A', '<w:spacing w:before="200" w:after="70"/>')}
${pStyle('ChapterSubtitle', 'Chapter Subtitle', '<w:spacing w:after="120"/>', `<w:color w:val="284F9E"/>${sz(12.5)}`)}
${pStyle('ChapterMeta', 'Chapter Meta', '<w:spacing w:after="80"/>', `<w:color w:val="5B6475"/>${sz(9.5)}`)}
${pStyle('CoverTitle', 'Cover Title', '<w:spacing w:before="3000" w:after="120" w:line="240" w:lineRule="auto"/>', `${bold}<w:color w:val="1B3A7A"/>${sz(38)}`)}
${pStyle('CoverSubtitle', 'Cover Subtitle', '<w:pBdr><w:bottom w:val="single" w:sz="18" w:space="14" w:color="F0B429"/></w:pBdr><w:spacing w:after="360"/>', `${bold}<w:color w:val="B7791F"/>${sz(23)}`)}
${pStyle('CoverTagline', 'Cover Tagline', '<w:spacing w:after="120"/>', `<w:color w:val="475569"/>${sz(12)}`)}
${pStyle('CoverEdition', 'Cover Edition', '<w:spacing w:before="480" w:after="120"/>', `<w:color w:val="1B3A7A"/>${sz(11)}`)}
${pStyle('CoverAuthor', 'Cover Author', '<w:spacing w:before="900" w:after="40"/>', `${bold}<w:color w:val="1B3A7A"/>${sz(17)}`)}
${pStyle('CopyrightText', 'Copyright Text', '<w:spacing w:after="150" w:line="312" w:lineRule="auto"/>', `<w:color w:val="5B6475"/>${sz(9)}`)}
${pStyle('TocHeading', 'TOC Title', '<w:pBdr><w:bottom w:val="single" w:sz="12" w:space="6" w:color="1B3A7A"/></w:pBdr><w:spacing w:before="120" w:after="280"/>', `${bold}<w:color w:val="1B3A7A"/>${sz(21)}`)}
${pStyle('TOC1', 'toc 1', `<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="${BODY_W}"/></w:tabs><w:spacing w:after="70"/>`, sz(10))}
${pStyle('Code', 'Code', `<w:keepLines/>${codeBorder}<w:shd w:val="clear" w:color="auto" w:fill="F5F7FB"/><w:spacing w:before="0" w:after="0" w:line="252" w:lineRule="auto"/><w:ind w:left="150" w:right="120"/><w:contextualSpacing/><w:jc w:val="left"/>`, `${fonts(MONO_FONT)}<w:noProof/><w:color w:val="1F2937"/>${sz(8.5)}`)}
${pStyle('Quote', 'Quote', '<w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="F0B429"/></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="FFF8E6"/><w:spacing w:before="60" w:after="60"/><w:ind w:left="200" w:right="120"/>', '')}
${pStyle('ListParagraph', 'List Paragraph', '<w:spacing w:after="60"/>', '')}
${pStyle('TaskItem', 'Task Item', '<w:spacing w:after="60"/><w:ind w:left="360"/>', '')}
${pStyle('TableText', 'Table Text', '<w:spacing w:after="0" w:line="288" w:lineRule="auto"/>', sz(9.5))}
${pStyle('TableGap', 'Table Gap', '<w:spacing w:after="0" w:line="200" w:lineRule="exact"/>', sz(4))}
${pStyle('Rule', 'Rule', '<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="D7DEEA"/></w:pBdr><w:spacing w:before="160" w:after="240"/>', sz(4))}
${pStyle('Header', 'header', '<w:spacing w:after="0"/><w:jc w:val="right"/>', `<w:color w:val="8A94A6"/>${sz(8)}`)}
${pStyle('Footer', 'footer', '<w:spacing w:after="0"/><w:jc w:val="center"/>', `<w:color w:val="5B6475"/>${sz(9)}`)}
<w:style w:type="character" w:styleId="InlineCode"><w:name w:val="Inline Code"/><w:qFormat/><w:rPr>${fonts(MONO_FONT)}<w:noProof/><w:color w:val="8A2D0D"/>${sz(9)}<w:shd w:val="clear" w:color="auto" w:fill="EEF2F8"/></w:rPr></w:style>
</w:styles>`;

const lvl = (fmt, text, extraR = '') => `<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="${fmt}"/><w:lvlText w:val="${text}"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="540" w:hanging="300"/></w:pPr>${extraR}</w:lvl>`;
const numberingXml = `${HEAD}<w:numbering ${NS}>
<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>${lvl('bullet', '•', `<w:rPr><w:rFonts w:ascii="${LATIN_FONT}" w:hAnsi="${LATIN_FONT}" w:cs="${LATIN_FONT}"/></w:rPr>`)}</w:abstractNum>
<w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="hybridMultilevel"/>${lvl('decimal', '%1.')}</w:abstractNum>
<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
${nums.map(n => `<w:num w:numId="${n.numId}"><w:abstractNumId w:val="1"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="${n.start}"/></w:lvlOverride></w:num>`).join('\n')}
</w:numbering>`;

const documentXml = `${HEAD}<w:document ${NS}><w:body>${bodyXml}<w:sectPr><w:headerReference w:type="default" r:id="rId4"/><w:footerReference w:type="default" r:id="rId5"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1191" w:right="1077" w:bottom="1247" w:left="1077" w:header="567" w:footer="567" w:gutter="0"/><w:titlePg/></w:sectPr></w:body></w:document>`;
const headerXml = `${HEAD}<w:hdr ${NS}>${para('Header', run('JavaScript Mastery — শূন্য থেকে প্রফেশনাল  •  খসড়া সংস্করণ'))}</w:hdr>`;
const footerXml = `${HEAD}<w:ftr ${NS}>${para('Footer', '<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r>')}</w:ftr>`;
const settingsXml = `${HEAD}<w:settings ${NS}><w:zoom w:percent="100"/><w:defaultTabStop w:val="720"/><w:characterSpacingControl w:val="doNotCompress"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>`;
const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const CT = 'application/vnd.openxmlformats-officedocument.wordprocessingml';
const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const files = [
  ['[Content_Types].xml', `${HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="${CT}.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="${CT}.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="${CT}.numbering+xml"/><Override PartName="/word/settings.xml" ContentType="${CT}.settings+xml"/><Override PartName="/word/header1.xml" ContentType="${CT}.header+xml"/><Override PartName="/word/footer1.xml" ContentType="${CT}.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`],
  ['_rels/.rels', `${HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="${REL}/extended-properties" Target="docProps/app.xml"/></Relationships>`],
  ['word/_rels/document.xml.rels', `${HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/styles" Target="styles.xml"/><Relationship Id="rId2" Type="${REL}/numbering" Target="numbering.xml"/><Relationship Id="rId3" Type="${REL}/settings" Target="settings.xml"/><Relationship Id="rId4" Type="${REL}/header" Target="header1.xml"/><Relationship Id="rId5" Type="${REL}/footer" Target="footer1.xml"/></Relationships>`],
  ['word/document.xml', documentXml],
  ['word/styles.xml', stylesXml],
  ['word/numbering.xml', numberingXml],
  ['word/settings.xml', settingsXml],
  ['word/header1.xml', headerXml],
  ['word/footer1.xml', footerXml],
  ['docProps/core.xml', `${HEAD}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>JavaScript Mastery — শূন্য থেকে প্রফেশনাল (Draft Edition)</dc:title><dc:creator>Moynul Hasan</dc:creator><dc:language>bn-BD</dc:language><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`],
  ['docProps/app.xml', `${HEAD}<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>JavaScript Mastery draft builder</Application></Properties>`],
];

// ---------- 5. minimal ZIP writer (deflate) ----------
function zip(entries) {
  const chunks = [], central = [];
  let offset = 0;
  for (const [name, content] of entries) {
    const nb = Buffer.from(name, 'utf8'), raw = Buffer.from(content, 'utf8');
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
fs.writeFileSync(path.join(WORK, 'docx-data.json'), JSON.stringify({ ...stats, orderedLists: nums.length, bytes: fs.statSync(OUT).size }, null, 2));
console.log(`DOCX written: ${OUT} (${fs.statSync(OUT).size} bytes)`);
console.log(`Heading 1: ${stats.headings1.length} (chapters: ${stats.chapters}) | code blocks: ${stats.codeBlocks} (${stats.codeLines} lines) | tables: ${stats.tables} | lists: ${stats.lists}`);
