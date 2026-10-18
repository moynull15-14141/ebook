// Student Management System-এর Automated Test।  চালানোর Command (Project Folder থেকে):  node --test
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const loadScript = require('./load-script.js');

const { fn, get, printed } = loadScript(path.join(__dirname, '..', 'students.js'));
const { gradeFor, validateStudent, addStudent, updateMarks, searchStudents, summarize, formatStudent } = fn;
const removeStudent = get('removeStudent');
const json = v => JSON.stringify(v);
const base = () => [
  { id: 'S1', name: 'Sara Ahmed', marks: 88, contact: { phone: '01700-000001' } },
  { id: 'S2', name: 'Rafi', marks: 28, contact: null },
];

test('gradeFor: প্রতিটি সীমা', () => {
  const pairs = [[100, 'A+'], [80, 'A+'], [79, 'A'], [70, 'A'], [60, 'A-'], [50, 'B'], [40, 'C'], [33, 'D'], [32, 'F'], [0, 'F']];
  for (const [m, g] of pairs) assert.equal(gradeFor(m), g, `marks ${m}`);
});
test('validateStudent: সঠিক তথ্যে null', () => assert.equal(validateStudent({ id: 'S9', name: 'Nila', marks: 60 }, base()), null));
test('validateStudent: ফাঁকা বা অনুপস্থিত ID', () => {
  assert.equal(validateStudent({ id: '  ', name: 'Nila', marks: 60 }, []), 'ID দিতে হবে।');
  assert.equal(validateStudent({ name: 'Nila', marks: 60 }, []), 'ID দিতে হবে।');
});
test('validateStudent: ছোট নাম', () => assert.equal(validateStudent({ id: 'S9', name: ' N ', marks: 60 }, []), 'নাম কমপক্ষে ২ অক্ষরের হতে হবে।'));
test('validateStudent: ভুল নম্বর (সীমার বাইরে, দশমিক, String)', () => {
  for (const marks of [-1, 101, 88.5, '88', undefined]) {
    assert.equal(validateStudent({ id: 'S9', name: 'Nila', marks }, []), 'নম্বর ০ থেকে ১০০-এর মধ্যে পূর্ণসংখ্যা হতে হবে।');
  }
});
test('validateStudent: একই ID', () => assert.equal(validateStudent({ id: 'S1', name: 'Nila', marks: 60 }, base()), 'ID S1 আগে থেকেই আছে।'));
test('addStudent: নতুন Array, মূলটি অক্ষত, ফাঁকা জায়গা বাদ', () => {
  const list = base();
  const { students, error } = addStudent(list, { id: ' S3 ', name: ' Mina ', marks: 74 });
  assert.equal(error, null);
  assert.equal(students.length, 3);
  assert.equal(list.length, 2);
  assert.equal(json(students[2]), json({ id: 'S3', name: 'Mina', marks: 74, contact: null }));
});
test('addStudent: সমস্যা থাকলে মূল তালিকাই ফেরত', () => {
  const list = base();
  const result = addStudent(list, { id: 'S1', name: 'Dup', marks: 50 });
  assert.equal(result.students, list);
  assert.equal(result.error, 'ID S1 আগে থেকেই আছে।');
});
test('updateMarks: শুধু একজনের নম্বর; মূল Object অক্ষত', () => {
  const list = base();
  const next = updateMarks(list, 'S2', 35);
  assert.equal(next[1].marks, 35);
  assert.equal(list[1].marks, 28);
  assert.equal(next[0], list[0]);
  assert.notEqual(next[1], list[1]);
});
test('removeStudent: নির্দিষ্ট ID বাদ, মূল তালিকা অক্ষত', () => {
  const list = base();
  assert.equal(json(removeStudent(list, 'S1').map(s => s.id)), '["S2"]');
  assert.equal(list.length, 2);
});
test('searchStudents: নাম ও ID-তে, বড়-ছোট হাতের অক্ষর নির্বিশেষে', () => {
  assert.equal(json(searchStudents(base(), 'SARA').map(s => s.id)), '["S1"]');
  assert.equal(json(searchStudents(base(), ' s2 ').map(s => s.id)), '["S2"]');
  assert.equal(searchStudents(base(), 'zzz').length, 0);
});
test('summarize: মোট, গড়, উত্তীর্ণ, সর্বোচ্চ', () => {
  assert.equal(json(summarize(base())), json({ total: 2, average: 58, passed: 1, topper: 'Sara Ahmed' }));
});
test('summarize: গড় এক দশমিক ঘরে', () => {
  const list = [{ marks: 88 }, { marks: 35 }, { marks: 74 }].map((m, i) => ({ id: `S${i}`, name: `N${i}`, ...m }));
  assert.equal(summarize(list).average, 65.7);
});
test('summarize: ফাঁকা তালিকা', () => assert.equal(json(summarize([])), json({ total: 0, average: 0, passed: 0, topper: null })));
test('formatStudent: ফোন থাকলে ও না থাকলে', () => {
  const [sara, rafi] = base();
  assert.equal(formatStudent(sara), 'S1 Sara Ahmed: 88 (A+), ফোন: 01700-000001');
  assert.equal(formatStudent(rafi), 'S2 Rafi: 28 (F), ফোন: নেই');
});
test('File চালালে দুটি বাতিল, তিনজনের লাইন ও সারসংক্ষেপ দেখায়', () => {
  assert.equal(printed.length, 7);
  assert.equal(printed[0], 'বাতিল: ID S2 আগে থেকেই আছে।');
  assert.equal(printed[5], 'মোট 3 জন, গড় 65.7, উত্তীর্ণ 3 জন, সর্বোচ্চ: Sara Ahmed');
  assert.equal(printed[6], 'Mina Das');
});
