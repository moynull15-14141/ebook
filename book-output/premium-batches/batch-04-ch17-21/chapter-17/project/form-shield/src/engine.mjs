import { cleanText } from './normalize.mjs';

export const MAX_INPUT = 256;

// Schema: { field: { normalize, rules: [...], optional } }
// ফল: { ok, values, errors }; values-এ শুধু Schema-র ঘর।
export function validate(schema, input) {
  const values = Object.create(null);
  const errors = Object.create(null);

  for (const [field, spec] of Object.entries(schema)) {
    const raw = Object.hasOwn(input ?? {}, field) ? input[field] : '';
    const text = String(raw ?? '');

    if (text.length > MAX_INPUT) {
      errors[field] = `লেখা অনেক বড় (সর্বোচ্চ ${MAX_INPUT} অক্ষর)।`;
      continue;
    }

    const value = (spec.normalize ?? cleanText)(text);
    if (spec.optional && value === '') {
      continue;
    }

    const message = spec.rules.map((rule) => rule(value)).find(Boolean);
    if (message) {
      errors[field] = message;
    } else {
      values[field] = value;
    }
  }

  const ok = Object.keys(errors).length === 0;
  return { ok, values: { ...values }, errors: { ...errors } };
}
