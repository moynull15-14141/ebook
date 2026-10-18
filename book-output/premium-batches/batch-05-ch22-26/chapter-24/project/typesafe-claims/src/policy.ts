import type { ClaimItem, Paisa } from './types.js';
import { toPaisa } from './money.js';

// কোনো case বাদ পড়লে এখানে Compile Error: item তখন never নয়।
export function assertNever(value: never): never {
  throw new Error(`অপ্রত্যাশিত মান: ${JSON.stringify(value)}`);
}

// প্রতিটি খরচের সর্বোচ্চ অনুমোদিত পরিমাণ (কাল্পনিক নীতি)।
export function limitFor(item: ClaimItem): Paisa {
  switch (item.kind) {
    case 'hotel':
      return toPaisa(item.nights * 8_000_00);
    case 'transport':
      return toPaisa(item.mode === 'air' ? 25_000_00 : 3_000_00);
    case 'meal':
      return toPaisa(item.people * 1_000_00);
    case 'visa':
      return toPaisa(15_000_00);
    default:
      return assertNever(item);
  }
}

export function describe(item: ClaimItem): string {
  switch (item.kind) {
    case 'hotel':
      return `${item.city}-এ ${item.nights} রাত হোটেল`;
    case 'transport':
      return `${item.mode} যাতায়াত`;
    case 'meal':
      return `${item.people} জনের খাবার`;
    case 'visa':
      return `${item.country} Visa Fee`;
    default:
      return assertNever(item);
  }
}
