// Event-এ যা যাবে না: গোপন বা ব্যক্তিগত তথ্য। নিষিদ্ধ Key খোঁজা হয় গভীরেও।
const FORBIDDEN = new Set(['password', 'token', 'email', 'phone', 'cardNumber']);

export function unsafeKeys(value, path = 'payload') {
  if (value === null || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, inner]) => [
    ...(FORBIDDEN.has(key) ? [`${path}.${key}`] : []),
    ...unsafeKeys(inner, `${path}.${key}`),
  ]);
}

console.log(unsafeKeys({ status: 'CONFIRMED' }));
console.log(unsafeKeys({ status: 'CONFIRMED',
  customer: { name: 'Rafi', email: 'rafi@example.com' }, token: 'abc' }));
