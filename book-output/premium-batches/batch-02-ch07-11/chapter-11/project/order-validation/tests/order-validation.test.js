// OrderGuard-এর Automated Test।  চালানোর Command (Project Folder থেকে):  node --test
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const loadScript = require('./load-script.js');

const { fn, get } = loadScript(path.join(__dirname, '..', 'order-validation.js'), { setTimeout });
const { parseQuantity, formatTaka, validateOrder, createDemoServer, placeOrder } = fn;
const ValidationError = get('ValidationError');
const ServiceError = get('ServiceError');
const CATALOG = get('CATALOG');
const json = v => JSON.stringify(v);
const good = () => ({ customer: '  Sara Ahmed ', email: ' sara@example.com ', productId: 'keyboard', quantity: '2' });
const instantServer = (stock) => createDemoServer(stock, 0);

test('parseQuantity: শুধু 1 থেকে 100-এর পূর্ণসংখ্যা, আগে-পরের ফাঁকা জায়গা চলে', () => {
  for (const [input, expected] of [['1', 1], [' 7 ', 7], ['100', 100], [42, 42]]) assert.equal(parseQuantity(input), expected, json(input));
});

test('parseQuantity: ফাঁকা, শূন্য, দশমিক, বৈজ্ঞানিক রূপ, ঋণাত্মক, সীমার বাইরে বাতিল', () => {
  for (const bad of ['', '  ', '0', '01', '2.5', '1e3', '-3', '101', 'abc', null, undefined, '٣']) {
    assert.equal(parseQuantity(bad), null, json(bad));
  }
});

test('formatTaka: হাজারের কমা; অবৈধ অঙ্কে RangeError', () => {
  assert.equal(formatTaka(2500), '2,500 টাকা');
  assert.equal(formatTaka(0), '0 টাকা');
  for (const bad of [-1, 2.5, NaN, '100', Number.MAX_SAFE_INTEGER + 2]) {
    assert.throws(() => formatTaka(bad), { name: 'RangeError' }, String(bad));
  }
});

test('validateOrder: বৈধ Order পরিষ্কার করে মোট দামসহ ফেরত দেয়', () => {
  assert.equal(json(validateOrder(good())), json({
    customer: 'Sara Ahmed', email: 'sara@example.com', productId: 'keyboard', productName: 'Keyboard', quantity: 2, total: 2500,
  }));
});

test('validateOrder: সব ঘর ফাঁকা হলে চারটি ঘরের বার্তা একসঙ্গে', () => {
  try {
    validateOrder({});
    assert.fail('ValidationError আশা করা হয়েছিল');
  } catch (error) {
    assert.ok(error instanceof ValidationError);
    assert.equal(error.name, 'ValidationError');
    assert.equal(error.message, 'কয়েকটি ঘর ঠিক করতে হবে।');
    assert.equal(Object.keys(error.fields).join(','), 'customer,email,productId,quantity');
  }
});

test('validateOrder: নামের সীমা 2 থেকে 60 অক্ষর', () => {
  const fieldsFor = (customer) => { try { validateOrder({ ...good(), customer }); return {}; } catch (e) { return e.fields; } };
  assert.equal(fieldsFor('S').customer, 'নাম 2 থেকে 60 অক্ষরের হতে হবে।');
  assert.equal(fieldsFor('Sa').customer, undefined);
  assert.equal(fieldsFor('a'.repeat(60)).customer, undefined);
  assert.ok(fieldsFor('a'.repeat(61)).customer);
});

test('validateOrder: Email-এর গঠন', () => {
  const emailError = (email) => { try { validateOrder({ ...good(), email }); return null; } catch (e) { return e.fields.email ?? null; } };
  assert.equal(emailError('a@b.co'), null);
  for (const bad of ['sara', 'sara@', 'sara@example', 'sa ra@example.com', '@example.com']) assert.equal(emailError(bad), 'সঠিক একটি Email লিখুন।', bad);
});

test('validateOrder: তালিকার বাইরের পণ্য, এবং উত্তরাধিকারসূত্রে পাওয়া Key (toString, __proto__) বাতিল', () => {
  for (const productId of ['laptop', 'toString', 'constructor', '__proto__', '']) {
    assert.throws(() => validateOrder({ ...good(), productId }), (e) => e.fields.productId === 'তালিকা থেকে একটি পণ্য বাছুন।', productId);
  }
});

test('validateOrder: Object না দিলে TypeError (Program-এর ভুল, ValidationError নয়)', () => {
  for (const bad of [null, undefined, 'order', 5]) {
    assert.throws(() => validateOrder(bad), (e) => e.name === 'TypeError' && !(e instanceof ValidationError));
  }
});

test('createDemoServer: রসিদ নম্বর ক্রমে; স্টক কমে; বেশি চাইলে ServiceError', async () => {
  const send = instantServer({ headset: 2 });
  const order = validateOrder({ ...good(), productId: 'headset', quantity: '1' });
  assert.equal(await send(order), 'ORD-0001');
  assert.equal(await send(order), 'ORD-0002');
  await assert.rejects(send(order), (e) => e instanceof ServiceError && e.message === 'দুঃখিত, Headset স্টকে আছে 0টি।');
});

test('createDemoServer: প্রতিটি Server-এর স্টক আলাদা, মূল স্টক Object অপরিবর্তিত', async () => {
  const stock = { mouse: 1 };
  const first = instantServer(stock);
  const second = instantServer(stock);
  const order = validateOrder({ ...good(), productId: 'mouse', quantity: '1' });
  await first(order);
  assert.equal(await second(order), 'ORD-0001');
  assert.equal(stock.mouse, 1);
});

test('placeOrder: সফল হলে ok, Order ও রসিদ', async () => {
  const result = await placeOrder(good(), instantServer({ keyboard: 5 }));
  assert.equal(result.ok, true);
  assert.equal(result.receipt, 'ORD-0001');
  assert.equal(result.order.total, 2500);
});

test('placeOrder: যাচাইয়ের ত্রুটি ফলাফল হিসেবে; Server ডাকা হয় না', async () => {
  let called = false;
  const result = await placeOrder({ ...good(), quantity: '0' }, async () => { called = true; });
  assert.equal(json({ ok: result.ok, kind: result.kind }), json({ ok: false, kind: 'validation' }));
  assert.equal(Object.keys(result.fields).join(','), 'quantity');
  assert.equal(called, false);
});

test('placeOrder: Server-এর প্রত্যাখ্যান service; অন্য যেকোনো পাঠানোর ত্রুটি network, মূল ত্রুটি cause-এ', async () => {
  const service = await placeOrder({ ...good(), quantity: '3' }, instantServer({ keyboard: 1 }));
  assert.equal(json([service.kind, service.message]), json(['service', 'দুঃখিত, Keyboard স্টকে আছে 1টি।']));

  const offline = new TypeError('Failed to fetch');
  const network = await placeOrder(good(), async () => { throw offline; });
  assert.equal(network.kind, 'network');
  assert.equal(network.message, 'Server-এর সঙ্গে যোগাযোগ করা যায়নি। একটু পরে আবার চেষ্টা করুন।');
  assert.equal(network.cause, offline);
});

test('placeOrder: অপ্রত্যাশিত ত্রুটি (Program-এর ভুল) ফলাফলে লুকায় না, ওপরে যায়', async () => {
  await assert.rejects(placeOrder(null, instantServer()), { name: 'TypeError' });
});

test('CATALOG-এর প্রতিটি দাম নিরাপদ পূর্ণসংখ্যা; 100টির মোটও নিরাপদ', () => {
  for (const [id, product] of Object.entries(CATALOG)) {
    assert.ok(Number.isSafeInteger(product.price) && product.price > 0, id);
    assert.equal(formatTaka(product.price * 100).endsWith('টাকা'), true);
  }
});
