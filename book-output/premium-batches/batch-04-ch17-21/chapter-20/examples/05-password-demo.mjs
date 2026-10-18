import { hashPassword, verifyPassword }
  from '../project/secure-trip/src/passwords.mjs';

const stored = await hashPassword('Bogura-2026');
const [scheme, salt, key] = stored.split('$');
console.log(scheme, `salt ${salt.length / 2} byte`, `key ${key.length / 2} byte`);

console.log(await verifyPassword('Bogura-2026', stored));
console.log(await verifyPassword('bogura-2026', stored));
console.log(stored === await hashPassword('Bogura-2026'));
