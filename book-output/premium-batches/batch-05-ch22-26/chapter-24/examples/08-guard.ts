interface Customer {
  name: string;
  phone: string;
}

function isCustomer(value: unknown): value is Customer {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.name === 'string' && typeof record.phone === 'string';
}

for (const text of ['{ "name": "Rafi", "phone": "017" }', '{ "name": 42 }']) {
  const data: unknown = JSON.parse(text);
  console.log(isCustomer(data) ? data.name.toUpperCase() : 'অবৈধ তথ্য');
}
