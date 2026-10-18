const date = /^(\d{4})-(\d{2})-(\d{2})$/.exec('2026-10-15');
console.log(date[0], date[1], date[3]);

const named = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/.exec('2026-10-15');
const { year, month, day } = named.groups;
console.log(`${day}/${month}/${year}`);

console.log('ha-ha-ha!'.match(/(?:ha-?)+/)[0]);
console.log(/^(\w)\w*\1$/.test('level'), /^(\w)\w*\1$/.test('lever'));

console.log(/^cat|dog$/.test('catalog'), /^(?:cat|dog)$/.test('catalog'));
