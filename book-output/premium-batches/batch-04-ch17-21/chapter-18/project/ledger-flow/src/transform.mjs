import { updateIn } from './immutable.mjs';

const banglaCollator = new Intl.Collator('bn');

export const indexBy = (rows, key) => new Map(rows.map((row) => [row[key], row]));

// Order থেকে পণ্য-সারি; ফেরত বাদে বিক্রি পরিমাণ।
export const flattenOrders = (orders) =>
  orders.flatMap((order) => order.items.map((item) => ({
    order: order.id,
    customer: order.customer,
    month: order.date.slice(0, 7),
    sku: item.sku,
    qty: item.qty - item.refunded,
  })));

// পণ্য ও গ্রাহকের সঙ্গে Join; না মেলা সারি আলাদা।
export function joinLines(lines, products, customers) {
  const productIndex = indexBy(products, 'sku');
  const customerIndex = indexBy(customers, 'id');
  const joined = [];
  const unmatched = [];

  for (const line of lines) {
    const product = productIndex.get(line.sku);
    const customer = customerIndex.get(line.customer);
    if (!product || !customer) {
      unmatched.push(`${line.order}:${product ? line.customer : line.sku}`);
      continue;
    }
    joined.push({
      ...line,
      region: customer.region,
      customerName: customer.name,
      amount: product.price * line.qty,
    });
  }
  return { joined, unmatched };
}

const sum = (rows) => rows.reduce((total, row) => total + row.amount, 0);

// অঞ্চল × মাস; ঘরগুলো মাসের ক্রমে।
export function pivotRegionMonth(rows) {
  const pivot = {};
  for (const [region, regionRows] of Map.groupBy(rows, (row) => row.region)) {
    const months = Map.groupBy(regionRows, (row) => row.month);
    pivot[region] = Object.fromEntries(
      [...months].toSorted(([a], [b]) => a.localeCompare(b))
        .map(([month, monthRows]) => [month, sum(monthRows)]),
    );
  }
  return pivot;
}

export function topCustomers(rows, count = 3) {
  return [...Map.groupBy(rows, (row) => row.customerName)]
    .map(([name, customerRows]) => ({ name, total: sum(customerRows) }))
    .toSorted((a, b) =>
      b.total - a.total || banglaCollator.compare(a.name, b.name))
    .slice(0, count);
}

// একটি Order-এর একটি পণ্যের ফেরত পরিমাণ যোগ; বাকি সব অক্ষত।
export function applyRefund(orders, { orderId, sku, qty }) {
  const orderIndex = orders.findIndex((order) => order.id === orderId);
  const items = orders[orderIndex]?.items ?? [];
  const itemIndex = items.findIndex((item) => item.sku === sku);
  if (orderIndex === -1 || itemIndex === -1) {
    throw new RangeError(`${orderId}/${sku} পাওয়া যায়নি`);
  }
  const { qty: sold, refunded } = orders[orderIndex].items[itemIndex];
  if (!Number.isInteger(qty) || qty < 1 || refunded + qty > sold) {
    throw new RangeError(
      `ফেরত ${qty}টি সম্ভব নয়; বিক্রি ${sold}, আগে ফেরত ${refunded}`);
  }
  const path = [orderIndex, 'items', itemIndex, 'refunded'];
  return updateIn(orders, path, (n) => n + qty);
}

export const totalOf = sum;
