// QA only (batch 06): runs the TravelLive dashboard (chapter-27/project/travel-live/public) in real headless
// Chrome against the real server on localhost: WebSocket connect + auth, live update, forced disconnect,
// automatic reconnect with backoff, replay of the event missed while offline, and a foreign-booking refusal.
// Usage: node --import <tools>/local-deps.mjs tools/ch27-browser-e2e.mjs <chapter-27-dir>
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { openBrowser } from './cdp.mjs';

const project = path.resolve(process.argv[2], 'project/travel-live');
const load = (rel) => import(pathToFileURL(path.join(project, rel)).href);
const { createDemo } = await load('src/demo-data.mjs');
const { createLiveServer } = await load('src/server.mjs');

const { hub, users } = createDemo();
const port = 39127;
const origin = `http://localhost:${port}`;
const { server, gateway } = createLiveServer({ hub, users, allowedOrigins: [origin] });
await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));

const page = await openBrowser();
const results = [];
const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`); };
const waitFor = async (expr, ms = 8000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) { if (await page.eval(expr)) return true; await page.sleep(50); }
  return false;
};
const items = () => page.eval(`[...document.querySelectorAll('#bookings li')].map(li => li.textContent)`);

try {
  console.log(`Browser: ${page.version}`);
  await page.open(`${origin}/#token-rafi:bk-1,bk-2`);
  check('connects and authenticates over WebSocket', await waitFor(`document.querySelector('#connection').textContent === 'সংযুক্ত'`));
  check('own booking bk-1 rendered from replay', await waitFor(`document.querySelector('#bookings li').textContent.includes('PENDING (#1)')`), (await items())[0]);
  check('foreign booking bk-2 refused (console error FORBIDDEN, still waiting)', await waitFor(`document.querySelectorAll('#bookings li')[1].textContent.includes('(#0)')`) && page.errors.some((e) => e.includes('FORBIDDEN')), (await items())[1]);

  hub.changeStatus('agent-1', 'bk-1', 'CONFIRMED');
  check('live CONFIRMED update without reload', await waitFor(`document.querySelector('#bookings li').dataset.status === 'CONFIRMED'`), (await items())[0]);

  for (const ws of gateway.wss.clients) ws.terminate();
  check('disconnect shown with a backoff delay', await waitFor(`document.querySelector('#connection').textContent.startsWith('বিচ্ছিন্ন;')`), await page.eval(`document.querySelector('#connection').textContent`));
  hub.changeStatus('agent-1', 'bk-1', 'CANCELLED'); // happens while the browser is offline
  check('reconnects automatically', await waitFor(`document.querySelector('#connection').textContent === 'সংযুক্ত'`));
  check('missed CANCELLED event replayed after reconnect', await waitFor(`document.querySelector('#bookings li').textContent.includes('CANCELLED (#3)')`), (await items())[0]);
  const unexpected = page.errors.filter((e) => !e.includes('FORBIDDEN'));
  check('no other console errors', unexpected.length === 0, unexpected.join(' | '));
} finally {
  await page.close();
  server.closeAllConnections();
  for (const ws of gateway.wss.clients) ws.terminate();
  server.close();
}
const failed = results.filter((ok) => !ok).length;
console.log(`${results.length} checks, ${failed} failed`);
process.exit(failed ? 1 : 0);
