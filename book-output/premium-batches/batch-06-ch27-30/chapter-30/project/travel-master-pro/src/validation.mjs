// @ts-check
import { AppError } from './errors.mjs';

/** @param {unknown} value */
const text = (value) => (typeof value === 'string' ? value.trim() : '');

/**
 * Trust Boundary: বাইরে থেকে আসা প্রতিটি মান এখানে যাচাই ও স্বাভাবিক হয়।
 * @param {any} input
 * @returns {{ name: string, email: string, password: string }}
 */
export function validateRegistration(input) {
  const name = text(input?.name);
  const email = text(input?.email).toLowerCase();
  const password = typeof input?.password === 'string' ? input.password : '';
  const details = [];
  if (name.length < 2 || name.length > 60) details.push('name: ২-৬০ অক্ষর');
  // শুধু মৌলিক Format; Email-এর মালিকানা যাচাই আলাদা কাজ (Verification Link)।
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    details.push('email: সঠিক Format');
  }
  if (password.length < 12 || password.length > 128) {
    details.push('password: ১২-১২৮ অক্ষর');
  }
  if (details.length) throw new AppError('VALIDATION', 'Input ঠিক নয়', details);
  return { name, email, password };
}

/**
 * @param {any} input
 * @returns {{ packageId: string, travelers: number, idempotencyKey: string }}
 */
export function validateBooking(input) {
  const packageId = text(input?.packageId);
  const travelers = input?.travelers;
  const idempotencyKey = text(input?.idempotencyKey);
  const details = [];
  if (!/^[A-Z0-9-]{2,20}$/.test(packageId)) details.push('packageId');
  // NaN, Infinity, ভগ্নাংশ, ঋণাত্মক, String: সবই বাদ।
  if (!Number.isInteger(travelers) || travelers < 1 || travelers > 10) {
    details.push('travelers: ১-১০ পূর্ণসংখ্যা');
  }
  if (!/^[\w-]{8,64}$/.test(idempotencyKey)) details.push('idempotencyKey');
  if (details.length) throw new AppError('VALIDATION', 'Input ঠিক নয়', details);
  return { packageId, travelers, idempotencyKey };
}
