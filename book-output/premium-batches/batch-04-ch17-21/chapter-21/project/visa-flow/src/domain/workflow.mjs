import { DomainError } from './errors.mjs';

// State Machine: কোন অবস্থায় কোন কাজ চলে, এবং কাজের পর নতুন অবস্থা।
export const WORKFLOW = Object.freeze({
  draft: Object.freeze({ submit: 'submitted', withdraw: 'withdrawn' }),
  submitted: Object.freeze({
    requestDocuments: 'documents-requested',
    approve: 'approved',
    reject: 'rejected',
    withdraw: 'withdrawn',
  }),
  'documents-requested': Object.freeze({
    resubmit: 'submitted',
    withdraw: 'withdrawn',
  }),
  approved: Object.freeze({}),
  rejected: Object.freeze({}),
  withdrawn: Object.freeze({}),
});

// শুধু নিজের Key: "toString"-এর মতো উত্তরাধিকারের নাম কখনো কাজ নয়।
const movesFrom = (status) =>
  (Object.hasOwn(WORKFLOW, status) ? WORKFLOW[status] : {});

export const availableActions = (status) => Object.keys(movesFrom(status));

export const isFinal = (status) => availableActions(status).length === 0;

// নতুন Object ফেরত দেয়; পুরোনোটি অপরিবর্তিত (অধ্যায় ১৮)।
export function applyAction(application, action, now) {
  const moves = movesFrom(application.status);
  if (!Object.hasOwn(moves, action)) {
    throw new DomainError('INVALID_TRANSITION',
      `${application.status} অবস্থায় "${action}" করা যায় না`);
  }
  const status = moves[action];
  const entry = Object.freeze({ status, action, at: now.toISOString() });
  return Object.freeze({
    ...application,
    status,
    history: Object.freeze([...application.history, entry]),
  });
}
