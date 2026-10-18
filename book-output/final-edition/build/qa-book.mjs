// Automated QA of the complete book: PDF, DOCX and the assembled manuscript (cross-chapter checks).
// Writes work/qa-data.json; FINAL_QA_REPORT.md is written from it by make-reports.mjs.
// Usage: node build/qa-book.mjs        (run from book-output/final-edition)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';

const BUILD = path.dirname(fileURLToPath(import.meta.url));
const FINAL = path.resolve(BUILD, '..');
const SYSTEM = path.resolve(FINAL, '..', 'master-design-system');
const lib = (f) => import(pathToFileURL(path.join(SYSTEM, 'scripts', 'lib', f)).href);
const { rules, toBn, fromBn, tokens } = await lib('tokens.mjs');
const { readPages, extract, openPdf } = await lib('pdf-text.mjs');
const { readOutline } = await import(pathToFileURL(path.join(BUILD, 'pdf-outline.mjs')).href);
const book = JSON.parse(fs.readFileSync(path.join(BUILD, 'work', 'book.json'), 'utf8'));
const pdfData = JSON.parse(fs.readFileSync(path.join(BUILD, 'work', 'pdf-data.json'), 'utf8'));
const manuscript = fs.readFileSync(path.join(FINAL, book.manuscript), 'utf8');

const results = [];
const check = (area, name, ok, detail = '', status) => {
  const s = status ?? (ok ? 'PASS' : 'FAIL');
  results.push({ area, name, status: s, detail });
  console.log(`${s.padEnd(7)} [${area}] ${name}${detail ? `  (${detail})` : ''}`);
};

// ===================== PDF =====================
const PDF = path.join(FINAL, 'JavaScript_Mastery_Complete.pdf');
const pdf = openPdf(PDF);
const raw = fs.readFileSync(PDF, 'latin1');
const outline = readOutline(PDF);
check('PDF', 'opens and parses (classic xref, all objects read)', pdf.objs.size > 0, `${pdf.objs.size} objects, ${(pdf.bytes / 1048576).toFixed(1)} MB`);
const boxes = [...raw.matchAll(/\/MediaBox\s*\[\s*0 0 ([\d.]+) ([\d.]+)\s*\]/g)].map((m) => `${Math.round(+m[1])}x${Math.round(+m[2])}`);
check('PDF', 'every page is A4 (595 x 842 pt)', boxes.length >= outline.pages && boxes.every((b) => b === '595x842'), `${outline.pages} pages`);
const fontFiles = (raw.match(/\/FontFile2\s/g) ?? []).length, type3 = (raw.match(/\/Subtype\s*\/Type3/g) ?? []).length;
const fontNames = [...new Set([...raw.matchAll(/\/BaseFont\s*\/([A-Z]{6}\+)?([\w-]+)/g)].map((m) => m[2]))];
check('PDF', 'fonts embedded (TrueType FontFile2), no Type 3 outlines', fontFiles > 0 && type3 === 0, `${fontFiles} embedded font programs; ${fontNames.join(', ')}`);
check('PDF', 'only the design-system fonts are used', fontNames.every((f) => /HindSiliguri|SourceCodePro/.test(f)), fontNames.join(', '));

const h1 = outline.items.filter((i) => i.level === 1);
const chapterBookmarks = h1.filter((i, k) => book.chapters.some((c) => i.page === pdfData.chapterStarts[c.number]));
check('PDF', 'bookmarks (outline) present for every H1 and H2', outline.items.filter((i) => i.level <= 2).length === 1 + 7 + 1 + 30 + 4 + book.counts.h2 + (manuscript.match(/^## /gm) ?? []).length - book.counts.h2,
  `${outline.items.length} bookmarks, ${h1.length} top level`);
check('PDF', 'exactly 30 chapter bookmarks, in order 1-30', chapterBookmarks.length === 30
  && book.chapters.every((c, k) => pdfData.chapterStarts[c.number] > (k ? pdfData.chapterStarts[c.number - 1] : 0)), `chapter 1 on page ${pdfData.chapterStarts[1]}, chapter 30 on page ${pdfData.chapterStarts[30]}`);
const links = (raw.match(/\/Subtype\s*\/Link/g) ?? []).length;
const internalLinks = (raw.match(/\/Subtype\s*\/Link[^]*?\/Dest\b/g) ?? []).length;
check('PDF', 'table of contents is clickable (internal link annotations)', links >= 30 + book.counts.h2, `${links} link annotations`);
check('PDF', 'table of contents numbers stable after re-render', pdfData.tocStable === true, `passes ${pdfData.passes}`);

console.log('reading every page of the PDF text layer...');
const { pages } = readPages(PDF);
const text = pages.map((g) => extract(g, 'actual').replace(/\s+/g, ' '));
const pageW = 595.28, marginR = tokens.page.marginMm.right * 72 / 25.4, marginL = tokens.page.marginMm.left * 72 / 25.4;
// Folio: Bengali page number at the bottom of every page except the title and copyright pages.
const folioMissing = [];
for (let i = 2; i < pages.length; i++) {
  const bottom = pages[i].filter((g) => g.y < 60).map((g) => g.uni).join('');
  if (!bottom.includes(toBn(i + 1))) folioMissing.push(i + 1);
}
check('PDF', 'continuous page numbers (Bengali folio = physical page) on pages 3-end', folioMissing.length === 0, folioMissing.length ? `missing on ${folioMissing.slice(0, 10).join(', ')}` : `${pages.length - 2} pages`);
// Running header changes with the chapter.
const headerWrong = [];
for (const c of book.chapters) {
  const p = pdfData.chapterStarts[c.number] + 2;
  const top = pages[p - 1].filter((g) => g.y > 790).map((g) => g.spanText ?? g.uni);
  const topText = extract(pages[p - 1].filter((g) => g.y > 790), 'actual').replace(/\s+/g, '');
  if (!topText.includes(`${c.label}·${c.running}`.replace(/\s+/g, ''))) headerWrong.push(`${c.number}:p${p}`);
  void top;
}
check('PDF', 'running header shows each chapter number and short title', headerWrong.length === 0, headerWrong.join(', ') || '30 chapters sampled (opener + 2)');
const headerTwoLines = [];
for (let i = 2; i < pages.length; i++) {
  const ys = [...new Set(pages[i].filter((g) => g.y > 780).map((g) => Math.round(g.y)))];
  if (ys.length > 1 && Math.max(...ys) - Math.min(...ys) > 4) headerTwoLines.push(i + 1);
}
check('PDF', 'running header fits on one line (long titles shortened)', headerTwoLines.length === 0, headerTwoLines.length ? `${headerTwoLines.length} pages, e.g. ${headerTwoLines.slice(0, 8).join(', ')}` : 'all pages');
// Opener pages carry the chapter label.
const openerWrong = book.chapters.filter((c) => !text[pdfData.chapterStarts[c.number] - 1].includes(c.label)).map((c) => c.number);
check('PDF', 'each chapter opener page shows "অধ্যায় N"', openerWrong.length === 0, openerWrong.join(', '));
// Blank or near-blank pages (body text excluding header and folio).
const bodyChars = pages.map((g) => g.filter((x) => x.y > 70 && x.y < 775).length);
const blank = bodyChars.map((n, i) => (n < 15 ? i + 1 : 0)).filter(Boolean);
check('PDF', 'no blank pages', blank.length === 0, blank.length ? blank.join(', ') : 'every page has body text');
// Clipped text: nothing beyond the right or left margin.
const clipped = [];
// A space glyph at the end of a wrapped line may sit past the margin; it is invisible, so only visible glyphs count.
pages.forEach((g, i) => { if (g.some((x) => (x.spanText ?? x.uni).trim() && (x.x + (x.w ?? 0) > pageW - marginR + 3 || x.x < marginL - 3))) clipped.push(i + 1); });
check('PDF', 'no text outside the margins (no clipped code or tables)', clipped.length === 0, clipped.length ? `${clipped.length} pages, e.g. ${clipped.slice(0, 8).join(', ')}` : '');
// White space: pages whose body ends high (excluding the last page of each part).
const partEnds = new Set([...Object.values(pdfData.chapterStarts), ...Object.values(pdfData.backStarts), pdfData.tocPage].map((p) => p - 1).concat([pages.length]));
// Chapter opener pages end after the learning objectives by design; front-matter pages are short by nature.
const byDesign = new Set(Object.values(pdfData.chapterStarts));
const sparse = [];
pages.forEach((g, i) => {
  if (partEnds.has(i + 1) || byDesign.has(i + 1) || i + 1 < pdfData.tocPage) return;
  const body = g.filter((x) => x.y > 70 && x.y < 775);
  if (!body.length) return;
  const low = Math.min(...body.map((x) => x.y));
  const empty = (low - 70) / (775 - 70);
  if (empty > 0.33) sparse.push({ page: i + 1, empty: Math.round(empty * 100) });
});
check('PDF', 'pages with more than 33% empty space (excluding part endings, chapter openers, front matter)', true, `${sparse.length} pages; worst: ${sparse.sort((a, b) => b.empty - a.empty).slice(0, 6).map((s) => `p${s.page} ${s.empty}%`).join(', ')}`, sparse.length ? 'WARN' : 'PASS');
// Bengali integrity: every Bengali word of each chapter's prose is present in that chapter's pages.
const bnWords = (md) => md.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ').split(/[\s|*_#>()\[\]—–,;:!?।"'“”‘’/.]+/).filter((w) => /^[ঀ-৿‌‍]+$/.test(w));
const parts = manuscript.split(/^<!-- jsm:part /m).slice(1);
let bnTotal = 0, bnFound = 0;
const bnMissing = [];
book.chapters.forEach((c, k) => {
  const md = parts.find((p) => p.startsWith(`kind=chapter id=${c.id} `));
  const from = pdfData.chapterStarts[c.number] - 1, to = (k < 29 ? pdfData.chapterStarts[c.number + 1] : pdfData.backStarts['appendix-a']) - 1;
  const pageText = text.slice(from, to).join(' ').replace(/[‌‍]/g, '');
  for (const w of new Set(bnWords(md))) { bnTotal++; if (pageText.includes(w.replace(/[‌‍]/g, ''))) bnFound++; else bnMissing.push(`${c.number}:${w}`); }
});
check('PDF', 'Bengali text layer intact (distinct Bengali words of each chapter found in its pages)', bnFound / bnTotal > 0.999, `${bnFound} of ${bnTotal}; missing: ${bnMissing.slice(0, 5).join(' ')}`);
check('PDF', 'text is selectable (text layer extracted from every page)', text.every((t) => t.length > 0), `${text.reduce((s, t) => s + t.length, 0)} characters`);

// ===================== DOCX =====================
const DOCX = path.join(FINAL, 'JavaScript_Mastery_Complete.docx');
function unzip(file) {
  const buf = fs.readFileSync(file), out = new Map();
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  let pos = buf.readUInt32LE(eocd + 16);
  for (let i = 0; i < buf.readUInt16LE(eocd + 10); i++) {
    const nl = buf.readUInt16LE(pos + 28), el = buf.readUInt16LE(pos + 30), cl = buf.readUInt16LE(pos + 32), cs = buf.readUInt32LE(pos + 20), lo = buf.readUInt32LE(pos + 42);
    const name = buf.toString('utf8', pos + 46, pos + 46 + nl), lnl = buf.readUInt16LE(lo + 26), lel = buf.readUInt16LE(lo + 28);
    const method = buf.readUInt16LE(lo + 8), d = buf.subarray(lo + 30 + lnl + lel, lo + 30 + lnl + lel + cs);
    out.set(name, method === 8 ? zlib.inflateRawSync(d) : d);
    pos += 46 + nl + el + cl;
  }
  return out;
}
const docx = unzip(DOCX);
const doc = docx.get('word/document.xml').toString('utf8');
check('DOCX', 'package opens (ZIP, document, styles, numbering, settings, headers, footers)', ['word/document.xml', 'word/styles.xml', 'word/numbering.xml', 'word/settings.xml', 'word/footer1.xml'].every((p) => docx.has(p)), `${docx.size} parts`);
const paras = [...doc.matchAll(/<w:p>(?:<w:pPr>(?:<w:pStyle w:val="(\w+)"\/>)?[\s\S]*?<\/w:pPr>)?([\s\S]*?)<\/w:p>/g)].map((m) => ({ style: m[1] ?? 'Normal', text: [...m[2].matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((t) => t[1]).join('') }));
const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const heading1 = paras.filter((p) => p.style === 'Heading1').map((p) => unesc(p.text));
const chapterH1 = heading1.filter((t) => /^অধ্যায় [০-৯]+ — /.test(t));
check('DOCX', 'exactly 30 chapter headings (Heading 1 "অধ্যায় N — Title"), in order', chapterH1.length === 30 && chapterH1.every((t, k) => fromBn(/^অধ্যায় ([০-৯]+)/.exec(t)[1]) === k + 1), `${heading1.length} Heading 1 in total`);
const titleMismatch = book.chapters.filter((c, k) => chapterH1[k]?.replace(/\s+/g, '') !== `${c.label} — ${c.title}`.replace(/[`*]/g, '').replace(/\s+/g, ''));
check('DOCX', 'chapter titles match the registry', titleMismatch.length === 0, titleMismatch.map((c) => c.number).join(', '));
const heading2 = paras.filter((p) => ['Heading2', 'PanelHeading'].includes(p.style)).length;
check('DOCX', 'every H2 section heading present as a Word heading', heading2 === (manuscript.match(/^## /gm) ?? []).length, `${heading2} headings`);
check('DOCX', 'refreshable table of contents (TOC field, update on open)', /<w:instrText[^>]*> TOC \\o "1-2" \\h \\z \\u <\/w:instrText>/.test(doc) && /<w:updateFields w:val="true"\/>/.test(docx.get('word/settings.xml').toString()), 'TOC \\o "1-2" \\h \\z \\u');
const sects = (doc.match(/<w:sectPr>/g) ?? []).length;
check('DOCX', 'one section per part, each with its own running header', sects === 43 && [...docx.keys()].filter((k) => /^word\/header\d+\.xml$/.test(k)).length >= 36, `${sects} sections, ${[...docx.keys()].filter((k) => /^word\/header\d+\.xml$/.test(k)).length} header parts`);
check('DOCX', 'page numbers: PAGE field in the footer, numbering not restarted', /PAGE/.test(docx.get('word/footer1.xml').toString()) && !/<w:pgNumType[^>]*w:start/.test(doc), 'continuous');
check('DOCX', 'editable semantic styles (Heading 1-3, Code, Table Text, MCQ, Solution)', ['Heading1', 'Heading2', 'Heading3', 'Code', 'TableText', 'McqQuestion', 'SolutionLabel'].every((s) => docx.get('word/styles.xml').toString().includes(`w:styleId="${s}"`)));
const mcq = paras.filter((p) => p.style === 'McqQuestion').length, sol = paras.filter((p) => p.style === 'SolutionLabel').length;
check('DOCX', '300 MCQs and 360 solutions', mcq === 300 && sol === 360, `${mcq} MCQs, ${sol} solutions`);
const docText = paras.map((p) => unesc(p.text)).join(' ').replace(/[‌‍]/g, '');
let dFound = 0, dTotal = 0;
const allBn = new Set(parts.flatMap((p) => bnWords(p.replace(/^[^\n]*\n/, ''))));
for (const w of allBn) { dTotal++; if (docText.includes(w.replace(/[‌‍]/g, ''))) dFound++; }
check('DOCX', 'Bengali text complete (distinct Bengali words of the manuscript found)', dFound / dTotal > 0.999, `${dFound} of ${dTotal}`);
const wordLog = fs.existsSync(path.join(BUILD, 'work', 'word-check.log')) ? fs.readFileSync(path.join(BUILD, 'work', 'word-check.log'), 'utf8') : '';
const wv = (k) => (new RegExp(`^${k}=(.*)$`, 'm').exec(wordLog) ?? [])[1];
check('DOCX', 'opened by Microsoft Word, TOC refreshed, PDF exported', /pdf saved/.test(wordLog) && !/ERROR/.test(wordLog), `Word: ${wv('pages')} pages, ${wv('sections')} sections, TOC ${wv('tocEntries')} paragraphs`);

// ===================== manuscript (cross-chapter) =====================
const chapterMd = book.chapters.map((c) => ({ c, md: parts.find((p) => p.startsWith(`kind=chapter id=${c.id} `)).replace(/^[^\n]*\n/, '') }));
check('Manuscript', '30 chapters present, ordered, numbered 1-30', chapterMd.length === 30 && chapterMd.every(({ md }, k) => fromBn(new RegExp(rules.titlePattern).exec(md.split('\n')[0])?.[1] ?? '0') === k + 1));
const numbering = [];
for (const { c, md } of chapterMd) {
  const nums = [...md.matchAll(/^## ([০-৯]+)\.([০-৯]+) /gm)].map((m) => [fromBn(m[1]), fromBn(m[2])]);
  if (nums.some(([n]) => n !== c.number) || nums.some(([, k], i) => k !== i + 1)) numbering.push(c.number);
}
check('Manuscript', 'section numbers N.k match the chapter and run 1, 2, 3... without gaps or duplicates', numbering.length === 0, numbering.join(', '));
const mcqBad = chapterMd.filter(({ md }) => {
  const sec = md.slice(md.search(/^## \S+ MCQ: /m));
  const qs = sec.slice(0, sec.search(/^## \S+ MCQ-এর উত্তর/m)).split(/^\*\*প্রশ্ন /m).slice(1);
  return qs.length !== 10 || qs.some((q) => (q.match(/^- [কখগঘ]\) /gm) ?? []).length !== 4);
}).map(({ c }) => c.number);
check('Manuscript', 'exactly 10 MCQs per chapter, 4 options each', mcqBad.length === 0, mcqBad.join(', '));
const exBad = chapterMd.filter(({ md }) => {
  const ex = md.slice(md.search(/^## \S+ অনুশীলনী$/m), md.search(/^## \S+ অনুশীলনীর সমাধান$/m));
  const exercises = (ex.match(/^\d+\. /gm) ?? []).length;
  const levels = ['প্রাথমিক স্তর', 'মধ্যম স্তর', 'চ্যালেঞ্জ স্তর'].every((l) => ex.includes(`### ${l}`));
  const sols = new Set([...md.matchAll(/^\*\*সমাধান ([০-৯]+)\*\*/gm)].map((m) => fromBn(m[1])));
  return !levels || exercises !== sols.size || [...Array(exercises).keys()].some((i) => !sols.has(i + 1));
}).map(({ c }) => c.number);
check('Manuscript', 'exercises in three levels, every exercise has a numbered solution', exBad.length === 0, exBad.join(', '));
const required = ['শেখার লক্ষ্য', 'পূর্বশর্ত', 'সাধারণ ভুল', 'অনুশীলনী', 'অনুশীলনীর সমাধান', 'অধ্যায়ের সারসংক্ষেপ', 'গুরুত্বপূর্ণ পরিভাষা', 'আরও পড়ুন'];
const reqBad = chapterMd.filter(({ md }) => required.some((r) => !new RegExp(`^## (\\S+ )?${r}$`, 'm').test(md))).map(({ c }) => c.number);
check('Manuscript', 'required sections in every chapter (objectives ... further reading)', reqBad.length === 0, reqBad.join(', '));
const prose = (md) => md.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');
// Informal forms are allowed inside quotation marks (chapter-rules: informalAllowedWhenQuoted).
const unquoted = (t) => t.replace(/"[^"\n]*"/g, ' ').replace(/“[^”\n]*”/g, ' ');
const informal = [];
for (const { c, md } of chapterMd) {
  for (const w of [...rules.informalAddress, ...rules.informalVerbEndings]) {
    const hits = [...unquoted(prose(md)).matchAll(new RegExp(`(^|[\\s(—"“])${w}(?=[\\s।,;:!?)"”]|$)`, 'gm'))];
    if (hits.length) informal.push(`${c.number}:${w}×${hits.length}`);
  }
}
check('Manuscript', 'formal address (no তুমি/তোমার or informal imperatives in prose)', informal.length === 0, informal.slice(0, 8).join(', '));
const glyphs = chapterMd.filter(({ md }) => /→|[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(prose(md))).map(({ c }) => c.number);
check('Manuscript', 'no arrow glyph or emoji in prose', glyphs.length === 0, glyphs.join(', '));
const placeholders = rules.placeholderTerms.filter((t) => new RegExp(`\\b${t}\\b`).test(prose(manuscript)));
check('Manuscript', 'no internal placeholder words (DRAFT, TODO, TBD, RECONSTRUCTED ...)', placeholders.length === 0, placeholders.join(', '));
const v30 = (prose(manuscript).match(/\bv30\b/g) ?? []).length;
check('Manuscript', 'no internal manuscript-version labels ("v30") in reader text', v30 === 0, `${v30} left`);
// Cross-references: "অধ্যায় N" within 1-30, "অনুচ্ছেদ N.k" pointing at an existing section.
const sectionsByChapter = new Map(chapterMd.map(({ c, md }) => [c.number, new Set([...md.matchAll(/^## ([০-৯]+\.[০-৯]+) /gm)].map((m) => m[1]))]));
const badRefs = [];
let refCount = 0;
for (const { c, md } of chapterMd) {
  for (const m of prose(md).matchAll(/অধ্যায় ([০-৯]+)/g)) { refCount++; const n = fromBn(m[1]); if (n < 1 || n > 30) badRefs.push(`${c.number}→অধ্যায় ${m[1]}`); }
  for (const m of prose(md).matchAll(/অনুচ্ছেদ ([০-৯]+)\.([০-৯]+)/g)) {
    refCount++;
    const n = fromBn(m[1]);
    if (!sectionsByChapter.get(n)?.has(`${m[1]}.${m[2]}`)) badRefs.push(`${c.number}: অনুচ্ছেদ ${m[1]}.${m[2]}`);
  }
}
check('Manuscript', 'cross-references point at existing chapters and sections', badRefs.length === 0, `${refCount} references checked${badRefs.length ? `; broken: ${badRefs.slice(0, 6).join(', ')}` : ''}`);
// Listing labels: rendered captions (part vs excerpt).
const html = fs.readFileSync(path.join(BUILD, 'work', 'book.html'), 'utf8');
const excerptCaptions = (html.match(/<span class="excerpt">নির্বাচিত অংশ \(Selected Excerpt/g) ?? []).length, partCaptions = (html.match(/\(Part \d+ of \d+\)/g) ?? []).length;
const excerptListings = [...manuscript.matchAll(/^```\w+ [^\n]*excerpt=[^\n]*$/gm)].filter((m) => !/ part=/.test(m[0])).length;
check('Manuscript', 'listing labels: "Part N of M" for split files, "Selected Excerpt" only for real excerpts', excerptCaptions === excerptListings, `${partCaptions} part captions, ${excerptCaptions} excerpt captions = ${excerptListings} excerpt listings without part=`);
const readingBad = book.chapters.filter((c) => c.readingItems < 3).map((c) => c.number);
check('Manuscript', 'further reading in every chapter (3 or more entries)', readingBad.length === 0, `${book.counts.references} distinct addresses in appendix D`);
// Repetition: identical long paragraphs in two different chapters.
const paraSeen = new Map(), repeats = [];
for (const { c, md } of chapterMd) {
  for (const p of prose(md).split(/\n\s*\n/).map((s) => s.trim()).filter((s) => s.length > 160 && !/^[|#>-]/.test(s))) {
    if (paraSeen.has(p) && paraSeen.get(p) !== c.number) repeats.push(`${paraSeen.get(p)}/${c.number}`);
    else paraSeen.set(p, c.number);
  }
}
check('Manuscript', 'no long paragraph repeated verbatim across chapters', repeats.length === 0, repeats.join(', '));
const dupTerms = (() => { const m = new Map(); for (const { c, md } of chapterMd) for (const row of md.slice(md.search(/^## \S+ গুরুত্বপূর্ণ পরিভাষা$/m)).split('\n').filter((l) => /^\| [^-]/.test(l)).slice(1)) { const t = row.split('|')[1].trim().toLowerCase(); m.set(t, [...(m.get(t) ?? []), c.number]); } return [...m].filter(([, v]) => v.length > 1); })();
check('Manuscript', 'terminology: terms defined in more than one chapter (consistency review)', true, `${dupTerms.length} terms appear in 2+ chapter glossaries; merged in appendix A with all chapter numbers`, 'INFO');

const summary = { PASS: 0, FAIL: 0, WARN: 0, INFO: 0 };
for (const r of results) summary[r.status]++;
fs.writeFileSync(path.join(BUILD, 'work', 'qa-data.json'), JSON.stringify({ summary, results, sparsePages: sparse, pages: pages.length, links, internalLinks, bookmarks: outline.items.length }, null, 2) + '\n');
console.log(`\n${summary.PASS} PASS, ${summary.FAIL} FAIL, ${summary.WARN} WARN, ${summary.INFO} INFO`);
process.exit(summary.FAIL ? 1 : 0);
