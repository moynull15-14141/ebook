function createCounter(start = 0) {
  let count = start;

  return {
    next: () => ++count,
    reset: () => {
      count = start;
    },
    get value() {
      return count;
    },
  };
}

const tickets = createCounter(100);
const orders = createCounter();

tickets.next();
tickets.next();
orders.next();
console.log(tickets.value, orders.value);

tickets.reset();
console.log(tickets.value, 'count' in tickets);
