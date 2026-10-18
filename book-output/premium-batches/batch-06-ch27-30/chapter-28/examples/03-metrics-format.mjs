import { createMetrics } from '../project/deploy-ready/src/metrics.mjs';

const metrics = createMetrics();
const seen = [
  ['GET', 200, 0.003], ['GET', 200, 0.04], ['GET', 200, 0.3],
  ['POST', 201, 0.02], ['POST', 422, 0.004], ['GET', 500, 1.7],
];
for (const [method, status, seconds] of seen) {
  metrics.observeRequest({ method, route: '/jobs', status, seconds });
}
// শুধু GET-এর Histogram ও সব Counter দেখানো (পুরো আউটপুট দীর্ঘ)।
const text = metrics.render().split('\n')
  .filter((line) => !line.includes('method="POST",route="/jobs",le'))
  .join('\n');
console.log(text.trimEnd());
