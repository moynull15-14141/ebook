// Loads the design tokens, book metadata and chapter rules, and resolves a chapter folder.
// Every script in this folder goes through here, so the PDF, the DOCX and the checks share one definition.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SYSTEM = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const json = f => JSON.parse(fs.readFileSync(f, 'utf8'));
export const tokens = json(path.join(SYSTEM, 'config', 'design-tokens.json'));
export const book = json(path.join(SYSTEM, 'config', 'book.json'));
export const rules = json(path.join(SYSTEM, 'config', 'chapter-rules.json'));

export const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
export const toBn = n => String(n).replace(/[0-9]/g, d => BN_DIGITS[d]);
export const fromBn = s => +String(s).replace(/[০-৯]/g, d => BN_DIGITS.indexOf(d));

/** Reads <chapter-dir>/chapter.json and returns absolute paths for everything the scripts need. */
export function loadChapter(dirArg) {
  if (!dirArg) throw new Error('Usage: node <script> <chapter-dir>');
  const dir = path.resolve(dirArg);
  const cfg = json(path.join(dir, 'chapter.json'));
  const work = path.join(dir, '.build');
  fs.mkdirSync(work, { recursive: true });
  fs.mkdirSync(path.join(dir, cfg.logs ?? 'qa-logs'), { recursive: true });
  return { ...cfg, dir, work, logs: path.join(dir, cfg.logs ?? 'qa-logs'), md: path.join(dir, cfg.source), pdf: path.join(dir, cfg.outputBase + '.pdf'), docx: path.join(dir, cfg.outputBase + '.docx'), html: path.join(work, 'chapter.html') };
}

// ---------- fonts: real files only, never a silent fallback ----------
// The design system's own fonts/ folder comes first: open-licensed fonts kept there (with their licence) make the build reproducible.
const vendored = fs.existsSync(path.join(SYSTEM, 'fonts')) ? fs.readdirSync(path.join(SYSTEM, 'fonts'), { withFileTypes: true }).filter(e => e.isDirectory()).map(e => path.join(SYSTEM, 'fonts', e.name)) : [];
const FONT_DIRS = [...vendored, ...(process.env.JSM_FONT_DIRS ?? '').split(path.delimiter).filter(Boolean), path.join(process.env.LOCALAPPDATA ?? '', 'Microsoft/Windows/Fonts'), 'C:/Windows/Fonts', path.join(os.homedir(), 'Library/Fonts'), '/Library/Fonts', '/usr/share/fonts/truetype', '/usr/share/fonts', path.join(os.homedir(), '.fonts'), path.join(os.homedir(), '.local/share/fonts')];
export function findFont(file) {
  const hit = FONT_DIRS.map(d => path.join(d, file)).find(p => fs.existsSync(p));
  if (!hit) throw new Error(`Required font file not found: ${file}. Install the family named in config/design-tokens.json (see docs/FONT_AND_LICENSE_AUDIT.md).`);
  return hit;
}
export function fontFaceCss() {
  const face = (alias, f) => Object.entries(f.files).map(([w, file]) => `@font-face { font-family: "${alias}"; font-weight: ${w}; src: url("${pathToFileURL(findFont(file)).href}"); }`).join('\n');
  return face('Book', tokens.fonts.body) + '\n' + face('Mono', tokens.fonts.mono);
}

/** Fills {{path.to.token}} placeholders in a template; an unknown token is an error, not an empty string. */
export function fill(template, extra = {}) {
  const scope = { ...tokens, ...extra };
  return template.replace(/\{\{([\w.]+)\}\}/g, (_, key) => {
    const v = key.split('.').reduce((o, k) => o?.[k], scope);
    if (v === undefined || typeof v === 'object') throw new Error(`Unknown design token in template: {{${key}}}`);
    return v;
  });
}

export function findChrome() {
  const p = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean).find(f => fs.existsSync(f));
  if (!p) throw new Error('Chrome or Edge not found; set CHROME_PATH.');
  return p;
}

/** Usable text width of the page and of a code panel, in points, and how many monospace characters fit. */
export function measures() {
  const mm = v => v * 72 / 25.4, p = tokens.page;
  const textWidthPt = mm(p.widthMm - p.marginMm.left - p.marginMm.right);
  const codeWidthPt = textWidthPt - mm(3.3 * 2) - 1.2;   // panel padding and borders, as in templates/book.css
  return { textWidthPt, codeWidthPt, codeCharsPerLine: Math.floor(codeWidthPt / (tokens.type.codePt * tokens.fonts.mono.advanceEm)), mm };
}
