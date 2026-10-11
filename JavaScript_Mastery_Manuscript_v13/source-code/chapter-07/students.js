"use strict";
// Pure data operations: browser and Node.js compatible.
const StudentStore = (() => {
  const grades = [ [80, 'A+'], [70, 'A'], [60, 'A-'], [50, 'B'], [40, 'C'], [33, 'D'], [0, 'F'] ];
  function normalizeName(value) { return String(value ?? '').trim().replace(/\s+/g, ' '); }
  function validateStudent(input, students = [], ignoreId = null) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('Student object required');
    const id = String(input.id ?? '').trim();
    const name = normalizeName(input.name);
    const age = Number(input.age);
    const marks = Number(input.marks);
    if (!/^[A-Za-z0-9_-]{2,20}$/.test(id)) throw new Error('ID must be 2–20 letters, numbers, _ or -');
    if (name.length < 2 || name.length > 80) throw new Error('Name must contain 2–80 characters');
    if (input.age === '' || input.age == null || !Number.isInteger(age) || age < 5 || age > 100) throw new Error('Age must be an integer from 5 to 100');
    if (input.marks === '' || input.marks == null || !Number.isFinite(marks) || marks < 0 || marks > 100) throw new Error('Marks must be 0–100');
    if (students.some(s => s.id === id && s.id !== ignoreId)) throw new Error('Student ID already exists');
    return { id, name, age, marks };
  }
  function gradeFor(marks) { return grades.find(([minimum]) => marks >= minimum)[1]; }
  function add(students, input) { return [...students, validateStudent(input, students)]; }
  function update(students, id, patch) {
    const old = students.find(s => s.id === id);
    if (!old) throw new Error('Student not found');
    if (patch.id !== undefined && String(patch.id).trim() !== id) throw new Error('ID cannot be changed');
    const next = validateStudent({ ...old, ...patch }, students, id);
    return students.map(s => s.id === id ? next : s);
  }
  function remove(students, id) { return students.filter(s => s.id !== id); }
  function search(students, query) {
    const q = String(query ?? '').trim().toLocaleLowerCase();
    return students.filter(s => s.name.toLocaleLowerCase().includes(q) || s.id.toLocaleLowerCase().includes(q));
  }
  function summary(students) {
    const total = students.length;
    const average = total ? students.reduce((sum, s) => sum + s.marks, 0) / total : 0;
    return { total, average: Math.round(average * 100) / 100, passed: students.filter(s => s.marks >= 33).length,
      topper: total ? [...students].sort((a, b) => b.marks - a.marks || a.name.localeCompare(b.name))[0] : null };
  }
  return { normalizeName, validateStudent, gradeFor, add, update, remove, search, summary };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = StudentStore;
