const ISO_DATE = /^(?<y>\d{4})-(?<m>\d{2})-(?<d>\d{2})$/;

function parseDate(text) {
  const match = ISO_DATE.exec(text);
  if (!match) {
    return null;
  }
  const [y, m, d] = [match.groups.y, match.groups.m, match.groups.d].map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const real = date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
  return real ? date.toISOString().slice(0, 10) : null;
}

const inputs = ['2026-10-15', '2026-02-30', '15/10/2026', '2024-02-29',
  '2026-02-29'];
console.log(inputs.map((text) => String(parseDate(text))).join(' '));
