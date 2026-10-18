# PerfLab Benchmark

Node.js v22.16.0, win32 x64, 2026-10-15.
n = 5000; warm-up 5, runs 25.

| Case | median ms | p95 ms | runs |
| --- | --- | --- | --- |
| unique: nested | 13.363 | 33.531 | 25 |
| unique: Set | 0.254 | 1.689 | 25 |
| common: nested | 44.422 | 108.101 | 25 |
| common: Set | 0.425 | 1.182 | 25 |
| search x200: linear | 0.854 | 2.779 | 25 |
| search x200: binary | 0.023 | 0.173 | 25 |
