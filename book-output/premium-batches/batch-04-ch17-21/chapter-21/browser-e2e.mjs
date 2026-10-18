// VisaFlow UI-র আসল Chrome-এ End-to-end যাচাই। Project Folder একটি স্থানীয়
// Static Server (127.0.0.1) থেকে দেওয়া হয়; বাইরের কোনো Service নেই।
// Usage (chapter-21 Folder থেকে): node browser-e2e.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { openBrowser } from '../tools/cdp.mjs';

const root = path.resolve(import.meta.dirname, 'project/visa-flow');
const TYPES = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (pathname === '/favicon.ico') { res.writeHead(204); res.end(); return; }
  const file = path.join(root, pathname === '/' ? 'index.html' : pathname);
  if (!file.startsWith(root) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/`;

const page = await openBrowser({ fileAccess: false });
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok, detail });
const text = (sel) => page.eval(`document.querySelector(${JSON.stringify(sel)}).textContent`);
const rows = () => page.eval("[...document.querySelectorAll('#applications li span')].map((s) => s.textContent)");
const setValue = (sel, value) => page.eval(`document.querySelector(${JSON.stringify(sel)}).value = ${JSON.stringify(value)}`);

try {
  await page.open(url);
  check('empty state', (await text('#summary')).startsWith('কোনো আবেদন নেই'), await text('#summary'));

  await page.type('#applicant', 'Rafi Ahmed');
  await page.click('#create');
  await page.sleep(400);
  let list = await rows();
  check('create through the form', list.length === 1 && list[0] === 'VF-001 · Rafi Ahmed · Thailand tourist · ৳3000 · draft', list[0]);
  check('Observer: console subscriber ran', page.logs.includes('নতুন VF-001 ৳3000'), page.logs.join(' | '));

  await setValue('#applicant', 'R');
  await page.click('#create');
  await page.sleep(300);
  check('domain validation message shown', (await text('#message')) === 'আবেদনকারীর নাম ২-৬০ অক্ষর', await text('#message'));

  await setValue('#applicant', '<b>Mina</b>');
  await setValue('#visa-type', 'student');
  await setValue('#travelers', '2');
  await page.click('#create');
  await page.sleep(300);
  check('per-strategy traveller limit', (await text('#message')) === 'Student Visa-য় সর্বোচ্চ 1 জন যাত্রী', await text('#message'));

  await setValue('#travelers', '1');
  await page.click('#express');
  await page.click('#create');
  await page.sleep(300);
  list = await rows();
  const bold = await page.eval("document.querySelectorAll('#applications b').length");
  check('express decorator fee and text-only rendering',
    list[1] === 'VF-002 · <b>Mina</b> · Thailand student · ৳3500 · draft' && bold === 0, `${list[1]} (b=${bold})`);

  const buttons = () => page.eval("[...document.querySelectorAll('li[data-id=\"VF-001\"] button')].map((b) => b.className).join(',')");
  check('buttons come from the state machine (draft)', (await buttons()) === 'act-submit,act-withdraw', await buttons());
  await page.click('li[data-id="VF-001"] .act-submit');
  await page.sleep(300);
  check('buttons after submit', (await buttons()) === 'act-requestDocuments,act-approve,act-reject,act-withdraw', await buttons());
  await page.click('li[data-id="VF-001"] .act-approve');
  await page.sleep(300);
  check('final state has no buttons', (await buttons()) === '', await buttons());
  const summary = await text('#summary');
  check('summary', summary === 'approved 1, draft 1 · অনুমোদিত Fee ৳3000', summary);
  check('Observer: change logs', page.logs.includes('VF-001: draft থেকে submitted') && page.logs.includes('VF-001: submitted থেকে approved'), page.logs.join(' | '));

  await page.open(url);
  await page.sleep(300);
  list = await rows();
  check('data restored from localStorage after reload', list.length === 2 && list[0].endsWith('approved'), list.join(' | '));
  await setValue('#applicant', 'Sara Islam');
  await page.click('#create');
  await page.sleep(300);
  list = await rows();
  check('id sequence continues after reload', list[2]?.startsWith('VF-003 · Sara Islam'), list[2]);
  check('no browser errors', page.errors.length === 0, page.errors.join(' | '));
} finally {
  console.log(`Browser: ${page.version}; served ${url}`);
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  ${r.detail}`);
  await page.close();
  server.close();
}
const failed = results.filter((r) => !r.ok).length;
console.log(`${results.length - failed} of ${results.length} browser checks passed`);
process.exitCode = failed || results.length < 14 ? 1 : 0;
