declare const brand: unique symbol;
type Paisa = number & { readonly [brand]: 'Paisa' };

function toPaisa(value: number): Paisa {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`অবৈধ পরিমাণ: ${value}`);
  }
  return value as Paisa;
}

function addFee(amount: Paisa, fee: Paisa): Paisa {
  return toPaisa(amount + fee);
}

const nights = 3;
console.log(addFee(toPaisa(120_000), toPaisa(5_000)));
console.log(addFee(toPaisa(120_000), nights));
