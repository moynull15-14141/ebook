export const pipe = (...functions) => input => functions.reduce((value, fn) => fn(value), input);

export function validateSale(sale) {
  if (!sale || typeof sale !== 'object') throw new TypeError('Sale must be an object');
  if (typeof sale.id !== 'string' || !sale.id.trim()) throw new TypeError('Valid id required');
  if (typeof sale.category !== 'string' || !sale.category.trim()) throw new TypeError('Valid category required');
  if (!Number.isInteger(sale.quantity) || sale.quantity <= 0) throw new RangeError('Quantity must be a positive integer');
  if (!Number.isFinite(sale.unitPrice) || sale.unitPrice < 0) throw new RangeError('Unit price must be non-negative');
  return { id: sale.id.trim(), category: sale.category.trim(), quantity: sale.quantity, unitPrice: sale.unitPrice };
}
export const normalizeSales = sales => {
  if (!Array.isArray(sales)) throw new TypeError('Expected sales array');
  const result = sales.map(validateSale);
  if (new Set(result.map(s => s.id)).size !== result.length) throw new Error('Duplicate sale ID');
  return result;
};
export const withTotals = sales => sales.map(s => ({ ...s, total: s.quantity * s.unitPrice }));
export const filterCategory = category => sales => category === 'All' ? sales : sales.filter(s => s.category === category);
export const summarize = sales => sales.reduce((acc, s) => {
  acc.revenue += s.total;
  acc.units += s.quantity;
  acc.byCategory[s.category] = (acc.byCategory[s.category] ?? 0) + s.total;
  return acc;
}, { revenue: 0, units: 0, byCategory: {} });
export const analyzeSales = (sales, category = 'All') => {
  const rows = pipe(normalizeSales, withTotals, filterCategory(category))(sales);
  return { rows, ...summarize(rows) };
};
