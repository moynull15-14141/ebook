// @ts-check
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// scrypt: ইচ্ছাকৃতভাবে ধীর ও Memory-ভারী, তাই চুরি যাওয়া Hash থেকে
// অনুমান করে Password বের করা ব্যয়বহুল। প্রতিটি ব্যবহারকারীর আলাদা Salt।
const PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LENGTH = 32;

/** @param {string} password */
export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LENGTH, PARAMS);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

/**
 * @param {string} password
 * @param {string} stored
 */
export function verifyPassword(password, stored) {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = scryptSync(password, Buffer.from(salt, 'base64'),
    expected.length, PARAMS);
  // সমান সময়ে তুলনা: কতগুলো Byte মিলল, তা সময় দেখে বোঝা যায় না।
  return timingSafeEqual(actual, expected);
}

// অজানা Email-এও একই পরিমাণ কাজ, যাতে উত্তরের সময় দেখে বোঝা না যায়
// কোন Email নিবন্ধিত।
export const DUMMY_HASH = hashPassword('not-a-real-password-for-timing');
