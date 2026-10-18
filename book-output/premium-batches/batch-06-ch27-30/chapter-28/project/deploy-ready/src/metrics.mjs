// Prometheus Text Exposition Format-এ Metrics: Counter ও Histogram।
const BUCKETS = [0.005, 0.01, 0.05, 0.1, 0.5, 1, 5];
const HIST = 'http_request_duration_seconds';

const labelText = (labels) => Object.entries(labels)
  .map(([key, value]) => `${key}="${String(value).replace(/"/g, '\\"')}"`)
  .join(',');

export function createMetrics() {
  const requests = new Map();
  const durations = new Map();
  const gauges = new Map();

  return {
    observeRequest({ method, route, status, seconds }) {
      const key = labelText({ method, route, status });
      requests.set(key, (requests.get(key) ?? 0) + 1);
      const hkey = labelText({ method, route });
      const h = durations.get(hkey)
        ?? { counts: BUCKETS.map(() => 0), sum: 0, count: 0 };
      BUCKETS.forEach((le, i) => { if (seconds <= le) h.counts[i] += 1; });
      h.sum += seconds;
      h.count += 1;
      durations.set(hkey, h);
    },
    setGauge(name, value) {
      gauges.set(name, value);
    },
    render() {
      const lines = ['# HELP http_requests_total HTTP অনুরোধের সংখ্যা',
        '# TYPE http_requests_total counter'];
      for (const [key, n] of requests) {
        lines.push(`http_requests_total{${key}} ${n}`);
      }
      lines.push(`# HELP ${HIST} অনুরোধের সময় (সেকেন্ড)`,
        `# TYPE ${HIST} histogram`);
      for (const [key, h] of durations) {
        BUCKETS.forEach((le, i) => lines.push(
          `${HIST}_bucket{${key},le="${le}"} ${h.counts[i]}`));
        lines.push(`${HIST}_bucket{${key},le="+Inf"} ${h.count}`,
          `${HIST}_sum{${key}} ${h.sum}`,
          `${HIST}_count{${key}} ${h.count}`);
      }
      for (const [name, value] of gauges) {
        lines.push(`# TYPE ${name} gauge`, `${name} ${value}`);
      }
      return `${lines.join('\n')}\n`;
    },
  };
}
