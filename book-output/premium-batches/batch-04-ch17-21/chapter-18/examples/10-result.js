const ok = (value) => ({ ok: true, value });
const fail = (error) => ({ ok: false, error });
const andThen = (fn) => (result) => (result.ok ? fn(result.value) : result);

const parseQty = (text) =>
  (/^\d+$/.test(text) ? ok(Number(text)) : fail(`পরিমাণ সংখ্যা নয়: "${text}"`));
const positive = (n) => (n > 0 ? ok(n) : fail('পরিমাণ শূন্য'));
const withinStock = (n) => (n <= 50 ? ok(n) : fail(`স্টকে ${n}টি নেই`));

const checkQty = (text) => [andThen(positive), andThen(withinStock)]
  .reduce((result, step) => step(result), parseQty(text));

for (const input of ['12', 'abc', '0', '80']) {
  const result = checkQty(input);
  console.log(input, result.ok ? result.value : result.error);
}
