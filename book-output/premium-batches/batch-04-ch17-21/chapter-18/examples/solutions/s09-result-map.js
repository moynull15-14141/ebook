const ok = (value) => ({ ok: true, value });
const fail = (error) => ({ ok: false, error });
const mapResult = (fn) => (result) => (result.ok ? ok(fn(result.value)) : result);

const toTaka = mapResult((n) => `${n} টাকা`);

console.log(JSON.stringify(toTaka(ok(250))));
console.log(JSON.stringify(toTaka(fail('দাম নেই'))));
