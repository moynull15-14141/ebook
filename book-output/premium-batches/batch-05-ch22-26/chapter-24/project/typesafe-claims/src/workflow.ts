import type { ClaimStatus } from './types.js';
import { assertNever } from './policy.js';

export type Action = 'submit' | 'approve' | 'reject' | 'pay';

// Record<ClaimStatus, ...>: একটি নতুন Status যোগ করলে এখানে না লিখলে Compile Error।
const MOVES: Record<ClaimStatus, Partial<Record<Action, ClaimStatus>>> = {
  draft: { submit: 'submitted' },
  submitted: { approve: 'approved', reject: 'rejected' },
  approved: { pay: 'paid' },
  rejected: {},
  paid: {},
};

export function nextStatus(
  from: ClaimStatus, action: Action,
): ClaimStatus | null {
  return MOVES[from][action] ?? null;
}

export function statusLabel(status: ClaimStatus): string {
  switch (status) {
    case 'draft':
      return 'খসড়া';
    case 'submitted':
      return 'জমা দেওয়া';
    case 'approved':
      return 'অনুমোদিত';
    case 'rejected':
      return 'প্রত্যাখ্যাত';
    case 'paid':
      return 'পরিশোধিত';
    default:
      return assertNever(status);
  }
}
