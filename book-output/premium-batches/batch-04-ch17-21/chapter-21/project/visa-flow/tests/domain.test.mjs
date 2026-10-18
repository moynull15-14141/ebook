// Domain-এর Unit Test: Factory, Fee-র Strategy, State Machine।
// চালানোর Command (Project Folder থেকে):  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { createApplication } from '../src/domain/application.mjs';
import { policyFor, withExpress, FEE_POLICIES } from '../src/domain/fees.mjs';
import { applyAction, availableActions, isFinal } from '../src/domain/workflow.mjs';
import { DomainError } from '../src/domain/errors.mjs';

const NOW = new Date('2026-10-15T10:00:00Z');
const make = (input) => createApplication(
  { applicant: 'Rafi Ahmed', country: 'Thailand', visaType: 'tourist',
    travelers: 1, ...input },
  { newId: () => 'VF-001', now: NOW });
const codeOf = (fn) => {
  try {
    fn();
  } catch (error) {
    assert.ok(error instanceof DomainError);
    return error.code;
  }
  return 'NO_ERROR';
};

test('Factory: নাম স্বাভাবিক, অবস্থা draft, ইতিহাসে create, Frozen', () => {
  const application = make({ applicant: '  Rafi    Ahmed ' });
  assert.equal(application.applicant, 'Rafi Ahmed');
  assert.equal(application.status, 'draft');
  assert.deepEqual(application.history,
    [{ status: 'draft', action: 'create', at: '2026-10-15T10:00:00.000Z' }]);
  assert.ok(Object.isFrozen(application) && Object.isFrozen(application.history));
});

test('Fee-র Strategy: প্রতিটি ধরন ও Express', () => {
  assert.equal(make({ travelers: 2 }).fee, 6000);
  assert.equal(make({ visaType: 'business' }).fee, 6500);
  assert.equal(make({ visaType: 'business', express: true }).fee, 9100);
  assert.equal(make({ visaType: 'student' }).fee, 2500);
  assert.equal(make({ express: 'yes' }).fee, 3000);
});

test('withExpress মূল Strategy বদলায় না', () => {
  const express = withExpress(FEE_POLICIES.tourist);
  assert.equal(express.fee({ travelers: 1 }), 4200);
  assert.equal(FEE_POLICIES.tourist.fee({ travelers: 1 }), 3000);
  assert.equal(express.maxTravelers, 6);
  assert.equal(policyFor('tourist'), FEE_POLICIES.tourist);
});

test('Factory: অবৈধ ইনপুটে নির্দিষ্ট code-সহ DomainError', () => {
  assert.equal(codeOf(() => make({ applicant: 'R' })), 'INVALID_APPLICANT');
  assert.equal(codeOf(() => make({ applicant: undefined })), 'INVALID_APPLICANT');
  assert.equal(codeOf(() => make({ country: 'Mars' })), 'INVALID_COUNTRY');
  assert.equal(codeOf(() => make({ visaType: 'toString' })), 'UNKNOWN_TYPE');
  assert.equal(codeOf(() => make({ travelers: 7 })), 'INVALID_TRAVELERS');
  assert.equal(codeOf(() => make({ travelers: '2' })), 'INVALID_TRAVELERS');
  assert.equal(codeOf(() => make({ visaType: 'student', travelers: 2 })),
    'INVALID_TRAVELERS');
});

test('Workflow: সম্পূর্ণ বৈধ পথ এবং ইতিহাস', () => {
  let application = make({});
  for (const action of ['submit', 'requestDocuments', 'resubmit', 'approve']) {
    application = applyAction(application, action, NOW);
  }
  assert.equal(application.status, 'approved');
  assert.deepEqual(application.history.map((h) => h.status),
    ['draft', 'submitted', 'documents-requested', 'submitted', 'approved']);
});

test('Workflow: অবৈধ কাজ ও উত্তরাধিকারের নাম প্রত্যাখ্যাত', () => {
  const draft = make({});
  for (const action of ['approve', 'resubmit', 'toString', '__proto__']) {
    assert.equal(codeOf(() => applyAction(draft, action, NOW)),
      'INVALID_TRANSITION', action);
  }
  const done = applyAction(draft, 'withdraw', NOW);
  assert.equal(codeOf(() => applyAction(done, 'submit', NOW)), 'INVALID_TRANSITION');
});

test('applyAction পুরোনো Object বদলায় না', () => {
  const draft = make({});
  const submitted = applyAction(draft, 'submit', NOW);
  assert.equal(draft.status, 'draft');
  assert.equal(draft.history.length, 1);
  assert.equal(submitted.history.length, 2);
});

test('availableActions ও isFinal', () => {
  assert.deepEqual(availableActions('draft'), ['submit', 'withdraw']);
  assert.deepEqual(availableActions('approved'), []);
  assert.deepEqual(availableActions('constructor'), []);
  assert.equal(isFinal('rejected'), true);
  assert.equal(isFinal('submitted'), false);
});
