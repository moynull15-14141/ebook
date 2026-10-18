// Branded Type: Compile-এর সময় সাধারণ number থেকে আলাদা, Runtime-এ number-ই।
declare const brand: unique symbol;
export type Brand<T, Name extends string> = T & { readonly [brand]: Name };

export type Paisa = Brand<number, 'Paisa'>;
export type ClaimId = Brand<string, 'ClaimId'>;

// প্রতিটি খরচের ধরন নিজস্ব Field-সহ: kind দেখে TypeScript বাকিটা জানে।
export type ClaimItem =
  | { kind: 'hotel'; city: string; nights: number; amount: Paisa }
  | { kind: 'transport'; mode: 'bus' | 'train' | 'air'; amount: Paisa }
  | { kind: 'meal'; people: number; amount: Paisa }
  | { kind: 'visa'; country: string; amount: Paisa };

export type ItemKind = ClaimItem['kind'];
export type ClaimStatus =
  'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';

export interface Claim {
  readonly id: ClaimId;
  readonly employee: string;
  readonly items: readonly ClaimItem[];
  readonly status: ClaimStatus;
  readonly total: Paisa;
}

// Utility Type: বিদ্যমান Type থেকে নতুন Type, নকল ছাড়াই।
export type NewClaim = Pick<Claim, 'employee' | 'items'>;
export type ClaimSummary = Omit<Claim, 'items'> & { itemCount: number };
export type StatusCounts = Record<ClaimStatus, number>;

export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const fail = <E>(error: E): Result<never, E> => ({ ok: false, error });
