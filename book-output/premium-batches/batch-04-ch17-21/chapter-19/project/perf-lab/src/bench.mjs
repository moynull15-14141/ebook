export function summarize(samples) {
  const sorted = samples.toSorted((a, b) => a - b);
  const last = sorted.length - 1;
  const at = (q) => sorted[Math.min(last, Math.floor(q * sorted.length))];
  return { median: at(0.5), p95: at(0.95), min: sorted[0], runs: samples.length };
}

// fn বহুবার চালিয়ে সময় মাপে। now Inject করা যায় (Test-এ নিয়ন্ত্রিত ঘড়ি)।
export function bench(fn, options = {}) {
  const { warmup = 5, runs = 30, now = () => performance.now() } = options;
  let sink;
  for (let i = 0; i < warmup; i += 1) {
    sink = fn();
  }
  const samples = [];
  for (let i = 0; i < runs; i += 1) {
    const start = now();
    sink = fn();
    samples.push(now() - start);
  }
  const stats = summarize(samples);
  const opsPerSec = stats.median > 0 ? 1000 / stats.median : Infinity;
  return { ...stats, opsPerSec, sinkType: typeof sink };
}

export function environment() {
  return {
    node: process.version,
    platform: `${process.platform} ${process.arch}`,
    date: new Date().toISOString().slice(0, 10),
  };
}
