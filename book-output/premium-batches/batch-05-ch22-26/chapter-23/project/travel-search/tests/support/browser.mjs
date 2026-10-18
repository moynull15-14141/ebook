// ছোট একটি Chrome DevTools Protocol Client (E2E Test-এর জন্য, কোনো Package নয়)।
// Chrome বা Edge না পেলে findBrowser() null দেয়, যাতে Test Skip হতে পারে।
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

export const findBrowser = () => CANDIDATES.find((p) => p && existsSync(p)) ?? null;

function devToolsPort(proc) {
  return new Promise((resolve, reject) => {
    let log = '';
    const timer = setTimeout(() => reject(new Error('Browser চালু হয়নি')), 20_000);
    proc.stderr.on('data', (chunk) => {
      log += chunk;
      const match = /DevTools listening on ws:\/\/[^:]+:(\d+)\//.exec(log);
      if (match) {
        clearTimeout(timer);
        resolve(Number(match[1]));
      }
    });
  });
}

// একটি Page: open, eval (Page-এর ভেতরে JavaScript), type, click।
function createPage(ws, close) {
  let id = 0;
  const pending = new Map();
  const loaded = [];
  ws.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    } else if (message.method === 'Page.loadEventFired') {
      loaded.splice(0).forEach((resolve) => resolve());
    }
  });
  const send = (method, params = {}) => new Promise((resolve) => {
    id += 1;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const { result } = await send('Runtime.evaluate',
      { expression, awaitPromise: true, returnByValue: true });
    return result.result.value;
  };
  return {
    async open(url) {
      await send('Page.enable');
      const ready = new Promise((resolve) => loaded.push(resolve));
      await send('Page.navigate', { url });
      await ready;
    },
    eval: evaluate,
    async type(selector, text) {
      await evaluate(`document.querySelector(${JSON.stringify(selector)}).value = ''`);
      await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
      await send('Input.insertText', { text });
    },
    click: (selector) =>
      evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`),
    close,
  };
}

export async function launch() {
  const profile = mkdtempSync(join(tmpdir(), 'desk-e2e-'));
  const proc = spawn(findBrowser(), ['--headless=new', '--disable-gpu',
    '--no-first-run', `--user-data-dir=${profile}`,
    '--remote-debugging-port=0', 'about:blank'],
  { stdio: ['ignore', 'ignore', 'pipe'] });
  const port = await devToolsPort(proc);
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));
  return createPage(ws, async () => {
    ws.close();
    proc.kill();
    await new Promise((resolve) => setTimeout(resolve, 500));
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  });
}
