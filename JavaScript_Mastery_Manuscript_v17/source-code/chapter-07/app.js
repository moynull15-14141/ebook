"use strict";
const KEY = 'javascript-mastery-ch07-students-v1';
const form = document.querySelector('#student-form');
const fields = Object.fromEntries(['id','name','age','marks'].map(k => [k, document.getElementById(k)]));
const rows = document.querySelector('#rows');
const message = document.querySelector('#message');
let students = [];
let editingId = null;
try {
  const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
  if (Array.isArray(raw)) {
    for (const item of raw) {
      try { students = StudentStore.add(students, item); } catch { /* discard invalid saved record */ }
    }
  }
} catch { message.textContent = 'Saved data could not be read; starting with an empty list.'; }
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(students)); }
  catch { message.textContent = 'Saved in this tab only; browser storage is unavailable.'; }
}
function render() {
  const filtered = StudentStore.search(students, document.querySelector('#search').value);
  rows.replaceChildren();
  for (const student of filtered) {
    const tr = document.createElement('tr');
    for (const value of [student.id, student.name, student.age, student.marks, StudentStore.gradeFor(student.marks)]) {
      const td = document.createElement('td'); td.textContent = String(value); tr.append(td);
    }
    const actions = document.createElement('td');
    for (const [label, action, className] of [['Edit', 'edit', 'secondary'], ['Delete', 'delete', 'danger']]) {
      const button = document.createElement('button'); button.textContent = label; button.dataset.action = action;
      button.dataset.id = student.id; button.className = className; actions.append(button);
    }
    tr.append(actions); rows.append(tr);
  }
  const stats = StudentStore.summary(students);
  document.querySelector('#summary').textContent = `Students: ${stats.total} • Average: ${stats.average} • Passed: ${stats.passed} • Topper: ${stats.topper?.name ?? 'None'}`;
}
function resetEdit() { editingId = null; fields.id.disabled = false; form.reset(); document.querySelector('#save').textContent = 'Save student'; document.querySelector('#cancel').hidden = true; }
form.addEventListener('submit', event => {
  event.preventDefault();
  try {
    const input = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value]));
    students = editingId ? StudentStore.update(students, editingId, input) : StudentStore.add(students, input);
    message.textContent = editingId ? 'Student updated.' : 'Student added.';
    resetEdit(); persist(); render();
  } catch (error) { message.textContent = error.message; }
});
rows.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]'); if (!button) return;
  const student = students.find(s => s.id === button.dataset.id); if (!student) return;
  if (button.dataset.action === 'delete') {
    if (!confirm(`Delete ${student.name}?`)) return;
    students = StudentStore.remove(students, student.id); if (editingId === student.id) resetEdit(); persist(); render(); message.textContent = 'Student deleted.';
  } else {
    editingId = student.id;
    for (const [key, field] of Object.entries(fields)) field.value = student[key];
    fields.id.disabled = true; document.querySelector('#save').textContent = 'Update student'; document.querySelector('#cancel').hidden = false;
    fields.name.focus();
  }
});
document.querySelector('#cancel').addEventListener('click', resetEdit);
document.querySelector('#search').addEventListener('input', render);
render();
