class NotFoundError extends Error {
  constructor(id) {
    super(`পণ্য পাওয়া যায়নি: ${id}`);
    this.name = 'NotFoundError';
    this.id = id;
  }
}

const products = [{ id: 'P1', name: 'Keyboard' }];

function findProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) {
    throw new NotFoundError(id);
  }
  return product;
}

try {
  console.log(findProduct('P1').name);
  findProduct('P9');
} catch (error) {
  console.log(error instanceof NotFoundError, error.id, error.message);
}
