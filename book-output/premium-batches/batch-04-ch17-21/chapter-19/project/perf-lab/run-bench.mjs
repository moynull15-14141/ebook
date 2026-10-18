import { writeFileSync, mkdirSync } from 'node:fs';
import { bench, environment } from './src/bench.mjs';
import { createRandom, randomInts } from './src/random.mjs';
import * as algo from './src/algorithms.mjs';

const random = createRandom(2026);
const a = randomInts(random, 5000, 10000);
const b = randomInts(random, 5000, 10000);
const sorted = a.toSorted((x, y) => x - y);
const targets = randomInts(random, 200, 10000);
const searchAll = (find) => targets.map((t) => find(sorted, t));

const cases = [
  ['unique: nested', () => algo.uniqueNested(a)],
  ['unique: Set', () => algo.uniqueSet(a)],
  ['common: nested', () => algo.commonNested(a, b)],
  ['common: Set', () => algo.commonSet(a, b)],
  ['search x200: linear', () => searchAll(algo.indexOfLinear)],
  ['search x200: binary', () => searchAll(algo.indexOfBinary)],
];

const env = environment();
const rows = cases.map(([name, fn]) => {
  const result = bench(fn, { warmup: 5, runs: 25 });
  const { median, p95, runs } = result;
  return `| ${name} | ${median.toFixed(3)} | ${p95.toFixed(3)} | ${runs} |`;
});

const report = [
  '# PerfLab Benchmark',
  '',
  `Node.js ${env.node}, ${env.platform}, ${env.date}.`,
  'n = 5000; warm-up 5, runs 25.',
  '',
  '| Case | median ms | p95 ms | runs |',
  '| --- | --- | --- | --- |',
  ...rows,
].join('\n');

mkdirSync('results', { recursive: true });
writeFileSync('results/benchmark-report.md', `${report}\n`);
console.log(report);
