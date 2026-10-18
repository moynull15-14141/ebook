import { DomainError } from './errors.mjs';

// Strategy: প্রতিটি Visa-র ধরনের নিজস্ব Fee-র নিয়ম, একই আকারের Object-এ।
const tourist = {
  label: 'Tourist',
  maxTravelers: 6,
  fee: ({ travelers }) => 3000 * travelers,
};

const business = {
  label: 'Business',
  maxTravelers: 3,
  fee: ({ travelers }) => 5500 * travelers + 1000,
};

const student = {
  label: 'Student',
  maxTravelers: 1,
  fee: () => 2500,
};

export const FEE_POLICIES = Object.freeze({ tourist, business, student });

// একটি Strategy-কে মুড়ে আরেকটি: মূল নিয়ম না বদলে Express-এর ৪০% যোগ।
export const withExpress = (policy) => ({
  ...policy,
  fee: (input) => Math.round(policy.fee(input) * 1.4),
});

export function policyFor(visaType, express = false) {
  if (!Object.hasOwn(FEE_POLICIES, visaType)) {
    throw new DomainError('UNKNOWN_TYPE', `অজানা Visa-র ধরন: ${visaType}`);
  }
  const policy = FEE_POLICIES[visaType];
  return express ? withExpress(policy) : policy;
}
