'use strict';

const CATALOG = {
  keyboard: { name: 'Keyboard', price: 1250 },
  mouse: { name: 'Mouse', price: 650 },
  headset: { name: 'Headset', price: 2400 },
};
const STOCK = { keyboard: 10, mouse: 5, headset: 2 };
const MAX_QUANTITY = 100;

// প্রত্যাশিত: ব্যবহারকারী ঠিক করতে পারেন। fields-এ কোন ঘরে কী সমস্যা।
class ValidationError extends Error {
  constructor(fields) {
    super('কয়েকটি ঘর ঠিক করতে হবে।');
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

// প্রত্যাশিত: Server অনুরোধটি গ্রহণ করেনি (যেমন স্টক শেষ)।
class ServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ServiceError';
  }
}

function parseQuantity(value) {
  const text = String(value ?? '').trim();

  if (!/^[1-9]\d*$/.test(text)) {
    return null;
  }
  const quantity = Number(text);
  return quantity <= MAX_QUANTITY ? quantity : null;
}

function formatTaka(amount) {
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new RangeError(`অবৈধ টাকার অঙ্ক: ${amount}`);
  }
  return `${amount.toLocaleString('en-US')} টাকা`;
}

// Trust Boundary: Form-এর তথ্য যাচাই করে পরিষ্কার Order, নয়তো ValidationError।
function validateOrder(raw, catalog = CATALOG) {
  if (raw === null || typeof raw !== 'object') {
    throw new TypeError('validateOrder-কে একটি Object দিতে হবে');
  }

  const customer = String(raw.customer ?? '').trim();
  const email = String(raw.email ?? '').trim();
  const productId = String(raw.productId ?? '');
  const product = Object.hasOwn(catalog, productId) ? catalog[productId] : null;
  const quantity = parseQuantity(raw.quantity);
  const fields = {};

  if (customer.length < 2 || customer.length > 60) {
    fields.customer = 'নাম 2 থেকে 60 অক্ষরের হতে হবে।';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fields.email = 'সঠিক একটি Email লিখুন।';
  }
  if (product === null) {
    fields.productId = 'তালিকা থেকে একটি পণ্য বাছুন।';
  }
  if (quantity === null) {
    fields.quantity = `পরিমাণ 1 থেকে ${MAX_QUANTITY}-এর মধ্যে পূর্ণসংখ্যা হতে হবে।`;
  }
  if (Object.keys(fields).length > 0) {
    throw new ValidationError(fields);
  }

  const total = product.price * quantity;
  const productName = product.name;
  return { customer, email, productId, productName, quantity, total };
}

// কৃত্রিম Server: অপেক্ষার পর রসিদ নম্বর, অথবা স্টক না থাকলে ServiceError।
function createDemoServer(stock = STOCK, delayMs = 300) {
  const left = { ...stock };
  let next = 1;

  return async function send(order) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    const available = left[order.productId] ?? 0;

    if (order.quantity > available) {
      const name = order.productName;
      throw new ServiceError(`দুঃখিত, ${name} স্টকে আছে ${available}টি।`);
    }
    left[order.productId] = available - order.quantity;
    return `ORD-${String(next++).padStart(4, '0')}`;
  };
}

// প্রত্যাশিত ত্রুটি ফলাফল হিসেবে ফেরত; অপ্রত্যাশিত ত্রুটি ওপরের স্তরে যায়।
async function placeOrder(raw, send) {
  let order;
  try {
    order = validateOrder(raw);
  } catch (error) {
    if (error instanceof ValidationError) {
      const { message, fields } = error;
      return { ok: false, kind: 'validation', message, fields };
    }
    throw error;
  }

  try {
    return { ok: true, order, receipt: await send(order) };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { ok: false, kind: 'service', message: error.message };
    }
    const message =
      'Server-এর সঙ্গে যোগাযোগ করা যায়নি। একটু পরে আবার চেষ্টা করুন।';
    return { ok: false, kind: 'network', message, cause: error };
  }
}
