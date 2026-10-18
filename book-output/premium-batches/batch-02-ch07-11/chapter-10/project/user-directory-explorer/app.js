'use strict';

// ?api= ও ?timeout= শুধু পরীক্ষার জন্য; স্বাভাবিক ব্যবহারে আসল API।
const params = new URLSearchParams(location.search);
const API_URL = params.get('api') ?? USERS_URL;
const TIMEOUT_MS = Number(params.get('timeout') ?? 5000);

const search = document.querySelector('#search');
const sortSelect = document.querySelector('#sort');
const reloadButton = document.querySelector('#reload');
const statusView = document.querySelector('#status');
const list = document.querySelector('#users');

let users = [];
let controller = null;

function userCard(user) {
  const item = document.createElement('li');
  const name = document.createElement('h2');
  const details = document.createElement('p');

  name.textContent = user.name;
  details.textContent = `${user.email} · ${user.city}`;
  item.append(name, details);
  return item;
}

function render() {
  const shown = sortUsers(filterUsers(users, search.value), sortSelect.value);
  list.replaceChildren(...shown.map(userCard));
  statusView.textContent = users.length === 0
    ? 'কোনো User পাওয়া যায়নি।'
    : `${users.length} জনের মধ্যে ${shown.length} জন দেখানো হচ্ছে।`;
}

function showLoading(isLoading) {
  list.setAttribute('aria-busy', String(isLoading));
  if (isLoading) {
    statusView.textContent = 'লোড হচ্ছে...';
  }
}

async function refresh() {
  controller?.abort();
  const current = new AbortController();
  controller = current;
  showLoading(true);

  try {
    const loaded = await loadUsers({
      url: API_URL,
      signal: current.signal,
      timeoutMs: TIMEOUT_MS,
    });

    if (controller !== current) {
      return;
    }
    users = loaded;
    render();
  } catch (error) {
    if (controller !== current) {
      return;
    }
    users = [];
    list.replaceChildren();
    statusView.textContent = errorMessage(error);
    console.warn('User আনা যায়নি:', error);
  } finally {
    if (controller === current) {
      showLoading(false);
    }
  }
}

search.addEventListener('input', render);
sortSelect.addEventListener('change', render);
reloadButton.addEventListener('click', refresh);

refresh();
