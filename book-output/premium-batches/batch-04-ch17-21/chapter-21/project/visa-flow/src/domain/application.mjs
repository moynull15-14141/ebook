import { DomainError } from './errors.mjs';
import { policyFor } from './fees.mjs';

export const COUNTRIES = Object.freeze([
  'Thailand', 'Malaysia', 'Japan', 'Turkey',
]);

// Factory: যাচাই, স্বাভাবিকীকরণ ও হিসাব এক জায়গায়; ফল সব সময় বৈধ ও Frozen।
// ID নেওয়া হয় শুধু সব যাচাই পেরোলে, যাতে ব্যর্থ চেষ্টায় ID নষ্ট না হয়।
export function createApplication(input, { newId, now }) {
  const applicant = String(input.applicant ?? '').trim().replace(/\s+/g, ' ');
  if (applicant.length < 2 || applicant.length > 60) {
    throw new DomainError('INVALID_APPLICANT', 'আবেদনকারীর নাম ২-৬০ অক্ষর');
  }
  if (!COUNTRIES.includes(input.country)) {
    throw new DomainError('INVALID_COUNTRY', `অসমর্থিত দেশ: ${input.country}`);
  }
  const express = input.express === true;
  const policy = policyFor(input.visaType, express);
  const { travelers } = input;
  if (!Number.isInteger(travelers) || travelers < 1
    || travelers > policy.maxTravelers) {
    throw new DomainError('INVALID_TRAVELERS',
      `${policy.label} Visa-য় সর্বোচ্চ ${policy.maxTravelers} জন যাত্রী`);
  }
  return Object.freeze({
    id: newId(),
    applicant,
    country: input.country,
    visaType: input.visaType,
    travelers,
    express,
    fee: policy.fee({ travelers }),
    status: 'draft',
    history: Object.freeze([
      Object.freeze({
        status: 'draft', action: 'create', at: now.toISOString(),
      }),
    ]),
  });
}
