function summarize(samples) {
  const sorted = samples.toSorted((a, b) => a - b);
  const last = sorted.length - 1;
  const at = (q) => sorted[Math.min(last, Math.floor(q * sorted.length))];
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  return { mean, median: at(0.5), p95: at(0.95), min: sorted[0] };
}

const samples = [10, 11, 10, 12, 11, 10, 95, 11, 10, 12];
console.log(JSON.stringify(summarize(samples)));
