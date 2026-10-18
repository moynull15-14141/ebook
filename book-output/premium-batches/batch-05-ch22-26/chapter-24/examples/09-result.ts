type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

type FareError =
  | { code: 'UNKNOWN_ROUTE'; route: string }
  | { code: 'SOLD_OUT'; date: string };

function quoteFare(route: string): Result<number, FareError> {
  if (route === 'DAC-CXB') {
    return { ok: true, value: 4_500 };
  }
  return { ok: false, error: { code: 'UNKNOWN_ROUTE', route } };
}

function message(error: FareError): string {
  switch (error.code) {
    case 'UNKNOWN_ROUTE':
      return `${error.route} পথ নেই`;
    case 'SOLD_OUT':
      return `${error.date}-এ আসন নেই`;
  }
}

for (const route of ['DAC-CXB', 'DAC-XYZ']) {
  const result = quoteFare(route);
  console.log(result.ok ? `৳${result.value}` : message(result.error));
}
