// Modular Shopping Cart-এর Browser Test: Local Server চালিয়ে আসল (Headless) Chrome বা Edge-এ Page খোলে,
// এবং Click, লেখা ও Reload দিয়ে আচরণ যাচাই করে।
// চালানোর Command (Project Folder থেকে):  node tests/browser-check.mjs
// প্রয়োজন: Node.js 22+ এবং Chrome বা Edge (অন্য জায়গায় থাকলে CHROME_PATH)।
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openBrowser } from './cdp.mjs';
import { startStaticServer } from './static-server.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = await startStaticServer(root);
const page = await openBrowser();
const results = [];
const problems = [];

const view = () => page.eval(`(() => ({
  products: document.querySelectorAll('#products li').length,
  lines: [...document.querySelectorAll('#cart-lines li')].map((li) => li.textContent.trim() + ' x' + li.querySelector('input').value),
  totals: [...document.querySelectorAll('#totals p')].map((p) => p.textContent),
  message: document.querySelector('#message').textContent,
  empty: !document.querySelector('#empty').hidden,
}))()`);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function check(name, ok, detail) { results.push({ name, ok, detail: JSON.stringify(detail) }); }
const add = async (id) => { await page.click(`[data-add="${id}"]`); await page.sleep(60); };
async function setQuantity(id, value) {
  await page.eval(`(() => { const i = document.querySelector('input[data-id="${id}"]'); i.value = ${JSON.stringify(value)}; i.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  await page.sleep(60);
}
async function coupon(code) {
  await page.eval(`document.querySelector('#coupon').value = ''`);
  await page.type('#coupon', code);
  await page.key('Enter', 'Enter', 13, '\r');
  await page.sleep(80);
}
const collect = () => { problems.push(...page.errors); page.errors.length = 0; };

try {
  await page.open(`${server.url}/index.html`);
  await page.sleep(200);
  let v = await view();
  check('Module লোড হয়: চারটি পণ্য, ফাঁকা কার্ট, সব মোট 0', v.products === 4 && v.empty && v.totals.at(-1) === 'পরিশোধ: 0 টাকা', v);

  await add('notebook');
  await add('notebook');
  v = await view();
  check('Notebook দুবার: পরিমাণ 2; মোট 240, Delivery 60, পরিশোধ 300',
    same(v.lines, ['Notebook = 240 টাকা x2']) && same(v.totals, ['মোট দাম: 240 টাকা', 'ছাড় (নেই): 0 টাকা', 'Delivery: 60 টাকা', 'পরিশোধ: 300 টাকা']) && v.message === 'কার্টে যোগ হয়েছে।', v);

  await add('backpack');
  v = await view();
  check('Backpack: মোট 2,090; Delivery 0', v.totals[0] === 'মোট দাম: 2,090 টাকা' && v.totals[2] === 'Delivery: 0 টাকা', v);

  await coupon('student10');
  v = await view();
  check('Coupon student10 (Enter দিয়ে): ছাড় 209, Delivery আবার 60, পরিশোধ 1,941',
    same(v.totals, ['মোট দাম: 2,090 টাকা', 'ছাড় (STUDENT10): 209 টাকা', 'Delivery: 60 টাকা', 'পরিশোধ: 1,941 টাকা']) && v.message === 'Coupon প্রয়োগ হয়েছে।', v);

  await coupon('FREE100');
  v = await view();
  check('ভুল Coupon: বার্তা, আগের Coupon ও মোট অপরিবর্তিত', v.message === 'Coupon "FREE100" সঠিক নয়।' && v.totals[3] === 'পরিশোধ: 1,941 টাকা', v);

  await setQuantity('notebook', '11');
  v = await view();
  check('পরিমাণ 11: সীমার বার্তা, ঘরে আগের মান 2 ফিরে আসে',
    v.message === 'পরিমাণ 0 থেকে 10-এর মধ্যে পূর্ণসংখ্যা হতে হবে।' && v.lines[0] === 'Notebook = 240 টাকা x2', v);

  await setQuantity('notebook', '3');
  v = await view();
  check('পরিমাণ 3: সারির মোট 360', v.lines[0] === 'Notebook = 360 টাকা x3' && v.message === 'পরিমাণ বদলেছে।', v);

  await page.open(`${server.url}/index.html`);
  await page.sleep(200);
  v = await view();
  check('Reload: কার্ট ও Coupon localStorage থেকে ফিরে আসে', v.lines.length === 2 && v.totals[1] === 'ছাড় (STUDENT10): 221 টাকা', v);

  await setQuantity('notebook', '0');
  await setQuantity('backpack', '0');
  v = await view();
  check('পরিমাণ 0: সারি সরে যায়; সব সরালে "কার্ট ফাঁকা।"', v.lines.length === 0 && v.empty && v.totals[3] === 'পরিশোধ: 0 টাকা', v);

  await page.eval(`localStorage.setItem('jsm-ch12-cart', '{"items":[{"id":"laptop","quantity":1}],"coupon":null}')`);
  await page.open(`${server.url}/index.html`);
  await page.sleep(200);
  v = await view();
  check('অচেনা পণ্যসহ সংরক্ষিত তথ্য: Page Error ছাড়া ফাঁকা কার্ট', v.empty && v.products === 4 && page.errors.length === 0, { v, errors: page.errors });
  collect();

  // সাধারণ (Default) Chrome-এর আচরণ: আলাদা Browser, file:// Access-এর বাড়তি অনুমতি ছাড়া।
  const plain = await openBrowser({ fileAccess: false });
  try {
    await plain.open(pathToFileURL(path.join(root, 'index.html')).href);
    await plain.sleep(300);
    const fileView = await plain.eval(`document.querySelectorAll('#products li').length`);
    const blocked = plain.errors.some((e) => /CORS|origin 'null'|Failed to load/i.test(e));
    check('file:// থেকে খুললে Module লোড হয় না (Default Chrome): পণ্য দেখা যায় না, Console-এ CORS ত্রুটি', fileView === 0 && blocked, { fileView, errors: plain.errors });
  } finally {
    await plain.close();
  }

  check('Server থেকে চালানোর সময় কোনো ধরা না পড়া Exception বা console.error নেই', problems.length === 0, problems);
} finally {
  await page.close();
  await server.close();
}

console.log(`Browser: ${page.version}`);
results.forEach((r, i) => console.log(`${r.ok ? 'ok' : 'not ok'} ${i + 1} - ${r.name}${r.ok ? '' : `\n  # ${r.detail}`}`));
const failed = results.filter((r) => !r.ok).length;
console.log(`# tests ${results.length}\n# pass ${results.length - failed}\n# fail ${failed}`);
process.exit(failed ? 1 : 0);
