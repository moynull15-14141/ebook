// OrderGuard-এর Browser Test: আসল (Headless) Chrome বা Edge-এ index.html খুলে লেখা, বাছাই, Click ও Key দিয়ে পরীক্ষা।
// চালানোর Command (Project Folder থেকে):  node tests/browser-check.mjs
// প্রয়োজন: Node.js 22+ এবং Chrome বা Edge (অন্য জায়গায় থাকলে CHROME_PATH)।
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openBrowser } from './cdp.mjs';

const base = pathToFileURL(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html')).href;
const page = await openBrowser();
const results = [];
const problems = [];

const view = () => page.eval(`(() => {
  const fields = ['customer', 'email', 'productId', 'quantity'];
  return {
    errors: Object.fromEntries(fields.map((f) => [f, document.querySelector('#' + f + '-error').textContent])),
    invalid: fields.filter((f) => document.querySelector('#' + f).getAttribute('aria-invalid') === 'true'),
    status: document.querySelector('#status').textContent,
    history: [...document.querySelectorAll('#history li')].map((li) => li.textContent),
    disabled: document.querySelector('#order-form button').disabled,
    focused: document.activeElement?.id ?? '',
    values: fields.map((f) => document.querySelector('#' + f).value),
    imgs: document.querySelectorAll('img').length,
  };
})()`);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function check(name, ok, detail) { results.push({ name, ok, detail: JSON.stringify(detail) }); }
function collectProblems() { problems.push(...page.errors); page.errors.length = 0; }

async function fill({ customer = '', email = '', productId = '', quantity = '' }) {
  for (const [id, text] of Object.entries({ customer, email, quantity })) {
    await page.eval(`document.querySelector('#${id}').value = ''`);
    if (text) await page.type(`#${id}`, text);
  }
  await page.eval(`(() => { const s = document.querySelector('#productId'); s.value = ${JSON.stringify(productId)}; s.dispatchEvent(new Event('change', { bubbles: true })); })()`);
}
async function submit(waitMs = 400) { await page.click('#order-form button'); await page.sleep(waitMs); }
const valid = { customer: 'Sara Ahmed', email: 'sara@example.com', productId: 'keyboard', quantity: '2' };

try {
  await page.open(`${base}?delay=150`);

  await submit(100);
  let v = await view();
  check('সব ঘর ফাঁকা: চারটি ঘরের বার্তা একসঙ্গে, সবগুলো aria-invalid, নামের ঘরে Focus',
    Object.values(v.errors).every(Boolean) && v.invalid.length === 4 && v.focused === 'customer' && v.status === 'কয়েকটি ঘর ঠিক করতে হবে।', v);

  await fill(valid);
  await page.click('#order-form button');
  await page.sleep(60);
  const during = await view();
  await page.sleep(300);
  v = await view();
  check('পাঠানোর সময় Button বন্ধ এবং "পাঠানো হচ্ছে..."', during.disabled && during.status === 'পাঠানো হচ্ছে...', during);
  check('সফল: রসিদ ও মোট দাম, ইতিহাসে সারি, Form খালি, কোনো ঘর লাল নয়, Button আবার চালু',
    v.status === 'Order গৃহীত: ORD-0001, মোট 2,500 টাকা।' && same(v.history, ['ORD-0001: Sara Ahmed, Keyboard 2টি, 2,500 টাকা']) &&
    same(v.values, ['', '', '', '']) && v.invalid.length === 0 && !v.disabled, v);

  const quantityResults = [];
  for (const quantity of ['0', '2.5', '1e3', '101']) {
    await fill({ ...valid, quantity });
    await submit(100);
    const q = await view();
    quantityResults.push(q.errors.quantity === 'পরিমাণ 1 থেকে 100-এর মধ্যে পূর্ণসংখ্যা হতে হবে।' && same(q.invalid, ['quantity']) && q.focused === 'quantity');
  }
  check('পরিমাণ 0, 2.5, 1e3, 101: শুধু পরিমাণের ঘরে বার্তা ও Focus', quantityResults.every(Boolean), quantityResults);

  await fill(valid);
  await submit();
  v = await view();
  check('ভুল ঠিক করে আবার পাঠালে আগের বার্তা ও লাল সীমানা মুছে যায়', v.status.startsWith('Order গৃহীত: ORD-0002') && v.invalid.length === 0 && v.errors.quantity === '', v);

  await fill({ ...valid, productId: 'headset', quantity: '3' });
  await submit();
  v = await view();
  check('স্টকের চেয়ে বেশি: Server-এর বার্তা, ইতিহাসে নতুন সারি নেই, Button চালু',
    v.status === 'দুঃখিত, Headset স্টকে আছে 2টি।' && v.history.length === 2 && !v.disabled, v);

  const evil = '<img src="" onerror="window.__xss = 1">';
  await fill({ ...valid, customer: evil, quantity: '1' });
  await submit();
  v = await view();
  const ran = await page.eval('window.__xss === 1');
  check('নিরাপত্তা: ক্ষতিকর নাম ইতিহাসে লেখা হিসেবে; কোনো <img> নেই, Code চলে না',
    v.history[0] === `ORD-0003: ${evil}, Keyboard 1টি, 1,250 টাকা` && v.imgs === 0 && !ran, { v, ran });

  await page.eval(`(() => { const o = document.createElement('option'); o.value = 'toString'; o.textContent = 'x'; document.querySelector('#productId').append(o); })()`);
  await fill({ ...valid, productId: 'toString' });
  await submit(100);
  v = await view();
  check('পণ্যের তালিকায় হাত দিয়ে "toString" পাঠালে: পণ্যের ঘরে বার্তা', v.errors.productId === 'তালিকা থেকে একটি পণ্য বাছুন।' && same(v.invalid, ['productId']), v);

  await fill({ ...valid, quantity: '' });
  await page.type('#quantity', '1');
  await page.key('Enter', 'Enter', 13, '\r');
  await page.sleep(400);
  v = await view();
  check('Keyboard: পরিমাণের ঘরে Enter চাপলে Order যায়', v.status.startsWith('Order গৃহীত: ORD-0004'), v);
  collectProblems();

  // ইচ্ছা করে একটি Bug ঢোকানো: placeOrder অপ্রত্যাশিত TypeError ছোড়ে।
  await page.eval(`window.placeOrder = async () => { throw new TypeError('ইচ্ছাকৃত Bug'); }`);
  await fill(valid);
  await submit(150);
  v = await view();
  const reported = page.errors.filter((e) => e.startsWith('console.error: OrderGuard-এ অপ্রত্যাশিত ত্রুটি:'));
  check('অপ্রত্যাশিত ত্রুটি: নিরাপদ বার্তা, console.error-এ বিবরণ, Button আবার চালু',
    v.status === 'অপ্রত্যাশিত সমস্যা হয়েছে। Page Reload করে আবার চেষ্টা করুন।' && reported.length === 1 && !v.disabled, { v, errors: page.errors });
  page.errors.length = 0;

  await page.open(`${base}?offline=1`);
  await fill(valid);
  await submit(200);
  v = await view();
  check('Network বিচ্ছিন্ন (?offline=1): বোধগম্য বার্তা, Button চালু, ইতিহাস ফাঁকা',
    v.status === 'Server-এর সঙ্গে যোগাযোগ করা যায়নি। একটু পরে আবার চেষ্টা করুন।' && !v.disabled && v.history.length === 0, v);

  collectProblems();
  check('পুরো পরীক্ষায় কোনো ধরা না পড়া Exception বা console.error নেই (Network-এর সতর্কতা console.warn-এ)', problems.length === 0, problems);
} finally {
  await page.close();
}

console.log(`Browser: ${page.version}`);
results.forEach((r, i) => console.log(`${r.ok ? 'ok' : 'not ok'} ${i + 1} - ${r.name}${r.ok ? '' : `\n  # ${r.detail}`}`));
const failed = results.filter((r) => !r.ok).length;
console.log(`# tests ${results.length}\n# pass ${results.length - failed}\n# fail ${failed}`);
process.exit(failed ? 1 : 0);
