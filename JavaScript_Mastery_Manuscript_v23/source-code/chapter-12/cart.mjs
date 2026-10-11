// Pure domain layer: no DOM or storage dependencies.
export const CATALOG = Object.freeze([
  { id: 'book', name: 'JavaScript Book', price: 850 },
  { id: 'mouse', name: 'Wireless Mouse', price: 1200 },
  { id: 'keyboard', name: 'Mechanical Keyboard', price: 3500 },
]);

export function money(value) { return `৳${value.toFixed(2)}`; }

export function addItem(cart, productId, quantity = 1, catalog = CATALOG) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) throw new RangeError('Quantity must be a positive integer');
  const product = catalog.find(({id}) => id === productId);
  if (!product) throw new Error('Unknown product');
  const existing = cart.find(({id}) => id === productId);
  return existing
    ? cart.map(item => item.id === productId ? {...item, quantity: item.quantity + quantity} : {...item})
    : [...cart.map(item => ({...item})), {id: product.id, quantity}];
}

export function updateQuantity(cart, productId, quantity) {
  if (!Number.isSafeInteger(quantity) || quantity < 0) throw new RangeError('Quantity must be a nonnegative integer');
  if (!cart.some(item => item.id === productId)) return cart.map(item => ({...item}));
  if (quantity === 0) return removeItem(cart, productId);
  return cart.map(item => item.id === productId ? {...item, quantity} : {...item});
}

export function removeItem(cart, productId) { return cart.filter(({id}) => id !== productId).map(item => ({...item})); }

export function summarizeCart(cart, catalog = CATALOG, discountPercent = 0) {
  if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) throw new RangeError('Invalid discount');
  const lines = cart.map(({id, quantity}) => {
    const product = catalog.find(product => product.id === id);
    if (!product || !Number.isSafeInteger(quantity) || quantity < 1) throw new Error('Invalid cart data');
    return {...product, quantity, lineTotal: product.price * quantity};
  });
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const discount = Math.round(subtotal * discountPercent) / 100;
  return {lines, count: lines.reduce((sum, line) => sum + line.quantity, 0), subtotal, discount, total: subtotal - discount};
}

export function restoreCart(raw, catalog = CATALOG) {
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.reduce((cart, item) => {
      if (!item || !catalog.some(product => product.id === item.id) || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) return cart;
      return addItem(cart, item.id, item.quantity, catalog);
    }, []);
  } catch { return []; }
}
