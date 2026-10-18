// Checks the colour tokens for legibility: WCAG contrast of every text/background pair the design uses,
// and whether elements that differ by colour still differ when printed in grayscale.
// Usage: node scripts/check-tokens.mjs      exit code 1 if a required ratio is not met
import { tokens } from './lib/tokens.mjs';

const C = tokens.color;
const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = hex => { const n = parseInt(hex.slice(1), 16); return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const gray = hex => Math.round(100 * (1 - lum(hex)));   // 0 = white, 100 = black, as a printed gray percentage (approx.)
let fails = 0;
const row = (what, fg, bg, min) => { const r = ratio(fg, bg), ok = r >= min; if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1 (min ${min})  ${what}  ${fg} on ${bg}`); };

console.log('Text contrast (WCAG 2: 4.5 for body-size text, 3 for large or bold headings)\n');
const W = '#FFFFFF';
row('body text', C.ink, W, 7);
row('bold text', C.strong, W, 7);
row('muted text: captions, page number', C.muted, W, 4.5);
row('running header', C.running, W, 4.5);
row('H1 / H2 headings', C.navy, W, 4.5);
row('H3 headings and emphasis', C.blue, W, 4.5);
row('chapter label, list markers', C.cyanDark, W, 4.5);
row('code text', C.codeInk, C.codeBg, 7);
row('code caption', C.captionInk, C.captionBg, 4.5);
row('inline code', C.inlineCodeInk, C.inlineCodeBg, 4.5);
row('syntax: keyword', C.synKeyword, C.codeBg, 4.5);
row('syntax: string', C.synString, C.codeBg, 4.5);
row('syntax: comment', C.synComment, C.codeBg, 4.5);
row('syntax: number', C.synNumber, C.codeBg, 4.5);
row('error caption', C.errorInk, C.errorCaptionBg, 4.5);
row('error panel text', C.codeInk, C.errorBg, 7);
row('table header', C.navy, C.tableHeadBg, 4.5);
row('table body', C.ink, C.tableZebra, 7);
row('note callout text', C.ink, C.noteBg, 7);
row('note label', C.cyanDark, C.noteBg, 4.5);
row('warning callout text', C.ink, C.warnBg, 7);
row('warning label', C.warnInk, C.warnBg, 4.5);
row('tip callout text', C.ink, C.tipBg, 7);
row('tip label', C.tipInk, C.tipBg, 4.5);
row('remember label', C.navy, C.rememberBg, 4.5);
row('panel text', C.ink, C.panelBg, 7);

console.log('\nGrayscale print (approximate printed gray; 0% = white, 100% = black)\n');
const g = (name, hex) => console.log(`   ${String(gray(hex)).padStart(3)}%  ${name}`);
g('body text', C.ink); g('headings (navy)', C.navy); g('H3 / emphasis (blue)', C.blue); g('cyan rule and markers', C.cyan);
g('code panel background', C.codeBg); g('code caption background', C.captionBg); g('table header background', C.tableHeadBg);
g('note background', C.noteBg); g('warning background', C.warnBg); g('tip background', C.tipBg); g('remember background', C.rememberBg);
g('syntax keyword', C.synKeyword); g('syntax string', C.synString); g('syntax comment', C.synComment); g('syntax number', C.synNumber);
// Every tinted background must stay light enough that black text on it prints clearly.
const tints = ['codeBg', 'captionBg', 'tableHeadBg', 'noteBg', 'warnBg', 'tipBg', 'rememberBg', 'panelBg', 'errorBg', 'outputBg', 'terminalBg'];
const dark = tints.filter(k => gray(C[k]) > 20);
if (dark.length) { fails++; console.log(`\nFAIL  backgrounds darker than 20% gray: ${dark.join(', ')}`); } else console.log('\nPASS  every tinted background prints lighter than 20% gray');
console.log('NOTE  The four callout tints print as nearly the same light gray. They are told apart in grayscale by their bold text label\n      (নোট / সতর্কতা / পরামর্শ / মনে রাখুন) and the warning by its double edge rule — never by colour alone.');
console.log('NOTE  Syntax colours print as similar dark grays; keywords are also bold, so structure stays visible without colour.');
console.log(`\n${fails ? `${fails} FAILED` : 'All colour checks passed'}`);
process.exit(fails ? 1 : 0);
