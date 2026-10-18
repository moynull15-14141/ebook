import { validate } from './src/engine.mjs';
import { signupSchema } from './signup-schema.mjs';

const good = validate(signupSchema, {
  name: '  মোঃ  রফিক ',
  username: 'Rafiq_88',
  email: ' Rafiq@Example.COM ',
  phone: '+৮৮০ ১৭১২-৩৪৫৬৭৮',
  birthDate: '2000-02-29',
  password: 'Bogura-River-2026',
  isAdmin: true,
});
console.log(good.ok, good.values.name, good.values.phone, good.values.email);
console.log('isAdmin' in good.values, good.values.password === undefined);

const bad = validate(signupSchema, {
  name: 'R2D2',
  username: 'admin',
  email: 'rafiq@',
  phone: '01212345678',
  birthDate: '2001-02-29',
  password: 'aaa1111',
});
console.log(bad.ok, Object.keys(bad.errors).length);
for (const [field, message] of Object.entries(bad.errors)) {
  console.log(`${field}: ${message}`);
}
console.log(validate(signupSchema, { name: 'x'.repeat(1_000_000) }).errors.name);
