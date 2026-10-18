const log = `ERROR db timeout
WARN slow query
ERROR db timeout
INFO started
WARN cache miss`;

const counts = {};
for (const { groups } of log.matchAll(/^(?<level>ERROR|WARN)\b/gm)) {
  counts[groups.level] = (counts[groups.level] ?? 0) + 1;
}
console.log(counts);
