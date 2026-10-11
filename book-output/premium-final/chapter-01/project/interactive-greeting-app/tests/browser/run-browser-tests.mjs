// Interactive Greeting App-এর Browser Test।
// একটি আসল Chrome/Edge Browser-কে Headless Mode-এ চালিয়ে Page-এ লেখা, Click ও Enter পরীক্ষা করে।
// কোনো npm Package লাগে না; Node.js 22+ এর Built-in WebSocket দিয়ে Chrome DevTools Protocol ব্যবহার করে।
//
// চালানোর Command (Project Folder থেকে):  node tests/browser/run-browser-tests.mjs
// অন্য Browser ব্যবহার করতে চাইলে:           CHROME_PATH="/path/to/chrome" node tests/browser/run-browser-tests.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP_URL = pathToFileURL(path.resolve(HERE, '..', '..', 'index.html')).href;
const SHOTS = path.join(HERE, 'screenshots');
const GREETING = name => `স্বাগতম, ${name}! JavaScript শেখার যাত্রা শুরু হোক।`;
const EMPTY_MESSAGE = 'অনুগ্রহ করে আপনার নাম লিখুন।';

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ].filter(Boolean);
  return candidates.find(p => fs.existsSync(p));
}

const browserPath = findBrowser();
if (!browserPath) {
  console.error('Chrome বা Edge পাওয়া যায়নি। CHROME_PATH দিয়ে Browser-এর Path দিন।');
  process.exit(2);
}
if (typeof WebSocket === 'undefined') {
  console.error('এই Test চালাতে Node.js 22 বা পরবর্তী সংস্করণ প্রয়োজন (Built-in WebSocket)।');
  process.exit(2);
}

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'greeting-app-test-'));
const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--window-size=900,700', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });

const port = await new Promise((resolve, reject) => {
  let buffer = '';
  const timer = setTimeout(() => reject(new Error('Browser চালু হতে ২০ সেকেন্ডের বেশি সময় নিয়েছে।')), 20000);
  browser.stderr.on('data', chunk => {
    buffer += chunk;
    const m = /DevTools listening on ws:\/\/[^:]+:(\d+)\//.exec(buffer);
    if (m) { clearTimeout(timer); resolve(Number(m[1])); }
  });
  browser.on('exit', code => reject(new Error(`Browser বন্ধ হয়ে গেছে (code ${code})।`)));
});

const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = targets.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

let nextId = 0;
const pending = new Map();
const waiters = [];
const pageErrors = [];
ws.onmessage = ({ data }) => {
  const msg = JSON.parse(data);
  if (msg.id) {
    const p = pending.get(msg.id); pending.delete(msg.id);
    msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
    return;
  }
  if (msg.method === 'Runtime.exceptionThrown') pageErrors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') pageErrors.push(msg.params.args.map(a => a.value ?? a.description).join(' '));
  for (let i = waiters.length - 1; i >= 0; i--) if (waiters[i].method === msg.method) waiters.splice(i, 1)[0].resolve(msg.params);
};
const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++nextId; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
const waitFor = method => new Promise(resolve => waiters.push({ method, resolve }));
const evaluate = async expression => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result.value;
};
const open = async url => { const loaded = waitFor('Page.loadEventFired'); await send('Page.navigate', { url }); await loaded; };
const typeName = async text => { await evaluate(`document.querySelector('#name').focus()`); if (text) await send('Input.insertText', { text }); };
const pressKey = async (key, code, keyCode, text) => {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode, ...(text ? { text } : {}) });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
};
const clickButton = async () => {
  const { x, y } = await evaluate(`(() => { const r = document.querySelector('button').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
};
const state = () => evaluate(`(() => { const m = document.querySelector('#message'); return { text: m.textContent, cls: m.className, children: m.children.length, active: document.activeElement.id || document.activeElement.tagName }; })()`);
const screenshot = async name => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(SHOTS, name), Buffer.from(data, 'base64'));
};

const results = [];
async function check(name, fn) {
  try { await fn(); results.push({ name, ok: true }); console.log(`PASS  ${name}`); }
  catch (error) { results.push({ name, ok: false, error: error.message }); console.log(`FAIL  ${name}\n      ${error.message}`); }
}
const equal = (actual, expected, what) => { if (actual !== expected) throw new Error(`${what}: প্রত্যাশিত ${JSON.stringify(expected)}, পাওয়া গেছে ${JSON.stringify(actual)}`); };
const ok = (value, what) => { if (!value) throw new Error(what); };

try {
  await send('Page.enable'); await send('Runtime.enable');
  const version = await send('Browser.getVersion');
  console.log(`Browser: ${version.product}`);
  console.log(`Page:    ${APP_URL}\n`);

  await check('Page খুললে বার্তা ফাঁকা থাকে এবং কোনো Error হয় না', async () => {
    await open(APP_URL);
    const s = await state();
    equal(s.text, '', 'শুরুর বার্তা'); equal(pageErrors.length, 0, 'Console Error-এর সংখ্যা');
  });

  await check('নাম লিখে Button Click করলে শুভেচ্ছা দেখায়', async () => {
    await open(APP_URL); await typeName('Rahim'); await clickButton();
    const s = await state();
    equal(s.text, GREETING('Rahim'), 'বার্তা'); equal(s.cls, 'message success', 'Class');
    await send('Emulation.setDeviceMetricsOverride', { width: 900, height: 620, deviceScaleFactor: 1, mobile: false });
    await screenshot('desktop-success.png');
    // বইয়ের চিত্র ১.১-এর জন্য ছোট আকারের, বেশি Resolution-এর Screenshot
    await send('Emulation.setDeviceMetricsOverride', { width: 560, height: 400, deviceScaleFactor: 2, mobile: false });
    await screenshot('book-figure.png');
  });

  await check('ফাঁকা রেখে Submit করলে সতর্কবার্তা দেখায় এবং Input-এ Focus ফেরে', async () => {
    await open(APP_URL); await clickButton();
    const s = await state();
    equal(s.text, EMPTY_MESSAGE, 'বার্তা'); equal(s.cls, 'message error', 'Class'); equal(s.active, 'name', 'Focus');
  });

  await check('শুধু Space লিখে Submit করলে সতর্কবার্তা দেখায়', async () => {
    await open(APP_URL); await typeName('     '); await clickButton();
    const s = await state();
    equal(s.text, EMPTY_MESSAGE, 'বার্তা'); equal(s.cls, 'message error', 'Class');
  });

  await check('Input-এ Enter চাপলে শুভেচ্ছা দেখায়', async () => {
    await open(APP_URL); await typeName('নুসরাত'); await pressKey('Enter', 'Enter', 13, '\r');
    const s = await state();
    equal(s.text, GREETING('নুসরাত'), 'বার্তা');
  });

  await check('নামের আগে-পরের Space বাদ দিয়ে শুভেচ্ছা দেখায়', async () => {
    await open(APP_URL); await typeName('   Karim   '); await clickButton();
    equal((await state()).text, GREETING('Karim'), 'বার্তা');
  });

  await check('HTML-এর মতো লেখা Tag হিসেবে নয়, সাধারণ Text হিসেবে দেখায়', async () => {
    await open(APP_URL); await typeName('<b>Test</b>'); await clickButton();
    const s = await state();
    equal(s.text, GREETING('<b>Test</b>'), 'বার্তা'); equal(s.children, 0, 'বার্তার ভেতরে তৈরি হওয়া Element-এর সংখ্যা');
  });

  await check('ভুলের পর সঠিক নাম দিলে সতর্কবার্তা সরে গিয়ে শুভেচ্ছা দেখায়', async () => {
    await open(APP_URL); await clickButton(); await typeName('Tanvir'); await clickButton();
    const s = await state();
    equal(s.text, GREETING('Tanvir'), 'বার্তা'); equal(s.cls, 'message success', 'Class');
  });

  await check('Accessibility: Label, Status Region ও ভাষা ঠিকভাবে চিহ্নিত', async () => {
    await open(APP_URL);
    const a = await evaluate(`(() => { const i = document.querySelector('#name'); const m = document.querySelector('#message'); return { labels: i.labels.length, labelText: i.labels[0]?.textContent.trim(), role: m.getAttribute('role'), live: m.getAttribute('aria-live'), lang: document.documentElement.lang, buttonType: document.querySelector('button').type, h1: document.querySelectorAll('h1').length, main: document.querySelectorAll('main').length }; })()`);
    equal(a.labels, 1, 'Input-এর সঙ্গে যুক্ত Label'); equal(a.labelText, 'আপনার নাম', 'Label-এর লেখা');
    equal(a.role, 'status', 'role'); equal(a.live, 'polite', 'aria-live'); equal(a.lang, 'bn', 'lang');
    equal(a.buttonType, 'submit', 'Button type'); equal(a.h1, 1, 'h1-এর সংখ্যা'); equal(a.main, 1, 'main-এর সংখ্যা');
  });

  await check('Keyboard: Tab চাপলে Input থেকে Button-এ Focus যায়, Space চাপলে Submit হয়', async () => {
    await open(APP_URL); await typeName('Sadia'); await pressKey('Tab', 'Tab', 9);
    equal((await state()).active, 'BUTTON', 'Tab-এর পর Focus');
    await pressKey(' ', 'Space', 32, ' ');
    equal((await state()).text, GREETING('Sadia'), 'বার্তা');
  });

  await check('Mobile (360px): পাশে Scroll হয় না, Card পর্দার ভেতরে থাকে, লেখার আকার যথেষ্ট বড়', async () => {
    await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 740, deviceScaleFactor: 2, mobile: true });
    await open(APP_URL); await typeName('Rahim'); await clickButton();
    const m = await evaluate(`(() => { const c = document.querySelector('.card').getBoundingClientRect(); return { scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth, left: c.left, right: c.right, inputFont: parseFloat(getComputedStyle(document.querySelector('#name')).fontSize), buttonH: document.querySelector('button').getBoundingClientRect().height }; })()`);
    ok(m.scrollW <= m.innerW, `পাশে Scroll হচ্ছে: scrollWidth ${m.scrollW} > viewport ${m.innerW}`);
    ok(m.left >= 0 && m.right <= m.innerW, `Card পর্দার বাইরে: ${m.left}–${m.right}`);
    ok(m.inputFont >= 16, `Input-এর Font ${m.inputFont}px (১৬px-এর কম)`);
    ok(m.buttonH >= 44, `Button-এর উচ্চতা ${m.buttonH}px (৪৪px-এর কম)`);
    equal((await state()).text, GREETING('Rahim'), 'বার্তা');
    await screenshot('mobile-success.png');
    await open(APP_URL); await clickButton();
    await screenshot('mobile-empty-input.png');
  });

  await check('পুরো Test চলাকালে Console-এ কোনো Error আসেনি', async () => {
    equal(pageErrors.length, 0, `Console Error: ${pageErrors.join(' | ')}`);
  });
} finally {
  ws.close();
  browser.kill();
  await new Promise(resolve => setTimeout(resolve, 500));
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* Browser এখনো File ধরে রাখলে Temp Folder থেকে যাবে */ }
}

const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed} passed, ${failed} failed (মোট ${results.length})`);
process.exit(failed ? 1 : 0);
