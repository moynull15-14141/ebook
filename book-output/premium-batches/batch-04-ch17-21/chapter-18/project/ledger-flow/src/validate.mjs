export const ok = (value) => ({ ok: true, value });
export const fail = (error) => ({ ok: false, error });

const DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const isText = (value) => typeof value === 'string' && value.trim() !== '';

export function validateOrder(raw) {
  if (!isText(raw?.id)) {
    return fail('Order ID নেই');
  }
  if (!isText(raw.customer)) {
    return fail(`${raw.id}: গ্রাহক নেই`);
  }
  if (!DATE.test(raw.date ?? '')) {
    return fail(`${raw.id}: তারিখ YYYY-MM-DD নয়`);
  }
  if (!Array.isArray(raw.items) || raw.items.length === 0) {
    return fail(`${raw.id}: কোনো পণ্য নেই`);
  }
  const badItem = raw.items.find((item) =>
    !isText(item?.sku) || !Number.isInteger(item.qty) || item.qty < 1);
  if (badItem) {
    return fail(`${raw.id}: পণ্যের তথ্য ভুল`);
  }
  const items = raw.items.map(({ sku, qty }) =>
    ({ sku: sku.trim(), qty, refunded: 0 }));
  const id = raw.id.trim();
  return ok({ id, customer: raw.customer.trim(), date: raw.date, items });
}
