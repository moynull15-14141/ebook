const SENSITIVE = /pass|token|secret|cookie|authorization|csrf/i;

// Log-এ যাওয়ার আগে সংবেদনশীল Key-এর মান মুছে দেয় (Nested Object-সহ)।
export function redact(value) {
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  return Object.fromEntries(Object.entries(value).map(([key, inner]) =>
    [key, SENSITIVE.test(key) ? '[REDACTED]' : redact(inner)]));
}

export const createLogger = (write = console.log) => (event, details = {}) =>
  write(JSON.stringify({ event, ...redact(details) }));
