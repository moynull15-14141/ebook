// User Directory API Explorer-এর Browser Test: Local Server চালিয়ে আসল (Headless) Chrome বা Edge-এ Page খোলে,
// এবং Server-এর সাড়া নিয়ন্ত্রণ করে Loading, সফলতা, Retry, ত্রুটি, সময়সীমা, Race Condition ও নিরাপত্তা যাচাই করে।
// চালানোর Command (Project Folder থেকে):  node tests/browser-check.mjs
// প্রয়োজন: Node.js 22+ এবং Chrome বা Edge। Internet বা Public API লাগে না।
import { createRequire } from 'node:module';
import { openBrowser } from './cdp.mjs';

const require = createRequire(import.meta.url);
const { startServer } = require('./mock-server.js');

const server = await startServer();
const page = await openBrowser();
const pageUrl = `${server.url}/index.html?api=/api/users&timeout=400`;
const results = [];
const problems = [];

const view = () => page.eval(`(() => ({
  names: [...document.querySelectorAll('#users h2')].map((e) => e.textContent),
  status: document.querySelector('#status').textContent,
  busy: document.querySelector('#users').getAttribute('aria-busy'),
  imgs: document.querySelectorAll('#users img').length,
}))()`);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function check(name, ok, detail) { results.push({ name, ok, detail: JSON.stringify(detail) }); }
// Server-এর 4xx/5xx সাড়ায় Chrome "Failed to load resource" লেখে; এগুলো প্রত্যাশিত। বাকি সব Error সমস্যা।
function collectProblems() {
  problems.push(...page.errors.filter((e) => !e.startsWith('Failed to load resource')));
  page.errors.length = 0;
}
async function setControl(selector, value, eventName) {
  await page.eval(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); e.value = ${JSON.stringify(value)}; e.dispatchEvent(new Event(${JSON.stringify(eventName)})); })()`);
}

try {
  server.reply({ delayMs: 300 });
  await page.open(pageUrl);
  await page.sleep(100);
  let v = await view();
  check('Loading: সাড়া আসার আগে "লোড হচ্ছে..." এবং aria-busy="true"', v.status === 'লোড হচ্ছে...' && v.busy === 'true', v);

  await page.sleep(500);
  v = await view();
  check('সফল: তিনজন User, সংখ্যার বার্তা, aria-busy="false"',
    same(v.names, ['Mina Das', 'Rafi Khan', 'Sara Ahmed']) && v.status === '3 জনের মধ্যে 3 জন দেখানো হচ্ছে।' && v.busy === 'false', v);

  const hitsBefore = server.state.hits;
  await setControl('#search', 'bogura', 'input');
  v = await view();
  const searched = v;
  await setControl('#search', '', 'input');
  await setControl('#sort', 'city', 'change');
  v = await view();
  check('খোঁজা ও সাজানো: শহর দিয়ে খোঁজা, শহর অনুযায়ী সাজানো; Server-এ নতুন Request যায় না',
    same(searched.names, ['Rafi Khan']) && searched.status === '3 জনের মধ্যে 1 জন দেখানো হচ্ছে।' &&
    same(v.names, ['Rafi Khan', 'Sara Ahmed', 'Mina Das']) && server.state.hits === hitsBefore, { searched, v });
  await setControl('#sort', 'name', 'change');

  server.reply({ status: 503 }, { status: 503 });
  let before = server.state.hits;
  await page.click('#reload');
  await page.sleep(1500);
  v = await view();
  check('Retry: দুবার 503-এর পর তৃতীয় চেষ্টায় সফল (মোট ৩টি Request)', v.names.length === 3 && server.state.hits - before === 3, { v, hits: server.state.hits - before });

  server.reply({ status: 404 });
  before = server.state.hits;
  await page.click('#reload');
  await page.sleep(500);
  v = await view();
  check('404: সঙ্গে সঙ্গে বার্তা, আবার চেষ্টা নয়, পুরোনো তালিকা মুছে যায়',
    v.status === 'তথ্যের ঠিকানা পাওয়া যায়নি।' && v.names.length === 0 && server.state.hits - before === 1 && v.busy === 'false',
    { v, hits: server.state.hits - before });

  await page.click('#reload');
  await page.sleep(300);
  v = await view();
  check('ত্রুটির পর "আবার লোড করুন": তালিকা ফিরে আসে', v.names.length === 3 && v.status === '3 জনের মধ্যে 3 জন দেখানো হচ্ছে।', v);

  server.reply({ delayMs: 3000 }, { delayMs: 3000 }, { delayMs: 3000 });
  before = server.state.hits;
  await page.click('#reload');
  await page.sleep(2700);
  v = await view();
  check('সময়সীমা: Server সাড়া না দিলে তিনবার চেষ্টার পর দেরির বার্তা',
    v.status === 'Server সাড়া দিতে দেরি করছে। একটু পরে আবার চেষ্টা করুন।' && server.state.hits - before === 3, { v, hits: server.state.hits - before });

  server.reply({ body: '{oops' }, { body: { users: [] } });
  await page.click('#reload');
  await page.sleep(300);
  const broken = await view();
  await page.click('#reload');
  await page.sleep(300);
  v = await view();
  check('ভাঙা JSON এবং অপ্রত্যাশিত গঠন: সাধারণ বার্তা, Page চালু থাকে',
    broken.status === 'তথ্য আনা যায়নি। আবার চেষ্টা করুন।' && v.status === 'তথ্য আনা যায়নি। আবার চেষ্টা করুন।' && v.names.length === 0, { broken, v });

  server.reply(
    { delayMs: 350, body: [{ id: 1, name: 'পুরোনো সাড়া', email: 'old@example.com', address: { city: 'Dhaka' } }] },
    { delayMs: 50, body: [{ id: 2, name: 'নতুন সাড়া', email: 'new@example.com', address: { city: 'Dhaka' } }] },
  );
  await page.click('#reload');
  await page.sleep(40);
  await page.click('#reload');
  await page.sleep(700);
  v = await view();
  check('Race Condition: Loading চলাকালীন আবার Click; দেরিতে আসা পুরোনো সাড়া পর্দায় বসে না',
    same(v.names, ['নতুন সাড়া']) && v.status === '1 জনের মধ্যে 1 জন দেখানো হচ্ছে।' && v.busy === 'false', v);

  const evil = '<img src="" onerror="window.__xss = 1">';
  server.reply({ body: [{ id: 9, name: evil, email: 'x@example.com', address: { city: '<b>Dhaka</b>' } }] });
  await page.click('#reload');
  await page.sleep(300);
  v = await view();
  const ran = await page.eval('window.__xss === 1');
  check('নিরাপত্তা: Server-এর ক্ষতিকর নাম লেখা হিসেবে দেখায়; কোনো Element তৈরি হয় না, Code চলে না',
    same(v.names, [evil]) && v.imgs === 0 && !ran, { v, ran });

  server.reply({ status: 200, body: [] });
  await page.click('#reload');
  await page.sleep(300);
  v = await view();
  check('ফাঁকা তালিকা: "কোনো User পাওয়া যায়নি।"', v.status === 'কোনো User পাওয়া যায়নি।' && v.names.length === 0, v);

  collectProblems();
  check('পুরো পরীক্ষায় কোনো ধরা না পড়া Exception বা console.error নেই', problems.length === 0, problems);
} finally {
  await page.close();
  await server.close();
}

console.log(`Browser: ${page.version}`);
results.forEach((r, i) => console.log(`${r.ok ? 'ok' : 'not ok'} ${i + 1} - ${r.name}${r.ok ? '' : `\n  # ${r.detail}`}`));
const failed = results.filter((r) => !r.ok).length;
console.log(`# tests ${results.length}\n# pass ${results.length - failed}\n# fail ${failed}`);
process.exit(failed ? 1 : 0);
