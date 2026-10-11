'use strict';

const PAISA_PER_TAKA = 100;

// পয়সাকে টাকার লিখিত রূপে আনে: 12050 থেকে '120.50 টাকা'।
const formatTaka = (paisa) => `${(paisa / PAISA_PER_TAKA).toFixed(2)} টাকা`;

// একটি পণ্যের লাইনের মোট: দাম x পরিমাণ (পয়সায়)।
const lineTotal = (item) => item.pricePaisa * item.quantity;

// একটি অঙ্কের নির্দিষ্ট শতাংশ, নিকটতম পয়সায়।
function percentOf(amount, percent) {
  return Math.round(amount * percent / 100);
}

// পণ্যের তালিকা ও হার থেকে Invoice-এর চারটি অঙ্ক (পয়সায়) হিসাব করে।
function calculateInvoice(items, discountPercent = 0, taxPercent = 0) {
  let subtotal = 0;

  for (let i = 0; i < items.length; i++) {
    subtotal += lineTotal(items[i]);
  }

  const discount = percentOf(subtotal, discountPercent);
  const taxable = subtotal - discount;
  const tax = percentOf(taxable, taxPercent);

  return {
    subtotal: subtotal,
    discount: discount,
    tax: tax,
    total: taxable + tax,
  };
}

// প্রতিটি লাইন এবং শেষে চারটি অঙ্ক দেখায়।
function printInvoice(items, discountPercent = 0, taxPercent = 0) {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const label = `${item.name} x ${item.quantity}`;

    console.log(`${label}: ${formatTaka(lineTotal(item))}`);
  }

  const invoice = calculateInvoice(items, discountPercent, taxPercent);

  console.log(`উপমোট: ${formatTaka(invoice.subtotal)}`);
  console.log(`ছাড় (${discountPercent}%): ${formatTaka(invoice.discount)}`);
  console.log(`কর (${taxPercent}%): ${formatTaka(invoice.tax)}`);
  console.log(`সর্বমোট: ${formatTaka(invoice.total)}`);
}

const items = [
  { name: 'Notebook', pricePaisa: 12050, quantity: 3 },
  { name: 'Pen', pricePaisa: 1500, quantity: 10 },
  { name: 'School Bag', pricePaisa: 95000, quantity: 1 },
];

printInvoice(items, 10, 5);
console.log(formatTaka(calculateInvoice(items).total));
