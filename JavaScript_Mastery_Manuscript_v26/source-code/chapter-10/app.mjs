import { fetchUsers, filterUsers, sortUsers } from './directory-core.mjs';
const form = document.querySelector('#controls');
const search = document.querySelector('#search');
const sort = document.querySelector('#sort');
const reload = document.querySelector('#reload');
const list = document.querySelector('#users');
const status = document.querySelector('#status');
let users = [];
let controller;
let requestNumber = 0;
function render() {
  const filtered = sortUsers(filterUsers(users, search.value), sort.value);
  list.replaceChildren();
  for (const user of filtered) {
    const li = document.createElement('li');
    const h = document.createElement('h2'); h.textContent = user.name;
    const meta = document.createElement('p'); meta.textContent = `${user.email} • ${user.city}`;
    li.append(h, meta); list.append(li);
  }
  if (users.length) status.textContent = `${filtered.length} of ${users.length} users shown`;
}
async function loadUsers() {
  controller?.abort();
  controller = new AbortController();
  const currentRequest = ++requestNumber;
  reload.disabled = true;
  status.textContent = 'Loading users…';
  try {
    users = await fetchUsers({ signal: controller.signal });
    if (currentRequest === requestNumber) render();
  } catch (error) {
    if (currentRequest !== requestNumber || error.name === 'AbortError') return;
    users = []; list.replaceChildren();
    status.textContent = 'Could not load users. Check connection and retry.';
    console.error(error);
  } finally {
    if (currentRequest === requestNumber) reload.disabled = false;
  }
}
form.addEventListener('input', render);
form.addEventListener('change', render);
reload.addEventListener('click', loadUsers);
loadUsers();
