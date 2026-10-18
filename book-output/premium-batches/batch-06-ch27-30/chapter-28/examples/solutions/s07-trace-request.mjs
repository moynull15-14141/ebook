// একজন গ্রাহক বলছেন "Error এসেছিল, Request ID: req-b2"। Log থেকে খুঁজে বের করা।
// নিচের Text একটি Log File-এর মতো: প্রতি Line একটি JSON, একটি Line ভাঙা।
const t = (ms) => `2026-10-18T09:00:00.0${ms}Z`;
const logText = [
  { time: t(10), level: 'info', event: 'http.request', requestId: 'req-a1',
    status: 200, durationMs: 12 },
  { time: t(20), level: 'warn', event: 'db.slow', requestId: 'req-b2',
    durationMs: 4100 },
  { time: t(30), level: 'error', event: 'http.unhandled',
    requestId: 'req-b2', message: 'pool exhausted' },
  'not json at all',
  { time: t(40), level: 'info', event: 'http.request', requestId: 'req-b2',
    status: 500, durationMs: 4210 },
].map((e) => (typeof e === 'string' ? e : JSON.stringify(e))).join('\n');

function trace(text, requestId) {
  return text.split('\n').flatMap((line) => {
    try {
      const entry = JSON.parse(line);
      return entry.requestId === requestId ? [entry] : [];
    } catch {
      return []; // Structured নয় এমন Line বাদ
    }
  });
}

for (const entry of trace(logText, 'req-b2')) {
  const extra = entry.message ?? (entry.status
    ? `${entry.status} in ${entry.durationMs} ms` : `${entry.durationMs} ms`);
  console.log(`${entry.time.slice(11, 23)} ${entry.level.padEnd(5)}`,
    `${entry.event}: ${extra}`);
}
