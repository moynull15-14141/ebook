import { validate } from '../../project/form-shield/src/engine.mjs';
import {
  toAsciiDigits, cleanText,
} from '../../project/form-shield/src/normalize.mjs';
import { matches, required } from '../../project/form-shield/src/rules.mjs';

const schema = {
  postcode: {
    normalize: (value) => toAsciiDigits(cleanText(value)),
    rules: [required(), matches(/^\d{4}$/, 'পোস্টকোড 4 অঙ্কের।')],
  },
};

for (const postcode of ['৫৮০০', '5800', '580', 'abcd']) {
  const result = validate(schema, { postcode });
  const shown = result.ok ? result.values.postcode : result.errors.postcode;
  console.log(postcode, shown);
}
