import test from 'node:test';
import assert from 'node:assert/strict';

const isValidAge = (age) => Number.isInteger(age) && age >= 18 && age <= 60;

const rows = [[17, false], [18, true], [19, true], [30, true],
  [59, true], [60, true], [61, false], [18.5, false], ['30', false]];

for (const [age, expected] of rows) {
  test(`বয়স ${JSON.stringify(age)}: ${expected}`, () => {
    assert.equal(isValidAge(age), expected);
  });
}
