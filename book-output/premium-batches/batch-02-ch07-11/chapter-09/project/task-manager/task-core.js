'use strict';

const TITLE_LIMIT = 120;

// নাম যাচাই: সমস্যা থাকলে বার্তা, না থাকলে null।
function checkTitle(text) {
  const title = String(text ?? '').trim();

  if (title === '') {
    return 'Task-এর একটি নাম লিখুন।';
  }
  if (title.length > TITLE_LIMIT) {
    return `নাম ${TITLE_LIMIT} অক্ষরের বেশি হতে পারবে না।`;
  }
  return null;
}

function addTask(tasks, text, id) {
  const error = checkTitle(text);

  if (error) {
    return { tasks, error };
  }

  const task = { id: String(id), title: text.trim(), done: false };
  return { tasks: [...tasks, task], error: null };
}

function renameTask(tasks, id, text) {
  const error = checkTitle(text);

  if (error) {
    return { tasks, error };
  }

  const next = tasks.map((task) =>
    task.id === id ? { ...task, title: text.trim() } : task);
  return { tasks: next, error: null };
}

const toggleTask = (tasks, id) =>
  tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task));

const deleteTask = (tasks, id) => tasks.filter((task) => task.id !== id);

const clearDone = (tasks) => tasks.filter((task) => !task.done);

function visibleTasks(tasks, filter = 'all', query = '') {
  const needle = query.trim().toLowerCase();

  return tasks.filter((task) => {
    const statusOk = filter === 'all' || (filter === 'done') === task.done;
    return statusOk && task.title.toLowerCase().includes(needle);
  });
}

function countTasks(tasks) {
  const done = tasks.filter((task) => task.done).length;
  return { total: tasks.length, active: tasks.length - done, done };
}

// localStorage-এর লেখা থেকে নিরাপদে Task-এর তালিকা; ভাঙা হলে ফাঁকা তালিকা।
function parseStored(raw) {
  try {
    const data = JSON.parse(raw ?? '[]');
    return Array.isArray(data) ? data.filter(isTask) : [];
  } catch {
    return [];
  }
}

function isTask(value) {
  return typeof value?.id === 'string' &&
    typeof value.title === 'string' &&
    checkTitle(value.title) === null &&
    typeof value.done === 'boolean';
}
