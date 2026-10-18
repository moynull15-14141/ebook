import { redact } from '../../project/secure-trip/src/log.mjs';

const maskEmail = (email) => email.replace(/^(.{1,2})[^@]*(@.*)$/u, '$1***$2');

function redactForLog(details) {
  const clean = redact(details);
  return typeof clean.email === 'string'
    ? { ...clean, email: maskEmail(clean.email) }
    : clean;
}

console.log(redactForLog({ email: 'rafi@example.com', password: 'x' }));
console.log(redactForLog({ email: 'a@b.example' }));
