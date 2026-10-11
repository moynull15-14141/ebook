// Prints the text of a PDF as an extractor would return it.
// Usage: node scripts/pdf-to-text.mjs <file.pdf> [--mode actual|robust|naive] [--page N]
// "actual" (default) honours /ActualText, as Acrobat-class readers and Chrome's viewer do.
import { readPages, extract } from './lib/pdf-text.mjs';

const args = process.argv.slice(2);
const opt = k => args.includes(k) ? args[args.indexOf(k) + 1] : null;
const { pages } = readPages(args[0]);
const mode = opt('--mode') ?? 'actual', only = opt('--page');
pages.forEach((p, i) => { if (only && +only !== i + 1) return; console.log(`\n===== page ${i + 1} =====\n${extract(p, mode)}`); });
