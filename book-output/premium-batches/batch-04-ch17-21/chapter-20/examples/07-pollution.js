function naiveMerge(target, source) {
  for (const key of Object.keys(source)) {
    const value = source[key];
    if (typeof value === 'object' && value !== null) {
      target[key] ??= {};
      naiveMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

const body = JSON.parse('{ "theme": "dark", "__proto__": { "isAdmin": true } }');
console.log(Object.keys(body));

naiveMerge({}, body);
const unrelated = {};
console.log('সম্পর্কহীন Object-এ isAdmin:', unrelated.isAdmin);
delete Object.prototype.isAdmin;

const BLOCKED = new Set(['__proto__', 'constructor', 'prototype']);
function safeMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (BLOCKED.has(key)) {
      continue;
    }
    target[key] = typeof value === 'object' && value !== null
      ? safeMerge(Object.hasOwn(target, key) ? target[key] : {}, value)
      : value;
  }
  return target;
}

console.log(safeMerge({}, body), ({}).isAdmin);
