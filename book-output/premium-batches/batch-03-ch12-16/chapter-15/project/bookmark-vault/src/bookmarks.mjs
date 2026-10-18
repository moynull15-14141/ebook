export const SCHEMA_VERSION = 1;
const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const MAX_TITLE = 100;

export class BookmarkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BookmarkError';
  }
}

// শুধু http/https; # অংশ বাদ; Host ছোট হাতের অক্ষরে (URL নিজে করে)।
export function normalizeUrl(text) {
  let url;
  try {
    url = new URL(String(text ?? '').trim());
  } catch {
    throw new BookmarkError('সঠিক একটি URL লিখুন (https://...)।');
  }
  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
    throw new BookmarkError(`"${url.protocol}" ধরনের URL গ্রহণযোগ্য নয়।`);
  }
  url.hash = '';
  return url.href;
}

export function parseTags(input) {
  const parts = Array.isArray(input) ? input : String(input ?? '').split(',');
  const tags = parts
    .map((tag) => String(tag).trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(tags)];
}

const defaults = { now: () => new Date(), makeId: () => crypto.randomUUID() };

export function createBookmark(input, { now, makeId } = defaults) {
  const title = String(input?.title ?? '').trim();
  if (title === '' || title.length > MAX_TITLE) {
    throw new BookmarkError(`শিরোনাম 1 থেকে ${MAX_TITLE} অক্ষরের হতে হবে।`);
  }
  return {
    id: makeId(),
    title,
    url: normalizeUrl(input.url),
    tags: parseTags(input.tags),
    favorite: false,
    createdAt: now().toISOString(),
  };
}

export function addBookmark(list, bookmark) {
  if (list.some((item) => item.url === bookmark.url)) {
    throw new BookmarkError('এই URL আগে থেকেই আছে।');
  }
  return [bookmark, ...list];
}

export const toggleFavorite = (list, id) =>
  list.map((item) =>
    (item.id === id ? { ...item, favorite: !item.favorite } : item));

export const removeBookmark = (list, id) => list.filter((item) => item.id !== id);

export function filterBookmarks(list, filters = {}) {
  const { query = '', tag = '', favoritesOnly = false } = filters;
  const needle = query.trim().toLowerCase();
  return list.filter((item) =>
    (!favoritesOnly || item.favorite) &&
    (tag === '' || item.tags.includes(tag)) &&
    `${item.title} ${item.url}`.toLowerCase().includes(needle));
}

export const allTags = (list) =>
  [...new Set(list.flatMap((item) => item.tags))].sort();

// বাইরে থেকে আসা Bookmark (Storage বা Import) যাচাই; ঠিক না হলে null।
export function reviveBookmark(raw) {
  const validShape = typeof raw?.id === 'string' && raw.id !== '' &&
    typeof raw.favorite === 'boolean' && !Number.isNaN(Date.parse(raw.createdAt));
  if (!validShape) {
    return null;
  }
  try {
    const clock = { now: () => new Date(raw.createdAt), makeId: () => raw.id };
    return { ...createBookmark(raw, clock), favorite: raw.favorite };
  } catch (error) {
    if (error instanceof BookmarkError) {
      return null;
    }
    throw error;
  }
}

export function parseStored(text) {
  try {
    const data = JSON.parse(text ?? '[]');
    return Array.isArray(data) ? data.map(reviveBookmark).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function exportData(list, now = new Date()) {
  const data = {
    version: SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    bookmarks: list,
  };
  return JSON.stringify(data, null, 2);
}

export function importData(text, existing) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new BookmarkError('File-টি সঠিক JSON নয়।');
  }
  if (data?.version !== SCHEMA_VERSION || !Array.isArray(data.bookmarks)) {
    throw new BookmarkError('অচেনা File-এর গঠন বা Version।');
  }

  let list = existing;
  let added = 0;
  for (const raw of data.bookmarks) {
    const bookmark = reviveBookmark(raw);
    const duplicate = bookmark && list.some((item) =>
      item.url === bookmark.url || item.id === bookmark.id);
    if (bookmark && !duplicate) {
      list = [...list, bookmark];
      added += 1;
    }
  }
  return { list, added, skipped: data.bookmarks.length - added };
}
