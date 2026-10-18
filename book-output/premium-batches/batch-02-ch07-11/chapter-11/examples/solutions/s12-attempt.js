function attempt(fn) {
  try {
    return { ok: true, value: fn() };
  } catch (error) {
    return { ok: false, error };
  }
}

const good = attempt(() => JSON.parse('[1, 2]'));
const bad = attempt(() => JSON.parse('[1, 2'));

console.log(good.ok, good.value.length);
console.log(bad.ok, bad.error.name);
