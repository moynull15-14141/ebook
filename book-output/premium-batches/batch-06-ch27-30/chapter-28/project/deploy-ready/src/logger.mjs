// Structured Log: প্রতি Line একটি JSON Object, যাতে Log-ব্যবস্থা খুঁজতে
// ও গুনতে পারে। গোপন Key-গুলোর মান কখনো লেখা হয় না।
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const SECRET = /authorization|password|token|secret|cookie/i;

function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, inner]) =>
    [key, SECRET.test(key) ? '[REDACTED]' : redact(inner)]));
}

export function createLogger({ level = 'info', base = {},
  write = (line) => process.stdout.write(`${line}\n`),
  now = () => new Date() } = {}) {
  const min = LEVELS[level];
  const log = (lvl) => (event, fields = {}) => {
    if (LEVELS[lvl] < min) return;
    write(JSON.stringify({ time: now().toISOString(), level: lvl, event,
      ...redact(base), ...redact(fields) }));
  };
  return {
    debug: log('debug'), info: log('info'),
    warn: log('warn'), error: log('error'),
    child: (fields) => createLogger({ level, write, now,
      base: { ...base, ...fields } }),
  };
}
