function step(name, callback) {
  setTimeout(() => callback(null, name), 50);
}

step('User', (error1, user) => {
  step(`${user}-এর Order`, (error2, orders) => {
    step(`${orders}-এর Invoice`, (error3, invoice) => {
      console.log(invoice);
    });
  });
});
