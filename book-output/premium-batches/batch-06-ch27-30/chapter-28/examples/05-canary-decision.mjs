// Canary: নতুন সংস্করণে অল্প Traffic; পুরোনোর (Baseline) সঙ্গে তুলনা করে
// এগোনো, অপেক্ষা বা ফিরে যাওয়া। সিদ্ধান্ত সংখ্যা দিয়ে, অনুমানে নয়।
function decide(baseline, canary, { minRequests = 500, maxErrorRatio = 1.5,
  maxLatencyMs = 50 } = {}) {
  if (canary.requests < minRequests) return 'wait: যথেষ্ট Traffic নেই';
  const errorRate = (w) => w.errors / w.requests;
  const ratio = errorRate(canary) / Math.max(errorRate(baseline), 0.0001);
  if (ratio > maxErrorRatio) {
    return `rollback: Error ${ratio.toFixed(1)} গুণ`;
  }
  if (canary.p95Ms - baseline.p95Ms > maxLatencyMs) {
    return `rollback: p95 ${canary.p95Ms - baseline.p95Ms} ms বেশি`;
  }
  return 'promote: পরের ধাপে (যেমন ৫% থেকে ২৫%)';
}

const baseline = { requests: 95_000, errors: 95, p95Ms: 180 };
const cases = {
  'প্রথম ৫ মিনিট': { requests: 120, errors: 0, p95Ms: 170 },
  'সুস্থ': { requests: 5_000, errors: 6, p95Ms: 190 },
  'Error বেশি': { requests: 5_000, errors: 40, p95Ms: 185 },
  'ধীর': { requests: 5_000, errors: 4, p95Ms: 320 },
};
for (const [name, canary] of Object.entries(cases)) {
  console.log(`${name}: ${decide(baseline, canary)}`);
}
