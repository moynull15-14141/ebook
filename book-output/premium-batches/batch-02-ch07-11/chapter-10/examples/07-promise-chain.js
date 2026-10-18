const step = (text) =>
  new Promise((resolve) => setTimeout(() => resolve(text), 50));

step('User')
  .then((user) => step(`${user}-এর Order`))
  .then((orders) => step(`${orders}-এর Invoice`))
  .then((invoice) => console.log(invoice))
  .catch((error) => console.log(`ত্রুটি: ${error.message}`));
