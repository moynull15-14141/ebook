// Minimal Chrome DevTools Protocol client (Node.js 22+, no dependencies) for running pages in real headless Chrome.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function findBrowser() {
  return [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(p => fs.existsSync(p));
}

const fmt = a => a.type === 'string' ? a.value : a.type === 'undefined' ? 'undefined' : a.subtype === 'null' ? 'null'
  : ['number', 'boolean', 'bigint'].includes(a.type) ? String(a.value ?? a.unserializableValue ?? a.description) : a.description;

export async function openBrowser() {
  const exe = findBrowser();
  if (!exe) throw new Error('Chrome or Edge not found; set CHROME_PATH.');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'jsm-cdp-'));
  const proc = spawn(exe, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${profile}`,
    '--remote-debugging-port=0', '--allow-file-access-from-files', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  const port = await new Promise((resolve, reject) => {
    let buf = ''; const t = setTimeout(() => reject(new Error('Browser did not start')), 20000);
    proc.stderr.on('data', c => { buf += c; const m = /DevTools listening on ws:\/\/[^:]+:(\d+)\//.exec(buf); if (m) { clearTimeout(t); resolve(+m[1]); } });
  });
  const target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0; const pending = new Map(), waiters = [];
  const page = { logs: [], errors: [], version: '' };
  ws.onmessage = ({ data }) => {
    const m = JSON.parse(data);
    if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); return; }
    if (m.method === 'Runtime.consoleAPICalled') {
      const line = m.params.args.map(fmt).join(' ');
      (m.params.type === 'error' ? page.errors : page.logs).push(m.params.type === 'error' ? `console.error: ${line}` : line);
    }
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; page.errors.push((d.exception?.description ?? d.text).split('\n')[0]); }
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') page.errors.push(m.params.entry.text);
    for (let i = waiters.length - 1; i >= 0; i--) if (waiters[i].method === m.method) waiters.splice(i, 1)[0].resolve(m.params);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => { pending.set(++id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
  page.version = (await send('Browser.getVersion')).product;
  page.send = send;
  page.sleep = ms => new Promise(r => setTimeout(r, ms));
  page.open = async url => { page.logs = []; page.errors = []; const loaded = new Promise(r => waiters.push({ method: 'Page.loadEventFired', resolve: r })); await send('Page.navigate', { url }); await loaded; };
  page.eval = async expression => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  page.click = async selector => {
    const box = await page.eval(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    if (!box) throw new Error(`No element for selector ${selector}`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: box.x, y: box.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: box.x, y: box.y, button: 'left', clickCount: 1 });
  };
  page.type = async (selector, text) => { await page.eval(`document.querySelector(${JSON.stringify(selector)}).focus()`); if (text) await send('Input.insertText', { text }); };
  page.key = async (key, code, keyCode, text) => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode, ...(text ? { text } : {}) });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode });
  };
  page.close = async () => { ws.close(); proc.kill(); await page.sleep(400); try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* temp may linger */ } };
  return page;
}
