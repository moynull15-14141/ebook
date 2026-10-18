// SecureTrip-এর আসল Chrome-এ End-to-end যাচাই (শুধু 127.0.0.1, বাইরের কোনো Service নয়)।
// Usage (chapter-20 Folder থেকে): node browser-e2e.mjs
import { openBrowser } from '../tools/cdp.mjs';
import { startServer } from './project/secure-trip/src/start.mjs';

const PASSWORD = 'e2e-only-pass-2026';
const users = [{ email: 'rafi@example.com', role: 'customer', password: PASSWORD }];
const { server, url } = await startServer({ users, log: () => {} });
const page = await openBrowser({ fileAccess: false });
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok, detail });

try {
  await page.open(url);
  await page.type('#email', 'rafi@example.com');
  await page.type('#password', PASSWORD);
  await page.click('#login-btn');
  await page.sleep(1200);
  const status = await page.eval("document.querySelector('#status').textContent");
  check('login through the UI', status.startsWith('Login: rafi@example.com'), status);

  const cookies = await page.eval('document.cookie');
  check('HttpOnly session cookie is invisible to document.cookie',
    !cookies.includes('sid='), JSON.stringify(cookies));
  const stored = await page.eval('JSON.stringify({ ...localStorage })');
  check('nothing stored in localStorage', stored === '{}', stored);

  const date = new Date(Date.now() + 20 * 86_400_000).toISOString().slice(0, 10);
  await page.eval(`document.querySelector('#date').value = '${date}'`);
  const payload = '<img src=x onerror="window.__xss=1">';
  await page.type('#note', payload);
  await page.click('#add');
  await page.sleep(1500);
  const item = await page.eval("document.querySelector('#trips li')?.textContent ?? ''");
  check('note with HTML is shown as plain text', item.endsWith(payload), item);
  const imgs = await page.eval("document.querySelectorAll('#trips img').length");
  const xss = await page.eval('typeof window.__xss');
  check('no element created and no handler ran', imgs === 0 && xss === 'undefined',
    `img=${imgs}, __xss=${xss}`);
  const total = await page.eval("document.querySelector('#status').textContent");
  check('server-side price shown', total.includes('25000'), total);

  const errorsBefore = page.errors.length;
  await page.eval(`(() => { const s = document.createElement('script');
    s.textContent = 'window.__inline = 1'; document.body.append(s); })()`);
  await page.sleep(300);
  const inline = await page.eval('typeof window.__inline');
  const cspMessages = page.errors.slice(errorsBefore).filter((e) => /Content Security Policy/i.test(e));
  check('CSP blocks an injected inline script', inline === 'undefined' && cspMessages.length > 0,
    `__inline=${inline}; ${cspMessages[0] ?? 'no CSP message'}`);
} finally {
  console.log(`Browser: ${page.version}; server ${url}`);
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  ${r.detail}`);
  await page.close();
  server.close();
}
const failed = results.filter((r) => !r.ok).length;
console.log(`${results.length - failed} of ${results.length} browser checks passed`);
process.exitCode = failed || results.length < 7 ? 1 : 0;
