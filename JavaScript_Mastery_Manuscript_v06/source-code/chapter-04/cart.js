"use strict";

function validateCart(items) {
  if (!Array.isArray(items)) throw new TypeError("Cart must be an array");
  if (items.length > 1000) throw new RangeError("Cart has too many items");
  for (const [index, item] of items.entries()) {
    if (!item || typeof item.name !== "string" || !item.name.trim()) {
      throw new TypeError(`Item ${index + 1}: name is required`);
    }
    if (!Number.isSafeInteger(item.price) || item.price < 0) {
      throw new TypeError(`Item ${index + 1}: price must be a nonnegative integer BDT amount`);
    }
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 10000) {
      throw new TypeError(`Item ${index + 1}: quantity must be an integer between 1 and 10000`);
    }
  }
}

function analyzeCart(items, threshold = 5000) {
  validateCart(items);
  if (!Number.isSafeInteger(threshold) || threshold < 0) throw new TypeError("Invalid threshold");
  let total = 0;
  let units = 0;
  let highest = null;
  const rows = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const subtotal = item.price * item.quantity;
    if (!Number.isSafeInteger(subtotal) || !Number.isSafeInteger(total + subtotal)) {
      throw new RangeError("Amount exceeds safe integer range");
    }
    total += subtotal;
    units += item.quantity;
    rows.push({ name: item.name.trim(), price: item.price, quantity: item.quantity, subtotal });
    if (highest === null || subtotal > highest.subtotal) highest = rows[rows.length - 1];
  }
  const qualifying = [];
  for (const row of rows) {
    if (row.subtotal >= threshold) qualifying.push(row.name);
  }
  return { rows, total, units, distinctItems: rows.length, highest, qualifying };
}

if (typeof module !== "undefined" && module.exports) module.exports = { analyzeCart, validateCart };
if (typeof window !== "undefined") window.CartAnalyzer = { analyzeCart };
