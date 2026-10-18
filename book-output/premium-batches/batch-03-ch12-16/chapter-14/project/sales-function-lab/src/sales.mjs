import { curry, pipe } from './fp.mjs';

export class SaleError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SaleError';
  }
}

// একটি সারি যাচাই: ঠিক থাকলে অপরিবর্তনীয় নতুন Object, নইলে SaleError।
export function validateSale(row) {
  const { id, category, quantity, unitPrice } = row ?? {};

  if (typeof id !== 'string' || id.trim() === '') {
    throw new SaleError('id নেই');
  }
  if (typeof category !== 'string' || category.trim() === '') {
    throw new SaleError('বিভাগ নেই');
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new SaleError('পরিমাণ 1 বা বেশি পূর্ণসংখ্যা হতে হবে');
  }
  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    throw new SaleError('দাম অঋণাত্মক সংখ্যা হতে হবে');
  }
  return Object.freeze({
    id: id.trim(), category: category.trim(), quantity, unitPrice,
  });
}

export const withTotal = (sale) =>
  Object.freeze({ ...sale, total: sale.quantity * sale.unitPrice });

export const inCategory = curry((category, sale) => sale.category === category);
export const atLeast = curry((minimum, sale) => sale.total >= minimum);
export const sumBy = curry((field, rows) =>
  rows.reduce((sum, row) => sum + row[field], 0));

// বৈধ সারি রাখে; অবৈধগুলোর কারণ আলাদা তালিকায়। ইনপুট বদলায় না।
export function partitionValid(rows) {
  const valid = [];
  const rejected = [];

  for (const [index, row] of rows.entries()) {
    try {
      valid.push(withTotal(validateSale(row)));
    } catch (error) {
      if (!(error instanceof SaleError)) {
        throw error;
      }
      rejected.push(`সারি ${index + 1}: ${error.message}`);
    }
  }
  return { valid, rejected };
}

export function totalsByCategory(sales) {
  return Object.entries(Object.groupBy(sales, (sale) => sale.category))
    .map(([category, rows]) => ({
      category, count: rows.length, revenue: sumBy('total', rows),
    }))
    .toSorted((a, b) =>
      b.revenue - a.revenue || a.category.localeCompare(b.category));
}

const byTotalDesc = (a, b) => b.total - a.total || a.id.localeCompare(b.id);

export const topSales = curry((count, sales) =>
  sales.toSorted(byTotalDesc).slice(0, count));

export const salesReport = pipe(
  partitionValid,
  ({ valid, rejected }) => ({
    revenue: sumBy('total', valid),
    byCategory: totalsByCategory(valid),
    top: topSales(3, valid).map((sale) => sale.id),
    rejected,
  }),
);
