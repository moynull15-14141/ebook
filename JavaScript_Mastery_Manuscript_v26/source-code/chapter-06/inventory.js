// Chapter 6: pure inventory domain functions (CommonJS + browser compatible)
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Inventory = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const toCents = value => {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 || Math.round(number * 100) / 100 !== number) throw new Error('Price must be a non-negative amount with at most 2 decimal places');
    return Math.round(number * 100);
  };
  function validateProduct(product) {
    if (!product || typeof product !== 'object') throw new Error('Product is required');
    const id = String(product.id ?? '').trim();
    const name = String(product.name ?? '').trim();
    const category = String(product.category ?? '').trim();
    const stock = Number(product.stock);
    if (!id || !name || !category) throw new Error('ID, name and category are required');
    if (!Number.isSafeInteger(stock) || stock < 0) throw new Error('Stock must be a non-negative integer');
    const priceCents = toCents(product.price);
    return { id, name, category, stock, price: priceCents / 100 };
  }
  function addProduct(items, product) {
    const item = validateProduct(product);
    if (items.some(existing => existing.id === item.id)) throw new Error('Duplicate product ID');
    return [...items, item];
  }
  function updateStock(items, id, change) {
    if (!Number.isSafeInteger(change)) throw new Error('Stock change must be an integer');
    if (!items.some(item => item.id === id)) throw new Error('Product not found');
    return items.map(item => {
      if (item.id !== id) return item;
      const stock = item.stock + change;
      if (!Number.isSafeInteger(stock) || stock < 0) throw new Error('Insufficient stock or invalid quantity');
      return { ...item, stock };
    });
  }
  function removeProduct(items, id) { return items.filter(item => item.id !== id); }
  function filterProducts(items, { query = '', category = 'all', lowStockOnly = false, threshold = 5 } = {}) {
    const term = String(query).trim().toLocaleLowerCase();
    return items.filter(item =>
      (item.name.toLocaleLowerCase().includes(term) || item.id.toLocaleLowerCase().includes(term)) &&
      (category === 'all' || item.category === category) &&
      (!lowStockOnly || item.stock <= threshold)
    );
  }
  function sortProducts(items, by = 'name', direction = 'asc') {
    const allowed = ['name', 'price', 'stock', 'category'];
    if (!allowed.includes(by)) throw new Error('Unsupported sort field');
    const sign = direction === 'desc' ? -1 : 1;
    return [...items].sort((a, b) => {
      const comparison = typeof a[by] === 'number' ? a[by] - b[by] : a[by].localeCompare(b[by]);
      return sign * comparison || a.id.localeCompare(b.id);
    });
  }
  function summarize(items, threshold = 5) {
    return items.reduce((summary, item) => {
      summary.productCount++;
      summary.totalUnits += item.stock;
      summary.totalValueCents += toCents(item.price) * item.stock;
      if (item.stock <= threshold) summary.lowStockCount++;
      return summary;
    }, { productCount: 0, totalUnits: 0, totalValueCents: 0, lowStockCount: 0 });
  }
  function categorySummary(items) {
    return Object.entries(items.reduce((groups, item) => {
      if (!groups[item.category]) groups[item.category] = { units: 0, products: 0 };
      groups[item.category].units += item.stock;
      groups[item.category].products++;
      return groups;
    }, Object.create(null))).map(([category, totals]) => ({ category, ...totals }));
  }
  return { validateProduct, addProduct, updateStock, removeProduct, filterProducts, sortProducts, summarize, categorySummary };
});
