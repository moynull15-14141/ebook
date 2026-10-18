import type { ClaimItem, NewClaim, Result } from './types.js';
import { ok, fail } from './types.js';
import { toPaisa } from './money.js';

export interface Issue {
  readonly path: string;
  readonly message: string;
}

// Type Guard: Runtime যাচাই, এবং সফল হলে TypeScript-কে Type জানায়।
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= 60;
const isCount = (v: unknown, max: number): v is number =>
  Number.isInteger(v) && (v as number) >= 1 && (v as number) <= max;
const isAmount = (v: unknown): v is number =>
  Number.isSafeInteger(v) && (v as number) > 0;
const MODES = ['bus', 'train', 'air'] as const;
const isMode = (v: unknown): v is (typeof MODES)[number] =>
  MODES.some((mode) => mode === v);

function parseItem(raw: unknown, at: string, issues: Issue[]): ClaimItem | null {
  const report = (field: string, message: string): null => {
    issues.push({ path: field ? `${at}.${field}` : at, message });
    return null;
  };
  if (!isRecord(raw)) {
    return report('', 'একটি Object প্রয়োজন');
  }
  const { kind, amount } = raw;
  if (!isAmount(amount)) {
    return report('amount', 'পয়সায় ধনাত্মক পূর্ণসংখ্যা');
  }
  const paisa = toPaisa(amount);
  switch (kind) {
    case 'hotel': {
      const { city, nights } = raw;
      if (!isText(city)) {
        return report('city', 'শহরের নাম প্রয়োজন');
      }
      return isCount(nights, 30)
        ? { kind, city: city.trim(), nights, amount: paisa }
        : report('nights', '১ থেকে ৩০ রাত');
    }
    case 'transport':
      return isMode(raw.mode)
        ? { kind, mode: raw.mode, amount: paisa }
        : report('mode', 'bus, train অথবা air');
    case 'meal':
      return isCount(raw.people, 20)
        ? { kind, people: raw.people, amount: paisa }
        : report('people', '১ থেকে ২০ জন');
    case 'visa':
      return isText(raw.country)
        ? { kind, country: raw.country.trim(), amount: paisa }
        : report('country', 'দেশের নাম প্রয়োজন');
    default:
      return report('kind', 'অজানা খরচের ধরন');
  }
}

// API-র সীমানা: যা আসে তা unknown; যাচাই পেরোলে তবেই NewClaim।
export function parseNewClaim(input: unknown): Result<NewClaim, Issue[]> {
  const issues: Issue[] = [];
  if (!isRecord(input)) {
    return fail([{ path: '', message: 'একটি JSON Object প্রয়োজন' }]);
  }
  const { employee, items } = input;
  if (!isText(employee)) {
    issues.push({ path: 'employee', message: 'কর্মীর নাম প্রয়োজন' });
  }
  if (!Array.isArray(items) || items.length < 1 || items.length > 20) {
    issues.push({ path: 'items', message: '১ থেকে ২০টি খরচ' });
  }
  const parsed = Array.isArray(items)
    ? items.map((raw, i) => parseItem(raw, `items[${i}]`, issues))
    : [];
  if (issues.length > 0 || !isText(employee)) {
    return fail(issues);
  }
  const valid = parsed.filter((item) => item !== null);
  return ok({ employee: employee.trim(), items: valid });
}
