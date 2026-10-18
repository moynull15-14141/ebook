const BLOCKED = new Set(['__proto__', 'constructor', 'prototype']);

function safeMerge(target, source, depth = 0) {
  if (depth > 5) {
    throw new RangeError('অনেক গভীর Object');
  }
  for (const [key, value] of Object.entries(source)) {
    if (BLOCKED.has(key)) {
      continue;
    }
    const isObject = typeof value === 'object' && value !== null;
    const existing = Object.hasOwn(target, key)
      ? target[key]
      : Object.create(null);
    target[key] = isObject ? safeMerge(existing, value, depth + 1) : value;
  }
  return target;
}

const text = '{"a":{"b":1},"__proto__":{"x":1},"constructor":{"y":2}}';
const body = JSON.parse(text);
const merged = safeMerge(Object.create(null), body);
console.log(JSON.stringify(merged), ({}).x, Object.getPrototypeOf(merged));

let deep = {};
for (let i = 0; i < 8; i += 1) {
  deep = { inner: deep };
}
try {
  safeMerge(Object.create(null), deep);
} catch (error) {
  console.log(error.name, error.message);
}
