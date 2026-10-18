// Docker HEALTHCHECK: Container-এর ভেতর থেকে Liveness যাচাই।
// curl বা wget-এর ওপর নির্ভর নয়; Image-এ Node.js তো আছেই।
const port = process.env.PORT ?? '3000';
try {
  const res = await fetch(`http://127.0.0.1:${port}/health/live`,
    { signal: AbortSignal.timeout(2000) });
  process.exit(res.ok ? 0 : 1);
} catch {
  process.exit(1);
}
