# TypeSafe Claims

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ২৪-এর Project।

একটি ভ্রমণ সংস্থার কর্মীদের খরচ-দাবির (Expense Claim) Service, Strict TypeScript-এ: Branded Type (`Paisa`, `ClaimId`), খরচের Discriminated Union, `unknown` ইনপুটের Type Guard-ভিত্তিক যাচাই, `Result` Type, Exhaustive `switch` (`assertNever`), Generic Repository, Utility Type, এবং একটি HTTP-ধাঁচের Adapter।

> **নোট:** শিক্ষামূলক Demo। নীতির সীমা কাল্পনিক; তথ্য Memory-তে; `api.ts` আসল Network Server নয়। TypeScript Runtime-এ ইনপুট যাচাই করে না—সেই কাজ `src/parse.ts`-এর Runtime Code করে।

## প্রয়োজন

- Node.js 22 বা নতুন।
- Development Dependency: `typescript` ও `@types/node` (`npm install`)। এই বইয়ের QA-তে TypeScript 6.0.2 ও `@types/node` 25.6.0 দিয়ে Compile ও Test করা হয়েছে।

## চালানো

```bash
npm install
npm run typecheck
npm test
npm run demo
```

- `npm run typecheck`: `tsc --noEmit`।
- `npm test`: `tsc` দিয়ে `dist/`-এ Build (এই ধাপে `tests/types.check.ts`-এর Compile-time Test চলে; কোনো `@ts-expect-error` অপ্রয়োজনীয় হলে Build ব্যর্থ), তারপর `node --test "dist/tests/*.test.js"`: ১১টি Runtime Test (`parse` ৪, `service` ৫, `api` ২)।
- `npm run demo`: Build করে `dist/src/demo.js` চালায়।

`dist/` Build-এর ফল; Companion Code-এ রাখার প্রয়োজন নেই।

## File

| File | কাজ |
| --- | --- |
| `src/types.ts` | `Brand`, `Paisa`, `ClaimId`, `ClaimItem`, `Claim`, Utility Type, `Result`, `ok`, `fail` |
| `src/money.ts` | `toPaisa` (Runtime যাচাই), `sum`, `formatTaka` |
| `src/policy.ts` | `assertNever`, `limitFor`, `describe` |
| `src/parse.ts` | `parseNewClaim(unknown)`: Type Guard ও পথসহ ভুলের তালিকা |
| `src/workflow.ts` | `nextStatus`, `statusLabel` |
| `src/repository.ts` | `Repository<T, K>`, `MemoryRepository<T, K>` |
| `src/service.ts` | `createClaimService`, `ServiceError` |
| `src/api.ts` | `handle`: HTTP Status-এ রূপান্তর |
| `src/demo.ts` | উদাহরণ চালানো |
| `tests/types.check.ts` | Compile-time Test |
| `tests/*.test.ts` | Runtime Test |

## Error ও HTTP Status

| ServiceError | Status |
| --- | --- |
| তৈরি সফল | 201 |
| কাজ সফল | 200 |
| `VALIDATION`, `OVER_LIMIT` | 422 |
| `NOT_FOUND` | 404 |
| `INVALID_TRANSITION` | 409 |
