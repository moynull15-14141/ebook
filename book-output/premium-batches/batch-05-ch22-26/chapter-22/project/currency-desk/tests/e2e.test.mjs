// End-to-end: আসল Browser, আসল Server, ব্যবহারকারীর মতো Form পূরণ ও Click।
// Chrome বা Edge না থাকলে Skip (কারণসহ), ব্যর্থ নয়।
import test from 'node:test';
import assert from 'node:assert/strict';
import { startDesk } from '../src/start.mjs';
import { findBrowser, launch } from './support/browser.mjs';

const skip = findBrowser()
  ? false
  : 'Chrome বা Edge পাওয়া যায়নি (CHROME_PATH দিন)';

test('Browser-এ Quote', { skip, timeout: 60_000 }, async (t) => {
  const desk = await startDesk();
  const page = await launch();
  t.after(async () => {
    await page.close();
    await desk.close();
  });
  await page.open(desk.url);
  const waitForResult = () => page.eval(`new Promise((resolve) => {
    const tick = () => document.querySelector('#result').dataset.state
      ? resolve(document.querySelector('#result').textContent)
      : setTimeout(tick, 50);
    tick();
  })`);

  await page.type('#amount', '1,000');
  await page.click('#get-quote');
  assert.equal(await waitForResult(),
    'দেবেন 1,050.00 USD (Fee 50.00 USD), পাবেন 121,450.00 BDT');

  await page.eval("delete document.querySelector('#result').dataset.state");
  await page.type('#amount', '1.234');
  await page.click('#get-quote');
  assert.equal(await waitForResult(), 'অবৈধ পরিমাণ: "1.234"');
});
