// Bengali text-integrity audit: compares the words of the Markdown source with the text that three kinds of
// PDF text extractor would recover (see lib/pdf-text.mjs). It separates real rendering faults from
// extraction artifacts and gives a repeatable number for copy/paste quality.
// Usage: node scripts/check-typography.mjs <file.pdf> <source.md> [--json out.json]
import fs from 'node:fs';
import { readPages, extract } from './lib/pdf-text.mjs';

const [pdfFile, mdFile] = process.argv.slice(2);
const jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;
const BN = /[ঀ-৿‌‍]+/g;
const canon = s => s.normalize('NFC').replace(/য়/g, 'য়').replace(/ড়/g, 'ড়').replace(/ঢ়/g, 'ঢ়');
const count = words => { const m = new Map(); for (const w of words) m.set(w, (m.get(w) ?? 0) + 1); return m; };

const md = canon(fs.readFileSync(mdFile, 'utf8'));
const mdWords = (md.match(BN) ?? []).filter(w => w.length > 1);
const mdCount = count(mdWords);
const { pages, fonts } = readPages(pdfFile);
const glyphs = pages.flat();
const bnGlyphs = glyphs.filter(g => /[ঀ-৿]/.test(g.uni + (g.spanText ?? '')));

const result = { pdf: pdfFile, pages: pages.length, glyphs: glyphs.length, bengaliGlyphs: bnGlyphs.length, fonts: fonts.map(f => ({ name: f.name, embedded: f.embedded, subtype: f.subtype })), sourceWords: mdWords.length, distinctSourceWords: mdCount.size, modes: {} };
const texts = {};
for (const mode of ['naive', 'robust', 'actual']) {
  const text = canon(pages.map(p => extract(p, mode)).join('\n'));
  texts[mode] = text;
  const ext = count(text.match(BN) ?? []);
  let intact = 0; const broken = [];
  for (const [w, n] of mdCount) { const got = Math.min(n, ext.get(w) ?? 0); intact += got; if (got < n) broken.push([w, n - got]); }
  broken.sort((a, b) => b[1] - a[1]);
  result.modes[mode] = { intactOccurrences: intact, percent: +(100 * intact / mdWords.length).toFixed(2), distinctWordsAffected: broken.length, worst: broken.slice(0, 12).map(([w, n]) => `${w}×${n}`) };
}

// Probe words reported by an earlier review, and how each extractor returns them.
const probes = ['ভুল', 'নতুন', 'পরিবর্তন', 'নির্দেশনা', 'প্রথম', 'কি', 'ব্যবহারকারী', 'দৃষ্টিপ্রতিবন্ধী', 'শুভেচ্ছা', 'গুরুত্বপূর্ণ'];
result.probes = probes.filter(p => md.includes(p)).map(p => {
  const chars = [...p];
  const row = { word: p, inSource: md.split(p).length - 1 };
  for (const mode of ['naive', 'robust', 'actual']) {
    const whole = texts[mode].split(p).length - 1;
    // the same letters with spaces inserted between them
    const spaced = new RegExp(chars.join('\\s?'), 'g');
    const variants = [...new Set((texts[mode].match(spaced) ?? []).filter(v => v !== p))];
    row[mode] = { intact: whole, splitForms: variants.slice(0, 3) };
  }
  return row;
});
// Where do spurious spaces come from? Count them by the glyph that precedes the break (naive mode).
const cause = new Map();
for (const p of pages) {
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1], b = p[i];
    if (Math.abs(a.y - b.y) > 0.6 * b.size || !/[ঀ-৿]/.test(a.uni) || !/[ঀ-৿]/.test(b.uni)) continue;
    if (b.x - (a.x + a.w) > 0.15 * b.size) { const key = `${a.uni || '?'} (advance ${(a.w / a.size).toFixed(2)} em)`; cause.set(key, (cause.get(key) ?? 0) + 1); }
  }
}
result.naiveSpuriousBreaksAfter = [...cause].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, n]) => `${k}: ${n}`);

console.log(`PDF: ${pdfFile}\nPages: ${result.pages} | glyphs: ${result.glyphs} (${result.bengaliGlyphs} Bengali) | source Bengali words: ${result.sourceWords} (${result.distinctSourceWords} distinct)`);
console.log('Fonts: ' + result.fonts.map(f => `${f.name}${f.embedded ? '' : ' [NOT EMBEDDED]'}`).join(', '));
for (const [mode, r] of Object.entries(result.modes)) console.log(`\n[${mode}] source words recovered intact: ${r.intactOccurrences} of ${result.sourceWords} (${r.percent}%) | distinct words affected: ${r.distinctWordsAffected}\n   most affected: ${r.worst.join(', ') || 'none'}`);
console.log('\nProbe words (occurrences in source -> intact / split forms):');
for (const p of result.probes) console.log(`   ${p.word} ×${p.inSource}:  naive ${p.naive.intact} ${JSON.stringify(p.naive.splitForms)} | robust ${p.robust.intact} ${JSON.stringify(p.robust.splitForms)} | actual ${p.actual.intact} ${JSON.stringify(p.actual.splitForms)}`);
console.log('\nNaive extractor: spurious in-word breaks occur after these glyphs:\n   ' + (result.naiveSpuriousBreaksAfter.join('\n   ') || 'none'));
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(result, null, 2));
