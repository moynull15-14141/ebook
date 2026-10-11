function ticketPrice(age, isMember) {
  let price = 100;

  if (age < 5) {
    price = 0;
  } else if (age <= 12) {
    price = 50;
  }

  return isMember ? price / 2 : price;
}

console.log(ticketPrice(4, false));
console.log(ticketPrice(12, false));
console.log(ticketPrice(30, true));
