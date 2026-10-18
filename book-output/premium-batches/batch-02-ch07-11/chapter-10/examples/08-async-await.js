const step = (text) =>
  new Promise((resolve) => setTimeout(() => resolve(text), 50));

async function buildInvoice() {
  const user = await step('User');
  const orders = await step(`${user}-এর Order`);
  return step(`${orders}-এর Invoice`);
}

async function main() {
  try {
    const invoice = await buildInvoice();
    console.log(invoice);
  } catch (error) {
    console.log(`ত্রুটি: ${error.message}`);
  }
}

main();
console.log('main() ডাকা হলো; ফল পরে আসবে');
