import type {
  Claim, ClaimId, ClaimSummary, Paisa, Result, StatusCounts,
} from './types.js';
import { ok, fail } from './types.js';
import { sum } from './money.js';
import { limitFor } from './policy.js';
import { parseNewClaim, type Issue } from './parse.js';
import { nextStatus, type Action } from './workflow.js';
import type { Repository } from './repository.js';

// প্রতিটি সম্ভাব্য ব্যর্থতা একটি Type; ডাকা Code সবগুলো সামলাতে বাধ্য।
export type ServiceError =
  | { readonly code: 'VALIDATION'; readonly issues: readonly Issue[] }
  | { readonly code: 'OVER_LIMIT'; readonly index: number; readonly limit: Paisa }
  | { readonly code: 'NOT_FOUND'; readonly id: string }
  | { readonly code: 'INVALID_TRANSITION'; readonly from: Claim['status'];
      readonly action: Action };

export function createClaimService(
  repository: Repository<Claim, ClaimId>,
  newId: () => ClaimId,
) {
  function create(input: unknown): Result<Claim, ServiceError> {
    const parsed = parseNewClaim(input);
    if (!parsed.ok) {
      return fail({ code: 'VALIDATION', issues: parsed.error });
    }
    const { employee, items } = parsed.value;
    for (const [index, item] of items.entries()) {
      const limit = limitFor(item);
      if (item.amount > limit) {
        return fail({ code: 'OVER_LIMIT', index, limit });
      }
    }
    const total = sum(items.map((item) => item.amount));
    const claim: Claim = { id: newId(), employee, items, status: 'draft', total };
    repository.save(claim);
    return ok(claim);
  }

  function act(id: ClaimId, action: Action): Result<Claim, ServiceError> {
    const claim = repository.get(id);
    if (!claim) {
      return fail({ code: 'NOT_FOUND', id });
    }
    const status = nextStatus(claim.status, action);
    if (!status) {
      return fail({ code: 'INVALID_TRANSITION', from: claim.status, action });
    }
    const updated: Claim = { ...claim, status };
    repository.save(updated);
    return ok(updated);
  }

  function summary(): StatusCounts {
    const counts: StatusCounts = {
      draft: 0, submitted: 0, approved: 0, rejected: 0, paid: 0,
    };
    for (const claim of repository.list()) {
      counts[claim.status] += 1;
    }
    return counts;
  }

  const list = (): ClaimSummary[] => repository.list()
    .map(({ items, ...rest }) => ({ ...rest, itemCount: items.length }));

  return { create, act, summary, list };
}

export type ClaimService = ReturnType<typeof createClaimService>;
