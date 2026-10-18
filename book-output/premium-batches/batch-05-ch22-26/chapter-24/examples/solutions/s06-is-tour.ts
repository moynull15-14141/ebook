interface Tour {
  title: string;
  days: number;
}

function isTour(value: unknown): value is Tour {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.title === 'string'
    && Number.isInteger(record.days) && (record.days as number) > 0;
}

const inputs = ['{ "title": "Sajek", "days": 2 }',
  '{ "title": "Sajek", "days": "2" }'];
for (const text of inputs) {
  const data: unknown = JSON.parse(text);
  console.log(isTour(data) ? `${data.title}: ${data.days} দিন` : 'অবৈধ');
}
