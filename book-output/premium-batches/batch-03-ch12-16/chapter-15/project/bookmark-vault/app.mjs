import {
  addBookmark, allTags, BookmarkError, createBookmark, exportData,
  filterBookmarks, importData, removeBookmark, toggleFavorite,
} from './src/bookmarks.mjs';
import { createStore, STORAGE_KEY } from './src/storage.mjs';
import { filtersToSearch, readFilters } from './src/url-state.mjs';

const FORM_STORE_KEY = 'jsm-ch15-draft';
const store = createStore();
let bookmarks = store.load();
let filters = readFilters(location.search);

const $ = (selector) => document.querySelector(selector);
const form = $('#bookmark-form');
const list = $('#bookmarks');
const statusView = $('#status');
const search = $('#search');
const tagSelect = $('#tag');
const favoritesOnly = $('#favorites-only');

function setBookmarks(next, message) {
  bookmarks = next;
  const saved = store.save(bookmarks);
  statusView.textContent = saved
    ? message
    : 'সংরক্ষণ করা যায়নি; Page বন্ধ করলে পরিবর্তন হারাবে।';
  render();
}

// প্রত্যাশিত ত্রুটি (BookmarkError) বার্তা হয়; অন্য সব ত্রুটি ওপরে যায়।
function attempt(action) {
  try {
    action();
  } catch (error) {
    if (!(error instanceof BookmarkError)) {
      throw error;
    }
    statusView.textContent = error.message;
  }
}

function button(label, action) {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = label;
  element.dataset.action = action;
  return element;
}

function bookmarkRow(item) {
  const link = document.createElement('a');
  link.href = item.url;
  link.textContent = item.title;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  const tags = document.createElement('span');
  tags.className = 'tags';
  tags.textContent = item.tags.join(', ');

  const star = button('প্রিয়', 'favorite');
  star.setAttribute('aria-pressed', String(item.favorite));

  const row = document.createElement('li');
  row.dataset.id = item.id;
  row.append(link, tags, star, button('মুছুন', 'remove'));
  return row;
}

function renderTagOptions() {
  const tags = allTags(bookmarks);
  if (!tags.includes(filters.tag)) {
    filters = { ...filters, tag: '' };
  }
  tagSelect.replaceChildren(...['', ...tags].map((tag) => {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag === '' ? 'সব Tag' : tag;
    return option;
  }));
  tagSelect.value = filters.tag;
}

function render() {
  renderTagOptions();
  if (search.value !== filters.query) {
    search.value = filters.query;
  }
  favoritesOnly.checked = filters.favoritesOnly;

  const shown = filterBookmarks(bookmarks, filters);
  list.replaceChildren(...shown.map(bookmarkRow));
  $('#count').textContent = `${bookmarks.length}টির মধ্যে ${shown.length}টি দেখানো হচ্ছে`;
  const address = `${location.pathname}${filtersToSearch(filters)}`;
  history.replaceState(null, '', address);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  attempt(() => {
    const bookmark = createBookmark(Object.fromEntries(new FormData(form)));
    setBookmarks(addBookmark(bookmarks, bookmark), `যোগ হয়েছে: ${bookmark.title}`);
    form.reset();
    sessionStorage.removeItem(FORM_STORE_KEY);
  });
});

// খসড়া শুধু এই Tab-এর; Reload-এর পরও থাকে।
form.addEventListener('input', () => {
  const draft = Object.fromEntries(new FormData(form));
  sessionStorage.setItem(FORM_STORE_KEY, JSON.stringify(draft));
});

list.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  const id = event.target.closest('li')?.dataset.id;
  if (action === 'favorite') {
    setBookmarks(toggleFavorite(bookmarks, id), 'প্রিয় তালিকা বদলেছে।');
  }
  if (action === 'remove') {
    setBookmarks(removeBookmark(bookmarks, id), 'মুছে ফেলা হয়েছে।');
  }
});

const updateFilters = (change) => {
  filters = { ...filters, ...change };
  render();
};
search.addEventListener('input', () => updateFilters({ query: search.value }));
tagSelect.addEventListener('change', () =>
  updateFilters({ tag: tagSelect.value }));
favoritesOnly.addEventListener('change', () =>
  updateFilters({ favoritesOnly: favoritesOnly.checked }));

$('#export').addEventListener('click', () => {
  const blob = new Blob([exportData(bookmarks)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'bookmarks.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  statusView.textContent = `${bookmarks.length}টি Bookmark Export হয়েছে।`;
});

$('#import').addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) {
    return;
  }
  statusView.textContent = 'পড়া হচ্ছে...';
  try {
    const text = await file.text();
    const { list: next, added, skipped } = importData(text, bookmarks);
    setBookmarks(next, `Import: ${added}টি যোগ, ${skipped}টি বাদ।`);
  } catch (error) {
    if (!(error instanceof BookmarkError)) {
      throw error;
    }
    statusView.textContent = error.message;
  } finally {
    event.target.value = '';
  }
});

// অন্য Tab-এ তালিকা বদলালে এখানেও।
window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) {
    bookmarks = store.load();
    render();
    statusView.textContent = 'অন্য Tab-এ তালিকা বদলেছে।';
  }
});

try {
  const draft = JSON.parse(sessionStorage.getItem(FORM_STORE_KEY) ?? '{}');
  for (const [name, value] of Object.entries(draft)) {
    if (form.elements[name]) {
      form.elements[name].value = value;
    }
  }
} catch {
  sessionStorage.removeItem(FORM_STORE_KEY);
}
render();
