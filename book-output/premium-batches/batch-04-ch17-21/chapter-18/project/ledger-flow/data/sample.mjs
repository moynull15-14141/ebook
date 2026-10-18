export const PRODUCTS = [
  { sku: 'B1', name: 'Notebook', price: 120 },
  { sku: 'B2', name: 'Pen Set', price: 250 },
  { sku: 'B3', name: 'Atlas', price: 900 },
];

export const CUSTOMERS = [
  { id: 'C1', name: 'সারা', region: 'Dhaka' },
  { id: 'C2', name: 'রফিক', region: 'Bogura' },
  { id: 'C3', name: 'মিনা', region: 'Dhaka' },
];

const FILES = {
  '2026-01': [
    {
      id: 'O1', customer: 'C1', date: '2026-01-05',
      items: [{ sku: 'B1', qty: 2 }, { sku: 'B3', qty: 1 }],
    },
    {
      id: 'O2', customer: 'C2', date: '2026-01-09',
      items: [{ sku: 'B2', qty: 3 }],
    },
  ],
  '2026-02': [
    {
      id: 'O3', customer: 'C3', date: '2026-02-11',
      items: [{ sku: 'B3', qty: 1 }, { sku: 'B9', qty: 1 }],
    },
    {
      id: 'O4', customer: 'C1', date: '2026-02-30x',
      items: [{ sku: 'B1', qty: 1 }],
    },
  ],
  '2026-03': [
    {
      id: 'O5', customer: 'C2', date: '2026-03-02',
      items: [{ sku: 'B1', qty: 5 }],
    },
  ],
};

// কৃত্রিম Asynchronous Loader: অজানা মাসে ব্যর্থ।
export async function sampleLoader(name) {
  await new Promise((resolve) => setTimeout(resolve, 10));
  if (!Object.hasOwn(FILES, name)) {
    throw new Error('File নেই');
  }
  return structuredClone(FILES[name]);
}
