// Deploy-এর পরে Smoke Test: node scripts/smoke.mjs https://staging.example.com
// কোনো ধাপ ব্যর্থ হলে Exit Code 1, যাতে Pipeline থেমে Rollback করতে পারে।
const base = process.argv[2] ?? 'http://127.0.0.1:3000';
const token = process.env.OPS_TOKEN;
const auth = token ? { Authorization: `Bearer ${token}` } : {};

const checks = [
  ['liveness', () => fetch(`${base}/health/live`), 200],
  ['readiness', () => fetch(`${base}/health/ready`), 200],
  ['version', () => fetch(`${base}/version`), 200],
  ['create job', () => fetch(`${base}/api/jobs`, { method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({ title: 'Smoke test job', priority: 'low' }) }), 201],
  ['list jobs', () => fetch(`${base}/api/jobs`), 200],
];

let failed = 0;
for (const [name, run, expected] of checks) {
  try {
    const res = await run();
    const ok = res.status === expected;
    if (!ok) failed += 1;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: ${res.status}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL ${name}: ${error.message}`);
  }
}
process.exit(failed ? 1 : 0);
