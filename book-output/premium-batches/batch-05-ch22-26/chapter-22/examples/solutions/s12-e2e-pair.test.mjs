import test from 'node:test';
import assert from 'node:assert/strict';
import { startDesk } from '../../project/currency-desk/src/start.mjs';
import { findBrowser, launch }
  from '../../project/currency-desk/tests/support/browser.mjs';

test('অজানা মুদ্রা-জোড়ার বার্তা', { skip: !findBrowser() }, async (t) => {
  const desk = await startDesk();
  const page = await launch();
  t.after(async () => {
    await page.close();
    await desk.close();
  });
  await page.open(desk.url);
  await page.type('#to', 'JPY');
  await page.type('#amount', '10');
  await page.click('#get-quote');
  const text = await page.eval(`new Promise((resolve) => {
    const tick = () => document.querySelector('#result').dataset.state
      ? resolve(document.querySelector('#result').textContent)
      : setTimeout(tick, 50);
    tick();
  })`);
  assert.equal(text, 'USD-JPY-এর হার নেই');
});
