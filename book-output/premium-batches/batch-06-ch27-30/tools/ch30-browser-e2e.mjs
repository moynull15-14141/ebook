// QA only (batch 06): drives the TravelMaster Pro frontend (chapter-30/project/travel-master-pro/public) in real
// headless Chrome against the real server (in-memory SQLite): register, login, booking, double submit, sold out,
// cancel, logout, Content-Security-Policy violations (would surface as console errors) and a 375 px viewport.
// Usage: node tools/ch30-browser-e2e.mjs <chapter-30-dir> [screenshot-dir]
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { openBrowser } from './cdp.mjs';

const project = path.resolve(process.argv[2], 'project/travel-master-pro');
const shots = process.argv[3];
const { startServer } = await import(pathToFileURL(path.join(project, 'src/server.mjs')).href);
const app = await startServer({ port: 39130 });
const page = await openBrowser();
const results = [];
const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`); };
const waitFor = async (expr, ms = 8000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) { if (await page.eval(expr)) return true; await page.sleep(50); }
  return false;
};
const text = (sel) => page.eval(`document.querySelector(${JSON.stringify(sel)}).textContent`);
const fill = async (sel, value) => page.eval(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); e.value = ${JSON.stringify(value)}; e.dispatchEvent(new Event('input', { bubbles: true })); })()`);
const shot = async (name) => {
  if (!shots) return;
  const { data } = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.mkdirSync(shots, { recursive: true });
  fs.writeFileSync(path.join(shots, `${name}.png`), Buffer.from(data, 'base64'));
};

try {
  console.log(`Browser: ${page.version}`);
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 900, deviceScaleFactor: 1, mobile: false });
  await page.open(`${app.url}/`);
  check('catalog loads 4 packages from the API', await waitFor(`document.querySelectorAll('#packages li').length === 4`), await text('#packages li'));
  check('booking section hidden for guests', await page.eval(`document.querySelector('#booking').hidden`));

  await page.type('#register [name=name]', 'Rafi Ahmed');
  await page.type('#register [name=email]', 'rafi@example.com');
  await page.type('#register [name=password]', 'long-password-123');
  await page.click('#register button');
  check('registration via the form', await waitFor(`document.querySelector('#message').textContent.startsWith('নিবন্ধন সম্পন্ন')`), await text('#message'));

  await page.type('#login [name=email]', 'rafi@example.com');
  await page.type('#login [name=password]', 'wrong-password-1');
  await page.click('#login button');
  check('wrong password shows the server message, no session', await waitFor(`document.querySelector('#message').textContent === 'Email বা Password ভুল'`) && await page.eval(`document.querySelector('#booking').hidden`), await text('#message'));
  await fill('#login [name=password]', 'long-password-123');
  await page.click('#login button');
  check('login shows the booking section and a welcome', await waitFor(`!document.querySelector('#booking').hidden && document.querySelector('#message').textContent.startsWith('স্বাগতম')`), await text('#who'));

  await fill('#book [name=packageId]', 'BT-4D');
  await fill('#book [name=travelers]', '2');
  await page.eval(`(() => { const f = document.querySelector('#book'); f.requestSubmit(); f.requestSubmit(); })()`);
  check('booking confirmed with the server price', await waitFor(`document.querySelector('#message').textContent.includes('25,000 টাকা')`), await text('#message'));
  const count = app.db.prepare('SELECT COUNT(*) AS n FROM bookings').get().n;
  check('double submit created exactly one booking', count === 1 && await waitFor(`document.querySelectorAll('#bookings li').length === 1`), `${count} in database`);
  check('catalog seats refreshed (BT-4D 12 to 10)', await waitFor(`[...document.querySelectorAll('#packages li')][0].textContent.includes('আসন 10')`));
  await shot('desktop-after-booking');

  await fill('#book [name=packageId]', 'SYL-2D');
  await fill('#book [name=travelers]', '3');
  await page.click('#book-button');
  check('sold out shows a friendly message', await waitFor(`document.querySelector('#message').textContent.startsWith('দুঃখিত')`), await text('#message'));

  await page.click('#bookings button');
  check('cancel marks the booking cancelled', await waitFor(`document.querySelector('#bookings li').classList.contains('cancelled')`), await text('#bookings li'));
  check('seats returned exactly once (BT-4D 12)', await waitFor(`[...document.querySelectorAll('#packages li')][0].textContent.includes('আসন 12')`));

  await page.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 800, deviceScaleFactor: 2, mobile: true });
  await page.sleep(200);
  check('no horizontal overflow at 375 px', await page.eval(`document.documentElement.scrollWidth <= 375`), `scrollWidth ${await page.eval('document.documentElement.scrollWidth')}`);
  await shot('mobile-375');

  await page.click('#logout');
  check('logout returns to the guest view', await waitFor(`!document.querySelector('#account').hidden && document.querySelector('#booking').hidden`));
  const unexpected = page.errors.filter((e) => !/status of 40[019]/.test(e));
  check('no console errors or CSP violations (expected 400/401/409 responses excluded)', unexpected.length === 0, unexpected.join(' | '));
  console.log(`INFO  expected HTTP error responses logged by Chrome: ${page.errors.length - unexpected.length}`);
} finally {
  await page.close();
  await app.close();
}
const failed = results.filter((ok) => !ok).length;
console.log(`${results.length} checks, ${failed} failed`);
process.exit(failed ? 1 : 0);
