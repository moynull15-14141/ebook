import type { Paisa } from './types.js';

// Branded মান তৈরির একমাত্র দরজা: Runtime যাচাই পেরোলে তবেই Paisa।
export function toPaisa(value: number): Paisa {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`অবৈধ পরিমাণ: ${value}`);
  }
  return value as Paisa;
}

export const sum = (values: readonly Paisa[]): Paisa =>
  toPaisa(values.reduce((total, value) => total + value, 0));

export function formatTaka(value: Paisa): string {
  const whole = Math.floor(value / 100).toLocaleString('en-US');
  return `৳${whole}.${String(value % 100).padStart(2, '0')}`;
}
