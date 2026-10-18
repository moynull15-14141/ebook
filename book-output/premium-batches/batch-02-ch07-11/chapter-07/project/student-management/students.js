'use strict';

const PASS_MARK = 33;
const GRADES = [
  { min: 80, grade: 'A+' },
  { min: 70, grade: 'A' },
  { min: 60, grade: 'A-' },
  { min: 50, grade: 'B' },
  { min: 40, grade: 'C' },
  { min: 33, grade: 'D' },
  { min: 0, grade: 'F' },
];

// নম্বর থেকে Grade।
function gradeFor(marks) {
  const { grade } = GRADES.find((row) => marks >= row.min);
  return grade;
}

// নতুন শিক্ষার্থীর তথ্য যাচাই করে; সমস্যা থাকলে বার্তা, না থাকলে null।
function validateStudent(input, students) {
  const id = String(input.id ?? '').trim();
  const name = String(input.name ?? '').trim();
  const marks = input.marks;

  if (id === '') {
    return 'ID দিতে হবে।';
  }

  if (name.length < 2) {
    return 'নাম কমপক্ষে ২ অক্ষরের হতে হবে।';
  }

  if (!Number.isInteger(marks) || marks < 0 || marks > 100) {
    return 'নম্বর ০ থেকে ১০০-এর মধ্যে পূর্ণসংখ্যা হতে হবে।';
  }

  if (students.find((student) => student.id === id) !== undefined) {
    return `ID ${id} আগে থেকেই আছে।`;
  }

  return null;
}

// যাচাই করে যোগ করে। ফেরত দেয় { students, error }।
function addStudent(students, input) {
  const error = validateStudent(input, students);

  if (error !== null) {
    return { students, error };
  }

  const student = {
    id: input.id.trim(),
    name: input.name.trim(),
    marks: input.marks,
    contact: input.contact ?? null,
  };

  return { students: [...students, student], error: null };
}

// একজনের নম্বর বদলে নতুন Array; বাকিরা অপরিবর্তিত।
function updateMarks(students, id, marks) {
  return students.map((student) =>
    student.id === id ? { ...student, marks } : student,
  );
}

// নির্দিষ্ট ID বাদ দিয়ে নতুন Array।
const removeStudent = (students, id) =>
  students.filter((student) => student.id !== id);

// নাম বা ID-তে খোঁজে; বড়-ছোট হাতের অক্ষর নির্বিশেষে।
function searchStudents(students, query) {
  const text = query.trim().toLowerCase();

  return students.filter(({ id, name }) =>
    id.toLowerCase().includes(text) || name.toLowerCase().includes(text),
  );
}

// মোট, গড়, উত্তীর্ণ এবং সর্বোচ্চ নম্বরধারীর নাম।
function summarize(students) {
  const total = students.length;

  if (total === 0) {
    return { total, average: 0, passed: 0, topper: null };
  }

  const sum = students.reduce((acc, { marks }) => acc + marks, 0);
  const passed = students.filter(({ marks }) => marks >= PASS_MARK).length;
  const best = students.reduce(
    (top, student) => (student.marks > top.marks ? student : top),
    students[0],
  );
  const average = Math.round((sum / total) * 10) / 10;

  return { total, average, passed, topper: best.name };
}

// একজন শিক্ষার্থীর এক লাইনের বিবরণ।
function formatStudent({ id, name, marks, contact }) {
  const phone = contact?.phone ?? 'নেই';
  return `${id} ${name}: ${marks} (${gradeFor(marks)}), ফোন: ${phone}`;
}

let students = [];
const inputs = [
  {
    id: 'S1',
    name: 'Sara Ahmed',
    marks: 88,
    contact: { phone: '01700-000001' },
  },
  { id: 'S2', name: 'Rafi', marks: 28 },
  {
    id: 'S3',
    name: 'Mina Das',
    marks: 74,
    contact: { phone: '01700-000003' },
  },
  { id: 'S2', name: 'Another Rafi', marks: 50 },
  { id: 'S4', name: 'N', marks: 60 },
];

for (const input of inputs) {
  const result = addStudent(students, input);
  students = result.students;

  if (result.error !== null) {
    console.log(`বাতিল: ${result.error}`);
  }
}

students = updateMarks(students, 'S2', 35);

for (const student of students) {
  console.log(formatStudent(student));
}

const { total, average, passed, topper } = summarize(students);
console.log(`মোট ${total} জন, গড় ${average}, উত্তীর্ণ ${passed} জন, সর্বোচ্চ: ${topper}`);
console.log(searchStudents(students, 'MINA').map(({ name }) => name).join(', '));
