// Task Manager-এর Browser Test: আসল (Headless) Chrome বা Edge-এ index.html খুলে লেখা, Click ও Key দিয়ে পরীক্ষা।
// চালানোর Command (Project Folder থেকে):  node tests/browser-check.mjs
// প্রয়োজন: Node.js 22+ এবং কম্পিউটারে Chrome বা Edge (অন্য জায়গায় থাকলে CHROME_PATH দিন)।
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openBrowser } from './cdp.mjs';

const url = pathToFileURL(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html')).href;
const page = await openBrowser();
const KEY = 'jsm-ch09-tasks';
const allErrors = [];
const results = [];

// Page-এর বর্তমান অবস্থা এক নজরে।
const view = () => page.eval(`(() => ({
  titles: [...document.querySelectorAll('#task-list li .title')].map((e) => e.textContent),
  rows: document.querySelectorAll('#task-list li').length,
  done: [...document.querySelectorAll('#task-list li')].map((li) => li.classList.contains('done')),
  summary: document.querySelector('#summary').textContent,
  notice: document.querySelector('#notice').textContent,
  emptyShown: !document.querySelector('#empty').hidden,
  input: document.querySelector('#task-input').value,
  focused: document.activeElement?.id || document.activeElement?.className || '',
}))()`);

const enter = () => page.key('Enter', 'Enter', 13, '\r');
const escape = () => page.key('Escape', 'Escape', 27);
async function typeInto(selector, text) {
  await page.eval(`document.querySelector(${JSON.stringify(selector)}).value = ''`);
  await page.type(selector, text);
}
async function addByEnter(text) { await typeInto('#task-input', text); await enter(); await page.sleep(50); }
async function choose(value) {
  await page.eval(`(() => { const s = document.querySelector('#filter'); s.value = ${JSON.stringify(value)}; s.dispatchEvent(new Event('change', { bubbles: true })); })()`);
}
async function open() { allErrors.push(...page.errors); await page.open(url); await page.sleep(80); }

function check(name, ok, detail = '') { results.push({ name, ok, detail }); }
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

try {
  await open();

  let v = await view();
  check('শুরুতে: ফাঁকা তালিকা, "কোনো Task নেই" দেখা যায়, সংখ্যা শূন্য',
    v.rows === 0 && v.emptyShown && v.summary === 'মোট 0 · বাকি 0 · সম্পন্ন 0', JSON.stringify(v));

  await page.click('#task-form button');
  await page.sleep(50);
  v = await view();
  check('ফাঁকা নামে Click: বার্তা দেখায়, কিছু যোগ হয় না, Focus Field-এ',
    v.rows === 0 && v.notice === 'Task-এর একটি নাম লিখুন।' && v.focused === 'task-input', JSON.stringify(v));

  await addByEnter('ক'.repeat(121));
  v = await view();
  check('১২১ অক্ষরের নাম Enter-এ: সীমার বার্তা, কিছু যোগ হয় না',
    v.rows === 0 && v.notice === 'নাম 120 অক্ষরের বেশি হতে পারবে না।', v.notice);

  await addByEnter('  বাজার করা  ');
  v = await view();
  check('Enter দিয়ে যোগ: নাম trim করা, Field খালি, সফলতার বার্তা, "কোনো Task নেই" লুকানো',
    same(v.titles, ['বাজার করা']) && v.input === '' && v.notice === 'Task যোগ হয়েছে।' && !v.emptyShown, JSON.stringify(v));

  await typeInto('#task-input', 'বই পড়া');
  await page.click('#task-form button');
  await page.sleep(50);
  const xss = '<img src="" onerror="window.__xss = 1">';
  await addByEnter(xss);
  v = await view();
  const xssState = await page.eval(`({ imgs: document.querySelectorAll('#task-list img').length, ran: window.__xss === 1 })`);
  check('Button দিয়ে যোগ এবং ক্ষতিকর নাম: লেখাটি হুবহু দেখায়, কোনো <img> তৈরি হয় না, Code চলে না',
    same(v.titles, ['বাজার করা', 'বই পড়া', xss]) && xssState.imgs === 0 && !xssState.ran, JSON.stringify({ v, xssState }));

  await page.click('#task-list li:nth-child(1) input[type=checkbox]');
  await page.sleep(50);
  v = await view();
  check('Checkbox: Task সম্পন্ন, done Class, সংখ্যা হালনাগাদ',
    same(v.done, [true, false, false]) && v.summary === 'মোট 3 · বাকি 2 · সম্পন্ন 1', JSON.stringify(v));

  await choose('done');
  const onlyDone = (await view()).titles;
  await choose('active');
  const onlyActive = (await view()).titles;
  await choose('all');
  check('ছাঁকনি: সম্পন্ন, বাকি, সব',
    same(onlyDone, ['বাজার করা']) && same(onlyActive, ['বই পড়া', xss]) && (await view()).rows === 3,
    JSON.stringify({ onlyDone, onlyActive }));

  await typeInto('#search', 'বই');
  const found = (await view()).titles;
  await typeInto('#search', 'নেই এমন');
  const none = await view();
  await page.eval(`(() => { const s = document.querySelector('#search'); s.value = ''; s.dispatchEvent(new Event('input')); })()`);
  check('খোঁজা: মিল দেখায়; কিছু না মিললে "কোনো Task নেই"; মুছলে সব ফেরত',
    same(found, ['বই পড়া']) && none.rows === 0 && none.emptyShown && (await view()).rows === 3, JSON.stringify({ found, none }));

  await page.click('#task-list li:nth-child(2) [data-action=edit]');
  await page.sleep(50);
  const editFocused = (await view()).focused === 'edit-input';
  await typeInto('.edit-input', 'উপন্যাস পড়া');
  await enter();
  await page.sleep(50);
  v = await view();
  check('নাম বদলানো: "বদলান" চাপলে Field-এ Focus, Enter-এ সংরক্ষণ',
    editFocused && same(v.titles, ['বাজার করা', 'উপন্যাস পড়া', xss]) && v.notice === 'নাম বদলানো হয়েছে।', JSON.stringify(v));

  await page.click('#task-list li:nth-child(2) [data-action=edit]');
  await typeInto('.edit-input', 'এটি সংরক্ষিত হবে না');
  await escape();
  await page.sleep(50);
  v = await view();
  check('Escape: নাম বদলানো বাতিল, আগের নাম থাকে', same(v.titles, ['বাজার করা', 'উপন্যাস পড়া', xss]), JSON.stringify(v.titles));

  await page.click('#task-list li:nth-child(2) [data-action=edit]');
  await typeInto('.edit-input', '   ');
  await page.click('#task-list [data-action=save]');
  await page.sleep(50);
  v = await view();
  const stillEditing = await page.eval(`document.querySelectorAll('.edit-input').length`);
  check('ফাঁকা নতুন নাম: বার্তা দেখায়, Field খোলা থাকে', v.notice === 'Task-এর একটি নাম লিখুন।' && stillEditing === 1, v.notice);
  await page.click('#task-list [data-action=cancel]');
  await page.sleep(50);

  await page.click('#task-list li:nth-child(3) [data-action=delete]');
  await page.sleep(50);
  v = await view();
  check('মোছা: সেই সারি সরে যায়, বার্তা দেখায়',
    same(v.titles, ['বাজার করা', 'উপন্যাস পড়া']) && v.notice === 'Task মুছে ফেলা হয়েছে।', JSON.stringify(v));

  const stored = JSON.parse(await page.eval(`localStorage.getItem(${JSON.stringify(KEY)})`));
  await open();
  v = await view();
  check('Reload: তালিকা ও সম্পন্ন অবস্থা ফিরে আসে',
    stored.length === 2 && same(v.titles, ['বাজার করা', 'উপন্যাস পড়া']) && same(v.done, [true, false]), JSON.stringify(v));

  await page.click('#clear-done');
  await page.sleep(50);
  v = await view();
  check('সম্পন্নগুলো সরানো: শুধু বাকি Task থাকে', same(v.titles, ['উপন্যাস পড়া']) && v.summary === 'মোট 1 · বাকি 1 · সম্পন্ন 0', JSON.stringify(v));

  await page.eval(`localStorage.setItem(${JSON.stringify(KEY)}, '{broken')`);
  await open();
  v = await view();
  const brokenErrors = page.errors.length;
  check('ভাঙা সংরক্ষিত তথ্য: Page Error ছাড়া ফাঁকা তালিকা নিয়ে চালু', v.rows === 0 && v.emptyShown && brokenErrors === 0, JSON.stringify({ v, errors: page.errors }));

  await page.eval(`localStorage.setItem(${JSON.stringify(KEY)}, JSON.stringify([{ id: 'a', title: 'ঠিক', done: false }, { id: 5 }]))`);
  await open();
  v = await view();
  check('আংশিক ভুল সংরক্ষিত তথ্য: সঠিক Task থাকে, ভুলটি বাদ', same(v.titles, ['ঠিক']), JSON.stringify(v.titles));

  await page.eval(`localStorage.removeItem(${JSON.stringify(KEY)})`);
  allErrors.push(...page.errors);
  check('পুরো পরীক্ষায় Console-এ কোনো Error বা ধরা না পড়া Exception নেই', allErrors.length === 0, allErrors.join(' | '));
} finally {
  await page.close();
}

console.log(`Browser: ${page.version}`);
results.forEach((r, i) => console.log(`${r.ok ? 'ok' : 'not ok'} ${i + 1} - ${r.name}${r.ok ? '' : `\n  # ${r.detail}`}`));
const failed = results.filter((r) => !r.ok).length;
console.log(`# tests ${results.length}\n# pass ${results.length - failed}\n# fail ${failed}`);
process.exit(failed ? 1 : 0);
