// Markdown → HTML for the book's manuscript dialect (see docs/CHAPTER_LAYOUT_TEMPLATE.md):
// ATX headings, fenced code with an info string, GFM tables, callout blockquotes, flat lists,
// one-line figures, paragraphs, inline code, bold and emphasis.
// The same HTML feeds the PDF (Chrome) and the DOCX (make-docx.mjs).
import { tokens, rules } from './tokens.mjs';

export const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- inline ----------
export function inline(text) {
  const codes = [];
  // `` code containing ` backticks `` first, then ordinary `code`
  let s = text.replace(/``\s?(.+?)\s?``/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = esc(s);
  s = s.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?![*\w])/g, '$1<em>$2</em>');
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[i])}</code>`);
  return s;
}
/** Visible length of a Markdown fragment (used to size table columns). */
const visibleLength = s => [...s.replace(/[`*]/g, '')].length;

// ---------- syntax highlighting ----------
const JS_KW = new Set(('const let var function return if else for while do switch case break continue new class extends super this import export from default async await try catch finally throw typeof instanceof in of null undefined true false static get set yield delete void ' +
  'type interface readonly as keyof never unknown any number string boolean implements private public protected enum declare').split(' '));
const SQL_KW = /\b(SELECT|FROM|WHERE|JOIN|ON|ORDER|BY|LIMIT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|PRIMARY|KEY|REFERENCES|NOT|NULL|UNIQUE|CHECK|DEFAULT|BEGIN|COMMIT|ROLLBACK|RETURNING|AND|OR|IN|BETWEEN|DESC|ASC|AS)\b/g;
function hlJs(code) {
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|(\b\d[\d_]*(?:\.\d+)?n?\b)|([A-Za-z_$][\w$]*)/g;
  let out = '', last = 0, m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    const [t, com, str, num, id] = m;
    if (com) out += `<span class="c">${esc(t)}</span>`;
    else if (str) out += `<span class="s">${esc(t)}</span>`;
    else if (num) out += `<span class="n">${esc(t)}</span>`;
    else if (JS_KW.has(id)) out += `<span class="k">${esc(t)}</span>`;
    else out += esc(t);
    last = re.lastIndex;
  }
  return out + esc(code.slice(last));
}
const hlHash = code => code.split('\n').map(l => { const m = /^(\s*)(#.*)$/.exec(l); if (m) return esc(m[1]) + `<span class="c">${esc(m[2])}</span>`; const i = l.indexOf(' # '); return i >= 0 ? esc(l.slice(0, i + 1)) + `<span class="c">${esc(l.slice(i + 1))}</span>` : esc(l); }).join('\n');
const hlSql = code => code.split('\n').map(l => { const i = l.indexOf('--'); const body = i >= 0 ? l.slice(0, i) : l, com = i >= 0 ? l.slice(i) : ''; return esc(body).replace(SQL_KW, '<span class="k">$1</span>') + (com ? `<span class="c">${esc(com)}</span>` : ''); }).join('\n');
const hlMarkup = code => esc(code).replace(/(&lt;\/?)([a-zA-Z][\w-]*)/g, '$1<span class="k">$2</span>').replace(/(&quot;[^&]*?&quot;)/g, '<span class="s">$1</span>');
const hlCss = code => esc(code).replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="c">$1</span>').replace(/(^|\n)(\s*)([a-z-]+)(:)(?=\s)/g, '$1$2<span class="k">$3</span>$4');
export function highlight(code, lang) {
  if (['js', 'javascript', 'ts', 'typescript', 'json', 'mjs'].includes(lang)) return hlJs(code);
  if (['bash', 'yaml', 'dockerfile', 'sh'].includes(lang)) return hlHash(code);
  if (lang === 'sql') return hlSql(code);
  if (lang === 'html') return hlMarkup(code);
  if (lang === 'css') return hlCss(code);
  return esc(code);
}
// Highlight spans may cross line ends (block comments, template literals): close and reopen them per line.
function splitLines(html) {
  let open = '';
  return html.split('\n').map(l => {
    let s = open + l;
    const opens = [...s.matchAll(/<span class="\w">/g)], closes = (s.match(/<\/span>/g) ?? []).length;
    if (opens.length > closes) { open = opens[opens.length - 1][0]; s += '</span>'; } else open = '';
    return s;
  });
}

const LANG_LABEL = { js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', typescript: 'TypeScript', bash: 'Terminal', html: 'HTML', css: 'CSS', json: 'JSON', sql: 'SQL', yaml: 'YAML', dockerfile: 'Dockerfile', http: 'HTTP', text: 'Text' };
const KIND_LABEL = { output: 'Output', error: 'Error Message', terminal: 'Terminal', structure: 'Folder-এর কাঠামো' };
const RUN_LABEL = { node: 'চলবে: Node.js', browser: 'চলবে: Browser', both: 'চলবে: Browser Console ও Node.js' };
export const EXCERPT_LABEL = 'নির্বাচিত অংশ (Selected Excerpt — Complete file available in Companion Code)';
// Batch 02 change: consecutive listings that together form one complete file are labelled as parts, not excerpts.
const BN = n => String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
const partLabel = p => { const [n, m] = p.split('/'); return `অংশ ${BN(n)} / ${BN(m)} (Part ${n} of ${m})`; };
export const FRAGMENT_LABEL = 'যোগ করার অংশ (Fragment)';

/** Parses a fence info string: ```javascript run=node file=hello.js   |   ```css run=browser file=style.css excerpt=project/app/style.css */
export function fenceInfo(rest) { return Object.fromEntries([...rest.matchAll(/(\w+)=(\S+)/g)].map(a => [a[1], a[2]])); }

// ---------- blocks ----------
const isTableSep = l => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);
function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const cells = []; let cur = '', inCode = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '\\' && s[i + 1] === '|') { cur += '|'; i++; continue; }
    if (ch === '`') inCode = !inCode;
    if (ch === '|' && !inCode) { cells.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}
/** Column widths in percent from the longest cell of each column (damped, with a floor), so both outputs agree. */
export function columnWidths(rows) {
  const n = Math.max(...rows.map(r => r.length));
  const weight = Array.from({ length: n }, (_, k) => Math.max(...rows.map(r => Math.min(visibleLength(r[k] ?? ''), 70))) ** 0.62);
  const sum = weight.reduce((a, b) => a + b, 0);
  let pct = weight.map(w => Math.max(100 * w / sum, n >= 3 ? 9 : 22));
  const total = pct.reduce((a, b) => a + b, 0);
  pct = pct.map(p => +(100 * p / total).toFixed(1));
  pct[n - 1] = +(100 - pct.slice(0, -1).reduce((a, b) => a + b, 0)).toFixed(1);
  return pct;
}
const LIST_RE = /^([-*]|\d+\.)\s+(.*)$/;

export function blocks(md, opts = {}) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  const isBlockStart = l => /^```/.test(l) || /^#{1,6} /.test(l) || /^>/.test(l) || /^!\[/.test(l) || /^(-{3,}|\*{3,})\s*$/.test(l) || LIST_RE.test(l) || /^\s*\|/.test(l);
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m;
    if ((m = /^```\s*([\w-]*)\s*(.*)$/.exec(line))) {
      const lang = m[1].toLowerCase(), info = fenceInfo(m[2]), body = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++]);
      i++;
      const kind = info.kind ?? 'source';
      const parts = [];
      if (info.file) parts.push(`<span class="file">${esc(info.file)}</span>`);
      parts.push(`<span class="lang">${esc(KIND_LABEL[kind] ?? LANG_LABEL[lang] ?? lang)}</span>`);
      if (info.part) parts.push(`<span class="excerpt">${partLabel(info.part)}</span>`);
      else if (info.excerpt) parts.push(`<span class="excerpt">${EXCERPT_LABEL}</span>`);
      if (info.fragment) parts.push(`<span class="excerpt">${FRAGMENT_LABEL}</span>`);
      if (info.run) parts.push(`<span class="run">${esc(RUN_LABEL[info.run] ?? info.run)}</span>`);
      const c = tokens.code;
      const html = splitLines(kind === 'source' ? highlight(body.join('\n'), lang) : esc(body.join('\n')));
      // Lines stay in normal flow, separated by real newlines: that is what keeps their leading spaces in the
      // PDF, so indentation survives copy and paste. Only a line long enough to wrap becomes a block with a
      // hanging indent, so its continuation is visibly a continuation. (Such a line loses its leading spaces
      // on copy; check-manuscript reports every one, and the rule is to keep source lines short enough.)
      const willWrap = raw => { const len = [...raw].length; return len > c.hangFromChars || (/[ঀ-৿]/.test(raw) && len > c.hangFromChars - 12); };
      const ln = html.map((h, k) => {
        const raw = body[k];
        if (!willWrap(raw)) return `<span class="ln">${h}</span>` + (k < html.length - 1 && !willWrap(body[k + 1]) ? '\n' : (k < html.length - 1 ? '\n' : ''));
        const hang = raw.length - raw.trimStart().length + c.hangingIndentChars;
        return `<span class="ln wrap" data-hang="${hang}" style="padding-left:${hang}ch;text-indent:-${hang}ch">${h}</span>`;
      }).join('');
      opts.wrappedLines = (opts.wrappedLines ?? 0) + body.filter(willWrap).length;
      const cls = `code ${kind}${(info.excerpt && !info.part) || info.fragment ? ' excerpt' : ''}${body.length <= c.keepTogetherLines ? ' keep' : ''}`;
      (opts.codeBlocks ??= []).push({ lang, kind, run: info.run ?? null, file: info.file ?? null, excerpt: info.excerpt ?? null, fragment: info.fragment ?? null, lines: body.length, longest: Math.max(0, ...body.map(l => [...l].length)) });
      out.push(`<figure class="${cls}"><figcaption>${parts.join('')}</figcaption><pre><code>${ln}</code></pre></figure>`);
      continue;
    }
    if ((m = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/.exec(line))) {
      out.push(`<figure class="image"><img src="${esc(m[2])}" alt="${esc(m[1])}"><figcaption>${inline(m[1])}</figcaption></figure>`);
      i++; continue;
    }
    if ((m = /^(#{1,6}) (.*)$/.exec(line))) { const lvl = m[1].length; out.push(`<h${lvl}>${inline(m[2].trim())}</h${lvl}>`); i++; continue; }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
    if (/^>/.test(line)) {
      const body = [];
      while (i < lines.length && /^>/.test(lines[i])) body.push(lines[i++].replace(/^> ?/, ''));
      // A blockquote that opens with a bold label is a callout: > **নোট:** ...
      const label = /^\*\*([^*:]+):\*\*/.exec(body[0] ?? '');
      const type = label ? rules.calloutLabels[label[1].trim()] : null;
      if (!type) throw new Error(`Blockquote must start with a known callout label (${Object.keys(rules.calloutLabels).join(', ')}): ${(body[0] ?? '').slice(0, 50)}`);
      out.push(`<blockquote class="${type}">${blocks(body.join('\n'), opts)}</blockquote>`); continue;
    }
    if (/^\s*\|/.test(line) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const head = splitRow(line);
      i += 2; const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(splitRow(lines[i++]));
      const widths = columnWidths([head, ...rows]);
      const cols = widths.map(w => `<col style="width:${w}%">`).join('');
      out.push(`<table><colgroup>${cols}</colgroup><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
      continue;
    }
    if (LIST_RE.test(line)) {
      const ordered = /^\d+\./.test(line);
      const start = ordered ? parseInt(line, 10) : 1;
      const items = [];
      while (i < lines.length && LIST_RE.test(lines[i]) && /^\d+\./.test(lines[i]) === ordered) {
        let text = LIST_RE.exec(lines[i])[2]; i++;
        while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) text += ' ' + lines[i++].trim();
        items.push(text);
      }
      const li = items.map(t => `<li>${inline(t)}</li>`).join('');
      out.push(ordered ? `<ol${start !== 1 ? ` start="${start}"` : ''}>${li}</ol>` : `<ul>${li}</ul>`);
      continue;
    }
    const para = [line.trim()]; i++;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) para.push(lines[i++].trim());
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return out.join('\n');
}
