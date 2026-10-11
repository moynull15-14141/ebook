'use strict';

const MAX_QUANTITY = 100;

// একটি পণ্য গ্রহণযোগ্য কি না যাচাই করে।
function isValidItem(item) {
  const hasName = item.name.trim() !== '';
  const hasPrice = Number.isInteger(item.price) && item.price >= 0;
  const hasQuantity = Number.isInteger(item.quantity) &&
    item.quantity >= 1 && item.quantity <= MAX_QUANTITY;

  return hasName && hasPrice && hasQuantity;
}

// Cart-এর সব পণ্য একবার ঘুরে একটি সারসংক্ষেপ তৈরি করে।
function analyzeCart(items, threshold) {
  let total = 0;
  let units = 0;
  let skipped = 0;
  let highestName = '';
  let highestAmount = 0;
  let bigItems = '';

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!isValidItem(item)) {
      skipped++;
      continue;
    }

    const amount = item.price * item.quantity;

    total += amount;
    units += item.quantity;

    if (amount > highestAmount) {
      highestAmount = amount;
      highestName = item.name;
    }

    if (amount >= threshold) {
      bigItems += bigItems === '' ? item.name : `, ${item.name}`;
    }
  }

  return {
    total: total,
    units: units,
    skipped: skipped,
    highestName: highestName,
    highestAmount: highestAmount,
    bigItems: bigItems,
  };
}

// প্রতিটি পণ্যের লাইন এবং শেষে সারসংক্ষেপ দেখায়।
function printReport(items, threshold) {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const label = `${i + 1}. ${item.name}`;
    const amount = item.price * item.quantity;

    console.log(`${label}: ${item.price} x ${item.quantity} = ${amount}`);
  }

  const summary = analyzeCart(items, threshold);

  console.log(`মোট: ${summary.total} টাকা, পরিমাণ: ${summary.units}`);
  console.log(`সবচেয়ে বড় অঙ্ক: ${summary.highestName} (${summary.highestAmount})`);
  console.log(`${threshold} টাকা বা বেশি: ${summary.bigItems}`);
  console.log(`বাদ পড়েছে: ${summary.skipped}টি`);
}

const cart = [
  { name: 'Notebook', price: 120, quantity: 3 },
  { name: 'Pen', price: 15, quantity: 10 },
  { name: 'School Bag', price: 950, quantity: 1 },
  { name: 'Calculator', price: 650, quantity: 0 },
  { name: 'Water Bottle', price: 280, quantity: 2 },
];

printReport(cart, 500);
