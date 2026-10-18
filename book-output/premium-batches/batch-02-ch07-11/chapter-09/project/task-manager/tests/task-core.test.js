// Task Manager-এর তথ্যের নিয়মের Automated Test।  চালানোর Command (Project Folder থেকে):  node --test
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const loadScript = require('./load-script.js');

const { fn, get } = loadScript(path.join(__dirname, '..', 'task-core.js'));
const { checkTitle, addTask, renameTask, visibleTasks, countTasks, parseStored } = fn;
const toggleTask = get('toggleTask');
const deleteTask = get('deleteTask');
const clearDone = get('clearDone');
const json = v => JSON.stringify(v);
const base = () => [
  { id: '1', title: 'বাজার করা', done: false },
  { id: '2', title: 'বই পড়া', done: true },
  { id: '3', title: 'Email পাঠানো', done: false },
];

test('checkTitle: ফাঁকা, শুধু ফাঁকা জায়গা, null বাতিল', () => {
  for (const bad of ['', '   ', null, undefined]) assert.equal(checkTitle(bad), 'Task-এর একটি নাম লিখুন।');
});

test('checkTitle: ঠিক 120 অক্ষর চলে, 121 চলে না; trim-এর পরে গোনা', () => {
  assert.equal(checkTitle('a'.repeat(120)), null);
  assert.equal(checkTitle(`  ${'a'.repeat(120)}  `), null);
  assert.equal(checkTitle('a'.repeat(121)), 'নাম 120 অক্ষরের বেশি হতে পারবে না।');
});

test('addTask: trim করা নাম, done false, id লেখা হিসেবে; মূল তালিকা অপরিবর্তিত', () => {
  const tasks = base();
  const result = addTask(tasks, '  দুধ কেনা ', 4);
  assert.equal(result.error, null);
  assert.equal(json(result.tasks[3]), json({ id: '4', title: 'দুধ কেনা', done: false }));
  assert.equal(tasks.length, 3);
});

test('addTask: ভুল নামে একই তালিকা এবং বার্তা', () => {
  const tasks = base();
  const result = addTask(tasks, ' ', 9);
  assert.equal(result.tasks, tasks);
  assert.equal(result.error, 'Task-এর একটি নাম লিখুন।');
});

test('renameTask: শুধু মিলে যাওয়া Task-এর নাম বদলায়', () => {
  const result = renameTask(base(), '2', ' উপন্যাস পড়া ');
  assert.equal(result.error, null);
  assert.equal(result.tasks.map(t => t.title).join('|'), 'বাজার করা|উপন্যাস পড়া|Email পাঠানো');
  assert.equal(result.tasks[1].done, true);
});

test('renameTask: ফাঁকা নামে বাতিল; অচেনা id-তে তালিকা একই রকম', () => {
  const tasks = base();
  assert.equal(renameTask(tasks, '1', '').tasks, tasks);
  assert.equal(json(renameTask(tasks, 'x', 'নতুন').tasks), json(tasks));
});

test('toggleTask: অবস্থা উল্টায়, অন্য Task-এর Object একই থাকে', () => {
  const tasks = base();
  const next = toggleTask(tasks, '1');
  assert.equal(next[0].done, true);
  assert.equal(tasks[0].done, false);
  assert.equal(next[1], tasks[1]);
  assert.equal(toggleTask(next, '1')[0].done, false);
});

test('deleteTask ও clearDone', () => {
  assert.equal(deleteTask(base(), '2').map(t => t.id).join(','), '1,3');
  assert.equal(deleteTask(base(), 'x').length, 3);
  assert.equal(clearDone(base()).map(t => t.id).join(','), '1,3');
});

test('visibleTasks: all, active, done', () => {
  const ids = (filter) => visibleTasks(base(), filter).map(t => t.id).join(',');
  assert.equal(ids('all'), '1,2,3');
  assert.equal(ids('active'), '1,3');
  assert.equal(ids('done'), '2');
  assert.equal(visibleTasks(base()).length, 3);
});

test('visibleTasks: খোঁজা বড়-ছোট হাতের অক্ষর নির্বিশেষে, trim করে, ছাঁকনির সঙ্গে', () => {
  assert.equal(visibleTasks(base(), 'all', '  EMAIL ').map(t => t.id).join(','), '3');
  assert.equal(visibleTasks(base(), 'all', 'পড়া').map(t => t.id).join(','), '2');
  assert.equal(visibleTasks(base(), 'active', 'পড়া').length, 0);
});

test('countTasks', () => {
  assert.equal(json(countTasks(base())), json({ total: 3, active: 2, done: 1 }));
  assert.equal(json(countTasks([])), json({ total: 0, active: 0, done: 0 }));
});

test('parseStored: null এবং ফাঁকা Array', () => {
  assert.equal(json(parseStored(null)), '[]');
  assert.equal(json(parseStored('[]')), '[]');
});

test('parseStored: ভাঙা JSON বা Array নয় এমন মানে ফাঁকা তালিকা', () => {
  for (const raw of ['{broken', '{"a":1}', '42', '"text"', 'null']) assert.equal(json(parseStored(raw)), '[]', raw);
});

test('parseStored: ভুল গঠনের Task বাদ, সঠিকগুলো থাকে', () => {
  const raw = JSON.stringify([
    { id: '1', title: 'ঠিক আছে', done: false },
    { id: 2, title: 'id সংখ্যা', done: false },
    { id: '3', title: '', done: false },
    { id: '4', title: 'done নেই' },
    { id: '5', title: 'x'.repeat(121), done: true },
    null,
    { id: '6', title: 'এটিও ঠিক', done: true },
  ]);
  assert.equal(parseStored(raw).map(t => t.id).join(','), '1,6');
});

test('সংরক্ষণ ও ফিরিয়ে আনা: JSON-এর মধ্য দিয়ে তালিকা অপরিবর্তিত', () => {
  const tasks = toggleTask(addTask(base(), 'নতুন', 'n').tasks, 'n');
  assert.equal(json(parseStored(JSON.stringify(tasks))), json(tasks));
});

test('ক্ষতিকর লেখাও শুধু তথ্য: নাম যেমন ছিল তেমনই থাকে', () => {
  const title = '<img src="" onerror="alert(1)">';
  assert.equal(addTask([], title, 'x').tasks[0].title, title);
});
