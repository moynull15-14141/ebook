'use strict';

const USERS_URL = 'https://jsonplaceholder.typicode.com/users';
const SORT_KEYS = ['name', 'email', 'city'];

// API-র একটি User থেকে Page-এর প্রয়োজনীয় অংশ; ভুল গঠনে null।
function normalizeUser(raw) {
  if (!Number.isInteger(raw?.id) || typeof raw.name !== 'string') {
    return null;
  }

  return {
    id: raw.id,
    name: raw.name.trim(),
    email: typeof raw.email === 'string' ? raw.email.trim() : '',
    city: typeof raw.address?.city === 'string' ? raw.address.city : 'অজানা',
  };
}

function filterUsers(users, query = '') {
  const needle = query.trim().toLowerCase();

  return users.filter((user) =>
    [user.name, user.email, user.city].some((text) =>
      text.toLowerCase().includes(needle)));
}

function sortUsers(users, key = 'name') {
  const field = SORT_KEYS.includes(key) ? key : 'name';
  return [...users].sort((a, b) => a[field].localeCompare(b[field]));
}

// ms মিলিসেকেন্ড অপেক্ষা; signal বাতিল হলে সঙ্গে সঙ্গে rejected।
function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });
}

// একবার চেষ্টা: সময়সীমা, বাতিল এবং HTTP ত্রুটি সামলায়।
async function fetchJson(url, options = {}) {
  const { fetchImpl = fetch, signal, timeoutMs = 5000 } = options;
  const timeout = AbortSignal.timeout(timeoutMs);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const headers = { Accept: 'application/json' };
  const response = await fetchImpl(url, { signal: combined, headers });

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

// সাময়িক ত্রুটি: Network বিচ্ছিন্ন, সময়সীমা পার, অথবা Server-এর 5xx।
const isTemporary = (error) =>
  error.name === 'TypeError' || error.name === 'TimeoutError' ||
  error.status >= 500;

async function fetchWithRetry(url, options = {}) {
  const { retries = 2, backoffMs = 300, signal } = options;

  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fetchJson(url, options);
    } catch (error) {
      if (attempt >= retries || signal?.aborted || !isTemporary(error)) {
        throw error;
      }
      await wait(backoffMs * 2 ** attempt, signal);
    }
  }
}

async function loadUsers(options = {}) {
  const data = await fetchWithRetry(options.url ?? USERS_URL, options);

  if (!Array.isArray(data)) {
    throw new Error('Server থেকে অপ্রত্যাশিত তথ্য এসেছে।');
  }
  return data.map(normalizeUser).filter(Boolean);
}

// প্রযুক্তিগত ত্রুটি থেকে ব্যবহারকারীর ভাষায় বার্তা।
function errorMessage(error) {
  if (error.name === 'TimeoutError') {
    return 'Server সাড়া দিতে দেরি করছে। একটু পরে আবার চেষ্টা করুন।';
  }
  if (error.status >= 500) {
    return 'Server-এ সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।';
  }
  if (error.status === 404) {
    return 'তথ্যের ঠিকানা পাওয়া যায়নি।';
  }
  if (error.name === 'TypeError') {
    return 'Network-এ সংযোগ নেই। সংযোগ দেখে আবার চেষ্টা করুন।';
  }
  return 'তথ্য আনা যায়নি। আবার চেষ্টা করুন।';
}
