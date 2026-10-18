import type { ClaimId } from './types.js';
import type { ClaimService, ServiceError } from './service.js';
import type { Action } from './workflow.js';
import { assertNever } from './policy.js';

export interface ApiRequest {
  readonly method: string;
  readonly path: string;
  readonly body?: unknown;
}

export interface ApiResponse {
  readonly status: number;
  readonly body: unknown;
}

// প্রতিটি ServiceError-এর HTTP Status; নতুন Error যোগ করলে Compile Error।
function statusOf(error: ServiceError): number {
  switch (error.code) {
    case 'VALIDATION':
    case 'OVER_LIMIT':
      return 422;
    case 'NOT_FOUND':
      return 404;
    case 'INVALID_TRANSITION':
      return 409;
    default:
      return assertNever(error);
  }
}

const ACTIONS: readonly Action[] = ['submit', 'approve', 'reject', 'pay'];
const isAction = (v: string): v is Action => ACTIONS.some((a) => a === v);

// Transport Adapter: HTTP-এর মতো অনুরোধ থেকে Service; আসল Network Server নয়।
export function handle(service: ClaimService, request: ApiRequest): ApiResponse {
  const { method, path, body } = request;
  const action = /^\/claims\/([\w-]+)\/(\w+)$/.exec(path);
  const result = method === 'POST' && path === '/claims'
    ? service.create(body)
    : method === 'POST' && action?.[1] && action[2] && isAction(action[2])
      ? service.act(action[1] as ClaimId, action[2])
      : null;
  if (result === null) {
    return method === 'GET' && path === '/claims'
      ? { status: 200, body: service.list() }
      : { status: 404, body: { error: 'পাওয়া যায়নি' } };
  }
  return result.ok
    ? { status: path === '/claims' ? 201 : 200, body: result.value }
    : { status: statusOf(result.error), body: result.error };
}
