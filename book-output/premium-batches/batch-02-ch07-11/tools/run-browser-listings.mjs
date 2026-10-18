// Runs every listing marked run=browser or run=both in real headless Chrome and compares the browser console
// with the Output / Error panel printed after it. Run tools/extract-and-run.mjs first (it writes the files).
//
//   ```javascript run=browser file=app.js path=examples/03-x/app.js page=examples/03-x/index.html click=#add
//     page=   the HTML page to open (otherwise a blank page whose <body> loads just this script)
//     click=  comma-separated selectors clicked after load, in order
//     wait=   milliseconds to wait for timers before reading the console (default 300)
//     steps=  comma-separated actions after load and clicks: click:<selector>, type:<selector>:<text>, key:<Enter|Escape>
//             (~ in <text> stands for a space, %XX escapes are decoded; type replaces the field's current value)
//
// Usage: node tools/run-browser-listings.mjs <chapter-dir>
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { openBrowser } from './cdp.mjs';

const dir = path.resolve(process.argv[2]);
const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'chapter.json'), 'utf8'));
const md = fs.readFileSync(path.join(dir, cfg.source), 'utf8').replace(/\r\n/g, '\n');
const info = s => Object.fromEntries([...s.matchAll(/(\w+)=(\S+)/g)].map(a => [a[1], a[2]]));
const blocks = [...md.matchAll(/^```([\w-]+)([^\n]*)\n([\s\S]*?)\n```/gm)].map(m => ({ info: info(m[2]), code: m[3], index: m.index, raw: m[0], line: md.slice(0, m.index).split('\n').length }));
const work = path.join(dir, '.build', 'browser-pages');
fs.mkdirSync(work, { recursive: true });

const page = await openBrowser();
const log = [`Browser: ${page.version}`, ''];
let ran = 0, compared = 0, problems = 0;
try {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.info.kind || !['browser', 'both'].includes(b.info.run) || b.info.norun || !b.info.path || !/\.js$/.test(b.info.path)) continue;
    let url;
    if (b.info.page) url = pathToFileURL(path.join(dir, b.info.page)).href;
    else {
      const html = path.join(work, b.info.path.replace(/[\\/]/g, '__') + '.html');
      fs.writeFileSync(html, `<!doctype html><html lang="bn"><meta charset="utf-8"><title>${b.info.path}</title><body><script src="${pathToFileURL(path.join(dir, b.info.path)).href}"></script></body></html>`);
      url = pathToFileURL(html).href;
    }
    await page.open(url);
    for (const sel of (b.info.click ?? '').split(',').filter(Boolean)) { await page.click(sel); await page.sleep(60); }
    for (const step of (b.info.steps ?? '').split(',').filter(Boolean)) {
      const [act, sel, ...rest] = step.split(':');
      if (act === 'click') await page.click(sel);
      else if (act === 'type') { await page.eval(`document.querySelector(${JSON.stringify(sel)}).value = ''`); await page.type(sel, decodeURIComponent(rest.join(':').replaceAll('~', ' '))); }
      else if (act === 'key') { const k = { Enter: ['Enter', 'Enter', 13, String.fromCharCode(13)], Escape: ['Escape', 'Escape', 27] }[sel]; await page.key(...k); }
      else throw new Error(`Unknown step ${step}`);
      await page.sleep(60);
    }
    await page.sleep(+(b.info.wait ?? 300));
    ran++;
    const out = page.logs.join('\n'), errs = page.errors;
    log.push(`===== ${b.info.path}${b.info.page ? ` (page ${b.info.page})` : ''}${b.info.click ? ` click ${b.info.click}` : ''}${b.info.steps ? ` steps ${b.info.steps}` : ''} =====`, out, ...errs, '');
    const next = blocks[i + 1], gap = next ? md.slice(b.index + b.raw.length, next.index).trim() : null;
    // The panel follows directly, or after one lead-in line that ends with a colon (e.g. 'দুবার চাপলে:').
    const panel = next && (gap === '' || (!gap.includes('\n') && gap.endsWith(':'))) ? next : null;
    if (panel?.info.kind === 'output') {
      compared++;
      if (panel.code.trimEnd() !== out) { problems++; console.log(`FAIL  ${b.info.path} (line ${b.line}): browser console differs from the Output panel\n--- printed ---\n${panel.code}\n--- browser ---\n${out}\n`); }
      if (errs.length) { problems++; console.log(`FAIL  ${b.info.path}: unexpected browser error: ${errs.join(' | ')}`); }
    } else if (panel?.info.kind === 'error') {
      compared++;
      const all = [out, ...errs].join('\n'), miss = panel.code.split('\n').map(l => l.trim()).filter(Boolean).filter(l => !all.includes(l));
      if (miss.length) { problems++; console.log(`FAIL  ${b.info.path} (line ${b.line}): error lines not seen in the browser: ${miss.join(' | ')}\n--- browser ---\n${all}`); }
    } else if (errs.length && !b.info.path.includes('/errors/')) { problems++; console.log(`FAIL  ${b.info.path}: browser error: ${errs.join(' | ')}`); }
  }
} finally { await page.close(); }
fs.mkdirSync(path.join(dir, 'qa-logs'), { recursive: true });
fs.writeFileSync(path.join(dir, 'qa-logs', 'browser-listings.log'), log.join('\n'));
console.log(`${ran} listings run in ${page.version}, ${compared} compared with a printed panel, ${problems} problem(s)`);
process.exit(problems ? 1 : 0);
