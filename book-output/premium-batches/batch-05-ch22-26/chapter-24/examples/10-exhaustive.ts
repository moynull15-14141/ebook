type FareError =
  | { code: 'UNKNOWN_ROUTE'; route: string }
  | { code: 'SOLD_OUT'; date: string }
  | { code: 'PRICE_CHANGED'; newPrice: number };

function assertNever(value: never): never {
  throw new Error(`অপ্রত্যাশিত: ${JSON.stringify(value)}`);
}

function message(error: FareError): string {
  switch (error.code) {
    case 'UNKNOWN_ROUTE':
      return `${error.route} পথ নেই`;
    case 'SOLD_OUT':
      return `${error.date}-এ আসন নেই`;
    default:
      return assertNever(error);
  }
}

console.log(message({ code: 'SOLD_OUT', date: '2026-12-16' }));
