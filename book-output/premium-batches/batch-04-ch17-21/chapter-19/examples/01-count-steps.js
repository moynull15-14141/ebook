function commonNested(a, b) {
  let steps = 0;
  const result = a.filter((x) => b.some((y) => {
    steps += 1;
    return x === y;
  }));
  return { result: result.length, steps };
}

function commonWithSet(a, b) {
  let steps = b.length;
  const lookup = new Set(b);
  const result = a.filter((x) => {
    steps += 1;
    return lookup.has(x);
  });
  return { result: result.length, steps };
}

for (const n of [100, 1000, 10000]) {
  const a = Array.from({ length: n }, (_, i) => i * 2);
  const b = Array.from({ length: n }, (_, i) => i * 3);
  const nested = commonNested(a, b);
  const set = commonWithSet(a, b);
  console.log(n, nested.result === set.result, nested.steps, set.steps);
}
