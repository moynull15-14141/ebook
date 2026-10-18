// Readiness: Dependency-র যাচাই সময়সীমিত, আর ফল কিছুক্ষণ Cache।
// প্রতি সেকেন্ডে আসা Probe যেন Database-কে নিজেই চাপে না ফেলে।
export function createReadiness(check, { timeoutMs = 500, cacheMs = 2000,
  now = Date.now } = {}) {
  let cached = null;
  let calls = 0;
  async function probe() {
    if (cached && now() - cached.at < cacheMs) return cached.ready;
    calls += 1;
    let timer;
    const timeout = new Promise((resolve) => {
      timer = setTimeout(() => resolve(false), timeoutMs);
    });
    const ready = await Promise.race([
      check().then(() => true, () => false), timeout,
    ]).finally(() => clearTimeout(timer));
    cached = { ready, at: now() };
    return ready;
  }
  return { probe, calls: () => calls };
}

let clock = 0;
let healthy = true;
const db = () => (healthy ? Promise.resolve()
  : new Promise(() => {})); // অসুস্থ Database: কখনো উত্তর দেয় না
const readiness = createReadiness(db, { timeoutMs: 50, now: () => clock });

console.log('t=0:', await readiness.probe());
clock = 1000;
healthy = false;
console.log('t=1s (Cache থেকে):', await readiness.probe());
clock = 2500;
console.log('t=2.5s (নতুন যাচাই, Timeout):', await readiness.probe());
console.log('আসল যাচাই হয়েছে', readiness.calls(), 'বার');
