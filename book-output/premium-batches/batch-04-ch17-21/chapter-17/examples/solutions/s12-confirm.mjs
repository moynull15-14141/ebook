import { validate } from '../../project/form-shield/src/engine.mjs';
import { required } from '../../project/form-shield/src/rules.mjs';

// ঘরের নিয়ম একটি মান দেখে; দুটি ঘরের তুলনা Engine-এর পরে, Form-স্তরের নিয়মে।
function validateWithChecks(schema, input, checks) {
  const result = validate(schema, input);
  const errors = { ...result.errors };
  for (const check of checks) {
    const problem = check(result.values);
    if (problem && !errors[problem.field]) {
      errors[problem.field] = problem.message;
    }
  }
  return { ok: Object.keys(errors).length === 0, values: result.values, errors };
}

const schema = {
  password: { normalize: (v) => v, rules: [required()] },
  confirmPassword: { normalize: (v) => v, rules: [required()] },
};
const samePassword = (values) =>
  (values.password !== values.confirmPassword
    ? { field: 'confirmPassword', message: 'দুটি Password মেলেনি।' }
    : null);

const input = {
  password: 'Bogura-River-2026',
  confirmPassword: 'Bogura-river-2026',
};
console.log(validateWithChecks(schema, input, [samePassword]).errors);
