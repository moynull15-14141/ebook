function printLines(items) {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (item.quantity <= 0) {
      console.log(`${i + 1}. ${item.name}: (বাদ)`);
      continue;
    }

    console.log(`${i + 1}. ${item.name}: ${item.price * item.quantity}`);
  }
}

printLines([
  { name: 'Pen', price: 15, quantity: 10 },
  { name: 'Calculator', price: 650, quantity: 0 },
]);
