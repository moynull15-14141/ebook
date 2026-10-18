class ServiceError extends Error {}

function saveOrder() {
  throw new ServiceError('স্টক শেষ');
}

try {
  saveOrder();
} catch (error) {
  if (!(error instanceof ServiceError)) {
    throw error;
  }
  console.log(`Order সংরক্ষণ হয়নি: ${error.message}`);
}
