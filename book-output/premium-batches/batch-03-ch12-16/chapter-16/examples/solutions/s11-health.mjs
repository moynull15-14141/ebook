const check = (name, ok) => (ok
  ? Promise.resolve(`${name} সুস্থ`)
  : Promise.reject(new Error(`${name} সাড়া দিচ্ছে না`)));

const results = await Promise.allSettled([
  check('Database', true),
  check('Payment', false),
  check('Email', true),
]);

const healthy = results.filter((result) => result.status === 'fulfilled');
console.log(`${healthy.length}/${results.length} সুস্থ`);

for (const result of results.filter((item) => item.status === 'rejected')) {
  console.log(`সমস্যা: ${result.reason.message}`);
}
