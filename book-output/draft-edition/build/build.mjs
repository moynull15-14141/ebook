// Draft-edition builder: reads the v30 manuscript (read-only), applies the documented
// publication clean-up, and renders PDF via headless Chrome (two passes for TOC page numbers).
// Usage: node build.mjs            (from this folder)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { blocks, inline, esc, toBn } from './md.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '..');
const SRC = path.resolve(HERE, '../../../JavaScript_Mastery_Manuscript_v30/chapters');
const WORK = path.join(HERE, 'work');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BOOK = 'JavaScript Mastery';
const SUBTITLE = 'শূন্য থেকে প্রফেশনাল';
fs.mkdirSync(WORK, { recursive: true });

const log = [];   // every content change, for BUILD_REPORT.md

// ---------- 1. targeted clean-up edits (each must match exactly once) ----------
const EDITS = {
  6: [
    ['এই Chapter-এর সঙ্গে দেওয়া ZIP-এ ', 'বইয়ের Companion Source Code-এর `source-code/chapter-06/` Folder-এ ', 'ZIP reference'],
    [' বইয়ের Final Typesetting-এর সময় এই Source Files থেকে Appendix বা Project Download Reference তৈরি করা হবে।', '', 'internal production note'],
  ],
  7: [
    ['এই Manuscript ZIP-এর `source-code/chapter-07/`', 'বইয়ের Companion Source Code-এর `source-code/chapter-07/`', 'ZIP reference'],
    [' বইয়ের Final Layout-এ Source Code-এর গুরুত্বপূর্ণ অংশ In-Book এবং Full Listing Appendix/Companion Files-এ রাখা যাবে; Source Files বাদ দেওয়া যাবে না।', '', 'internal production note'],
  ],
  8: [['এই Manuscript ZIP-এর `source-code/chapter-08/`-এ', 'বইয়ের Companion Source Code-এর `source-code/chapter-08/`-এ', 'ZIP reference']],
  9: [
    ['এই Manuscript ZIP-এর `source-code/chapter-09/`', 'বইয়ের Companion Source Code-এর `source-code/chapter-09/`', 'ZIP reference'],
    [' বইয়ের চূড়ান্ত Layout-এ এই Source Code-এর গুরুত্বপূর্ণ অংশ Inline এবং সম্পূর্ণ Source Appendix/Download হিসেবে থাকবে।', '', 'internal production note'],
  ],
  10: [
    ['Source Code ZIP-এর `source-code/chapter-10/`', 'Source Code বইয়ের Companion Source Code-এর `source-code/chapter-10/`', 'ZIP reference'],
    [' বইয়ের চূড়ান্ত Typesetting পর্যায়ে এগুলো File-by-File Appendix বা Project Listing-এ অন্তর্ভুক্ত করতে হবে।', '', 'internal production note'],
  ],
  13: [
    ['ZIP-এর `booking.mjs`-এ', 'Companion Source Code-এর `source-code/chapter-13/booking.mjs`-এ', 'ZIP reference'],
    [' Full Source Code-কে বইয়ের Project Appendix-এ অন্তর্ভুক্ত করতে হবে।', '', 'internal production note'],
  ],
  14: [['এটি **এই reconstructed edition-এর নতুন project**; Original Chapter 14-এর project ছিল—এমন দাবি করা হচ্ছে না। ', '', 'internal provenance note']],
  16: [
    ['Runnable Code ZIP-এর `source-code/chapter-16/`', 'Runnable Code বইয়ের Companion Source Code-এর `source-code/chapter-16/`', 'ZIP reference'],
    [' Source Folder-কে Manuscript-এর অবিচ্ছেদ্য অংশ হিসেবে সংরক্ষণ করবে।', '', 'internal production note'],
  ],
  17: [['এই বইয়ের Companion Source Package-এ সংযুক্ত।', 'বইয়ের Companion Source Code-এর `source-code/chapter-17/` Folder-এ সংযুক্ত।', 'obsolete package reference']],
  18: [['একই ZIP-এর `source-code/chapter-18/`', 'Companion Source Code-এর `source-code/chapter-18/`', 'ZIP reference']],
  20: [['ZIP-এর `booking-core.mjs`-এ', 'Companion Source Code-এর `source-code/chapter-20/booking-core.mjs`-এ', 'ZIP reference']],
  21: [
    ['একই ZIP-এর `source-code/chapter-21/`', 'Companion Source Code-এর `source-code/chapter-21/`', 'ZIP reference'],
    ['; eBook-এর Source Appendix-এ এগুলো সংযুক্ত করা হবে।', '।', 'internal production note'],
  ],
  22: [
    ['এই ZIP-এ Playwright', 'Companion Source Code-এ Playwright', 'ZIP reference'],
    ['Source File ZIP-এর `source-code/chapter-22/`', 'Source File Companion Source Code-এর `source-code/chapter-22/`', 'ZIP reference'],
  ],
  25: [['এই বইয়ের ZIP-এ', 'বইয়ের Companion Source Code-এ', 'ZIP reference']],
};

function cleanChapter(n, raw) {
  let md = raw.replace(/\r\n/g, '\n');
  for (const [from0, to0, kind] of EDITS[n] ?? []) {
    // ড় ঢ় য় may be precomposed (U+09DC/09DD/09DF) or base + nukta in the source; match either.
    const canon = s => s.replace(/ড়/g, 'ড়').replace(/ঢ়/g, 'ঢ়').replace(/য়/g, 'য়');
    const pattern = canon(from0).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/ড়/g, '(?:ড়|ড়)').replace(/ঢ়/g, '(?:ঢ়|ঢ়)').replace(/য়/g, '(?:য়|য়)');
    const found = md.match(new RegExp(pattern, 'g')) || [];
    if (found.length !== 1) throw new Error(`Chapter ${n}: expected exactly 1 match for edit (${kind}), found ${found.length}: ${from0.slice(0, 60)}`);
    const from = found[0], to = to0;
    md = md.replace(from, to);
    log.push({ ch: n, kind, from, to });
  }
  const lines = md.split('\n');

  // Heading: "# অধ্যায় ৫ — Title" | "# অধ্যায় ২১: Title" | "# Chapter 19 — Title" | "# অধ্যায় 30 — Title"
  // (\S+ rather than a literal "অধ্যায়": the source mixes precomposed U+09DF and য + nukta)
  const h = /^# (?:\S+\s*[০-৯0-9]+|Chapter\s*\d+)\s*[—:–-]\s*(.+)$/.exec(lines[0]);
  if (!h) throw new Error(`Chapter ${n}: unrecognised H1: ${lines[0]}`);
  const title = h[1].trim();
  if (!/^# [^\sC]\S* [০-৯]+ — /.test(lines[0])) log.push({ ch: n, kind: 'heading standardised', from: lines[0], to: `অধ্যায় ${toBn(n)} — ${title}` });
  lines.shift();
  let subtitle = null;
  if (/^## /.test(lines[0])) { subtitle = lines.shift().slice(3).trim(); }

  // First blockquote before the first section = editorial status banner (+ optional project metadata)
  const meta = [];
  let k = 0;
  while (k < lines.length && !lines[k].trim()) k++;
  if (/^>/.test(lines[k] ?? '')) {
    const start = k;
    while (k < lines.length && /^>/.test(lines[k])) k++;
    for (const l of lines.slice(start, k)) {
      const text = l.replace(/^> ?/, '').replace(/\s+$/, '');
      if (/status|RECONSTRUCTED|শূন্য থেকে প্রফেশনাল/i.test(text)) log.push({ ch: n, kind: 'status banner removed', from: text, to: '' });
      else if (text) meta.push(text);
    }
    lines.splice(start, k - start);
  }
  md = lines.join('\n');

  // Trailing internal editorial notes
  md = md.replace(/\n---\n\n(\*\*Editorial note:\*\*[^\n]*)\n*$/, (m, p) => { log.push({ ch: n, kind: 'editorial note removed', from: p, to: '' }); return '\n'; });
  md = md.replace(/\n(\*\*Editorial (?:note|Notes|Status):\*\*[^\n]*)\n?/g, (m, p) => { log.push({ ch: n, kind: 'editorial note removed', from: p, to: '' }); return '\n'; });

  // Chapter 30 uses Latin section numbers ("30.1"); standardise to Bengali numerals like every other chapter
  md = md.replace(/^(#{2,3}) (\d+)\.(\d+)/gm, (m, hh, a, b) => { log.push({ ch: n, kind: 'section number standardised', from: m, to: `${hh} ${toBn(a)}.${toBn(b)}` }); return `${hh} ${toBn(a)}.${toBn(b)}`; });

  const leftovers = (md.match(/[^\n]*(ZIP|ChatGPT|Reconstructed|RECONSTRUCTED|reconstructed)[^\n]*/g) || []);
  return { n, title, subtitle, meta, md, leftovers };
}

const chapters = [];
for (let n = 1; n <= 30; n++) {
  const file = path.join(SRC, `chapter-${String(n).padStart(2, '0')}.md`);
  chapters.push(cleanChapter(n, fs.readFileSync(file, 'utf8')));
}
const leftovers = chapters.flatMap(c => c.leftovers.map(l => `ch${c.n}: ${l.trim().slice(0, 160)}`));
if (leftovers.length) console.log('Review — remaining internal terms:\n' + leftovers.join('\n'));

// ---------- 2. front matter ----------
const { default: FM } = await import('./frontmatter.mjs');
const chapterHtml = (c, opts = {}) => {
  const body = blocks(c.md, opts);
  const metaHtml = c.meta.map(m => `<p class="meta">${inline(m)}</p>`).join('');
  return opts.word
    ? `<p class="chap-label" style="page-break-before:always">অধ্যায় ${toBn(c.n)}</p><h1>${inline(c.title)}</h1>${c.subtitle ? `<p class="subtitle">${inline(c.subtitle)}</p>` : ''}${metaHtml}\n${body}`
    : `<section class="chapter" id="ch-${c.n}"><header class="opener"><div class="chap-label">অধ্যায় ${toBn(c.n)}</div><h1>${inline(c.title)}</h1>${c.subtitle ? `<p class="subtitle">${inline(c.subtitle)}</p>` : ''}${metaHtml}</header>\n${body}\n</section>`;
};

const cover = `<section class="cover"><div class="cover-inner">
  <div class="badge">JS</div>
  <div class="cover-title">${BOOK}</div>
  <div class="cover-sub">${SUBTITLE}</div>
  <div class="cover-rule"></div>
  <div class="cover-desc">${esc(FM.coverTagline)}</div>
  <div class="cover-edition">${esc(FM.edition)}</div>
  <div class="cover-author"><div class="cover-author-name">${esc(FM.author.name)}</div><div class="cover-author-role">${esc(FM.author.role)}</div></div>
</div></section>`;
const A = FM.author;
const authorRows = [['নাম', A.name], ['পেশা', A.role], ['শিক্ষা', A.education], ['ঠিকানা', A.address], ['ফোন', A.phone]];
const author = `<section class="author" id="author"><h1>লেখক পরিচিতি</h1><table class="author-card"><tbody>${authorRows.map(([k, v]) => `<tr><th>${k}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table></section>`;
const copyright = `<section class="copyright">${FM.copyright.map(p => `<p>${inline(p)}</p>`).join('')}</section>`;
const preface = `<section class="preface" id="preface"><h1>ভূমিকা</h1>${blocks(FM.preface)}</section>`;
function tocHtml(pages) {
  const row = (href, label, title, pg) => `<a class="toc-row" href="#${href}"><span class="toc-label">${label}</span><span class="toc-title">${inline(title)}</span><span class="dots"></span><span class="pg">${pg}</span></a>`;
  return `<section class="toc" id="toc"><h1>সূচিপত্র</h1>
  ${row('preface', '', 'ভূমিকা', pages ? toBn(pages.preface) : '০০০')}
  ${row('author', '', 'লেখক পরিচিতি', pages ? toBn(pages.author) : '০০০')}
  ${chapters.map(c => row(`ch-${c.n}`, `অধ্যায় ${toBn(c.n)}`, c.title, pages ? toBn(pages[c.n]) : '০০০')).join('\n')}
  </section>`;
}

const css = fs.readFileSync(path.join(HERE, 'book.css'), 'utf8');
const page = body => `<!doctype html><html lang="bn"><head><meta charset="utf-8"><title>${BOOK} — ${SUBTITLE} (Draft Edition)</title><style>${css}</style></head><body>${body}</body></html>`;

// ---------- 3. PDF: two-pass render ----------
function chrome(htmlFile, pdfFile) {
  execFileSync(CHROME, ['--headless', '--disable-gpu', '--no-first-run', `--user-data-dir=${path.join(WORK, 'chrome-profile')}`,
    '--no-pdf-header-footer', '--generate-pdf-document-outline', `--print-to-pdf=${pdfFile}`, pathToFileURL(htmlFile).href],
    { stdio: 'pipe', timeout: 180000 });
  if (!fs.existsSync(pdfFile)) throw new Error('Chrome produced no PDF for ' + htmlFile);
}
const pdfPages = file => {
  const s = fs.readFileSync(file, 'latin1');
  const counts = [...s.matchAll(/\/Type\s*\/Pages\b[^]*?\/Count\s+(\d+)/g)].map(m => +m[1]);
  return Math.max(...counts);
};

const frontBody = pagesKnown => cover + copyright + preface + author + tocHtml(pagesKnown);
const segPages = [];
// Pass 1: measure front matter up to the preface, the preface+toc, and every chapter separately.
const measure = (name, body) => {
  const h = path.join(WORK, `${name}.html`), p = path.join(WORK, `${name}.pdf`);
  fs.writeFileSync(h, page(body)); chrome(h, p); return pdfPages(p);
};
const nCoverCopy = measure('seg-cover', cover + copyright);
const nPreface = measure('seg-preface', preface);
const nAuthor = measure('seg-author', author);
const nToc = measure('seg-toc', tocHtml(null));
for (const c of chapters) segPages[c.n] = measure(`seg-ch${String(c.n).padStart(2, '0')}`, chapterHtml(c));
const pages = { preface: nCoverCopy + 1, author: nCoverCopy + nPreface + 1 };
let cursor = nCoverCopy + nPreface + nAuthor + nToc + 1;
for (const c of chapters) { pages[c.n] = cursor; cursor += segPages[c.n]; }
const expectedTotal = cursor - 1;

// Pass 2: full book with real page numbers.
const fullBody = frontBody(pages) + chapters.map(c => chapterHtml(c)).join('\n');
const bookHtml = path.join(WORK, 'book.html');
fs.writeFileSync(bookHtml, page(fullBody));
const pdfOut = path.join(OUT, 'JavaScript_Mastery_Draft_Edition.pdf');
chrome(bookHtml, pdfOut);
const actualTotal = pdfPages(pdfOut);

// ---------- 4. Word-oriented HTML (converted to DOCX by make-docx.ps1) ----------
const wordCss = fs.readFileSync(path.join(HERE, 'word.css'), 'utf8');
const wordBody = `
<p class="w-title">${BOOK}</p><p class="w-sub">${SUBTITLE}</p><p class="w-tag">${esc(FM.coverTagline)}</p><p class="w-ed">${esc(FM.edition)}</p><p class="w-author">${esc(A.name)}</p><p class="w-tag">${esc(A.role)}</p>
<div style="page-break-before:always">${FM.copyright.map(p => `<p class="w-copy">${inline(p)}</p>`).join('')}</div>
<h1 style="page-break-before:always">ভূমিকা</h1>${blocks(FM.preface, { word: true })}
<h1 style="page-break-before:always">লেখক পরিচিতি</h1><table border="1" cellspacing="0" cellpadding="5"><tbody>${authorRows.map(([k, v]) => `<tr><th>${k}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>
<p class="toc-head" style="page-break-before:always">সূচিপত্র</p><p>TOC_PLACEHOLDER</p>
${chapters.map(c => chapterHtml(c, { word: true })).join('\n')}`;
fs.writeFileSync(path.join(WORK, 'book-word.html'), `<!doctype html><html lang="bn"><head><meta charset="utf-8"><title>${BOOK} — Draft Edition</title><style>${wordCss}</style></head><body>${wordBody}</body></html>`);

// ---------- 5. build data for the report ----------
fs.writeFileSync(path.join(WORK, 'build-data.json'), JSON.stringify({
  pages, segPages, nCoverCopy, nPreface, nAuthor, nToc, expectedTotal, actualTotal,
  chapters: chapters.map(c => ({ n: c.n, title: c.title, subtitle: c.subtitle, meta: c.meta, codeBlocks: (c.md.match(/^```/gm) || []).length / 2, tables: (c.md.match(/^\s*\|\s*:?-{2,}/gm) || []).length })),
  log, leftovers,
}, null, 2));
console.log(`PDF written: ${pdfOut}\nPages: expected ${expectedTotal}, actual ${actualTotal}`);
