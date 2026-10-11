"use strict";
/** Invoice uses integer paisa internally to avoid floating-point rounding surprises. */
const BDT_PAISA = 100;
function assertSafeMoney(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) throw new TypeError(`${label} must be a nonnegative safe integer`);
}
function percentOf(amount, rateBasisPoints) {
  assertSafeMoney(amount, "Amount");
  if (!Number.isSafeInteger(rateBasisPoints) || rateBasisPoints < 0 || rateBasisPoints > 10000) throw new RangeError("Invalid rate");
  const product = amount * rateBasisPoints;
  if (!Number.isSafeInteger(product)) throw new RangeError("Amount too large");
  return Math.round(product / 10000);
}
function calculateInvoice(lines, options = {}) {
  if (!Array.isArray(lines) || lines.length > 200) throw new TypeError("Provide at most 200 invoice lines");
  const { discountBps = 0, taxBps = 0 } = options;
  if (!Number.isSafeInteger(discountBps) || discountBps < 0 || discountBps > 10000) throw new RangeError("Invalid discount");
  if (!Number.isSafeInteger(taxBps) || taxBps < 0 || taxBps > 10000) throw new RangeError("Invalid tax");
  let subtotal = 0;
  const detailedLines = lines.map((line, index) => {
    if (!line || typeof line.name !== "string" || !line.name.trim()) throw new TypeError(`Line ${index + 1}: name required`);
    assertSafeMoney(line.unitPricePaisa, "Unit price");
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > 10000) throw new TypeError("Invalid quantity");
    const lineTotal = line.unitPricePaisa * line.quantity;
    if (!Number.isSafeInteger(lineTotal) || !Number.isSafeInteger(subtotal + lineTotal)) throw new RangeError("Invoice amount too large");
    subtotal += lineTotal;
    return { name: line.name.trim(), quantity: line.quantity, unitPricePaisa: line.unitPricePaisa, lineTotalPaisa: lineTotal };
  });
  const discount = percentOf(subtotal, discountBps);
  const taxable = subtotal - discount;
  const tax = percentOf(taxable, taxBps);
  const total = taxable + tax;
  if (!Number.isSafeInteger(total)) throw new RangeError("Total too large");
  return { lines: detailedLines, subtotalPaisa: subtotal, discountPaisa: discount, taxablePaisa: taxable, taxPaisa: tax, totalPaisa: total };
}
function parseBdtToPaisa(raw) {
  const input = String(raw).trim();
  if (!/^(?:0|[1-9]\d{0,10})(?:\.\d{1,2})?$/.test(input)) throw new TypeError("Enter BDT with up to two decimal places");
  const [whole, fraction = ""] = input.split(".");
  const paisa = Number(whole) * BDT_PAISA + Number(fraction.padEnd(2,"0"));
  assertSafeMoney(paisa,"Price");
  return paisa;
}
function formatBdt(paisa) {
  assertSafeMoney(paisa,"Amount");
  return `BDT ${(paisa / BDT_PAISA).toFixed(2)}`;
}
if (typeof module !== "undefined" && module.exports) module.exports = {calculateInvoice,percentOf,parseBdtToPaisa,formatBdt};
if (typeof window !== "undefined") window.InvoiceEngine = {calculateInvoice,parseBdtToPaisa,formatBdt};
