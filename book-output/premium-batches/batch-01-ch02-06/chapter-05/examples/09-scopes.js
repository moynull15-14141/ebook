const shopName = 'Boi Ghar';

function printReceipt() {
  const total = 500;

  if (total > 100) {
    const note = 'বড় কেনাকাটা';
    console.log(shopName, total, note);
  }

  console.log(typeof note);
}

printReceipt();
console.log(typeof total);
