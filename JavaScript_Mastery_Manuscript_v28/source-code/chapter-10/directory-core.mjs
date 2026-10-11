/** Pure transformations for User Directory API Explorer. */
export function normalizeUser(user) {
  if (!user || typeof user !== 'object' || !Number.isInteger(user.id) || typeof user.name !== 'string') {
    throw new TypeError('Invalid user record');
  }
  return { id: user.id, name: user.name.trim(), email: typeof user.email === 'string' ? user.email.trim() : '', city: typeof user.address?.city === 'string' ? user.address.city : 'Unknown' };
}
export function filterUsers(users, query = '') {
  const needle = String(query).trim().toLocaleLowerCase();
  return users.filter(u => [u.name, u.email, u.city].some(s => s.toLocaleLowerCase().includes(needle)));
}
export function sortUsers(users, key = 'name') {
  const allowed = ['name', 'email', 'city'];
  if (!allowed.includes(key)) throw new RangeError('Unsupported sort key');
  return [...users].sort((a, b) => a[key].localeCompare(b[key], undefined, { sensitivity: 'base' }));
}
export function delay(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
    const timer = setTimeout(() => { cleanup(); resolve(); }, ms);
    const onAbort = () => { clearTimeout(timer); cleanup(); reject(signal.reason ?? new DOMException('Aborted', 'AbortError')); };
    const cleanup = () => signal?.removeEventListener('abort', onAbort);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
export async function fetchUsers({ fetchImpl = fetch, signal, url = 'https://jsonplaceholder.typicode.com/users' } = {}) {
  const response = await fetchImpl(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}: users unavailable`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new TypeError('Expected an array of users');
  return data.map(normalizeUser);
}
