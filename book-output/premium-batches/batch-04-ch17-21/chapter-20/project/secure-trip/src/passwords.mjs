import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 32;

// সংরক্ষণের রূপ "scrypt$<salt>$<hash>"; প্রতিটি Password-এর নিজস্ব Salt।
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password.normalize('NFC'), salt, KEY_LENGTH);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, saltHex, keyHex] = String(stored).split('$');
  const expected = Buffer.from(keyHex ?? '', 'hex');
  if (scheme !== 'scrypt' || !saltHex || expected.length !== KEY_LENGTH) {
    return false;
  }
  const salt = Buffer.from(saltHex, 'hex');
  const actual = await scryptAsync(password.normalize('NFC'), salt, KEY_LENGTH);
  return timingSafeEqual(actual, expected);
}
