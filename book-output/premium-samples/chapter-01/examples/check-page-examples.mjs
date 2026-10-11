// অধ্যায়ের দুটি Web Page উদাহরণ আসল Browser-এ (Headless) খুলে দেখে:
//   first-page/     — defer আছে: Button Click করলে লেখা বদলানোর কথা
//   without-defer/  — defer নেই: Console-এ TypeError আসার কথা
// চালানোর Command:  node examples/check-page-examples.mjs      (Node.js 22+ এবং Chrome/Edge প্রয়োজন)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const browserPath = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(p => fs.existsSync(p));
if (!browserPath) { console.error('Chrome বা Edge পাওয়া যায়নি। CHROME_PATH দিন।'); process.exit(2); }

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'page-examples-'));
const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-first-run', `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const port = await new Promise((resolve, reject) => {
  let buf = ''; setTimeout(() => reject(new Error('Browser চালু হয়নি')), 20000);
  browser.stderr.on('data', c => { buf += c; const m = /DevTools listening on ws:\/\/[^:]+:(\d+)\//.exec(buf); if (m) resolve(Number(m[1])); });
});
const target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => { ws.onopen = r; });
let id = 0; const pending = new Map(); const waiters = []; let log = [];
ws.onmessage = ({ data }) => {
  const m = JSON.parse(data);
  if (m.id) { pending.get(m.id)(m.result); pending.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; log.push('ERROR: ' + (d.exception?.description ?? d.text).split('\n')[0]); }
  if (m.method === 'Log.entryAdded') log.push('LOG: ' + m.params.entry.text);
  if (m.method === 'Runtime.consoleAPICalled') log.push('console.' + m.params.type + ': ' + m.params.args.map(a => a.value).join(' '));
  for (let i = waiters.length - 1; i >= 0; i--) if (waiters[i].method === m.method) waiters.splice(i, 1)[0].resolve();
};
const send = (method, params = {}) => new Promise(resolve => { pending.set(++id, resolve); ws.send(JSON.stringify({ id, method, params })); });
const open = async dir => { log = []; const loaded = new Promise(resolve => waiters.push({ method: 'Page.loadEventFired', resolve })); await send('Page.navigate', { url: pathToFileURL(path.join(HERE, dir, 'index.html')).href }); await loaded; };
const run = async expression => (await send('Runtime.evaluate', { expression, returnByValue: true })).result.value;

let failed = 0;
const expect = (label, actual, expected) => { const ok = actual === expected; if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}\n      ${JSON.stringify(actual)}`); };
try {
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
  await open('first-page');
  expect('first-page: Load হওয়ার পর Console-এর বার্তা', log.join(' | '), 'console.log: script.js সফলভাবে Load হয়েছে।');
  expect('first-page: Click-এর আগে লেখা', await run(`document.querySelector('#status').textContent`), 'এখনো Button চাপা হয়নি।');
  await run(`document.querySelector('#change-button').click()`);
  expect('first-page: Click-এর পরে লেখা', await run(`document.querySelector('#status').textContent`), 'Button চাপা হয়েছে। JavaScript কাজ করছে!');
  await open('without-defer');
  expect('without-defer: Console-এর Error', log.join(' | '), "ERROR: Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')");
  expect('without-defer: লেখা বদলায় না', await run(`document.querySelector('#change-button').click(), document.querySelector('#status').textContent`), 'এখনো Button চাপা হয়নি।');

  await open('wrong-filename');
  expect('wrong-filename: Console-এর বার্তা', log.join(' | '), 'LOG: Failed to load resource: net::ERR_FILE_NOT_FOUND');

  await open('solutions/s08-first-page');
  await run(`document.querySelector('#change-button').click()`);
  expect('সমাধান ৮: Click-এর পরে শিরোনাম', await run(`document.querySelector('#page-title').textContent`), 'JavaScript শেখা চলছে');
  expect('সমাধান ৮: Click-এর পরে অনুচ্ছেদ', await run(`document.querySelector('#status').textContent`), 'Button চাপা হয়েছে। JavaScript কাজ করছে!');

  await open('solutions/challenge-greeting-app');
  const q = sel => `document.querySelector('${sel}')`;
  const submit = (name, city) => run(`${q('#name')}.value = ${JSON.stringify(name)}; ${q('#city')}.value = ${JSON.stringify(city)}; ${q('#greeting-form')}.requestSubmit(); ${q('#message')}.textContent + ' / ' + ${q('#counter')}.textContent`);
  expect('সমাধান ১২ ও ১০: নাম ও শহর', await submit('Rahim', ' Bogura '), 'স্বাগতম, Rahim! Bogura থেকে JavaScript শেখার যাত্রা শুরু হোক। / মোট শুভেচ্ছা: 1 বার');
  expect('সমাধান ১২ ও ১০: ফাঁকা নামে সংখ্যা বাড়ে না', await submit('  ', 'Bogura'), 'অনুগ্রহ করে আপনার নাম লিখুন। / মোট শুভেচ্ছা: 1 বার');
  expect('সমাধান ১২ ও ১০: শুধু নাম', await submit('Nusrat', ''), 'স্বাগতম, Nusrat! / মোট শুভেচ্ছা: 2 বার');
  expect('সমাধান ১১: মুছে ফেলুন Button', await run(`${q('#reset-button')}.click(); JSON.stringify([${q('#name')}.value, ${q('#message')}.textContent, ${q('#message')}.className, document.activeElement.id, ${q('#counter')}.textContent])`), '["","","message","name","মোট শুভেচ্ছা: 2 বার"]');
  expect('Challenge App: কোনো Error নেই', log.filter(l => l.startsWith('ERROR')).length, 0);
} finally {
  ws.close(); browser.kill(); await new Promise(r => setTimeout(r, 500));
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* Temp Folder থেকে যেতে পারে */ }
}
process.exit(failed ? 1 : 0);
