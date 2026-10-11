// Minimal Markdown → HTML converter covering exactly the subset used by the manuscript:
// ATX headings, fenced code, GFM tables, blockquotes, flat ordered/unordered/task lists,
// horizontal rules, paragraphs (with "two-space" and numbered-line breaks), inline code,
// bold and italic. Fenced code is syntax-highlighted for JS/TS and lightly for others.

export const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
export const toBn = n => String(n).replace(/[0-9]/g, d => BN_DIGITS[d]);

// ---------- inline ----------
export function inline(text) {
  const codes = [];
  // `` code with ` backticks `` first, then ordinary `code`
  let s = text.replace(/``\s?(.+?)\s?``/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = esc(s);
  s = s.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?![*\w])/g, '$1<em>$2</em>');
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[i])}</code>`);
  return s;
}

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
function hlHashComments(code) {
  return code.split('\n').map(l => {
    const m = /^(\s*)(#.*)$/.exec(l);
    if (m) return esc(m[1]) + `<span class="c">${esc(m[2])}</span>`;
    const i = l.indexOf(' # ');
    return i >= 0 ? esc(l.slice(0, i + 1)) + `<span class="c">${esc(l.slice(i + 1))}</span>` : esc(l);
  }).join('\n');
}
function hlSql(code) {
  return code.split('\n').map(l => {
    const i = l.indexOf('--');
    const body = i >= 0 ? l.slice(0, i) : l, com = i >= 0 ? l.slice(i) : '';
    return esc(body).replace(SQL_KW, '<span class="k">$1</span>') + (com ? `<span class="c">${esc(com)}</span>` : '');
  }).join('\n');
}
function hlMarkup(code) {
  return esc(code).replace(/(&lt;\/?)([a-zA-Z][\w-]*)/g, '$1<span class="k">$2</span>').replace(/(&quot;[^&]*?&quot;)/g, '<span class="s">$1</span>');
}
export function highlight(code, lang) {
  if (['js', 'javascript', 'ts', 'json', 'mjs'].includes(lang)) return hlJs(code);
  if (['bash', 'yaml', 'dockerfile', 'sh'].includes(lang)) return hlHashComments(code);
  if (lang === 'sql') return hlSql(code);
  if (lang === 'html') return hlMarkup(code);
  return esc(code);
}
const LANG_LABEL = { js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', bash: 'Terminal', html: 'HTML', css: 'CSS', json: 'JSON', sql: 'SQL', yaml: 'YAML', dockerfile: 'Dockerfile', http: 'HTTP', text: '', mermaid: 'Flowchart (Mermaid)' };

const KIND_LABEL = { output: 'Output', error: 'Error Message', terminal: 'Terminal', structure: 'Folder-এর কাঠামো' };
const RUN_LABEL = { node: 'চলবে: Node.js', browser: 'চলবে: Browser', both: 'চলবে: Browser Console ও Node.js' };
const CALLOUT = { 'নোট': 'note', 'সতর্কতা': 'warn', 'পরামর্শ': 'tip', 'মনে রাখুন': 'remember' };

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
const LIST_RE = /^([-*]|\d+\.)\s+(.*)$/;
const NUM_LINE = /^(\*\*)?(Q\d+|[০-৯]+|[0-9]+)[.)।]/;   // numbered lines that should start on a new line

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
      // Fence info: ```javascript run=node file=hello.js   |   ```text kind=output
      const lang = m[1].toLowerCase(); const body = [];
      const info = Object.fromEntries([...m[2].matchAll(/(\w+)=(\S+)/g)].map(a => [a[1], a[2]]));
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++]);
      i++;
      const code = body.join('\n');
      const kind = info.kind ?? 'source';
      const parts = [];
      if (info.file) parts.push(`<span class="file">${esc(info.file)}</span>`);
      parts.push(`<span class="lang">${esc(KIND_LABEL[kind] ?? LANG_LABEL[lang] ?? lang)}</span>`);
      if (info.run) parts.push(`<span class="run">${esc(RUN_LABEL[info.run] ?? info.run)}</span>`);
      const cls = `code ${kind}${body.length <= 16 ? ' keep' : ''}`;
      (opts.codeBlocks ??= []).push({ lang, kind, run: info.run ?? null, file: info.file ?? null, lines: body.length, longest: Math.max(...body.map(l => l.length)) });
      out.push(`<figure class="${cls}"><figcaption>${parts.join('')}</figcaption><pre><code>${kind === 'source' ? highlight(code, lang) : esc(code)}</code></pre></figure>`);
      continue;
    }
    if ((m = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/.exec(line))) {
      out.push(`<figure class="image"><img src="${esc(m[2])}" alt="${esc(m[1])}"><figcaption>${inline(m[1])}</figcaption></figure>`);
      i++; continue;
    }
    if ((m = /^(#{1,6}) (.*)$/.exec(line))) {
      const lvl = m[1].length; out.push(`<h${lvl}>${inline(m[2].trim())}</h${lvl}>`); i++; continue;
    }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
    if (/^>/.test(line)) {
      const body = [];
      while (i < lines.length && /^>/.test(lines[i])) body.push(lines[i++].replace(/^> ?/, ''));
      // A blockquote that opens with a bold label is a callout: > **নোট:** ...
      const label = /^\*\*([^*:]+):\*\*/.exec(body[0] ?? '');
      const type = label ? (CALLOUT[label[1].trim()] ?? 'note') : 'quote';
      out.push(`<blockquote class="${type}">${blocks(body.join('\n'), opts)}</blockquote>`); continue;
    }
    if (/^\s*\|/.test(line) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const head = splitRow(line);
      const aligns = splitRow(lines[i + 1]).map(c => c.endsWith(':') ? (c.startsWith(':') ? 'center' : 'right') : 'left');
      i += 2; const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(splitRow(lines[i++]));
      const td = (tag, c, k) => `<${tag}${aligns[k] !== 'left' ? ` style="text-align:${aligns[k]}"` : ''}>${inline(c)}</${tag}>`;
      out.push(`<table><thead><tr>${head.map((c, k) => td('th', c, k)).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, k) => td('td', c, k)).join('')}</tr>`).join('')}</tbody></table>`);
      continue;
    }
    if (LIST_RE.test(line)) {
      const ordered = /^\d+\./.test(line);
      const start = ordered ? parseInt(line, 10) : 1;
      const items = [];
      while (i < lines.length && LIST_RE.test(lines[i]) && /^\d+\./.test(lines[i]) === ordered) {
        let text = LIST_RE.exec(lines[i])[2]; i++;
        while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) text += (/ {2}$/.test(text) ? '\n' : ' ') + lines[i++].trim();
        items.push(text);
      }
      const li = items.map(t => {
        const task = /^\[( |x)\]\s+(.*)$/i.exec(t);
        const content = (task ? task[2] : t).split('\n').map(inline).join('<br>');
        return task ? `<li class="task"><span class="box">${task[1].trim() ? '☑' : '☐'}</span> ${content}</li>` : `<li>${content}</li>`;
      }).join('');
      out.push(ordered ? `<ol${start !== 1 ? ` start="${start}"` : ''}>${li}</ol>` : `<ul>${li}</ul>`);
      continue;
    }
    // paragraph
    const para = [line.replace(/\s+$/, m => m.length >= 2 ? '\n' : '')]; i++;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      const l = lines[i++];
      const prev = para[para.length - 1];
      const brk = prev.endsWith('\n') || NUM_LINE.test(l.trim());
      para[para.length - 1] = prev.replace(/\n$/, '');
      para.push((brk ? '\n' : ' ') + l.replace(/\s+$/, m => m.length >= 2 ? '\n' : ''));
    }
    const html = para.join('').replace(/\n$/, '').split('\n').map(inline).join('<br>');
    out.push(`<p>${html}</p>`);
  }
  return out.join('\n');
}
