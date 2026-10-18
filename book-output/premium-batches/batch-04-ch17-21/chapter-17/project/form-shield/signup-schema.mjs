import { normalizeEmail, normalizePhone, cleanText } from './src/normalize.mjs';
import { PATTERNS } from './src/patterns.mjs';
import {
  length, matches, notIn, passwordPolicy, realDate, required,
} from './src/rules.mjs';

export const signupSchema = {
  name: {
    rules: [required(), length(2, 60), matches(PATTERNS.PERSON_NAME, 'নামে শুধু অক্ষর দিন।')],
  },
  username: {
    normalize: (value) => cleanText(value).toLowerCase(),
    rules: [
      required(),
      matches(PATTERNS.USERNAME, '3-20 অক্ষর: ইংরেজি ছোট হাতের অক্ষর, অঙ্ক বা _'),
      notIn(['admin', 'root', 'support'], 'এই নাম সংরক্ষিত।'),
    ],
  },
  email: { normalize: normalizeEmail, rules: [required(), matches(PATTERNS.EMAIL, 'সঠিক Email লিখুন।')] },
  phone: {
    normalize: normalizePhone,
    rules: [required(), matches(PATTERNS.BD_MOBILE, 'সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন।')],
  },
  birthDate: { optional: true, rules: [realDate] },
  password: {
    normalize: (value) => value,
    rules: [required(), ...passwordPolicy],
  },
};
