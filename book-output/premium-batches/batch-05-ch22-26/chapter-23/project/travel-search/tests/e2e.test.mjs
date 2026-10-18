// End-to-end: আসল Browser-এ Worker, Virtual List ও খোঁজ। কোনো সময় মাপা হয় না;
// যাচাই হয় আচরণ: DOM ছোট থাকে, ফল সঠিক, Scroll-এ সঠিক সারি আসে।
import test from 'node:test';
import assert from 'node:assert/strict';
import { startStatic } from '../serve.mjs';
import { generateRecords } from '../src/data.mjs';
import { naiveSearch } from '../src/search.mjs';
import { findBrowser, launch } from './support/browser.mjs';

const skip = findBrowser() ? false : 'Chrome বা Edge পাওয়া যায়নি (CHROME_PATH দিন)';
const records = generateRecords();

test('Browser-এ TravelSearch', { skip, timeout: 60_000 }, async (t) => {
  const { server, url } = await startStatic();
  const page = await launch();
  t.after(async () => {
    await page.close();
    server.close();
  });
  await page.open(url);
  const waitFor = (request) => page.eval(`new Promise((resolve) => {
    const tick = () => document.querySelector('#count').dataset.request === '${request}'
      ? resolve(document.querySelector('#count').textContent)
      : setTimeout(tick, 50);
    tick();
  })`);
  const domRows = () => page.eval("document.querySelectorAll('#rows li').length");

  await t.test('১২,০০০ ফল, কিন্তু DOM-এ মাত্র কয়েকটি সারি', async () => {
    assert.match(await waitFor(1), /^12000টি ফল/);
    assert.ok(await domRows() <= 20, `DOM rows: ${await domRows()}`);
  });

  await t.test('শেষ পর্যন্ত Scroll: শেষ Record আঁকা হয়', async () => {
    await page.eval(`(() => { const list = document.querySelector('#list');
      list.scrollTop = list.scrollHeight; })()`);
    await page.eval(
      'new Promise((r) => requestAnimationFrame(() => setTimeout(r, 50)))');
    const last = await page.eval(
      "document.querySelector('#rows li:last-child').textContent");
    assert.ok(last.startsWith(records.at(-1).title), last);
    assert.ok(await domRows() <= 20);
  });

  await t.test('খোঁজ ও সাজানো: Node.js-এর সরল খোঁজের সঙ্গে মেলে', async () => {
    await page.eval(`(() => { const s = document.querySelector('#sort');
      s.value = 'price'; s.dispatchEvent(new Event('change')); })()`);
    await waitFor(2);
    await page.type('#query', 'sylhet tea');
    const expected = naiveSearch(records, 'sylhet tea', { sort: 'price' });
    const text = await waitFor(3);
    assert.ok(text.startsWith(`${expected.length}টি ফল`), text);
    const first = await page.eval("document.querySelector('#rows li').textContent");
    assert.ok(first.startsWith(`${expected[0].title} · ${expected[0].place}`), first);
  });
});
