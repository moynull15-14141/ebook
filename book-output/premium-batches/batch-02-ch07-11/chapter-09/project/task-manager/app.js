'use strict';

const STORAGE_KEY = 'jsm-ch09-tasks';

const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const list = document.querySelector('#task-list');
const notice = document.querySelector('#notice');
const summary = document.querySelector('#summary');
const search = document.querySelector('#search');
const filter = document.querySelector('#filter');
const empty = document.querySelector('#empty');

let tasks = parseStored(readStorage());
let editingId = null;

function readStorage() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    notice.textContent = 'সংরক্ষণ করা যায়নি; Page বন্ধ করলে পরিবর্তন হারাবে।';
  }
}

// প্রতিটি পরিবর্তন এই পথে: State বদলানো, সংরক্ষণ, নতুন করে আঁকা।
function update(next, message = '') {
  tasks = next;
  notice.textContent = message;
  save();
  render();
}

function render() {
  const shown = visibleTasks(tasks, filter.value, search.value);
  const count = countTasks(tasks);

  summary.textContent =
    `মোট ${count.total} · বাকি ${count.active} · সম্পন্ন ${count.done}`;
  empty.hidden = shown.length > 0;
  list.replaceChildren(...shown.map(taskRow));
}

function taskRow(task) {
  const row = document.createElement('li');
  row.dataset.id = task.id;
  row.classList.toggle('done', task.done);

  if (task.id === editingId) {
    const field = document.createElement('input');
    field.className = 'edit-input';
    field.value = task.title;
    field.setAttribute('aria-label', 'Task-এর নতুন নাম');
    row.append(field, button('সংরক্ষণ', 'save'), button('বাতিল', 'cancel'));
    return row;
  }

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.checked = task.done;
  check.dataset.action = 'toggle';
  check.setAttribute('aria-label', `সম্পন্ন: ${task.title}`);

  const title = document.createElement('span');
  title.className = 'title';
  title.textContent = task.title;

  row.append(check, title, button('বদলান', 'edit'), button('মুছুন', 'delete'));
  return row;
}

function button(label, action) {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = label;
  element.dataset.action = action;
  return element;
}

const newId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const result = addTask(tasks, input.value, newId());

  if (result.error) {
    notice.textContent = result.error;
    input.focus();
    return;
  }

  form.reset();
  update(result.tasks, 'Task যোগ হয়েছে।');
});

function saveEdit(id) {
  const field = list.querySelector('.edit-input');
  const result = renameTask(tasks, id, field.value);

  if (result.error) {
    notice.textContent = result.error;
    field.focus();
    return;
  }

  editingId = null;
  update(result.tasks, 'নাম বদলানো হয়েছে।');
}

function startEdit(id) {
  editingId = id;
  render();
  list.querySelector('.edit-input').focus();
}

function cancelEdit() {
  editingId = null;
  render();
}

// Event Delegation: তালিকার একটি Listener সব সারির সব Button সামলায়।
list.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');

  if (!target) {
    return;
  }

  const id = target.closest('li').dataset.id;
  const action = target.dataset.action;

  if (action === 'toggle') update(toggleTask(tasks, id));
  if (action === 'delete') update(deleteTask(tasks, id), 'Task মুছে ফেলা হয়েছে।');
  if (action === 'edit') startEdit(id);
  if (action === 'save') saveEdit(id);
  if (action === 'cancel') cancelEdit();
});

list.addEventListener('keydown', (event) => {
  if (!event.target.matches('.edit-input')) {
    return;
  }
  if (event.key === 'Enter') saveEdit(event.target.closest('li').dataset.id);
  if (event.key === 'Escape') cancelEdit();
});

search.addEventListener('input', render);
filter.addEventListener('change', render);
document.querySelector('#clear-done').addEventListener('click', () =>
  update(clearDone(tasks), 'সম্পন্ন Task সরানো হয়েছে।'));

render();
